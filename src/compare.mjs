import { readFile } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { createHash } from 'node:crypto';
import { readEvidence } from './evidence.mjs';

const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
const hash = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const equal = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

async function readArtifact(root, file, encoding = 'utf8') {
  const target = resolve(root, file), rel = relative(root, target);
  if (isAbsolute(rel) || rel === '..' || rel.startsWith('../') || rel.startsWith('..\\')) throw new Error('Artifact path escapes capture directory');
  return readFile(target, encoding);
}

export function originAliases(values = {}) {
  const normalized = {};
  for (const [origin, label] of Object.entries(values)) {
    const u = new URL(origin);
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || u.pathname !== '/' || u.search || u.hash || !/^@[a-zA-Z][a-zA-Z0-9_-]{0,29}$/.test(label) || label === '@page') throw new Error('Origin aliases require HTTP(S) origins and unique-purpose @labels; @page is reserved');
    if (normalized[u.origin] && normalized[u.origin] !== label) throw new Error('Conflicting origin aliases');
    normalized[u.origin] = label;
  }
  return normalized;
}

export async function loadRun(dir, { aliases = {} } = {}) {
  const root = resolve(dir);
  const summary = JSON.parse(await readArtifact(root, 'summary.json'));
  const { evidence } = await readEvidence(root, summary);
  const mappedOrigins = originAliases(aliases);
  const route = value => { const u = new URL(value), origin = u.origin.replace(/^ws/, 'http'); return `${origin === summary.targetOrigin ? '@page' : mappedOrigins[origin] || u.origin}${u.pathname}${u.search}`; };
  const examples = [];
  for (const r of evidence.requests || []) {
    if (!r.inScope) continue;
    const u = new URL(r.request.url);
    let responseHash = null;
    if (r.body?.file) {
      const raw = await readArtifact(join(root, 'network'), r.body.file);
      try { responseHash = hash(JSON.parse(raw)); } catch { responseHash = hash(raw); }
    }
    let bodyHash = null;
    if (typeof r.request.postData?.text === 'string') {
      try { bodyHash = hash(JSON.parse(r.request.postData.text)); } catch { bodyHash = hash(r.request.postData.text); }
    }
    examples.push({ key: `${r.actionId ?? 'none'} ${r.request.method} ${route(r.request.url)}${r.targetType ? ` @target(${r.targetType})` : ''}`,
      input: { bodyHash, bodyOmitted: r.request.postData?.omitted || null },
      output: { status: r.response?.status ?? null, responseHash, bodyOmitted: r.body?.omitted || (r.body?.unavailable ? 'unavailable' : null), failed: !!r.failure } });
  }
  const states = [];
  for (const item of summary.visual?.states || []) states.push(JSON.parse(await readArtifact(root, item.file)));
  const message = m => {
    let payloadHash = null;
    if (typeof m.payload?.text === 'string') { try { payloadHash = hash(JSON.parse(m.payload.text)); } catch { payloadHash = hash(m.payload.text); } }
    return { actionId: m.actionId ?? null, direction: m.direction || 'received', opcode: m.opcode ?? 1, payloadHash,
      omitted: m.payloadOmitted || m.payload?.omitted || null };
  };
  const streams = (evidence.sockets || []).map(s => ({ key: `ws ${route(s.url)}${s.targetType ? ` @target(${s.targetType})` : ''}`, messages: s.frames.filter(f => [1, 2].includes(f.opcode)).map(message) }));
  const events = new Map();
  for (const event of evidence.eventSources || []) {
    const request = (evidence.requests || []).find(r => r.requestId === event.requestId);
    const key = `sse ${request ? route(request.request.url) : 'unknown-source'}${event.targetType ? ` @target(${event.targetType})` : ''}`;
    const messages = events.get(key) || []; messages.push(message(event)); events.set(key, messages);
  }
  streams.push(...[...events].map(([key, messages]) => ({ key, messages })));
  const motion = summary.motion?.file ? JSON.parse(await readArtifact(root, summary.motion.file)) : null;
  return { root, summary, evidence, examples, states, streams, motion, originAliases: mappedOrigins };
}

export async function compareScreenshots(before, after) {
  const { comparePixels } = await import('./pixels.mjs');
  const results = [];
  for (const a of before.summary.visual?.states || []) {
    const b = (after.summary.visual?.states || []).find(b => b.actionId === a.actionId);
    if (!b) continue;
    const [left, right] = await Promise.all([readArtifact(before.root, a.screenshot, null), readArtifact(after.root, b.screenshot, null)]);
    results.push({ actionId: a.actionId, ...await comparePixels(left, right) });
  }
  return results;
}

