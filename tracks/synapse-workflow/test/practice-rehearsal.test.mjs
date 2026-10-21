import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { mkdtemp, rm, readFile, readdir, writeFile, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { runPracticeRehearsal } from '../src/practice/rehearsal.mjs';
import { inspectAssessmentDirectory } from '../src/investigation/assessment-import.mjs';
import { createJournal, readJournal } from '../src/investigation/journal.mjs';
import { startPracticeDemo } from '../src/practice/demo.mjs';
import { requestBounded } from '../src/http.mjs';

async function owned(t) {
  const directory = await mkdtemp(join(tmpdir(), 'nbret-rehearsal-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}
async function files(directory) {
  const result = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    assert.equal(item.isSymbolicLink(), false, 'generated artifacts must not be symlinks');
    if (item.isDirectory()) result.push(...await files(path));
    else result.push({ path, bytes: await readFile(path) });
  }
  return result;
}
function observeRequests(t, { omitFirst = false } = {}) {
  const reached = [], tokens = new Set(), original = http.request;
  let omitted = false;
  const spy = t.mock.method(http, 'request', function (url, options, ...rest) {
    assert.equal(url.protocol, 'http:'); assert.equal(url.hostname, '127.0.0.1');
    assert.equal(options.method, 'GET');
    assert.ok(['/api/me', '/api/work-orders'].includes(url.pathname));
    assert.equal(url.search, '');
    const authorization = options.headers?.authorization;
    if (authorization) { assert.ok(authorization.startsWith('Bearer ')); tokens.add(authorization.slice(7)); }
    if (omitFirst && !omitted) { omitted = true; throw Object.assign(new Error('owned test failure before request was sent'), { code: 'CONNECT_FAILED' }); }
    reached.push({ origin: url.origin, path: url.pathname, authenticated: Boolean(authorization) });
    return Reflect.apply(original, this, [url, options, ...rest]);
  });
  return { reached, tokens, restore: () => spy.mock.restore() };
}
async function connectionRefused(origin) {
  const url = new URL(origin);
  assert.equal(url.hostname, '127.0.0.1');
  await new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: '127.0.0.1', port: Number(url.port) });
    socket.setTimeout(2000);
    socket.once('connect', () => { socket.destroy(); reject(new Error('owned rehearsal listener remained reachable')); });
    socket.once('timeout', () => { socket.destroy(); reject(new Error('cleanup probe timed out rather than refusing connection')); });
    socket.once('error', error => { socket.destroy(); error.code === 'ECONNREFUSED' ? resolve() : reject(error); });
  });
}
async function noTokens(directory, tokens) {
  assert.equal(tokens.size, 2, 'both distinct synthetic identities actually sent credentials');
  for (const { bytes } of await files(directory)) for (const token of tokens) {
    assert.equal(bytes.includes(Buffer.from(token)), false, 'generated artifact retained a synthetic bearer token');
  }
}
const json = async path => JSON.parse(await readFile(path, 'utf8'));

