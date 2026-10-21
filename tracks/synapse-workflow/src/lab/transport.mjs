import http from 'node:http';
import { createHash, randomUUID } from 'node:crypto';

// Original receipts only: serialization, spread and structuredClone never carry raw bodies.
const rawBodies = new WeakMap();
export function getLabResponseBody(receipt) { return rawBodies.get(receipt)?.body; }
export function readEphemeralResponse(receipt) {
  const value = rawBodies.get(receipt);
  return value ? { body: value.body, headers: { ...value.headers } } : undefined;
}

const REDACTED = '[REDACTED]';
const SAFE_KEYS = new Set(['user', 'users', 'id', 'email', 'verified', 'order', 'orders',
  'ownerId', 'description', 'messages', 'to', 'buildId', 'generation', 'error', 'code', 'status', 'ok']);
const SECRET_KEY = /password|token|secret|credential|authorization|cookie|verification|^text$|^subject$|^message$/i;
const REQUEST_HEADERS = new Set(['accept', 'content-type', 'authorization', 'cookie']);
const METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);
const digest = value => createHash('sha256').update(value).digest('hex');

function positive(value, name, max) {
  if (!Number.isSafeInteger(value) || value < 1 || value > max) throw new TypeError(`Invalid ${name}`);
  return value;
}
function originAllowed(value) {
  if (typeof value !== 'string' || !/^http:\/\/127\.0\.0\.1:[1-9][0-9]{0,4}$/.test(value)) return false;
  try { const u = new URL(value); return u.origin === value && Number(u.port) <= 65535; } catch { return false; }
}
function cleanString(value, secrets) {
  let out = value;
  for (const secret of secrets) if (secret) out = out.split(secret).join(REDACTED);
  return out.replace(/Bearer\s+[^\s"<>]+/gi, 'Bearer [REDACTED]')
    .replace(/([?&][^\s=&]+)=([^\s&#"<>]*)/g, '$1=[REDACTED]');
}
function learnSecrets(value, secrets, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 32) return;
  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEY.test(key) && typeof child === 'string' && child) secrets.add(child);
    if (child && typeof child === 'object') learnSecrets(child, secrets, depth + 1);
  }
}
function safeJSON(value, secrets, flags, depth = 0) {
  if (depth > 32) { flags.bodyFieldsOmitted = true; return REDACTED; }
  if (typeof value === 'string') {
    const clean = cleanString(value, secrets);
    if (clean !== value) flags.bodyRedacted = true;
    return clean;
  }
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(v => safeJSON(v, secrets, flags, depth + 1));
  const out = Object.create(null);
  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEY.test(key)) { out['[REDACTED FIELD]'] = REDACTED; flags.bodyRedacted = true; }
    else if (SAFE_KEYS.has(key)) out[key] = safeJSON(child, secrets, flags, depth + 1);
    else flags.bodyFieldsOmitted = true;
  }
  return out;
}
function safeBody(text, secrets, flags = {}) {
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== 'object') { flags.bodyFieldsOmitted = true; return '[REDACTED scalar JSON]'; }
    learnSecrets(value, secrets);
    return JSON.stringify(safeJSON(value, secrets, flags));
  }
  catch { flags.bodyFieldsOmitted = text !== ''; return text === '' ? '' : '[REDACTED non-JSON body]'; }
}
function safeHeaders(headers, secrets) {
  const out = {};
  for (const key of ['x-lab-build-id', 'x-lab-generation']) {
    if (typeof headers[key] === 'string') out[key] = cleanString(headers[key], secrets);
  }
  if (typeof headers['content-type'] === 'string' && /^(application\/json|text\/html|text\/plain)(;\s*charset=utf-8)?$/i.test(headers['content-type'])) {
    out['content-type'] = headers['content-type'];
  }
  return out;
}
function safeURL(url, secrets) {
  const u = new URL(url);
  for (const key of [...u.searchParams.keys()]) u.searchParams.set(key, REDACTED);
  return cleanString(u.origin + u.pathname + u.search, secrets);
}

/** Restricted executor, not a sandbox for arbitrary host code or proof of remote effects.
 * maxResponseBytes is a shared wire-body budget; overflow bytes may arrive in the
 * chunk triggering destruction. No decompression is performed. Request bodies
 * are UTF-8 strings bounded to 64 KiB; response raw bytes are hashed before redaction.
 */
