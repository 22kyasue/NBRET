import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { indexWorkflowSource, runUnderstand } from '../src/understand.mjs';

test('indexes decisions, navigation, storage keys and imported symbols without executing source', () => {
  const u = indexWorkflowSource(`import { authorize } from './auth';
    const tokenKey = 'accessToken';
    export function student(user) {
      if (!user.isAuthenticated) navigate('/signin');
      return localStorage.getItem(tokenKey);
    }
    throw new Error('must never execute');`, { id: 'a', label: 'route.js' });
  assert.equal(u.parseStatus, 'parsed');
  assert.equal(u.decisions[0].condition, '!user.isAuthenticated');
  assert.equal(u.navigation[0].arguments[0], '/signin');
  assert.equal(u.storage[0].key, 'tokenKey');
  assert.equal(u.constants[0].value, 'accessToken');
  assert.equal(u.imports[0].symbols[0].imported, 'authorize');
});

test('recovers original sources, preserves provenance, labels ambiguous symbols and confines source filenames', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-workflow-'));
  await writeFile(join(root, 'app.js.map'), JSON.stringify({ version: 3,
    sources: ['../../../../escape.js', 'auth.js', 'other-auth.js'],
    sourcesContent: ["import { check } from './auth'; export const route = () => check('/student');",
      "export function check() { if (!user.isAuthenticated) navigate('/signin'); }",
      "export function check() { return false; }"], names: [], mappings: '' }));
  const outDir = join(root, 'result');
  const result = await runUnderstand({ question: 'Why does student return to sign-in?', terms: ['/student'], sourceDir: root, outDir });
  assert.equal(result.units.length, 3);
  assert.equal(result.links[0].status, 'ambiguous');
  assert.equal(result.units[0].provenance.sourceIndex, 0);
  assert.match(result.units[0].file, /^sources\/source-\d+\.txt$/);
  assert.ok(result.units[1].decisions.length);
  assert.match(await readFile(join(outDir, 'WORKFLOW.md'), 'utf8'), /No network evidence supplied/);
  await assert.rejects(runUnderstand({ question: 'repeat', terms: ['student'], sourceDir: root, outDir }));
});

test('fresh acquisition follows only declared maps, rejects cross-origin fetches and separates runtime evidence', async () => {
  let escaped = false;
  const outside = createServer((req, res) => { escaped = true; res.end('bad'); });
  await new Promise(r => outside.listen(0, '127.0.0.1', r));
  const external = `http://127.0.0.1:${outside.address().port}`;
  const server = createServer((req, res) => {
    if (req.url === '/') return res.end(`<script src="/app.js"></script><script src="${external}/bad.js"></script>`);
    if (req.url === '/app.js') return res.end("navigate('/signin');\n//# sourceMappingURL=old.map\n//# sourceMappingURL=app.js.map");
    if (req.url === '/app.js.map') return res.end(JSON.stringify({ version: 3, sources: ['routes.js'], sourcesContent: ["export function check(user) { if (user.isAnonymous) navigate('/signin'); }"], mappings: '' }));
    res.statusCode = 404; res.end();
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  try {
    const root = await mkdtemp(join(tmpdir(), 'nbret-live-workflow-'));
    const result = await runUnderstand({ question: 'What changes the route?', terms: ['/signin'], url: `http://127.0.0.1:${server.address().port}/`, outDir: join(root, 'out') });
    assert.equal(escaped, false);
    assert.equal(result.units[0].label, 'routes.js');
    assert.equal(result.units[0].provenance.kind, 'published-source-map');
    assert.equal(result.acquisition.length, 3);
    assert.equal(result.observations.length, 0);
    assert.ok(result.gaps.includes('SCRIPT_UNAVAILABLE_OR_OUT_OF_SCOPE_OR_BUDGET'));
    assert.ok(result.limitations.some(s => s.includes('cached live tab')));
  } finally {
    server.closeAllConnections(); outside.closeAllConnections();
    await Promise.all([new Promise(r => server.close(r)), new Promise(r => outside.close(r))]);
  }
});
