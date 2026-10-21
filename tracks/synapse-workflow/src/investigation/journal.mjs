import { createHash, randomUUID } from 'node:crypto';
import { mkdir, lstat, readdir, open, link, unlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { outputDirectory } from './output-path.mjs';

// Trusted local operator storage, not a security boundary against this account or
// an administrator. Hashes detect inconsistent bytes, not a rewritten whole chain.
// Exclusive locks are never stolen. A crash can leave .lock/.pending-* behind:
// preserve them and have an operator establish quiescence and inspect all records
// before recovery. No automatic truncation, deletion or power-loss guarantee.
// A failure after publication can still leave a committed event: inspect the
// actual head before retrying. Detecting tail rollback needs a retained external
// head; a valid shorter chain is otherwise indistinguishable from an old state.
// Readers acquire the writer lock and therefore require directory write access.
const MAX_RECORD = 1024 * 1024;
const MAX_EVENTS = 10000;
const MAX_TOTAL = 64 * 1024 * 1024;
const filename = seq => `${String(seq).padStart(10, '0')}.json`;
// Only fixed internal messages enter this error class; never include payload or
// JSON parser excerpts. CLI callers may safely surface this marker's message.
const fail = message => {
  const error = new Error(`Journal: ${message}`);
  error.code = 'NBRET_JOURNAL';
  throw error;
};

function normalized(value, depth = 0, seen = new Set(), count = { n: 0 }) {
  if (++count.n > 100000 || depth > 40) fail('JSON structure exceeds budget');
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)) return value;
  if (!value || typeof value !== 'object' || seen.has(value)) fail('plain serializable JSON required');
  const array = Array.isArray(value);
  if (!array && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail('plain JSON objects required');
  if (Object.getOwnPropertySymbols(value).length) fail('symbol keys are not JSON');
  const keys = Object.keys(value);
  const all = Object.getOwnPropertyNames(value).filter(k => !(array && k === 'length'));
  if (all.length !== keys.length) fail('non-enumerable properties are not JSON');
  if (array && (keys.length !== value.length || keys.some((k, i) => k !== String(i)))) fail('dense JSON arrays required');
  seen.add(value);
  const entries = (array ? keys : keys.sort()).map(k => {
    const d = Object.getOwnPropertyDescriptor(value, k);
    if (!d || !Object.hasOwn(d, 'value')) fail('accessor properties are not JSON');
    return [k, normalized(d.value, depth + 1, seen, count)];
  });
  seen.delete(value);
  return array ? entries.map(([, v]) => v) : Object.fromEntries(entries);
}

function encode(value) {
  const bytes = JSON.stringify(normalized(value));
  if (Buffer.byteLength(bytes) > MAX_RECORD) fail('record exceeds byte budget');
  return bytes;
}
const hash = value => createHash('sha256').update(encode(value)).digest('hex');
function object(value, name) {
  const copy = JSON.parse(encode(value));
  if (!copy || typeof copy !== 'object' || Array.isArray(copy)) fail(`${name} must be a JSON object`);
  return copy;
}
function eventObject(value) {
  const event = object(value, 'event');
  if (typeof event.id !== 'string' || !event.id.trim() || event.id.length > 200) fail('bounded event id required');
  return event;
}
function keysEqual(value, keys) {
  return Object.keys(value).sort().join(',') === [...keys].sort().join(',');
}
async function regular(path) {
  const info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink()) fail('regular files only; symlink rejected');
  if (info.size > MAX_RECORD) fail('record exceeds byte budget');
  return info;
}
async function readRecord(path) {
  await regular(path);
  const file = await open(path, 'r');
  try {
    if (!(await file.stat()).isFile()) fail('regular file required');
    const buffer = Buffer.alloc(MAX_RECORD + 1);
    let size = 0;
    while (size < buffer.length) {
      const { bytesRead } = await file.read(buffer, size, buffer.length - size, null);
      if (!bytesRead) break;
      size += bytesRead;
    }
    if (size > MAX_RECORD) fail('record exceeds byte budget');
    const raw = buffer.subarray(0, size).toString('utf8');
    let data;
    try { data = JSON.parse(raw); } catch { fail('malformed or truncated committed JSON; operator inspection required'); }
    // Canonical bytes prevent duplicate keys, alternate encodings and silent edits.
    // Compare bytes, not decoded strings: invalid UTF-8 can decode to the same
    // U+FFFD that was already present in valid original evidence.
    if (!Buffer.from(encode(data), 'utf8').equals(buffer.subarray(0, size))) fail('committed record is not canonical or has changed');
    return { data, size };
  } finally { await file.close(); }
}
async function directoryCheck(directory) {
  const info = await lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink()) fail('journal directory must not be a symlink');
}
async function readUnlocked(directory, ownLock = false) {
  await directoryCheck(directory);
  const names = await readdir(directory);
  if (!ownLock && names.includes('.lock')) fail('journal locked; interrupted writers require operator inspection');
  for (const name of names) {
    if (name === '.lock' && ownLock) continue;
    if (name !== 'manifest.json' && !/^[0-9]{10}\.json$/.test(name)) fail('unknown or pending file; operator inspection required');
  }
  if (!names.includes('manifest.json')) fail('manifest missing');
  const { data: record, size } = await readRecord(join(directory, 'manifest.json'));
  if (!keysEqual(record, ['schemaVersion', 'manifest', 'hash']) || record.schemaVersion !== 1) fail('invalid manifest envelope');
  const manifest = object(record.manifest, 'manifest');
  let head = hash({ schemaVersion: 1, manifest });
  if (record.hash !== head) fail('manifest hash mismatch');
  const files = names.filter(n => /^[0-9]{10}\.json$/.test(n)).sort();
  if (files.length > MAX_EVENTS) fail('event count exceeds budget');
  const events = [], ids = new Set();
  let total = size;
  for (const [index, name] of files.entries()) {
    const seq = index + 1;
    if (name !== filename(seq)) fail('event sequence gap or invalid name');
    const { data: envelope, size: bytes } = await readRecord(join(directory, name));
    total += bytes;
    if (total > MAX_TOTAL) fail('journal exceeds total byte budget');
    if (!keysEqual(envelope, ['schemaVersion', 'seq', 'previousHash', 'hash', 'event']) || envelope.schemaVersion !== 1 || envelope.seq !== seq || envelope.previousHash !== head) fail('invalid event chain');
    const event = eventObject(envelope.event);
    const expected = hash({ schemaVersion: 1, seq, previousHash: head, event });
    if (expected !== envelope.hash || ids.has(event.id)) fail('event hash mismatch or duplicate id');
    head = expected; ids.add(event.id); events.push(event);
  }
  return { manifest, events, revision: events.length, head };
}

