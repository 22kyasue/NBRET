import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, lstat, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { openLabSession, runLabSuite } from '../src/lab/run.mjs';
import { createJournal, readJournal } from '../src/investigation/journal.mjs';

async function temporary(t) {
  const parent = await mkdtemp(join(tmpdir(), 'synapse-output-boundary-'));
  t.after(async () => {
    assert.equal(dirname(resolve(parent)), resolve(tmpdir()));
    await rm(parent, { recursive: true, force: true });
  });
  return parent;
}
test('output guard rejects protected track and root source before creating parents or starting a target', async () => {
  const track = fileURLToPath(new URL('../', import.meta.url)), project = fileURLToPath(new URL('../../../', import.meta.url));
  let starts = 0;
  for (const source of [join(track, 'src'), join(project, 'src'), join(project, 'docs')]) {
    const missing = join(source, `lab-output-guard-${randomUUID()}`);
    await assert.rejects(openLabSession({ outDir: join(missing, 'run'), targetFactory: async () => { starts++; throw Error('must not start'); } }), /outside source/);
    await assert.rejects(lstat(missing), { code: 'ENOENT' });
  }
  assert.equal(starts, 0);
});
test('suite output cannot create folders inside an existing journal or alter its head', async t => {
  const parent = await temporary(t), journal = join(parent, 'journal');
  const before = await createJournal(journal, { kind: 'output-boundary-control' });
  await assert.rejects(runLabSuite({ outDir: join(journal, 'nested', 'suite') }), /inside a journal/);
  await assert.rejects(lstat(join(journal, 'nested')), { code: 'ENOENT' });
  const after = await readJournal(journal);
  assert.equal(after.head, before.head); assert.equal(after.revision, 0);
});
test('existing output directory is rejected without overwriting retained files', async t => {
  const parent = await temporary(t), marker = join(parent, 'keep.txt');
  await writeFile(marker, 'retained earlier evidence');
  await assert.rejects(runLabSuite({ outDir: parent }), { code: 'EEXIST' });
  assert.equal(await readFile(marker, 'utf8'), 'retained earlier evidence');
});
