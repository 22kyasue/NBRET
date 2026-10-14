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
