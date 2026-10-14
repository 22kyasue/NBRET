import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { readEvidence } from './evidence.mjs';
import { X509Certificate } from 'node:crypto';
import { isIP } from 'node:net';

// Chrome's SPKI allow-list flag only matches leaf keys, so a proxy CA cannot be trusted per process. Instead the
// browser accepts certificates and every HTTPS origin's served chain is audited against the expected CA afterwards.
export async function loadTrustedCa(file) {
  const cert = new X509Certificate(await readFile(file));
  if (!cert.ca) throw new Error('trustCa must be a CA certificate');
  return { cert, record: { subject: cert.subject.replace(/\n/g, ', '), sha256: cert.fingerprint256, mode: 'post-hoc chain audit', scope: 'Certificate errors are accepted during capture; each HTTPS origin chain is then verified against this CA. No OS trust store change.' } };
}

export function auditChain(derChain, host, ca, now = new Date(), browser) {
  const certs = derChain.map(b64 => new X509Certificate(Buffer.from(b64, 'base64')));
  if (!certs.length) return { verified: false, reason: 'no-certificate' };
  const valid = c => new Date(c.validFrom) <= now && now <= new Date(c.validTo);
  for (let i = 0; i + 1 < certs.length; i++) if (!certs[i].checkIssued(certs[i + 1]) || !certs[i].verify(certs[i + 1].publicKey)) return { verified: false, reason: 'broken-chain' };
  const last = certs.at(-1), anchored = last.fingerprint256 === ca.fingerprint256 || (last.checkIssued(ca) && last.verify(ca.publicKey));
  if (!anchored) return { verified: false, reason: 'not-issued-by-trusted-ca', issuer: certs[0].issuer.replace(/\n/g, ', ') };
  if (!certs.every(valid)) return { verified: false, reason: 'expired-or-not-yet-valid' };
  if (!(isIP(host) ? certs[0].checkIP(host) : certs[0].checkHost(host))) return { verified: false, reason: 'host-mismatch' };
  // Tie the separately fetched chain to the browser's own connection using the details Chrome reported for it.
  if (browser) {
    const cn = name => /(?:^|\n)CN=([^\n]*)/.exec(name)?.[1];
    const same = browser.subjectName === cn(certs[0].subject) && browser.issuer === cn(certs[0].issuer) && Math.abs(browser.validTo * 1000 - new Date(certs[0].validTo)) < 1000;
    if (!same) return { verified: false, reason: 'browser-certificate-differs' };
  }
  return { verified: true, browserMatched: !!browser };
}

// Keep credentials out of CLI arguments, reports, and saved proxy configuration.
export function proxyOptions(server, ignoreHTTPSErrors = false) {
  if (ignoreHTTPSErrors && !server) throw new Error('--proxy-insecure requires --proxy');
  if (!server) return {};
  const u = new URL(server);
  if (!['http:', 'https:', 'socks5:'].includes(u.protocol) || !u.hostname || u.username || u.password || !['', '/'].includes(u.pathname) || u.search || u.hash) {
    throw new Error('Proxy must be an HTTP(S) or SOCKS5 origin without credentials, path, query, or fragment');
  }
  return { proxy: { server: u.origin === 'null' ? `${u.protocol}//${u.host}` : u.origin }, ignoreHTTPSErrors };
}

const excludedHeader = /^(host|content-length|connection|transfer-encoding|accept-encoding|authorization|cookie|proxy-authorization)$/i;

export async function exportInvestigation(evidence) {
  const items = [], endpoints = new Map();
  for (const r of evidence.requests || []) {
    if (!r.inScope) continue;
    const { method, url } = r.request;
    const u = new URL(url);
    const key = `${method} ${u.origin}${u.pathname}`;
    const endpoint = endpoints.get(key) || { method, url: `${u.origin}${u.pathname}`, observations: 0, statuses: [], queryKeys: [], actionIds: [], cacheHits: 0, unavailableBodies: 0 };
    endpoint.observations++;
    for (const [field, values] of [['statuses', [r.response?.status]], ['queryKeys', [...u.searchParams.keys()]], ['actionIds', [r.actionId]]]) {
      for (const value of values) if (value != null && !endpoint[field].includes(value)) endpoint[field].push(value);
    }
    if (r.servedFromCache || r.response?.fromDiskCache || r.response?.fromPrefetchCache || r.response?.fromServiceWorker) endpoint.cacheHits++;
    if (r.body?.unavailable || r.body?.omitted || r.body?.truncated) endpoint.unavailableBodies++;
    endpoints.set(key, endpoint);
    const header = Object.entries(r.request.headers || {}).filter(([k, v]) => !excludedHeader.test(k) && typeof v === 'string' && !v.includes('[REDACTED]')).map(([key, value]) => ({ key, value }));
    const request = { method, url, header, description: `Recorded request ${r.requestId}, hop ${r.hop || 0}, action ${r.actionId ?? 'none'}. Review before sending; credentials are omitted and sensitive fields may contain [REDACTED]. This is a recorded example, not a backend implementation.` };
    const post = r.request.postData;
    if (typeof post?.text === 'string') request.body = { mode: 'raw', raw: post.text };
    else if (post) request.description += ' Request body was omitted; reconstruct it before sending.';
    items.push({ name: `${method} ${u.pathname} [${r.requestId}:${r.hop || 0}]`, request });
  }
  return {
    collection: { info: { name: 'NBRET captured requests — review before sending', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json', description: 'Offline export. No requests were replayed. Headers and payloads inherit NBRET capture redaction; review URLs and all data before sharing. Authorization and cookie headers are excluded. Replaying writes can repeat real actions.' }, item: items },
    inventory: { schemaVersion: 1, identity: evidence.identity || null, source: 'network/evidence.json', limitations: evidence.limitations || [], dropped: evidence.dropped || {}, endpoints: [...endpoints.values()] },
  };
}

export async function writeInvestigation(runDir) {
  const networkDir = join(resolve(runDir), 'network');
  let summary = {};
  try { summary = JSON.parse(await readFile(join(resolve(runDir), 'summary.json'), 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const { evidence } = await readEvidence(resolve(runDir), summary);
  const result = await exportInvestigation(evidence);
  const out = join(resolve(runDir), 'investigation');
  await mkdir(out, { recursive: false });
  await Promise.all([
    writeFile(join(out, 'postman.collection.json'), JSON.stringify(result.collection, null, 2)),
    writeFile(join(out, 'endpoints.json'), JSON.stringify(result.inventory, null, 2)),
  ]);
  return { out, requests: result.collection.item.length, endpoints: result.inventory.endpoints.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { run: { type: 'string' }, help: { type: 'boolean' } } });
  if (values.help || !values.run) {
    console.log('Usage: npm run investigate -- --run runs/capture-name\nExports existing evidence without network access. Creates a new investigation directory; never overwrites an earlier export.');
    process.exitCode = values.help ? 0 : 1;
  } else console.log(JSON.stringify(await writeInvestigation(values.run), null, 2));
}
