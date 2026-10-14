import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { startAppFixture, appScenarios } from './app-fixture.mjs';
import { runCapture } from '../src/run.mjs';
import { validateSession } from '../src/sessions.mjs';

test('session scope rejects unrelated origins and unsupported storage', () => {
  assert.throws(() => validateSession({ cookies: [{ domain: '.other.test', name: 'auth', value: 'x' }], origins: [] }, ['https://app.test']));
  assert.throws(() => validateSession({ cookies: [], origins: [{ origin: 'https://app.test', localStorage: [], indexedDB: [{}] }] }, ['https://app.test']));
});

test('owned session export/import reuses login in fresh profiles and omission resets it', { timeout: 30000 }, async () => {
  const fixture = await startAppFixture();
  await mkdir('runs', { recursive: true });
  const root = resolve(`runs/session-${Date.now()}`); await mkdir(root);
  const session = join(root, 'session.json');
  try {
    const login = appScenarios(fixture.url).scenarios.find(s => s.id === 'login');
    const first = await runCapture({ url: fixture.url, outDir: join(root, 'login'), rea: false, copy: false, actions: login.actions, expectations: login.expectations, sessionOut: session, retainProfile: false });
    assert.equal(first.errors.length, 0); assert.equal(first.sessionExport.cookies, 1);
    const second = await runCapture({ url: fixture.url, outDir: join(root, 'reused'), rea: false, copy: true, copyMode: 'same-state', sessionIn: session, expectations: [{ selector: '#user', text: 'Welcome demo' }], retainProfile: false });
    assert.equal(second.errors.length, 0, JSON.stringify(second.errors));
    assert.equal(second.identity.state, 'isolated-profile-with-imported-session');
    assert.match(await readFile(join(root, 'reused/copy/body.html'), 'utf8'), /Welcome demo/);
    const fresh = await runCapture({ url: fixture.url, outDir: join(root, 'reset'), rea: false, copy: false, actions: [{ type: 'click', selector: '#load' }], expectations: [{ selector: '#error', text: 'Sign in' }], retainProfile: false });
    assert.equal(fresh.assertions[0].passed, true);
    await assert.rejects(runCapture({ url: fixture.url, outDir: join(root, 'invalid'), sessionIn: session, sessionOut: session }), /must not overwrite/);
  } finally { await fixture.close(); }
});
