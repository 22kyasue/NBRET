import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile, rename, open } from 'node:fs/promises';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { createScope } from '../scope.mjs';
import { validateExpect, evaluateExpect } from '../assertions.mjs';

const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
export const digest = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const text = (v, name) => { if (typeof v !== 'string' || !v.trim() || v.length > 500) throw new Error(`Invalid ${name}`); return v; };
const unique = (items, key) => { const ids = items.map(x => text(x[key], key)); if (new Set(ids).size !== ids.length) throw new Error(`Duplicate ${key}`); };
const integer = (v, min, max) => Number.isSafeInteger(v) && v >= min && v <= max;
const methods = ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'];
const md = v => String(v ?? '').replace(/[|\r\n]/g, ' ').replace(/[<>]/g, '');

/** Local engagement records are operator declarations, not proof of customer consent. */
export function validateEngagement(e, { now = Date.now(), live = false } = {}) {
  if (Buffer.byteLength(JSON.stringify(e) || '') > 1048576) throw new Error('Engagement exceeds 1 MiB');
  if (e?.schemaVersion !== 1 || e.kind !== 'nbret-engagement') throw new Error('Invalid engagement schema');
  for (const key of ['id', 'client', 'policyRevision']) text(e[key], key);
  for (const key of ['id', 'revision']) text(e.environment?.[key], `environment.${key}`);
  const scope = createScope(e.origins);
  if (!Array.isArray(e.actors) || !e.actors.length || e.actors.length > 30) throw new Error('Explicit actors required');
  unique(e.actors, 'id');
  for (const actor of e.actors) {
    for (const key of ['principal', 'tenant', 'role', 'sessionEpoch']) text(actor[key], `actor.${key}`);
    if (actor.headersEnv !== undefined && (!actor.headersEnv || typeof actor.headersEnv !== 'object' || Array.isArray(actor.headersEnv))) throw new Error('Invalid credential mapping');
    for (const [header, env] of Object.entries(actor.headersEnv || {})) {
      if (!/^[a-z0-9-]+$/i.test(header) || /^(host|connection|content-length|transfer-encoding)$/i.test(header) || !/^[A-Z_][A-Z0-9_]*$/.test(env)) throw new Error('Invalid credential mapping');
    }
  }
  if (!Array.isArray(e.cases) || !e.cases.length || e.cases.length > 100) throw new Error('One to 100 explicit cases required');
  unique(e.cases, 'id');
  const actors = new Map(e.actors.map(a => [a.id, a]));
  for (const c of e.cases) {
    if (!actors.has(c.actor)) throw new Error('Unknown case actor');
    text(c.claim, 'claim'); text(c.preconditions, 'preconditions');
    if (!['security', 'control'].includes(c.purpose)) throw new Error('Case purpose must be security or control');
    if (!['read', 'write'].includes(c.effect)) throw new Error('Declare read/write effect even for GET');
    if (!methods.includes(c.method)) throw new Error('Explicit supported method required');
    const url = new URL(scope.require(c.url));
    if (url.hash || url.search) throw new Error('Use path-only case URLs; secret/query values are not supported in v1');
    if (c.headers !== undefined) throw new Error('Supply request headers through actor.headersEnv');
    if (['GET', 'HEAD'].includes(c.method) && c.body !== undefined) throw new Error('GET/HEAD cannot carry bodies');
    if (!c.expect) throw new Error('Explicit assertions required');
    validateExpect(c.expect);
    if (c.expect.headers && Object.keys(c.expect.headers).length) throw new Error('Response header assertions are not supported by this adapter');
    if (!evaluateExpect({ response: { status: 200, headers: {}, body: {} } }, c.expect).some(x => x.assertion !== 'configured')) throw new Error('Explicit assertions required');
    if (c.purpose === 'security' && (!Array.isArray(c.expect.json) || !c.expect.json.length)) throw new Error('Security cases require semantic JSON assertions');
    if (!Array.isArray(c.controls) || c.purpose === 'security' && !c.controls.length) throw new Error('Security cases require positive control references');
  }
  const cases = new Map(e.cases.map(c => [c.id, c]));
  for (const c of e.cases) for (const id of c.controls) if (cases.get(id)?.purpose !== 'control') throw new Error('Invalid positive control reference');
  const b = e.budgets;
  if (!b || !integer(b.timeoutMs, 1, 120000) || !integer(b.maxMs, 1, 600000) || !integer(b.delayMs, 0, 10000) ||
      !integer(b.maxBytes, 1, 20 * 1024 * 1024) || !integer(b.maxTotalBytes, 4096, 32 * 1024 * 1024)) throw new Error('Invalid engagement budgets');
  if (!Array.isArray(e.exclusions) || e.exclusions.some(v => typeof v !== 'string')) throw new Error('Explicit exclusions required');
  if (live) {
    const a = e.authorization;
    if (!a || a.status !== 'approved') throw new Error('Recorded approved authorization required');
    text(a.reference, 'authorization reference'); text(a.approvedBy, 'approver');
    const start = Date.parse(a.startsAt), end = Date.parse(a.expiresAt);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > now || end <= now || end <= start) throw new Error('Authorization outside valid window');
    if (!Array.isArray(a.caseIds) || e.cases.some(c => !a.caseIds.includes(c.id))) throw new Error('Authorization must include every case');
    if (e.cases.some(c => c.effect === 'write' || !['GET', 'HEAD', 'OPTIONS'].includes(c.method)) && a.allowWrites !== true) throw new Error('Write cases require explicit write authorization');
  }
  return e;
}

