import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { optionalJson } from './evidence-files.mjs';
import { safeUrl, safeStateUrl } from './capture.mjs';
import { runUnderstand } from './understand.mjs';
import { runHarnessCapture } from './harness-capture.mjs';
import { validateInteractions } from './interactions.mjs';
import { createScope } from './scope.mjs';

const key = r => `${r.request?.method || 'GET'} ${safeUrl(r.request?.url || '')}`;
const counts = values => values.reduce((a, v) => { a[v] = (a[v] || 0) + 1; return a; }, {});

export function summarizeExample(network, summary = {}) {
  if (!Array.isArray(network?.requests) || network.requests.length > 50000 || (network.snapshots?.length || 0) > 10000) throw new Error('Invalid example evidence');
  const requests = network.requests;
  const result = { requests: requests.length, signatures: counts(requests.map(key)), statuses: counts(requests.map(r => String(r.response?.status ?? 'unavailable'))),
    documents: requests.filter(r => r.resourceType === 'Document').map(r => ({ url: safeUrl(r.request.url), status: r.response?.status, requestId: r.requestId, hop: r.hop })),
    authenticationResponses: requests.filter(r => [401, 403].includes(r.response?.status)).map(r => ({ url: safeUrl(r.request.url), status: r.response.status, requestId: r.requestId })),
    cache: { disk: requests.filter(r => r.response?.fromDiskCache).length, serviceWorker: requests.filter(r => r.response?.fromServiceWorker).length, prefetch: requests.filter(r => r.response?.fromPrefetchCache).length },
    navigation: (network.navigation || []).map(n => ({ ...n, url: safeStateUrl(n.url) })),
    snapshots: (network.snapshots || []).map(s => ({ label: s.label, actionId: s.actionId, url: safeStateUrl(s.url), storage: s.storage, cacheStorage: s.cacheStorage,
      links: (s.links || []).map(l => ({ href: safeStateUrl(l.href), target: l.target, rel: l.rel, rendered: l.rendered,
        label: l.label, title: l.title, role: l.role, ariaDisabled: l.ariaDisabled, download: l.download, fragmentTargetExists: l.fragmentTargetExists })), linksTruncated: s.linksTruncated })),
    actions: (network.actions || []).map(a => ({ id: a.id, label: a.label, observedAt: a.observedAt })),
    console: { counts: counts((network.consoleMetadata || []).map(m => m.type)), textOmitted: true },
    assertions: (summary.interactions || []).flatMap(s => s.assertions || []),
    captureErrors: summary.errors?.length || 0, dropped: network.dropped || {},
    finalUrl: safeStateUrl(network.snapshots?.findLast(s => s.label === 'final')?.url || ''),
    lastObservedUrl: safeStateUrl(network.snapshots?.at(-1)?.url || ''),
    coverage: { navigationRecorded: Array.isArray(network.navigation), consoleMetadataRecorded: Array.isArray(network.consoleMetadata),
      sourceScripts: (network.scripts || []).filter(s => s.file).length, runtimeCoverage: network.coverageSummary?.status || 'unavailable' } };
  result.timeline = [
    ...result.actions.map(a => ({ kind: 'action', time: a.observedAt, actionId: a.id, label: a.label })),
    ...requests.map(r => ({ kind: 'request', time: r.observedAt, actionId: r.actionId, requestId: r.requestId, hop: r.hop, request: key(r), status: r.response?.status })),
    ...result.navigation.map(n => ({ kind: n.kind, time: n.observedAt, actionId: n.actionId, url: n.url })),
    ...(network.snapshots || []).map(s => ({ kind: 'snapshot', time: s.observedAt, actionId: s.actionId, label: s.label, url: safeStateUrl(s.url) })),
  ].sort((a, b) => (Date.parse(a.time) || Infinity) - (Date.parse(b.time) || Infinity));
  return result;
}

