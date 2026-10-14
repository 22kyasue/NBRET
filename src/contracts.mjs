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
  const addShape = (items, value) => {
    const shape = observedShape(value), key = JSON.stringify(shape), prior = items.find(i => i.key === key);
    if (prior) prior.observations++; else items.push({ key, shape, observations: 1 });
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
      try { addShape(endpoint.responseShapes, JSON.parse(raw)); } catch { endpoint.responseBodiesUnknown++; }
    } else endpoint.responseBodiesUnknown++;
    endpoints.set(key, endpoint);
  }
  return { schemaVersion: 1, identity: summary.identity || null, evidenceMissing: missing,
    endpoints: [...endpoints.values()].map(e => ({ ...e, requestShapes: e.requestShapes.map(({ key, ...s }) => s), responseShapes: e.responseShapes.map(({ key, ...s }) => s) })),
    limitations: ['Observed redacted JSON shapes only; no complete API schema or server implementation inferred.', 'Fields are not declared required; examples cannot establish all optionality or valid inputs.', 'Form, binary, unstructured, omitted and streaming bodies are not inferred.', 'Depth and per-container sampling limits can hide variation.'] };
}

export function mergeContracts(reports) {
  const endpoints = new Map();
  for (const report of reports) for (const endpoint of report.endpoints) {
    const combined = endpoints.get(endpoint.key) || { key: endpoint.key, observations: 0, statuses: [], queryKeys: [], requestShapes: [], responseShapes: [], requestBodiesUnknown: 0, responseBodiesUnknown: 0 };
    for (const field of ['observations', 'requestBodiesUnknown', 'responseBodiesUnknown']) combined[field] += endpoint[field];
    for (const field of ['statuses', 'queryKeys']) combined[field] = [...new Set([...combined[field], ...endpoint[field]])];
    for (const field of ['requestShapes', 'responseShapes']) for (const item of endpoint[field]) {
      const key = JSON.stringify(item.shape), prior = combined[field].find(s => JSON.stringify(s.shape) === key);
      if (prior) prior.observations += item.observations; else combined[field].push(structuredClone(item));
    }
    endpoints.set(endpoint.key, combined);
  }
  const presence = items => {
    let objectSamples = 0; const fields = new Map();
    for (const item of items.filter(i => i.shape.type === 'object')) {
      objectSamples += item.observations;
      for (const [name, shape] of Object.entries(item.shape.fields)) {
        const field = fields.get(name) || { name, observations: 0, observedTypes: [] };
        field.observations += item.observations; field.observedTypes = [...new Set([...field.observedTypes, shape.type])]; fields.set(name, field);
      }
    }
    return { objectSamples, fields: [...fields.values()].map(f => ({ ...f, missingInSomeObservedSamples: f.observations < objectSamples })) };
  };
  return { schemaVersion: 1, sources: reports.map(r => r.identity), endpoints: [...endpoints.values()].map(e => ({ ...e, requestFieldPresence: presence(e.requestShapes), responseFieldPresence: presence(e.responseShapes) })),
    limitations: ['Merged observations only; field presence is not required/optional schema proof.', 'Unknown, redacted and capped samples limit inference. Primary page origins are normalized; external origins remain distinct.'] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { run: { type: 'string', multiple: true }, help: { type: 'boolean' } } });
  if (values.help || !values.run) {
    console.log('Usage: npm run contracts -- --run runs/capture\nOffline observed JSON input/output shapes; no schema completeness claim.');
    process.exitCode = values.help ? 0 : 1;
  } else {
    const reports = await Promise.all([...new Set(values.run.map(path => resolve(path)))].map(dir => observeContracts(dir)));
    console.log(JSON.stringify(reports.length === 1 ? reports[0] : mergeContracts(reports), null, 2));
  }
}
