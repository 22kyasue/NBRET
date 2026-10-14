import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { runCapture } from '../src/run.mjs';

test('same-state extraction preserves interacted markup, CSS and assets without repeating navigation/actions', { timeout: 30000 }, async () => {
  let navigations = 0, calculations = 0;
  const server = createServer(async (req, res) => {
    if (req.url === '/calculate') { calculations++; res.setHeader('Content-Type', 'application/json'); res.end('{"result":25}'); return; }
    if (req.url === '/asset.svg') { res.setHeader('Content-Type', 'image/svg+xml'); res.end('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>'); return; }
    if (req.url !== '/') { res.writeHead(404); res.end(); return; }
    navigations++;
    res.setHeader('Content-Type', 'text/html');
    res.end('<style>output{color:red}.ready{color:rgb(0,128,0);font-size:32px}</style><img src="/asset.svg"><button>Calculate</button><output></output><script>document.querySelector("button").onclick=async()=>{const data=await(await fetch("/calculate")).json();const out=document.querySelector("output");out.textContent=data.result;out.className="ready"}</script>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  await mkdir('runs', { recursive: true });
  const out = resolve(`runs/same-state-${Date.now()}`);
  try {
    const summary = await runCapture({ url: `http://127.0.0.1:${server.address().port}/`, outDir: out, rea: false, copy: true, copyMode: 'same-state', actions: [{ type: 'click', selector: 'button' }], expectations: [{ selector: 'output', text: '25' }] });
    assert.equal(summary.capture, 'captured'); assert.equal(summary.copy, 'extracted', JSON.stringify(summary.errors));
    assert.equal(navigations, 1); assert.equal(calculations, 1);
    assert.match(await readFile(join(out, 'copy/body.html'), 'utf8'), /class="ready">25/);
    assert.match(await readFile(join(out, 'copy/used.css'), 'utf8'), /ready/);
    assert.match(await readFile(join(out, 'copy/assets.txt'), 'utf8'), /asset.svg/);
    assert.deepEqual(JSON.parse(await readFile(join(out, 'copy/summary.json'), 'utf8')).identity, summary.identity);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('same-state extraction covers same-process and out-of-process child frames and the full page', { timeout: 45000 }, async () => {
  let port;
  const server = createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    if (req.url === '/inner') { res.end('<style>.inner-mark{color:rgb(1,2,3)}</style><p class="inner-mark">Same origin frame</p>'); return; }
    if (req.url === '/remote') { res.end('<style>.remote-mark{color:rgb(4,5,6)}</style><p class="remote-mark">Remote frame</p><iframe src="/nested"></iframe>'); return; }
    if (req.url === '/nested') { res.end('<b>Nested</b>'); return; }
    res.end(`<style>main{height:3000px}</style><main><iframe name="inner" src="/inner"></iframe><iframe name="remote" src="http://localhost:${port}/remote"></iframe></main><footer>Bottom</footer>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); port = server.address().port;
  await mkdir('runs', { recursive: true });
  const out = resolve(`runs/same-state-frames-${Date.now()}`);
  try {
    const summary = await runCapture({ url: `http://127.0.0.1:${port}/`, origins: [`http://localhost:${port}`], outDir: out, rea: false, copy: true, copyMode: 'same-state', viewport: { width: 800, height: 600 } });
    assert.equal(summary.copy, 'extracted', JSON.stringify(summary.errors));
    assert.equal(summary.copyState.fullPage, 'captured');
    assert.deepEqual({ ...summary.copyState.frames, outOfProcess: undefined }, { discovered: 3, extracted: 3, outOfProcess: undefined, omitted: 0 });
    const frames = JSON.parse(await readFile(join(out, 'copy/frames.json'), 'utf8'));
    const inner = frames.find(f => f.name === 'inner'), remote = frames.find(f => f.name === 'remote'), nested = frames.find(f => f.url.endsWith('/nested'));
    assert.equal(inner.process, 'same-process'); assert.equal(remote.process, 'out-of-process');
    assert.equal(nested.parent, remote.index);
    assert.ok(remote.rect[2] > 0);
    assert.match(await readFile(join(out, `copy/frames/${inner.index}/body.html`), 'utf8'), /Same origin frame/);
    assert.match(await readFile(join(out, `copy/frames/${inner.index}/used.css`), 'utf8'), /inner-mark/);
    assert.match(await readFile(join(out, `copy/frames/${remote.index}/body.html`), 'utf8'), /Remote frame/);
    assert.match(await readFile(join(out, `copy/frames/${remote.index}/used.css`), 'utf8'), /remote-mark/);
    assert.doesNotMatch(await readFile(join(out, 'copy/used.css'), 'utf8'), /inner-mark|remote-mark/);
    assert.equal(summary.copyState.canvases.found, 0);
    const png = await readFile(join(out, 'copy/full.png'));
    assert.ok(png.readUInt32BE(20) > 600, 'full-page screenshot taller than the viewport');
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('same-state extraction captures canvas pixels, drawing context and animation', { timeout: 30000 }, async () => {
  const server = createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.end(`<canvas id="still" width="40" height="40"></canvas><canvas id="moving" width="40" height="40"></canvas><canvas id="hidden" style="display:none"></canvas><script>
      const s=document.querySelector('#still').getContext('2d');s.fillStyle='red';s.fillRect(0,0,40,40);
      const m=document.querySelector('#moving').getContext('2d');let x=0;setInterval(()=>{m.clearRect(0,0,40,40);m.fillRect(x=(x+7)%40,0,5,40)},30);
    </script>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  await mkdir('runs', { recursive: true });
  const out = resolve(`runs/same-state-canvas-${Date.now()}`);
  try {
    const summary = await runCapture({ url: `http://127.0.0.1:${server.address().port}/`, outDir: out, rea: false, copy: true, copyMode: 'same-state' });
    assert.equal(summary.copy, 'extracted', JSON.stringify(summary.errors));
    assert.deepEqual(summary.copyState.canvases, { found: 3, captured: 2, animated: 1, omitted: 0 });
    const canvases = JSON.parse(await readFile(join(out, 'copy/canvases.json'), 'utf8'));
    const still = canvases.find(c => c.path?.includes('still')), moving = canvases.find(c => c.path?.includes('moving'));
    assert.deepEqual(still.contexts, ['2d']); assert.equal(still.animated, false); assert.equal(moving.animated, true);
    assert.equal(canvases.find(c => c.path?.includes('hidden')).status, 'not-rendered');
    assert.ok((await readFile(join(out, 'copy', still.file))).length > 0);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
