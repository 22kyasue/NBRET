import { resolve, join } from 'node:path';
import { validateEngagement, runAssessment, evaluateBundle, reviewFindings, compareRetest, renderReport, saveNew, loadJson, digest } from './core.mjs';
import { engagementTemplate } from './template.mjs';
import { compileAccessMatrix } from './matrix.mjs';

const [command, ...args] = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 2) {
  if (!args[i]?.startsWith('--') || !args[i + 1] || args[i + 1].startsWith('--') || options[args[i]]) throw new Error('Use --option value pairs once');
  options[args[i]] = args[i + 1];
}
const required = key => { if (!options[key]) throw new Error(`Missing ${key}`); return resolve(options[key]); };
async function loadVerifiedRun(directory) {
  const e = await loadJson(join(directory, 'engagement.json')), bundle = await loadJson(join(directory, 'evidence.json'));
  const results = await loadJson(join(directory, 'results.json')), checked = evaluateBundle(e, bundle);
  const facts = r => r.candidates.map(f => ({ id: f.id, caseId: f.caseId, title: f.title, observationId: f.observationId, controlsPassed: f.controlsPassed }));
  if (results.evidenceDigest !== digest(bundle) || results.engagementDigest !== digest(e) || digest(checked.tests) !== digest(results.tests) ||
      digest(facts(checked)) !== digest(facts(results))) throw new Error('Results do not match retained evidence');
  return { e, bundle, results, checked };
}
const allowed = {
  init: ['--out'], plan: ['--engagement', '--out'], run: ['--engagement', '--out'],
  evaluate: ['--engagement', '--evidence', '--out'], review: ['--run', '--reviews', '--out'], retest: ['--previous', '--current', '--out'],
  matrix: ['--engagement', '--matrix', '--out'],
};
try {
  if (!allowed[command] || Object.keys(options).some(k => !allowed[command].includes(k))) throw new Error('Commands: init, matrix, plan, run, evaluate, review, retest. See docs/assessment-toolkit.md');
  const out = required('--out');
  if (command === 'init') {
    await saveNew(out, { 'engagement.json': engagementTemplate(), 'reviews.example.json': [{ findingId: 'F-foreign-order', decision: 'confirmed',
      reviewer: 'REPLACE', rationale: 'REPLACE with evidence-based adjudication', severity: 'high', impact: 'REPLACE with demonstrated consequence',
      remediation: 'REPLACE with reviewed repair guidance', owner: 'REPLACE with engineering owner' }] });
  } else if (command === 'matrix') {
    const e = compileAccessMatrix(await loadJson(required('--engagement')), await loadJson(required('--matrix')));
    await saveNew(out, { 'engagement.json': e });
  } else if (command === 'plan') {
    const e = validateEngagement(await loadJson(required('--engagement')));
    await saveNew(out, { 'plan.json': { kind: 'nbret-assessment-plan', engagementDigest: digest(e), authorizationStatus: e.authorization?.status || 'missing',
      cases: e.cases.map(c => ({ id: c.id, actor: c.actor, method: c.method, url: c.url, effect: c.effect, claim: c.claim, controls: c.controls })),
      exclusions: e.exclusions, execution: 'Not executed; review scope, credentials, preconditions and authorization before run.' } });
  } else if (command === 'run') {
    const controller = new AbortController();
    const stop = () => controller.abort();
    process.once('SIGINT', stop); process.once('SIGTERM', stop);
    try {
      const { results } = await runAssessment(await loadJson(required('--engagement')), out, { signal: controller.signal });
      console.log(JSON.stringify({ status: results.status, counts: results.counts, candidates: results.candidates.length, out }));
      process.exitCode = results.counts.incomplete ? 2 : results.counts.failed ? 1 : 0;
    } finally { process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop); }
  } else if (command === 'evaluate') {
    const e = await loadJson(required('--engagement')), bundle = await loadJson(required('--evidence'));
    const results = evaluateBundle(e, bundle);
    await saveNew(out, { 'engagement.json': e, 'evidence.json': bundle, 'results.json': results, 'REPORT.md': renderReport(e, results) });
    process.exitCode = results.counts.incomplete ? 2 : results.counts.failed ? 1 : 0;
  } else if (command === 'review') {
    const { e, bundle, checked } = await loadVerifiedRun(required('--run'));
    const reviews = await loadJson(required('--reviews')), reviewed = reviewFindings(checked, reviews);
    await saveNew(out, { 'engagement.json': e, 'evidence.json': bundle, 'results.json': reviewed, 'REPORT.md': renderReport(e, reviewed), 'reviews.json': reviews });
  } else if (command === 'retest') {
    const before = await loadVerifiedRun(required('--previous')), after = await loadVerifiedRun(required('--current'));
    const result = compareRetest(before.e, before.results, after.e, after.results);
    await saveNew(out, { 'retest.json': result });
    if (!result.findings.length || result.findings.some(f => f.status !== 'repair-verified-for-tested-cases')) process.exitCode = 2;
  }
  if (command !== 'run') console.log(JSON.stringify({ command, out }));
} catch (error) {
  console.error(`Assessment failed: ${error.message}`);
  process.exitCode = 2;
}
