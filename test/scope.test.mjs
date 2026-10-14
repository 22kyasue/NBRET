import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { captureOrigins, runCapture } from '../src/run.mjs';
import { loadRun, compareRuns } from '../src/compare.mjs';

test('explicit scope rejects credentials and non-origin values', () => {
  assert.deepEqual(captureOrigins('https://example.test/path', ['https://api.example.test', 'https://example.test/']), ['https://example.test', 'https://api.example.test']);
  for (const origin of ['https://user:pass@api.test', 'https://api.test/path', 'https://api.test/?key=x', 'https://api.test/#x', 'file:///tmp']) assert.throws(() => captureOrigins('https://example.test', [origin]));
  assert.throws(() => captureOrigins('https://user:pass@example.test'));
});

test('separate-origin API capture preserves scenario identity and useful phase costs', { timeout: 30000 }, async () => {
  const api = createServer((req, res) => { res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Content-Type', 'application/json'); res.end('{"result":42}'); });
  await new Promise(resolve => api.listen(0, '127.0.0.1', resolve));
  const apiOrigin = `http://127.0.0.1:${api.address().port}`;
  const page = createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end(`<button onclick="fetch('${apiOrigin}/value').then(r=>r.json()).then(x=>document.querySelector('output').textContent=x.result)">Read</button><output></output>`); });
  await new Promise(resolve => page.listen(0, '127.0.0.1', resolve));
  await mkdir('runs', { recursive: true });
  try {
    for (const allowed of [false, true]) {
      const outDir = resolve(`runs/scope-${allowed}-${Date.now()}`);
      const summary = await runCapture({ url: `http://127.0.0.1:${page.address().port}/`, outDir,
        origins: allowed ? [apiOrigin] : [], scenarioId: 'api-read', rea: false, copy: false, visual: allowed,
        actions: [{ type: 'click', selector: 'button' }] });
      assert.equal(summary.capture, 'captured');
      const evidence = JSON.parse(await readFile(join(outDir, 'network/evidence.json'), 'utf8'));
      const request = evidence.requests.find(r => r.request.url === `${apiOrigin}/value`);
      assert.ok(request);
      assert.equal(request.inScope, allowed);
      assert.deepEqual(evidence.identity, summary.identity);
      assert.equal(summary.identity.scenarioId, 'api-read');
      assert.ok(summary.metrics.phaseMs.browserLaunch >= 0);
      assert.ok(summary.metrics.phaseMs.networkSession > 0);
      assert.equal(summary.metrics.phaseMs.copy, undefined);
      if (allowed) {
        assert.deepEqual(JSON.parse(await readFile(join(outDir, 'network', request.body.file), 'utf8')), { result: 42 });
        assert.equal(summary.visual.status, 'captured');
        assert.equal(summary.visual.states.length, 2);
        const initial = JSON.parse(await readFile(join(outDir, summary.visual.states[0].file), 'utf8'));
        const after = JSON.parse(await readFile(join(outDir, summary.visual.states[1].file), 'utf8'));
        assert.equal(initial.nodes.find(n => n.tag === 'OUTPUT').text, '');
        assert.equal(after.nodes.find(n => n.tag === 'OUTPUT').text, '42');
        assert.deepEqual(after.identity, summary.identity);
        assert.equal(after.actionId, request.actionId);
        assert.ok((await readFile(join(outDir, summary.visual.states[1].screenshot))).length > 100);
        const loaded = await loadRun(outDir);
        assert.deepEqual(compareRuns(loaded, loaded).changes, []);
      }
      else assert.equal(request.body.omitted, 'out-of-scope');
    }
  } finally {
    api.closeAllConnections(); page.closeAllConnections();
    await Promise.all([api, page].map(server => new Promise(resolve => server.close(resolve))));
  }
});
