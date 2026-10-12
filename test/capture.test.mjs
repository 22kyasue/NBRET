import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, readFile, rm, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { startCapture } from '../src/capture.mjs';

test('browser captures correlated input20+5/output25, cache metadata, redaction and action geometry', async () => {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/sum')) {
      let body = ''; req.on('data', b => body += b); req.on('end', () => {
        const v = JSON.parse(body); res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': 'session=server-secret' });
        res.end(JSON.stringify({ result: v.a + v.b, token: 'response-secret' }));
      }); return;
    }
    if (req.url === '/asset.js') { res.writeHead(200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=3600' }); res.end('window.fixtureLoaded = true;'); return; }
    if (req.url === '/big') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ data: 'x'.repeat(10000) })); return; }
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><button>Compute</button><script src="/asset.js"></script>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const outDir = await mkdtemp(path.resolve('capture-test-'));
  let browser;
  try {
    const channel = process.env.NBRET_BROWSER_CHANNEL || (existsSync(chromium.executablePath()) ? undefined : 'chrome');
    browser = await chromium.launch({ headless: true, channel });
    const page = await browser.newPage();
    const capture = await startCapture(page, { outDir, origins: [origin], maxBodyBytes: 4096 });
    await page.goto(origin);
    const actionId = capture.markAction('calculate');
    const result = await page.evaluate(async () => {
      localStorage.setItem('password', 'storage-secret');
      const response = await fetch('/sum?token=query-secret', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer header-secret' }, body: JSON.stringify({ a: 20, b: 5, password: 'body-secret' }) });
      await fetch('/asset.js'); await fetch('/big');
      return response.json();
    });
    assert.equal(result.result, 25);
    await page.waitForLoadState('networkidle');
    await capture.snapshot('result');
    const evidence = await capture.finish();
    const request = evidence.requests.find(r => r.request.method === 'POST');
    assert.equal(request.actionId, actionId);
    assert.deepEqual(JSON.parse(request.request.postData.text), { a: 20, b: 5, password: '[REDACTED]' });
    assert.equal(request.response.status, 200);
    assert.ok(request.initiator.frames.length > 0);
    const body = JSON.parse(await readFile(path.join(outDir, request.body.file), 'utf8'));
    assert.deepEqual(body, { result: 25, token: '[REDACTED]' });
    assert.ok(evidence.scripts.some(s => s.url.endsWith('/asset.js') && s.sha256));
    assert.ok(evidence.requests.filter(r => r.request.url.endsWith('/asset.js')).some(r => r.servedFromCache || r.response?.fromDiskCache));
    assert.ok(evidence.requests.find(r => r.request.url.endsWith('/big')).body.truncated);
    assert.equal(evidence.snapshots[0].storage.localStorage.count, 1);
    assert.ok(evidence.snapshots[0].nodes.some(n => n.tag === 'BUTTON' && n.rect.width > 0));
    const serialized = await readFile(path.join(outDir, 'evidence.json'), 'utf8');
    for (const secret of ['query-secret', 'header-secret', 'body-secret', 'response-secret', 'server-secret', 'storage-secret']) assert.ok(!serialized.includes(secret), `leaked ${secret}`);
    assert.ok(evidence.scripts.every(s => !s.file));
    const optedIn = await startCapture(page, { outDir: path.join(outDir, 'sources'), origins: [origin], includeScriptSources: true });
    await page.reload();
    await page.waitForLoadState('networkidle');
    const sourceEvidence = await optedIn.finish();
    const script = sourceEvidence.scripts.find(s => s.url.endsWith('/asset.js') && s.file);
    assert.ok(script);
    assert.equal(script.redaction, 'none-explicit-opt-in');
    assert.equal(await readFile(path.join(outDir, 'sources', script.file), 'utf8'), 'window.fixtureLoaded = true;');
    const limited = await startCapture(page, { outDir: path.join(outDir, 'limited'), origins: [origin], maxEntries: 2, maxPending: 1 });
    await page.reload();
    await page.evaluate(async () => { for (let i = 0; i < 5; i++) await fetch('/big'); });
    await page.waitForLoadState('networkidle');
    assert.equal((await limited.snapshot('over limit')).truncated, true);
    const limitedEvidence = await limited.finish();
    assert.ok(limitedEvidence.dropped.entries > 0);
    assert.ok(['requests', 'scripts', 'sockets', 'actions', 'snapshots', 'errors'].reduce((sum, key) => sum + limitedEvidence[key].length, 0) <= 2);
    const boundedDir = path.join(outDir, 'bounded');
    const bounded = await startCapture(page, { outDir: boundedDir, origins: [origin], maxTotalBytes: 4096, includeScriptSources: true });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await bounded.snapshot('geometry');
    const boundedEvidence = await bounded.finish();
    assert.ok(boundedEvidence.dropped.serialization > 0);
    let diskBytes = (await stat(path.join(boundedDir, 'evidence.json'))).size;
    for (const file of await readdir(path.join(boundedDir, 'assets'))) diskBytes += (await stat(path.join(boundedDir, 'assets', file))).size;
    assert.ok(diskBytes <= 4096);
  } finally {
    await browser?.close(); await new Promise(resolve => server.close(resolve));
    const relative = path.relative(process.cwd(), path.resolve(outDir));
    assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative), 'cleanup must stay within cwd');
    await rm(outDir, { recursive: true, force: true });
  }
});
