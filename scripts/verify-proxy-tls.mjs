import assert from 'node:assert/strict';
import { createServer as httpServer } from 'node:http';
import { createServer as httpsServer } from 'node:https';
import { connect } from 'node:net';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, resolve } from 'node:path';
import { runCapture } from '../src/run.mjs';
import { parseArgs } from 'node:util';
import { proxyOptions } from '../src/investigation.mjs';

const { values } = parseArgs({ options: { proxy: { type: 'string' } } });
if (values.proxy) proxyOptions(values.proxy);

const openssl = process.env.NBRET_OPENSSL || ['C:/Program Files/Git/usr/bin/openssl.exe', 'C:/Program Files/Git/mingw64/bin/openssl.exe'].find(existsSync) || 'openssl';
await mkdir('runs', { recursive: true });
const root = resolve(`runs/proxy-tls-${Date.now()}`);
await mkdir(root);
await promisify(execFile)(openssl, ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', join(root, 'key.pem'), '-out', join(root, 'cert.pem'), '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1', '-days', '1'], { windowsHide: true });
const secure = httpsServer({ key: await readFile(join(root, 'key.pem')), cert: await readFile(join(root, 'cert.pem')) }, (req, res) => {
  if (req.url === '/result') { res.setHeader('Content-Type', 'application/json'); res.end('{"result":25}'); return; }
  res.setHeader('Content-Type', 'text/html');
  res.end('<button onclick="fetch(\'/result\').then(r=>r.json()).then(x=>document.querySelector(\'output\').textContent=x.result)">Read</button><output></output>');
});
const sockets = new Set(), tunnels = [];
const track = socket => { sockets.add(socket); socket.on('close', () => sockets.delete(socket)); };
const proxy = httpServer((req, res) => { res.writeHead(403); res.end(); });
proxy.on('connection', track);
try {
  await new Promise(resolve => secure.listen(0, '127.0.0.1', resolve));
  const authority = `127.0.0.1:${secure.address().port}`;
  proxy.on('connect', (req, client, head) => {
    if (req.url !== authority) { client.end('HTTP/1.1 403 Forbidden\r\n\r\n'); return; }
    tunnels.push(req.url);
    const upstream = connect(secure.address().port, '127.0.0.1'); track(upstream);
    upstream.on('connect', () => {
      client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head.length) upstream.write(head);
      client.pipe(upstream); upstream.pipe(client);
    });
    upstream.on('error', () => client.destroy()); client.on('error', () => upstream.destroy());
    client.on('close', () => upstream.destroy());
  });
  if (!values.proxy) await new Promise(resolve => proxy.listen(0, '127.0.0.1', resolve));
  const proxyUrl = values.proxy || `http://127.0.0.1:${proxy.address().port}`;
  const strict = await runCapture({ url: `https://${authority}/`, outDir: join(root, 'strict'), proxy: proxyUrl, rea: false, copy: false, scenarioId: 'tls-strict' });
  if (!values.proxy) assert.equal(strict.capture, 'failed', 'Untrusted fixture certificate fails by default');
  const optedIn = await runCapture({ url: `https://${authority}/`, outDir: join(root, 'opted-in'), proxy: proxyUrl, proxyInsecure: true, rea: false, copy: false, scenarioId: 'tls-opt-in', actions: [{ type: 'click', selector: 'button' }] });
  assert.equal(optedIn.capture, 'captured');
  const evidence = JSON.parse(await readFile(join(root, 'opted-in/network/evidence.json'), 'utf8'));
  const response = evidence.requests.find(r => r.request.url.endsWith('/result'));
  assert.deepEqual(JSON.parse(await readFile(join(root, 'opted-in/network', response.body.file), 'utf8')), { result: 25 });
  if (!values.proxy) assert.ok(tunnels.length >= 2);
  const receipt = { root, proxy: proxyUrl, fixture: `https://${authority}/`, strict: strict.capture, explicitTlsOptIn: optedIn.capture, connectTunnels: values.proxy ? null : tunnels.length, verifiedResult: 25,
    limitation: values.proxy ? 'Capture/output verified; confirm external proxy routing independently in its history. Strict-mode result depends on existing certificate trust. No trust stores changed.' : 'Local CONNECT tunnel verified; this does not verify Burp interception or trust of a proxy CA. No system/browser shared trust store changed.' };
  await writeFile(join(root, 'proxy-tls-check.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
} finally {
  for (const socket of sockets) socket.destroy();
  secure.closeAllConnections(); proxy.closeAllConnections();
  await Promise.all([secure, proxy].filter(server => server.listening).map(server => new Promise(resolve => server.close(resolve))));
}
