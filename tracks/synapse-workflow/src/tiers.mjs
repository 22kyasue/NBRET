import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { runCapture } from './run.mjs';
import { runExplore } from './explore.mjs';
import { runProbe } from './probe.mjs';
import { runConfiguredScan } from './managed-zap.mjs';
import { createScope } from './scope.mjs';
import { buildContractPlan } from './contracts.mjs';
import { runAnalysis } from './analyze.mjs';
import { runChecks } from './checks.mjs';

export async function runTiers({ url, origins = [], outDir, capture = {}, explore = {}, probe, scan, analyze = true, checks } = {}) {
  const scope = createScope([new URL(url).origin, ...origins]); scope.require(url);
  await mkdir(outDir, { recursive: false });
  const result = { schemaVersion: 1, startedAt: new Date().toISOString(), tiers: {}, errors: [] };
  const phase = async (name, execute) => {
    try { result.tiers[name] = await execute(); }
    catch { result.tiers[name] = { status: 'failed', errors: [{ code: 'TIER_FAILED' }] }; result.errors.push({ tier: name, code: 'TIER_FAILED' }); }
  };
  await phase('capture', () => runCapture({ copy: false, ...capture, url, origins: scope.origins, outDir: join(outDir, 'capture') }));
  try {
    const plan = await buildContractPlan({ networkDir: join(outDir, 'capture', 'network') });
    await writeFile(join(outDir, 'probe-plan.json'), JSON.stringify(plan, null, 2));
    result.probePlan = { status: 'draft', file: 'probe-plan.json', ...plan.coverage };
  } catch { result.probePlan = { status: 'unavailable', reason: 'Capture evidence unavailable or invalid' }; }
  await phase('explore', () => runExplore({ ...explore, url, origins: scope.origins, outDir: join(outDir, 'explore') }));
  if (probe) await phase('probe', () => runProbe({ ...probe, origins: scope.origins, outDir: join(outDir, 'probe') }));
  else result.tiers.probe = { status: 'not-configured', reason: 'Explicit probe cases required' };
  if (scan) await phase('scan', () => runConfiguredScan({ ...scan, urls: scan.urls || [url], origins: scope.origins, outDir: join(outDir, 'scan') }));
  else result.tiers.scan = { status: 'not-configured', reason: 'Explicit scanner configuration required' };
  if (analyze) {
    try {
      const analysis = await runAnalysis({ ...(typeof analyze === 'object' ? analyze : {}), runDir: outDir, outDir: join(outDir, 'analysis') });
      result.analysis = { status: analysis.status, coverage: analysis.coverage.status, file: 'analysis/ANALYSIS.md' };
    } catch { result.analysis = { status: 'failed' }; result.errors.push({ phase: 'analysis', code: 'ANALYSIS_FAILED' }); }
  }
  if (checks) {
    try {
      const checked = await runChecks({ ...checks, origins: scope.origins, outDir: join(outDir, 'checks') });
      result.checks = { status: checked.status, counts: checked.counts, file: 'checks/CHECKS.md' };
      if (checked.status !== 'passed') result.errors.push({ phase: 'checks', code: 'CHECKS_NOT_PASSED' });
    } catch { result.checks = { status: 'failed' }; result.errors.push({ phase: 'checks', code: 'CHECKS_FAILED' }); }
  }
  result.finishedAt = new Date().toISOString();
  result.status = !result.errors.length && Object.values(result.tiers).every(t => !t.errors?.length && (t.status === 'completed' ||
    t.capture === 'captured')) ? 'completed' : 'incomplete';
  await writeFile(join(outDir, 'tiers.json'), JSON.stringify(result, null, 2));
  const tierStatus = (name, value) => name === 'capture' ? value.capture || value.status : value.status;
  const artifacts = { capture: 'capture/REPORT.md', explore: 'explore/explore.json', probe: 'probe/probe.json', scan: 'scan/scan.json' };
  const rows = Object.entries(result.tiers).map(([name, value]) => {
    const status = tierStatus(name, value);
    const artifact = status === 'not-configured' || value.errors?.some(e => e.code === 'TIER_FAILED') ? '—' : `[evidence](${artifacts[name]})`;
    return `| ${name} | ${status || 'failed'} | ${artifact} |`;
  });
  const c = result.tiers.capture, e = result.tiers.explore, p = result.tiers.probe, s = result.tiers.scan;
  await writeFile(join(outDir, 'REPORT.md'), `# NBRET four-tier report\n\nStatus: **${result.status}**\n\n` +
    `Started: ${result.startedAt}\nFinished: ${result.finishedAt}\n\n| Tier | Result | Artifact |\n| --- | --- | --- |\n${rows.join('\n')}\n\n` +
    `- Capture: ${c.counts?.requests || 0} requests, ${c.counts?.scripts || 0} scripts; REA ${c.rea || 'unavailable'}, COPY ${c.copy || 'unavailable'}.\n` +
    `- Explore: ${e.pages?.length || 0} pages, ${e.states?.length || 0} states; owned tab closed: ${e.cleanup?.closed === true}.\n` +
    `- Probe: ${p.cases?.length || 0} explicit cases; ${p.cases?.filter(x => x.expectation === 'failed').length || 0} failed status expectations. Comparisons use separate method/endpoint baselines.\n` +
    `- Scan: ${s.mode || 'unconfigured'}, ${s.scans?.length || 0} active scans, ${s.alerts?.length || 0} alert summaries.\n\n` +
    (result.probePlan.status === 'draft' ? `## Offline probe plan\n\n[probe-plan.json](probe-plan.json): ${result.probePlan.contracts} observed contracts and ${result.probePlan.proposals} unexecuted proposals. Select concrete cases before running probes.\n\n` : '') +
    (result.analysis?.file ? `## Analysis\n\n[Structure, logic and testing analysis](${result.analysis.file}); evidence coverage ${result.analysis.coverage}.\n\n` : '') +
    (result.checks?.file ? `## Assertions\n\n[Check results](${result.checks.file}): ${result.checks.status}.\n\n` : '') +
    'Bounded or incomplete phases are partial evidence. Action associations are temporal observations. No original server implementation, full application coverage or absence of security issues is established.\n');
  return result;
}