export function caseBinding(e, c) {
  const a = e.actors.find(a => a.id === c.actor);
  return { engagementId: e.id, environment: e.environment, policyRevision: e.policyRevision,
    actor: { id: a.id, principal: a.principal, tenant: a.tenant, role: a.role, sessionEpoch: a.sessionEpoch },
    caseId: c.id, claim: c.claim, preconditions: c.preconditions, purpose: c.purpose,
    request: { method: c.method, url: c.url, ...(c.body === undefined ? {} : { body: c.body }) }, oracle: c.expect, controls: c.controls };
}

function observationOutcome(checks) {
  // Missing evidence wins over a partial failure: never promote a truncated response.
  return checks.some(x => x.outcome === 'unavailable') ? 'incomplete' : checks.some(x => x.outcome === 'failed') ? 'failed' : 'passed';
}

export function evaluateBundle(e, bundle) {
  validateEngagement(e);
  if (bundle?.kind !== 'nbret-assessment-evidence' || bundle.schemaVersion !== 1 || bundle.engagementDigest !== digest(e) || !Array.isArray(bundle.observations)) throw new Error('Evidence belongs to a different engagement/configuration');
  if (!['completed', 'incomplete'].includes(bundle.terminal)) throw new Error('Evidence has no final execution state; checkpoint is not a completed run');
  const tests = e.cases.map(c => {
    const binding = caseBinding(e, c), identity = digest(binding);
    const matches = bundle.observations.filter(o => o.bindingDigest === identity);
    let checks;
    if (matches.length !== 1) checks = [{ assertion: 'identity', outcome: 'unavailable', reason: matches.length ? 'Ambiguous evidence' : 'No exact identity/environment/oracle match' }];
    else if (!isDeepStrictEqual(matches[0].binding, binding) || digest(matches[0].entry) !== matches[0].entryDigest) checks = [{ assertion: 'integrity', outcome: 'unavailable', reason: 'Evidence integrity mismatch' }];
    else checks = evaluateExpect(matches[0].entry, c.expect);
    return { id: c.id, claim: c.claim, purpose: c.purpose, actor: c.actor, bindingDigest: identity,
      observationId: matches.length === 1 ? matches[0].id : null, checks, outcome: observationOutcome(checks) };
  });
  const byId = new Map(tests.map(t => [t.id, t]));
  const candidates = tests.filter(t => t.purpose === 'security' && t.outcome === 'failed').map(t => {
    const c = e.cases.find(c => c.id === t.id), controlsPassed = c.controls.every(id => byId.get(id)?.outcome === 'passed');
    return { id: `F-${t.id}`, caseId: t.id, title: t.claim, status: controlsPassed ? 'reproduced-candidate' : 'inconclusive',
      controlsPassed, observationId: t.observationId, severity: 'unassigned', reviewRequired: true };
  });
  const counts = Object.fromEntries(['passed', 'failed', 'incomplete'].map(k => [k, tests.filter(t => t.outcome === k).length]));
  return { schemaVersion: 1, kind: 'nbret-assessment-results', engagementId: e.id, engagementDigest: digest(e),
    evidenceDigest: digest(bundle), evaluatedAt: new Date().toISOString(), counts,
    executionStatus: bundle.terminal,
    status: counts.incomplete || bundle.terminal !== 'completed' ? 'incomplete' : counts.failed ? 'needs-review' : 'tested-cases-passed', tests, candidates,
    exclusions: e.exclusions, limitations: ['Results cover explicit cases only; no claim of exhaustive discovery or absence of vulnerabilities.',
      'Actor labels and authorization references are operator declarations; independently establish real session identity.',
      'Hashes detect accidental changes relative to the record; they do not authenticate an untrusted collector.',
      'JSON/headers are key-redacted by NBRET; evidence may still contain confidential data.'] };
}

