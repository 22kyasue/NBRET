import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:https';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { runCapture } from '../src/run.mjs';

const openssl = process.env.NBRET_OPENSSL || ['C:/Program Files/Git/usr/bin/openssl.exe', 'C:/Program Files/Git/mingw64/bin/openssl.exe'].find(existsSync) || 'openssl';
const run = (...args) => promisify(execFile)(openssl, args, { windowsHide: true });

async function makeCa(dir, name) {
  await run('req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', join(dir, `${name}.key`), '-out', join(dir, `${name}.pem`), '-subj', `/CN=NBRET test ${name}`, '-days', '1', '-addext', 'basicConstraints=critical,CA:TRUE', '-addext', 'keyUsage=critical,keyCertSign');
  return join(dir, `${name}.pem`);
}

test('trustCa audits every HTTPS chain against one CA without touching OS trust', { timeout: 60000 }, async () => {
  await mkdir('runs', { recursive: true });
  const root = resolve(`runs/trust-ca-${Date.now()}`); await mkdir(root);
  const ca = await makeCa(root, 'ca'), other = await makeCa(root, 'other');
  await run('req', '-newkey', 'rsa:2048', '-nodes', '-keyout', join(root, 'leaf.key'), '-out', join(root, 'leaf.csr'), '-subj', '/CN=localhost');
  await writeFile(join(root, 'leaf.ext'), 'subjectAltName=DNS:localhost\nbasicConstraints=CA:FALSE\n');
  await run('x509', '-req', '-in', join(root, 'leaf.csr'), '-CA', ca, '-CAkey', join(root, 'ca.key'), '-CAcreateserial', '-out', join(root, 'leaf.pem'), '-days', '1', '-extfile', join(root, 'leaf.ext'));
  const server = createServer({ key: await readFile(join(root, 'leaf.key')), cert: await readFile(join(root, 'leaf.pem')) }, (req, res) => {
    if (req.url === '/result') { res.setHeader('Content-Type', 'application/json'); res.end('{"result":25}'); return; }
    res.setHeader('Content-Type', 'text/html'); res.end('<output></output><script>fetch("/result").then(r=>r.json()).then(x=>document.querySelector("output").textContent=x.result)</script>');
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const url = `https://localhost:${server.address().port}/`, expectations = [{ selector: 'output', text: '25' }];
  const capture = (name, options) => runCapture({ url, outDir: join(root, name), rea: false, copy: false, retainProfile: false, expectations, ...options });
  try {
    const untrusted = await capture('untrusted', {});
    assert.equal(untrusted.capture, 'failed');
    const trusted = await capture('trusted', { trustCa: ca });
    assert.equal(trusted.capture, 'captured', JSON.stringify(trusted.errors));
    assert.deepEqual(trusted.errors, []);
    assert.equal(trusted.assertions[0].passed, true);
    assert.equal(trusted.connection.ignoreHTTPSErrors, false);
    assert.match(trusted.connection.trustedCa.subject, /NBRET test ca/);
    assert.deepEqual(trusted.connection.tlsAudit.origins, [{ origin: url.slice(0, -1), verified: true, browserMatched: true }]);
    const evidence = JSON.parse(await readFile(join(root, 'trusted/network/evidence.json'), 'utf8'));
    assert.equal(evidence.requests.find(r => r.request.url.endsWith('/result')).response.status, 200);
    const wrong = await capture('wrong-ca', { trustCa: other });
    assert.equal(wrong.connection.tlsAudit.failed, 1);
    assert.equal(wrong.connection.tlsAudit.origins[0].reason, 'not-issued-by-trusted-ca');
    assert.ok(wrong.errors.some(e => e.phase === 'tlsAudit'), JSON.stringify(wrong.errors));
    await assert.rejects(capture('leaf-as-ca', { trustCa: join(root, 'leaf.pem') }), /CA certificate/);
    await assert.rejects(capture('both', { trustCa: ca, proxy: 'http://127.0.0.1:9', proxyInsecure: true }), /mutually exclusive/);
  } finally { server.closeAllConnections(); await new Promise(r => server.close(r)); }
});
