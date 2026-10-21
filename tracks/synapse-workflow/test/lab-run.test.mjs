import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {runLabRehearsal, openLabSession} from '../src/lab/run.mjs';
import {readJournal} from '../src/investigation/journal.mjs';
import {execFile} from 'node:child_process';
import {fileURLToPath} from 'node:url';

function assertCleanup(cleanup) {
  assert.equal(cleanup.status, 'observed-closed');
  assert.deepEqual(cleanup.errors, []);
  assert.equal(cleanup.transport.active, 0);
  assert.equal(cleanup.transport.stopped, true);
  assert.equal(cleanup.target.closed, true);
  assert.equal(cleanup.target.listening, false);
  assert.equal(cleanup.target.activeConnections, 0);
  assert.equal(cleanup.target.activeHandlers, 0);
  assert.equal(cleanup.target.mail.stopped, true);
  assert.equal(cleanup.target.mail.activeConnections, 0);
  assert.equal(cleanup.target.mail.listening, false);
  assert.equal(cleanup.listenerChecks.length, 3, 'HTTP target, HTTP inbox and SMTP listener probed');
  assert.ok(cleanup.listenerChecks.every(check => check.closed && check.observation === 'ECONNREFUSED'));
}

// Openly guided integration controls, using only the new owned local runner.
// These cases establish neither autonomous discovery nor held-out scoring.
for (const mode of ['secure', 'ownership-gap']) {
  test(`local rehearsal integrates delivered mail, controls and canonical report: ${mode}`, {timeout: 30000}, async () => {
    const parent = await mkdtemp(join(tmpdir(), 'synapse-lab-integration-'));
    try {
      const result = await runLabRehearsal({outDir: join(parent, 'run'), mode});
      assert.equal(result.status, 'completed-guided-rehearsal', JSON.stringify({stages: result.stages.map(({id,status}) => ({id,status})), evaluation: result.evaluation}));
      assert.equal(result.baseline.users, 0);
      assert.equal(result.baseline.orders, 0);
      assert.equal(result.baseline.messages, 0);
      assert.ok(Array.isArray(result.stages));
      assert.equal(result.stages.length, 8, 'all eight stages retain an observable outcome');
      assert.equal(new Set(result.stages.map(stage => stage.id)).size, 8);
      for (const stage of result.stages) {
        assert.ok(stage.id);
        assert.ok(stage.status);
        assert.ok(Array.isArray(stage.evidenceIds));
        assert.ok(stage.details, `stage ${stage.id} retains details`);
      }
      assert.equal(result.primaryEvaluation.status, mode === 'secure' ? 'not-demonstrated' : 'demonstrated');
      assert.equal(result.replayEvaluation.status, result.primaryEvaluation.status);
      assert.equal(result.evaluation.status, result.primaryEvaluation.status);
      assert.ok(Array.isArray(result.evaluation.evidenceIds));
      assert.ok(result.evaluation.evidenceIds.length > 0);
      assertCleanup(result.cleanup);
      const evidence = JSON.parse(await readFile(result.evidencePath, 'utf8'));
      const byId = new Map(evidence.map(receipt => [receipt.id, receipt]));
      for (const stage of result.stages) {
        assert.equal(stage.status, stage.id === 7 ? 'passed-guided-replay' : 'passed');
        for (const id of stage.evidenceIds) assert.ok(byId.has(id));
      }
      for (const receipt of evidence) {
        assert.equal(receipt.complete, true);
        assert.equal(receipt.buildId, result.buildId);
        assert.equal(receipt.generation, result.generation);
        assert.match(receipt.response.bodySha256, /^[a-f0-9]{64}$/);
      }
      const parsedBody = receipt => JSON.parse(receipt.response.body);
      const matching = (path, identity) => evidence.filter(r => new URL(r.request.url).pathname === path && r.identity === identity);
      const entryEvidence = result.stages.find(stage => stage.id === 1).evidenceIds.map(id => byId.get(id));
      assert.deepEqual(entryEvidence.map(r => new URL(r.request.url).pathname), ['/', '/api-docs'],
        'entry stage retains both actual root and linked protocol guide observations');
      assert.ok(entryEvidence.every(r => r.request.method === 'GET' && r.identity === 'anonymous' && r.response.status === 200));
      assert.ok(entryEvidence.every(r => r.response.bodyFieldsOmitted === true),
        'root and guide explicitly retain body omission metadata');
      assert.equal(entryEvidence[0].response.body, '[REDACTED non-JSON body]',
        'root HTML remains redacted; retained digest is not a readable hyperlink proof');
      const guide = parsedBody(entryEvidence[1]);
      assert.equal(guide.registration, undefined);
      assert.equal(guide.login, undefined);
      assert.equal(guide.orders.rule, undefined,
        'unknown protocol fields are omitted by the evidence allowlist; stage detail is an operator declaration');
      const firstRegistration = evidence.findIndex(r => new URL(r.request.url).pathname === '/api/register');
      assert.ok(evidence.indexOf(entryEvidence[1]) < firstRegistration, 'guide read precedes registration');
      const owner = parsedBody(matching('/api/me', 'owner')[0]).user;
      const other = parsedBody(matching('/api/me', 'other')[0]).user;
      assert.notEqual(owner.id, other.id);
      const created = evidence.find(r => new URL(r.request.url).pathname === '/api/orders' && r.request.method === 'POST');
      const order = parsedBody(created).order;
      assert.equal(order.ownerId, owner.id);
      const orderPath = `/api/orders/${order.id}`;
      assert.deepEqual(parsedBody(matching(orderPath, 'owner')[0]).order, order);
      assert.equal(matching(orderPath, 'anonymous')[0].response.status, 401);
      const foreign = matching(orderPath, 'other');
      assert.equal(foreign.length, 2, 'initial effect and fresh HTTP replay retained');
      for (const receipt of foreign) {
        if (mode === 'ownership-gap') assert.deepEqual(parsedBody(receipt).order, order);
        else {
          assert.equal(receipt.response.status, 403);
          assert.equal(parsedBody(receipt).order, undefined);
        }
      }
      assert.equal(result.cleanup.target.users.length, 2);
      assert.ok(result.cleanup.target.users.every(user => user.verified && user.mailDelivered));
      assert.equal(result.cleanup.target.mail.accepted, 2);
      assert.equal(result.cleanup.target.mail.messageCount, 2);
      const html = await readFile(result.reportPath, 'utf8');
      const match = html.match(/<script id="assessment-data" type="application\/json">([\s\S]*?)<\/script>/);
      assert.ok(match, 'uses the canonical standalone reader');
      const projection = JSON.parse(match[1]);
      assert.equal(projection.schemaVersion, 1);
      assert.equal(projection.observations.length, evidence.length);
      const expectedKinds = path => path === '/api/me' ? 'profile' : path.startsWith('/api/orders/') ? 'order' : path === '/api/orders' ? 'orders' : path === '/api/register' ? 'Account registration' : path === '/api/login' ? 'Account login' : path === '/verify' ? 'Email verification' : path === '/messages' ? 'Dedicated local mailbox' : 'page';
      for (const observation of projection.observations) {
        const receipt = byId.get(observation.id);
        assert.ok(receipt, 'each displayed observation is backed by retained traffic');
        assert.equal(observation.action.kind, expectedKinds(new URL(receipt.request.url).pathname));
        assert.equal(observation.action.actor, receipt.identity);
      }
      // The approved reader derives its Observed areas directly from these
      // retained action kinds; nonempty traffic must not render an empty area list.
      const observedAreas = [...new Set(projection.observations.map(o => o.action.kind))].sort();
      assert.deepEqual(observedAreas, ['Account login', 'Account registration', 'Dedicated local mailbox', 'Email verification', 'order', 'orders', 'page', 'profile'].sort());
      assert.ok(Array.isArray(projection.issues));
      assert.equal(projection.issues.filter(issue => issue.category === 'verifiedFindings').length, 0,
        'guided local replay does not confer independent verification authority');
      if (mode === 'ownership-gap') {
        assert.ok(projection.issues.some(issue => issue.category === 'issuesNeedingOwnerAction'));
      }
      const journal = await readJournal(result.journalPath);
      assert.equal(journal.events.filter(event => event.type === 'observation').length, evidence.length);
      assert.equal(journal.events.filter(event => event.type === 'cleanup').length, 1);
    } finally {
      await rm(parent, {recursive: true, force: true});
    }
  });
}

