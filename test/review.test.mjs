import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { reviewArtifacts, artifactClass } from '../src/review.mjs';

test('review inventories provenance without exporting captured secrets or overwriting output', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-review-'));
  try {
    const run = join(root, 'capture'), out = join(root, 'review');
    await mkdir(run); await writeFile(join(run, 'summary.json'), '{"private":"VERY_SECRET"}');
    await writeFile(join(run, 'body.html'), 'PRIVATE_MARKUP');
    await reviewArtifacts(run, out);
    const text = await readFile(join(out, 'artifact-review.json'), 'utf8');
    assert.ok(!text.includes('VERY_SECRET')); assert.ok(!text.includes('PRIVATE_MARKUP'));
    assert.equal(JSON.parse(text).files.length, 2);
    assert.equal(artifactClass('profile/Cookies'), 'session-sensitive');
    assert.equal(artifactClass('copy/viewport.png'), 'visual-sensitive');
    await assert.rejects(reviewArtifacts(run, out), /EEXIST/);
    await assert.rejects(reviewArtifacts(run, join(run, 'review')), /outside/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