async function syncDirectory(directory) {
  let handle;
  try { handle = await open(directory, 'r'); await handle.sync(); }
  catch (error) {
    // Windows commonly denies directory handles/fsync. File bytes are synced,
    // but directory-entry persistence across power loss is unproven there.
    if (!['EINVAL', 'EPERM', 'EACCES', 'EISDIR', 'ENOTSUP', 'EBADF'].includes(error.code)) throw error;
  } finally { await handle?.close(); }
}
async function publish(directory, name, value) {
  const bytes = encode(value), temporary = join(directory, `.pending-${randomUUID()}`);
  const file = await open(temporary, 'wx');
  try { await file.writeFile(bytes); await file.sync(); }
  finally { await file.close(); }
  // Hard-link publication is atomic and refuses an existing destination. No
  // rename fallback: unsupported filesystems fail closed, retaining the temp.
  await link(temporary, join(directory, name));
  await syncDirectory(directory);
  await unlink(temporary);
  await syncDirectory(directory);
}
async function locked(directory, action) {
  await directoryCheck(directory);
  let lock;
  try { lock = await open(join(directory, '.lock'), 'wx'); }
  catch (error) { if (error.code === 'EEXIST') fail('journal locked; do not steal stale locks'); throw error; }
  try { await lock.writeFile('owned writer lock\n'); await lock.sync(); return await action(); }
  finally { await lock.close(); await unlink(join(directory, '.lock')); }
}

export async function createJournal(directory, value) {
  const manifest = object(value, 'manifest'), root = await outputDirectory(directory);
  await mkdir(root, { recursive: false });
  return locked(root, async () => {
    const head = hash({ schemaVersion: 1, manifest });
    await publish(root, 'manifest.json', { schemaVersion: 1, manifest, hash: head });
    return readUnlocked(root, true);
  });
}

export async function readJournal(directory) {
  // Cooperative readers take the same lock to avoid mixed-generation snapshots.
  return locked(resolve(directory), () => readUnlocked(resolve(directory), true));
}

export async function appendEvent(directory, value, { expectedRevision, expectedHead, validate } = {}) {
  const event = eventObject(value), root = resolve(directory);
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || typeof expectedHead !== 'string' || !/^[a-f0-9]{64}$/.test(expectedHead)) fail('expected revision and head required');
  if (validate !== undefined && typeof validate !== 'function') fail('validate must be synchronous function');
  return locked(root, async () => {
    const snapshot = await readUnlocked(root, true);
    if (snapshot.revision !== expectedRevision || snapshot.head !== expectedHead) fail('stale revision or head');
    const duplicate = snapshot.events.find(e => e.id === event.id);
    if (duplicate) {
      if (encode(duplicate) !== encode(event)) fail('conflicting duplicate event id');
      return snapshot; // Idempotence requires current CAS, never bypasses stale CAS.
    }
    if (snapshot.revision >= MAX_EVENTS) fail('event count exceeds budget');
    if (validate) {
      const result = validate(structuredClone(snapshot), structuredClone(event));
      if (result && typeof result.then === 'function') {
        Promise.resolve(result).catch(() => {});
        fail('validate must be synchronous');
      }
    }
    const content = { schemaVersion: 1, seq: snapshot.revision + 1, previousHash: snapshot.head, event };
    const envelope = { ...content, hash: hash(content) };
    // Preflight aggregate bound before publishing, including manifest/envelopes.
    let total = Buffer.byteLength(encode(envelope));
    for (const name of (await readdir(root)).filter(n => n.endsWith('.json'))) total += (await regular(join(root, name))).size;
    if (total > MAX_TOTAL) fail('journal exceeds total byte budget');
    await publish(root, filename(content.seq), envelope);
    return { manifest: snapshot.manifest, events: [...snapshot.events, event], revision: content.seq, head: envelope.hash };
  });
}
