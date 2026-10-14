import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startFixture } from './fixture.mjs';
import { runCapture } from '../src/run.mjs';

test('fresh captures reuse saved assets without skipping live calculation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-asset-capture-')), fixture = await startFixture();
  try {
    const captures = [];
    for (const name of ['a', 'b']) captures.push(await runCapture({ url: fixture.url, outDir: join(root, name), rea: false, copy: false,
      retainProfile: false, assetStore: join(root, 'cache'), actions: [{ type: 'click', selector: '#calculate' }], expectations: [{ selector: '#result', text: '25' }] }));
    for (const capture of captures) assert.equal(capture.errors.length, 0);
    assert.ok(captures[0].metrics.assetReuse.misses > 0);
    assert.ok(captures[1].metrics.assetReuse.hits > 0);
    assert.ok(captures[1].counts.requests > 0);
  } finally { await fixture.close(); await rm(root, { recursive: true, force: true }); }
});
