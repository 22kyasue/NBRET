import { randomUUID, randomBytes } from 'node:crypto';
import { mkdir, writeFile, readFile, lstat } from 'node:fs/promises';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import { startLabTarget } from './target.mjs';
import { createLabTransport, getLabResponseBody } from './transport.mjs';
import { evaluateOwnershipRead } from './evaluate.mjs';
import { createJournal, appendEvent, readJournal } from '../investigation/journal.mjs';
import { outputDirectory } from '../investigation/output-path.mjs';
import { renderAssessmentReport } from '../practice/reader-report.mjs';

const LIMITATIONS = [
  'Openly guided local rehearsal with known generated source; not a blind benchmark or measured autonomous discovery.',
  'Mail is actually delivered over local SMTP into a dedicated local inbox. External provider delivery and credentials are not established.',
  'The typed executor only admits its two numeric loopback origins. Host coding sessions are trusted operators, not OS-isolated investigators.',
  'Evidence identity/build annotations and review are local declarations corroborated by HTTP controls; hashes are not authenticated provenance.',
  'Only one order-read ownership rule is evaluated. No global security, administrator access, database access or repaired-build claim follows.',
  'No arbitrary generated helpers, external scanners, providers or client targets are executed.',
];
const safeError = error => ['NBRET_JOURNAL'].includes(error?.code) ? error.message : 'Local rehearsal operation failed; retained stage and receipt records identify the boundary.';
const parse = text => { try { return JSON.parse(text); } catch { return null; } };
const now = () => new Date().toISOString();
const boundedText = value => typeof value === 'string' && value.trim() && value.length <= 2000;
const modes = ['secure', 'ownership-gap'];
function receiptPath(receipt) { try { return new URL(receipt.request.url).pathname; } catch { return '[rejected-or-unavailable]'; } }
async function freshDirectory(destination) {
  const requested = resolve(destination), track = fileURLToPath(new URL('../../', import.meta.url)), project = fileURLToPath(new URL('../../../../', import.meta.url));
  const forbidden = [join(track, 'src'), join(track, 'test'), join(track, 'docs'), join(project, 'src'), join(project, 'test'), join(project, 'docs'), join(project, 'references'), join(project, '.git')];
  let ancestor = dirname(requested);
  for (;;) {
    try { await lstat(ancestor); break; } catch (error) { if (error.code !== 'ENOENT' || dirname(ancestor) === ancestor) throw error; ancestor = dirname(ancestor); }
  }
  // Validate the existing ancestry before creating even a parent directory. This
  // prevents a failed suite setup leaving new folders inside a source or journal.
  const probe = await outputDirectory(join(ancestor, '.lab-output-check'), forbidden);
  const canonical = resolve(dirname(probe), relative(ancestor, requested));
  await mkdir(dirname(canonical), { recursive: true });
  const checked = await outputDirectory(canonical, forbidden);
  await mkdir(checked, { recursive: false });
  return checked;
}
function listenerClosed(origin) {
  const url = new URL(origin);
  if (url.hostname !== '127.0.0.1' || !url.port) throw Error('Only admitted loopback listeners can be checked');
  return new Promise(resolve => {
    const socket = net.connect({ host: '127.0.0.1', port: Number(url.port), family: 4 });
    let settled = false;
    const done = result => { if (settled) return; settled = true; socket.destroy(); resolve({ origin, ...result }); };
    socket.setTimeout(1000);
    socket.once('connect', () => done({ closed: false, observation: 'connection-accepted' }));
    socket.once('error', error => done({ closed: error.code === 'ECONNREFUSED', observation: error.code ?? 'unknown-error' }));
    socket.once('timeout', () => done({ closed: false, observation: 'timeout-not-proof-of-closure' }));
  });
}

