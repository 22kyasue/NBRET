import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { requestBounded } from './http.mjs';
import { createScope } from './scope.mjs';
import { readWithin, readJsonWithin, optionalJson } from './evidence-files.mjs';
import { safeUrl } from './capture.mjs';
import { parseJavaScriptSource } from '../node_modules/rea-agents/dist/domain/javascript/javascriptSourceParser.js';

const hash = text => createHash('sha256').update(text).digest('hex');
const fnTypes = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression', 'ObjectMethod', 'ClassMethod']);
const literal = n => n?.type === 'StringLiteral' ? n.value : null;
const name = n => n?.type === 'Identifier' ? n.name : n?.type === 'ThisExpression' ? 'this' :
  ['MemberExpression', 'OptionalMemberExpression'].includes(n?.type) ? `${name(n.object) || '?'}.${n.computed ? literal(n.property) || '?' : n.property?.name}` : null;

/** A navigable source index, not a claim that static branches executed. */
export function indexWorkflowSource(source, { id, label, file, provenance } = {}) {
  const ast = parseJavaScriptSource(source, label || 'source.js');
  const unit = { id, label, file, provenance, sha256: hash(source), parseStatus: ast ? 'parsed' : 'unparseable',
    functions: [], imports: [], calls: [], decisions: [], navigation: [], storage: [], constants: [], routes: [], wrappers: [], pathDefinitions: [], truncated: false };
  if (!ast) return unit;
  if (ast.errors?.length) unit.parseStatus = 'partial';
  const stack = [{ n: ast, owner: null, parent: null }]; let visited = 0;
  const loc = (n, owner) => ({ line: n.loc?.start.line, column: n.loc?.start.column, owner });
  while (stack.length && visited++ < 150000) {
    const { n, owner, parent } = stack.pop(); if (!n?.type) continue;
    let childOwner = owner;
    if (fnTypes.has(n.type)) {
      childOwner = n.id?.name || n.key?.name || (parent?.type === 'VariableDeclarator' ? parent.id?.name : null) || `anonymous:${n.loc?.start.line}`;
      unit.functions.push({ name: childOwner, ...loc(n, owner) });
    }
    if (n.type === 'ImportDeclaration') unit.imports.push({ from: literal(n.source), symbols: n.specifiers.map(s => ({ local: s.local?.name, imported: s.imported?.name || (s.type === 'ImportDefaultSpecifier' ? 'default' : '*') })), ...loc(n, owner) });
    if (n.type === 'VariableDeclarator' && literal(n.init) !== null) unit.constants.push({ name: n.id?.name, value: literal(n.init), ...loc(n, owner) });
    if (n.type === 'VariableDeclarator' && n.id?.name && fnTypes.has(n.init?.type)) {
      const body = n.init.body, value = literal(body) ?? (body?.type === 'BlockStatement' && body.body.length === 1 && body.body[0].type === 'ReturnStatement' ? literal(body.body[0].argument) : null);
      if (typeof value === 'string' && /^(?:\/|https?:)/.test(value)) unit.pathDefinitions.push({ name: n.id.name, value, ...loc(n, owner) });
    }
    if (n.type === 'VariableDeclarator' && n.id?.name && n.init?.type === 'CallExpression') {
      const inner = n.init.callee?.type === 'CallExpression' ? n.init.callee : n.init;
      if (/authoriz|permission|requireAuth|feature|guard/i.test(name(inner.callee) || '')) unit.wrappers.push({ name: n.id.name,
        gate: name(inner.callee), expression: source.slice(n.init.start, n.init.end).slice(0, 1500), ...loc(n, owner) });
    }
    if (n.type === 'JSXOpeningElement' && /(?:^|\.)Route$/.test(name(n.name) || n.name?.name || '')) {
      const attr = key => n.attributes.find(a => a.type === 'JSXAttribute' && a.name?.name === key)?.value;
      const p = attr('path'), element = attr('element');
      const expression = p?.type === 'JSXExpressionContainer' ? p.expression : p;
      unit.routes.push({ path: literal(expression), pathExpression: expression ? source.slice(expression.start, expression.end) : null,
        pathGetter: expression?.type === 'CallExpression' ? name(expression.callee) : null,
        component: element?.expression?.openingElement?.name?.name || null,
        elementExpression: element?.expression ? source.slice(element.expression.start, element.expression.end).slice(0, 1000) : null,
        index: n.attributes.some(a => a.name?.name === 'index'), ...loc(n, owner) });
    }
    if (['IfStatement', 'ConditionalExpression'].includes(n.type)) unit.decisions.push({ condition: source.slice(n.test.start, n.test.end).slice(0, 600), ...loc(n, owner) });
    if (['CallExpression', 'OptionalCallExpression'].includes(n.type)) {
      const callee = name(n.callee), args = n.arguments?.map(a => literal(a) ?? name(a)).slice(0, 5);
      unit.calls.push({ callee, arguments: args, ...loc(n, owner) });
      if (/navigate|redirect|(?:location|history)\.(?:assign|replace|push|replaceState|pushState)/i.test(callee || '')) unit.navigation.push({ operation: callee, arguments: args, ...loc(n, owner) });
      if (/(?:localStorage|sessionStorage|caches|indexedDB)\./.test(callee || '')) unit.storage.push({ operation: callee, key: args?.[0], ...loc(n, owner) });
    }
    if (n.type === 'AssignmentExpression' && /(?:^|\.)location(?:\.href)?$/.test(name(n.left) || '')) unit.navigation.push({ operation: name(n.left), ...loc(n, owner) });
    for (const [key, v] of Object.entries(n)) {
      if (['loc', 'tokens', 'comments', 'errors', 'extra'].includes(key)) continue;
      if (Array.isArray(v)) for (let i = v.length - 1; i >= 0; i--) { if (v[i]?.type) stack.push({ n: v[i], owner: childOwner, parent: n }); }
      else if (v?.type) stack.push({ n: v, owner: childOwner, parent: n });
    }
  }
  unit.truncated = stack.length > 0;
  return unit;
}

