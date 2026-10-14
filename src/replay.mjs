import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { sanitizePayload } from './capture.mjs';

export function prepareLocalReplay(record, target, { allowWrites = false } = {}) {
  const base = new URL(target);
  if (!['http:', 'https:'].includes(base.protocol) || !['127.0.0.1', '[::1]'].includes(base.hostname) || base.username || base.password || base.pathname !== '/' || base.search || base.hash) throw new Error('Replay target must be a literal loopback HTTP(S) origin');
  if (!record?.inScope) throw new Error('Replay requires an in-scope recorded request');
  const method = record.request.method.toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) throw new Error('Unsupported replay method');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && allowWrites !== true) throw new Error('Local write replay requires explicit allowWrites');
  const source = new URL(record.request.url);
  const url = new URL(base.origin);
  // Assign fields rather than resolving a //path that could replace the target host.
  url.pathname = source.pathname; url.search = source.search;
  const post = record.request.postData;
  if (post && (post.omitted || post.truncated || typeof post.text !== 'string')) throw new Error('Recorded request body is incomplete');
  const body = post?.text;
  if ((method === 'GET' || method === 'HEAD') && body) throw new Error('GET/HEAD bodies are not supported');
  if (decodeURIComponent(url.href).includes('[REDACTED]') || body?.includes('[REDACTED]')) throw new Error('Redacted inputs must not be replayed as real values');
  const headers = {};
  for (const [key, value] of Object.entries(record.request.headers || {})) {
    if (/^(content-type|accept)$/i.test(key) && typeof value === 'string' && !value.includes('[REDACTED]')) headers[key] = value;
  }
  return { url: url.href, method, headers, body };
}

export async function replayLocal(record, target, options = {}) {
  const prepared = prepareLocalReplay(record, target, options);
  const started = performance.now();
  const response = await fetch(prepared.url, { method: prepared.method, headers: prepared.headers,
    body: prepared.body, redirect: 'manual', signal: AbortSignal.timeout(10000) });
  const chunks = []; let bytes = 0;
  if (response.body) {
    const reader = response.body.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        bytes += value.byteLength;
        if (bytes > 1048576) { await reader.cancel(); throw new Error('Replay response exceeds 1 MiB limit'); }
        chunks.push(Buffer.from(value));
      }
    } finally { reader.releaseLock(); }
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return { schemaVersion: 1, requestId: record.requestId, actionId: record.actionId ?? null,
    targetOrigin: new URL(target).origin, method: prepared.method,
    status: response.status, elapsedMs: performance.now() - started, bytes,
    response: sanitizePayload(raw, response.headers.get('content-type') || ''),
    responseSha256: createHash('sha256').update(raw).digest('hex'),
    limitations: ['Local replay only; cookies, authorization and other context headers omitted.', 'Redirects not followed. No browser/CORS or authenticated-session equivalence claimed.', 'Response key-redacted when structured; arbitrary raw response text omitted.'] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { run: { type: 'string' }, request: { type: 'string' }, hop: { type: 'string' }, target: { type: 'string' }, 'allow-writes': { type: 'boolean' }, help: { type: 'boolean' } } });
  if (values.help || !values.run || !values.request || !values.target) {
    console.log('Usage: npm run replay:local -- --run runs/capture --request ID --target http://127.0.0.1:PORT [--hop 0] [--allow-writes]\nSends one request to an explicit local test server. Never follows redirects.');
    process.exitCode = values.help ? 0 : 1;
  } else {
    try {
      const evidence = JSON.parse(await readFile(join(resolve(values.run), 'network/evidence.json'), 'utf8'));
      const records = (evidence.requests || []).filter(r => r.requestId === values.request && (values.hop === undefined || (r.hop || 0) === Number(values.hop)));
      if (records.length !== 1) throw new Error('Select exactly one recorded request and hop');
      console.log(JSON.stringify(await replayLocal(records[0], values.target, { allowWrites: !!values['allow-writes'] }), null, 2));
    } catch { console.error('Local replay failed or input was rejected. Check request selection, loopback target, complete unredacted inputs and explicit write opt-in. Raw errors omitted.'); process.exitCode = 1; }
  }
}
