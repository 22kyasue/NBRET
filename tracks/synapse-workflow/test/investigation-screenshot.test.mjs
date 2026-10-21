import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, lstat } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { retainScreenshot, readScreenshot } from '../src/investigation/screenshot-artifact.mjs';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
const sha = value => createHash('sha256').update(value).digest('hex');
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'nbret-screenshot-'));
  t.after(async () => { assert.equal(dirname(root), resolve(tmpdir())); await rm(root, { recursive: true, force: true }); });
  const sourcePath = join(root, 'PRIVATE_SOURCE_CANARY.png'), outDir = join(root, 'screenshots');
  await writeFile(sourcePath, PNG);
  return { root, sourcePath, outDir, evidenceId: 'observation-1', caption: 'Synthetic ordinary state; provenance and effect unverified.' };
}
const retain = f => retainScreenshot({ sourcePath: f.sourcePath, outDir: f.outDir, evidenceId: f.evidenceId, caption: f.caption });
function crc(bytes) { let value = 0xffffffff; for (const byte of bytes) { value ^= byte; for (let i = 0; i < 8; i++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0); } return (value ^ 0xffffffff) >>> 0; }
function dimensions(width, height) { const bytes = Buffer.from(PNG); bytes.writeUInt32BE(width, 16); bytes.writeUInt32BE(height, 20); bytes.writeUInt32BE(crc(bytes.subarray(12, 29)), 29); return bytes; }

test('retained PNG is digest-bound, detached from source, secret-path-free and exclusive', async t => {
  const f = await fixture(t), record = await retain(f);
  assert.deepEqual(record, { artifactId: `png-${sha(PNG)}`, sha256: sha(PNG), mediaType: 'image/png', bytes: PNG.length, evidenceId: f.evidenceId, caption: f.caption });
  assert.doesNotMatch(JSON.stringify(record), /PRIVATE_SOURCE_CANARY|sourcePath|outDir/);
  const file = join(f.outDir, record.artifactId + '.png');
  assert.deepEqual(await readFile(file), PNG);
  await assert.rejects(retain(f), { code: 'NBRET_SCREENSHOT' });
  assert.deepEqual(await readFile(file), PNG);
  await writeFile(f.sourcePath, 'source changed');
  const image = await readScreenshot({ outDir: f.outDir, record }); assert.deepEqual(image, PNG);
  image.fill(0); assert.deepEqual(await readScreenshot({ outDir: f.outDir, record }), PNG);
});

test('reader rejects changed bytes, missing files, wrong digests and unsafe registered record fields', async t => {
  const f = await fixture(t), record = await retain(f);
  for (const patch of [{ bytes: record.bytes + 1 }, { sha256: '0'.repeat(64) }, { artifactId: '../private' }, { mediaType: 'text/html' }, { evidenceId: '' }, { caption: '' }, { sourcePath: f.sourcePath }]) {
    await assert.rejects(readScreenshot({ outDir: f.outDir, record: { ...record, ...patch } }), { code: 'NBRET_SCREENSHOT' });
  }
  const file = join(f.outDir, record.artifactId + '.png');
  await writeFile(file, dimensions(2, 1));
  await assert.rejects(readScreenshot({ outDir: f.outDir, record }), /digest or size mismatch/);
  await rm(file);
  await assert.rejects(readScreenshot({ outDir: f.outDir, record }), { code: 'NBRET_SCREENSHOT' });
});

test('PNG byte, dimension and structural limits reject before creating artifact output', async t => {
  const f = await fixture(t);
  const corrupt = Buffer.from(PNG); corrupt[corrupt.length - 1] ^= 1;
  for (const invalid of [Buffer.from('not an image'), PNG.subarray(0, 30), Buffer.concat([PNG, Buffer.from('trailing')]), corrupt, dimensions(0, 1), dimensions(4001, 4000), Buffer.alloc(4 * 1024 * 1024 + 1)]) {
    await writeFile(f.sourcePath, invalid);
    await assert.rejects(retain(f), { code: 'NBRET_SCREENSHOT' });
    await assert.rejects(lstat(f.outDir), { code: 'ENOENT' });
  }
});

test('exact descriptor-first schemas reject accessors and extra fields without reading paths or exposing them', async t => {
  const f = await fixture(t); let getters = 0;
  const args = { sourcePath: f.sourcePath, outDir: f.outDir, evidenceId: f.evidenceId, caption: f.caption };
  await assert.rejects(retainScreenshot({ ...args, url: 'http://outside.invalid' }), { code: 'NBRET_SCREENSHOT' });
  await assert.rejects(retainScreenshot(Object.defineProperty({ ...args }, 'sourcePath', { enumerable: true, get() { getters++; return f.sourcePath; } })), { code: 'NBRET_SCREENSHOT' });
  await assert.rejects(readScreenshot({ outDir: f.outDir, get record() { getters++; return {}; } }), { code: 'NBRET_SCREENSHOT' });
  assert.equal(getters, 0);
  const missing = await retainScreenshot({ ...args, sourcePath: join(f.root, 'PRIVATE_MISSING_CANARY') }).catch(e => e);
  assert.equal(missing.code, 'NBRET_SCREENSHOT'); assert.doesNotMatch(missing.message, /PRIVATE_|nbret-screenshot/);
  await assert.rejects(lstat(f.outDir), { code: 'ENOENT' });
});

test('source and retained file symlinks and directory junctions are rejected', async t => {
  const f = await fixture(t), record = await retain(f);
  const realDir = join(f.root, 'real'); await mkdir(realDir);
  const linkedDir = join(f.root, 'linked');
  await symlink(realDir, linkedDir, process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(retainScreenshot({ sourcePath: f.sourcePath, outDir: linkedDir, evidenceId: f.evidenceId, caption: f.caption }), { code: 'NBRET_SCREENSHOT' });
  await assert.rejects(readScreenshot({ outDir: linkedDir, record }), { code: 'NBRET_SCREENSHOT' });
  await t.test('file symlinks when host permits creation', async sub => {
    const link = join(f.root, 'source-link.png');
    try { await symlink(f.sourcePath, link, 'file'); } catch (error) { if (['EPERM', 'EACCES'].includes(error.code)) { sub.skip('Host does not permit file symlink creation'); return; } throw error; }
    await assert.rejects(retainScreenshot({ sourcePath: link, outDir: f.outDir, evidenceId: f.evidenceId, caption: f.caption }), { code: 'NBRET_SCREENSHOT' });
    const file = join(f.outDir, record.artifactId + '.png'); await rm(file); await symlink(f.sourcePath, file, 'file');
    await assert.rejects(readScreenshot({ outDir: f.outDir, record }), { code: 'NBRET_SCREENSHOT' });
  });
});