export function selectWorkflowUnits(units, texts, terms, maxUnits = 35) {
  const seeds = units.filter(u => terms.some(t => `${u.label}\n${texts.get(u.id)}`.toLowerCase().includes(t.toLowerCase())));
  const selected = new Map(seeds.slice(0, maxUnits).map(u => [u.id, { ...u, selection: 'question-term match', depth: 0 }]));
  const links = [];
  // A bounded reference expansion. Imported names may have multiple definitions; never silently pick one.
  for (let depth = 0; depth < 3; depth++) {
    for (const u of [...selected.values()].filter(u => u.depth === depth)) {
      for (const imp of u.imports) for (const s of imp.symbols) {
        if (!s.imported || ['default', '*'].includes(s.imported)) continue;
        const candidates = units.filter(v => v.id !== u.id && v.functions.some(f => f.name === s.imported));
        if (!candidates.length) continue;
        links.push({ from: u.id, symbol: s.imported, importFrom: imp.from, candidates: candidates.map(v => v.id),
          status: candidates.length === 1 ? 'unique-name-candidate' : 'ambiguous', basis: 'symbol-name match; module resolution and execution not proven' });
        for (const v of candidates) if (!selected.has(v.id) && selected.size < maxUnits) selected.set(v.id, { ...v, depth: depth + 1, selection: `import candidate from ${u.id}` });
      }
    }
  }
  return { units: [...selected.values()], links, omittedSeedMatches: Math.max(0, seeds.length - maxUnits) };
}