test('guided rehearsal reaches all six owned GET cases, retains real evidence and re-inspects it after cleanup', async t => {
  const parent = await owned(t), outDir = join(parent, 'result'), spy = observeRequests(t);
  let run;
  try { run = await runPracticeRehearsal({ outDir }); } finally { spy.restore(); }
  const { receipt } = run;
  assert.equal(receipt.mode, 'guided'); assert.equal(receipt.status, 'checks-passed');
  assert.deepEqual(receipt.counts, { passed: 6, failed: 0, incomplete: 0 });
  assert.equal(receipt.reachedCases, 6); assert.equal(receipt.appClosed, true);
  assert.equal(spy.reached.length, 6);
  assert.deepEqual(new Set(spy.reached.map(r => r.origin)), new Set([receipt.fixtureUrl]));
  assert.deepEqual(receipt.requestLog, [
    { method: 'GET', path: '/api/me', actorId: 'alice' },
    { method: 'GET', path: '/api/me', actorId: 'bob' },
    { method: 'GET', path: '/api/work-orders', actorId: 'alice' },
    { method: 'GET', path: '/api/work-orders', actorId: 'bob' },
    { method: 'GET', path: '/api/me', actorId: null },
    { method: 'GET', path: '/api/work-orders', actorId: null },
  ]);
  await connectionRefused(receipt.fixtureUrl);
  const engagement = await json(join(run.runDir, 'engagement.json'));
  const evidence = await json(join(run.runDir, 'evidence.json'));
  const results = await json(join(run.runDir, 'results.json'));
  assert.ok(engagement.cases.every(c => c.method === 'GET' && c.effect === 'read' && c.purpose === 'control'));
  assert.equal(engagement.authorization.allowWrites, false);
  assert.equal(evidence.terminal, 'completed'); assert.equal(evidence.observations.length, 6);
  assert.equal(results.candidates.length, 0);
  assert.ok(results.tests.every(r => r.outcome === 'passed'));
  const byCase = new Map(evidence.observations.map(o => [o.binding.caseId, o]));
  for (const [actor, tenant, ids] of [
    ['alice', 'north', ['WO-N101', 'WO-N102', 'WO-N103']],
    ['bob', 'south', ['WO-S201', 'WO-S202', 'WO-S203']],
  ]) {
    const profile = byCase.get(`${actor}-profile`);
    assert.equal(profile.binding.actor.principal, actor); assert.equal(profile.binding.actor.tenant, tenant);
    assert.equal(profile.entry.response.body.profile.id, actor);
    assert.equal(profile.entry.response.body.profile.tenant, tenant);
    const orders = byCase.get(`${actor}-work-orders`).entry.response.body.orders;
    assert.deepEqual(orders.map(o => o.id), ids);
    assert.ok(orders.every(o => o.tenant === tenant && o.owner === actor));
  }
  for (const caseId of ['anonymous-profile', 'anonymous-work-orders']) {
    const observation = byCase.get(caseId);
    assert.equal(observation.entry.response.status, 401);
    assert.deepEqual(observation.entry.response.body, { error: 'Authentication required' });
  }
  const afterClose = await inspectAssessmentDirectory(run.runDir);
  assert.deepEqual(afterClose, await json(join(run.inspectionDir, 'inspection.json')));
  assert.equal(afterClose.evidenceDigest, receipt.offlineInspection.evidenceDigest);
  const bytes = await readFile(join(run.runDir, 'evidence.json'));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), afterClose.sourceFiles['evidence.json'].sha256);
  await noTokens(outDir, spy.tokens);
  const html = await readFile(run.htmlPath, 'utf8');
  assert.match(html, /guided/i); assert.match(html, /does not demonstrate autonomous discovery/);
  assert.match(html, /No reviewer or repair result has been fabricated/);
  assert.doesNotMatch(html, /<script\b|<iframe\b|src=["']https?:/i);
  assert.equal((await json(join(outDir, 'receipt.json'))).appClosed, true);
});

test('inspection failure after actual requests still closes owned listener and leaves no success report', async t => {
  const parent = await owned(t), outDir = join(parent, 'interrupted'), spy = observeRequests(t);
  const originalOpen = fs.promises.open;
  const patch = t.mock.method(fs.promises, 'open', function (filename, flags, ...rest) {
    if (String(filename).endsWith('results.json') && flags === 'r') throw new Error('owned test inspection failure');
    return Reflect.apply(originalOpen, this, [filename, flags, ...rest]);
  });
  syncBuiltinESMExports();
  try { await assert.rejects(runPracticeRehearsal({ outDir }), /owned test inspection failure/); }
  finally { patch.mock.restore(); syncBuiltinESMExports(); spy.restore(); }
  assert.equal(spy.reached.length, 6);
  await connectionRefused(spy.reached[0].origin);
  await noTokens(outDir, spy.tokens);
  await assert.rejects(lstat(join(outDir, 'REPORT.html')), { code: 'ENOENT' });
  await assert.rejects(lstat(join(outDir, 'receipt.json')), { code: 'ENOENT' });
  assert.deepEqual((await inspectAssessmentDirectory(join(outDir, 'assessment'))).counts, { passed: 6, failed: 0, incomplete: 0 });
});

test('one pre-send transport failure stays incomplete and does not count as a reached case', async t => {
  const parent = await owned(t), spy = observeRequests(t, { omitFirst: true });
  let run;
  try { run = await runPracticeRehearsal({ outDir: join(parent, 'partial') }); } finally { spy.restore(); }
  assert.equal(run.receipt.status, 'needs-attention');
  assert.deepEqual(run.receipt.counts, { passed: 5, failed: 0, incomplete: 1 });
  assert.equal(spy.reached.length, 5);
  assert.equal(run.receipt.requestLog.length, 5);
  assert.equal(run.receipt.reachedCases, 5, 'a retained unavailable observation is not a received request');
  assert.equal(run.receipt.appClosed, true);
  await connectionRefused(run.receipt.fixtureUrl);
  const result = await inspectAssessmentDirectory(run.runDir);
  assert.equal(result.status, 'incomplete'); assert.equal(result.candidates.length, 0);
});

test('existing outputs and journal-nested destinations are refused before any target request', async t => {
  const parent = await owned(t), existing = join(parent, 'existing');
  await createJournal(existing, { id: 'owned-existing' });
  const before = await readFile(join(existing, 'manifest.json'));
  const spy = observeRequests(t);
  try {
    await assert.rejects(runPracticeRehearsal({ outDir: existing }));
    await assert.rejects(runPracticeRehearsal({ outDir: join(existing, 'nested') }));
  } finally { spy.restore(); }
  assert.equal(spy.reached.length, 0);
  assert.deepEqual(await readFile(join(existing, 'manifest.json')), before);
  assert.equal((await readJournal(existing)).revision, 0);
  await assert.rejects(lstat(join(existing, 'nested')), { code: 'ENOENT' });
});

