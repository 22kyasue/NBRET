import { readFile } from 'node:fs/promises';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { readEvidence } from './evidence.mjs';

export function observedShape(value, depth = 0) {
  if (depth >= 8) return { type: 'unknown', omitted: 'depth-limit' };
  if (value === '[REDACTED]') return { type: 'unknown', omitted: 'redacted' };
  if (value === null) return { type: 'null' };
  if (Array.isArray(value)) {
    const shapes = value.slice(0, 100).map(v => observedShape(v, depth + 1));
    return { type: 'array', items: [...new Map(shapes.map(s => [JSON.stringify(s), s])).values()], sampledItems: Math.min(value.length, 100), truncated: value.length > 100 };
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return { type: 'object', fields: Object.fromEntries(keys.slice(0, 100).map(k => [k, observedShape(value[k], depth + 1)])), truncated: keys.length > 100 };
  }
  return { type: typeof value };
}

export async function observeContracts(runDir) {
  const root = resolve(runDir), network = join(root, 'network');
  const summary = JSON.parse(await readFile(join(root, 'summary.json'), 'utf8'));
  const { evidence, missing } = await readEvidence(root, summary);
  const endpoints = new Map();
  const addShape = (items, value, status) => {
    const shape = observedShape(value), key = JSON.stringify([status, shape]), prior = items.find(i => i.key === key);
    if (prior) prior.observations++; else items.push({ key, shape, observations: 1, ...(status !== undefined ? { status } : {}) });
  };
  for (const r of evidence.requests || []) {
    if (!r.inScope) continue;
    const u = new URL(r.request.url), key = `${r.request.method} ${u.origin === summary.targetOrigin ? '@page' : u.origin}${u.pathname}`;
    const endpoint = endpoints.get(key) || { key, observations: 0, queryKeys: [], statuses: [], requestShapes: [], responseShapes: [], requestBodiesUnknown: 0, responseBodiesUnknown: 0 };
    endpoint.observations++;
    for (const name of u.searchParams.keys()) if (!endpoint.queryKeys.includes(name)) endpoint.queryKeys.push(name);
    if (r.response?.status !== undefined && !endpoint.statuses.includes(r.response.status)) endpoint.statuses.push(r.response.status);
    if (r.request.postData) {
      try { if (typeof r.request.postData.text !== 'string') throw new Error('Missing structured body'); addShape(endpoint.requestShapes, JSON.parse(r.request.postData.text)); }
      catch { endpoint.requestBodiesUnknown++; }
    }
    if (r.body?.file) {
      const file = resolve(network, r.body.file), rel = relative(network, file);
      if (isAbsolute(rel) || rel === '..' || rel.startsWith('../') || rel.startsWith('..\\')) throw new Error('Response artifact escapes capture');
      const raw = await readFile(file, 'utf8');
      try { addShape(endpoint.responseShapes, JSON.parse(raw), r.response?.status ?? null); } catch { endpoint.responseBodiesUnknown++; }
    } else endpoint.responseBodiesUnknown++;
    endpoints.set(key, endpoint);
  }
  return { schemaVersion: 1, identity: summary.identity || null, evidenceMissing: missing,
    endpoints: [...endpoints.values()].map(e => ({ ...e, requestShapes: e.requestShapes.map(({ key, ...s }) => s), responseShapes: e.responseShapes.map(({ key, ...s }) => s) })),
    limitations: ['Observed redacted JSON shapes only; no complete API schema or server implementation inferred.', 'Fields are not declared required; examples cannot establish all optionality or valid inputs.', 'Form, binary, unstructured, omitted and streaming bodies are not inferred.', 'Depth and per-container sampling limits can hide variation.'] };
}

// Presence of every nested field path across observed object shapes, weighted by observations.
export function fieldPresence(items) {
  const containers = new Map(), fields = new Map();
  const visit = (shape, path, weight) => {
    if (shape.type === 'array') { for (const item of shape.items || []) visit(item, `${path}[]`, weight); return; }
    if (shape.type !== 'object') return;
    containers.set(path, (containers.get(path) || 0) + weight);
    for (const [name, child] of Object.entries(shape.fields)) {
      const fieldPath = path ? `${path}.${name}` : name, field = fields.get(fieldPath) || { name: fieldPath, container: path, observations: 0, observedTypes: [] };
      field.observations += weight; field.observedTypes = [...new Set([...field.observedTypes, child.type])]; fields.set(fieldPath, field);
      visit(child, fieldPath, weight);
    }
  };
  for (const item of items) visit(item.shape, '', item.observations);
  return { objectSamples: containers.get('') || 0, fields: [...fields.values()].map(({ container, ...f }) => ({ ...f, missingInSomeObservedSamples: f.observations < containers.get(container) })) };
}

export function mergeContracts(reports) {
  const endpoints = new Map();
  for (const report of reports) for (const endpoint of report.endpoints) {
    const combined = endpoints.get(endpoint.key) || { key: endpoint.key, observations: 0, statuses: [], queryKeys: [], requestShapes: [], responseShapes: [], requestBodiesUnknown: 0, responseBodiesUnknown: 0 };
    for (const field of ['observations', 'requestBodiesUnknown', 'responseBodiesUnknown']) combined[field] += endpoint[field];
    for (const field of ['statuses', 'queryKeys']) combined[field] = [...new Set([...combined[field], ...endpoint[field]])];
    for (const field of ['requestShapes', 'responseShapes']) for (const item of endpoint[field]) {
      const key = JSON.stringify([item.status, item.shape]), prior = combined[field].find(s => JSON.stringify([s.status, s.shape]) === key);
      if (prior) prior.observations += item.observations; else combined[field].push(structuredClone(item));
    }
    endpoints.set(endpoint.key, combined);
  }
  return { schemaVersion: 2, sources: reports.map(r => r.identity), endpoints: [...endpoints.values()].map(e => {
    const statuses = [...new Set(e.responseShapes.map(s => s.status).filter(s => s !== undefined))];
    return { ...e, requestFieldPresence: fieldPresence(e.requestShapes), responseFieldPresence: fieldPresence(e.responseShapes),
      responseFieldPresenceByStatus: Object.fromEntries(statuses.map(status => [status ?? 'unknown', fieldPresence(e.responseShapes.filter(s => s.status === status))])) };
  }),
    limitations: ['Merged observations only; field presence is not required/optional schema proof.', 'Nested paths use a.b for objects and a[] for array items; array item presence counts distinct observed item shapes, not every element.', 'Success and error responses are also reported per status so error bodies do not mask success fields.', 'Unknown, redacted and capped samples limit inference. Primary page origins are normalized; external origins remain distinct.'] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { run: { type: 'string', multiple: true }, help: { type: 'boolean' } } });
  if (values.help || !values.run) {
    console.log('Usage: npm run contracts -- --run runs/capture\nOffline observed JSON input/output shapes; no schema completeness claim.');
    process.exitCode = values.help ? 0 : 1;
  } else {
    const reports = await Promise.all([...new Set(values.run.map(path => resolve(path)))].map(dir => observeContracts(dir)));
    // Presence is reported for single runs too; one run is still only one set of observations.
    console.log(JSON.stringify(mergeContracts(reports), null, 2));
  }
}
