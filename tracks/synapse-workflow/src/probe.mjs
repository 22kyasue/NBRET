import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createScope } from './scope.mjs';
import { requestBounded } from './http.mjs';
import { clean, safeUrl } from './capture.mjs';

export function shape(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return { array: [...new Set(value.map(v => JSON.stringify(shape(v))))].sort().map(v => JSON.parse(v)) };
  if (typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, shape(value[k])]));
  return typeof value;
}

export function contractKey(url, method = 'GET') {
  const u = new URL(safeUrl(url));
  return `${method.toUpperCase()} ${u.origin}${u.pathname}`;
}

export async function runProbe({ origins, cases, outDir, allowWrites = false, maxCases = 30,
  delayMs = 100, timeoutMs = 10000, maxBytes = 1048576, maxMs = 120000, maxTotalBytes = 48 * 1024 * 1024 } = {}) {
  const scope = createScope(origins);
  if (typeof allowWrites !== 'boolean') throw new Error('allowWrites must be boolean');
  if (!Number.isSafeInteger(maxCases) || maxCases < 1 || maxCases > 100 ||
      !Number.isSafeInteger(delayMs) || delayMs < 0 || delayMs > 10000) throw new Error('Invalid probe budget');
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000 ||
      !Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > 20 * 1024 * 1024) throw new Error('Invalid transport budget');
  if (!Array.isArray(cases) || !cases.length || cases.length > maxCases) throw new Error('Explicit bounded probe cases required');
  if (!Number.isSafeInteger(maxMs) || maxMs < 1 || maxMs > 600000) throw new Error('Invalid total probe deadline');
  if (!Number.isSafeInteger(maxTotalBytes) || maxTotalBytes < 4096 || maxTotalBytes > 256 * 1024 * 1024) throw new Error('Invalid total probe output budget');
  const prepared = cases.map((c, i) => {
    if (!c || typeof c.url !== 'string' || (c.expectStatus !== undefined &&
      (!Number.isSafeInteger(c.expectStatus) || c.expectStatus < 100 || c.expectStatus > 599))) throw new Error('Invalid probe case');
    const url = scope.require(c.url), method = (c.method || 'GET').toUpperCase();
    if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method)) throw new Error('Unsupported probe method');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !allowWrites) throw new Error('Write probes require allowWrites');
    if (['GET', 'HEAD'].includes(method) && c.body !== undefined) throw new Error('GET/HEAD cannot carry probe bodies');
    const body = c.body === undefined ? undefined : JSON.stringify(c.body);
    if (body && Buffer.byteLength(body) > maxBytes) throw new Error('Request exceeds byte budget');
    if (c.headers && Object.keys(c.headers).some(k => /^(host|connection|content-length|transfer-encoding)$/i.test(k))) throw new Error('Transport headers cannot be overridden');
    return { ...c, id: i + 1, url, method, body };
  });
  await mkdir(outDir, { recursive: false });
  const result = { schemaVersion: 1, tier: 3, origins: scope.origins, startedAt: new Date().toISOString(),
    limits: { maxCases, delayMs, timeoutMs, maxBytes }, cases: [], errors: [], limitations: ['Explicit cases only; no server source recovery.', 'Redirects are recorded but never followed.', 'Secrets are key-redacted; unstructured response bodies are omitted.'] };
  result.limits.maxMs = maxMs;
  result.limits.maxTotalBytes = maxTotalBytes;
  result.coverage = { outputByteLimited: false, omittedBodies: 0 };
  let retainedBytes = 0;
  const deadline = Date.now() + maxMs;
  for (const c of prepared) {
    const entry = { id: c.id, contract: contractKey(c.url, c.method), request: { url: safeUrl(c.url), method: c.method, headers: clean(c.headers || {}),
      ...(c.body !== undefined ? { body: clean(JSON.parse(c.body)) } : {}) } };
    const started = Date.now();
    try {
      if (Date.now() >= deadline) { const error = new Error('Probe deadline'); error.code = 'TOTAL_DEADLINE_EXCEEDED'; throw error; }
      const response = await requestBounded(c.url, { method: c.method, headers: { ...(c.body ? { 'content-type': 'application/json' } : {}), ...c.headers },
        body: c.body, timeoutMs: Math.max(1, Math.min(timeoutMs, deadline - Date.now())), maxBytes });
      let body, bodyShape, omitted;
      try { body = clean(JSON.parse(response.body)); bodyShape = shape(body); }
      catch { omitted = 'non-structured-payload'; }
      entry.response = { status: response.status, bytes: response.bytes, wireBytes: response.wireBytes,
        encoding: response.encoding, headers: clean(response.headers),
        ...(body !== undefined ? { body, shape: bodyShape,
          sha256: createHash('sha256').update(JSON.stringify(body)).digest('hex') } : { omitted }) };
      if (response.headers.location) entry.redirect = { followed: false,
        inScope: scope.allows(new URL(response.headers.location, c.url).href) };
      entry.expectation = c.expectStatus === undefined ? 'unspecified' : c.expectStatus === response.status ? 'passed' : 'failed';
    } catch (error) { entry.error = 'PROBE_FAILED: transport or response budget failure';
      entry.errorCode = error instanceof Error && /^[A-Z_]+$/.test(error.code || '') ? error.code : 'PROBE_FAILED';
      result.errors.push({ id: c.id, code: entry.errorCode }); }
    entry.elapsedMs = Date.now() - started;
    let entryBytes = Buffer.byteLength(JSON.stringify(entry, null, 2));
    if (retainedBytes + entryBytes > Math.floor(maxTotalBytes * 0.7)) {
      result.coverage.outputByteLimited = true;
      if (entry.response?.body !== undefined) {
        delete entry.response.body; delete entry.response.shape; delete entry.response.sha256;
        entry.response.omitted = 'total-output-byte-limit'; result.coverage.omittedBodies++;
      }
      if (entry.request.body !== undefined) { delete entry.request.body; entry.request.bodyOmitted = 'total-output-byte-limit'; }
      entryBytes = Buffer.byteLength(JSON.stringify(entry, null, 2));
    }
    retainedBytes += entryBytes;
    result.cases.push(entry);
    await writeFile(join(outDir, 'progress.json'), JSON.stringify({ status: 'running', finishedCases: result.cases.length,
      totalCases: prepared.length, errors: result.errors, elapsedMs: maxMs - Math.max(0, deadline - Date.now()) }, null, 2));
    if (delayMs && c !== prepared.at(-1) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, deadline - Date.now())));
  }
  const baselines = new Map();
  for (const c of result.cases) if (c.response) {
    if (!baselines.has(c.contract)) baselines.set(c.contract, c);
    const baseline = baselines.get(c.contract);
    c.comparison = { baselineId: baseline.id,
      statusChanged: c.response.status !== baseline.response.status,
      shapeChanged: JSON.stringify(c.response.shape) !== JSON.stringify(baseline.response.shape),
      bodyChanged: c.response.sha256 && baseline.response.sha256 ? c.response.sha256 !== baseline.response.sha256 : null };
  }
  result.finishedAt = new Date().toISOString();
  result.status = result.errors.length || result.coverage.outputByteLimited || result.cases.some(c => c.expectation === 'failed') ? 'incomplete' : 'completed';
  while (Buffer.byteLength(JSON.stringify(result, null, 2)) > maxTotalBytes) {
    const entry = result.cases.findLast(c => c.response?.body !== undefined || c.request.body !== undefined);
    if (!entry) throw new Error('Probe metadata exceeds output budget');
    if (entry.response?.body !== undefined) { delete entry.response.body; delete entry.response.shape; delete entry.response.sha256;
      entry.response.omitted = 'total-output-byte-limit'; result.coverage.omittedBodies++; }
    delete entry.request.body; entry.request.bodyOmitted = 'total-output-byte-limit';
    result.coverage.outputByteLimited = true; result.status = 'incomplete';
  }
  await writeFile(join(outDir, 'probe.json'), JSON.stringify(result, null, 2));
  await writeFile(join(outDir, 'progress.json'), JSON.stringify({ status: result.status, finishedCases: result.cases.length, totalCases: prepared.length, errors: result.errors }, null, 2));
  return result;
}
