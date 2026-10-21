import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, basename, join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { runProbe } from './probe.mjs';
import { evaluateExpect, validateExpect, atPointer } from './assertions.mjs';
import { createScope } from './scope.mjs';
import { safeUrl, clean } from './capture.mjs';
import { readJsonWithin } from './evidence-files.mjs';

const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ?
  Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
const digest = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const escapeXml = value => String(value).replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]);
const md = value => String(value).replace(/[|\r\n]/g, ' ');
function schema(value, depth = 0) {
  if (depth >= 15) return { type: 'unknown', reason: 'depth-budget' };
  if (value === null) return { type: 'null' };
  const unique = values => [...new Map(values.map(v => [JSON.stringify(v), v])).values()].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if (Array.isArray(value)) return { type: 'array', items: unique(value.slice(0, 2000).map(v => schema(v, depth + 1))), ...(value.length > 2000 ? { sampled: true } : {}) };
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    if (keys.length > 50) return { type: 'dictionary', values: unique(keys.slice(0, 2000).map(k => schema(value[k], depth + 1))), ...(keys.length > 2000 ? { sampled: true } : {}) };
    return { type: 'object', properties: Object.fromEntries(keys.map(k => [k, schema(value[k], depth + 1)])) };
  }
  return { type: typeof value };
}
function snapshot(entry, ignorePaths) {
  if (!entry?.response) return null;
  const r = entry.response, body = Object.hasOwn(r, 'body') ? structuredClone(r.body) : undefined;
  for (const path of ignorePaths) {
    if (path === '') throw new Error('Cannot ignore entire JSON document');
    const parts = path.slice(1).split('/'), key = parts.pop().replace(/~1/g, '/').replace(/~0/g, '~');
    const parent = atPointer(body, parts.length ? '/' + parts.join('/') : '').value;
    if (parent && typeof parent === 'object' && Object.hasOwn(parent, key)) delete parent[key];
  }
  return { status: r.status, contentType: r.headers?.['content-type']?.split(';')[0] || null,
    jsonSchema: body === undefined ? null : schema(body), bodySha256: body === undefined ? null : digest(body) };
}

export function compareChecks(current, baseline) {
  if (baseline.schemaVersion !== 1 || baseline.kind !== 'nbret-check-results' || !Array.isArray(baseline.tests)) throw new Error('Invalid check baseline');
  const old = new Map(baseline.tests.map(t => [t.key, t])), changes = [];
  for (const test of current.tests) {
    const previous = old.get(test.key); old.delete(test.key);
    if (!previous) { changes.push({ key: test.key, kind: 'added' }); continue; }
    if (!previous.snapshot || !test.snapshot) { changes.push({ key: test.key, kind: 'unavailable' }); continue; }
    for (const [field, kind] of [['status', 'status'], ['contentType', 'content-type'], ['jsonSchema', 'schema'], ['bodySha256', 'body']]) {
      if (JSON.stringify(previous.snapshot[field]) !== JSON.stringify(test.snapshot[field])) changes.push({ key: test.key, kind });
    }
  }
  for (const key of old.keys()) changes.push({ key, kind: 'removed' });
  return { changes, counts: Object.fromEntries([...new Set(changes.map(c => c.kind))].map(k => [k, changes.filter(c => c.kind === k).length])) };
}

