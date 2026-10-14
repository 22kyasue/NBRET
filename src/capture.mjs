import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { writeCapturedAsset } from './assets.mjs';
export { payload as sanitizePayload };

const secret = /authorization|cookie|token|password|passwd|secret|api[-_]?key|session|credential/i;
const hash = value => createHash('sha256').update(value).digest('hex');
function clean(value, key = '') {
  if (secret.test(key)) return '[REDACTED]';
  if (typeof value === 'string' && /^(referer|referrer|location|content-location)$/i.test(key)) return safeUrl(value);
  if (Array.isArray(value)) return value.map(v => clean(v));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clean(v, k)]));
  return value;
}
function safeUrl(value, stripQuery = false) {
  try {
    const u = new URL(value);
    u.username = ''; u.password = ''; u.hash = '';
    if (stripQuery) u.search = '';
    for (const k of [...u.searchParams.keys()]) if (secret.test(k)) u.searchParams.set(k, '[REDACTED]');
    return u.href;
  } catch { return '[INVALID_URL]'; }
}
function payload(value, mime = '') {
  try { return { text: JSON.stringify(clean(JSON.parse(value))), redaction: 'sensitive-json-keys' }; } catch {}
  if (/application\/x-www-form-urlencoded/i.test(mime)) {
    const params = new URLSearchParams(value);
    for (const key of [...params.keys()]) if (secret.test(key)) params.set(key, '[REDACTED]');
    return { text: params.toString(), redaction: 'sensitive-form-keys' };
  }
  // Arbitrary text can contain embedded credentials: retain shape, never persist raw text.
  return { text: null, omitted: 'non-structured-payload', bytes: Buffer.byteLength(value) };
}

