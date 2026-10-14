import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { runCapture } from '../src/run.mjs';
import { assessRun } from '../src/assess.mjs';
import { loadRun } from '../src/compare.mjs';
import { observeContracts } from '../src/contracts.mjs';

test('coverage discovers worker and child-frame gaps without claiming they were instrumented', { timeout: 30000 }, async () => {
  const server = createServer((req, res) => {
    if (req.url === '/worker.js') { res.setHeader('Content-Type', 'text/javascript'); res.end('postMessage(42);setInterval(()=>{},10000)'); return; }
    res.setHeader('Content-Type', 'text/html');
    if (req.url === '/frame') { res.end('<p>Child frame</p>'); return; }
    res.end('<iframe src="/frame"></iframe><output></output><script>const worker=new Worker("/worker.js");worker.onmessage=e=>document.querySelector("output").textContent=e.data</script>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  await mkdir('runs', { recursive: true });
  const out = resolve(`runs/targets-${Date.now()}`);
  try {
    const summary = await runCapture({ url: `http://127.0.0.1:${server.address().port}/`, outDir: out, rea: false, copy: false });
    assert.equal(summary.capture, 'captured');
    const evidence = JSON.parse(await readFile(join(out, 'network/evidence.json'), 'utf8'));
    assert.ok(evidence.targets.some(t => t.type === 'worker' && !t.observed));
    assert.ok(evidence.targets.some(t => t.observed));
    const gaps = assessRun(summary, evidence).gaps.map(g => g.id);
    assert.ok(gaps.includes('unobserved-browser-targets'));
    assert.ok(gaps.includes('child-frame-dom-gaps'));
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('independent worker recording captures its first fetch and script with linked target/action IDs', { timeout: 30000 }, async () => {
  const server = createServer((req, res) => {
    if (req.url === '/worker.js') { res.setHeader('Content-Type', 'text/javascript'); res.end('fetch("/worker-data").then(r=>r.json()).then(x=>postMessage(x));setInterval(()=>{},10000)'); return; }
    if (req.url === '/worker-data') { res.setHeader('Content-Type', 'application/json'); res.end('{"result":42}'); return; }
    res.setHeader('Content-Type', 'text/html');
    res.end('<output></output><script>const worker=new Worker("/worker.js");worker.onmessage=e=>document.querySelector("output").textContent=e.data.result</script>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  await mkdir('runs', { recursive: true });
  const out = resolve(`runs/worker-capture-${Date.now()}`);
  try {
    const summary = await runCapture({ url: `http://127.0.0.1:${server.address().port}/`, outDir: out, rea: false, copy: false, captureTargets: true, includeScriptSources: true, expectations: [{ selector: 'output', text: '42' }] });
    assert.equal(summary.capture, 'captured', JSON.stringify(summary.errors));
    assert.deepEqual(summary.targetCapture.errors, []);
    const worker = summary.targetCapture.targets.find(t => t.type === 'worker');
    assert.ok(worker, JSON.stringify(summary.targetCapture));
    const evidence = JSON.parse(await readFile(join(out, worker.file), 'utf8'));
    const request = evidence.requests.find(r => r.request.url.endsWith('/worker-data'));
    assert.ok(request); assert.equal(request.actionId, 1);
    assert.equal(evidence.identity.targetId, worker.targetId);
    assert.ok(evidence.scripts.some(s => s.url.endsWith('/worker.js')));
    const folder = join(out, worker.file, '..');
    assert.deepEqual(JSON.parse(await readFile(join(folder, request.body.file), 'utf8')), { result: 42 });
    assert.ok((await loadRun(out)).examples.some(e => e.key.includes('/worker-data') && e.output.responseHash));
    assert.ok((await observeContracts(out)).endpoints.some(e => e.key.endsWith('/worker-data') && e.responseShapes.length));
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('service-worker fetch and script are independently recorded', { timeout: 30000 }, async () => {
  const server = createServer((req, res) => {
    if (req.url === '/sw.js') { res.setHeader('Content-Type', 'text/javascript'); res.end('self.addEventListener("install",()=>self.skipWaiting());self.addEventListener("activate",e=>e.waitUntil(clients.claim()));self.addEventListener("message",e=>e.waitUntil(fetch("/sw-data").then(r=>r.json()).then(x=>e.source.postMessage(x))))'); return; }
    if (req.url === '/sw-data') { res.setHeader('Content-Type', 'application/json'); res.end('{"result":168}'); return; }
    res.setHeader('Content-Type', 'text/html');
    res.end('<output></output><script>navigator.serviceWorker.onmessage=e=>document.querySelector("output").textContent=e.data.result;navigator.serviceWorker.register("/sw.js").then(()=>navigator.serviceWorker.ready).then(r=>r.active.postMessage("go"))</script>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  await mkdir('runs', { recursive: true }); const out = resolve(`runs/service-worker-${Date.now()}`);
  try {
    const summary = await runCapture({ url: `http://127.0.0.1:${server.address().port}/`, outDir: out, rea: false, copy: false, captureTargets: true, expectations: [{ selector: 'output', text: '168' }] });
    assert.equal(summary.assertions?.[0].passed, true, JSON.stringify(summary));
    const worker = summary.targetCapture.targets.find(t => t.type === 'service_worker');
    assert.ok(worker, JSON.stringify(summary.targetCapture));
    const evidence = JSON.parse(await readFile(join(out, worker.file), 'utf8'));
    assert.ok(evidence.requests.some(r => r.request.url.endsWith('/sw-data')));
    assert.ok(evidence.scripts.some(s => s.url.endsWith('/sw.js')));
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('cross-process iframe first fetch is independently recorded in its authorized origin', { timeout: 30000 }, async () => {
  let port;
  const server = createServer((req, res) => {
    if (req.url === '/frame-data') { res.setHeader('Content-Type', 'application/json'); res.end('{"result":84}'); return; }
    res.setHeader('Content-Type', 'text/html');
    if (req.url === '/frame') { res.end('<script>fetch("/frame-data").then(r=>r.json()).then(x=>parent.postMessage(x,"*"))</script>'); return; }
    res.end(`<output></output><script>onmessage=e=>document.querySelector('output').textContent=e.data.result</script><iframe src="http://localhost:${port}/frame"></iframe>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); port = server.address().port;
  await mkdir('runs', { recursive: true });
  const out = resolve(`runs/iframe-capture-${Date.now()}`);
  try {
    const summary = await runCapture({ url: `http://127.0.0.1:${port}/`, origins: [`http://localhost:${port}`], outDir: out, rea: false, copy: false, captureTargets: true, expectations: [{ selector: 'output', text: '84' }] });
    assert.equal(summary.capture, 'captured', JSON.stringify(summary.errors));
    const frame = summary.targetCapture.targets.find(t => t.type === 'iframe');
    assert.ok(frame, JSON.stringify(summary.targetCapture));
    const evidence = JSON.parse(await readFile(join(out, frame.file), 'utf8'));
    const request = evidence.requests.find(r => r.request.url.endsWith('/frame-data'));
    assert.ok(request); assert.equal(request.inScope, true); assert.equal(request.actionId, 1);
    assert.deepEqual(JSON.parse(await readFile(join(out, frame.file, '..', request.body.file), 'utf8')), { result: 84 });
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
