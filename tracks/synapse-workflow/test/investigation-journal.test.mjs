import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile, rename, symlink, mkdir, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { createJournal, readJournal, appendEvent } from '../src/investigation/journal.mjs';

async function fixture(t) {
  const owned = await mkdtemp(join(tmpdir(), 'nbret-journal-'));
  t.after(() => rm(owned, { recursive: true, force: true }));
  return { owned, root: join(owned, 'journal') };
}
const manifest = { schemaVersion: 1, id: 'local-fixture', target: 'https://inert.invalid', mode: 'offline' };
const event = (id = 'e1') => ({ id, at: '2026-10-18T00:00:00Z', actor: { id: 'author', role: 'operator' }, type: 'note', payload: { text: 'inert local data' } });
const cas = snapshot => ({ expectedRevision: snapshot.revision, expectedHead: snapshot.head });

test('journal round trip binds manifest and ordered event bytes across reopen', async t => {
  const { root } = await fixture(t);
  const start = await createJournal(root, manifest);
  assert.equal(start.revision, 0); assert.match(start.head, /^[a-f0-9]{64}$/);
  const first = await appendEvent(root, event(), cas(start));
  const second = await appendEvent(root, event('e2'), cas(first));
  assert.equal(second.revision, 2); assert.notEqual(second.head, start.head);
  assert.deepEqual(await readJournal(root), second);
  const stored = JSON.parse(await readFile(join(root, '0000000001.json'), 'utf8'));
  assert.equal(stored.previousHash, start.head); assert.equal(stored.hash, first.head);
  await assert.rejects(createJournal(root, manifest), { code: 'EEXIST' });
});

test('CAS, duplicate semantics and concurrent writers preserve one ordered commit', async t => {
  const { root } = await fixture(t);
  const start = await createJournal(root, manifest);
  const attempts = await Promise.allSettled([appendEvent(root, event(), cas(start)), appendEvent(root, event('other'), cas(start))]);
  assert.equal(attempts.filter(x => x.status === 'fulfilled').length, 1);
  const current = await readJournal(root);
  assert.equal(current.revision, 1);
  await assert.rejects(appendEvent(root, event('later'), cas(start)), /stale/);
  await assert.rejects(appendEvent(root, event('later'), { ...cas(current), expectedHead: '0'.repeat(64) }), /stale/);
  await assert.rejects(appendEvent(root, event('later')), /expected revision/);
  assert.deepEqual(await appendEvent(root, current.events[0], cas(current)), current);
  await assert.rejects(appendEvent(root, { ...current.events[0], payload: { changed: true } }, cas(current)), /conflicting duplicate/);
  assert.deepEqual(await readJournal(root), current);
});

test('semantic validator runs under lock on copied committed state; rejects async and errors without commit', async t => {
  const { root } = await fixture(t);
  const start = await createJournal(root, manifest);
  let calls = 0;
  await assert.rejects(appendEvent(root, event(), { ...cas(start), validate(snapshot, candidate) {
    calls++; assert.deepEqual(snapshot, start); assert.equal(candidate.id, 'e1');
    snapshot.manifest.id = 'mutation'; throw new Error('domain rejection');
  } }), /domain rejection/);
  await assert.rejects(appendEvent(root, event(), { ...cas(start), validate: async () => {} }), /synchronous/);
  assert.equal(calls, 1); assert.deepEqual(await readJournal(root), start);
  const next = await appendEvent(root, event(), { ...cas(start), validate(s) { assert.equal(s.revision, 0); } });
  assert.equal(next.revision, 1);
});

test('corrupt, truncated, missing and alternate-byte committed entries fail closed', async t => {
  for (const mode of ['changed', 'truncated', 'gap', 'noncanonical', 'manifest']) {
    const { root } = await fixture(t);
    const start = await createJournal(root, manifest);
    await appendEvent(root, event(), cas(start));
    const path = join(root, '0000000001.json');
    const bytes = await readFile(path, 'utf8');
    if (mode === 'changed') await writeFile(path, bytes.replace('inert local data', 'changed evidence'));
    if (mode === 'truncated') await writeFile(path, bytes.slice(0, -8));
    if (mode === 'gap') await rename(path, join(root, '0000000002.json'));
    if (mode === 'noncanonical') await writeFile(path, bytes + '\n');
    if (mode === 'manifest') {
      const m = join(root, 'manifest.json'); await writeFile(m, (await readFile(m, 'utf8')).replace('local-fixture', 'other-fixture'));
    }
    await assert.rejects(readJournal(root), /hash mismatch|malformed|sequence gap|canonical/);
    assert.ok(!(await readdir(root)).includes('.lock'), 'owned lock released on rejection');
  }
});

test('interrupted lock and pending records are preserved for explicit recovery', async t => {
  const { root } = await fixture(t);
  const start = await createJournal(root, manifest);
  await writeFile(join(root, '.lock'), 'interrupted writer');
  await assert.rejects(readJournal(root), /locked/);
  await assert.rejects(appendEvent(root, event(), cas(start)), /locked/);
  assert.equal(await readFile(join(root, '.lock'), 'utf8'), 'interrupted writer');
  // This test owns the simulated interrupted lock, not an unknown user's lock.
  await rm(join(root, '.lock'));
  await writeFile(join(root, '.pending-test'), 'partial');
  await assert.rejects(readJournal(root), /unknown or pending/);
  assert.equal(await readFile(join(root, '.pending-test'), 'utf8'), 'partial');
});