// Recognizable framing only; content is never decoded or persisted.
export function sniffFormat(bytes) {
  const b = bytes, starts = (...m) => m.every((v, i) => b[i] === v);
  if (!b.length) return 'empty';
  if (starts(0x1f, 0x8b)) return 'gzip';
  if (starts(0x28, 0xb5, 0x2f, 0xfd)) return 'zstd';
  if (b[0] === 0x78 && [0x01, 0x5e, 0x9c, 0xda].includes(b[1])) return 'zlib';
  if (starts(0x89, 0x50, 0x4e, 0x47)) return 'png';
  if (starts(0xff, 0xd8, 0xff)) return 'jpeg';
  if ((b[0] & 0xf0) === 0x80 || b[0] === 0xde || b[0] === 0xdf) return 'msgpack-map-like';
  if ((b[0] & 0xe0) === 0xa0 || b[0] === 0xbf) return 'cbor-map-like';
  const text = bytes.toString('utf8');
  if (!text.includes('\uFFFD') && !/[\x00-\x08\x0e-\x1f]/.test(text)) return /^\s*[[{]/.test(text) ? 'json-like-text' : 'text';
  const wire = b[0] & 7;
  if (b[0] >> 3 > 0 && [0, 1, 2, 5].includes(wire)) return 'protobuf-like';
  return 'unknown-binary';
}

function streamPayload(data, enabled, inScope, limit, text = true) {
  const bytes = text ? Buffer.from(data) : Buffer.from(data, 'base64'), payloadBytes = bytes.length;
  if (!inScope) return { payloadBytes, payloadOmitted: 'out-of-scope' };
  if (!enabled) return { payloadBytes, payloadOmitted: 'secret-safety' };
  // Opted-in binary/unstructured messages keep a digest for comparison; raw bytes may embed credentials.
  const digest = { payloadHash: hash(bytes), payloadFormat: sniffFormat(bytes) };
  if (!text) return { payloadBytes, payloadOmitted: 'binary-frame', ...digest };
  if (payloadBytes > limit) return { payloadBytes, payloadOmitted: 'size-limit', truncated: true, ...digest };
  const result = payload(data);
  return result.omitted ? { payloadBytes, payload: result, ...digest } : { payloadBytes, payload: result };
}

/** Observe a page before navigation. This is browser-visible evidence, not heap recovery. */
export async function startCapture(page, { outDir, origins = [], maxBodyBytes = 1048576, includeScriptSources = false, maxEntries = 2000, maxTotalBytes = 20 * 1024 * 1024, maxPending = 20, identity, includeStreamPayloads = false, session, instrumentedTargets, assetStore } = {}) {
  if (!outDir) throw new Error('outDir is required');
  if (!origins.length) throw new Error('Explicit origins allowlist is required');
  if (!Number.isSafeInteger(maxBodyBytes) || maxBodyBytes < 1) throw new Error('maxBodyBytes must be a positive integer');
  for (const [key, value] of Object.entries({ maxEntries, maxTotalBytes, maxPending })) if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${key} must be a positive integer`);
  if (maxTotalBytes < 4096) throw new Error('maxTotalBytes must be at least 4096');
  const allowed = new Set(origins.map(o => new URL(o).origin));
  const scoped = url => { try { return allowed.has(new URL(url).origin); } catch { return false; } };
  await mkdir(path.join(outDir, 'assets'), { recursive: true });
  const cdp = session || await page.context().newCDPSession(page);
  const evidence = { schemaVersion: 1, startedAt: new Date().toISOString(), origins: [...allowed], actions: [], requests: [], scripts: [], sockets: [], snapshots: [], errors: [], limitations: ['Browser-visible traffic only; no server code or heap recovery.', 'HTTP cache visibility is CDP metadata; Cache Storage lists names and counts only.', 'Secrets are key-redacted; structured stream recording requires opt-in; opted-in unstructured/binary stream payloads keep only a SHA-256 digest, size and sniffed format.', 'Scripts without an allowlisted URL are omitted; source persistence requires explicit includeScriptSources opt-in.', 'Only this page CDP target is observed; workers and cross-process frames may be incomplete.'] };
  evidence.options = { maxBodyBytes, includeScriptSources, includeStreamPayloads, maxEntries, maxTotalBytes, maxPending };
  evidence.eventSources = [];
  evidence.assetReuse = { hits: 0, misses: 0, linkedBytes: 0, copiedBytes: 0, enabled: !!assetStore };
  evidence.targets = [];
  evidence.targetCoverage = { observedTargetId: null, discoveryErrors: 0 };
  if (identity) evidence.identity = identity;
  evidence.dropped = { entries: 0, pending: 0, bytes: 0, frames: 0, serialization: 0 };
  evidence.savedAssetBytes = 0;
  if (includeScriptSources) evidence.limitations.push('Script source saving explicitly enabled: raw JavaScript may contain embedded secrets and is NOT redacted.');
  const current = new Map(), sockets = new Map(), pending = new Set();
  let action = null, finished = false;
  const context = () => ({ actionId: action, observedAt: new Date().toISOString() });
  let entries = 0;
  const admit = () => { if (entries >= maxEntries) { evidence.dropped.entries++; return false; } entries++; return true; };
  const track = (work, omitted) => {
    if (pending.size >= maxPending) { evidence.dropped.pending++; omitted(); return; }
    const p = work().catch(e => { if (admit()) evidence.errors.push({ message: String(e.message).slice(0, 1000), ...context() }); }).finally(() => pending.delete(p)); pending.add(p);
  };
  const saveAsset = async (file, text) => {
    const bytes = Buffer.byteLength(text);
    if (evidence.savedAssetBytes + bytes > Math.floor(maxTotalBytes / 2)) { evidence.dropped.bytes++; return false; }
    evidence.savedAssetBytes += bytes;
    try {
      const result = await writeCapturedAsset(path.join(outDir, file), text, assetStore);
      evidence.assetReuse[result.cacheHit ? 'hits' : 'misses']++;
      evidence.assetReuse[result.linked ? 'linkedBytes' : 'copiedBytes'] += result.bytes;
    } catch (error) { if (error.code !== 'EEXIST') throw error; }
    return true;
  };
  const url = value => safeUrl(value, !scoped(value.replace(/^ws/, 'http')));
  const post = request => !request.postData ? undefined : Buffer.byteLength(request.postData) > maxBodyBytes ? { omitted: 'size-limit', truncated: true } : payload(request.postData, request.headers['Content-Type'] || request.headers['content-type']);
  const handlers = [];
  try { evidence.targetCoverage.observedTargetId = (await cdp.send('Target.getTargetInfo')).targetInfo.targetId; }
  catch { evidence.targetCoverage.discoveryErrors++; }
  const discovered = new Set();
  const discoverTargets = async () => {
    try {
      const { targetInfos } = await cdp.send('Target.getTargets');
      for (const t of targetInfos) {
        if (discovered.has(t.targetId)) continue;
        if (discovered.size >= 100 || !admit()) { evidence.dropped.targets = (evidence.dropped.targets || 0) + 1; continue; }
        discovered.add(t.targetId);
        evidence.targets.push({ targetId: t.targetId, type: t.type, url: url(t.url), observed: t.targetId === evidence.targetCoverage.observedTargetId || !!instrumentedTargets?.has(t.targetId) });
      }
    } catch { evidence.targetCoverage.discoveryErrors++; }
  };
  const on = (event, fn) => { handlers.push([event, fn]); cdp.on(event, fn); };
  on('Network.requestWillBeSent', e => {
    if (!admit()) { current.delete(e.requestId); return; }
    const prev = current.get(e.requestId);
    if (prev && e.redirectResponse) { prev.response = { url: url(e.redirectResponse.url), status: e.redirectResponse.status, mimeType: e.redirectResponse.mimeType }; prev.redirected = true; }
    const inScope = scoped(e.request.url);
    const rec = { requestId: e.requestId, hop: prev ? prev.hop + 1 : 0, ...context(), timestamp: e.timestamp, wallTime: e.wallTime, inScope, request: { url: url(e.request.url), method: e.request.method, headers: inScope ? clean(e.request.headers) : '[OUT_OF_SCOPE]', postData: inScope ? post(e.request) : undefined }, initiator: { type: e.initiator.type, frames: inScope ? (e.initiator.stack?.callFrames || []).map(f => ({ functionName: f.functionName, url: url(f.url), lineNumber: f.lineNumber, columnNumber: f.columnNumber })) : [] } };
    if (e.request.postData && Buffer.byteLength(e.request.postData) > maxBodyBytes) rec.request.postData = { omitted: 'size-limit', truncated: true };
    current.set(e.requestId, rec); evidence.requests.push(rec);
  });
  on('Network.responseReceived', e => {
    const r = current.get(e.requestId); if (!r) return;
    const v = e.response;
    r.response = { url: url(v.url), status: v.status, mimeType: v.mimeType, protocol: v.protocol, headers: r.inScope ? clean(v.headers) : '[OUT_OF_SCOPE]', fromDiskCache: !!v.fromDiskCache, fromPrefetchCache: !!v.fromPrefetchCache, fromServiceWorker: !!v.fromServiceWorker, timing: v.timing, timestamp: e.timestamp };
  });
  on('Network.requestServedFromCache', e => { const r = current.get(e.requestId); if (r) r.servedFromCache = true; });
  on('Network.loadingFailed', e => { const r = current.get(e.requestId); if (r) r.failure = { errorText: e.errorText, canceled: e.canceled, blockedReason: e.blockedReason, timestamp: e.timestamp }; });
  on('Network.loadingFinished', e => {
    const r = current.get(e.requestId); if (!r) return;
    r.finished = { timestamp: e.timestamp, encodedDataLength: e.encodedDataLength, ...context() };
    if (!r.inScope) { r.body = { omitted: 'out-of-scope' }; return; }
    if (e.encodedDataLength > maxBodyBytes) { r.body = { omitted: 'size-limit', truncated: true }; return; }
    track(async () => {
      try {
        const b = await cdp.send('Network.getResponseBody', { requestId: e.requestId });
        const bytes = Buffer.from(b.body, b.base64Encoded ? 'base64' : 'utf8');
        if (bytes.length > maxBodyBytes) { r.body = { omitted: 'size-limit', truncated: true, bytes: bytes.length }; return; }
        const sanitized = payload(bytes.toString('utf8'), r.response?.mimeType);
        r.body = { ...sanitized, bytes: bytes.length, truncated: false };
        if (sanitized.text !== null) {
          const name = `${hash(sanitized.text)}.json`;
          if (await saveAsset(`assets/${name}`, sanitized.text)) r.body.file = `assets/${name}`;
          else { r.body.omitted = 'total-byte-limit'; r.body.truncated = true; }
          delete r.body.text;
        }
      } catch (error) { r.body = { error: String(error.message), unavailable: true }; }
    }, () => { r.body = { omitted: 'pending-limit', truncated: true }; });
  });
  on('Debugger.scriptParsed', e => {
    if (!scoped(e.url)) return;
    if (!admit()) return;
    const r = { scriptId: e.scriptId, url: safeUrl(e.url), ...context(), startLine: e.startLine, endLine: e.endLine };
    evidence.scripts.push(r);
    if (e.length > maxBodyBytes) { r.sourceOmitted = 'size-limit'; r.truncated = true; return; }
    track(async () => {
      try {
        const s = await cdp.send('Debugger.getScriptSource', { scriptId: e.scriptId });
        r.sha256 = hash(s.scriptSource); r.bytes = Buffer.byteLength(s.scriptSource);
        if (!includeScriptSources) r.sourceOmitted = 'embedded-secret-risk';
        else if (r.bytes > maxBodyBytes) { r.sourceOmitted = 'size-limit'; r.truncated = true; }
        else {
          const file = `assets/${r.sha256}.js`; r.redaction = 'none-explicit-opt-in';
          if (await saveAsset(file, s.scriptSource)) r.file = file;
          else { r.sourceOmitted = 'total-byte-limit'; r.truncated = true; }
        }
      } catch (err) { r.error = String(err.message); }
    }, () => { r.sourceOmitted = 'pending-limit'; r.truncated = true; });
  });
  on('Network.webSocketCreated', e => { if (!admit()) return; const s = { requestId: e.requestId, url: url(e.url), inScope: scoped(e.url.replace(/^ws/, 'http')), ...context(), frames: [] }; sockets.set(e.requestId, s); evidence.sockets.push(s); });
  for (const [event, direction] of [['Network.webSocketFrameSent', 'sent'], ['Network.webSocketFrameReceived', 'received']]) on(event, e => {
    const s = sockets.get(e.requestId); if (!s) return;
    if (s.frames.length >= 200 || !admit()) { s.truncated = true; evidence.dropped.frames++; return; }
    s.frames.push({ direction, timestamp: e.timestamp, ...context(), opcode: e.response.opcode,
      ...streamPayload(e.response.payloadData, includeStreamPayloads, s.inScope, maxBodyBytes, e.response.opcode === 1) });
  });
  on('Network.webSocketClosed', e => { const s = sockets.get(e.requestId); if (s) s.closedAt = e.timestamp; });
  const eventCounts = new Map();
  on('Network.eventSourceMessageReceived', e => {
    const count = eventCounts.get(e.requestId) || 0;
    if (count >= 200 || !admit()) { evidence.dropped.frames++; return; }
    eventCounts.set(e.requestId, count + 1);
    const r = current.get(e.requestId);
    evidence.eventSources.push({ requestId: e.requestId, timestamp: e.timestamp, ...context(),
      ...streamPayload(e.data, includeStreamPayloads, !!r?.inScope, maxBodyBytes) });
  });
  await cdp.send('Network.enable', { maxTotalBufferSize: Math.min(maxTotalBytes, maxBodyBytes * 5), maxResourceBufferSize: maxBodyBytes });
  await cdp.send('Debugger.enable');
  return {
    markAction(label, linkedId) { if (finished) throw new Error('Capture finished'); if (!admit()) return null; action = linkedId ?? evidence.actions.length + 1; evidence.actions.push({ id: action, label, observedAt: new Date().toISOString() }); return action; },
    async snapshot(label) {
      if (finished) throw new Error('Capture finished');
      if (!admit()) return { omitted: 'entry-limit', truncated: true };
      if (!scoped(page.url())) throw new Error('Snapshot URL outside origins allowlist');
      await discoverTargets();
      const data = await page.evaluate(async () => {
        const nodes = [...document.querySelectorAll('*')].slice(0, 2000).map((el, index) => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return { index, tag: el.tagName, rect: { x: r.x, y: r.y, width: r.width, height: r.height }, style: { display: s.display, position: s.position, color: s.color, backgroundColor: s.backgroundColor, fontSize: s.fontSize, transform: s.transform, opacity: s.opacity } }; });
        const storage = {}; for (const type of ['localStorage', 'sessionStorage']) { try { storage[type] = { count: window[type].length, valuesOmitted: true }; } catch { storage[type] = { unavailable: true }; } }
        let cacheStorage; try { const names = await caches.keys(); cacheStorage = { count: names.length, namesOmitted: true }; } catch { cacheStorage = { unavailable: true }; }
        return { nodes, nodesTruncated: document.querySelectorAll('*').length > 2000, storage, cacheStorage, viewport: { width: innerWidth, height: innerHeight, scrollX, scrollY } };
      });
      const snap = { label, url: safeUrl(page.url()), ...context(), ...data, frameCoverage: { frames: page.frames().length, topDocumentOnly: true } }; evidence.snapshots.push(snap); return snap;
    },
    async finish() {
      if (finished) return evidence;
      finished = true;
      for (const [event, fn] of handlers) cdp.off(event, fn);
      await Promise.all([...pending]);
      await cdp.detach();
      evidence.finishedAt = new Date().toISOString();
      let serialized = JSON.stringify(evidence, null, 2);
      const groups = ['snapshots', 'requests', 'scripts', 'sockets', 'eventSources', 'targets', 'actions', 'errors'];
      while (Buffer.byteLength(serialized) + evidence.savedAssetBytes > maxTotalBytes) {
        const group = groups.find(key => evidence[key].length);
        if (!group) throw new Error('Metadata exceeds maxTotalBytes; use a larger budget');
        evidence[group].pop(); evidence.dropped.serialization++;
        serialized = JSON.stringify(evidence, null, 2);
      }
      await writeFile(path.join(outDir, 'evidence.json'), serialized, 'utf8');
      return evidence;
    }
  };
}
