import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { parseArgs } from 'node:util';
import { startFixture } from '../test/fixture.mjs';
import { runCapture } from '../src/run.mjs';
import { writeInvestigation, proxyOptions } from '../src/investigation.mjs';

// Local-only HTTP integration check. No external site, scan, or replay.
const { values } = parseArgs({ options: { proxy: { type: 'string' } } });
if (values.proxy) proxyOptions(values.proxy);
const fixture = await startFixture();
const seen = [];
const proxy = createServer((req, res) => {
  const target = new URL(req.url);
  if (target.origin !== new URL(fixture.url).origin) {
    res.writeHead(403); res.end(); return;
  }
  seen.push({ method: req.method, path: target.pathname });
  const upstream = request(target, { method: req.method, headers: req.headers }, response => {
    res.writeHead(response.statusCode, response.headers); response.pipe(res);
  });
  upstream.on('error', () => { res.writeHead(502); res.end(); });
  req.pipe(upstream);
});
await mkdir('runs', { recursive: true });
const outDir = resolve(`runs/proxy-check-${Date.now()}`);
try {
  if (!values.proxy) await new Promise(resolve => proxy.listen(0, '127.0.0.1', resolve));
  const server = values.proxy || `http://127.0.0.1:${proxy.address().port}`;
  const summary = await runCapture({ url: fixture.url, outDir, proxy: server, rea: false, copy: false,
    actions: [{ type: 'click', selector: '#calculate' }, { type: 'wait', ms: 300 }] });
  assert.equal(summary.capture, 'captured', JSON.stringify(summary.errors));
  const evidence = JSON.parse(await readFile(join(outDir, 'network/evidence.json'), 'utf8'));
  const sum = evidence.requests.find(r => new URL(r.request.url).pathname === '/sum');
  assert.ok(sum, 'POST evidence exists');
  assert.deepEqual(JSON.parse(sum.request.postData.text), { a: 20, b: 5 });
  assert.deepEqual(JSON.parse(await readFile(join(outDir, 'network', sum.body.file), 'utf8')), { result: 25 });
  if (!values.proxy) assert.ok(seen.some(r => r.method === 'POST' && r.path === '/sum'), 'POST traversed proxy');
  const exported = await writeInvestigation(outDir);
  const collection = JSON.parse(await readFile(join(exported.out, 'postman.collection.json'), 'utf8'));
  assert.ok(collection.item.some(i => i.request.method === 'POST' && i.request.body.raw === sum.request.postData.text));
  const receipt = { outDir, proxy: server, fixture: fixture.url, capture: summary.capture,
    exportedRequests: exported.requests, verifiedResult: 25, proxyObservedRequests: values.proxy ? null : seen,
    limitation: values.proxy ? 'Confirm routing in external proxy HTTP history; this script cannot inspect it.' : 'Local forwarding proxy verified; Burp and HTTPS are separate checks.' };
  await writeFile(join(outDir, 'proxy-check.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
} finally {
  proxy.closeAllConnections();
  if (proxy.listening) await new Promise(resolve => proxy.close(resolve));
  await fixture.close();
}