test('non-JSON values, getters, cycles, sparse arrays and oversize records are rejected', async t => {
  const { root } = await fixture(t);
  const start = await createJournal(root, manifest);
  const cycle = {}; cycle.self = cycle;
  let getterRan = false;
  const getter = {}; Object.defineProperty(getter, 'value', { enumerable: true, get() { getterRan = true; return 'no'; } });
  for (const payload of [undefined, NaN, Infinity, -0, 1n, () => {}, new Date(), cycle, [, 'sparse'], getter, { x: 'x'.repeat(1024 * 1024) }]) {
    await assert.rejects(appendEvent(root, { ...event(), payload }, cas(start)), /JSON|budget/);
  }
  assert.equal(getterRan, false);
  assert.deepEqual(await readJournal(root), start);
});

test('unexpected names, non-file entries and directory symlinks are refused', async t => {
  const { root, owned } = await fixture(t);
  await createJournal(root, manifest);
  await writeFile(join(root, 'unexpected.json'), '{}');
  await assert.rejects(readJournal(root), /unknown/);
  await rm(join(root, 'unexpected.json'));
  await mkdir(join(root, '0000000001.json'));
  await assert.rejects(readJournal(root), /regular files/);
  const alias = join(owned, 'alias');
  await symlink(root, alias, 'junction');
  await assert.rejects(readJournal(alias), /symlink/);
});

test('invalid UTF-8 cannot preserve a hash by decoding to an original replacement character', async t => {
  const { root } = await fixture(t);
  const start = await createJournal(root, manifest);
  await appendEvent(root, { ...event(), payload: { text: '\ufffd' } }, cas(start));
  const path = join(root, '0000000001.json');
  const original = await readFile(path);
  const offset = original.indexOf(Buffer.from('\ufffd'));
  assert.ok(offset > 0);
  // A single invalid byte decodes to the same replacement character as the
  // original valid UTF-8. Comparing decoded strings alone misses this change.
  const changed = Buffer.concat([original.subarray(0, offset), Buffer.from([0xff]), original.subarray(offset + 3)]);
  await writeFile(path, changed);
  await assert.rejects(readJournal(root), /canonical|UTF-8/);
});

test('public journal creation rejects enclosing journals through direct and junction paths before writing', async t => {
  const { root, owned } = await fixture(t);
  const start = await createJournal(root, manifest);
  const alias = join(owned, 'journal-parent-alias');
  await symlink(root, alias, 'junction');
  for (const parent of [root, alias]) await assert.rejects(createJournal(join(parent, 'child'), manifest), /nested inside a journal/);
  assert.deepEqual(await readdir(root), ['manifest.json']);
  assert.deepEqual(await readJournal(root), start);
});

test('terminating a writer immediately before/after publication preserves inspectable commit boundaries', async t => {
  for (const boundary of ['before-link', 'after-link']) {
    const { root } = await fixture(t);
    const start = await createJournal(root, manifest);
    // Fault injection lives only in this worker, never in the production API or
    // the parent test process. Termination bypasses the writer's JS finally.
    const worker = new Worker(`
      const { parentPort, workerData } = require('node:worker_threads');
      const fs = require('node:fs');
      const { syncBuiltinESMExports } = require('node:module');
      const original = fs.promises.link;
      parentPort.on('message', () => {});
      fs.promises.link = async (...args) => {
        if (workerData.boundary === 'after-link') await original(...args);
        parentPort.postMessage({ boundary: workerData.boundary });
        await new Promise(() => {});
      };
      syncBuiltinESMExports();
      import(workerData.module).then(j => j.appendEvent(workerData.root, workerData.event, workerData.cas))
        .then(() => parentPort.postMessage({ unexpected: 'writer passed injection' }))
        .catch(error => parentPort.postMessage({ unexpected: error.message }));
    `, { eval: true, env: {}, workerData: { root, boundary, event: event(), cas: cas(start), module: new URL('../src/investigation/journal.mjs', import.meta.url).href } });
    t.after(() => worker.terminate());
    const observed = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('writer did not reach controlled boundary')), 5000);
      worker.once('message', message => { clearTimeout(timer); resolve(message); });
      worker.once('error', error => { clearTimeout(timer); reject(error); });
      worker.once('exit', code => { clearTimeout(timer); reject(new Error(`writer exited before boundary: ${code}`)); });
    });
    assert.deepEqual(observed, { boundary });
    await worker.terminate();
    const files = await readdir(root), pending = files.filter(name => name.startsWith('.pending-'));
    assert.equal(pending.length, 1); assert.ok(files.includes('.lock'));
    assert.equal(files.includes('0000000001.json'), boundary === 'after-link');
    if (boundary === 'after-link') assert.deepEqual(await readFile(join(root, pending[0])), await readFile(join(root, '0000000001.json')));
    await assert.rejects(readJournal(root), /locked/);
    await assert.rejects(appendEvent(root, event('retry'), cas(start)), /locked/);
    assert.deepEqual(await readdir(root), files, 'normal operations preserve interrupted writer artifacts');
    // Controlled fixture recovery only: worker is known terminated and all
    // bytes inspected. Production provides no automatic unlock/recovery API.
    await rm(join(root, '.lock')); await rm(join(root, pending[0]));
    const recovered = await readJournal(root);
    assert.equal(recovered.revision, boundary === 'after-link' ? 1 : 0);
    if (boundary === 'after-link') {
      assert.deepEqual(recovered.events, [event()]);
      await assert.rejects(appendEvent(root, event(), cas(start)), /stale/);
      assert.deepEqual(await appendEvent(root, event(), cas(recovered)), recovered);
    } else assert.deepEqual(recovered, start);
  }
});
