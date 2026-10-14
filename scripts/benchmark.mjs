import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { runCapture } from '../src/run.mjs';
import { loadRun, compareRuns, compareScreenshots } from '../src/compare.mjs';
import { assessRun } from '../src/assess.mjs';

// A deliberately broken local rebuild proves the comparison catches real changes.
async function fixture(broken) {
  const server = createServer(async (req, res) => {
    if (req.url === '/sum' && req.method === 'POST') {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const { a, b } = JSON.parse(Buffer.concat(chunks).toString());
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ result: broken ? a + b - 1 : a + b })); return;
    }
    if (req.url !== '/') { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', 'text/html');
    res.end(`<!doctype html><style>body{font:20px sans-serif;padding:${broken ? 48 : 24}px}output{display:block}</style><input id="a" value="20"><input id="b" value="5"><button id="calculate">Calculate</button><output id="result"></output><script>document.querySelector('button').onclick=async()=>{const response=await fetch('/sum',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({a:Number(document.querySelector('#a').value),b:Number(document.querySelector('#b').value)})});document.querySelector('output').textContent=(await response.json()).result}</script>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${server.address().port}/`, close: () => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); } };
}

await mkdir('runs', { recursive: true });
const root = resolve(`runs/benchmark-${Date.now()}`);
await mkdir(root);
const servers = [];
try {
  for (const name of ['reference', 'rebuild']) {
    const server = await fixture(name === 'rebuild'); servers.push(server);
    await runCapture({ url: server.url, outDir: join(root, name), scenarioId: 'sum-default',
      rea: false, copy: false, visual: true,
      actions: [{ type: 'click', selector: '#calculate' }, { type: 'wait', ms: 100 }] });
  }
  const [reference, rebuild] = await Promise.all(['reference', 'rebuild'].map(name => loadRun(join(root, name))));
  const comparison = compareRuns(reference, rebuild);
  comparison.pixels = await compareScreenshots(reference, rebuild);
  assert.ok(comparison.pixels.some(p => p.comparable && p.changedPixels > 0), 'Benchmark detects changed pixels');
  for (const kind of ['response-changed', 'visible-text-changed', 'geometry-changed']) assert.ok(comparison.changes.some(c => c.kind === kind), `Benchmark detects ${kind}`);
  assert.deepEqual(compareRuns(reference, reference).changes, [], 'Same evidence produces no differences');
  const result = { schemaVersion: 1, root, verified: true, comparison,
    assessments: { reference: assessRun(reference.summary, reference.evidence), rebuild: assessRun(rebuild.summary, rebuild.evidence) },
    toolSelection: { network: true, visual: true, rea: false, copy: false, proxy: false,
      reason: 'Known local app; request/response and current layout resolve the benchmark question without additional tool passes.' } };
  await writeFile(join(root, 'benchmark.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ root, verified: true, detectedKinds: [...new Set(comparison.changes.map(c => c.kind))], warnings: comparison.warnings }, null, 2));
} finally { await Promise.all(servers.map(server => server.close())); }
