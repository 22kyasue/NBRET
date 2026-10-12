import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { startFixture } from '../test/fixture.mjs';
import { runCapture } from '../src/run.mjs';
await mkdir('runs', { recursive: true });
const outDir = resolve(`runs/demo-${Date.now()}`);
const fixture = await startFixture();
try {
  const summary = await runCapture({ url: fixture.url, outDir, includeScriptSources: true,
    actions: [{ type: 'click', selector: '#calculate' }, { type: 'wait', ms: 300 },
      { type: 'fill', selector: '#a', value: '7' }, { type: 'fill', selector: '#b', value: '3' },
      { type: 'click', selector: '#calculate' }, { type: 'wait', ms: 300 }] });
  assert.equal(summary.capture, 'captured');
  assert.equal(summary.rea, 'captured', JSON.stringify(summary.errors));
  assert.equal(summary.copy, 'extracted', JSON.stringify(summary.errors));
  const evidence = JSON.parse(await readFile(`${outDir}/network/evidence.json`, 'utf8'));
  const sums = evidence.requests.filter(r => r.request.url.endsWith('/sum'));
  assert.equal(sums.length, 2);
  assert.deepEqual(sums.map(r => JSON.parse(r.request.postData.text)), [{ a: 20, b: 5 }, { a: 7, b: 3 }]);
  const outputs = await Promise.all(sums.map(async r => JSON.parse(await readFile(`${outDir}/network/${r.body.file}`, 'utf8'))));
  assert.deepEqual(outputs, [{ result: 25 }, { result: 10 }]);
  const links = JSON.parse(await readFile(`${outDir}/links.json`, 'utf8'));
  assert.ok(links.requests.filter(r => r.url.endsWith('/sum')).every(r => r.scripts.some(s => s.sha256Match)));
  console.log(JSON.stringify({ outDir, summary, verifiedInputs: [{ a: 20, b: 5 }, { a: 7, b: 3 }], verifiedOutputs: outputs, reaSourceHashMatch: true }, null, 2));
} finally { await fixture.close(); }