export async function runUnderstand({ question, terms, outDir, url, origins, runDir, sourceDir,
  networkFile, maxScripts = 60, maxUnits = 35, maxBytes = 24 * 1024 * 1024, maxTotalBytes = 160 * 1024 * 1024 } = {}) {
  if (typeof question !== 'string' || !question.trim() || question.length > 2000) throw new Error('A workflow question is required');
  if (!Array.isArray(terms) || !terms.length || terms.length > 20 || terms.some(t => typeof t !== 'string' || !t || t.length > 100)) throw new Error('Supply 1–20 literal search terms');
  for (const [n, cap] of [[maxScripts, 100], [maxUnits, 100], [maxBytes, 64 * 1024 * 1024], [maxTotalBytes, 256 * 1024 * 1024]]) if (!Number.isSafeInteger(n) || n < 1 || n > cap) throw new Error('Invalid workflow budget');
  if (!url && !runDir && !sourceDir) throw new Error('A URL, capture run or source directory is required');
  const out = resolve(outDir); await mkdir(dirname(out), { recursive: true }); await mkdir(out);
  await mkdir(join(out, 'sources')); await mkdir(join(out, 'artifacts'));
  const result = { schemaVersion: 1, kind: 'workflow-understanding', question, terms, generatedAt: new Date().toISOString(),
    status: 'indexed', acquisition: [], observations: [], units: [], links: [], excerpts: [], gaps: [],
    limitations: ['Source is parsed, never executed. Static references do not establish runtime execution.',
      'Downloaded source may differ from a cached live tab; compare SHA-256 with the capture before claiming identity.',
      'No live credentials, storage values, server implementation or authentication validity are read by this command.',
      'This is an evidence pack for workflow reasoning, not an automatic proof of arbitrary application behavior.'] };
  const units = [], texts = new Map(); let total = 0;
  const budget = bytes => { if (bytes > maxBytes || total + bytes > maxTotalBytes) throw new Error('SOURCE_BUDGET'); total += bytes; };
  const add = async (source, label, provenance) => {
    if (units.length >= 4000) { if (!result.gaps.includes('SOURCE_UNIT_LIMIT')) result.gaps.push('SOURCE_UNIT_LIMIT'); return; }
    const id = `source-${units.length + 1}`, file = `sources/${id}.txt`;
    await writeFile(join(out, file), source);
    units.push(indexWorkflowSource(source, { id, label, file, provenance })); texts.set(id, source);
  };
  const unpack = async (text, provenance) => {
    let map; try { map = JSON.parse(text); } catch { result.gaps.push('INVALID_SOURCE_MAP'); return; }
    if (map.sections) { result.gaps.push('INDEXED_SOURCE_MAP_UNSUPPORTED'); return; }
    if (!Array.isArray(map.sources) || !Array.isArray(map.sourcesContent)) { result.gaps.push('SOURCE_MAP_CONTENT_UNAVAILABLE'); return; }
    for (let i = 0; i < Math.min(map.sources.length, 4000); i++) {
      if (typeof map.sourcesContent[i] !== 'string') continue;
      // Labels are metadata, never filesystem paths. Prevent map path traversal by generated filenames.
      const label = String(map.sources[i]).slice(0, 1500);
      if (/\.(?:css|scss|svg|json)(?:\?|$)/i.test(label) || /(?:^|\/)node_modules\//.test(label)) continue;
      await add(map.sourcesContent[i], label, { ...provenance, sourceIndex: i });
    }
    if (map.sources.length > 4000) result.gaps.push('SOURCE_MAP_UNIT_LIMIT');
  };
  let network;
  if (networkFile) network = await readJsonWithin(dirname(resolve(networkFile)), resolve(networkFile).split(/[\\/]/).at(-1));
  if (runDir) {
    const a = await optionalJson(runDir, 'capture/network/evidence.json'), b = a.data ? a : await optionalJson(runDir, 'network/evidence.json');
    network ||= b.data;
    if (b.data) {
      const root = join(resolve(runDir), dirname(b.file));
      for (const s of (network.scripts || []).filter(s => s.file).slice(0, maxScripts)) {
        try { const bytes = await readWithin(root, s.file, maxBytes); budget(bytes.length); await add(bytes.toString('utf8'), safeUrl(s.url), { kind: 'captured-script', sha256: hash(bytes) }); }
        catch { result.gaps.push('CAPTURED_SCRIPT_UNREADABLE_OR_BUDGET'); }
      }
    } else result.gaps.push('CAPTURE_NETWORK_MISSING');
  }
  if (network) {
    if (!Array.isArray(network.requests) || network.requests.length > 50000) throw new Error('Invalid network evidence');
    result.observations = network.requests.filter(r => r.type === 'Document' || r.resourceType === 'Document' || [401, 403].includes(r.response?.status) || terms.some(t => (r.request?.url || '').toLowerCase().includes(t.toLowerCase())))
      .slice(0, 500).map(r => ({ requestId: r.requestId, hop: r.hop, actionId: r.actionId, timestamp: r.timestamp, wallTime: r.wallTime, url: safeUrl(r.request?.url || ''), method: r.request?.method,
        status: r.response?.status, type: r.type || r.resourceType, initiator: r.initiator, cache: { disk: r.response?.fromDiskCache, serviceWorker: r.response?.fromServiceWorker }, basis: 'supplied network evidence' }));
  }
  if (sourceDir) {
    const files = (await readdir(sourceDir)).filter(f => /\.map$/.test(f));
    for (const f of files.slice(0, maxScripts)) {
      try { const bytes = await readWithin(sourceDir, f, maxBytes); budget(bytes.length); await unpack(bytes.toString('utf8'), { kind: 'local-source-map', input: f, sha256: hash(bytes) }); }
      catch { result.gaps.push('LOCAL_MAP_UNREADABLE_OR_BUDGET'); }
    }
    if (files.length > maxScripts) result.gaps.push('MAP_COUNT_LIMIT');
  }
  if (url) {
    const scope = createScope(origins || [new URL(url).origin]); scope.require(url);
    const get = async address => {
      scope.require(address);
      const r = await requestBounded(address, { maxBytes, maxWireBytes: maxBytes, timeoutMs: 15000 }); budget(r.bytes);
      const file = `artifacts/${result.acquisition.length + 1}.txt`;
      await writeFile(join(out, file), r.body);
      result.acquisition.push({ url: safeUrl(address), status: r.status, bytes: r.bytes, sha256: hash(r.body), file, basis: 'fresh unauthenticated GET; no browser cookies' });
      if (r.status !== 200) throw new Error('NON_200_RESOURCE');
      return r;
    };
    const page = await get(url);
    const scripts = [...page.body.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map(m => new URL(m[1].replaceAll('&amp;', '&'), url).href);
    if (scripts.length > maxScripts) result.gaps.push('SCRIPT_COUNT_LIMIT');
    for (const script of [...new Set(scripts)].slice(0, maxScripts)) {
      try {
        const r = await get(script);
        // Last directive wins; dependencies can contain embedded earlier map comments.
        const matches = [...r.body.matchAll(/(?:\/\/[#@]|\/\*[#@])\s*sourceMappingURL\s*=\s*([^\s*]+)/g)];
        const ref = matches.at(-1)?.[1];
        if (!ref) { await add(r.body, safeUrl(script), { kind: 'fresh-script', sha256: hash(r.body) }); continue; }
        if (ref.startsWith('data:')) { result.gaps.push('INLINE_MAP_UNSUPPORTED'); await add(r.body, safeUrl(script), { kind: 'fresh-script' }); continue; }
        try {
          const mapUrl = new URL(ref, script).href, mr = await get(mapUrl);
          await unpack(mr.body, { kind: 'published-source-map', scriptUrl: safeUrl(script), scriptSha256: hash(r.body), url: safeUrl(mapUrl), sha256: hash(mr.body) });
        } catch { result.gaps.push('MAP_UNAVAILABLE_OR_OUT_OF_SCOPE'); await add(r.body, safeUrl(script), { kind: 'fresh-script' }); }
      } catch { result.gaps.push('SCRIPT_UNAVAILABLE_OR_OUT_OF_SCOPE_OR_BUDGET'); }
    }
  }
  const selected = selectWorkflowUnits(units, texts, terms, maxUnits);
  result.discoverySources = units.filter(u => u.routes.length || u.wrappers.length || u.pathDefinitions.length || u.navigation.length).map(u => ({
    id: u.id, label: u.label, file: u.file, provenance: u.provenance, routes: u.routes, wrappers: u.wrappers, pathDefinitions: u.pathDefinitions, navigation: u.navigation }));
  Object.assign(result, selected); result.inventory = { sourceUnits: units.length, selectedUnits: selected.units.length, acquiredBytes: total };
  if (selected.omittedSeedMatches) result.gaps.push('QUESTION_MATCH_LIMIT');
  for (const u of result.units) {
    const p = u.provenance;
    const candidates = (network?.scripts || []).filter(s => safeUrl(s.url || '') === (p.scriptUrl || u.label));
    const acquiredHash = p.scriptSha256 || (p.kind === 'fresh-script' ? p.sha256 : null);
    u.captureIdentity = { status: p.kind === 'captured-script' ? 'captured-source' :
      !acquiredHash || !candidates.some(s => s.sha256) ? 'unverified' :
      candidates.some(s => s.sha256 === acquiredHash) ? 'hash-matched' : 'hash-mismatch',
      basis: 'deployed script SHA-256 compared with supplied capture; source-map authenticity is not independently established' };
  }
  for (const u of result.units) {
    const lines = texts.get(u.id).split('\n'), hits = new Set();
    lines.forEach((line, i) => { if (terms.some(t => line.toLowerCase().includes(t.toLowerCase()))) hits.add(i); });
    if (!hits.size) u.functions.slice(0, 3).forEach(f => hits.add((f.line || 1) - 1));
    for (const i of [...hits].slice(0, 8)) result.excerpts.push({ sourceId: u.id, file: u.file, line: i + 1,
      startLine: Math.max(0, i - 3) + 1, text: lines.slice(Math.max(0, i - 3), i + 5).join('\n').slice(0, 5000), basis: 'static source excerpt' });
  }
  result.gaps = [...new Set(result.gaps)];
  result.nextChecks = ['Follow route → wrapper → predicate → state selector → storage/provider → navigation, citing source file and line at every step.',
    'Confirm ambiguous import candidates against package exports before treating them as call edges.',
    'Compare acquired script hashes with captured scripts. A fresh fetch is not the historical browser response.',
    'Pause the identified decision during a repeat action to prove its runtime condition. Read booleans/key presence only; omit credential values.',
    'Use preserved Network document statuses and initiators to distinguish HTTP redirects from in-page routing.'];
  if (!result.units.length) result.status = 'insufficient-evidence';
  await writeFile(join(out, 'understanding.json'), JSON.stringify(result, null, 2));
  const clean = s => String(s).replaceAll('\r', '').replaceAll('```', "'''");
  await writeFile(join(out, 'WORKFLOW.md'), `# Workflow understanding\n\n${clean(question)}\n\nStatus: ${result.status}. Selected ${result.units.length} of ${units.length} source units.\n\n## Observed requests\n\n${result.observations.map(r => `- ${r.method} ${r.url}: ${r.status ?? 'unknown'} (${r.type || 'type unavailable'})`).join('\n') || 'No network evidence supplied; navigation sequence is unverified.'}\n\n## Source evidence\n\n${result.units.map(u => `### ${clean(u.label)}\n\nLocal file: [${u.id}](${u.file}). Provenance: ${u.provenance.kind}.\n\nDecisions: ${u.decisions.map(d => `line ${d.line}: ${clean(d.condition)}`).join('; ') || 'none indexed'}.\n\nNavigation: ${u.navigation.map(n => `line ${n.line}: ${n.operation}`).join('; ') || 'none indexed'}.\n\nStorage: ${u.storage.map(s => `line ${s.line}: ${s.operation}(${s.key || 'dynamic'})`).join('; ') || 'none indexed'}.\n\n${result.excerpts.filter(e => e.sourceId === u.id).map(e => `Line ${e.startLine}:\n\n\`\`\`js\n${clean(e.text)}\n\`\`\``).join('\n\n')}`).join('\n\n')}\n\n## Next checks\n\n${result.nextChecks.map(s => `- ${s}`).join('\n')}\n\n## Gaps\n\n${result.gaps.join('\n') || 'No acquisition gaps recorded.'}\n\n${result.limitations.map(s => `- ${s}`).join('\n')}\n`);
  return result;
}
