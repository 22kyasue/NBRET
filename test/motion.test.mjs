import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { runCapture } from '../src/run.mjs';
import { validateMotion } from '../src/motion.mjs';
import { loadRun, compareRuns } from '../src/compare.mjs';

test('motion budgets and deterministic-seek scope are explicit', () => {
  assert.throws(() => validateMotion({ mode: 'seek', selectors: ['#box'] }, 'https://example.test'));
  assert.throws(() => validateMotion({ selectors: ['#box'], frames: 120, intervalMs: 1000 }, 'http://127.0.0.1'));
});

test('trajectory comparison detects timing/path defects and validates responsive reduced-motion behavior', { timeout: 30000 }, async () => {
  const servers = [], root = resolve(`runs/motion-${Date.now()}`);
  await mkdir(root, { recursive: true });
  try {
    for (const variant of ['reference', 'broken', 'reduced-mobile']) {
      const broken = variant === 'broken';
      const server = createServer((req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.end(`<style>#box{width:60px;height:20px;background:red}@media(max-width:500px){#box{width:30px}}</style><button>Move</button><div id="box"></div><script>document.querySelector('button').onclick=()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.querySelector('#box').animate([{transform:'translateX(0px)'},{transform:'translateX(${broken ? 160 : 100}px)'}],{duration:${broken ? 400 : 200},fill:'forwards',easing:'linear'})}</script>`);
      });
      servers.push(server); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      const summary = await runCapture({ url: `http://127.0.0.1:${server.address().port}/`, outDir: join(root, variant), rea: false, copy: false, visual: true, visualCheckpoints: 'final', scenarioId: 'box-move', retainProfile: false,
        viewport: variant === 'reduced-mobile' ? { width: 390, height: 844 } : undefined,
        reducedMotion: variant === 'reduced-mobile' ? 'reduce' : 'no-preference',
        actions: [{ type: 'click', selector: 'button' }], motion: { mode: 'seek', selectors: ['#box'], frames: 3, intervalMs: 100, afterAction: 1 } });
      assert.equal(summary.capture, 'captured'); assert.equal(summary.motion.samples, 3, JSON.stringify(summary.errors));
    }
    const [reference, broken, reduced] = await Promise.all(['reference', 'broken', 'reduced-mobile'].map(v => loadRun(join(root, v))));
    const changes = compareRuns(reference, broken).changes.map(c => c.kind);
    assert.ok(changes.includes('motion-timing-changed')); assert.ok(changes.includes('motion-path-changed'));
    assert.deepEqual(compareRuns(reference, reference).changes, []);
    assert.ok(reduced.motion.samples.every(s => s.elements[0].nodes[0].rect.x === reduced.motion.samples[0].elements[0].nodes[0].rect.x));
    assert.equal(reduced.states[0].viewport.width, 390);
    assert.equal(reduced.states[0].nodes.find(n => n.id === 'box').rect.width, 30);
  } finally { await Promise.all(servers.map(server => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); })); }
});
