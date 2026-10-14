import http from 'node:http';
import https from 'node:https';
import tls from 'node:tls';
import net from 'node:net';
import { proxyOptions } from './investigation.mjs';

// Strict, process-scoped CA trust for local proxy diagnostics. No OS trust writes.
export async function localProxyGet({ proxy, url, ca }) {
  proxyOptions(proxy);
  const p = new URL(proxy), target = new URL(url);
  if (p.protocol !== 'http:' || !['127.0.0.1', '[::1]'].includes(p.hostname) || target.protocol !== 'https:' || !['127.0.0.1', '[::1]', 'localhost'].includes(target.hostname) || target.username || target.password) throw new Error('Diagnostic requires HTTP loopback proxy and HTTPS loopback target');
  return new Promise((resolve, reject) => {
    let socket, request;
    const fail = error => { socket?.destroy(); request?.destroy(); reject(Object.assign(new Error('Scoped proxy TLS verification failed'), { code: error.code || 'PROXY_TLS_FAILED' })); };
    const tunnel = http.request({ hostname: p.hostname.replace(/[\[\]]/g, ''), port: p.port || 80, method: 'CONNECT', path: target.host, timeout: 10000 });
    tunnel.on('error', fail); tunnel.on('timeout', () => tunnel.destroy(Object.assign(new Error(), { code: 'TIMEOUT' })));
    tunnel.on('connect', (response, raw, head) => {
      socket = raw;
      if (response.statusCode !== 200 || head.length) { fail({ code: 'CONNECT_REJECTED' }); return; }
      const host = target.hostname.replace(/[\[\]]/g, '');
      const secure = tls.connect({ socket: raw, ca, rejectUnauthorized: true, ...(host === 'localhost' ? { servername: host } : {}), checkServerIdentity: (_, cert) => tls.checkServerIdentity(host, cert) });
      socket = secure;
      secure.setTimeout(10000, () => fail({ code: 'TIMEOUT' })); secure.on('error', fail);
      secure.once('secureConnect', () => {
        const peer = secure.getPeerCertificate();
        const agent = new https.Agent({ keepAlive: false });
        agent.createConnection = () => secure;
        request = https.request({ hostname: host, port: target.port || 443, path: target.pathname + target.search, method: 'GET', agent }, response => {
          const chunks = []; let size = 0;
          response.on('data', chunk => { size += chunk.length; if (size > 1048576) fail({ code: 'BODY_LIMIT' }); else chunks.push(chunk); });
          response.on('error', fail); response.on('end', () => { secure.destroy(); resolve({ status: response.statusCode, body: Buffer.concat(chunks).toString('utf8'), authorized: secure.authorized, peerFingerprint: peer.fingerprint256 }); });
        });
        request.on('error', fail); request.end();
      });
    });
    tunnel.end();
  });
}

// TLS handshake only (no HTTP request): the chain an origin serves, directly or through the capture proxy.
export async function fetchServedChain(origin, proxy) {
  const target = new URL(origin), host = target.hostname.replace(/[\[\]]/g, ''), port = Number(target.port || 443);
  const raw = await new Promise((resolve, reject) => {
    if (!proxy) { resolve(null); return; }
    const p = new URL(proxyOptions(proxy).proxy.server);
    if (p.protocol !== 'http:') { reject(new Error('Chain audit supports HTTP proxies only')); return; }
    const tunnel = http.request({ hostname: p.hostname.replace(/[\[\]]/g, ''), port: p.port || 80, method: 'CONNECT', path: `${host}:${port}`, timeout: 10000 });
    tunnel.on('error', reject); tunnel.on('timeout', () => tunnel.destroy(new Error('CONNECT timeout')));
    tunnel.on('connect', (response, socket) => response.statusCode === 200 ? resolve(socket) : (socket.destroy(), reject(new Error('CONNECT rejected'))));
    tunnel.end();
  });
  return new Promise((resolve, reject) => {
    const secure = tls.connect({ ...(raw ? { socket: raw } : { host, port }), servername: net.isIP(host) ? undefined : host, rejectUnauthorized: false, timeout: 10000 });
    secure.on('error', reject); secure.on('timeout', () => secure.destroy(new Error('TLS timeout')));
    secure.once('secureConnect', () => {
      const chain = [], seen = new Set();
      for (let c = secure.getPeerCertificate(true); c?.raw && !seen.has(c.fingerprint256); c = c.issuerCertificate) { seen.add(c.fingerprint256); chain.push(c.raw.toString('base64')); }
      secure.destroy(); resolve(chain);
    });
  });
}