// A trusted operator orchestrates typed HTTP capabilities. This does not confine
// other tools possessed by the calling coding session or establish hidden custody.
export async function openLabSession({ outDir, mode = 'secure', maxRequests = 100, deadlineMs = 120000, targetFactory = startLabTarget } = {}) {
  if (!outDir || !modes.includes(mode)) throw Error('Fresh output directory and supported local mode required');
  const directory = await freshDirectory(outDir);
  const id = `lab-${randomUUID()}`, createdAt = now(), journalPath = join(directory, 'journal');
  let journal = await createJournal(journalPath, { kind: 'synapse-local-url-lab', id, createdAt, mode, authority: 'trusted-local-operator; openly-guided', limitations: LIMITATIONS });
  let target, transport, closed = false, closePromise, cleanup = null, evaluation = null, hypothesis = null, baseline;
  const receipts = [], mailDeliveries = [], stages = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, status: 'not-attempted', details: 'No completed stage evidence yet.', evidenceIds: [] })), credentials = new Map(), accountEmails = new Map();
  let recordQueue = Promise.resolve();
  const record = event => {
    const result = recordQueue.then(async () => {
      journal = await appendEvent(journalPath, { id: randomUUID(), time: now(), ...event }, { expectedRevision: journal.revision, expectedHead: journal.head });
    });
    recordQueue = result.catch(() => {});
    return result;
  };
  try {
    target = await targetFactory({ mode, port: 0, mailPort: 0 });
    const initial = target.inspect();
    baseline = { buildId: target.buildId, generation: target.generation, users: initial.users.length, orders: initial.orders.length, messages: initial.mail.messageCount, listening: initial.listening, mailListening: initial.mail.listening };
    if (baseline.users || baseline.orders || baseline.messages || !baseline.listening || !baseline.mailListening) throw Error('Fresh empty listening target required');
    transport = createLabTransport({ origins: [target.origin, target.inboxOrigin], maxRequests, maxResponseBytes: 1024 * 1024, deadlineMs, timeoutMs: 5000 });
    await record({ type: 'target-started', target: { origin: target.origin, inboxOrigin: target.inboxOrigin, buildId: target.buildId, generation: target.generation, mode }, baseline, limitations: LIMITATIONS });
  } catch (error) {
    await transport?.stop(); await target?.close();
    await record({ type: 'setup-failed', reason: safeError(error) });
    throw error;
  }
  async function stage(id, status, details, evidenceIds = []) {
    const entry = { id, status, details, evidenceIds: [...evidenceIds], time: now() };
    if (!Number.isInteger(id) || id < 1 || id > 8) throw Error('Stage must be one of the eight admitted stages');
    stages[id - 1] = entry; await record({ type: 'stage', stage: entry }); return entry;
  }
  async function request({ target: destination = 'app', path = '/', method = 'GET', identity = 'anonymous', body, headers = {} } = {}) {
    if (closed) throw Error('Session stopped; create a fresh run to perform more actions');
    if (!['app', 'inbox'].includes(destination) || typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || path.includes('\\') || /[\r\n]/.test(path)) throw Error('Only relative paths on the admitted local service are supported');
    if (typeof identity !== 'string' || !/^[a-z][a-z0-9-]{0,39}$/.test(identity)) throw Error('Bounded identity label required');
    if (Object.keys(headers).some(k => !['accept', 'content-type'].includes(k.toLowerCase()))) throw Error('Caller headers are restricted; session authentication is managed locally');
    const origin = destination === 'app' ? target.origin : target.inboxOrigin, url = new URL(path, origin);
    if (url.origin !== origin) throw Error('Out-of-scope URL');
    const auth = destination === 'inbox' ? target.mailboxToken : credentials.get(identity);
    const receipt = await transport.request({ url: url.href, method, identity,
      headers: { ...headers, ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(auth ? { authorization: `Bearer ${auth}` } : {}) },
      ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
    const raw = getLabResponseBody(receipt), data = parse(raw);
    // Attach the actual served generation only when headers match the admitted
    // target. A transport response from a wrong build remains unadmitted.
    const matched = receipt.response?.headers?.['x-lab-build-id'] === target.buildId && receipt.response?.headers?.['x-lab-generation'] === target.generation;
    const saved = { ...receipt, buildId: matched ? target.buildId : null, generation: matched ? target.generation : null };
    receipts.push(saved); await record({ type: 'observation', receipt: saved });
    if (!closed && receipt.complete && matched && destination === 'app') {
      if (url.pathname === '/api/register' && method === 'POST' && receipt.response.status === 201) {
        const submitted = typeof body === 'string' ? parse(body) : body;
        if (typeof submitted?.email === 'string') accountEmails.set(identity, submitted.email);
      }
      if (url.pathname === '/api/login' && method === 'POST' && receipt.response.status === 200 && typeof data?.token === 'string') credentials.set(identity, data.token);
    }
    return { receipt: saved, data: parse(saved.response?.body) ?? saved.response?.body, raw };
  }
  async function verifyMail({ identity, recipient = accountEmails.get(identity) } = {}) {
    if (!recipient || recipient !== accountEmails.get(identity)) throw Error('Verification must correlate to an account registered in this run');
    const mail = await request({ target: 'inbox', path: `/messages?recipient=${encodeURIComponent(recipient)}`, identity });
    if (!mail.receipt.complete || mail.receipt.response.status !== 200 || mail.receipt.buildId !== target.buildId || mail.receipt.generation !== target.generation) throw Error('Mailbox evidence does not match the admitted run');
    const messages = parse(mail.raw)?.messages;
    const message = Array.isArray(messages) ? [...messages].reverse().find(m => m.to === recipient && typeof m.text === 'string' && m.headers?.received) : null;
    if (!message) throw Error('No correlated SMTP-delivered verification message');
    if (message.buildId !== target.buildId || message.generation !== target.generation) throw Error('Delivered message belongs to another build or generation');
    const candidate = message.text.match(/http:\/\/127\.0\.0\.1:\d+\/[^\s<>"']+/)?.[0];
    if (!candidate) throw Error('Delivered message has no admitted verification URL');
    const verification = new URL(candidate);
    if (verification.origin !== target.origin || !/verify/i.test(verification.pathname)) throw Error('Mail verification link is outside the admitted target');
    const result = await request({ path: verification.pathname + verification.search, identity });
    const delivery = { messageId: message.id, recipient, received: message.headers.received, buildId: message.buildId, generation: message.generation,
      mailEvidenceId: mail.receipt.id, verificationEvidenceId: result.receipt.id, transport: 'actual-local-smtp', authority: 'observed by trusted local operator from received message; not external provider proof' };
    mailDeliveries.push(delivery); await record({ type: 'mail-delivery', delivery });
    return { mailReceipt: mail.receipt, verificationReceipt: result.receipt, messageId: message.id, deliveredLocally: true };
  }
  async function setHypothesis(value) {
    if (closed || !value || !['question', 'prediction', 'disconfirmation'].every(k => boundedText(value[k]))) throw Error('Hypothesis needs question, prediction and disconfirmation');
    // Hypotheses must cite existing observations, not private target inspection.
    if (!Array.isArray(value.evidenceIds) || !value.evidenceIds.length || value.evidenceIds.some(id => !receipts.some(r => r.id === id))) throw Error('Hypothesis needs retained observed evidence');
    hypothesis = structuredClone(value); await record({ type: 'hypothesis', hypothesis }); return hypothesis;
  }
  async function evaluate({ ownerIdentity = 'owner', otherIdentity = 'other', ...ids } = {}) {
    if (!hypothesis) throw Error('Record a hypothesis before evaluating it');
    const input = { buildId: target.buildId, ownerIdentity, otherIdentity };
    for (const key of ['ownerCreate', 'ownerRead', 'otherRead', 'otherMe', 'ownerMe', 'anonymousRead']) input[key] = receipts.find(r => r.id === ids[key]);
    evaluation = evaluateOwnershipRead(input);
    await record({ type: 'evaluation', evaluation, hypothesis, inputIds: ids }); return evaluation;
  }
  function status() { return { id, mode, origin: target.origin, inboxOrigin: target.inboxOrigin, buildId: target.buildId, generation: target.generation, closed,
    requests: transport.stats(), stages: structuredClone(stages), evaluation, receiptCount: receipts.length, journalPath, directory, baseline, mailDeliveries, limitations: LIMITATIONS }; }
  async function close() {
    if (closePromise) return closePromise;
    closed = true;
    closePromise = (async () => {
      const errors = [];
      try { await transport.stop(); } catch { errors.push('transport-stop-failed'); }
      try { await target.close(); } catch { errors.push('target-close-failed'); }
      credentials.clear(); accountEmails.clear();
      const transportState = transport.stats(), targetState = target.inspect();
      const origins = [target.origin, target.inboxOrigin, ...(target.smtpPort ? [`http://127.0.0.1:${target.smtpPort}`] : [])];
      const listenerChecks = await Promise.all(origins.map(listenerClosed));
      const closedObserved = targetState.closed === true && targetState.listening === false && targetState.activeConnections === 0 && targetState.activeHandlers === 0 && targetState.mail.closed === true && targetState.mail.listening === false && targetState.mail.activeConnections === 0 && listenerChecks.every(v => v.closed);
      cleanup = { status: errors.length || transportState.active !== 0 || !closedObserved ? 'incomplete' : 'observed-closed', errors, transport: transportState, target: targetState, listenerChecks, time: now() };
      await record({ type: 'cleanup', cleanup });
      return cleanup;
    })();
    return closePromise;
  }
  async function exportReport() {
    await recordQueue;
    const state = makeReaderState({ id, createdAt, mode, target, stages, receipts, evaluation, hypothesis, revision: journal.revision, closed });
    const paths = { reportPath: join(directory, 'assessment.html'), statePath: join(directory, 'assessment-state.json'), evidencePath: join(directory, 'evidence.json'), summaryPath: join(directory, 'summary.json') };
    // Only generated output is overwritten, to update this run's report. Journal
    // events retain old conclusions; new runs always require a fresh directory.
    const summary = { schemaVersion: 1, ...status(), cleanup, ...paths };
    await writeFile(paths.statePath, JSON.stringify(state, null, 2));
    await writeFile(paths.evidencePath, JSON.stringify(receipts, null, 2));
    await writeFile(paths.reportPath, renderAssessmentReport(state, { exported: true }));
    await writeFile(paths.summaryPath, JSON.stringify(summary, null, 2));
    return summary;
  }
  return { request, verifyMail, setHypothesis, evaluate, stage, close, exportReport, status };
}

function makeReaderState({ id, createdAt, mode, target, stages, receipts, evaluation, hypothesis, revision, closed }) {
  const demonstrated = evaluation?.status === 'demonstrated', finding = evaluation && {
    id: 'order-ownership-read', title: demonstrated ? 'Another registered user can read this test order' : 'Selected order ownership hypothesis was not demonstrated',
    substatus: demonstrated ? 'guided-effect-reproduced; independent owner verification pending' : evaluation.status,
    interpretation: demonstrated ? 'A synthetic order was returned to a different corroborated principal in this guided local run. Independent custody and client applicability are not established.' : 'This selected test did not establish a violation. It does not establish that the application is secure.',
    impactType: 'exposure', observed: demonstrated ? 'The other account received the exact owner-created order, with owner and object identifiers matching legitimate controls.' : evaluation.reasons.join('; '),
    expected: 'A registered user may read their own order. A different user and an anonymous requester must not receive it.',
    demonstratedConsequence: demonstrated ? 'Exposure of one synthetic order description to one other newly registered test identity.' : 'No unauthorized order disclosure demonstrated by these controls.',
    potentialConsequences: 'Other records or interfaces require separate testing; broader reach is unknown.',
    uncertainties: 'Guided/familiar target; trusted same-host collector and reviewer; no external system, independent custody or general coverage claim.',
    suggestedRepair: 'Enforce authenticated ownership for each order lookup at the server data-access boundary, including related interfaces. Preserve legitimate owner access.',
    manualVerification: 'On a fresh admitted target, register and verify two users; create an order as A; confirm A can read it, B cannot receive its body, and anonymous access is denied. Retain identities, build, request and response evidence. Test related paths separately.',
    basisEvidenceIds: evaluation.evidenceIds, identity: { principal: 'other (corroborated by /api/me)', tenant: 'not modeled', role: 'registered user' }, environment: { sourceHash: target.buildId },
    gates: [], reviews: [], ownerVerifications: [], retestPlans: [], retests: [],
  };
  if (demonstrated) {
    const evidenceIds = evaluation.evidenceIds;
    finding.consequence = { stale: false, document: {
      caseId: finding.id, capability: 'A different self-registered user receives one synthetic order owned by another test account.',
      whyPossible: 'This observed order-read path returned the owner’s exact protected object to a different authenticated principal. The check is at the server ownership boundary.',
      severity: { level: 'unknown', rationale: 'Synthetic local data only. Real asset sensitivity, breadth and client consequence are not assessed.' },
      extent: { demonstrated: { description: 'One created order, two corroborated registered principals, one read endpoint, one admitted build and generation.', evidenceIds },
        wider: { description: 'Other orders, tenants, write paths and privileged roles were not evaluated.', evidenceIds: [], assumptions: ['No broader reach can be inferred from this single object.'] } },
      accessEffort: { level: 'low', rationale: 'Two ordinary accounts were self-registered and email-verified within the admitted local environment.' },
      repair: { immediate: 'Require the authenticated principal to own the requested order before returning its protected body.',
        broaderRule: 'Apply the same ownership invariant to every equivalent data-access path and preserve tenant boundaries if introduced.',
        legitimateFlowEffects: 'Owner create/list/read must remain usable. Denying every read would break legitimate behavior.',
        acceptanceChecks: ['Owner read still returns the exact order.', 'Other registered user receives no protected order payload.', 'Anonymous user receives no protected order payload.', 'Repeat on related interfaces and a genuine changed build before claiming a repair.'],
        effort: { level: 'unknown', rationale: 'No client code or genuine repair implementation was assessed.' } },
      sequence: [
        { id: 'establish-owner', explanation: 'Create an order as A and corroborate both authenticated principals.', evidenceIds, screenshots: [], expected: 'The created order belongs to A.', current: 'The collected creation and /api/me receipts establish this synthetic object and the two distinct user IDs.', proposedRepaired: 'Preserve account registration and owner creation.' },
        { id: 'compare-read', explanation: 'Compare legitimate, foreign and anonymous reads against the exact same object.', evidenceIds, screenshots: [], expected: 'Only A receives the protected order body.', current: 'B received A’s exact order; the legitimate owner control and anonymous denial were retained.', proposedRepaired: 'B and anonymous requests receive no protected body; A retains access.' },
        { id: 'repeat-observation', explanation: 'Fresh requests reproduce the selected result within the same admitted generation.', evidenceIds, screenshots: [], expected: 'A conclusion should survive matching control observations.', current: 'The guided replay agrees. Separate owner verification and protected custody remain pending.', proposedRepaired: 'Use actual changed-build receipts plus original, related and legitimate controls. No repaired-build result is supplied here.' },
      ],
      nextInvestigation: { extendDemonstratedPath: 'Only within a separately admitted scope, determine whether other objects or equivalent interfaces share the observed ownership failure.',
        resolveFixUncertainty: 'Obtain an actual changed build and repeat owner/foreign/anonymous controls before describing this as fixed.' },
    } };
  }
  const issuesNeedingOwnerAction = demonstrated ? [finding] : [], unconfirmedLeads = evaluation && !demonstrated ? [finding] : [];
  return { id, createdAt, revision, subject: { company: 'Synapse owned local rehearsal', application: 'Disposable order application', date: createdAt },
    target: { origin: target.origin, sourceHash: target.buildId, actors: ['owner', 'other'].map(id => ({ id, tenant: 'not modeled', role: 'self-registered user' })) },
    intake: { requestedUrl: target.origin, context: [`Actual local HTTP and SMTP; mode ${mode}; openly guided scripted or operator-steered session.`], businessRules: ['An order belongs to its creator; authenticated non-owners and anonymous users must not receive its protected body.'] },
    scope: { tracks: 'URL-first self-registration and one order-read rule', enabledActors: ['owner', 'other'], executionBoundary: 'Restricted typed HTTP executor; two exact numeric loopback origins only' },
    limitations: [...LIMITATIONS, ...stages.map(s => `Stage ${s.id}: ${s.status} — ${s.details}`), ...(hypothesis ? [`Hypothesis: ${hypothesis.question}`] : []), ...(evaluation?.limitations ?? [])],
    stopReason: closed ? 'Owned transport and local services stopped; consult cleanup receipt.' : 'Session active; no cleanup claim yet.',
    observations: receipts.map(r => ({ id: r.id, outcome: r.complete ? 'complete' : 'incomplete', errorCode: r.error ?? null, actionReached: r.complete ? true : null,
      action: { kind: (() => { const path = receiptPath(r); return path === '/api/me' ? 'profile' : path.startsWith('/api/orders/') ? 'order' : path === '/api/orders' ? 'orders' : path === '/api/register' ? 'Account registration' : path === '/api/login' ? 'Account login' : path === '/verify' ? 'Email verification' : path === '/messages' ? 'Dedicated local mailbox' : path === '[rejected-or-unavailable]' ? 'Rejected or unavailable request' : 'page'; })(), actor: r.identity },
      identity: { principal: r.identity, role: r.identity === 'anonymous' ? 'anonymous' : 'operator-declared label; see /api/me evidence' }, environment: { id: r.generation, sourceHash: r.buildId },
      request: { actor: r.identity, method: r.request.method, path: receiptPath(r) },
      response: { status: r.response?.status ?? null, bodySha256: r.response?.bodySha256 ?? null, value: parse(r.response?.body) ?? r.response?.body ?? null }, transport: { complete: r.complete } })),
    caseSummary: { verifiedFindings: [], issuesNeedingOwnerAction, unconfirmedLeads }, ownerRequests: [], screenshotArtifacts: [], proofProgress: evaluation ? [{ caseId: finding.id, status: evaluation.status, result: { kind: 'guided-order-read-effect', ...evaluation }, nextAction: 'Obtain independent owner verification before promoting this guided result; preserve matched identities and build.' }] : [] };
}

export async function runLabRehearsal({ outDir, mode = 'secure', targetFactory, failAfterStage } = {}) {
  const session = await openLabSession({ outDir, mode, targetFactory });
  let failure = null, primaryEvaluation, replayEvaluation;
  const checkpoint = async (id, details, ids = []) => { await session.stage(id, id === 7 ? 'passed-guided-replay' : 'passed', details, ids); if (failAfterStage === id) { const error = Error('Injected integration failure'); error.stage = id; throw error; } };
  try {
    const root = await session.request({ path: '/' });
    if (!root.receipt.complete || root.receipt.response.status !== 200 || !/register|sign.?up/i.test(root.raw)) throw Error('URL registration entry not discoverable');
    const guidePath = root.raw.match(/href="(\/api-docs)"/)?.[1];
    if (!guidePath) throw Error('No discoverable local API guide');
    const guide = await session.request({ path: guidePath });
    const publicGuide = parse(guide.raw);
    if (!guide.receipt.complete || guide.receipt.response.status !== 200 || publicGuide?.registration?.path !== '/api/register' || publicGuide?.login?.path !== '/api/login' || publicGuide?.orders?.rule !== 'Only the creator may read an order.') throw Error('Observed application guide does not match this narrow supported rehearsal');
    await checkpoint(1, 'Owned URL and linked API guide reached; registration, normal use and ownership rule observed. The guided runner supports only this declared local protocol.', [root.receipt.id, guide.receipt.id]);
    const accounts = [];
    for (const identity of ['owner', 'other']) {
      const email = `${identity}-${randomBytes(6).toString('hex')}@rehearsal.test`, password = randomBytes(24).toString('base64url');
      const registered = await session.request({ path: '/api/register', method: 'POST', identity, body: { email, password } });
      if (!registered.receipt.complete || registered.receipt.response.status !== 201) throw Error('Registration failed');
      accounts.push({ identity, email, password, registered });
    }
    await checkpoint(2, 'Two dedicated test identities self-registered through HTTP; no preprovided user credentials.', accounts.map(a => a.registered.receipt.id));
    const mailEvidence = [];
    for (const account of accounts) {
      const verified = await session.verifyMail(account);
      if (!verified.verificationReceipt.complete || verified.verificationReceipt.response.status !== 200) throw Error('Email verification failed');
      mailEvidence.push(verified.mailReceipt.id, verified.verificationReceipt.id);
      const login = await session.request({ path: '/api/login', method: 'POST', identity: account.identity, body: { email: account.email, password: account.password } });
      if (!login.receipt.complete || login.receipt.response.status !== 200) throw Error('Login after verification failed');
    }
    await checkpoint(3, 'Actual locally received SMTP messages correlated to both registrations; their delivered links verified the accounts. External mail readiness not claimed.', mailEvidence);
    const ownerMe = await session.request({ path: '/api/me', identity: 'owner' }), otherMe = await session.request({ path: '/api/me', identity: 'other' });
    const ownerCreate = await session.request({ path: '/api/orders', method: 'POST', identity: 'owner', body: { description: `Synthetic rehearsal order ${randomUUID()}` } });
    const order = parse(ownerCreate.raw)?.order;
    if (!order?.id || !ownerMe.data?.user?.id || !otherMe.data?.user?.id) throw Error('Normal use or identity corroboration failed');
    const path = `/api/orders/${encodeURIComponent(order.id)}`;
    const ownerRead = await session.request({ path, identity: 'owner' }), anonymousRead = await session.request({ path });
    if (![ownerMe, otherMe, ownerCreate, ownerRead, anonymousRead].every(v => v.receipt.complete && v.receipt.buildId === session.status().buildId && v.receipt.generation === session.status().generation) || ownerMe.receipt.response.status !== 200 || otherMe.receipt.response.status !== 200 || ownerMe.data.user.id === otherMe.data.user.id || ownerCreate.receipt.response.status !== 201 || ownerRead.receipt.response.status !== 200 || JSON.stringify(ownerRead.data.order) !== JSON.stringify(order) || ![401, 403].includes(anonymousRead.receipt.response.status) || anonymousRead.data.order) throw Error('Legitimate and anonymous controls did not establish normal use');
    await checkpoint(4, 'Registered principals corroborated with /api/me; order created and read legitimately; anonymous denial collected.', [ownerMe, otherMe, ownerCreate, ownerRead, anonymousRead].map(r => r.receipt.id));
    await session.setHypothesis({ question: 'Does the order-read endpoint enforce the owner boundary between these two registered users?', prediction: 'The second registered principal cannot receive the first principal’s exact order body.', disconfirmation: 'A complete response to the other corroborated principal contains the exact owner-created protected order; missing/error/quoted evidence is inconclusive.', evidenceIds: [ownerCreate.receipt.id, ownerRead.receipt.id, otherMe.receipt.id] });
    await checkpoint(5, 'Observation-grounded ownership hypothesis recorded before the foreign read, with explicit disconfirmation.', [ownerCreate.receipt.id, ownerRead.receipt.id]);
    const otherRead = await session.request({ path, identity: 'other' });
    const ids = Object.fromEntries(Object.entries({ ownerCreate, ownerRead, otherRead, otherMe, ownerMe, anonymousRead }).map(([key, value]) => [key, value.receipt.id]));
    primaryEvaluation = await session.evaluate(ids);
    if (primaryEvaluation.status === 'inconclusive') throw Error('Effect evaluation inconclusive');
    await checkpoint(6, `Actual foreign read and controls evaluated: ${primaryEvaluation.status}.`, primaryEvaluation.evidenceIds);
    // Replay is fresh traffic with the same immutable object/identities; it tests
    // reproducibility. It is not a second independent target or a blind review.
    const replay = {};
    for (const [key, identity, requestPath] of [['ownerMe', 'owner', '/api/me'], ['otherMe', 'other', '/api/me'], ['ownerRead', 'owner', path], ['anonymousRead', 'anonymous', path], ['otherRead', 'other', path]]) replay[key] = (await session.request({ path: requestPath, identity })).receipt.id;
    replayEvaluation = await session.evaluate({ ...ids, ...replay });
    if (replayEvaluation.status !== primaryEvaluation.status) throw Error('Fresh replay contradicted the initial selected result');
    await checkpoint(7, 'Fresh HTTP replay agrees with initial result using the separately authored effect checker. Same-host authorship/replay; independent owner/custody verification remains pending.', replayEvaluation.evidenceIds);
  } catch (error) {
    failure = safeError(error);
    const attempted = session.status().stages.filter(s => s.status !== 'not-attempted').at(-1)?.id ?? 0;
    await session.stage(error.stage ?? Math.min(7, attempted + 1), 'failed', failure);
  } finally {
    const cleanup = await session.close();
    await session.stage(8, cleanup.status === 'observed-closed' ? 'passed' : 'failed', 'Transport stop and service closure inspected; fresh-generation reset is checked by the two-run suite.', []);
  }
  const result = await session.exportReport();
  const summary = { ...result, status: failure || result.cleanup?.status !== 'observed-closed' ? 'incomplete' : 'completed-guided-rehearsal', failure, primaryEvaluation, replayEvaluation };
  await writeFile(result.summaryPath, JSON.stringify(summary, null, 2));
  return summary;
}

export async function runLabSuite({ outDir } = {}) {
  if (!outDir) throw Error('Fresh output directory required');
  outDir = await freshDirectory(outDir);
  const secure = await runLabRehearsal({ outDir: join(outDir, 'secure'), mode: 'secure' });
  const gap = await runLabRehearsal({ outDir: join(outDir, 'ownership-gap'), mode: 'ownership-gap' });
  const reset = { differentGeneration: secure.generation !== gap.generation, separateOrigins: secure.origin !== gap.origin, freshEmptyBaselines: [secure, gap].every(r => r.baseline.users === 0 && r.baseline.orders === 0 && r.baseline.messages === 0), authority: 'two fresh process-local target instances; empty account/order/mail baselines observed before registration, not merely renamed generations' };
  const passed = secure.status === 'completed-guided-rehearsal' && gap.status === 'completed-guided-rehearsal' && secure.evaluation?.status === 'not-demonstrated' && gap.evaluation?.status === 'demonstrated' && reset.differentGeneration && reset.freshEmptyBaselines;
  const summary = { schemaVersion: 1, status: passed ? 'completed-guided-control-suite' : 'incomplete', reset, secure, gap, limitations: LIMITATIONS };
  await writeFile(join(outDir, 'suite.json'), JSON.stringify(summary, null, 2));
  return summary;
}

// Records-only recovery never starts a target or replays saved requests.
export async function inspectLabRun(directory) {
  const snapshot = await readJournal(join(resolve(directory), 'journal'));
  if (snapshot.manifest.kind !== 'synapse-local-url-lab') throw Error('Not a local lab journal');
  let summary = null;
  try { const file = join(resolve(directory), 'summary.json'); const stat = await lstat(file); if (!stat.isFile() || stat.size > 4 * 1024 * 1024) throw Error('Invalid saved summary'); summary = JSON.parse(await readFile(file, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  return { manifest: snapshot.manifest, revision: snapshot.revision, head: snapshot.head, lastEvent: snapshot.events.at(-1), summary, authority: 'records-only; saved closed status is historical, not a live process assertion' };
}