export async function saveNew(directory, files) {
  await mkdir(directory, { recursive: false });
  for (const [name, value] of Object.entries(files)) await writeFile(join(directory, name), typeof value === 'string' ? value : JSON.stringify(value, null, 2), { flag: 'wx' });
}

export async function runAssessment(e, outDir, { env = process.env, signal } = {}) {
  validateEngagement(e, { live: true });
  // Resolve all credentials before creating files or sending any requests.
  const headers = new Map(e.actors.map(a => [a.id, Object.fromEntries(Object.entries(a.headersEnv || {}).map(([name, key]) => {
    if (typeof env[key] !== 'string' || !env[key] || /[\r\n]/.test(env[key])) throw new Error(`Missing or invalid credential environment variable: ${key}`);
    return [name, env[key]];
  }))]));
  await mkdir(outDir, { recursive: false });
  const bundle = { schemaVersion: 1, kind: 'nbret-assessment-evidence', runId: randomUUID(),
    engagementDigest: digest(e), startedAt: new Date().toISOString(), observations: [], terminal: 'running' };
  const deadline = Math.min(Date.now() + e.budgets.maxMs, Date.parse(e.authorization.expiresAt));
  let retainedBytes = 0;
  let evidenceBudgetExhausted = false;
  for (const [index, c] of e.cases.entries()) {
    const binding = caseBinding(e, c), startedAt = new Date().toISOString();
    let entry;
    if (signal?.aborted || Date.now() >= deadline || evidenceBudgetExhausted) entry = { errorCode: signal?.aborted ? 'CANCELLED' : evidenceBudgetExhausted ? 'TOTAL_EVIDENCE_BYTE_LIMIT' : 'TOTAL_DEADLINE_EXCEEDED' };
    else {
      const { executeCase } = await import('./transport.mjs');
      entry = await executeCase(c, headers.get(c.actor), { ...e.budgets, timeoutMs: Math.max(1, Math.min(e.budgets.timeoutMs, deadline - Date.now())) }, signal);
    }
    const size = Buffer.byteLength(JSON.stringify(entry));
    if (retainedBytes + size > e.budgets.maxTotalBytes) { entry = { errorCode: 'TOTAL_EVIDENCE_BYTE_LIMIT' }; evidenceBudgetExhausted = true; }
    else retainedBytes += size;
    bundle.observations.push({ id: randomUUID(), binding, bindingDigest: digest(binding), startedAt,
      finishedAt: new Date().toISOString(), entry, entryDigest: digest(entry) });
    await writeFile(join(outDir, 'checkpoint.tmp'), JSON.stringify(bundle, null, 2));
    await rename(join(outDir, 'checkpoint.tmp'), join(outDir, 'checkpoint.json'));
    await writeFile(join(outDir, 'progress.json'), JSON.stringify({ runId: bundle.runId, completedCases: index + 1, totalCases: e.cases.length }));
    if (index < e.cases.length - 1 && e.budgets.delayMs && Date.now() < deadline && !signal?.aborted) await new Promise(r => setTimeout(r, Math.min(e.budgets.delayMs, deadline - Date.now())));
  }
  bundle.finishedAt = new Date().toISOString();
  bundle.terminal = bundle.observations.some(o => o.entry.errorCode) ? 'incomplete' : 'completed';
  const results = evaluateBundle(e, bundle);
  await writeFile(join(outDir, 'engagement.json'), JSON.stringify(e, null, 2), { flag: 'wx' });
  await writeFile(join(outDir, 'evidence.json'), JSON.stringify(bundle, null, 2), { flag: 'wx' });
  await writeFile(join(outDir, 'results.json'), JSON.stringify(results, null, 2), { flag: 'wx' });
  await writeFile(join(outDir, 'REPORT.md'), renderReport(e, results), { flag: 'wx' });
  return { bundle, results };
}