export function compareRuns(before, after, { tolerance = 1 } = {}) {
  if (!Number.isFinite(tolerance) || tolerance < 0) throw new Error('Geometry tolerance must be nonnegative');
  const warnings = [];
  const aId = before.summary.identity?.scenarioId, bId = after.summary.identity?.scenarioId;
  if (!aId || !bId || aId !== bId || aId === 'default') warnings.push('Scenario identity is absent, default or different; confirm equivalent intent before interpreting differences.');
  if (!equal((before.evidence.actions || []).map(a => a.label), (after.evidence.actions || []).map(a => a.label))) warnings.push('Action sequences differ.');
  if (!equal(before.summary.options, after.summary.options)) warnings.push('Capture options differ.');
  if (before.summary.identity?.state !== after.summary.identity?.state || before.summary.sessionImport?.sha256 !== after.summary.sessionImport?.sha256) warnings.push('Initial session or experimental state differs.');
  if (before.summary.capture !== 'captured' || after.summary.capture !== 'captured') warnings.push('At least one capture failed.');
  if ([before, after].some(r => r.summary.assertions?.some(a => !a.passed))) warnings.push('At least one scenario expectation failed.');
  const changes = [], evidenceChanges = [];
  const group = examples => {
    const map = new Map();
    for (const e of examples) { const items = map.get(e.key) || []; items.push(e); map.set(e.key, items); }
    return map;
  };
  const a = group(before.examples), b = group(after.examples);
  for (const key of new Set([...a.keys(), ...b.keys()])) {
    const left = a.get(key) || [], right = b.get(key) || [];
    for (let i = 0; i < Math.max(left.length, right.length); i++) {
      if (!left[i] || !right[i]) changes.push({ kind: left[i] ? 'request-removed' : 'request-added', key, occurrence: i });
      else {
        if (!equal(left[i].input, right[i].input)) changes.push({ kind: 'request-body-changed', key, occurrence: i });
        const x = left[i].output, y = right[i].output;
        if (x.status !== y.status || x.failed !== y.failed || (x.responseHash && y.responseHash && x.responseHash !== y.responseHash)) changes.push({ kind: 'response-changed', key, occurrence: i, before: x, after: y });
        if (x.bodyOmitted !== y.bodyOmitted || !!x.responseHash !== !!y.responseHash) evidenceChanges.push({ kind: 'response-evidence-changed', key, occurrence: i, before: { bodyOmitted: x.bodyOmitted, hashAvailable: !!x.responseHash }, after: { bodyOmitted: y.bodyOmitted, hashAvailable: !!y.responseHash } });
        if (!left[i].output.responseHash || !right[i].output.responseHash) warnings.push('Some paired response bodies are unavailable; equal metadata is not equal behavior.');
      }
    }
  }
  const stateKeys = new Set([...before.states, ...after.states].map(s => s.actionId));
  for (const actionId of stateKeys) {
    const left = before.states.find(s => s.actionId === actionId), right = after.states.find(s => s.actionId === actionId);
    if (!left || !right) { changes.push({ kind: 'visual-state-missing', actionId }); continue; }
    if (!equal(left.viewport, right.viewport)) warnings.push(`Viewport/scroll differs at action ${actionId}.`);
    if (left.nodesTruncated || right.nodesTruncated) warnings.push('Visual inventory was capped.');
    // Index matching is intentionally conservative; IDs are checked before interpreting properties.
    for (let i = 0; i < Math.max(left.nodes.length, right.nodes.length); i++) {
      const x = left.nodes[i], y = right.nodes[i];
      if (!x || !y || x.tag !== y.tag || x.id !== y.id) { changes.push({ kind: 'dom-structure-changed', actionId, index: i }); continue; }
      if (!equal(x.text, y.text)) changes.push({ kind: 'visible-text-changed', actionId, index: i });
      if (!equal(x.style, y.style)) changes.push({ kind: 'style-changed', actionId, index: i });
      if (['x', 'y', 'width', 'height'].some(k => Math.abs(x.rect[k] - y.rect[k]) > tolerance)) changes.push({ kind: 'geometry-changed', actionId, index: i });
    }
  }
  if (!before.states.length || !after.states.length) warnings.push('Same-state visual evidence is missing from at least one run.');
  const streamGroups = value => {
    const groups = new Map();
    for (const s of value || []) { const list = groups.get(s.key) || []; list.push(s); groups.set(s.key, list); }
    return groups;
  };
  const leftStreams = streamGroups(before.streams), rightStreams = streamGroups(after.streams);
  for (const key of new Set([...leftStreams.keys(), ...rightStreams.keys()])) {
    const left = leftStreams.get(key) || [], right = rightStreams.get(key) || [];
    for (let connection = 0; connection < Math.max(left.length, right.length); connection++) {
      if (!left[connection] || !right[connection]) { changes.push({ kind: 'stream-connection-changed', key, connection }); continue; }
      const a = left[connection].messages, b = right[connection].messages;
      for (let index = 0; index < Math.max(a.length, b.length); index++) {
        if (!equal(a[index], b[index])) changes.push({ kind: 'stream-message-changed', key, connection, index, before: a[index] || null, after: b[index] || null });
        if (!a[index]?.payloadHash || !b[index]?.payloadHash) warnings.push('Some stream payloads are omitted; metadata equality does not prove message equality.');
      }
    }
  }
  if (before.motion || after.motion) {
    if (!before.motion || !after.motion) changes.push({ kind: 'motion-evidence-missing' });
    else if (!equal(before.motion.config, after.motion.config)) warnings.push('Motion sampling protocols differ; trajectory comparison skipped.');
    else {
      for (let i = 0; i < Math.max(before.motion.samples.length, after.motion.samples.length); i++) {
        const a = before.motion.samples[i], b = after.motion.samples[i];
        if (!a || !b) { changes.push({ kind: 'motion-sample-missing', index: i }); continue; }
        if (!equal(a.animations, b.animations)) changes.push({ kind: 'motion-timing-changed', index: i });
        for (let j = 0; j < a.elements.length; j++) {
          const x = a.elements[j], y = b.elements[j];
          if (!y || x.selector !== y.selector || x.nodes.length !== y.nodes.length) { changes.push({ kind: 'motion-elements-changed', index: i, selector: x.selector }); continue; }
          for (let k = 0; k < x.nodes.length; k++) {
            const p = x.nodes[k], q = y.nodes[k];
            if (['x', 'y', 'width', 'height'].some(field => Math.abs(p.rect[field] - q.rect[field]) > tolerance) || Math.abs(Number(p.opacity) - Number(q.opacity)) > 0.01) changes.push({ kind: 'motion-path-changed', index: i, selector: x.selector, element: k });
          }
        }
        if (before.motion.config.mode === 'observe' && Math.abs(a.elapsedMs - b.elapsedMs) > before.motion.config.intervalMs / 2) warnings.push('Observed motion sample clocks drift; compare actual elapsed times before inferring trajectory differences.');
      }
    }
  }
  return { schemaVersion: 1, before: before.summary.identity || null, after: after.summary.identity || null,
    originAliases: { before: before.originAliases || {}, after: after.originAliases || {} },
    changes, evidenceChanges, warnings: [...new Set(warnings)], metrics: { before: before.summary.metrics || null, after: after.summary.metrics || null },
    limitations: ['Offline observations only; no replay or equivalence proof.', 'Primary page origins are normalized; external API origins remain exact unless explicitly aliased.', 'Requests pair by action/method/URL and occurrence, not proven causality.', 'DOM matches by index/tag/id; structural changes can produce many differences.', 'Response hashes compare saved redacted content. Headers are not compared; motion and structured stream comparisons require matching captured evidence; pixel decoding requires --pixels.'] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { before: { type: 'string' }, after: { type: 'string' }, origins: { type: 'string' }, tolerance: { type: 'string' }, pixels: { type: 'boolean' }, help: { type: 'boolean' } } });
  if (values.help || !values.before || !values.after) {
    console.log('Usage: npm run compare -- --before runs/reference --after runs/rebuild [--tolerance 1] [--pixels]\nOffline network and same-state DOM comparison; pixel decoding is opt-in.');
    process.exitCode = values.help ? 0 : 1;
  } else {
    const mappings = values.origins ? JSON.parse(await readFile(values.origins, 'utf8')) : {};
    const [before, after] = await Promise.all([loadRun(values.before, { aliases: mappings.before }), loadRun(values.after, { aliases: mappings.after })]);
    const result = compareRuns(before, after, { tolerance: Number(values.tolerance ?? 1) });
    if (values.pixels) result.pixels = await compareScreenshots(before, after);
    console.log(JSON.stringify(result, null, 2));
  }
}
