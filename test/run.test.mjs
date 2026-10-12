import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runCapture } from '../src/run.mjs';
import { startFixture } from './fixture.mjs';

test('COPY + official REA + network input/output source hashes integrate end to end', { timeout: 180000 }, async () => {
  const { stdout } = await promisify(execFile)(process.execPath, ['scripts/demo.mjs'], { timeout: 170000, maxBuffer: 4 * 1024 * 1024, windowsHide: true });
  const result = JSON.parse(stdout);
  assert.equal(result.reaSourceHashMatch, true);
  assert.deepEqual(result.verifiedOutputs, [{ result: 25 }, { result: 10 }]);
  assert.equal(result.summary.copy, 'extracted');
});

test('capture errors never persist fill values, and existing runs are not overwritten', { timeout: 30000 }, async () => {
  await mkdir('runs', { recursive: true });
  const outDir = resolve(`runs/failure-${Date.now()}`);
  const fixture = await startFixture();
  try {
    const result = await runCapture({ url: fixture.url, outDir, rea: false, copy: false,
      actions: [{ type: 'fill', selector: 'h1', value: 'NBRET_FAKE_SECRET_ONLY' }] });
    assert.equal(result.capture, 'failed');
    assert.ok(!JSON.stringify(result).includes('NBRET_FAKE_SECRET_ONLY'));
    assert.ok(!(await readFile(`${outDir}/summary.json`, 'utf8')).includes('NBRET_FAKE_SECRET_ONLY'));
    await assert.rejects(runCapture({ url: fixture.url, outDir, rea: false, copy: false }), /EEXIST/);
  } finally { await fixture.close(); }
});
