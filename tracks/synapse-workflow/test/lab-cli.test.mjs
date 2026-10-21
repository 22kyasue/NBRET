import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../', import.meta.url));
function cli(args, input = '') {
  return new Promise((resolve, reject) => {
    const child = execFile(process.execPath, ['src/lab/cli.mjs', ...args], {
      cwd, windowsHide: true, timeout: 25000, maxBuffer: 8 * 1024 * 1024,
    }, (error, stdout, stderr) => {
      if (error) { reject(Object.assign(error, { stdout, stderr })); return; }
      resolve({ stdout, stderr });
    });
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}
const jsonLines = stdout => stdout.trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
function cleanup(value) {
  assert.equal(value.status, 'observed-closed');
  assert.equal(value.transport.active, 0);
  assert.equal(value.transport.stopped, true);
  assert.deepEqual(value.errors, []);
  assert.equal(value.listenerChecks.length, 3);
  assert.ok(value.listenerChecks.every(v => v.closed && v.observation === 'ECONNREFUSED'));
}

test('CLI help describes supported local commands without starting a session', { timeout: 30000 }, async () => {
  const { stdout, stderr } = await cli(['--help']);
  assert.equal(stderr, '');
  for (const command of ['suite', 'rehearse', 'session', 'inspect']) assert.ok(stdout.includes(`cli.mjs ${command}`));
  assert.ok(stdout.includes('not an OS sandbox'));
});

test('CLI suite retains both guided controls and inspect is records-only', { timeout: 60000 }, async t => {
  const parent = await mkdtemp(join(tmpdir(), 'synapse-cli-suite-'));
  t.diagnostic(`Retained CLI evidence: ${parent}`);
  const out = join(parent, 'suite');
  const { stdout, stderr } = await cli(['suite', '--out', out]);
  assert.equal(stderr, '');
  const [suite] = jsonLines(stdout);
  assert.equal(suite.status, 'completed-guided-control-suite');
  assert.equal(suite.secure.evaluation.status, 'not-demonstrated');
  assert.equal(suite.gap.evaluation.status, 'demonstrated');
  assert.equal(suite.reset.freshEmptyBaselines, true);
  assert.equal(suite.reset.differentGeneration, true);
  for (const run of [suite.secure, suite.gap]) {
    cleanup(run.cleanup);
    const before = await readFile(run.summaryPath, 'utf8');
    const inspected = jsonLines((await cli(['inspect', '--out', run.directory])).stdout)[0];
    assert.match(inspected.authority, /records-only/);
    assert.match(inspected.authority, /historical/);
    assert.equal(inspected.summary.id, run.id);
    assert.equal(inspected.summary.generation, run.generation);
    assert.equal(await readFile(run.summaryPath, 'utf8'), before);
    cleanup(inspected.summary.cleanup);
  }
});

for (const explicitStop of [true, false]) {
  test(`CLI JSONL root/status and ${explicitStop ? 'stop' : 'EOF'} export observed cleanup`, { timeout: 30000 }, async t => {
    const parent = await mkdtemp(join(tmpdir(), 'synapse-cli-session-'));
    t.diagnostic(`Retained CLI evidence: ${parent}`);
    const commands = [
      { command: 'request', path: '/', identity: 'anonymous' },
      { command: 'status' },
      ...(explicitStop ? [{ command: 'stop' }] : []),
    ];
    const { stdout, stderr } = await cli(['session', '--out', join(parent, 'run'), '--mode', 'secure'], commands.map(v => JSON.stringify(v)).join('\n') + '\n');
    assert.equal(stderr, '');
    const lines = jsonLines(stdout);
    const ready = lines.find(v => v.type === 'ready');
    assert.ok(ready);
    assert.equal(Object.hasOwn(ready, 'mailboxToken'), false);
    const observation = lines.find(v => v.type === 'observation');
    assert.equal(observation.receipt.complete, true);
    assert.equal(observation.receipt.response.status, 200);
    assert.equal(observation.receipt.identity, 'anonymous');
    const status = lines.find(v => v.type === 'status');
    assert.equal(status.receiptCount, 1);
    assert.equal(status.closed, false);
    assert.equal(Object.hasOwn(status, 'mailboxToken'), false);
    const stopped = lines.filter(v => v.type === 'stopped');
    assert.equal(stopped.length, 1);
    cleanup(stopped[0].cleanup);
    const summary = JSON.parse(await readFile(stopped[0].summaryPath, 'utf8'));
    assert.equal(summary.closed, true);
    cleanup(summary.cleanup);
    assert.equal(summary.reportPath, stopped[0].reportPath);
    assert.match(await readFile(summary.reportPath, 'utf8'), /Synapse/);
  });
}