export function reviewFindings(results, reviews) {
  if (!Array.isArray(reviews)) throw new Error('Review array required');
  unique(reviews, 'findingId');
  const reviewed = structuredClone(results);
  for (const r of reviews) {
    const finding = reviewed.candidates.find(f => f.id === r.findingId);
    if (!finding) throw new Error('Unknown finding');
    for (const key of ['reviewer', 'rationale', 'impact', 'remediation', 'owner']) text(r[key], key);
    if (!['confirmed', 'rejected', 'needs-investigation'].includes(r.decision)) throw new Error('Invalid review decision');
    if (!['critical', 'high', 'medium', 'low', 'informational'].includes(r.severity)) throw new Error('Reviewed severity required');
    if (r.decision === 'confirmed' && !finding.controlsPassed) throw new Error('Cannot confirm without passing positive controls');
    Object.assign(finding, { status: r.decision, severity: r.severity, review: { ...r, reviewedAt: new Date().toISOString() }, reviewRequired: false });
  }
  reviewed.parentResultsDigest = digest(results);
  return reviewed;
}

export function compareRetest(previousEngagement, previous, currentEngagement, current) {
  validateEngagement(previousEngagement); validateEngagement(currentEngagement);
  if (previous.engagementDigest !== digest(previousEngagement) || current.engagementDigest !== digest(currentEngagement)) throw new Error('Retest configuration mismatch');
  if (previousEngagement.id !== currentEngagement.id || previousEngagement.environment.id !== currentEngagement.environment.id) throw new Error('Retest engagement/environment identity mismatch');
  if (previousEngagement.environment.revision === currentEngagement.environment.revision) throw new Error('Retest requires a distinct declared repair revision');
  const stable = (e, c) => {
    const b = structuredClone(caseBinding(e, c));
    delete b.environment.revision; delete b.actor.sessionEpoch;
    return b;
  };
  const findings = previous.candidates.filter(f => f.status === 'confirmed').map(f => {
    const before = previousEngagement.cases.find(c => c.id === f.caseId), after = currentEngagement.cases.find(c => c.id === f.caseId);
    const test = current.tests.find(t => t.id === f.caseId);
    const comparable = before && after && isDeepStrictEqual(stable(previousEngagement, before), stable(currentEngagement, after)) &&
      before.controls.every(id => {
        const a = previousEngagement.cases.find(c => c.id === id), b = currentEngagement.cases.find(c => c.id === id);
        return a && b && isDeepStrictEqual(stable(previousEngagement, a), stable(currentEngagement, b));
      });
    const controlsPassed = after?.controls.every(id => current.tests.find(t => t.id === id)?.outcome === 'passed');
    return { findingId: f.id, caseId: f.caseId, status: !comparable || !test || !controlsPassed || test.outcome === 'incomplete' ? 'inconclusive'
      : test.outcome === 'passed' ? 'repair-verified-for-tested-cases' : 'still-reproduced' };
  });
  return { schemaVersion: 1, kind: 'nbret-assessment-retest', previousResultsDigest: digest(previous), currentResultsDigest: digest(current),
    previousRevision: previousEngagement.environment.revision, currentRevision: currentEngagement.environment.revision, findings,
    limitations: ['Verification applies only to unchanged claims, actors, policies, requests and controls at the declared repair revision.', 'Accepted risk and untested paths are not verified repairs.'] };
}

