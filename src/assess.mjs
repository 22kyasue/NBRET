import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { readEvidence } from './evidence.mjs';

export function assessRun(summary, evidence) {
  const requests = evidence.requests || [];
  const scoped = requests.filter(r => r.inScope);
  const bodyOmissions = {};
  for (const r of scoped) {
    const reason = r.body?.omitted || (r.body?.unavailable ? 'unavailable' : r.body?.truncated ? 'truncated' : null);
    if (reason) bodyOmissions[reason] = (bodyOmissions[reason] || 0) + 1;
  }
  const gaps = [];
  const add = (id, count, next) => { if (count) gaps.push({ id, count, next }); };
  add('capture-failed', summary.capture !== 'captured' ? 1 : 0, 'Resolve capture failure before interpreting endpoint coverage.');
  add('out-of-scope-requests', requests.length - scoped.length, 'Review external API origins; use explicit --origin for authorized APIs. Do not widen scope automatically.');
  add('response-body-gaps', scoped.filter(r => r.body?.unavailable || r.body?.omitted || r.body?.truncated).length, 'Inspect omission reasons before recapturing; use a proxy only if it can answer the missing-body question.');
  add('unfinished-requests', scoped.filter(r => !r.finished && !r.failure && !r.redirected).length, 'Check whether these are streaming connections or whether the scenario ended too early.');
  add('failed-requests', scoped.filter(r => r.failure).length, 'Separate expected error scenarios from transport failures.');
  add('dropped-observations', Object.values(evidence.dropped || {}).reduce((n, v) => n + (Number.isFinite(v) ? v : 0), 0), 'Inspect which budget was exceeded; narrow the scenario before increasing limits. Counts may overlap.');
  add('recorder-errors', evidence.errors?.length || 0, 'Inspect recorder errors before treating missing evidence as absent behavior.');
  add('rea-not-captured', summary.rea !== 'captured' ? 1 : 0, 'Run REA only when an unresolved JavaScript question requires it; disabled is not a failure.');
  add('copy-not-extracted', summary.copy !== 'extracted' ? 1 : 0, 'Run COPY when appearance or assets are in scope; disabled is not a failure.');
  if (summary.copy === 'extracted' && summary.copyState?.mode !== 'same-state') add('copy-separate-state', 1, 'Verify separate-context COPY captured the intended state; select same-state mode for interacted/authenticated state.');
  add('visual-failed', summary.visual?.status === 'failed' ? 1 : 0, 'Inspect incomplete same-state visual evidence; a partial inventory must not be treated as a complete scenario.');
  add('expectations-failed', summary.assertions?.filter(a => !a.passed).length || 0, 'Inspect scenario expectations and paired evidence; transport capture success does not prove expected behavior.');
  add('unobserved-browser-targets', evidence.targets?.filter(t => !t.observed && ['worker', 'service_worker', 'shared_worker', 'iframe', 'page'].includes(t.type)).length || 0, 'Additional browser targets were discovered but not independently instrumented. Their traffic/scripts may be incomplete.');
  add('child-frame-dom-gaps', Math.max(0, Math.max(0, ...(evidence.snapshots || []).map(s => (s.frameCoverage?.frames || 1) - 1)) - (summary.copyState?.frames?.extracted || 0)), 'DOM snapshots inspect the top document only; use same-state COPY (full profile) to extract child frames. This does not imply all frame network traffic is missing.');
  add('copy-frames-failed', (summary.copyState?.frames?.discovered || 0) - (summary.copyState?.frames?.extracted || 0), 'Some child frames were detached, unreadable or over the frame budget; see copy/frames.json.');
  add('target-discovery-errors', evidence.targetCoverage?.discoveryErrors || 0, 'Target discovery failed; absence of additional targets is not established.');
  add('artifact-accounting-incomplete', summary.metrics?.artifacts?.truncated || summary.metrics?.artifacts?.status === 'failed' ? 1 : 0, 'Artifact accounting was partial; reported bytes are not a complete run footprint.');
  return {
    schemaVersion: 1,
    identity: summary.identity || null,
    metrics: summary.metrics || null,
    bodyOmissions,
    observations: { requests: requests.length, scopedRequests: scoped.length, snapshots: evidence.snapshots?.length || 0, actions: evidence.actions?.length || 0 },
    gaps,
    reuse: ['Export existing evidence with npm run investigate before starting another browser.', 'Inspect existing scripts and response artifacts before another REA pass.', 'Reuse an artifact only when target, scenario, state and capture options remain suitable.'],
    limitations: ['This reports recorded coverage gaps, not completeness of the site.', 'No tools are launched and no requests are replayed.', 'No percentage score: unobserved states and backend internals remain unknown.'],
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { run: { type: 'string' }, help: { type: 'boolean' } } });
  if (values.help || !values.run) {
    console.log('Usage: npm run assess -- --run runs/capture-name\nReads existing evidence and prints coverage gaps; no browser or network.');
    process.exitCode = values.help ? 0 : 1;
  } else {
    const root = resolve(values.run);
    const summary = JSON.parse(await readFile(join(root, 'summary.json'), 'utf8'));
    const { evidence } = await readEvidence(root, summary);
    console.log(JSON.stringify(assessRun(summary, evidence), null, 2));
  }
}
