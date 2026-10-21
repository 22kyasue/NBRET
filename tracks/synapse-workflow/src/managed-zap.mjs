import { createServer } from 'node:net';
import { mkdir, open, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { randomUUID, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { requestBounded } from './http.mjs';
import { runScan } from './zap.mjs';
import { createScope } from './scope.mjs';

export async function startOwnedZap({ java = process.env.NBRET_JAVA,
  toolsDir = resolve('.tools'), startupMs = 60000 } = {}) {
  if (!Number.isSafeInteger(startupMs) || startupMs < 1000 || startupMs > 120000) throw new Error('Invalid scanner startup budget');
  const receipt = JSON.parse(await readFile(join(toolsDir, 'zap-receipt.json'), 'utf8'));
  const version = receipt.tag?.replace(/^v/, '');
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Invalid ZAP receipt');
  const install = resolve(receipt.installDir || join(toolsDir, `ZAP_${version}`));
  const bundled = 'C:/Users/kotar/AppData/Local/Programs/BurpSuite/jre/bin/java.exe';
  java ||= existsSync(bundled) ? bundled : 'java';
  const runtime = join(toolsDir, 'scan-runtime', randomUUID()); await mkdir(runtime, { recursive: true });
  const reservation = createServer(); await new Promise((r, reject) => { reservation.once('error', reject); reservation.listen(0, '127.0.0.1', r); });
  const port = reservation.address().port; await new Promise(r => reservation.close(r));
  const apiKey = randomBytes(24).toString('hex'), endpoint = `http://127.0.0.1:${port}`;
  const log = await open(join(runtime, 'zap.log'), 'w');
  const child = spawn(java, ['-Xmx512m', '-jar', join(install, `zap-${version}.jar`), '-daemon', '-silent', '-notel',
    '-dir', runtime, '-installdir', install, '-host', '127.0.0.1', '-port', String(port), '-config', `api.key=${apiKey}`],
    { windowsHide: true, stdio: ['ignore', log.fd, log.fd] });
  let launchFailed = false; child.on('error', () => { launchFailed = true; });
  const stop = async () => {
    // Terminate only this child. Never send shutdown to a potentially shared API endpoint.
    if (child.exitCode === null && child.signalCode === null && !launchFailed) {
      const exited = new Promise(r => child.once('exit', r));
      let timer;
      child.kill(); await Promise.race([exited, new Promise(r => { timer = setTimeout(r, 3000); })]);
      clearTimeout(timer);
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    }
    await log.close();
  };
  try {
    const deadline = Date.now() + startupMs;
    while (Date.now() < deadline) {
      if (launchFailed || child.exitCode !== null || child.signalCode !== null) throw new Error('Owned ZAP startup failed');
      try {
        const response = await requestBounded(endpoint + '/JSON/core/view/version/', { headers: { 'X-ZAP-API-Key': apiKey }, timeoutMs: 1000 });
        if (response.status === 200 && JSON.parse(response.body).version === version) return { endpoint, apiKey, version, stop };
      } catch {}
      await new Promise(r => setTimeout(r, 500));
    }
    throw new Error('Owned ZAP startup deadline exceeded');
  } catch (e) { await stop(); throw e; }
}

export async function runConfiguredScan({ managed, java, toolsDir, startupMs, ...options } = {}) {
  if (managed !== undefined && typeof managed !== 'boolean') throw new Error('managed must be boolean');
  if (managed && options.endpoint) throw new Error('Choose a managed daemon or an explicit endpoint');
  const scope = createScope(options.origins);
  if (!Array.isArray(options.urls) || !options.urls.length) throw new Error('Explicit scan URLs required');
  options.urls.forEach(url => scope.require(url));
  if (options.active !== undefined && typeof options.active !== 'boolean') throw new Error('active must be boolean');
  if (managed === false || options.endpoint) return runScan(options);
  let daemon;
  try { daemon = await startOwnedZap({ java, toolsDir, startupMs }); }
  catch {
    await mkdir(options.outDir, { recursive: false });
    const result = { schemaVersion: 1, tier: 4, status: 'failed', errors: [{ code: 'ZAP_START_FAILED',
      message: 'Portable ZAP or Java 17+ unavailable, or startup failed. Run npm run setup:zap and set NBRET_JAVA if needed.' }] };
    await writeFile(join(options.outDir, 'scan.json'), JSON.stringify(result, null, 2)); return result;
  }
  try {
    const result = await runScan({ ...options, endpoint: daemon.endpoint, apiKey: daemon.apiKey });
    result.daemon = { owned: true, version: daemon.version, sharedBrowserOrScannerModified: false };
    await writeFile(join(options.outDir, 'scan.json'), JSON.stringify(result, null, 2)); return result;
  } finally { await daemon.stop(); }
}