test('injected interruption retains failure and closes owned services', {timeout: 30000}, async () => {
  const parent = await mkdtemp(join(tmpdir(), 'synapse-lab-failure-'));
  try {
    const result = await runLabRehearsal({outDir: join(parent, 'run'), failAfterStage: 3});
    assert.equal(result.status, 'incomplete');
    assert.ok(result.failure);
    assert.ok(result.stages.some(stage => stage.status === 'failed'));
    assert.equal(result.evaluation, null);
    assertCleanup(result.cleanup);
    const state = JSON.parse(await readFile(result.statePath, 'utf8'));
    assert.deepEqual(state.caseSummary.verifiedFindings, []);
    assert.deepEqual(state.caseSummary.issuesNeedingOwnerAction, []);
  } finally {
    await rm(parent, {recursive: true, force: true});
  }
});

test('stop is idempotent, rejects new sends and fresh generations reset state', {timeout: 30000}, async () => {
  const parent = await mkdtemp(join(tmpdir(), 'synapse-lab-stop-'));
  let first, second;
  try {
    first = await openLabSession({outDir: join(parent, 'first')});
    const before = first.status();
    await first.request({path: '/'});
    const cleanup = await first.close();
    assertCleanup(cleanup);
    assert.deepEqual(await first.close(), cleanup);
    const sent = first.status().requests.sent;
    await assert.rejects(first.request({path: '/'}), /stopped/i);
    assert.equal(first.status().requests.sent, sent);
    second = await openLabSession({outDir: join(parent, 'second')});
    assert.notEqual(second.status().generation, before.generation);
    const reset = await second.close();
    assertCleanup(reset);
    assert.deepEqual(reset.target.users, []);
    assert.deepEqual(reset.target.orders, []);
  } finally {
    await first?.close();
    await second?.close();
    await rm(parent, {recursive: true, force: true});
  }
});