test('runnable demo serves exact artifacts, gates fresh reruns and closes both owned listeners', async t => {
  const parent = await owned(t);
  const demo = await startPracticeDemo({ outRoot: parent });
  let closed = false;
  t.after(async () => { if (!closed) await demo.close(); });
  const get = path => requestBounded(demo.url + path, { timeoutMs: 3000, maxBytes: 1024 * 1024 });
  const first = demo.latest;
  const page = await get('/'); assert.equal(page.status, 200);
  assert.ok(page.body.includes(demo.workspaceUrl));
  assert.match(page.body, /persistent demo instance/);
  const action = page.body.match(/<form method="post" action="(\/run\/[a-f0-9]+)"/)[1];
  const initialReceiptBytes = await readFile(join(first.outDir, 'receipt.json'));
  for (const [route, file] of [
    ['/receipt.json', 'receipt.json'], ['/assessment/evidence.json', 'assessment/evidence.json'],
    ['/assessment/results.json', 'assessment/results.json'], ['/assessment/engagement.json', 'assessment/engagement.json'],
    ['/inspection/inspection.json', 'inspection/inspection.json'],
  ]) {
    const response = await get(route);
    assert.equal(response.status, 200);
    assert.equal(response.body, await readFile(join(first.outDir, file), 'utf8'));
  }
  for (const path of ['/assessment/', '/assessment/../manifest.json', '/%2e%2e/package.json', '/receipt.json?extra=1', '/REPORT.html', '/run/invalid']) {
    assert.equal((await get(path)).status, 404);
  }
  assert.equal((await requestBounded(demo.url + '/', { headers: { host: 'unrelated.invalid' }, timeoutMs: 3000 })).status, 421);
  const post = headers => requestBounded(demo.url + action, { method: 'POST', headers, timeoutMs: 10000, maxBytes: 1024 * 1024 });
  assert.equal((await post({})).status, 403);
  assert.equal((await post({ origin: 'http://unrelated.invalid' })).status, 403);
  assert.equal((await post({ origin: demo.url, 'sec-fetch-site': 'cross-site' })).status, 403);
  assert.equal(demo.latest.receipt.id, first.receipt.id, 'rejected reruns do not create new run');
  const rerun = await post({ origin: demo.url, 'sec-fetch-site': 'same-origin' });
  assert.equal(rerun.status, 303); assert.equal(rerun.headers.location, '/');
  const second = demo.latest;
  assert.notEqual(second.receipt.id, first.receipt.id); assert.notEqual(second.outDir, first.outDir);
  assert.deepEqual(second.receipt.counts, { passed: 6, failed: 0, incomplete: 0 });
  assert.equal((await get('/receipt.json')).body, await readFile(join(second.outDir, 'receipt.json'), 'utf8'));
  assert.deepEqual(await readFile(join(first.outDir, 'receipt.json')), initialReceiptBytes, 'rerun preserves previous evidence');
  await connectionRefused(first.receipt.fixtureUrl);
  await connectionRefused(second.receipt.fixtureUrl);
  const workspace = await requestBounded(demo.workspaceUrl + '/', { timeoutMs: 3000, maxBytes: 128 * 1024 });
  assert.equal(workspace.status, 200); assert.match(workspace.body, /Practice workspace/);
  const close = demo.close();
  assert.equal(demo.close(), close, 'concurrent disposal reuses the same shutdown');
  await close; closed = true;
  await demo.close();
  await connectionRefused(demo.url); await connectionRefused(demo.workspaceUrl);
});

test('demo output root cannot create a new directory inside an existing journal', async t => {
  const parent = await owned(t), journal = join(parent, 'journal');
  const before = await createJournal(journal, { id: 'preserve-root' });
  const spy = observeRequests(t);
  try { await assert.rejects(startPracticeDemo({ outRoot: join(journal, 'new-root') }), /nested inside a journal/); }
  finally { spy.restore(); }
  assert.equal(spy.reached.length, 0);
  assert.deepEqual(await readJournal(journal), before);
  await assert.rejects(lstat(join(journal, 'new-root')), { code: 'ENOENT' });
});

test('invalid demo ports reject before output creation or fixture requests', async t => {
  const parent = await owned(t), outRoot = join(parent, 'not-created'), spy = observeRequests(t);
  try {
    for (const port of [-1, 65536, 1.5, '0', 'not-a-port', null]) {
      await assert.rejects(startPracticeDemo({ outRoot, port }), /integer/);
    }
  } finally { spy.restore(); }
  assert.equal(spy.reached.length, 0);
  await assert.rejects(lstat(outRoot), { code: 'ENOENT' });
});
