import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve, dirname, basename } from 'node:path';
import { optionalJson, readJsonWithin } from './evidence-files.mjs';
import { buildStructure } from './structure.mjs';
import { safeUrl } from './capture.mjs';
import { diagnose } from './diagnose.mjs';
import { renderAnalysisHtml } from './report-html.mjs';
import { renderReaderReport } from './reader-report.mjs';

const md = value => String(value).replace(/[|\r\n]/g, ' ');
const countBy = (items, key) => items.reduce((a, x) => { const k = key(x); a[k] = (a[k] || 0) + 1; return a; }, {});
const rootType = value => value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
const entries = value => value && typeof value === 'object' ? Object.keys(value).length : null;
function role(url) {
  if (/catalog\.json/.test(url)) return 'primary catalog candidate';
  if (/component-index/.test(url)) return 'component index';
  if (/categor/.test(url)) return 'taxonomy';
  if (/language-|locales|translations/.test(url)) return 'translations';
  if (/home-picks|home-newest|featured/.test(url)) return 'home curation';
  return 'structured resource';
}

export async function runAnalysis({ runDir, outDir, deep = true, supplementalProbeFiles = [], scanFile, accessFile, readerSummaryFile, structure: structureOptions = {} } = {}) {
  const root = resolve(runDir);
  if (typeof deep !== 'boolean' || !Array.isArray(supplementalProbeFiles) || supplementalProbeFiles.length > 10) throw new Error('Invalid analysis options');
  const reads = await Promise.all([
    optionalJson(root, 'capture/network/evidence.json'), optionalJson(root, 'network/evidence.json'),
    optionalJson(root, 'capture/summary.json'), optionalJson(root, 'summary.json'),
    optionalJson(root, 'probe/probe.json'), optionalJson(root, 'probe.json'),
    optionalJson(root, 'explore/explore.json'), optionalJson(root, 'scan/scan.json'),
    optionalJson(root, 'scenario.json'),
  ]);
  const [networkA, networkB, summaryA, summaryB, probeA, probeB, exploreSource, scanSource, scenarioSource] = reads;
  const networkSource = networkA.data ? networkA : networkB, captureSource = summaryA.data ? summaryA : summaryB;
  const network = networkSource.data || { requests: [], scripts: [], snapshots: [] };
  if (!Array.isArray(network.requests) || !Array.isArray(network.scripts) || network.requests.length > 50000 || network.scripts.length > 10000) throw new Error('Invalid or oversized network evidence');
  const capture = captureSource.data, explore = exploreSource.data;
  const probes = [probeA.data ? probeA : probeB].filter(x => x.data);
  for (const [i, file] of supplementalProbeFiles.entries()) probes.push({ data: await readJsonWithin(dirname(resolve(file)), basename(file)), file: `supplemental-probe-${i + 1}` });
  const scan = scanFile ? await readJsonWithin(dirname(resolve(scanFile)), basename(scanFile)) : scanSource.data;
  const result = { schemaVersion: 1, kind: 'nbret-analysis', generatedAt: new Date().toISOString(),
    sourceInputs: { runDir, supplementalProbeFiles, ...(scanFile ? { scanFile } : {}) },
    status: 'analyzed', profile: {}, inventory: {}, datasets: [], findings: [], testing: {}, coverage: { gaps: [] },
    limitations: ['Analysis is deterministic evidence synthesis; no LLM calls or captured-code execution.',
      'Observed behavior, static possibilities and inferred application roles are separate.',
      'Server implementation, credentials, complete branch coverage and absence of vulnerabilities are not established.'] };
  const gap = (code, count, evidence) => { if (count) result.coverage.gaps.push({ code, count, evidence }); };
  const access = accessFile ? await readJsonWithin(dirname(resolve(accessFile)), basename(accessFile)) : (await optionalJson(root, 'access-catalog.json')).data;
  if (access) {
    if (!Array.isArray(access.candidates) || access.candidates.length > 2000) throw new Error('Invalid access catalog');
    result.accessCatalog = access;
    result.sourceInputs.accessFile = accessFile || 'access-catalog.json';
  }
  const readerSummary = readerSummaryFile ? await readJsonWithin(dirname(resolve(readerSummaryFile)), basename(readerSummaryFile), 100000) : null;
  if (readerSummary) result.sourceInputs.readerSummaryFile = readerSummaryFile;
  for (const source of reads) if (source.invalid) gap('invalid-evidence-file', 1, source.file);
  if (!networkSource.data) gap('network-evidence-missing', 1, 'network/evidence.json');
  if (!capture) gap('capture-summary-missing', 1, 'capture/summary.json');
  const requests = network.requests, scripts = network.scripts;
  result.inventory = { requests: requests.length, uniqueRequestUrls: new Set(requests.map(r => r.request?.url)).size,
    mimeTypes: countBy(requests, r => r.response?.mimeType || 'unavailable'),
    statuses: countBy(requests, r => r.response?.status ?? 'unavailable'),
    scriptRecords: scripts.length, uniqueScriptHashes: new Set(scripts.map(s => s.sha256).filter(Boolean)).size,
    savedScriptRecords: scripts.filter(s => s.file).length,
    encodedTransferBytes: requests.reduce((n, r) => n + (r.finished?.encodedDataLength || 0), 0),
    requestFailures: requests.filter(r => r.failure).length,
    pendingRequests: requests.filter(r => !r.finished && !r.failure && !r.redirected).length };
  const datasetMap = new Map();
  const addDataset = (url, body, source, bytes, status = 200) => {
    if (status !== 200 || body === undefined || !['array', 'object'].includes(rootType(body))) return;
    if (safeUrl(url) === '[INVALID_URL]') { gap('invalid-dataset-url', 1, source.file); return; }
    const item = { url: safeUrl(url), rootType: rootType(body), entries: entries(body),
      role: role(url), roleBasis: 'filename and observed JSON root; inferred', bytes,
      topLevelKeys: Array.isArray(body) ? [] : Object.keys(body).slice(0, 15), evidence: source };
    datasetMap.set(item.url, item);
  };
  const networkDir = join(root, dirname(networkSource.file || 'capture/network/evidence.json'));
  for (const [i, r] of requests.entries()) if (r.inScope && r.body?.file && /json/i.test(r.response?.mimeType || '')) {
    if (datasetMap.has(safeUrl(r.request.url))) continue;
    try { addDataset(r.request.url, await readJsonWithin(networkDir, r.body.file, 20 * 1024 * 1024),
      { file: networkSource.file, pointer: `/requests/${i}`, requestId: r.requestId, bodyFile: r.body.file }, r.body.bytes, r.response.status); }
    catch { gap('dataset-body-unreadable', 1, r.body.file); }
  }
  for (const source of probes) {
    if (!Array.isArray(source.data.cases)) throw new Error('Invalid probe evidence');
    for (const [i, c] of source.data.cases.entries()) addDataset(c.request?.url, c.response?.body,
      { file: source.file, pointer: `/cases/${i}` }, c.response?.bytes, c.response?.status);
  }
  result.datasets = [...datasetMap.values()];
  const apiRequests = requests.map((r, i) => ({ ...r, index: i })).filter(r => /\/api\//.test(r.request?.url || ''));
  const rejected = apiRequests.filter(r => [401, 403].includes(r.response?.status));
  const authGroups = new Map();
  for (const r of rejected) {
    const key = `${r.request.method} ${safeUrl(r.request.url)}`;
    if (!authGroups.has(key)) authGroups.set(key, { request: key, statuses: [], observations: 0, evidence: [] });
    const group = authGroups.get(key); group.observations++;
    if (!group.statuses.includes(r.response.status)) group.statuses.push(r.response.status);
    if (group.evidence.length < 3) group.evidence.push({ file: networkSource.file, pointer: `/requests/${r.index}`, requestId: r.requestId });
  }
  result.profile = { targetOrigins: network.origins || capture?.targetOrigin && [capture.targetOrigin] || [],
    title: capture?.page?.title || null,
    applicationRole: result.datasets.some(d => d.role === 'component index') ? 'probable design/component content library' :
      result.datasets.length >= 3 ? 'probable data-driven web frontend' : 'web application; purpose not established',
    roleConfidence: result.datasets.length >= 3 ? 'medium' : 'low',
    roleEvidence: result.datasets.filter(d => d.role !== 'structured resource').slice(0, 6).map(d => d.evidence),
    serverFramework: 'unknown from these observations',
    authObservations: [...authGroups.values()],
    routes: [...new Set(explore?.states?.map(s => s.url) || [])],
    exploredStates: explore?.states?.length || 0 };
  result.profile.recordedSnapshots = network.snapshots?.length || 0;
  const finding = (id, category, statement, confidence, evidence) => result.findings.push({ id, category, statement, confidence, evidence });
  if (result.datasets.length) finding('structured-content', 'observed', `${result.datasets.length} successful structured resources were collected.`, 'high', result.datasets.slice(0, 5).map(d => d.evidence));
  if (rejected.length) finding('auth-rejections', 'observed', `${rejected.length} observed API requests returned 401/403. This does not establish protection of every paid or privileged resource.`, 'high', [...authGroups.values()].flatMap(g => g.evidence).slice(0, 6));
  const js = requests.filter(r => /(?:java|ecma)script/i.test(r.response?.mimeType || ''));
  if (js.length >= 50) finding('script-request-volume', 'testing-opportunity', `${js.length} JavaScript requests occurred in this observation, which may include reloads. Measure cold/warm load timing before attributing performance impact.`, 'medium', [{ file: networkSource.file, pointer: '/requests' }]);
  gap('pending-requests', result.inventory.pendingRequests, networkSource.file);
  gap('unavailable-response-bodies', requests.filter(r => r.body?.unavailable).length, networkSource.file);
  gap('snapshot-node-truncation', network.snapshots?.filter(s => s.nodesTruncated).length, networkSource.file);
  gap('collector-drops', Object.values(network.dropped || {}).reduce((n, v) => n + v, 0), networkSource.file);
  gap('out-of-scope-requests', requests.filter(r => !r.inScope).length, networkSource.file);
  if (capture?.reaCompleteness?.status && capture.reaCompleteness.status !== 'complete') gap(`rea-${capture.reaCompleteness.status}`, 1, 'capture/rea.json');
  if (explore?.status !== 'completed') gap(explore ? `explore-${explore.status}` : 'explore-not-run', 1, exploreSource.file);
  const probeFailures = probes.flatMap(p => (p.data.cases || []).filter(c => c.error).map(c => ({ url: c.request.url, code: c.errorCode || 'PROBE_FAILED', evidence: p.file })));
  result.testing = { probeFailures, uiScenario: scenarioSource.data ? { status: scenarioSource.data.status, counts: scenarioSource.data.counts } : { status: 'not-run' },
    scanner: scan ? { status: scan.status, mode: scan.mode,
    alerts: scan.alerts || [], activeScans: scan.scans?.length || 0 } : { status: 'not-run' } };
  gap('probe-failures', probeFailures.length, 'probe/probe.json');
  const missingResources = requests.filter(r => r.response?.status === 200 && r.body?.unavailable && /json/i.test(r.response?.mimeType || '') && !datasetMap.has(safeUrl(r.request.url))).map(r => safeUrl(r.request.url));
  result.coverage.missingStructuredResources = [...new Set(missingResources)];
  result.coverage.status = result.coverage.gaps.length ? 'partial' : 'no-recorded-gaps';
  if (!requests.length && !result.datasets.length) result.status = 'insufficient-evidence';
  if (deep && scripts.length) {
    result.structure = await buildStructure(networkDir, network, structureOptions);
    const totals = result.structure.scripts.reduce((a, s) => {
      for (const k of ['functions', 'calls', 'branches']) a[k] += s.counts[k]; return a;
    }, { functions: 0, calls: 0, branches: 0 });
    result.structure.summary = { analyzedSources: result.structure.scripts.length, ...totals,
      execution: network.coverageSummary || { status: 'not-recorded' },
      runtimeLinks: result.structure.runtimeLinks.length, eventRegistrations: result.structure.scripts.reduce((n, s) => n + s.events.length, 0),
      unresolvedEndpoints: result.structure.scripts.reduce((n, s) => n + s.endpoints.filter(e => e.dynamic).length, 0) };
    const targets = new Map(result.structure.scripts.flatMap(s => s.urls.map(u => [u, s.id])));
    result.structure.moduleEdges = result.structure.scripts.flatMap(s => s.imports.map(i => ({ from: s.id,
      targetUrl: i.target, to: targets.get(i.target) || null, kind: i.kind, line: i.line, dynamic: i.dynamic })));
    result.structure.hotspots = result.structure.scripts.flatMap(s => s.functions.map(f => ({ scriptId: s.id, url: s.urls[0],
      sourceRole: /vendor|node_modules/.test(s.urls[0]) ? 'dependency-candidate' : 'application-candidate',
      functionId: f.id, name: f.name, line: f.line, branches: s.branches.filter(b => b.functionId === f.id).length,
      calls: s.calls.filter(c => c.functionId === f.id).length }))).sort((a, b) =>
        Number(a.sourceRole === 'dependency-candidate') - Number(b.sourceRole === 'dependency-candidate') || b.branches - a.branches).slice(0, 25);
    result.structure.workflows = result.structure.scripts.flatMap(s => s.workflows.map(w => ({ scriptId: s.id, url: s.urls[0], ...w,
      observedRequestIds: result.structure.runtimeLinks.filter(l => w.functions.some(f => f.id === l.functionId)).map(l => l.requestId) }))).slice(0, 1000);
    gap('structure-truncated-sources', result.structure.scripts.filter(s => s.truncated || s.status !== 'parsed').length, 'structure.json');
    gap('structure-unavailable-sources', result.structure.coverage.unavailableSources + result.structure.coverage.omittedSources, 'structure.json');
  }
  result.coverage.status = result.coverage.gaps.length ? 'partial' : 'no-recorded-gaps';
  const diagnosis = diagnose({ network, capture, explore, probes, scan, scenario: scenarioSource.data, analysis: result, networkFile: networkSource.file });
  result.diagnosis = { file: 'diagnosis.json', report: 'FIXES.md', ...diagnosis.summary };
  const suggested = result.datasets.filter(d => d.rootType && !d.url.includes('%5BREDACTED%5D')).slice(0, 20).map(d => ({
    name: `resource:${new URL(d.url).pathname}`, url: d.url, method: 'GET',
    expect: { status: 200, headers: { 'content-type': { includes: 'json' } }, json: [{ path: '', type: d.rootType, ...(d.entries > 0 ? { minLength: 1 } : {}) }] } }));
  const suggestions = { origins: result.profile.targetOrigins, cases: suggested, allowWrites: false, timeoutMs: 15000, maxMs: 120000,
    notes: 'Draft generated from observed successful resources. Assertions check HTTP/JSON contracts; review before extending scope.' };
  await mkdir(outDir, { recursive: false });
  await writeFile(join(outDir, 'diagnosis.json'), JSON.stringify(diagnosis, null, 2));
  await writeFile(join(outDir, 'FIXES.md'), '# NBRET repair and improvement report\n\n' +
    `${diagnosis.summary.observedFailures} observed failures · ${diagnosis.summary.scannerFindings} scanner findings · ${diagnosis.summary.improvementCandidates} improvement candidates · ${diagnosis.summary.testCoverageGaps} test gaps · ${diagnosis.summary.collectionGaps} collection gaps.\n\n` +
    diagnosis.issues.map(i => `## ${md(i.title)}\n\n**${i.severity} · ${i.category} · ${i.confidence} confidence**\n\n` +
      `${i.whyItMatters}\n\n**Suggested fix:** ${i.suggestedFix}\n\n**Verify:** ${i.verification}\n\n` +
      `Evidence: ${i.evidence.map(e => md(e.file + (e.pointer || ''))).join(', ')}.\n` + (i.reference ? `\n[Rule reference](${i.reference})\n` : '')).join('\n') +
    '\nCollection gaps belong to NBRET evidence quality; they are not website defects. Optimization and accessibility candidates require confirmation.\n');
  const reportStructure = result.structure;
  if (result.structure) {
    const usefulWorkflows = result.structure.workflows.filter(w => w.resolved && (w.endpoints.length || w.effects.length))
      .sort((a, b) => Number(/vendor|node_modules/.test(a.url)) - Number(/vendor|node_modules/.test(b.url)) || b.observedRequestIds.length - a.observedRequestIds.length).slice(0, 30);
    await writeFile(join(outDir, 'LOGIC.md'), '# NBRET structure and logic\n\nCaptured code was parsed, never executed. These are static possibilities with separate observed request links.\n\n' +
      '## Event-driven workflows\n\n' + usefulWorkflows.map(w =>
        `### ${md(w.event)} · ${md(new URL(w.url).pathname)}:${w.line}\n\n` +
        `Statically reachable functions: ${w.functions.map(f => md(f.name)).join(', ') || 'unresolved'}.\n\n` +
        (w.endpoints.length ? `Network call sites: ${w.endpoints.map(e => md(e.target || '[computed endpoint]')).join(', ')}.\n\n` : '') +
        (w.effects.length ? `Effects: ${[...new Set(w.effects.map(e => md(e.operation)))].slice(0, 10).join(', ')}.\n\n` : '') +
        `Observed request links: ${[...new Set(w.observedRequestIds)].length}; this count does not prove that this event caused those requests.\n`).join('\n') +
      '\n## Modules\n\n| Source | Functions | Branch sites | Imports | Events | Parse result |\n| --- | --- | --- | --- | --- | --- |\n' +
      result.structure.scripts.map(s => `| ${md(new URL(s.urls[0]).pathname)} | ${s.counts.functions} | ${s.counts.branches} | ${s.imports.length} | ${s.events.length} | ${s.status}${s.truncated ? ' / bounded' : ''} |`).join('\n') +
      '\n\nComputed calls, unresolved callbacks and cross-module value flow need further evidence. Static call lists are sets of possible relationships, not guaranteed execution order.\n');
    await writeFile(join(outDir, 'structure.json'), JSON.stringify(result.structure, null, 2));
    result.structureFile = 'structure.json';
    const { summary, coverage, hotspots } = result.structure;
    delete result.structure;
    result.structureSummary = { ...summary, coverage, hotspots };
  }
  await writeFile(join(outDir, 'analysis.json'), JSON.stringify(result, null, 2));
  const technicalHtml = renderAnalysisHtml(result, diagnosis, reportStructure);
  if (readerSummary) {
    await writeFile(join(outDir, 'TECHNICAL.html'), technicalHtml);
    await writeFile(join(outDir, 'reader-summary.json'), JSON.stringify(readerSummary, null, 2));
    await writeFile(join(outDir, 'REPORT.html'), renderReaderReport(readerSummary));
  } else await writeFile(join(outDir, 'REPORT.html'), technicalHtml);
  await writeFile(join(outDir, 'suggested-checks.json'), JSON.stringify(suggestions, null, 2));
  await writeFile(join(outDir, 'ANALYSIS.md'), '# NBRET analysis\n\n' +
    `Application: **${md(result.profile.applicationRole)}** (${result.profile.roleConfidence} confidence; inferred).\nCoverage: **${result.coverage.status}**.\n\n` +
    `Observed ${result.inventory.requests} requests, ${result.inventory.scriptRecords} script records, ${result.datasets.length} structured resources, ${result.profile.recordedSnapshots} DOM/state snapshots and ${result.profile.exploredStates} exploration states.\n\n` +
    (result.accessCatalog ? '## Discovered routes and access\n\nStatic gates are source evidence, not proof of backend authorization. Unknown does not mean public.\n\n| URL | Link labels | Access gate | Observed final routes |\n|---|---|---|---|\n' +
      result.accessCatalog.candidates.map(c => `| ${md(c.url)} | ${md((c.links || []).map(l => l.label).filter(Boolean).join(', '))} | ${md((c.gates || []).map(g => g.expression).join('; ') || 'unknown')} | ${md((c.visits || []).map(v => v.finalUrl).filter(Boolean).join(', '))} |`).join('\n') + '\n\n' : '') +
    '## Findings\n\n' + result.findings.map(f => `- **${f.category} / ${f.confidence}:** ${md(f.statement)}`).join('\n') + '\n\n' +
    '## Data inventory\n\n| Resource | Root | Entries | Inferred role |\n| --- | --- | --- | --- |\n' +
    result.datasets.map(d => `| ${md(new URL(d.url).pathname)} | ${d.rootType} | ${d.entries} | ${d.role} |`).join('\n') + '\n\n' +
    (result.structureSummary ? `## Structure and logic\n\n${result.structureSummary.analyzedSources} unique sources parsed; ${result.structureSummary.functions} function definitions, ${result.structureSummary.branches} branch sites, ${result.structureSummary.runtimeLinks} observed request-initiator links.\n\n` +
      (result.structureSummary.execution.status === 'captured' ? `V8 recorded ${result.structureSummary.execution.executedFunctions} executed function entries among ${result.structureSummary.execution.functions} recorded entries in this session. This is session evidence, not an application coverage percentage.\n\n` : 'Function execution profiling was not recorded for this input.\n\n') +
      '[Full module/function/event/effect map](structure.json). Static branches describe possible logic; complete branch/path coverage remains unknown.\n\n' : '') +
    '## Coverage gaps\n\n' + result.coverage.gaps.map(g => `- ${g.code}: ${g.count} (${g.evidence})`).join('\n') + '\n\n' +
    `## Testing and repairs\n\n[Suggested read-only checks](suggested-checks.json) · [Prioritized fixes and verification steps](FIXES.md) · [Logic workflows](LOGIC.md).\n\nScanner: ${scan?.mode || 'not-run'}, ${scan?.alerts?.length || 0} reported findings. Findings require review; a scan result is not proof of application security.\n`);
  return result;
}
