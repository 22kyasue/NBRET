import { parseArgs } from 'node:util';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:https';
import assert from 'node:assert/strict';
import { runCapture } from '../src/run.mjs';

// HTTPS capture through an intercepting proxy with its CA audited per origin: no OS trust change, no prompts.
const { values } = parseArgs({ options: { ca: { type: 'string' }, proxy: { type: 'string', default: 'http://127.0.0.1:8080' } } });
if (!values.ca) throw new Error('Usage: node scripts/verify-proxy-audit.mjs --ca proxy-ca.pem [--proxy http://127.0.0.1:8080]');
const openssl = process.env.NBRET_OPENSSL || ['C:/Program Files/Git/usr/bin/openssl.exe', 'C:/Program Files/Git/mingw64/bin/openssl.exe'].find(existsSync) || 'openssl';
const root = resolve(`runs/proxy-audit-${Date.now()}`); await mkdir(root, { recursive: true });
await promisify(execFile)(openssl, ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', join(root, 'key.pem'), '-out', join(root, 'cert.pem'), '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost', '-days', '1'], { windowsHide: true });
const server = createServer({ key: await readFile(join(root, 'key.pem')), cert: await readFile(join(root, 'cert.pem')) }, (req, res) => {
  if (req.url === '/result') { res.setHeader('Content-Type', 'application/json'); res.end('{"result":25}'); return; }
  res.setHeader('Content-Type', 'text/html'); res.end('<button onclick="fetch(\'/result\').then(r=>r.json()).then(x=>document.querySelector(\'output\').textContent=x.result)">Read</button><output></output>');
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
try {
  const summary = await runCapture({ url: `https://localhost:${server.address().port}/`, outDir: join(root, 'capture'), proxy: values.proxy, trustCa: resolve(values.ca), rea: false, copy: false, retainProfile: false,
    actions: [{ type: 'click', selector: 'button' }], expectations: [{ selector: 'output', text: '25' }], scenarioId: 'proxy-audit' });
  const receipt = { root, proxy: values.proxy, trustedCa: summary.connection.trustedCa, tlsAudit: summary.connection.tlsAudit, assertions: summary.assertions, errors: summary.errors };
  await writeFile(join(root, 'receipt.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
  assert.deepEqual(summary.errors, []); assert.equal(summary.assertions[0].passed, true); assert.equal(summary.connection.tlsAudit.failed, 0);
} finally { server.closeAllConnections(); await new Promise(r => server.close(r)); }
