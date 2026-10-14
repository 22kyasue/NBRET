import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { measureArtifacts } from '../src/metrics.mjs';

test('artifact accounting separates profile and evidence costs and declares truncation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-metrics-'));
  try {
    await Promise.all(['network', 'browser-profile'].map(dir => mkdir(join(root, dir))));
    await writeFile(join(root, 'network/example.json'), '123');
    await writeFile(join(root, 'browser-profile/cache'), '12345');
    const result = await measureArtifacts(root);
    assert.equal(result.groups.network.bytes, 3); assert.equal(result.groups.profile.bytes, 5);
    assert.equal(result.bytes, 8); assert.equal(result.files, 2);
    assert.equal((await measureArtifacts(root, { maxEntries: 1 })).truncated, true);
  } finally { await rm(root, { recursive: true, force: true }); }
});