export function renderReport(e, r) {
  return `# Assessment: ${md(e.client)}\n\nEngagement: ${md(e.id)} · Environment: ${md(e.environment.id)} / ${md(e.environment.revision)}\n\n` +
    `Result: **${md(r.status)}**. ${r.counts.passed} passed, ${r.counts.failed} failed, ${r.counts.incomplete} incomplete explicit cases.\n\n` +
    `## Tested coverage\n\n| Case | Actor | Outcome | Claim |\n| --- | --- | --- | --- |\n` +
    r.tests.map(t => `| ${md(t.id)} | ${md(t.actor)} | ${md(t.outcome)} | ${md(t.claim)} |`).join('\n') +
    '\n\n## Findings and review status\n\n' + (r.candidates.length ? r.candidates.map(f => {
      const c = e.cases.find(c => c.id === f.caseId), actor = e.actors.find(a => a.id === c.actor);
      return `### ${md(f.id)}: ${md(f.title)}\n\nStatus: ${md(f.status)} · Severity: ${md(f.severity)} · Evidence: ${md(f.observationId)}\n\n` +
      `Reproduction request: ${md(c.method)} ${md(c.url)}\n\nActor: ${md(actor.principal)} · Tenant: ${md(actor.tenant)} · Role: ${md(actor.role)}\n\n` +
      `Preconditions: ${md(c.preconditions)}\n\nPolicy: ${md(e.policyRevision)} · Positive controls: ${c.controls.map(md).join(', ')}\n\n` +
      `Expected property: ${md(JSON.stringify(c.expect))}. Compare the linked observation in evidence.json; use fresh authorized credentials for reproduction.\n\n` +
      (f.review ? `Impact: ${md(f.review.impact)}\n\nRemediation: ${md(f.review.remediation)}\n\nOwner: ${md(f.review.owner)} · Reviewer: ${md(f.review.reviewer)}\n\nDecision basis: ${md(f.review.rationale)}\n` : 'This is an automated candidate; human review is required.\n');
    }).join('\n') : 'No candidates from the supplied cases. This does not establish absence of vulnerabilities.\n') +
    '\n## Exclusions\n\n' + e.exclusions.map(x => `- ${md(x)}`).join('\n') + '\n\n## Evidence limits\n\n' + r.limitations.map(x => `- ${md(x)}`).join('\n') +
    `\n\nEngagement digest: ${r.engagementDigest}\n\nEvidence digest: ${r.evidenceDigest}\n`;
}

export async function loadJson(path) {
  const file = await open(path, 'r');
  try {
    if ((await file.stat()).size > 64 * 1024 * 1024) throw new Error('JSON input exceeds 64 MiB');
    const raw = await file.readFile();
    if (raw.length > 64 * 1024 * 1024) throw new Error('JSON input exceeds 64 MiB');
    return JSON.parse(raw.toString('utf8'));
  } finally { await file.close(); }
}
