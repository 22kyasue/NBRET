import { parseArgs } from 'node:util';
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { runExplore } from './explore.mjs';
import { runProbe } from './probe.mjs';
import { runConfiguredScan } from './managed-zap.mjs';
import { runTiers } from './tiers.mjs';
import { runContractPlan } from './contracts.mjs';
import { runAnalysis } from './analyze.mjs';
import { runChecks } from './checks.mjs';
import { runScenario } from './scenario.mjs';

const { values, positionals } = parseArgs({ allowPositionals: true, options: {
  config: { type: 'string' }, out: { type: 'string' }, help: { type: 'boolean' },
  run: { type: 'string' }, baseline: { type: 'string' }, 'probe-file': { type: 'string' }, 'no-deep': { type: 'boolean' },
} });
const mode = positionals[0] || 'all';
const runners = { all: runTiers, explore: runExplore, probe: runProbe, scan: runConfiguredScan, plan: runContractPlan, analyze: runAnalysis, check: runChecks, scenario: runScenario };
if (values.help || (!values.config && !(mode === 'analyze' && values.run)) || !runners[mode]) {
  console.log('NBRET\nUsage: node src/tiers-cli.mjs [all|explore|probe|scan|plan|analyze|check|scenario] --config config.json [--out runs/new-run]\nAnalyze shortcut: npm run analyze -- --run RUN --out OUT\nRegression: npm run check -- --config checks.json --baseline BASELINE --out OUT\nAnalyze is offline; check supports --probe-file for offline assertions. Output directories must be new. Managed scans start a private daemon; explicit-endpoint keys use NBRET_ZAP_API_KEY.');
  process.exit(values.help ? 0 : 1);
}
try {
  const config = values.config ? JSON.parse(await readFile(values.config, 'utf8')) : {};
  if (values.run) config.runDir = values.run;
  if (values.baseline) config.baselineFile = values.baseline;
  if (values['probe-file']) config.probeFile = values['probe-file'];
  if (values['no-deep']) config.deep = false;
  config.outDir = resolve(values.out || config.outDir || `runs/${mode}-${Date.now()}`);
  if (mode === 'scan') config.apiKey = process.env.NBRET_ZAP_API_KEY;
  if (config.scan) config.scan.apiKey = process.env.NBRET_ZAP_API_KEY;
  await mkdir(dirname(config.outDir), { recursive: true });
  const result = await runners[mode](config);
  // Do not echo DOM, request cases or findings to terminal logs.
  console.log(JSON.stringify({ status: result.status, outDir: config.outDir, errors: result.errors || [] }, null, 2));
  if (result.errors?.length || ['failed', 'incomplete', 'timed-out', 'not-configured', 'insufficient-evidence'].includes(result.status)) process.exitCode = 1;
} catch {
  console.error('NBRET tier failed: check configuration, explicit origins, dependencies and fresh output path. Raw errors omitted.');
  process.exitCode = 1;
}
