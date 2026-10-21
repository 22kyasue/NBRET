import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runExplore } from '../src/explore.mjs';
import { runProbe } from '../src/probe.mjs';
import { runScan } from '../src/zap.mjs';
import { requestBounded } from '../src/http.mjs';

await mkdir('runs', { recursive: true });
const out = prefix => resolve(`runs/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`);

test('probe executes paired variations, redacts secrets, rejects writes, and does not follow redirects', async () => {
  let externalHits = 0;
  const external = createServer((req, res) => { externalHits++; res.end('{}'); });
  await new Promise(r => external.listen(0, '127.0.0.1', r));
  const externalUrl = `http://127.0.0.1:${external.address().port}/`;
  const server = createServer(async (req, res) => {
    if (req.url === '/redirect') { res.writeHead(302, { Location: externalUrl }); res.end(); return; }
    if (req.url === '/big') { res.end('x'.repeat(5000)); return; }
    let text = ''; for await (const c of req) text += c;
    const data = text ? JSON.parse(text) : {};
    res.setHeader('Set-Cookie', 'session=private');
    res.end(JSON.stringify({ result: data.a + data.b, token: 'private', ...(data.extra ? { extra: true } : {}) }));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const cases = [{ url: origin, method: 'POST', body: { a: 20, b: 5, password: 'private' }, expectStatus: 200 },
      { url: origin, method: 'POST', body: { a: 7, b: 3, extra: true } }, { url: origin + '/redirect' }, { url: origin + '/big' }];
    await assert.rejects(runProbe({ origins: [origin], cases, outDir: out('reject') }), /allowWrites/);
    const outDir = out('probe');
    const result = await runProbe({ origins: [origin], cases, outDir, allowWrites: true, delayMs: 0, maxBytes: 1024 });
    assert.equal(result.cases[0].response.body.result, 25);
    assert.equal(result.cases[1].response.body.result, 10);
    assert.equal(result.cases[1].comparison.shapeChanged, true);
    assert.equal(result.cases[1].comparison.bodyChanged, true);
    assert.deepEqual(result.cases[2].redirect, { followed: false, inScope: false });
    assert.equal(result.cases[2].comparison.baselineId, 3, 'unrelated endpoint has its own baseline');
    assert.ok(result.cases[3].error);
    assert.equal(externalHits, 0);
    assert.equal(result.status, 'incomplete');
    assert.ok(!(await readFile(`${outDir}/probe.json`, 'utf8')).includes('private'));
    await assert.rejects(runProbe({ origins: [origin], cases: [{ url: externalUrl }], outDir: out('escape') }), /scope/);
  } finally { await Promise.all([new Promise(r => server.close(r)), new Promise(r => external.close(r))]); }
});

test('Explore deduplicates cyclic links, skips dangerous/external links, and closes only its owned tab', async () => {
  const calls = []; let current = 'http://fixture.test/';
  const driver = { async call(request) {
    calls.push(request);
    if (request.op === 'new_tab') return { tab: 'owned' };
    assert.equal(request.tab, 'owned');
    if (request.op === 'navigate') { current = request.value; return { performed: true }; }
    if (request.op === 'close_tab') return { closed: true };
    return { url: current, text: 'fixture', elements: [
      { name: 'Home', href: '/', ref: '1' }, { name: 'About', href: '/about', ref: '2' },
      { name: 'External', href: 'https://external.test/', ref: '3' }, { name: 'Delete', href: '/delete', ref: '4' },
    ] };
  } };
  const result = await runExplore({ url: current, outDir: out('explore'), driver });
  assert.equal(result.pages.length, 2);
  assert.equal(result.states.length, 2);
  assert.equal(result.status, 'completed');
  assert.equal(result.cleanup.closed, true);
  assert.ok(result.skipped.length >= 2);
  assert.ok(calls.filter(c => c.op === 'navigate').every(c => !/external|delete/.test(c.value)));
  assert.equal(calls.filter(c => c.op === 'close_tab').length, 1);
});

test('ZAP adapter isolates context, seeds without redirect following, and scopes active requests', async () => {
  const calls = []; let historyReads = 0;
  const transport = async url => {
    const u = new URL(url); calls.push(u);
    const operation = u.pathname.split('/').at(-2);
    const body = operation === 'version' ? { version: 'test' } : operation === 'newContext' ? { contextId: '7' } :
      operation === 'urls' ? { urls: ++historyReads === 1 ? [] : ['http://fixture.test/'] } : operation === 'scan' ? { scan: '11' } : operation === 'status' ? { status: '100' } :
      operation === 'recordsToScan' ? { recordsToScan: '0' } : operation === 'alerts' ? { alerts: [
        { pluginId: '1', alert: 'Header', risk: 'Low', url: 'http://fixture.test/', evidence: 'private' },
        { pluginId: '2', url: 'http://external.test/' },
      ] } : { Result: 'OK' };
    return { status: 200, body: JSON.stringify(body) };
  };
  const result = await runScan({ origins: ['http://fixture.test'], urls: ['http://fixture.test/'], outDir: out('scan'), active: true, pollMs: 10, transport });
  assert.equal(result.status, 'completed');
  assert.equal(result.alerts.length, 1);
  assert.equal(result.contextRemoved, true);
  assert.equal(historyReads, 2, 'waits for asynchronous ZAP history insertion');
  const scan = calls.find(c => c.pathname.endsWith('/scan/'));
  assert.equal(scan.searchParams.get('contextId'), '7');
  assert.equal(scan.searchParams.get('inScopeOnly'), 'true');
  assert.equal(scan.searchParams.get('recurse'), 'false');
  assert.equal(calls.find(c => c.pathname.endsWith('/accessUrl/')).searchParams.get('followRedirects'), 'false');
  assert.ok(!JSON.stringify(result).includes('private'));
});

test('transport enforces a wall-clock deadline even while response bytes keep arriving', async () => {
  const server = createServer((req, res) => {
    const timer = setInterval(() => res.write('x'), 5);
    res.on('close', () => clearInterval(timer));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  try {
    await assert.rejects(requestBounded(`http://127.0.0.1:${server.address().port}`, { timeoutMs: 50 }), /deadline/);
  } finally { server.closeAllConnections(); await new Promise(r => server.close(r)); }
});

test('Explore reports a depth-limited crawl instead of claiming completion', async () => {
  const driver = { async call(request) {
    if (request.op === 'new_tab') return { tab: 'owned' };
    if (request.op === 'close_tab') return { closed: true };
    return { url: 'http://fixture.test/', text: 'home', elements: [{ name: 'Next', href: '/next' }] };
  } };
  const result = await runExplore({ url: 'http://fixture.test/', outDir: out('depth'), maxDepth: 0, driver });
  assert.equal(result.status, 'bounded');
  assert.equal(result.coverage.depthLimited, true);
});

test('scanner API failure stops its own active scan and removes its own context', async () => {
  const calls = [];
  const transport = async url => {
    const u = new URL(url); calls.push(u);
    const operation = u.pathname.split('/').at(-2);
    const body = operation === 'version' ? { version: 'test' } : operation === 'newContext' ? { contextId: '7' } :
      operation === 'urls' ? { urls: ['http://fixture.test/'] } : operation === 'scan' ? { scan: '11' } : operation === 'status' ? { code: 'bad_progress' } : { Result: 'OK' };
    return { status: 200, body: JSON.stringify(body) };
  };
  const result = await runScan({ origins: ['http://fixture.test'], urls: ['http://fixture.test/'],
    outDir: out('scan-failure'), active: true, transport });
  assert.equal(result.status, 'failed');
  assert.equal(result.stoppedOwnedScan, true);
  assert.equal(result.contextRemoved, true);
  assert.equal(calls.find(c => c.pathname.endsWith('/stop/')).searchParams.get('scanId'), '11');
  assert.ok(!calls.some(c => /stopAll|shutdown/.test(c.pathname)));
});
