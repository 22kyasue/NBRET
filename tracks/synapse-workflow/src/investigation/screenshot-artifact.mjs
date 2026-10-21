import { createHash } from 'node:crypto';
import { lstat, open, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { outputDirectory } from './output-path.mjs';

// Local operator storage only. Hashes bind bytes, not origin, redaction, identity
// or effects. No capture, image execution/decoding, URL fetch or evidence admission.
// Directory replacement by this unrestricted account is not isolated here.
const MAX_BYTES = 4 * 1024 * 1024, MAX_PIXELS = 16000000;
const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
function fail(message) { throw Object.assign(new Error(`Screenshot: ${message}`), { code: 'NBRET_SCREENSHOT' }); }
function fields(value, keys) {
  if (!value || typeof value !== 'object' || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail('plain data required');
  const names = Reflect.ownKeys(value), copy = {};
  if (names.length !== keys.length) fail('exact fields required');
  for (const key of names) {
    const d = Object.getOwnPropertyDescriptor(value, key);
    if (!keys.includes(key) || !d.enumerable || !Object.hasOwn(d, 'value')) fail('inert data fields required');
    copy[key] = d.value;
  }
  return copy;
}
function text(value, max) { if (typeof value !== 'string' || !value.trim() || value.length > max) fail('bounded text required'); }
function binding(evidenceId, caption) { text(evidenceId, 200); text(caption, 2000); }
const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  return crc >>> 0;
});
function crc32(bytes) { let crc = 0xffffffff; for (const byte of bytes) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 255]; return (crc ^ 0xffffffff) >>> 0; }
function png(bytes) {
  if (bytes.length > MAX_BYTES || bytes.length < 57 || !bytes.subarray(0, 8).equals(SIGNATURE)) fail('bounded PNG required');
  let offset = 8, chunks = 0, imageBytes = 0, ended = false;
  while (offset < bytes.length) {
    if (++chunks > 4096 || bytes.length - offset < 12) fail('invalid PNG structure');
    const size = bytes.readUInt32BE(offset), end = offset + 12 + size;
    if (end > bytes.length) fail('invalid PNG structure');
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    if (!/^[A-Za-z]{4}$/.test(type) || crc32(bytes.subarray(offset + 4, end - 4)) !== bytes.readUInt32BE(end - 4)) fail('invalid PNG checksum or chunk');
    if (chunks === 1) {
      if (type !== 'IHDR' || size !== 13) fail('PNG header required');
      const width = bytes.readUInt32BE(offset + 8), height = bytes.readUInt32BE(offset + 12);
      if (!width || !height || width * height > MAX_PIXELS) fail('PNG dimensions exceed bounds');
      const depth = bytes[offset + 16], color = bytes[offset + 17];
      const depths = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };
      if (!depths[color]?.includes(depth) || bytes[offset + 18] !== 0 || bytes[offset + 19] !== 0 || bytes[offset + 20] > 1) fail('invalid PNG header');
    } else if (type === 'IHDR') fail('duplicate PNG header');
    if (type === 'IDAT') imageBytes += size;
    if (type === 'IEND') { if (size || end !== bytes.length || !imageBytes) fail('invalid PNG end'); ended = true; }
    offset = end;
  }
  if (!ended) fail('incomplete PNG');
}
async function readRegular(path) {
  const before = await lstat(path);
  if (!before.isFile() || before.isSymbolicLink() || before.size > MAX_BYTES) fail('bounded regular file required');
  const file = await open(path, 'r');
  try {
    const actual = await file.stat();
    if (!actual.isFile() || actual.size > MAX_BYTES || actual.ino !== before.ino || actual.dev !== before.dev) fail('file changed during opening');
    const bytes = Buffer.alloc(MAX_BYTES + 1); let size = 0;
    while (size < bytes.length) { const part = await file.read(bytes, size, bytes.length - size, null); if (!part.bytesRead) break; size += part.bytesRead; }
    const after = await file.stat();
    if (size > MAX_BYTES || size !== actual.size || after.size !== actual.size || after.mtimeMs !== actual.mtimeMs) fail('file changed or exceeds bounds');
    const result = bytes.subarray(0, size); png(result); return result;
  } finally { await file.close(); }
}
async function directory(path, create) {
  text(path, 4096);
  const destination = await outputDirectory(path);
  if (create) try { await mkdir(destination, { mode: 0o700 }); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  const info = await lstat(destination);
  if (!info.isDirectory() || info.isSymbolicLink()) fail('ordinary artifact directory required');
  return destination;
}
function artifact(value) {
  const record = fields(value, ['artifactId', 'sha256', 'mediaType', 'bytes', 'evidenceId', 'caption']);
  binding(record.evidenceId, record.caption);
  if (typeof record.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(record.sha256) || record.artifactId !== `png-${record.sha256}` || record.mediaType !== 'image/png' || !Number.isSafeInteger(record.bytes) || record.bytes < 57 || record.bytes > MAX_BYTES) fail('invalid artifact record');
  return record;
}
export async function retainScreenshot(input) {
  try {
    const { sourcePath, outDir, evidenceId, caption } = fields(input, ['sourcePath', 'outDir', 'evidenceId', 'caption']);
    text(sourcePath, 4096); text(outDir, 4096); binding(evidenceId, caption);
    const bytes = await readRegular(sourcePath), sha256 = digest(bytes), artifactId = `png-${sha256}`;
    const destination = await directory(outDir, true), file = await open(join(destination, artifactId + '.png'), 'wx', 0o600);
    try { await file.writeFile(bytes); await file.sync(); } finally { await file.close(); }
    return { artifactId, sha256, mediaType: 'image/png', bytes: bytes.length, evidenceId, caption };
  } catch (error) { if (error?.code === 'NBRET_SCREENSHOT') throw error; fail('retention failed; source and destination must be valid and artifact must be new'); }
}
export async function readScreenshot(input) {
  try {
    const { outDir, record: value } = fields(input, ['outDir', 'record']), record = artifact(value);
    const root = await directory(outDir, false), bytes = await readRegular(join(root, record.artifactId + '.png'));
    if (bytes.length !== record.bytes || digest(bytes) !== record.sha256) fail('artifact digest or size mismatch');
    return bytes;
  } catch (error) { if (error?.code === 'NBRET_SCREENSHOT') throw error; fail('artifact unavailable'); }
}
