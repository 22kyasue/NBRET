import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { runAnalysis } from '../src/analyze.mjs';
const root = resolve(`runs/report-state-research-${Date.now()}`);
for (const p of ['capture/network', 'explore', 'probe', 'scan']) await mkdir(join(root, p), { recursive: true });
const inputs = {
 'capture/network/evidence.json': { origins: ['http://fixture.invalid'], requests: [{ requestId: 'synthetic-1', inScope: true,
   request: { url: 'http://fixture.invalid/', method: 'GET' }, response: { status: 200, mimeType: 'text/html' }, finished: { encodedDataLength: 1 } }], scripts: [], snapshots: [] },
 'capture/summary.json': { targetOrigin: 'http://fixture.invalid', page: { title: 'Synthetic fixture' } },
 'explore/explore.json': { status: 'completed', states: [], pages: [] },
 'probe/probe.json': { status: 'completed', cases: [] },
 'scan/scan.json': { status: 'failed', mode: 'active', alerts: [], scans: [], errors: [{ code: 'SCAN_FAILED', operation: 'ascan/view/status' }] }
};
for (const [p, data] of Object.entries(inputs)) await writeFile(join(root, p), JSON.stringify(data, null, 2));
const started = performance.now();
const result = await runAnalysis({ runDir: root, outDir: join(root, 'analysis'), deep: false });
assert.equal(result.testing.scanner.status, 'failed');
assert.equal(result.coverage.status, 'no-recorded-gaps');
const markdown = await readFile(join(root, 'analysis/ANALYSIS.md'), 'utf8');
const html = await readFile(join(root, 'analysis/REPORT.html'), 'utf8');
assert.ok(!markdown.includes('SCAN_FAILED'));
assert.ok(!html.includes('SCAN_FAILED'));
const sha256 = {};
for (const p of Object.keys(inputs).concat(['analysis/analysis.json', 'analysis/ANALYSIS.md', 'analysis/REPORT.html']))
 sha256[p] = createHash('sha256').update(await readFile(join(root, p))).digest('hex');
const sourceSha256 = {};
for (const p of ['src/analyze.mjs', 'src/diagnose.mjs', 'src/report-html.mjs', 'scripts/research-report-state-lab.mjs', 'docs/research/security-landscape/deep-review/report-state-lab-plan.md'])
 sourceSha256[p] = createHash('sha256').update(await readFile(p)).digest('hex');
const receipt = { at: new Date().toISOString(), root, node: process.version, elapsedMs: performance.now() - started,
 scope: 'Synthetic local artifacts only; zero network or captured-code execution', inputs, sha256, sourceSha256,
 observed: { analysisStatus: result.status, scannerStatus: result.testing.scanner.status, coverage: result.coverage,
   scannerFailureShownInMarkdown: markdown.includes('SCAN_FAILED'), scannerFailureShownInHtml: html.includes('SCAN_FAILED') } };
await writeFile(join(root, 'receipt.json'), JSON.stringify(receipt, null, 2));
await writeFile('docs/research/security-landscape/deep-review/report-state-lab-receipt.json', JSON.stringify(receipt, null, 2));
console.log(JSON.stringify({ root, observed: receipt.observed, elapsedMs: receipt.elapsedMs }));
