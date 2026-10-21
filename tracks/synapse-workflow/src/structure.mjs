// REA is pinned to 6.4.0; reuse its existing syntax parser, never evaluate captured code.
import { parseJavaScriptSource } from '../node_modules/rea-agents/dist/domain/javascript/javascriptSourceParser.js';
import { createHash } from 'node:crypto';
import { readWithin } from './evidence-files.mjs';
import { safeUrl } from './capture.mjs';

const fnTypes = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression', 'ObjectMethod', 'ClassMethod', 'ClassPrivateMethod']);
const branchTypes = new Set(['IfStatement', 'ConditionalExpression', 'SwitchCase', 'LogicalExpression']);
const literal = node => node?.type === 'StringLiteral' ? node.value : node?.type === 'TemplateLiteral' && !node.expressions.length ? node.quasis[0]?.value?.cooked : null;
const memberName = node => node?.type === 'Identifier' ? node.name : node?.type === 'ThisExpression' ? 'this' :
  ['MemberExpression', 'OptionalMemberExpression'].includes(node?.type) ? `${memberName(node.object) || '?'}.${node.computed ? literal(node.property) || '?' : node.property?.name || '?'}` : null;
const location = node => ({ line: node.loc?.start.line, column: node.loc?.start.column, endLine: node.loc?.end.line });
const secretText = /authorization|cookie|token|password|passwd|secret|api[-_]?key|session|credential/i;
function safeReference(value, base) {
  if (value === null || value === undefined) return null;
  try { return safeUrl(new URL(value, base).href); }
  catch { return secretText.test(value) ? '[REDACTED]' : String(value).slice(0, 300); }
}

