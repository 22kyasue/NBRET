import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { runUnderstand } from './understand.mjs';
import { runWorkflowExamples } from './workflow-examples.mjs';
import { optionalJson } from './evidence-files.mjs';
import { safeStateUrl } from './capture.mjs';
import { createScope } from './scope.mjs';
import { riskyControl } from './interactions.mjs';

const esc = s => String(s ?? '').replace(/[|\r\n]/g, ' ').replaceAll('<', '&lt;');
const cite = (unit, item) => ({ source: unit.label, file: unit.file, line: item.line, sourceId: unit.id });

/** Discover candidates only from evidence. No wordlist, endpoint guessing or gate bypass. */
export function buildAccessCatalog({ seedUrl, origins, sources = [], snapshots = [], requests = [], maxCandidates = 500 } = {}) {
  const scope = createScope(origins || [new URL(seedUrl).origin]);
  const catalog = new Map(); let omitted = 0;
  const add = (target, evidence, metadata = {}, gates = []) => {
    let resolved;
    try { resolved = new URL(target, metadata.pageUrl || seedUrl); } catch { return; }
    if (!['http:', 'https:'].includes(resolved.protocol) || resolved.username || resolved.password) return;
    const address = safeStateUrl(resolved.href);
    if (!catalog.has(address)) {
      if (catalog.size >= maxCandidates) { omitted++; return; }
      const dynamic = /[:*{}]/.test(resolved.pathname);
      catalog.set(address, { id: `candidate-${catalog.size + 1}`, url: address, path: resolved.pathname,
        inScope: scope.allows(resolved.href), dynamic, evidence: [], links: [], gates: [], observations: [],
        access: { method: 'navigate', target: address, prerequisites: dynamic ? ['Supply observed route parameters; do not invent identifiers.'] : [],
          gateStatus: 'unknown', backendAuthorization: 'not established' } });
    }
    const c = catalog.get(address); c.evidence.push(evidence);
    if (evidence.kind === 'rendered-link') c.links.push(metadata);
    if (evidence.kind === 'network-document') c.observations.push({ status: metadata.status, requestId: metadata.requestId });
    c.gates.push(...gates);
    if (c.gates.length) c.access.gateStatus = 'static gate found; runtime outcome unverified';
  };
  add(seedUrl, { kind: 'seed', basis: 'user-supplied starting URL' });
  for (const s of snapshots) for (const l of s.links || []) if (l.href) add(l.href,
    { kind: 'rendered-link', pageUrl: safeStateUrl(s.url), snapshot: s.label, basis: 'DOM link observation; visibility recorded separately' },
    { pageUrl: safeStateUrl(s.url), label: l.label || null, title: l.title || null, target: l.target || null, rel: l.rel || null,
      role: l.role || null, rendered: l.rendered ?? null, ariaDisabled: l.ariaDisabled || null, download: !!l.download, fragmentTargetExists: l.fragmentTargetExists ?? null });
  for (const r of requests) if (r.resourceType === 'Document' && r.request?.url) add(r.request.url,
    { kind: 'network-document', basis: 'observed document request' }, { status: r.response?.status, requestId: r.requestId });
  const unresolved = [];
  const getters = new Map();
  for (const u of sources) for (const p of u.pathDefinitions || []) {
    const list = getters.get(p.name) || []; list.push({ ...p, unit: u }); getters.set(p.name, list);
  }
  for (const u of sources) {
    for (const r of u.routes || []) {
      if (r.index || (!r.path && !r.pathGetter)) {
        unresolved.push({ expression: r.pathExpression, reason: 'index-or-computed-route-needs-parent-or-runtime-context', evidence: cite(u, r) }); continue;
      }
      let target = r.path, getterEvidence;
      if (!target && r.pathGetter) {
        const defs = getters.get(r.pathGetter) || [], values = [...new Set(defs.map(d => d.value))];
        if (values.length === 1) { target = values[0]; getterEvidence = defs.map(d => cite(d.unit, d)); }
      }
      if (!target || !/^(?:\/|https?:)/.test(target)) {
        unresolved.push({ expression: r.pathExpression, reason: 'relative-computed-or-ambiguous-path', evidence: cite(u, r) }); continue;
      }
      const wrappers = (u.wrappers || []).filter(w => w.name === r.component);
      const gates = wrappers.map(w => ({ type: /feature/i.test(w.gate) ? 'feature-wrapper' : 'access-wrapper',
        operation: w.gate, expression: w.expression, evidence: cite(u, w),
        basis: 'same-file route element uses this declared wrapper; backend enforcement and current state unverified' }));
      add(target, { kind: 'source-route', ...cite(u, r), component: r.component, expression: r.pathExpression,
        getterEvidence, basis: r.path ? 'literal JSX route declaration' : 'path getter resolved by a unique literal value; module binding not proven' }, {}, gates);
    }
    for (const n of u.navigation || []) for (const target of n.arguments || []) {
      if (typeof target === 'string' && /^(?:\/(?!\/)|https?:\/\/)/.test(target)) add(target,
        { kind: 'source-navigation', operation: n.operation, ...cite(u, n), basis: 'literal navigation argument; not proof the call ran' });
    }
  }
  const candidates = [...catalog.values()];
  for (const c of candidates) {
    const parsed = new URL(c.url);
    const blocked = !c.inScope ? 'out-of-scope' : c.dynamic ? 'parameterized-route' :
      parsed.hash && c.links.length && c.links.every(l => l.fragmentTargetExists === true) ? 'same-page-anchor' :
      riskyControl.test(c.path) || c.links.some(l => l.download || riskyControl.test(l.label || '')) ? 'potential-side-effect-or-download' :
      new URL(c.url).search ? 'query-bearing-route-needs-review' : c.links.length && c.links.every(l => l.ariaDisabled === 'true') ? 'disabled-link' : null;
    c.visitPolicy = { eligible: !blocked, reason: blocked || 'in-scope evidence-backed read-only navigation candidate' };
    c.priority = c.evidence.some(e => e.kind === 'rendered-link') ? 1 : c.evidence.some(e => e.kind === 'source-route') ? 2 : 3;
    if (c.gates.length) c.access.prerequisites.push(...c.gates.map(g => `Client wrapper: ${g.expression}`));
    if (c.links.length) c.access.linkInstructions = c.links.map(l => ({ onPage: l.pageUrl, label: l.label, href: c.url, target: l.target }));
  }
  return { candidates, unresolved, omitted,
    limitations: ['Candidates are evidence-backed possibilities, not proof of live availability.',
      'No gate found means unknown, not public or unrestricted.', 'Static gates describe client code; server authorization and current user state remain unverified.',
      'Relative/index routes and ambiguous path getters are retained as unresolved instead of inventing URLs.'] };
}

