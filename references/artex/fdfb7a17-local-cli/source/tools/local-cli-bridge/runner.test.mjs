import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { createCliRunner, subscriptionEnvironment } from './runner.mjs';

function harness(reply, exitCode = 0) {
  const calls = [];
  const spawn = (command, args, options) => {
    const child = new EventEmitter();
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    child.stdin = new PassThrough();
    child.kill = () => { child.killed = true; child.emit('close', null); };
    calls.push({ command, args, options, child });
    if (reply !== undefined) queueMicrotask(() => {
      child.stdout.end(reply);
      child.emit('close', exitCode);
    });
    return child;
  };
  return { calls, spawn };
}

const request = {
  provider: 'claude', model: 'sonnet', prompt: 'Return ok',
  schema: { type: 'object', properties: { status: { type: 'string' } }, required: ['status'] },
};

test('subscription child environment removes provider keys and preserves auth homes', () => {
  const env = subscriptionEnvironment({
    HOME: '/home/me', CODEX_HOME: '/codex', PATH: 'bin',
    OPENAI_API_KEY: 'secret', ANTHROPIC_API_KEY: 'secret',
    ANTHROPIC_BASE_URL: 'remote', CLAUDE_CODE_USE_BEDROCK: '1',
    AWS_ACCESS_KEY_ID: 'secret', NO_COLOR: '1', FORCE_COLOR: '1', TERM: 'bad',
  });
  assert.equal(env.HOME, '/home/me');
  assert.equal(env.CODEX_HOME, '/codex');
  for (const key of ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'ANTHROPIC_BASE_URL', 'CLAUDE_CODE_USE_BEDROCK', 'AWS_ACCESS_KEY_ID', 'NO_COLOR', 'FORCE_COLOR']) assert.equal(env[key], undefined);
  assert.equal(env.TERM, undefined);
});

test('Claude uses explicit empty tools and returns structured result with normalized usage', async () => {
  const h = harness(JSON.stringify({ type: 'result', subtype: 'success', is_error: false,
    structured_output: { status: 'ok' }, usage: { input_tokens: 2, cache_read_input_tokens: 3, cache_creation_input_tokens: 4, output_tokens: 5 } }));
  const result = await createCliRunner({ spawn: h.spawn })(request);
  assert.deepEqual(JSON.parse(result.output), { status: 'ok' });
  assert.deepEqual(result.usage, { prompt_tokens: 9, completion_tokens: 5, total_tokens: 14 });
  const { args, options } = h.calls[0];
  assert.equal(args[args.indexOf('--tools') + 1], '');
  for (const flag of ['--safe-mode', '--strict-mcp-config', '--no-session-persistence']) assert.ok(args.includes(flag));
  assert.equal(options.shell, false);
  assert.equal(options.windowsHide, true);
});

test('CLI error and malformed output fail closed without stderr leakage', async () => {
  await assert.rejects(createCliRunner({ spawn: harness('secret failure', 1).spawn })(request), /exited/);
  await assert.rejects(createCliRunner({ spawn: harness('{}').spawn })(request), /structured/);
});

test('output cap and abort kill only the spawned child', async () => {
  const h = harness(undefined);
  const controller = new AbortController();
  const promise = createCliRunner({ spawn: h.spawn })({ ...request, signal: controller.signal });
  controller.abort();
  await assert.rejects(promise, /aborted/);
  assert.equal(h.calls[0].child.killed, true);
  const capped = harness('x'.repeat(30));
  await assert.rejects(createCliRunner({ spawn: capped.spawn })({ ...request, maxOutputBytes: 10 }), /limit/);
  assert.equal(capped.calls[0].child.killed, true);
});

test('Codex isolates cwd, uses read-only and parses JSONL; native tool events reject', async () => {
  const h = harness('{"type":"item.completed","item":{"type":"agent_message","text":"{\\"status\\":\\"ok\\"}"}}\n{"type":"turn.completed","usage":{"input_tokens":8,"output_tokens":2}}\n');
  const result = await createCliRunner({ spawn: h.spawn })({ ...request, provider: 'codex', model: 'local-codex' });
  assert.deepEqual(JSON.parse(result.output), { status: 'ok' });
  assert.ok(h.calls[0].args.includes('read-only'));
  assert.equal(result.usage.total_tokens, 10);
  const bad = harness('{"type":"item.started","item":{"type":"command_execution","command":"echo hi"}}\n');
  await assert.rejects(createCliRunner({ spawn: bad.spawn })({ ...request, provider: 'codex' }), /native tool/);
});
