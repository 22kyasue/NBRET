import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import http from 'node:http';
import { startWorkbenchServer } from '../src/practice/workbench-server.mjs';

const source = resolve(dirname(fileURLToPath(import.meta.url)), '../src/practice');
function cli(root, name, args, nodeArgs = []) {
  return new Promise(resolveResult => execFile(process.execPath, [...nodeArgs, join(source, name), ...args],
    { cwd: root, windowsHide: true, timeout: 12000, maxBuffer: 2 * 1024 * 1024 },
    (error, stdout, stderr) => resolveResult({ code: error?.code ?? 0, stdout, stderr })));
}
async function temporary(t) {
  const root = await mkdtemp(join(tmpdir(), 'nbret-session-cli-'));
  t.after(async () => {
    assert.equal(dirname(root), resolve(tmpdir()));
    await rm(root, { recursive: true, force: true });
  });
  return root;
}
async function listener(t, handler) {
  const server = http.createServer(handler);
  await new Promise(ok => server.listen(0, '127.0.0.1', ok));
  t.after(() => new Promise(ok => { server.close(ok); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}

test('URL-only intake is inert metadata and malformed context does not echo input', async t => {
  const root = await temporary(t); let requests = 0;
  const url = await listener(t, (_req, res) => { requests++; res.end('not called'); });
  const destination = join(root, 'intake');
  const result = await cli(root, 'intake-cli.mjs', ['--url', url, '--out', destination]);
  assert.equal(result.code, 0, result.stderr);
  const saved = JSON.parse(await readFile(join(destination, 'intake.json'), 'utf8'));
  assert.equal(saved.requestedUrl, url + '/');
  assert.match(saved.executionAuthority, /^none/);
  assert.equal(requests, 0);
  const path = join(root, 'malformed.json'), secret = 'PRIVATE_PARSE_CANARY_927';
  await writeFile(path, `${secret}{invalid-json`);
  const invalid = await cli(root, 'intake-cli.mjs', ['--url', url, '--context', path, '--out', join(root, 'bad-intake')]);
  assert.equal(invalid.code, 1);
  assert.doesNotMatch(invalid.stderr + invalid.stdout, new RegExp(secret));
  assert.match(invalid.stderr, /JSON/i);
  assert.equal(requests, 0);
  const ancestor = join(root, 'ancestor'); await mkdir(ancestor);
  await writeFile(join(ancestor, 'manifest.json'), secret + '{invalid');
  const badAncestor = await cli(root, 'intake-cli.mjs', ['--url', url, '--out', join(ancestor, 'intake')]);
  assert.equal(badAncestor.code, 1);
  assert.doesNotMatch(badAncestor.stderr + badAncestor.stdout, new RegExp(secret));
  assert.equal(requests, 0);
});

test('session CLI restricts endpoint form and requires an inert workbench handshake before writes', async t => {
  const root = await temporary(t), seen = [];
  const url = await listener(t, (req, res) => { seen.push({ method: req.method, path: req.url }); res.setHeader('content-type', 'application/json'); res.end('{}'); });
  for (const endpoint of [url.replace('127.0.0.1', 'localhost'), url + '/nested', url + '?secret=value', url.replace('http:', 'https:'), url.replace('http://', 'http://user:password@')]) {
    const result = await cli(root, 'session-cli.mjs', ['--endpoint', endpoint, 'step']);
    assert.equal(result.code, 1); assert.match(result.stderr, /exact local workbench origin/);
  }
  assert.deepEqual(seen, []);
  const wrong = await cli(root, 'session-cli.mjs', ['--endpoint', url, 'step']);
  assert.equal(wrong.code, 1); assert.match(wrong.stderr, /not a compatible/);
  assert.deepEqual(seen, [{ method: 'GET', path: '/api/state' }]);
});

test('CLI roundtrip records one action, sanitizes malformed command and reads stopped records offline', async t => {
  const root = await temporary(t), server = await startWorkbenchServer({ outDir: join(root, 'session') });
  t.after(() => server.close());
  const args = ['--endpoint', server.url];
  const state = await cli(root, 'session-cli.mjs', [...args, 'state']);
  assert.equal(state.code, 0, state.stderr);
  const initial = JSON.parse(state.stdout); assert.ok(!Object.hasOwn(initial, 'nonce'));
  assert.equal(initial.targetRequestCount, 0);
  const stepped = await cli(root, 'session-cli.mjs', [...args, 'step']);
  assert.equal(stepped.code, 0, stepped.stderr);
  const active = JSON.parse(stepped.stdout);
  assert.equal(active.decisions.length, 1); assert.equal(active.observations.length, 1);
  const priorCount = server.state().targetRequestCount;
  const path = join(root, 'command.json'), secret = 'PRIVATE_COMMAND_CANARY_314';
  await writeFile(path, secret + '{invalid');
  const malformed = await cli(root, 'session-cli.mjs', [...args, 'step', '--file', path]);
  assert.equal(malformed.code, 1); assert.doesNotMatch(malformed.stderr + malformed.stdout, new RegExp(secret));
  assert.equal(server.state().targetRequestCount, priorCount);
  const stopped = await cli(root, 'session-cli.mjs', [...args, 'stop']);
  assert.equal(stopped.code, 0, stopped.stderr); assert.equal(JSON.parse(stopped.stdout).stopped, true);
  const directory = server.session.outDir; await server.close();
  const guard = join(root, 'offline-guard.mjs');
  await writeFile(guard, `import http from 'node:http'; import https from 'node:https';
    const reject=()=>{throw new Error('Offline record read attempted network execution')};
    http.request=reject; https.request=reject; http.Server.prototype.listen=reject; globalThis.fetch=reject;`);
  for (const command of ['state', 'brief']) {
    const offline = await cli(root, 'session-cli.mjs', ['--records', directory, command], ['--import', pathToFileURL(guard).href]);
    assert.equal(offline.code, 0, offline.stderr); assert.ok(JSON.parse(offline.stdout));
  }
  const forbidden = await cli(root, 'session-cli.mjs', ['--records', directory, 'step']);
  assert.equal(forbidden.code, 1); assert.match(forbidden.stderr, /only state or brief/);
  assert.equal(server.state().targetRequestCount, priorCount);
});
