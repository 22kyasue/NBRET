import test from 'node:test';
import assert from 'node:assert/strict';
import { createBridgeServer } from './server.mjs';
import { prepareRequest, parseDecision } from './protocol.mjs';

const token = 'a'.repeat(64);
const request = { model: 'local-codex', messages: [{ role: 'user', content: 'hello' }] };
const tool = { type: 'function', function: { name: 'lookup', parameters: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'], additionalProperties: false } } };
async function fixture(t, runner, options = {}) {
  const server = createBridgeServer({ token, runner, ...options });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
  const url = `http://127.0.0.1:${server.address().port}`;
  return (body = request, extra = {}) => fetch(`${url}/v1/chat/completions`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...extra.headers },
    body: JSON.stringify(body), signal: extra.signal,
  });
}
test('tool history preserves ordering and returned arguments obey schema', () => {
  const body = { ...request, tools: [tool], tool_choice: 'required', messages: [
    { role: 'system', content: 'system' }, ...request.messages,
    { role: 'assistant', content: null, tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'lookup', arguments: '{"key":"a"}' } }] },
    { role: 'tool', tool_call_id: 'call_1', content: 'found' },
  ] };
  const prepared = prepareRequest(body);
  assert.deepEqual(JSON.parse(prepared.prompt.split('\nREQUEST_JSON\n')[1]).messages, body.messages);
  assert.equal(parseDecision('{"content":"","tool_calls":[{"name":"lookup","arguments":"{\\"key\\":\\"b\\"}"}]}', prepared).tool_calls[0].name, 'lookup');
  for (const output of [
    '{"content":"","tool_calls":[]}',
    '{"content":"","tool_calls":[{"name":"other","arguments":"{}"}]}',
    '{"content":"","tool_calls":[{"name":"lookup","arguments":"{\\"key\\":1}"}]}',
    '{"content":"","tool_calls":[{"name":"lookup","arguments":"[]"}]}',
  ]) assert.throws(() => parseDecision(output, prepared));
});
test('reject unsupported content and tool_choice constraints', () => {
  assert.throws(() => prepareRequest({ ...request, messages: [{ role: 'user', content: [{ type: 'image_url' }] }] }));
  assert.throws(() => parseDecision('{"content":"","tool_calls":[{"name":"lookup","arguments":"{\\"key\\":\\"x\\"}"}]}', prepareRequest({ ...request, tools: [tool], tool_choice: 'none' })));
});
test('ARTEX omitempty tool history is accepted without losing IDs', () => {
  const messages = [...request.messages,
    { role: 'assistant', tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'lookup', arguments: '{"key":"a"}' } }] },
    { role: 'tool', tool_call_id: 'call_1' },
  ];
  const prepared = prepareRequest({ ...request, tools: [tool], messages });
  assert.deepEqual(JSON.parse(prepared.prompt.split('\nREQUEST_JSON\n')[1]).messages, messages);
});
test('auth, origin, unknown model and malformed output return explicit errors', async t => {
  const post = await fixture(t, async () => ({ output: 'invalid' }));
  assert.equal((await post(request, { headers: { authorization: 'Bearer wrong' } })).status, 401);
  assert.equal((await post(request, { headers: { origin: 'https://example.org' } })).status, 403);
  assert.equal((await post({ ...request, model: 'other' })).status, 400);
  assert.equal((await post()).status, 502);
});
test('completion and buffered SSE have tool finish reasons and usage', async t => {
  const post = await fixture(t, async () => ({ output: '{"content":"","tool_calls":[{"name":"lookup","arguments":"{\\"key\\":\\"x\\"}"}]}', usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 } }));
  const body = { ...request, tools: [tool] };
  const response = await (await post(body)).json();
  assert.equal(response.choices[0].finish_reason, 'tool_calls');
  assert.equal(response.choices[0].message.tool_calls[0].function.name, 'lookup');
  const sse = await (await post({ ...body, stream: true, stream_options: { include_usage: true } })).text();
  const chunks = sse.split('\n\n').filter(x => x.startsWith('data: {')).map(x => JSON.parse(x.slice(6)));
  assert.equal(chunks[1].choices[0].delta.tool_calls[0].index, 0);
  assert.equal(chunks.at(-1).usage.total_tokens, 5);
  assert.match(sse, /data: \[DONE\]/);
});
test('per-provider queue is bounded and timeout cancels runner', async t => {
  let active = 0;
  let aborted = false;
  const post = await fixture(t, ({ signal }) => new Promise((resolve, reject) => {
    active++;
    signal.addEventListener('abort', () => { active--; aborted = true; reject(new Error('runner cancelled')); }, { once: true });
  }), { maxQueue: 0, timeoutMs: 100 });
  const first = post();
  while (!active) await new Promise(resolve => setTimeout(resolve, 2));
  assert.equal((await post()).status, 429);
  assert.equal((await first).status, 504);
  assert.equal(aborted, true);
});
test('client disconnect cancels runner', async t => {
  let started;
  const ready = new Promise(resolve => { started = resolve; });
  let cancelled;
  const stopped = new Promise(resolve => { cancelled = resolve; });
  const post = await fixture(t, ({ signal }) => new Promise((resolve, reject) => {
    started();
    signal.addEventListener('abort', () => { cancelled(); reject(signal.reason); }, { once: true });
  }));
  const controller = new AbortController();
  const response = post(request, { signal: controller.signal }).catch(() => {});
  await ready;
  controller.abort();
  await response;
  await Promise.race([stopped, new Promise((_, reject) => setTimeout(() => reject(new Error('not cancelled')), 1000))]);
});
test('providers run independently while same-provider requests serialize', async t => {
  const starts = [];
  const pending = [];
  const post = await fixture(t, ({ provider }) => new Promise(resolve => {
    starts.push(provider);
    pending.push(() => resolve({ output: '{"content":"ok","tool_calls":[]}' }));
  }));
  const first = post();
  while (starts.length < 1) await new Promise(resolve => setTimeout(resolve, 2));
  const second = post();
  const other = post({ ...request, model: 'local-claude' });
  while (starts.length < 2) await new Promise(resolve => setTimeout(resolve, 2));
  assert.deepEqual(starts, ['codex', 'claude']);
  pending.shift()();
  await first;
  while (starts.length < 3) await new Promise(resolve => setTimeout(resolve, 2));
  assert.deepEqual(starts, ['codex', 'claude', 'codex']);
  pending.forEach(resolve => resolve());
  await Promise.all([second, other]);
});
test('named tool choice, schema constraints, input and output limits fail closed', async t => {
  const prepared = prepareRequest({ ...request, tools: [tool], tool_choice: { type: 'function', function: { name: 'lookup' } } });
  assert.throws(() => parseDecision('{"content":"ok","tool_calls":[]}', prepared));
  assert.throws(() => prepareRequest({ ...request, tools: [{ type: 'function', function: { name: 'bad', parameters: { type: 'object', patternProperties: {} } } }] }));
  const post = await fixture(t, async () => ({ output: 'x'.repeat(201) }), { maxBodyBytes: 200, maxOutputBytes: 200 });
  assert.equal((await post()).status, 502);
  assert.equal((await post({ ...request, messages: [{ role: 'user', content: 'x'.repeat(300) }] })).status, 413);
  assert.equal((await post(request, { headers: { 'content-type': 'text/plain' } })).status, 415);
});