export async function runDiscover({ seedUrl, origins, outDir, sourceDir, runDir, explore = false, maxVisits = 3, maxRounds = 2,
  maxCandidates = 500, acquireSources = true } = {}, { understand = runUnderstand, workflows = runWorkflowExamples } = {}) {
  const scope = createScope(origins || [new URL(seedUrl).origin]); scope.require(seedUrl);
  for (const [n, cap] of [[maxVisits, 12], [maxRounds, 4], [maxCandidates, 2000]]) if (!Number.isSafeInteger(n) || n < 1 || n > cap) throw new Error('Invalid discovery limits');
  if (typeof explore !== 'boolean' || typeof acquireSources !== 'boolean') throw new Error('Invalid discovery options');
  const out = resolve(outDir); await mkdir(out, { recursive: false });
  const question = 'Discover browser routes, access paths and source-backed gates without prior route knowledge.';
  const terms = ['Route', 'navigate', 'authorize', 'permission', 'featureFlag'];
  const source = await understand({ question, terms, sourceDir, runDir,
    ...(acquireSources ? { url: seedUrl, origins: scope.origins } : {}), outDir: join(out, 'source-understanding') });
  const snapshots = [], requests = [], visits = [], visited = new Set();
  if (runDir) {
    const a = await optionalJson(runDir, 'network/evidence.json'), b = a.data ? a : await optionalJson(runDir, 'capture/network/evidence.json');
    if (b.data) { snapshots.push(...(b.data.snapshots || [])); requests.push(...(b.data.requests || [])); }
  }
  let catalog = buildAccessCatalog({ seedUrl, origins: scope.origins, sources: source.discoverySources, snapshots, requests, maxCandidates });
  if (explore) for (let round = 1; round <= maxRounds && visited.size < maxVisits; round++) {
    const next = catalog.candidates.filter(c => c.visitPolicy.eligible && !visited.has(c.url))
      .sort((a, b) => (a.url === safeStateUrl(seedUrl) ? -1 : b.url === safeStateUrl(seedUrl) ? 1 : a.priority - b.priority))
      .slice(0, round === 1 ? 1 : maxVisits - visited.size);
    if (!next.length) break;
    next.forEach(c => visited.add(c.url));
    const batch = await workflows({ question, terms, origins: scope.origins, sourceDir, acquireSources: false,
      examples: next.map((c, i) => ({ id: `visit-${round}-${i + 1}`, url: c.url, condition: 'Existing shared harness profile; no gate bypass or storage reset' })),
      outDir: join(out, `round-${round}`) });
    for (const [i, e] of batch.examples.entries()) {
      visits.push({ candidateUrl: next[i].url, status: e.status, finalUrl: e.evidence?.finalUrl,
        evidenceFile: `round-${round}/${e.evidenceFile || ''}`, workflowFile: `round-${round}/${e.workflowFile || ''}` });
      if (e.evidence) snapshots.push(...e.evidence.snapshots);
      const file = join(out, `round-${round}`, e.id, 'capture');
      const n = await optionalJson(file, 'network/evidence.json'); if (n.data) requests.push(...n.data.requests);
    }
    catalog = buildAccessCatalog({ seedUrl, origins: scope.origins, sources: source.discoverySources, snapshots, requests, maxCandidates });
  }
  for (const c of catalog.candidates) c.visits = visits.filter(v => v.candidateUrl === c.url);
  const result = { schemaVersion: 1, kind: 'route-and-access-discovery', status: visits.some(v => ['incomplete', 'failed'].includes(v.status)) ? 'incomplete' : 'catalogued',
    seedUrl: safeStateUrl(seedUrl), origins: scope.origins, limits: { maxVisits, maxRounds, maxCandidates },
    sourceStatus: source.status, sourceGaps: source.gaps, ...catalog, visits,
    coverage: { explored: explore, visited: visited.size, remainingEligible: catalog.candidates.filter(c => c.visitPolicy.eligible && !visited.has(c.url)).length },
    nextChecks: ['Resolve relative/parameterized routes from parent route context and observed identifiers.',
      'Trace each gate operation to its selector/predicate/provider and verify relevant runtime state without exposing credentials.',
      'Compare observed redirect/final route with the static gate; do not equate client routing with server access control.'] };
  await writeFile(join(out, 'access-catalog.json'), JSON.stringify(result, null, 2));
  await writeFile(join(out, 'ACCESS.md'), `# Discovered routes and access\n\nStarting URL: ${esc(result.seedUrl)}. ${catalog.candidates.length} candidates, ${catalog.unresolved.length} unresolved declarations, ${visits.length} visits.\n\n` +
    catalog.candidates.map(c => `## ${esc(c.path)}\n\nURL: ${esc(c.url)}\n\nAccess: ${esc(c.access.method)} to this URL${c.dynamic ? ' after supplying observed parameters' : ''}. Auto-visit: ${esc(c.visitPolicy.reason)}.\n\n` +
      `Gate: **${esc(c.access.gateStatus)}**. Server authorization: ${c.access.backendAuthorization}.\n\n` +
      c.gates.map(g => `- ${esc(g.expression)} — ${esc(g.evidence.source)}:${g.evidence.line}. ${g.basis}`).join('\n') + '\n\n' +
      (c.links.length ? '| Link label | Title | Role | Found on | Target | Rel | Visible | Disabled | Download |\n|---|---|---|---|---|---|---|---|---|\n' + c.links.map(l => `| ${esc(l.label)} | ${esc(l.title)} | ${esc(l.role)} | ${esc(l.pageUrl)} | ${esc(l.target)} | ${esc(l.rel)} | ${l.rendered} | ${esc(l.ariaDisabled)} | ${l.download} |`).join('\n') + '\n\n' : 'No rendered link recorded; candidate came from source or network evidence.\n\n') +
      (c.observations.length ? `Observed document responses: ${c.observations.map(o => `${o.status ?? 'unknown'} (request ${o.requestId})`).join(', ')}.\n\n` : '') +
      'Evidence:\n\n' + c.evidence.map(e => `- ${e.kind}: ${esc(e.source || e.pageUrl || e.basis)}${e.line ? `:${e.line}` : ''}${e.component ? `; component ${esc(e.component)}` : ''}`).join('\n') + '\n\n' +
      c.visits.map(v => `Observed visit: ${v.status}, final URL ${esc(v.finalUrl)}. [Workflow](${v.workflowFile}).`).join('\n')).join('\n\n') +
    `\n\n## Unresolved routes\n\n${catalog.unresolved.map(r => `- ${esc(r.expression)}: ${r.reason}; ${esc(r.evidence.source)}:${r.evidence.line}`).join('\n')}\n\n## Limits and next checks\n\n${[...catalog.limitations, ...result.nextChecks].map(l => `- ${l}`).join('\n')}\n`);
  return result;
}
