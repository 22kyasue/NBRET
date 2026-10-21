import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { runHarnessCapture } from './harness-capture.mjs';
import { validateInteractions } from './interactions.mjs';

export async function runScenario({ steps, outDir, ...options } = {}) {
  validateInteractions(steps, { allowFill: true });
  if (!steps?.length || !steps.some(s => Object.keys(s.expect || {}).length)) throw new Error('Scenario requires steps and at least one explicit UI expectation');
  const capture = await runHarnessCapture({ rea: false, includeCoverage: true, scrollSteps: 0, ...options, interactions: steps, outDir });
  const checks = (capture.interactions || []).flatMap(s => s.assertions || []);
  const result = { schemaVersion: 1, kind: 'nbret-ui-scenario', status: capture.errors.length ?
    capture.errors.some(e => e.code === 'UI_ASSERTION_FAILED') ? 'failed' : 'incomplete' : 'passed',
    counts: { assertions: checks.length, passed: checks.filter(c => c.outcome === 'passed').length,
      failed: checks.filter(c => c.outcome === 'failed').length }, steps: capture.interactions || [],
    executionCoverage: capture.executionCoverage, errors: capture.errors,
    limitations: ['Only explicitly named non-destructive controls and text fields are operated.',
      'Password fields and frames are excluded. UI text/element/route checks are observations, not complete semantic validation.'] };
  await writeFile(join(outDir, 'scenario.json'), JSON.stringify(result, null, 2));
  await writeFile(join(outDir, 'SCENARIO.md'), '# NBRET UI scenario\n\n' +
    `Status: **${result.status}** · ${result.counts.passed}/${result.counts.assertions} assertions passed.\n\n` +
    result.steps.map((s, i) => `${i + 1}. ${s.type || 'step'} ${s.name}: ${s.status}; ${(s.assertions || []).map(a => `${a.assertion}=${a.outcome}`).join(', ')}`).join('\n') + '\n');
  return result;
}
