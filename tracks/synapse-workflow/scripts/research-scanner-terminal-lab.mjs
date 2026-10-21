import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { runScan } from '../src/zap.mjs';
const out = resolve(`runs/scanner-terminal-research-${Date.now()}`);
await mkdir(out);
const calls = [];
const groundTruth = { simulated: true, stoppedEarly: true, pendingRules: 3, workerTerminationObserved: false };
const transport = async url => {
  const u = new URL(url), operation = u.pathname.split('/').at(-2);
  calls.push({ operation, parameters: Object.fromEntries(u.searchParams) });
  const bodies = { version: { version: 'simulated-2.17.0' }, newContext: { contextId: '17' },
    urls: { urls: ['http://fixture.invalid/allowed'] }, scan: { scan: '23' },
    status: { status: '100' }, recordsToScan: { recordsToScan: '0' }, alerts: { alerts: [] } };
  return { status: 200, body: JSON.stringify(bodies[operation] || { Result: 'OK' }) };
};
const started = performance.now();
const result = await runScan({ origins: ['http://fixture.invalid'], urls: ['http://fixture.invalid/allowed'],
  active: true, outDir: join(out, 'scan'), maxMs: 1000, pollMs: 10, transport });
assert.equal(result.status, 'completed');
assert.equal(result.scans[0].progress, 100);
assert.ok(!calls.some(c => ['scanProgress', 'scans', 'messagesIds', 'alertsIds'].includes(c.operation)));
const sourceSha256 = {};
for (const p of ['src/zap.mjs', 'src/tiers.mjs', 'scripts/research-scanner-terminal-lab.mjs',
  'docs/research/security-landscape/deep-review/terminal-state-lab-plan.md']) {
  sourceSha256[p] = createHash('sha256').update(await readFile(p)).digest('hex');
}
const receipt = { at: new Date().toISOString(), node: process.version, elapsedMs: performance.now() - started,
  scope: 'In-memory transport only; zero network, daemon or target execution', groundTruth, calls, result, sourceSha256 };
await writeFile(join(out, 'receipt.json'), JSON.stringify(receipt, null, 2));
await writeFile('docs/research/security-landscape/deep-review/terminal-state-lab-receipt.json', JSON.stringify(receipt, null, 2));
console.log(JSON.stringify({ out, status: result.status, calls: calls.length, elapsedMs: receipt.elapsedMs }));
