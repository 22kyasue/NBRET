// Opt-in live subscription test. Makes two real model calls per provider.
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

const token = (await readFile(new URL('../../work/cli-bridge/token', import.meta.url), 'utf8')).trim();
const endpoint = 'http://127.0.0.1:18789/v1/chat/completions';
const tools = [{
  type: 'function',
  function: {
    name: 'read_test_nonce',
    description: 'Return a newly generated test nonce from the test harness. Harmless synthetic tool.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
}];
async function complete(body) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(125_000),
  });
  const data = await response.json();
  assert.equal(response.status, 200, JSON.stringify(data));
  return data.choices[0];
}
for (const model of ['local-codex', 'local-claude']) {
  const start = Date.now();
  const messages = [{ role: 'user', content: 'Call read_test_nonce once with {}. Then report the exact nonce returned by that tool, and nothing else.' }];
  const first = await complete({ model, messages, tools, tool_choice: 'required', stream: false });
  assert.equal(first.finish_reason, 'tool_calls');
  assert.equal(first.message.tool_calls.length, 1);
  assert.equal(first.message.tool_calls[0].function.name, 'read_test_nonce');
  assert.deepEqual(JSON.parse(first.message.tool_calls[0].function.arguments), {});
  // Generated only AFTER the tool call, so the model cannot pre-answer.
  const nonce = randomUUID();
  messages.push(first.message, { role: 'tool', tool_call_id: first.message.tool_calls[0].id, content: nonce });
  const second = await complete({ model, messages, tools, tool_choice: 'none', stream: false });
  assert.equal(second.finish_reason, 'stop');
  assert.ok(second.message.content.includes(nonce), 'Final response must contain the actual tool result.');
  console.log(JSON.stringify({ model, toolRoundTrip: 'passed', elapsedMs: Date.now() - start }));
}
