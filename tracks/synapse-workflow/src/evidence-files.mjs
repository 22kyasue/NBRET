import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';

export async function readWithin(root, file, maxBytes = 64 * 1024 * 1024) {
  const base = await realpath(root), path = await realpath(resolve(base, file));
  const rel = relative(base, path);
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) throw new Error('Evidence path outside run');
  if ((await stat(path)).size > maxBytes) throw new Error('Evidence file exceeds byte budget');
  const bytes = await readFile(path);
  if (bytes.length > maxBytes) throw new Error('Evidence file exceeds byte budget');
  return bytes;
}

export async function readJsonWithin(root, file, maxBytes) {
  return JSON.parse((await readWithin(root, file, maxBytes)).toString('utf8'));
}

export async function optionalJson(root, file, maxBytes) {
  try { return { data: await readJsonWithin(root, file, maxBytes), file }; }
  catch (e) {
    if (e.code === 'ENOENT') return { missing: true, file };
    return { invalid: true, file };
  }
}