export function inspectSource(source, { id = 'script', url = 'https://unknown.invalid/', maxNodes = 100000,
  maxFunctions = 200, maxCalls = 500, maxFindings = 500 } = {}) {
  const ast = parseJavaScriptSource(source, url);
  const result = { id, urls: [safeUrl(url)], bytes: Buffer.byteLength(source),
    sha256: createHash('sha256').update(source).digest('hex'), status: ast ? 'parsed' : 'unparseable',
    functions: [], calls: [], branches: [], imports: [], events: [], effects: [], endpoints: [],
    counts: { nodes: 0, functions: 0, calls: 0, branches: 0 }, truncated: false,
    parseErrors: ast?.errors?.length || 0 };
  if (!ast) return result;
  if (result.parseErrors) result.status = 'partial';
  const bindings = new Map(), mutatedNames = new Set(), parents = new Map([['top', null]]), stack = [{ node: ast, owner: 'top', parent: null }];
  const add = (group, value, limit = maxFindings) => {
    if (result[group].length >= limit) { result.truncated = true; return; }
    result[group].push(value);
  };
  const bind = (scope, name, target) => {
    if (!name) return;
    const key = `${scope}:${name}`;
    bindings.set(key, [...(bindings.get(key) || []), target]);
  };
  while (stack.length && result.counts.nodes < maxNodes) {
    const { node, owner, parent } = stack.pop();
    if (!node || typeof node.type !== 'string') continue;
    result.counts.nodes++;
    let childOwner = owner;
    if (fnTypes.has(node.type)) {
      result.counts.functions++;
      const functionId = `${id}:fn:${node.start}`;
      const name = node.id?.name || (parent?.type === 'VariableDeclarator' ? parent.id?.name :
        parent?.type === 'ObjectProperty' ? parent.key?.name || literal(parent.key) : node.key?.name || literal(node.key)) || `(anonymous@${node.loc?.start.line}:${node.loc?.start.column})`;
      add('functions', { id: functionId, name, parent: owner, async: !!node.async, generator: !!node.generator,
        parameters: node.params?.map(p => p.type === 'Identifier' ? p.name : '[pattern]') || [],
        start: node.start, end: node.end, ...location(node) }, maxFunctions);
      if (node.type === 'FunctionDeclaration') bind(owner, name, functionId);
      if (parent?.type === 'VariableDeclarator') bind(owner, parent.id?.name, functionId);
      if (node.id?.name) bind(functionId, node.id.name, functionId);
      for (const p of node.params || []) if (p.type === 'Identifier') bind(functionId, p.name, null);
      parents.set(functionId, owner); childOwner = functionId;
    }
    if (node.type === 'VariableDeclarator' && node.id?.type === 'Identifier' && !fnTypes.has(node.init?.type)) bind(owner, node.id.name, null);
    if (node.type === 'AssignmentExpression' && node.left?.type === 'Identifier') mutatedNames.add(node.left.name);
    if (node.type === 'UpdateExpression' && node.argument?.type === 'Identifier') mutatedNames.add(node.argument.name);
    if (branchTypes.has(node.type)) {
      result.counts.branches++;
      add('branches', { type: node.type, operator: node.operator, functionId: owner, start: node.start, end: node.end, ...location(node) });
    }
    if (['ImportDeclaration', 'ExportAllDeclaration', 'ExportNamedDeclaration', 'ImportExpression'].includes(node.type) && node.source) {
      const specifier = literal(node.source);
      const bare = specifier !== null && !/^(?:\.|\/|[a-z]+:)/i.test(specifier);
      add('imports', { kind: node.type === 'ImportExpression' ? 'dynamic' : 'static',
        target: bare ? `package:${secretText.test(specifier) ? '[REDACTED]' : specifier}` : safeReference(specifier, url),
        dynamic: specifier === null, functionId: owner, ...location(node) });
    }
    if (['CallExpression', 'OptionalCallExpression', 'NewExpression'].includes(node.type)) {
      const callee = memberName(node.callee); result.counts.calls++;
      const call = { callee: callee || '[dynamic]', directName: node.callee?.type === 'Identifier' ? node.callee.name : null,
        functionId: owner, ...location(node) };
      add('calls', call, maxCalls);
      if (callee === 'fetch' || /^(?:window\.)?fetch$|(?:axios|http|client)\.(?:get|post|put|patch|delete|request)$/.test(callee || '') || callee?.endsWith('.open')) {
        const arg = callee?.endsWith('.open') ? node.arguments[1] : node.arguments[0];
        add('endpoints', { kind: callee, target: safeReference(literal(arg), url), dynamic: literal(arg) === null,
          functionId: owner, ...location(node) });
      }
      if (callee?.endsWith('.addEventListener')) {
        const event = literal(node.arguments[0]), callback = node.arguments[1];
        add('events', { event: event && !secretText.test(event) ? event : '[dynamic-or-redacted]',
          callback: callback?.type === 'Identifier' ? callback.name : fnTypes.has(callback?.type) ? `${id}:fn:${callback.start}` : '[dynamic]', functionId: owner, ...location(node) });
      }
      if (/(?:localStorage|sessionStorage|indexedDB|caches)\./.test(callee || '')) add('effects', { kind: 'storage', operation: callee, functionId: owner, ...location(node) });
      if (/(?:querySelector|querySelectorAll|getElementById|createElement|appendChild|replaceChildren|setAttribute)$/.test(callee || '')) add('effects', { kind: 'dom', operation: callee, functionId: owner, ...location(node) });
      if (callee === 'eval' || (node.type === 'NewExpression' && callee === 'Function')) add('effects', { kind: 'dynamic-code', operation: callee, functionId: owner, ...location(node) });
    }
    if (node.type === 'AssignmentExpression' && ['MemberExpression', 'OptionalMemberExpression'].includes(node.left?.type)) {
      const target = memberName(node.left);
      if (/\.on[a-z]+$/i.test(target || '')) add('events', { event: target.split('.').at(-1).slice(2),
        callback: node.right?.type === 'Identifier' ? node.right.name : fnTypes.has(node.right?.type) ? `${id}:fn:${node.right.start}` : '[dynamic]', functionId: owner, ...location(node) });
      if (/\.(?:textContent|innerHTML|className|value|checked|disabled|src|href)$/.test(target || '')) add('effects', { kind: 'dom-write', operation: target, functionId: owner, ...location(node) });
    }
    for (const [key, value] of Object.entries(node)) {
      if (['loc', 'tokens', 'comments', 'errors', 'extra'].includes(key)) continue;
      if (Array.isArray(value)) {
        for (let i = value.length - 1; i >= 0; i--) if (value[i]?.type) stack.push({ node: value[i], owner: childOwner, parent: node });
      } else if (value?.type) stack.push({ node: value, owner: childOwner, parent: node });
    }
  }
  if (stack.length) result.truncated = true;
  for (const call of result.calls) {
    if (!call.directName) continue;
    if (mutatedNames.has(call.directName)) { delete call.directName; continue; }
    let scope = call.functionId;
    while (scope !== null && scope !== undefined) {
      const candidates = bindings.get(`${scope}:${call.directName}`);
      if (candidates) {
        if (candidates.length === 1 && candidates[0]) call.targetFunctionId = candidates[0];
        break;
      }
      scope = parents.get(scope);
    }
    delete call.directName;
  }
  for (const event of result.events) {
    if (event.callback?.startsWith(`${id}:fn:`)) { event.targetFunctionId = event.callback; continue; }
    if (mutatedNames.has(event.callback)) continue;
    let scope = event.functionId;
    while (scope !== null && scope !== undefined) {
      const candidates = bindings.get(`${scope}:${event.callback}`);
      if (candidates) { if (candidates.length === 1 && candidates[0]) event.targetFunctionId = candidates[0]; break; }
      scope = parents.get(scope);
    }
  }
  result.workflows = [];
  for (const event of result.events.slice(0, 50)) {
    const seen = new Set(), queue = event.targetFunctionId ? [event.targetFunctionId] : [];
    while (queue.length && seen.size < 30) {
      const f = queue.shift(); if (seen.has(f)) continue; seen.add(f);
      for (const call of result.calls) if (call.functionId === f && call.targetFunctionId && !seen.has(call.targetFunctionId)) queue.push(call.targetFunctionId);
    }
    result.workflows.push({ event: event.event, line: event.line, callback: event.callback,
      resolved: !!event.targetFunctionId, functions: result.functions.filter(f => seen.has(f.id)).map(f => ({ id: f.id, name: f.name, line: f.line })),
      endpoints: result.endpoints.filter(e => seen.has(e.functionId)), effects: result.effects.filter(e => seen.has(e.functionId)).slice(0, 50),
      basis: 'static event callback and direct lexical calls; runtime execution not implied' });
  }
  return result;
}

