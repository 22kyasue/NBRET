import { parseArgs } from 'node:util';
import { readFile } from 'node:fs/promises';
import { runUnderstand } from './understand.mjs';
import { runWorkflowExamples } from './workflow-examples.mjs';
import { runDiscover } from './discover.mjs';

const { values } = parseArgs({ options: { config: { type: 'string' }, out: { type: 'string' }, help: { type: 'boolean' } } });
if (values.help || !values.config) {
  console.log('Usage: npm run understand -- --config workflow.json --out runs/new-workflow\nProduces understanding.json and WORKFLOW.md. Reads source as data; never executes captured code.');
  process.exit(values.help ? 0 : 1);
}
try {
  const config = JSON.parse(await readFile(values.config, 'utf8'));
  config.outDir = values.out || config.outDir || `runs/understand-${Date.now()}`;
  const r = await (config.seedUrl ? runDiscover(config) : config.examples ? runWorkflowExamples(config) : runUnderstand(config));
  console.log(JSON.stringify({ status: r.status, inventory: r.inventory, gaps: r.gaps, candidates: r.candidates?.length,
    unresolved: r.unresolved?.length, coverage: r.coverage, outDir: config.outDir }, null, 2));
  if (['insufficient-evidence', 'failed', 'incomplete'].includes(r.status)) process.exitCode = 1;
} catch {
  console.error('Workflow understanding failed. Check input paths, origin scope, budgets and fresh output directory.');
  process.exitCode = 1;
}