export function createLabTransport({ origins, maxRequests = 100, timeoutMs = 3000,
  maxResponseBytes = 262144, deadlineMs = 60000 } = {}) {
  if (!Array.isArray(origins) || !origins.length || origins.length > 8 ||
      origins.some(o => !originAllowed(o)) || new Set(origins).size !== origins.length) {
    throw new TypeError('origins must be unique exact http://127.0.0.1:<port> origins');
  }
  positive(maxRequests, 'maxRequests', 10000);
  positive(timeoutMs, 'timeoutMs', 3600000);
  positive(maxResponseBytes, 'maxResponseBytes', 16777216);
  positive(deadlineMs, 'deadlineMs', 86400000);
  const allowed = new Set(origins), active = new Set(), retained = new Set(), secrets = new Set();
  const state = { attempted: 0, sent: 0, completed: 0, errors: 0, denied: 0,
    active: 0, stopped: false, responseBytes: 0, dispatched: 0 };
  const deadlineAt = performance.now() + deadlineMs;
  let stopPromise;
  const failure = code => ({ code, message: code });

  function stop(reason = 'STOPPED') {
    if (stopPromise) return stopPromise;
    state.stopped = true;
    clearTimeout(deadlineTimer);
    const pending = [...active];
    for (const op of pending) op.abort(reason);
    for (const receipt of retained) rawBodies.delete(receipt);
    retained.clear();
    secrets.clear();
    stopPromise = Promise.all(pending.map(op => op.done)).then(() => stats());
    return stopPromise;
  }
  const deadlineTimer = setTimeout(() => { void stop('DEADLINE_EXCEEDED'); }, deadlineMs);
  deadlineTimer.unref();
  function stats() { return { ...state }; }

  async function request(input = {}) {
    state.attempted++;
    const receipt = { id: randomUUID(), startedAt: new Date().toISOString(), identity: 'anonymous',
      identitySource: 'operator-declared', request: { method: null, url: '[REJECTED URL]', headers: {}, body: null },
      response: { status: null, headers: {}, body: null, bodySha256: null,
        bodyFieldsOmitted: false, bodyRedacted: false }, complete: false };
    const deny = code => { state.denied++; receipt.error = failure(code); return receipt; };
    if (state.stopped) return deny('STOPPED');
    if (performance.now() >= deadlineAt) { await stop('DEADLINE_EXCEEDED'); return deny('DEADLINE_EXCEEDED'); }
    if (state.dispatched >= maxRequests) return deny('REQUEST_BUDGET');
    if (state.responseBytes >= maxResponseBytes) return deny('RESPONSE_BUDGET');
    if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.keys(input).some(k => !['url', 'method', 'headers', 'body', 'identity'].includes(k))) return deny('INVALID_REQUEST');
    const { url, method = 'GET', headers = {}, body, identity = 'anonymous' } = input;
    if (typeof url !== 'string' || url.length > 8192 || !/^http:\/\/127\.0\.0\.1:[1-9][0-9]{0,4}(?:\/|\?|$)/.test(url) || /[\s\\#]/.test(url)) return deny('INVALID_URL');
    let parsed;
    try { parsed = new URL(url); } catch { return deny('INVALID_URL'); }
    if (!allowed.has(parsed.origin) || parsed.username || parsed.password) return deny('OUT_OF_SCOPE');
    if (!METHODS.has(method)) return deny('INVALID_METHOD');
    if (typeof identity !== 'string' || !/^[a-zA-Z0-9_.:@-]{1,100}$/.test(identity)) return deny('INVALID_IDENTITY');
    if (body !== undefined && (typeof body !== 'string' || Buffer.byteLength(body) > 65536)) return deny('INVALID_BODY');
    if ((method === 'GET' || method === 'HEAD') && body !== undefined) return deny('INVALID_BODY');
    if (!headers || typeof headers !== 'object' || Array.isArray(headers) || Object.keys(headers).length > 4) return deny('INVALID_HEADERS');
    const wireHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
      const lower = key.toLowerCase();
      if (!REQUEST_HEADERS.has(lower) || typeof value !== 'string' || value.length > 8192 || /[\r\n]/.test(value) || Object.hasOwn(wireHeaders, lower)) return deny('INVALID_HEADERS');
      wireHeaders[lower] = value;
    }
    for (const key of ['authorization', 'cookie']) if (wireHeaders[key]) {
      secrets.add(wireHeaders[key]);
      if (key === 'authorization') secrets.add(wireHeaders[key].replace(/^Bearer\s+/i, ''));
      if (key === 'cookie') for (const entry of wireHeaders[key].split(';')) {
        const at = entry.indexOf('=');
        if (at >= 0 && entry.slice(at + 1).trim()) secrets.add(entry.slice(at + 1).trim());
      }
    }
    // Mask all queries in URL evidence, but do not classify normal recipient IDs
    // as credentials: the same public identity must remain comparable in /me.
    for (const [key, value] of parsed.searchParams) if (value && SECRET_KEY.test(key)) secrets.add(value);
    if (body) { try { learnSecrets(JSON.parse(body), secrets); } catch { /* Evidence omits non-JSON text. */ } }
    receipt.identity = identity;
    receipt.request = { method, url: safeURL(url, secrets), headers: safeHeaders(wireHeaders, secrets),
      body: body === undefined ? null : safeBody(body, secrets) };
    state.dispatched++;
    state.active++;

    return new Promise(resolve => {
      let req, socket, response, requestClosed = false, socketClosed = true, finished = false;
      let ended = false, raw, timer;
      const chunks = [], hash = createHash('sha256');
      let resolveDone;
      const done = new Promise(r => { resolveDone = r; });
      const op = { done, abort };
      active.add(op);
      function abort(code) {
        if (finished) return;
        receipt.error ??= failure(code);
        response?.destroy();
        req?.destroy();
        socket?.destroy();
      }
      function finish() {
        if (finished || !requestClosed || !socketClosed) return;
        finished = true;
        clearTimeout(timer);
        active.delete(op);
        state.active--;
        receipt.response.bodySha256 = hash.digest('hex');
        if (ended && !receipt.error) {
          raw = Buffer.concat(chunks).toString('utf8');
          receipt.response.body = safeBody(raw, secrets, receipt.response);
          receipt.complete = true;
          state.completed++;
          if (!state.stopped) { rawBodies.set(receipt, { body: raw, headers: { ...response.headers } }); retained.add(receipt); }
        } else { receipt.error ??= failure('INCOMPLETE_RESPONSE'); state.errors++; }
        chunks.length = 0;
        resolve(receipt);
        resolveDone();
      }
      try {
        // Literal address + explicit family; no resolver, environment proxy or shared agent.
        req = http.request({ protocol: 'http:', hostname: '127.0.0.1', family: 4,
          port: Number(parsed.port), path: parsed.pathname + parsed.search, method,
          headers: { ...wireHeaders, 'accept-encoding': 'identity', connection: 'close',
            ...(body === undefined ? {} : { 'content-length': Buffer.byteLength(body) }) },
          agent: false, maxHeaderSize: 16384 }, res => {
          response = res;
          receipt.response.status = res.statusCode;
          receipt.response.headers = safeHeaders(res.headers, secrets);
          if (res.headers['content-encoding'] && res.headers['content-encoding'] !== 'identity') { abort('UNSUPPORTED_ENCODING'); return; }
          res.on('data', chunk => {
            state.responseBytes += chunk.length;
            hash.update(chunk);
            if (state.responseBytes > maxResponseBytes) { void stop('RESPONSE_BUDGET'); return; }
            chunks.push(chunk);
          });
          res.on('end', () => { ended = true; });
          res.on('aborted', () => abort('INCOMPLETE_RESPONSE'));
          res.on('error', () => abort('RESPONSE_ERROR'));
        });
        req.on('socket', s => {
          socket = s; socketClosed = false;
          s.once('close', () => { socketClosed = true; finish(); });
          if (state.stopped || receipt.error) s.destroy();
        });
        req.once('finish', () => { state.sent++; });
        req.once('error', () => { receipt.error ??= failure('NETWORK_ERROR'); });
        req.once('close', () => { requestClosed = true; finish(); });
        timer = setTimeout(() => abort('REQUEST_TIMEOUT'), Math.min(timeoutMs, Math.max(1, deadlineAt - performance.now())));
        timer.unref();
        req.end(body);
      } catch {
        receipt.error = failure('REQUEST_ERROR');
        if (req) req.destroy(); else { requestClosed = true; finish(); }
      }
    });
  }
  return { request, stop, stats };
}