export async function buildStructure(networkDir, evidence, { maxScripts = 300, maxSourceBytes = 2 * 1024 * 1024,
  maxTotalSourceBytes = 20 * 1024 * 1024 } = {}) {
  for (const [value, limit] of [[maxScripts, 1000], [maxSourceBytes, 20 * 1024 * 1024], [maxTotalSourceBytes, 100 * 1024 * 1024]]) {
    if (!Number.isSafeInteger(value) || value < 1 || value > limit) throw new Error('Invalid structure budget');
  }
  const result = { schemaVersion: 1, kind: 'static-structure-with-runtime-links', scripts: [], runtimeLinks: [],
    coverage: { scriptRecords: evidence.scripts?.length || 0, uniqueSources: 0, analyzedBytes: 0, omittedSources: 0, unavailableSources: 0 },
    limitations: ['Captured JavaScript is parsed as data and never evaluated.',
      'Function/call/branch maps describe static possibilities; they do not prove branch execution.',
      'Only direct identifier calls with an unambiguous lexical binding are linked to functions.',
      'Dynamic imports, computed endpoints, runtime-generated code, workers and server logic can remain unresolved.'] };
  const sources = new Map();
  for (const s of evidence.scripts || []) if (s.file) {
    const key = s.sha256 || s.file;
    if (!sources.has(key)) sources.set(key, { ...s, urls: new Set() });
    sources.get(key).urls.add(s.url);
  }
  result.coverage.uniqueSources = sources.size;
  for (const record of sources.values()) {
    if (result.scripts.length >= maxScripts) { result.coverage.omittedSources++; continue; }
    try {
      const bytes = await readWithin(networkDir, record.file, maxSourceBytes);
      if (result.coverage.analyzedBytes + bytes.length > maxTotalSourceBytes) { result.coverage.omittedSources++; continue; }
      const source = bytes.toString('utf8'), item = inspectSource(source, { id: `script-${result.scripts.length + 1}`, url: record.url });
      item.urls = [...record.urls].map(value => safeUrl(value)); item.sourceFile = record.file;
      result.scripts.push(item); result.coverage.analyzedBytes += bytes.length;
      const precise = (evidence.coverage || []).filter(c => record.urls.has(c.url) &&
        evidence.scripts?.some(s => s.scriptId === c.scriptId && (!s.sha256 || s.sha256 === item.sha256))).flatMap(c => c.functions || []);
      item.execution = { status: precise.length ? 'observed' : 'not-recorded', recordedFunctions: precise.length,
        executedFunctions: precise.filter(f => f.ranges?.[0]?.count > 0).length };
      for (const f of item.functions) {
        const match = precise.filter(c => c.ranges?.[0]?.endOffset === f.end && Math.abs(c.ranges[0].startOffset - f.start) <= 16)
          .sort((a, b) => Math.abs(a.ranges[0].startOffset - f.start) - Math.abs(b.ranges[0].startOffset - f.start))[0];
        if (match) f.execution = { count: match.ranges[0].count, coveredRanges: match.ranges.filter(r => r.count > 0).length,
          totalRanges: match.ranges.length, basis: 'V8 precise coverage range matched to captured source offsets' };
      }
      // Map CDP zero-based line/column positions back to the smallest containing static function.
      const lineOffsets = [0]; for (let i = 0; i < source.length; i++) if (source[i] === '\n') lineOffsets.push(i + 1);
      for (const request of evidence.requests || []) for (const frame of request.initiator?.frames || []) {
        if (!record.urls.has(frame.url)) continue;
        const offset = (lineOffsets[frame.lineNumber] ?? -1) + (frame.columnNumber || 0);
        const fn = item.functions.filter(f => f.start <= offset && f.end > offset).sort((a, b) => (a.end - a.start) - (b.end - b.start))[0];
        if (result.runtimeLinks.length >= 10000) break;
        result.runtimeLinks.push({ scriptId: item.id, functionId: fn?.id || null, requestId: request.requestId,
          hop: request.hop, observedUrl: safeUrl(request.request.url), method: request.request.method,
          status: request.response?.status, line: frame.lineNumber + 1, column: frame.columnNumber,
          basis: fn ? 'observed initiator position inside captured function range' : 'observed script initiator; function unresolved' });
      }
    } catch { result.coverage.unavailableSources++; }
  }
  return result;
}
