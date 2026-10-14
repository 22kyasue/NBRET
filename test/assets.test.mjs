import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeCapturedAsset } from '../src/assets.mjs';

test('content-addressed assets reuse verified bytes and reject damaged cache entries', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-assets-')), cache = join(root, 'cache');
  try {
    const a = await writeCapturedAsset(join(root, 'run-a/body.json'), '{"result":25}', cache);
    const b = await writeCapturedAsset(join(root, 'run-b/body.json'), '{"result":25}', cache);
    assert.equal(a.cacheHit, false); assert.equal(b.cacheHit, true); assert.equal(b.linked, true);
    assert.equal(await readFile(join(root, 'run-b/body.json'), 'utf8'), '{"result":25}');
    assert.ok((await stat(join(cache, a.sha256))).nlink >= 3);
    await Promise.all(['c', 'd'].map(name => writeCapturedAsset(join(root, name, 'body.json'), '{"result":25}', cache)));
    await writeFile(join(cache, a.sha256), 'corrupt');
    await assert.rejects(writeCapturedAsset(join(root, 'e/body.json'), '{"result":25}', cache), /integrity validation/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
