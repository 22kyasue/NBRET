import { readFile, writeFile, mkdir, link, unlink } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

const digest = data => createHash('sha256').update(data).digest('hex');

export async function writeCapturedAsset(file, text, store) {
  await mkdir(dirname(file), { recursive: true });
  if (!store) { await writeFile(file, text, { flag: 'wx' }); return { cacheHit: false, linked: false, bytes: Buffer.byteLength(text) }; }
  const root = resolve(store), sha256 = digest(text), cache = join(root, sha256);
  await mkdir(root, { recursive: true });
  let cacheHit = false;
  try {
    const existing = await readFile(cache);
    if (digest(existing) !== sha256) throw new Error('Asset cache integrity validation failed');
    cacheHit = true;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const temporary = join(root, `${sha256}-${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, text, { flag: 'wx' });
      try { await link(temporary, cache); }
      catch (e) {
        if (e.code !== 'EEXIST') throw e;
        if (digest(await readFile(cache)) !== sha256) throw new Error('Asset cache integrity validation failed');
        cacheHit = true;
      }
    } finally { await unlink(temporary).catch(() => {}); }
  }
  let linked = true;
  try { await link(cache, file); }
  catch (error) {
    if (!['EXDEV', 'EPERM', 'ENOTSUP'].includes(error.code)) throw error;
    linked = false; await writeFile(file, text, { flag: 'wx' });
  }
  return { cacheHit, linked, bytes: Buffer.byteLength(text), sha256 };
}