test('registration, login and verification secrets stay out of retained artifacts', {timeout: 30000}, async () => {
  const parent = await mkdtemp(join(tmpdir(), 'synapse-lab-redaction-'));
  let session;
  try {
    session = await openLabSession({outDir: join(parent, 'run')});
    const email = 'redaction-control@lab.test', password = 'Synthetic-only-secret-for-export-control';
    const registered = await session.request({path: '/api/register', method: 'POST', identity: 'owner', body: {email, password}});
    assert.equal(registered.receipt.response.status, 201);
    const verified = await session.verifyMail({identity: 'owner'});
    assert.equal(verified.verificationReceipt.response.status, 200);
    const login = await session.request({path: '/api/login', method: 'POST', identity: 'owner', body: {email, password}});
    const token = JSON.parse(login.raw).token;
    assert.ok(token);
    await session.close();
    const summary = await session.exportReport();
    const journal = await readJournal(summary.journalPath);
    const artifacts = [JSON.stringify(journal), ...await Promise.all([summary.reportPath, summary.statePath, summary.evidencePath, summary.summaryPath].map(path => readFile(path, 'utf8')))];
    for (const artifact of artifacts) {
      assert.equal(artifact.includes(password), false, 'password excluded');
      assert.equal(artifact.includes(token), false, 'session token excluded');
      assert.doesNotMatch(artifact, /[?&]token=[a-f0-9]{64}/, 'verification bearer excluded');
    }
  } finally {
    await session?.close();
    await rm(parent, {recursive: true, force: true});
  }
});

