import { requestBounded } from '../http.mjs';
import { clean } from '../capture.mjs';

/** Credential headers are sent, never persisted. Only structured redacted output is retained. */
export async function executeCase(c, headers, budgets, signal) {
  if (signal?.aborted) return { errorCode: 'CANCELLED' };
  const started = Date.now();
  try {
    const body = c.body === undefined ? undefined : JSON.stringify(c.body);
    if (body && Buffer.byteLength(body) > budgets.maxBytes) return { errorCode: 'REQUEST_BYTE_LIMIT' };
    const response = await requestBounded(c.url, { method: c.method,
      headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers }, body,
      timeoutMs: budgets.timeoutMs, maxBytes: budgets.maxBytes });
    let parsed;
    try {
      const secrets = Object.values(headers || {}).filter(v => v.length > 0);
      const redactKnown = value => typeof value === 'string' ? secrets.reduce((s, secret) => s.split(secret).join('[REDACTED]'), value)
        : Array.isArray(value) ? value.map(redactKnown) : value && typeof value === 'object'
          ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redactKnown(v)])) : value;
      parsed = redactKnown(clean(JSON.parse(response.body)));
    } catch { /* Explicitly unavailable, not a successful empty response. */ }
    // Avoid retaining response headers: arbitrary servers can reflect credentials there.
    return { elapsedMs: Date.now() - started, response: { status: response.status, headers: {}, bytes: response.bytes,
      wireBytes: response.wireBytes, ...(parsed === undefined ? { omitted: 'non-structured-payload' } : { body: parsed }) },
      ...(response.headers.location ? { redirect: { followed: false } } : {}) };
  } catch (error) {
    return { elapsedMs: Date.now() - started, errorCode: /^[A-Z_]+$/.test(error.code || '') ? error.code : 'TRANSPORT_FAILED' };
  }
}
