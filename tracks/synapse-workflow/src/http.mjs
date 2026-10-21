import http from 'node:http';
import https from 'node:https';
import * as zlib from 'node:zlib';

export class TransportError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

/** Bounded HTTP transport. Redirects are deliberately never followed. */
export function requestBounded(url, { method = 'GET', headers = {}, body, timeoutMs = 10000, maxBytes = 1048576, maxWireBytes = maxBytes } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) return reject(new Error('HTTP(S) URL without credentials required'));
    for (const value of [maxBytes, maxWireBytes]) if (!Number.isSafeInteger(value) || value < 1 || value > 64 * 1024 * 1024) return reject(new Error('Invalid byte budget'));
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) return reject(new Error('Invalid deadline'));
    let req, response, decoder, timer, settled = false, wireBytes = 0, bytes = 0;
    const chunks = [];
    const fail = (code, message) => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      reject(new TransportError(code, message));
      decoder?.destroy(); response?.destroy(); req?.destroy();
    };
    const accepted = typeof zlib.createZstdDecompress === 'function' ? 'gzip, deflate, br, zstd' : 'gzip, deflate, br';
    req = (u.protocol === 'https:' ? https : http).request(u, { method, headers: { 'accept-encoding': accepted, ...headers } }, res => {
      response = res;
      const encoding = (res.headers['content-encoding'] || 'identity').trim().toLowerCase();
      const factories = { gzip: zlib.createGunzip, deflate: zlib.createInflate, br: zlib.createBrotliDecompress, zstd: zlib.createZstdDecompress };
      const noBody = method.toUpperCase() === 'HEAD' || [204, 304].includes(res.statusCode);
      if (!noBody && encoding !== 'identity' && !factories[encoding]) { fail('UNSUPPORTED_ENCODING', 'Unsupported response encoding'); return; }
      if (!noBody && encoding !== 'identity') decoder = factories[encoding]();
      const stream = decoder || res;
      res.on('data', chunk => { wireBytes += chunk.length; if (wireBytes > maxWireBytes) fail('WIRE_BYTE_LIMIT', 'Response exceeds wire byte budget'); });
      res.on('aborted', () => fail('RESPONSE_ABORTED', 'Response ended before completion'));
      res.on('error', () => fail('HTTP_STREAM_ERROR', 'Response stream failed'));
      stream.on('data', chunk => {
        if (settled) return;
        bytes += chunk.length;
        if (bytes > maxBytes) { fail('DECODED_BYTE_LIMIT', 'Response exceeds decoded byte budget'); return; }
        chunks.push(chunk);
      });
      if (decoder) decoder.on('error', () => fail('DECODE_FAILED', 'Response decompression failed'));
      stream.on('end', () => {
        if (settled) return;
        settled = true; clearTimeout(timer);
        resolve({ status: res.statusCode, headers: res.headers, bytes, wireBytes, encoding, body: Buffer.concat(chunks).toString('utf8') });
      });
      if (decoder) res.pipe(decoder);
    });
    timer = setTimeout(() => fail('DEADLINE_EXCEEDED', 'Request deadline exceeded'), timeoutMs);
    req.on('error', error => fail(['ENOTFOUND', 'EAI_AGAIN'].includes(error.code) ? 'DNS_FAILED' :
      ['CERT_HAS_EXPIRED', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'DEPTH_ZERO_SELF_SIGNED_CERT'].includes(error.code) ? 'TLS_FAILED' :
      error.code === 'EACCES' ? 'CONNECT_DENIED' : 'CONNECT_FAILED', 'HTTP connection failed'));
    req.end(body);
  });
}