export function compareExamples(left, right) {
  const all = new Set([...Object.keys(left.signatures), ...Object.keys(right.signatures)]);
  return { basis: 'observational comparison; no causal or controlled-experiment claim',
    requestDifferences: [...all].map(request => ({ request, left: left.signatures[request] || 0, right: right.signatures[request] || 0 })).filter(x => x.left !== x.right),
    finalUrls: { left: left.finalUrl, right: right.finalUrl, changed: left.finalUrl !== right.finalUrl },
    statusCounts: { left: left.statuses, right: right.statuses }, cache: { left: left.cache, right: right.cache },
    storageCounts: { left: left.snapshots.at(-1)?.storage || null, right: right.snapshots.at(-1)?.storage || null },
    consoleCounts: { left: left.console.counts, right: right.console.counts } };
}

export async function runWorkflowExamples({ question, terms, examples, comparisons = [], outDir, origins = [], sourceDir,
  maxUnits = 35, acquireSources = false } = {}, { capture = runHarnessCapture } = {}) {
  if (!question || !Array.isArray(terms) || !terms.length || !Array.isArray(examples) || !examples.length || examples.length > 12) throw new Error('Supply a question, terms and 1–12 examples');
  if (typeof acquireSources !== 'boolean' || !Array.isArray(comparisons) || comparisons.length > 30) throw new Error('Invalid workflow options');
  const ids = new Set();
  for (const ex of examples) {
    if (!ex || !/^[a-z0-9][a-z0-9-]{0,49}$/.test(ex.id) || ids.has(ex.id) || (!!ex.runDir === !!ex.url)) throw new Error('Each example needs a unique safe id and exactly one of runDir or url');
    ids.add(ex.id);
    if (ex.url) { createScope(origins).require(ex.url); validateInteractions(ex.steps || [], { allowFill: true }); }
    if (ex.expectFinalUrlIncludes !== undefined && (typeof ex.expectFinalUrlIncludes !== 'string' || !ex.expectFinalUrlIncludes || ex.expectFinalUrlIncludes.length > 500)) throw new Error('Invalid final URL expectation');
  }
  for (const c of comparisons) if (!ids.has(c.left) || !ids.has(c.right) || c.left === c.right) throw new Error('Comparison must refer to two different examples');
  const out = resolve(outDir); await mkdir(out, { recursive: false });
  const result = { schemaVersion: 1, kind: 'multi-example-workflow-understanding', question, terms, status: 'complete', examples: [], comparisons: [],
    limitations: ['Examples run sequentially through the existing computeruse harness. Shared profile state/cache can carry between examples; no storage is cleared.',
      'Declared conditions describe intended setup, not verified login/session state.',
      'Action/request time association is not causality. Initiators and runtime breakpoints are stronger evidence.',
      'Source references are static candidates. A captured branch requires separate runtime verification.',
      'Console metadata omits message arguments. Storage captures counts, not credential values.'] };
  for (const ex of examples) {
    const dir = join(out, ex.id); await mkdir(dir);
    let runDir = ex.runDir, captureSummary;
    try {
      if (ex.url) {
        runDir = join(dir, 'capture');
        captureSummary = await capture({ url: ex.url, origins, interactions: ex.steps || [], outDir: runDir,
          includeScriptSources: true, includeCoverage: true, rea: false, scrollSteps: 0, closeTab: true });
      }
      const n1 = await optionalJson(runDir, 'network/evidence.json'), n2 = n1.data ? n1 : await optionalJson(runDir, 'capture/network/evidence.json');
      if (!n2.data) throw new Error('NETWORK_EVIDENCE_MISSING');
      captureSummary ||= (await optionalJson(runDir, 'summary.json')).data || {};
      const evidence = summarizeExample(n2.data, captureSummary);
      const routeCheck = ex.expectFinalUrlIncludes ? { assertion: 'finalUrlIncludes', expected: ex.expectFinalUrlIncludes,
        outcome: evidence.finalUrl === '[INVALID_URL]' ? 'unavailable' : evidence.finalUrl.includes(ex.expectFinalUrlIncludes) ? 'passed' : 'failed' } : null;
      const understanding = await runUnderstand({ question: ex.question || question, terms: ex.terms || terms, runDir, sourceDir,
        ...(acquireSources && ex.url ? { url: ex.url, origins } : {}), maxUnits, outDir: join(dir, 'understanding') });
      const failed = routeCheck?.outcome === 'failed' || evidence.assertions.some(a => a.outcome === 'failed');
      const status = failed ? 'failed' : evidence.captureErrors || evidence.finalUrl === '[INVALID_URL]' || Object.values(evidence.dropped).some(v => typeof v === 'number' && v > 0) ? 'incomplete' : 'observed';
      result.examples.push({ id: ex.id, question: ex.question || question, declaredCondition: ex.condition || 'unspecified', status,
        evidenceFile: `${ex.id}/evidence-summary.json`, workflowFile: `${ex.id}/understanding/WORKFLOW.md`,
        sourceStatus: understanding.status, sourceGaps: understanding.gaps, routeCheck, evidence });
      await writeFile(join(dir, 'evidence-summary.json'), JSON.stringify(evidence, null, 2));
    } catch {
      result.examples.push({ id: ex.id, status: 'incomplete', error: 'EXAMPLE_EVIDENCE_UNAVAILABLE',
        nextCheck: 'Ensure a managed AI browser window is open through computeruse launch; inspect example configuration, capture summary, dependencies and source input budgets.' });
    }
  }
  for (const c of comparisons) {
    const left = result.examples.find(e => e.id === c.left), right = result.examples.find(e => e.id === c.right);
    result.comparisons.push({ ...c, ...(left.evidence && right.evidence ? compareExamples(left.evidence, right.evidence) : { status: 'unavailable' }) });
  }
  result.status = result.examples.some(e => e.status === 'failed') ? 'failed' : result.examples.some(e => e.status === 'incomplete') ? 'incomplete' : 'complete';
  result.nextQuestions = result.examples.flatMap(e => !e.evidence ? [{ example: e.id, question: e.nextCheck }] : [
    ...(!e.evidence.coverage.navigationRecorded ? [{ example: e.id, question: 'Recapture with navigation events to distinguish document redirects from in-page routing.' }] : []),
    ...(!e.evidence.coverage.sourceScripts ? [{ example: e.id, question: 'Capture script sources and match hashes before linking runtime frames to static code.' }] : []),
    ...(e.evidence.finalUrl === '[INVALID_URL]' ? [{ example: e.id, question: 'Final snapshot missing. Last observed route is available, but the final route is unverified.' }] : []),
    ...(e.sourceStatus === 'insufficient-evidence' ? [{ example: e.id, question: 'No relevant source matched. Refine terms or supply original source maps.' }] : []),
    { example: e.id, question: 'Which decision and runtime state explain this result? Follow cited source candidates, then verify the branch.' },
  ]);
  await writeFile(join(out, 'workflows.json'), JSON.stringify(result, null, 2));
  await writeFile(join(out, 'WORKFLOWS.md'), `# Workflow examples\n\n${question}\n\nStatus: ${result.status}.\n\n` + result.examples.map(e =>
    `## ${e.id}\n\nStatus: ${e.status}. Declared condition: ${e.declaredCondition || 'unknown'}.\n\n` + (e.evidence ?
      `[Source evidence](${e.workflowFile}) · [Browser evidence](${e.evidenceFile})\n\nFinal URL: ${e.evidence.finalUrl}. Requests: ${e.evidence.requests}. Source status: ${e.sourceStatus}.\n\n` : `${e.nextCheck}\n\n`)).join('') +
    `## Comparisons\n\n${result.comparisons.map(c => `${c.left} → ${c.right}: ${c.requestDifferences?.length ?? 'unknown'} request-count differences; final URL changed: ${c.finalUrls?.changed ?? 'unknown'}.`).join('\n\n')}\n\n## Open questions\n\n${result.nextQuestions.map(q => `- ${q.example}: ${q.question}`).join('\n')}\n\n${result.limitations.map(l => `- ${l}`).join('\n')}\n`);
  return result;
}
