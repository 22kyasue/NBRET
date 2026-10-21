import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createScope } from './scope.mjs';
import { requestBounded } from './http.mjs';
import { safeUrl } from './capture.mjs';

export async function runScan({ origins, urls, outDir, endpoint = 'http://127.0.0.1:8090', apiKey,
  active = false, maxMs = 120000, pollMs = 500, maxUrls = 10, scopeMode = 'urls', transport = requestBounded } = {}) {
  const scope = createScope(origins), api = new URL(endpoint);
  if (typeof active !== 'boolean') throw new Error('active must be boolean');
  if (!['urls', 'origins'].includes(scopeMode)) throw new Error('Invalid scanner scope mode');
  if (!['127.0.0.1', '[::1]', 'localhost'].includes(api.hostname) || api.protocol !== 'http:' || api.username || api.password || api.search || api.hash || api.pathname !== '/') throw new Error('Loopback ZAP API endpoint required');
  if (!Array.isArray(urls) || !urls.length || urls.length > maxUrls || !Number.isSafeInteger(maxUrls) || maxUrls < 1 || maxUrls > 30) throw new Error('Explicit bounded scan URLs required');
  urls.forEach(url => scope.require(url));
  if (!Number.isSafeInteger(maxMs) || maxMs < 1000 || maxMs > 600000 || !Number.isSafeInteger(pollMs) || pollMs < 10 || pollMs > 10000) throw new Error('Invalid scanner budget');
  await mkdir(outDir, { recursive: false });
  const result = { schemaVersion: 1, tier: 4, mode: active ? 'active' : 'passive', origins: scope.origins, scopeMode,
    urls: urls.map(url => safeUrl(url)), startedAt: new Date().toISOString(), maxMs, status: 'pending', scans: [], alerts: [], errors: [],
    limitations: ['ZAP findings require review; absence of alerts is not proof of security.', 'Only explicitly listed URLs are seeded; recursive scanning and spidering are disabled.', 'Active scanning sends attack requests and requires explicit authorization for the supplied scope.'] };
  const name = `nbret-${randomUUID()}`; let contextId, pendingScan, lastOperation;
  const deadline = Date.now() + maxMs;
  const call = async (component, type, operation, params = {}, cleanup = false) => {
    lastOperation = `${component}/${type}/${operation}`;
    const remaining = cleanup ? 10000 : deadline - Date.now();
    if (remaining < 1) throw new Error('Scan deadline exceeded');
    const u = new URL(`/JSON/${component}/${type}/${operation}/`, api);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
    const response = await transport(u.href, { headers: apiKey ? { 'X-ZAP-API-Key': apiKey } : {}, timeoutMs: Math.min(10000, remaining), maxBytes: 4 * 1024 * 1024 });
    if (response.status !== 200) throw new Error('ZAP HTTP failure');
    const data = JSON.parse(response.body);
    if (data.code || data.error) throw new Error('ZAP API failure');
    return data;
  };
  const seeded = async url => {
    while (true) {
      const known = (await call('core', 'view', 'urls', { baseurl: url })).urls;
      if (!Array.isArray(known)) throw new Error('Missing ZAP URL history');
      if (known.some(value => value === url || new URL(value).href === new URL(url).href)) return;
      await pause();
    }
  };
  const pause = () => new Promise(resolve => setTimeout(resolve, Math.max(0, Math.min(pollMs, deadline - Date.now()))));
  try {
    result.version = (await call('core', 'view', 'version')).version;
    contextId = (await call('context', 'action', 'newContext', { contextName: name })).contextId;
    if (contextId === undefined) throw new Error('Missing ZAP context');
    const contextScopes = scopeMode === 'origins' ? scope.origins : [...new Set(urls.map(value => {
      const u = new URL(value); return u.origin + u.pathname;
    }))];
    for (const target of contextScopes) {
      const regex = `^${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${scopeMode === 'origins' ? '(?:/.*)?' : '(?:\\?.*)?'}$`;
      await call('context', 'action', 'includeInContext', { contextName: name, regex });
    }
    await call('context', 'action', 'setContextInScope', { contextName: name, booleanInScope: true });
    for (const url of urls) {
      await call('core', 'action', 'accessUrl', { url, followRedirects: false });
      // accessUrl can return before the new history node is visible to ActiveScanAPI.
      await seeded(url);
      if (!active) continue;
      const scanId = (await call('ascan', 'action', 'scan', { url, recurse: false, inScopeOnly: true, contextId })).scan;
      if (scanId === undefined) throw new Error('Missing ZAP scan ID');
      pendingScan = scanId;
      const scan = { id: scanId, url: safeUrl(url), progress: 0 }; result.scans.push(scan);
      while (scan.progress < 100) {
        scan.progress = Number((await call('ascan', 'view', 'status', { scanId })).status);
        if (!Number.isFinite(scan.progress) || scan.progress < 0 || scan.progress > 100) throw new Error('Invalid ZAP progress');
        if (scan.progress < 100) await pause();
      }
      pendingScan = undefined;
    }
    while (true) {
      const records = Number((await call('pscan', 'view', 'recordsToScan')).recordsToScan);
      if (!Number.isSafeInteger(records) || records < 0) throw new Error('Invalid passive scan status');
      if (!records) break;
      await pause();
    }
    // Fetch alerts in bounded pages. Filter exact origin locally as well as at ZAP.
    for (const origin of scope.origins) {
      for (let start = 0; start < 1000; start += 100) {
        const alerts = (await call('core', 'view', 'alerts', { baseurl: origin + '/', start, count: 100 })).alerts;
        if (!Array.isArray(alerts)) throw new Error('Missing ZAP alerts');
        for (const a of alerts) if (scope.allows(a.url)) result.alerts.push({ pluginId: a.pluginId, name: a.alert,
          risk: a.risk, confidence: a.confidence, url: safeUrl(a.url), cweId: a.cweid, wascId: a.wascid });
        if (alerts.length < 100) break;
        if (start === 900) result.alertsTruncated = true;
      }
    }
    result.status = result.alertsTruncated ? 'bounded' : 'completed';
  } catch { result.status = Date.now() >= deadline ? 'timed-out' : 'failed'; result.errors.push({ code: 'SCAN_FAILED', operation: lastOperation, message: 'ZAP unavailable, scan deadline exceeded, or API operation failed' }); }
  finally {
    if (pendingScan !== undefined) {
      try { await call('ascan', 'action', 'stop', { scanId: pendingScan }, true); result.stoppedOwnedScan = true; }
      catch { result.errors.push({ code: 'SCAN_STOP_FAILED', scanId: pendingScan }); }
    }
    if (contextId !== undefined) {
      try { await call('context', 'action', 'removeContext', { contextName: name }, true); result.contextRemoved = true; }
      catch { result.errors.push({ code: 'CONTEXT_CLEANUP_FAILED' }); }
    }
    result.finishedAt = new Date().toISOString();
    if (result.errors.length && result.status === 'completed') result.status = 'incomplete';
    await writeFile(join(outDir, 'scan.json'), JSON.stringify(result, null, 2));
  }
  return result;
}
