import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { indexWorkflowSource } from '../src/understand.mjs';
import { buildAccessCatalog, runDiscover } from '../src/discover.mjs';
import { runAnalysis } from '../src/analyze.mjs';

const origin = 'https://example.test';
const units = () => [
  indexWorkflowSource(`export const urlStudent = () => '/student/';`, { id: 'urls', label: 'urls.js', file: 'urls.txt' }),
  indexWorkflowSource(`const AuthorizedStudentHome = authorizeOrRedirect([PERM_REDIRECT_STUDENT])(StudentHome);
    export default [<Route path={urlStudent()} element={<AuthorizedStudentHome />} />,
      <Route path='/product/:id' element={<Product />} />,
      <Route path='settings' element={<Settings />} />];`, { id: 'routes', label: 'routes.jsx', file: 'routes.txt' }),
];

test('discovers an unknown route through getter and exact same-file permission wrapper', () => {
  const result = buildAccessCatalog({ seedUrl: origin, sources: units() });
  const student = result.candidates.find(c => c.path === '/student/');
  assert.ok(student);
  assert.equal(student.gates[0].operation, 'authorizeOrRedirect');
  assert.match(student.gates[0].expression, /PERM_REDIRECT_STUDENT/);
  assert.equal(student.access.backendAuthorization, 'not established');
  assert.equal(student.evidence[0].getterEvidence[0].source, 'urls.js');
  assert.equal(result.candidates.find(c => c.path === '/product/:id').visitPolicy.eligible, false);
  assert.ok(result.unresolved.some(r => r.expression === "'settings'"));
});

test('link inventory preserves metadata and unknown gates, refuses risky/external/query navigation', () => {
  const r = buildAccessCatalog({ seedUrl: origin, snapshots: [{ url: origin + '/home', label: 'final', links: [
    { href: '/help', label: 'Help', title: 'Documentation', rendered: true, target: '_blank', rel: 'noopener' },
    { href: '/home#maincontent', label: 'Skip to main content', fragmentTargetExists: true },
    { href: '/library#catalog', label: 'Components', fragmentTargetExists: false },
    { href: '/sign-out', label: 'Sign out' }, { href: 'https://outside.test/help' }, { href: '/activate?token=private' },
  ] }] });
  const help = r.candidates.find(c => c.path === '/help');
  assert.equal(help.links[0].target, '_blank');
  assert.equal(help.links[0].label, 'Help');
  assert.equal(help.access.gateStatus, 'unknown');
  assert.ok(r.candidates.filter(c => !['/', '/help', '/library'].includes(c.path)).every(c => !c.visitPolicy.eligible));
  assert.ok(r.candidates.find(c => c.path === '/library').visitPolicy.eligible);
  assert.ok(!JSON.stringify(r).includes('private'));
});

test('ambiguous path getters remain unresolved instead of guessing', () => {
  const extra = indexWorkflowSource(`export const urlStudent = () => '/different/';`, { id: 'extra', label: 'extra.js' });
  const r = buildAccessCatalog({ seedUrl: origin, sources: [...units(), extra] });
  assert.ok(!r.candidates.some(c => c.path === '/student/'));
  assert.ok(r.unresolved.some(r => r.expression === 'urlStudent()'));
});

test('bounded discovery feeds observed new links into later workflow examples and emits catalog', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-discovery-')); const calls = [];
  const understand = async () => ({ discoverySources: units(), status: 'indexed', gaps: [] });
  const workflows = async options => {
    calls.push(options);
    return { examples: options.examples.map(e => ({ id: e.id, status: 'observed', evidenceFile: e.id + '/evidence-summary.json', workflowFile: e.id + '/WORKFLOW.md', evidence: {
      finalUrl: e.url, snapshots: [{ label: 'final', url: e.url, links: [{ href: origin + '/help', label: 'Help', rendered: true }] }],
    } })) };
  };
  const r = await runDiscover({ seedUrl: origin, outDir: join(root, 'out'), sourceDir: root, acquireSources: false, explore: true, maxVisits: 2 }, { understand, workflows });
  assert.equal(calls[0].examples[0].url, origin + '/');
  assert.equal(calls[1].examples[0].url, origin + '/help');
  assert.equal(r.visits.length, 2);
  assert.ok(r.candidates.some(c => c.path === '/student/'));
  assert.match(await readFile(join(root, 'out', 'ACCESS.md'), 'utf8'), /PERM_REDIRECT_STUDENT/);
  await runAnalysis({ runDir: join(root, 'out'), outDir: join(root, 'report'), deep: false });
  assert.match(await readFile(join(root, 'report', 'REPORT.html'), 'utf8'), /Discovered links, routes and access/);
  assert.match(await readFile(join(root, 'report', 'ANALYSIS.md'), 'utf8'), /PERM_REDIRECT_STUDENT/);
});
