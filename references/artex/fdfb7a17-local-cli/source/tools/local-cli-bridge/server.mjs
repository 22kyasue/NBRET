import http from 'node:http';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { BridgeError, models, prepareRequest, parseDecision } from './protocol.mjs';

function queue(maxQueue) {
  let busy = false;
  const waiting = [];
  const release = () => {
    const next = waiting.shift();
    if (next) { next.cleanup(); next.resolve(release); } else busy = false;
  };
  return signal => {
    if (signal.aborted) return Promise.reject(signal.reason);
    if (!busy) { busy = true; return Promise.resolve(release); }
    if (waiting.length >= maxQueue) return Promise.reject(new BridgeError(429, 'queue_full', 'Local provider queue is full.'));
    return new Promise((resolve, reject) => {
      const item = { resolve, cleanup: () => signal.removeEventListener('abort', cancel) };
      const cancel = () => { waiting.splice(waiting.indexOf(item), 1); item.cleanup(); reject(signal.reason); };
      waiting.push(item);
      signal.addEventListener('abort', cancel, { once: true });
    });
  };
}
function authorized(header, token) {
  const actual = Buffer.from(typeof header === 'string' ? header : '');
  const expected = Buffer.from(`Bearer ${token}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
async function readBody(req, limit) {
  if (Number(req.headers['content-length']) > limit) throw new BridgeError(413, 'body_too_large', 'Request body exceeds limit.');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new BridgeError(413, 'body_too_large', 'Request body exceeds limit.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new BridgeError(400, 'invalid_json', 'Request must contain valid JSON.'); }
}
function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}
function usageOf(usage) {
  if (!usage) return undefined;
  if (!['prompt_tokens', 'completion_tokens', 'total_tokens'].every(key => Number.isSafeInteger(usage[key]) && usage[key] >= 0)) return undefined;
  return usage;
}
export function createBridgeServer({ token, runner, timeoutMs = 120_000, maxBodyBytes = 1_048_576, maxOutputBytes = 1_048_576, maxQueue = 4 } = {}) {
  if (typeof token !== 'string' || token.length < 32 || /[\r\n]/.test(token)) throw new Error('A host bearer token of at least 32 characters is required.');
  if (typeof runner !== 'function') throw new Error('An official local CLI runner is required.');
  for (const [name, value] of Object.entries({ timeoutMs, maxBodyBytes, maxOutputBytes, maxQueue })) if (!Number.isSafeInteger(value) || value < (name === 'maxQueue' ? 0 : 1)) throw new Error(`Invalid ${name}`);
  const queues = { codex: queue(maxQueue), claude: queue(maxQueue) };
  const server = http.createServer(async (req, res) => {
    const controller = new AbortController();
    const disconnect = () => { if (!res.writableEnded) controller.abort(new BridgeError(499, 'disconnected', 'Client disconnected.')); };
    res.on('close', disconnect);
    req.on('aborted', disconnect);
    const timer = setTimeout(() => controller.abort(new BridgeError(504, 'provider_timeout', 'Local CLI request timed out.')), timeoutMs);
    timer.unref();
    let release;
    try {
      if (req.headers.origin !== undefined || req.headers['sec-fetch-site'] !== undefined) throw new BridgeError(403, 'browser_forbidden', 'Browser requests are not supported.');
      if (!authorized(req.headers.authorization, token)) throw new BridgeError(401, 'unauthorized', 'A valid host bearer token is required.');
      if (req.method === 'GET' && req.url === '/health') return json(res, 200, { status: 'ok', streaming: 'buffered' });
      if (req.method === 'GET' && req.url === '/v1/models') return json(res, 200, { object: 'list', data: Object.keys(models).map(id => ({ id, object: 'model', created: 0, owned_by: 'local-cli' })) });
      if (req.method !== 'POST' || req.url !== '/v1/chat/completions') throw new BridgeError(404, 'not_found', 'Endpoint not found.');
      if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) throw new BridgeError(415, 'unsupported_media_type', 'Content-Type must be application/json.');
      const body = await readBody(req, maxBodyBytes);
      const prepared = prepareRequest(body);
      release = await queues[prepared.provider](controller.signal);
      const result = await runner({ ...prepared, signal: controller.signal, maxOutputBytes });
      if (controller.signal.aborted) throw controller.signal.reason;
      if (typeof result?.output !== 'string' || Buffer.byteLength(result.output) > maxOutputBytes) throw new BridgeError(502, 'output_limit', 'Local CLI output is missing or exceeds limit.');
      const decision = parseDecision(result.output, prepared);
      const usage = usageOf(result.usage);
      const toolCalls = decision.tool_calls.map(call => ({ id: `call_${randomUUID().replaceAll('-', '')}`, type: 'function', function: call }));
      const base = { id: `chatcmpl-${randomUUID()}`, created: Math.floor(Date.now() / 1000), model: prepared.model };
      const finish = toolCalls.length ? 'tool_calls' : 'stop';
      const message = { role: 'assistant', content: decision.content || null, ...(toolCalls.length ? { tool_calls: toolCalls } : {}) };
      if (!body.stream) return json(res, 200, { ...base, object: 'chat.completion', choices: [{ index: 0, message, finish_reason: finish }], ...(usage ? { usage } : {}) });
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', 'x-accel-buffering': 'no' });
      const chunk = (delta, finish_reason = null) => res.write(`data: ${JSON.stringify({ ...base, object: 'chat.completion.chunk', choices: [{ index: 0, delta, finish_reason }] })}\n\n`);
      chunk({ role: 'assistant' });
      chunk({ ...(decision.content ? { content: decision.content } : {}), ...(toolCalls.length ? { tool_calls: toolCalls.map((call, index) => ({ index, ...call })) } : {}) });
      chunk({}, finish);
      if (body.stream_options?.include_usage && usage) res.write(`data: ${JSON.stringify({ ...base, object: 'chat.completion.chunk', choices: [], usage })}\n\n`);
      res.end('data: [DONE]\n\n');
    } catch (error) {
      if (controller.signal.aborted) error = controller.signal.reason;
      if (!res.destroyed && !res.headersSent) {
        const known = error instanceof BridgeError;
        json(res, known ? error.status : 502, { error: { message: known ? error.message : 'Local CLI execution failed.', type: 'local_cli_error', code: known ? error.code : 'provider_error' } });
      }
    } finally {
      clearTimeout(timer);
      release?.();
      res.off('close', disconnect);
      req.off('aborted', disconnect);
    }
  });
  server.requestTimeout = Math.min(timeoutMs, 30_000);
  server.headersTimeout = Math.min(timeoutMs, 10_000);
  return server;
}
