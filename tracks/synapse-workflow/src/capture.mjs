import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const secret = /authorization|cookie|token|password|passwd|secret|api[-_]?key|session|credential/i;
const hash = value => createHash('sha256').update(value).digest('hex');
export function clean(value, key = '') {
  if (secret.test(key)) return '[REDACTED]';
  if (typeof value === 'string' && /^(referer|referrer|location|content-location)$/i.test(key)) return safeUrl(value);
  if (Array.isArray(value)) return value.map(v => clean(v));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clean(v, k)]));
  return value;
}
export function safeUrl(value, stripQuery = false) {
  try {
    const u = new URL(value);
    u.username = ''; u.password = ''; u.hash = '';
    if (stripQuery) u.search = '';
    for (const k of [...u.searchParams.keys()]) if (secret.test(k)) u.searchParams.set(k, '[REDACTED]');
    return u.href;
  } catch { return '[INVALID_URL]'; }
}
export function safeStateUrl(value) {
  try {
    const source = new URL(value), safe = new URL(safeUrl(value));
    safe.hash = secret.test(source.hash) ? '[REDACTED]' : source.hash;
    return safe.href;
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

/** Observe a page before navigation. This is browser-visible evidence, not heap recovery. */
export async function startCapture(page, { outDir, origins = [], maxBodyBytes = 1048576, includeScriptSources = false, includeCoverage = false, maxSnapshotNodes = 2000, maxEntries = 2000, maxTotalBytes = 20 * 1024 * 1024, maxPending = 20 } = {}) {
  if (!outDir) throw new Error('outDir is required');
  if (!origins.length) throw new Error('Explicit origins allowlist is required');
  if (!Number.isSafeInteger(maxBodyBytes) || maxBodyBytes < 1) throw new Error('maxBodyBytes must be a positive integer');
  for (const [key, value] of Object.entries({ maxEntries, maxTotalBytes, maxPending })) if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${key} must be a positive integer`);
  if (maxTotalBytes < 4096) throw new Error('maxTotalBytes must be at least 4096');
  if (typeof includeCoverage !== 'boolean' || !Number.isSafeInteger(maxSnapshotNodes) || maxSnapshotNodes < 1 || maxSnapshotNodes > 20000) throw new Error('Invalid observation options');
  const allowed = new Set(origins.map(o => new URL(o).origin));
  const scoped = url => { try { return allowed.has(new URL(url).origin); } catch { return false; } };
  await mkdir(path.join(outDir, 'assets'), { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const evidence = { schemaVersion: 1, startedAt: new Date().toISOString(), origins: [...allowed], actions: [], requests: [], scripts: [], sockets: [], snapshots: [], errors: [], limitations: ['Browser-visible traffic only; no server code or heap recovery.', 'HTTP cache visibility is CDP metadata; Cache Storage lists names and counts only.', 'Secrets are key-redacted; unstructured bodies and WebSocket payloads are omitted.', 'Scripts without an allowlisted URL are omitted; source persistence requires explicit includeScriptSources opt-in.', 'Only this page CDP target is observed; workers and cross-process frames may be incomplete.'] };
  evidence.navigation = []; evidence.consoleMetadata = [];
  evidence.options = { maxBodyBytes, includeScriptSources, maxEntries, maxTotalBytes, maxPending };
  evidence.options.includeCoverage = includeCoverage; evidence.options.maxSnapshotNodes = maxSnapshotNodes;
  evidence.coverage = []; evidence.coverageSummary = { status: includeCoverage ? 'pending' : 'disabled' };
  evidence.dropped = { entries: 0, pending: 0, bytes: 0, frames: 0, serialization: 0 };
  evidence.savedAssetBytes = 0;
  if (includeScriptSources) evidence.limitations.push('Script source saving explicitly enabled: raw JavaScript may contain embedded secrets and is NOT redacted.');
  const current = new Map(), sockets = new Map(), pending = new Set();
  let action = null, finished = false, coverageActive = false, lastActivity = Date.now();
  const context = () => ({ actionId: action, observationIntervalId: action, association: 'temporal-not-causal', observedAt: new Date().toISOString() });
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
    await writeFile(path.join(outDir, file), text, 'utf8'); return true;
  };
  const url = value => safeUrl(value, !scoped(value.replace(/^ws/, 'http')));
  const post = request => !request.postData ? undefined : Buffer.byteLength(request.postData) > maxBodyBytes ? { omitted: 'size-limit', truncated: true } : payload(request.postData, request.headers['Content-Type'] || request.headers['content-type']);
  const handlers = [];
  const on = (event, fn) => { handlers.push([event, fn]); cdp.on(event, fn); };
  on('Page.navigatedWithinDocument', e => {
    if (admit()) evidence.navigation.push({ kind: 'within-document', url: url(e.url), frameId: e.frameId, ...context() });
  });
  on('Page.frameNavigated', e => {
    if (admit()) evidence.navigation.push({ kind: 'document', url: url(e.frame.url), frameId: e.frame.id, mainFrame: !e.frame.parentId, ...context() });
  });
  on('Runtime.consoleAPICalled', e => {
    if (admit()) evidence.consoleMetadata.push({ type: e.type, timestamp: e.timestamp, argumentCount: e.args?.length || 0,
      textOmitted: true, frames: (e.stackTrace?.callFrames || []).slice(0, 5).filter(f => scoped(f.url)).map(f => ({ functionName: f.functionName, url: url(f.url), lineNumber: f.lineNumber, columnNumber: f.columnNumber })), ...context() });
  });
  on('Network.requestWillBeSent', e => {
    lastActivity = Date.now();
    if (!admit()) { current.delete(e.requestId); return; }
    const prev = current.get(e.requestId);
    if (prev && e.redirectResponse) { prev.response = { url: url(e.redirectResponse.url), status: e.redirectResponse.status, mimeType: e.redirectResponse.mimeType }; prev.redirected = true; }
    const inScope = scoped(e.request.url);
    const rec = { requestId: e.requestId, hop: prev ? prev.hop + 1 : 0, ...context(), timestamp: e.timestamp, wallTime: e.wallTime, inScope, request: { url: url(e.request.url), method: e.request.method, headers: inScope ? clean(e.request.headers) : '[OUT_OF_SCOPE]', postData: inScope ? post(e.request) : undefined }, initiator: { type: e.initiator.type, frames: inScope ? (e.initiator.stack?.callFrames || []).map(f => ({ functionName: f.functionName, url: url(f.url), lineNumber: f.lineNumber, columnNumber: f.columnNumber })) : [] } };
    if (e.request.postData && Buffer.byteLength(e.request.postData) > maxBodyBytes) rec.request.postData = { omitted: 'size-limit', truncated: true };
    current.set(e.requestId, rec); evidence.requests.push(rec);
    rec.resourceType = e.type;
  });
  on('Network.responseReceived', e => {
    const r = current.get(e.requestId); if (!r) return;
    const v = e.response;
    r.response = { url: url(v.url), status: v.status, mimeType: v.mimeType, protocol: v.protocol, headers: r.inScope ? clean(v.headers) : '[OUT_OF_SCOPE]', fromDiskCache: !!v.fromDiskCache, fromPrefetchCache: !!v.fromPrefetchCache, fromServiceWorker: !!v.fromServiceWorker, timing: v.timing, timestamp: e.timestamp };
  });
  on('Network.requestServedFromCache', e => { const r = current.get(e.requestId); if (r) r.servedFromCache = true; });
  on('Network.loadingFailed', e => { const r = current.get(e.requestId); if (r) r.failure = { errorText: e.errorText, canceled: e.canceled, blockedReason: e.blockedReason, timestamp: e.timestamp }; });
  on('Network.loadingFinished', e => {
    lastActivity = Date.now();
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
    s.frames.push({ direction, timestamp: e.timestamp, ...context(), opcode: e.response.opcode, payloadBytes: Buffer.byteLength(e.response.payloadData), payloadOmitted: 'secret-safety' });
  });
  await cdp.send('Network.enable', { maxTotalBufferSize: Math.min(maxTotalBytes, maxBodyBytes * 5), maxResourceBufferSize: maxBodyBytes });
  await cdp.send('Debugger.enable');
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  if (includeCoverage) {
    try {
      await cdp.send('Profiler.enable');
      await cdp.send('Profiler.startPreciseCoverage', { callCount: true, detailed: true });
      coverageActive = true;
    } catch { evidence.coverageSummary = { status: 'unavailable', code: 'PROFILER_UNAVAILABLE' }; }
  }
  return {
    async waitForIdle({ timeoutMs = 10000, quietMs = 500 } = {}) {
      if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 0 || timeoutMs > 30000 || !Number.isSafeInteger(quietMs) || quietMs < 0 || quietMs > 5000) throw new Error('Invalid idle budget');
      const deadline = Date.now() + timeoutMs;
      let open;
      do {
        open = [...current.values()].filter(r => !r.finished && !r.failure && !r.redirected && !['Media', 'EventSource', 'WebSocket'].includes(r.resourceType)).length;
        if (!open && !pending.size && Date.now() - lastActivity >= quietMs) return { settled: true, openRequests: open, pendingTasks: pending.size };
        if (Date.now() >= deadline) return { settled: false, openRequests: open, pendingTasks: pending.size };
        await new Promise(r => setTimeout(r, Math.min(100, deadline - Date.now())));
      } while (true);
    },
    markAction(label) { if (finished) throw new Error('Capture finished'); if (!admit()) return null; action = evidence.actions.length + 1; evidence.actions.push({ id: action, label, observedAt: new Date().toISOString() }); return action; },
    async snapshot(label) {
      if (finished) throw new Error('Capture finished');
      if (!admit()) return { omitted: 'entry-limit', truncated: true };
      if (!scoped(page.url())) throw new Error('Snapshot URL outside origins allowlist');
      const data = await page.evaluate(async maxNodes => {
        const nodes = [...document.querySelectorAll('*')].slice(0, maxNodes).map((el, index) => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return { index, tag: el.tagName, rect: { x: r.x, y: r.y, width: r.width, height: r.height }, style: { display: s.display, position: s.position, color: s.color, backgroundColor: s.backgroundColor, fontSize: s.fontSize, transform: s.transform, opacity: s.opacity } }; });
        const storage = {}; for (const type of ['localStorage', 'sessionStorage']) { try { storage[type] = { count: window[type].length, valuesOmitted: true }; } catch { storage[type] = { unavailable: true }; } }
        let cacheStorage; try { const names = await caches.keys(); cacheStorage = { count: names.length, namesOmitted: true }; } catch { cacheStorage = { unavailable: true }; }
        const rendered = el => !!el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
        const label = el => el.getAttribute('aria-label') || (el.getAttribute('aria-labelledby') || '').split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim() || el.textContent?.trim() || el.getAttribute('title') || el.querySelector('img[alt]')?.getAttribute('alt');
        const accessibility = { basis: 'DOM heuristics; not a complete accessibility audit',
          renderedImagesMissingAlt: [...document.querySelectorAll('img:not([alt])')].filter(rendered).length,
          renderedButtonsMissingName: [...document.querySelectorAll('button,[role="button"]')].filter(el => rendered(el) && !label(el)).length };
        const nav = performance.getEntriesByType('navigation')[0];
        const performanceTiming = nav ? { responseStartMs: nav.responseStart, domContentLoadedMs: nav.domContentLoadedEventEnd || null,
          loadMs: nav.loadEventEnd || null, navigationType: nav.type,
          observedResourceEntries: performance.getEntriesByType('resource').length,
          basis: 'Browser navigation timings in an instrumented observation; not a controlled performance benchmark' } : null;
        const links = [...document.querySelectorAll('a[href]')].slice(0, 300).map(el => ({ href: el.href, target: el.target,
          rel: el.rel, rendered: rendered(el), label: (label(el) || '').slice(0, 200), title: (el.title || '').slice(0, 200),
          role: el.getAttribute('role'), ariaDisabled: el.getAttribute('aria-disabled'), download: el.hasAttribute('download'),
          fragmentTargetExists: (() => { try { const u = new URL(el.href); return !!u.hash && u.origin === location.origin && u.pathname === location.pathname && !!document.getElementById(decodeURIComponent(u.hash.slice(1))); } catch { return false; } })() }));
        return { nodes, links, linksTruncated: document.querySelectorAll('a[href]').length > 300, nodesTruncated: document.querySelectorAll('*').length > maxNodes, storage, cacheStorage, accessibility, performanceTiming,
          viewport: { width: innerWidth, height: innerHeight, scrollX, scrollY } };
      }, maxSnapshotNodes);
      data.links = data.links.map(link => ({ ...link, href: safeStateUrl(link.href) }));
      const snap = { label, url: safeStateUrl(page.url()), ...context(), ...data }; evidence.snapshots.push(snap); return snap;
    },
    async finish() {
      if (finished) return evidence;
      finished = true;
      for (const [event, fn] of handlers) cdp.off(event, fn);
      await Promise.all([...pending]);
      if (coverageActive) {
        try {
          const coverage = await cdp.send('Profiler.takePreciseCoverage');
          let rangeCount = 0, droppedRanges = 0;
          for (const script of coverage.result) {
            if (!scoped(script.url)) continue;
            const functions = [];
            for (const fn of script.functions) {
              if (rangeCount + fn.ranges.length > 50000) { droppedRanges += fn.ranges.length; continue; }
              rangeCount += fn.ranges.length;
              functions.push({ functionName: fn.functionName, isBlockCoverage: fn.isBlockCoverage, ranges: fn.ranges });
            }
            evidence.coverage.push({ scriptId: script.scriptId, url: safeUrl(script.url), functions });
          }
          const all = evidence.coverage.flatMap(s => s.functions);
          evidence.coverageSummary = { status: 'captured', functions: all.length,
            executedFunctions: all.filter(f => f.ranges[0]?.count > 0).length, rangeCount, droppedRanges,
            basis: 'V8 precise function/block counts during this observation; not complete application path coverage' };
        } catch { evidence.coverageSummary = { status: 'unavailable', code: 'PROFILER_CAPTURE_FAILED' }; }
        try { await cdp.send('Profiler.stopPreciseCoverage'); await cdp.send('Profiler.disable'); } catch {}
      }
      await cdp.detach();
      evidence.finishedAt = new Date().toISOString();
      let serialized = JSON.stringify(evidence, null, 2);
      const groups = ['snapshots', 'requests', 'scripts', 'sockets', 'coverage', 'actions', 'errors', 'navigation', 'consoleMetadata'];
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
