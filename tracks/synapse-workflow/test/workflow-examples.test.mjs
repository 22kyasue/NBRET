import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { compareExamples, summarizeExample, runWorkflowExamples } from '../src/workflow-examples.mjs';

const evidence = (destination, extra = false) => ({ scripts: [], actions: [{ id: 1, label: 'navigate', observedAt: '2026-10-14T20:00:00Z' }],
  requests: [{ requestId: 'doc', resourceType: 'Document', request: { url: 'https://example.test/student', method: 'GET' }, response: { status: 200 }, observedAt: '2026-10-14T20:00:01Z', actionId: 1 },
    ...(extra ? [{ requestId: 'api', request: { url: 'https://example.test/api/user?token=hidden', method: 'GET' }, response: { status: 401, fromDiskCache: true }, observedAt: '2026-10-14T20:00:02Z' }] : [])],
  snapshots: [{ label: 'final', url: 'https://example.test/' + destination, storage: { localStorage: { count: 2, valuesOmitted: true } }, links: [{ href: 'https://example.test/help?token=hidden' }] }],
  navigation: [{ kind: 'within-document', url: 'https://example.test/' + destination, observedAt: '2026-10-14T20:00:03Z' }], consoleMetadata: [{ type: 'warning' }] });

test('summaries order actions/requests/navigation and compare observed route, cache and request differences', () => {
  const a = summarizeExample(evidence('signin')), b = summarizeExample(evidence('student', true));
  assert.deepEqual(a.timeline.slice(0, 3).map(x => x.kind), ['action', 'request', 'within-document']); // Unknown snapshot time sorts last.
  assert.equal(b.authenticationResponses[0].status, 401);
  assert.ok(!JSON.stringify(b).includes('hidden'));
  const diff = compareExamples(a, b);
  assert.equal(diff.requestDifferences.length, 1);
  assert.equal(diff.finalUrls.changed, true);
  assert.equal(diff.cache.right.disk, 1);
});

test('multiple saved runs create separate evidence packs, comparisons, failures and open questions', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-examples-'));
  for (const [id, destination] of [['a', 'signin'], ['b', 'student']]) {
    await mkdir(join(root, id, 'network'), { recursive: true });
    await writeFile(join(root, id, 'network/evidence.json'), JSON.stringify(evidence(destination, id === 'b')));
  }
  const out = join(root, 'out');
  const result = await runWorkflowExamples({ question: 'Which examples return to sign-in?', terms: ['/signin'], outDir: out,
    examples: [{ id: 'a', runDir: join(root, 'a'), expectFinalUrlIncludes: '/signin' }, { id: 'b', runDir: join(root, 'b'), expectFinalUrlIncludes: '/signin' }], comparisons: [{ left: 'a', right: 'b' }] });
  assert.equal(result.status, 'failed');
  assert.equal(result.examples[0].routeCheck.outcome, 'passed');
  assert.equal(result.examples[1].routeCheck.outcome, 'failed');
  assert.equal(result.comparisons.length, 1);
  assert.ok(result.nextQuestions.length);
  assert.match(await readFile(join(out, 'WORKFLOWS.md'), 'utf8'), /Source evidence/);
});

test('live examples use bounded harness capture sequentially and never accept arbitrary capture overrides', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-live-examples-')); const calls = [];
  const capture = async options => {
    calls.push(options);
    await mkdir(join(options.outDir, 'network'), { recursive: true });
    await writeFile(join(options.outDir, 'network/evidence.json'), JSON.stringify(evidence('signin')));
    return { errors: [] };
  };
  const result = await runWorkflowExamples({ question: 'Route behavior?', terms: ['/signin'], outDir: join(root, 'out'), origins: ['https://example.test'],
    examples: [{ id: 'first', url: 'https://example.test/student', closeTab: false }, { id: 'second', url: 'https://example.test/student' }] }, { capture });
  assert.equal(result.status, 'complete');
  assert.equal(calls.length, 2);
  assert.ok(calls.every(c => c.closeTab && c.includeCoverage && c.includeScriptSources && !c.rea));
  await assert.rejects(runWorkflowExamples({ question: 'x', terms: ['x'], examples: [{ id: '../escape', url: 'https://example.test' }], outDir: join(root, 'invalid'), origins: ['https://example.test'] }));
  await assert.rejects(runWorkflowExamples({ question: 'x', terms: ['x'], examples: [{ id: 'bad', url: 'https://outside.test' }], outDir: join(root, 'invalid2'), origins: ['https://example.test'] }));
});