test('late interruption retains a distinct failed stage without duplicate stage IDs', {timeout: 30000}, async () => {
  const parent = await mkdtemp(join(tmpdir(), 'synapse-lab-late-failure-'));
  try {
    const result = await runLabRehearsal({outDir: join(parent, 'run'), failAfterStage: 7});
    assert.equal(result.status, 'incomplete');
    assert.ok(result.failure);
    assertCleanup(result.cleanup);
    assert.equal(result.stages.find(stage => stage.id === 6).status, 'passed', 'late injection must actually reach stage seven');
    assert.equal(result.stages.find(stage => stage.id === 7).status, 'failed');
    assert.equal(new Set(result.stages.map(stage => stage.id)).size, result.stages.length,
      'a cleanup pass must not duplicate or obscure an interrupted stage');
    assert.ok(result.stages.some(stage => stage.status === 'failed'));
  } finally {
    await rm(parent, {recursive: true, force: true});
  }
});

test('JSONL CLI rejects scope expansion and closes services on EOF', {timeout: 30000}, async () => {
  const parent = await mkdtemp(join(tmpdir(), 'synapse-lab-cli-'));
  try {
    const cli = fileURLToPath(new URL('../src/lab/cli.mjs', import.meta.url));
    const input = [
      JSON.stringify({command: 'request', path: '//example.invalid/'}),
      '{"command":"request","password":"Synthetic-malformed-secret",',
      JSON.stringify({command: 'request', path: '/'}),
    ].join('\n') + '\n';
    const {stdout, stderr} = await new Promise((resolve, reject) => {
      const child = execFile(process.execPath, [cli, 'session', '--out', join(parent, 'run')],
        {windowsHide: true, timeout: 15000, maxBuffer: 2 * 1024 * 1024},
        (error, stdout, stderr) => error ? reject(error) : resolve({stdout, stderr}));
      child.stdin.on('error', reject);
      child.stdin.end(input);
    });
    assert.equal(stderr, '');
    assert.equal(stdout.includes('Synthetic-malformed-secret'), false);
    const output = stdout.trim().split('\n').map(line => JSON.parse(line));
    assert.equal(output[0].type, 'ready');
    assert.equal(output.filter(item => item.type === 'command-rejected').length, 2);
    assert.equal(output.filter(item => item.type === 'observation').length, 1);
    assert.equal(output.at(-1).type, 'stopped');
    assertCleanup(output.at(-1).cleanup);
    const summary = JSON.parse(await readFile(output.at(-1).summaryPath, 'utf8'));
    assert.equal(summary.requests.sent, 1, 'rejected commands never reach the typed transport');
  } finally {
    await rm(parent, {recursive: true, force: true});
  }
});

test('budget-denied receipt exports as incomplete with unknown action reach and HTTP status', {timeout: 30000}, async () => {
  const parent = await mkdtemp(join(tmpdir(), 'synapse-lab-budget-'));
  let session;
  try {
    session = await openLabSession({outDir: join(parent, 'run'), maxRequests: 1});
    const allowed = await session.request({path: '/'});
    assert.equal(allowed.receipt.complete, true);
    const denied = await session.request({path: '/'});
    assert.equal(denied.receipt.complete, false);
    assert.ok(denied.receipt.error);
    const cleanup = await session.close();
    assertCleanup(cleanup);
    const summary = await session.exportReport();
    assert.equal(summary.requests.sent, 1);
    assert.equal(summary.requests.denied, 1);
    const html = await readFile(summary.reportPath, 'utf8');
    const projection = JSON.parse(html.match(/<script id="assessment-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
    const observation = projection.observations.find(o => o.id === denied.receipt.id);
    assert.ok(observation);
    assert.equal(observation.outcome, 'incomplete');
    assert.equal(observation.actionReached, null);
    assert.equal(observation.response.status, null);
    assert.equal(observation.transport.complete, false);
    assert.ok(observation.errorCode);
    assert.deepEqual(projection.issues, []);
  } finally {
    await session?.close();
    await rm(parent, {recursive: true, force: true});
  }
});
