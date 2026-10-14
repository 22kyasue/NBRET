import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { analyzeRun } from '../src/analyze.mjs';

test('analysis cache reuses identical evidence, invalidates changed inputs and rejects damaged results', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-analysis-'));
  try {
    await mkdir(join(root, 'network'));
    await writeFile(join(root, 'summary.json'), '{"capture":"captured","rea":"disabled","copy":"disabled"}');
    await writeFile(join(root, 'network/evidence.json'), '{"requests":[]}');
    const [first, second] = await Promise.all([analyzeRun(root), analyzeRun(root)]);
    assert.deepEqual([first.cache, second.cache].sort(), ['hit', 'miss']);
    assert.equal(first.key, second.key);
    const concurrent = await Promise.all([analyzeRun(root), analyzeRun(root)]);
    assert.ok(concurrent.every(r => r.cache === 'hit'));
    await writeFile(join(root, 'network/evidence.json'), '{"requests":[],"errors":[{}]}');
    const changed = await analyzeRun(root);
    assert.equal(changed.cache, 'miss'); assert.notEqual(changed.key, first.key);
    await writeFile(changed.out, '{"key":"corrupt"}');
    await assert.rejects(analyzeRun(root), /integrity validation/);
    await rm(join(root, 'network/evidence.json'));
    await writeFile(join(root, 'summary.json'), '{"capture":"failed","rea":"skipped","copy":"skipped"}');
    const failed = await analyzeRun(root);
    assert.equal(failed.report.provenance.evidenceMissing, true);
    assert.ok(failed.report.assessment.gaps.some(g => g.id === 'capture-failed'));
  } finally { await rm(root, { recursive: true, force: true }); }
});