export async function runChecks({ origins, cases, outDir, baselineFile, probeFile, allowWrites = false,
  timeoutMs = 15000, maxBytes = 20 * 1024 * 1024, delayMs = 100,
  ignoreJsonPaths = [], failOnChanges = ['status', 'schema'], maxMs = 120000, maxTotalBytes = 48 * 1024 * 1024 } = {}) {
  const scope = createScope(origins);
  if (!Array.isArray(cases) || !cases.length || cases.length > 100) throw new Error('Explicit bounded check cases required');
  if (!Array.isArray(ignoreJsonPaths) || ignoreJsonPaths.length > 100) throw new Error('Invalid ignored paths');
  ignoreJsonPaths.forEach(p => atPointer({}, p));
  if (!Array.isArray(failOnChanges) || failOnChanges.some(v => !['added', 'removed', 'status', 'content-type', 'schema', 'body'].includes(v))) throw new Error('Invalid regression policy');
  const keys = new Set();
  const specs = cases.map(c => {
    scope.require(c.url); validateExpect(c.expect || {});
    const method = (c.method || 'GET').toUpperCase(), key = c.name || `${method} ${safeUrl(c.url)}`;
    if (typeof key !== 'string' || key.length > 500 || keys.has(key)) throw new Error('Check names must be unique bounded strings');
    keys.add(key); return { ...c, method, key };
  });
  await mkdir(outDir, { recursive: false });
  const startedAt = new Date().toISOString();
  let probe;
  if (probeFile) probe = await readJsonWithin(dirname(resolve(probeFile)), basename(probeFile));
  else probe = await runProbe({ origins: scope.origins, cases: specs, outDir: join(outDir, 'probe'), allowWrites,
    timeoutMs, maxBytes, delayMs, maxTotalBytes, maxCases: 100, maxMs });
  if (!Array.isArray(probe.cases)) throw new Error('Invalid probe evidence');
  const result = { schemaVersion: 1, kind: 'nbret-check-results', startedAt, source: probeFile ? 'offline-probe-evidence' : 'live-http',
    sourceFinishedAt: probe.finishedAt || null, origins: scope.origins, tests: [], errors: [],
    regressionPolicy: { failOnChanges, ignoreJsonPaths }, limitations: ['HTTP assertions do not test every UI flow or prove absence of security issues.',
      'Offline checks assess the supplied observation, not current live state.', 'Schema comparison samples up to 2000 collection entries and 15 levels; dictionaries use value shapes.'] };
  for (const [index, c] of specs.entries()) {
    const match = probeFile ? probe.cases.find(entry => entry.request?.method === c.method && entry.request?.url === safeUrl(c.url) &&
      (c.body === undefined ? entry.request.body === undefined : entry.request.body !== undefined && digest(entry.request.body) === digest(clean(c.body)))) : probe.cases[index];
    const checks = evaluateExpect(match, c.expect || {});
    const outcome = checks.some(x => x.outcome === 'failed') ? 'failed' : checks.some(x => x.outcome === 'unavailable') ? 'incomplete' : 'passed';
    result.tests.push({ key: c.key, method: c.method, url: safeUrl(c.url), outcome, checks,
      elapsedMs: match?.elapsedMs, errorCode: match?.errorCode, snapshot: snapshot(match, ignoreJsonPaths) });
  }
  if (baselineFile) result.regression = compareChecks(result, await readJsonWithin(dirname(resolve(baselineFile)), basename(baselineFile)));
  else result.regression = { status: 'no-baseline', changes: [], counts: {} };
  const regressionFailed = result.regression.changes.some(c => failOnChanges.includes(c.kind));
  result.counts = { passed: result.tests.filter(t => t.outcome === 'passed').length,
    failed: result.tests.filter(t => t.outcome === 'failed').length, incomplete: result.tests.filter(t => t.outcome === 'incomplete').length };
  result.status = result.counts.failed || regressionFailed ? 'failed' : result.counts.incomplete ? 'incomplete' : 'passed';
  result.finishedAt = new Date().toISOString();
  await writeFile(join(outDir, 'check-results.json'), JSON.stringify(result, null, 2));
  await writeFile(join(outDir, 'CHECKS.md'), '# NBRET test results\n\n' +
    `Status: **${result.status}** · Source: ${result.source}\n\n${result.counts.passed} passed, ${result.counts.failed} failed, ${result.counts.incomplete} incomplete.\n\n` +
    '| Test | Outcome | Failed/unavailable assertions |\n| --- | --- | --- |\n' + result.tests.map(t =>
      `| ${md(t.key)} | ${t.outcome} | ${t.checks.filter(c => c.outcome !== 'passed').map(c => md(`${c.assertion} ${c.path || ''} ${c.reason || ''}`)).join('; ')} |`).join('\n') +
    `\n\nRegression changes: ${result.regression.changes.length}. Failing change types: ${failOnChanges.join(', ')}.\n\n` +
    result.regression.changes.map(c => `- ${md(c.key)}: ${c.kind}`).join('\n') + '\n');
  const xmlTests = result.tests.map(t => `<testcase name="${escapeXml(t.key)}" time="${(t.elapsedMs || 0) / 1000}">` +
    (t.outcome === 'failed' ? '<failure message="Assertion failed"/>' : t.outcome === 'incomplete' ? '<skipped message="Evidence unavailable"/>' : '') + '</testcase>');
  if (regressionFailed) xmlTests.push('<testcase name="Regression policy"><failure message="Baseline changes violate policy"/></testcase>');
  await writeFile(join(outDir, 'junit.xml'), `<?xml version="1.0" encoding="UTF-8"?><testsuite name="NBRET" tests="${xmlTests.length}" failures="${result.counts.failed + Number(regressionFailed)}" skipped="${result.counts.incomplete}">${xmlTests.join('')}</testsuite>`);
  return result;
}
