import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createServer } from 'node:http';
import { startAppFixture, appScenarios } from './app-fixture.mjs';
import { runCapture } from '../src/run.mjs';
import { validateSession } from '../src/sessions.mjs';

test('session scope rejects unrelated origins and unsupported storage', () => {
  assert.throws(() => validateSession({ cookies: [{ domain: '.other.test', name: 'auth', value: 'x' }], origins: [] }, ['https://app.test']));
  assert.throws(() => validateSession({ cookies: [], origins: [{ origin: 'https://app.test', localStorage: [], indexedDB: [{}] }] }, ['https://app.test']));
  assert.throws(() => validateSession({ cookies: [], origins: [{ origin: 'https://app.test', localStorage: [], sessionStorage: [{ name: 1 }] }] }, ['https://app.test']));
  assert.deepEqual(validateSession({ cookies: [], origins: [{ origin: 'https://app.test', localStorage: [], sessionStorage: [{ name: 'a', value: 'b' }], indexedDB: [{ name: 'db', stores: [] }] }] }, ['https://app.test']).origins[0].indexedDB, [{ name: 'db', stores: [] }]);
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

test('session export carries sessionStorage and IndexedDB into a fresh profile', { timeout: 30000 }, async () => {
  const server = createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.end(`<button id="save">Save</button><output id="tab"></output><output id="idb"></output><script>
      const open=()=>new Promise(r=>{const o=indexedDB.open('auth',1);o.onupgradeneeded=()=>o.result.createObjectStore('kv');o.onsuccess=()=>r(o.result)});
      document.querySelector('#save').onclick=async()=>{sessionStorage.setItem('tab','s-42');const db=await open();db.transaction('kv','readwrite').objectStore('kv').put({token:'t-7'},'auth')};
      (async()=>{document.querySelector('#tab').textContent=sessionStorage.getItem('tab')||'none';const db=await open();const g=db.transaction('kv').objectStore('kv').get('auth');g.onsuccess=()=>document.querySelector('#idb').textContent=g.result?.token||'none'})();
    </script>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  await mkdir('runs', { recursive: true });
  const root = resolve(`runs/session-storage-${Date.now()}`); await mkdir(root);
  const session = join(root, 'session.json');
  try {
    const first = await runCapture({ url, outDir: join(root, 'save'), rea: false, copy: false, actions: [{ type: 'click', selector: '#save' }, { type: 'wait', ms: 200 }], sessionOut: session, retainProfile: false });
    assert.equal(first.errors.length, 0, JSON.stringify(first.errors));
    assert.equal(first.sessionExport.sessionStorageItems, 1); assert.equal(first.sessionExport.indexedDBDatabases, 1);
    const second = await runCapture({ url, outDir: join(root, 'reused'), rea: false, copy: false, sessionIn: session, expectations: [{ selector: '#tab', text: 's-42' }, { selector: '#idb', text: 't-7' }], retainProfile: false });
    assert.deepEqual(second.assertions.map(a => a.passed), [true, true], JSON.stringify(second.assertions));
    const fresh = await runCapture({ url, outDir: join(root, 'fresh'), rea: false, copy: false, expectations: [{ selector: '#tab', text: 'none' }, { selector: '#idb', text: 'none' }], retainProfile: false });
    assert.deepEqual(fresh.assertions.map(a => a.passed), [true, true]);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
