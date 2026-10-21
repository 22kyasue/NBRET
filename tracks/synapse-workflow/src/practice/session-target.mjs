import http from 'node:http';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { startPracticeApp } from './app.mjs';

const MAX_BYTES = 65536, MAX_REQUESTS = 60, MAX_MS = 90000, REQUEST_MS = 2000, SESSION_MS = 30 * 60000;
const ACTORS = Object.freeze({
  anonymous: { principal: 'anonymous', tenant: null, role: 'anonymous' },
  alice: { principal: 'alice', tenant: 'north', role: 'member' },
  bob: { principal: 'bob', tenant: 'south', role: 'member' },
  carol: { principal: 'carol', tenant: 'north', role: 'approver' },
  dana: { principal: 'dana', tenant: 'south', role: 'approver' },
});
const clone = value => JSON.parse(JSON.stringify(value));
const sha = value => createHash('sha256').update(value).digest('hex');
function failure(code, reached = false) {
  const error = new Error(`Practice target ${code.toLowerCase().replaceAll('_', ' ')}; observation incomplete.`);
  Object.assign(error, { code: `NBRET_PRACTICE_${code}`, complete: false, actionReached: reached, setupReceipts: [] });
  return error;
}
function actionRecord(value) {
  if (!value || typeof value !== 'object' || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw failure('ACTION_REJECTED');
  const keys = Reflect.ownKeys(value), copy = {};
  if (keys.length > 4) throw failure('ACTION_REJECTED');
  for (const key of keys) {
    if (!['kind', 'actor', 'objectId', 'transition'].includes(key)) throw failure('ACTION_REJECTED');
    const d = Object.getOwnPropertyDescriptor(value, key);
    if (!d.enumerable || !Object.hasOwn(d, 'value') || typeof d.value !== 'string' || d.value.length > 64) throw failure('ACTION_REJECTED');
    copy[key] = d.value;
  }
  if (!['page', 'profile', 'orders', 'order', 'transition'].includes(copy.kind) || !Object.hasOwn(ACTORS, copy.actor)) throw failure('ACTION_REJECTED');
  const object = ['order', 'transition'].includes(copy.kind);
  if (Object.hasOwn(copy, 'objectId') !== object || Object.hasOwn(copy, 'transition') !== (copy.kind === 'transition')) throw failure('ACTION_REJECTED');
  if (object && !/^WO-[NS][0-9]{3}$/.test(copy.objectId)) throw failure('ACTION_REJECTED');
  if (copy.kind === 'transition' && !['submit', 'approve'].includes(copy.transition)) throw failure('ACTION_REJECTED');
  if (copy.kind === 'page' && copy.actor !== 'anonymous') throw failure('ACTION_REJECTED');
  return copy;
}
function htmlProjection(html) {
  const clean = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  const text = value => value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim().slice(0, 12000);
  return { title: text(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(clean)?.[1] || ''),
    headings: [...clean.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)].slice(0, 32).map(m => text(m[1])),
    text: text(clean), links: [] };
}

function exactData(value, keys) {
  if (!value || typeof value !== 'object' || ![Object.prototype, null].includes(Object.getPrototypeOf(value)) || Reflect.ownKeys(value).length !== keys.length) throw failure('CONFIGURATION_REJECTED');
  const copy = {};
  for (const key of Reflect.ownKeys(value)) {
    const d = Object.getOwnPropertyDescriptor(value, key);
    if (!keys.includes(key) || !d.enumerable || !Object.hasOwn(d, 'value')) throw failure('CONFIGURATION_REJECTED');
    copy[key] = d.value;
  }
  return copy;
}
export async function createPracticeTarget(options) {
  if (arguments.length > 1) throw failure('CONFIGURATION_REJECTED');
  const checkpoint = arguments.length ? exactData(exactData(options, ['checkpoint']).checkpoint, ['schemaVersion', 'kind', 'sourceHash', 'orders']) : null;
  const sourceHash = sha(await readFile(new URL('./app.mjs', import.meta.url)));
  if (checkpoint && (checkpoint.schemaVersion !== 1 || checkpoint.kind !== 'synapse-owned-checkpoint' || checkpoint.sourceHash !== sourceHash)) throw failure('CONFIGURATION_REJECTED');
  let app;
  try { app = await startPracticeApp({ port: 0, ...(checkpoint ? { initialOrders: checkpoint.orders } : {}) }); }
  catch (error) { if (checkpoint) throw failure('CONFIGURATION_REJECTED'); throw error; }
  const started = performance.now(), discovered = new Set(), credentials = new Map(), active = new Set();
  let requestCount = 0, executionMs = 0, closed = false, closing, chain = Promise.resolve();
  for (const actor of ['alice', 'bob']) credentials.set(actor, { headers: { authorization: `Bearer ${app.tokens[actor]}` }, verified: false });
  const admit = (reserve = 1) => {
    if (closed) throw failure('CLOSED');
    if (performance.now() - started >= SESSION_MS) throw failure('SESSION_EXPIRED');
    if (executionMs >= MAX_MS) throw failure('GLOBAL_DEADLINE');
    if (requestCount + reserve > MAX_REQUESTS) throw failure('REQUEST_LIMIT');
  };
  async function send(method, path, actor, headers = {}, payload, secretResponse = false, mainAction = false) {
    admit(); requestCount++;
    const before = app.requestLog.length, start = performance.now();
    const requestBudget = Math.max(1, Math.min(REQUEST_MS, MAX_MS - executionMs, SESSION_MS - (start - started)));
    const raw = await new Promise((resolve, reject) => {
      let req, res, timer, settled = false, size = 0; const chunks = [];
      const fail = code => { if (settled) return; settled = true; executionMs += Math.max(0, performance.now() - start); clearTimeout(timer); active.delete(req); res?.destroy(); req?.destroy(); reject(failure(code, mainAction && app.requestLog.length > before)); };
      try {
        req = http.request(new URL(path, app.url), { method, headers: { ...headers, ...(payload === undefined ? {} : { origin: app.url, 'content-type': 'application/json' }) }, agent: false }, response => {
          res = response;
          if (res.statusCode >= 300 && res.statusCode < 400) return fail('REDIRECT_REJECTED');
          res.on('data', chunk => { size += chunk.length; if (size > MAX_BYTES) return fail('RESPONSE_LIMIT'); chunks.push(chunk); });
          res.on('aborted', () => fail('RESPONSE_ABORTED')); res.on('error', () => fail('RESPONSE_ERROR'));
          res.on('end', () => {
            if (settled) return;
            if (performance.now() - start >= requestBudget) return fail('REQUEST_DEADLINE');
            if (!res.complete) return fail('RESPONSE_INCOMPLETE');
            const bytes = Buffer.concat(chunks), rawText = bytes.toString('utf8');
            if (!Buffer.from(rawText, 'utf8').equals(bytes)) return fail('INVALID_UTF8');
            const type = res.headers['content-type']?.split(';')[0]; let value, representation;
            if (type === 'application/json') { try { value = JSON.parse(rawText); } catch { return fail('INVALID_JSON'); } representation = 'json'; }
            else if (type === 'text/html' && path === '/') { value = htmlProjection(rawText); representation = 'html-summary'; }
            else return fail('UNSUPPORTED_REPRESENTATION');
            if (secretResponse) { value = { csrfAvailable: typeof value?.csrf === 'string' }; representation = 'json-redacted'; }
            const receipt = app.requestLog[before];
            if (!receipt || receipt.method !== method || receipt.path !== path || receipt.actorId !== (actor === 'anonymous' ? null : actor)) return fail('IDENTITY_RECEIPT_MISMATCH');
            settled = true; executionMs += Math.max(0, performance.now() - start); clearTimeout(timer); active.delete(req);
            resolve({ observation: { request: { method, path, actor }, identity: clone(ACTORS[actor]), response: { status: res.statusCode, value, bodySha256: sha(bytes), bodyBytes: bytes.length, representation,...(representation==='json'?{bodyText:rawText}:{}) }, transport: { complete: true, elapsedMs: performance.now() - start } }, headers: res.headers, rawText: secretResponse ? rawText : null });
          });
        });
        active.add(req);
        timer = setTimeout(() => fail(closed ? 'CLOSED' : 'REQUEST_DEADLINE'), requestBudget);
        req.on('error', () => fail(closed ? 'CLOSED' : 'CONNECTION_ERROR'));
        req.end(payload === undefined ? undefined : JSON.stringify(payload));
      } catch { fail('CONNECTION_ERROR'); }
    });
    return raw;
  }
  async function ensureActor(actor, receipts, currentKind) {
    if (actor === 'anonymous') return null;
    let credential = credentials.get(actor);
    if (!credential) {
      const csrf = await send('GET', '/api/csrf', 'anonymous', {}, undefined, true); receipts.push(csrf.observation);
      let token; try { token = JSON.parse(csrf.rawText).csrf; } catch { throw failure('SESSION_SETUP'); }
      const csrfCookie = csrf.headers['set-cookie']?.find(v => v.startsWith('practice_csrf='))?.split(';')[0];
      if (!/^[A-Za-z0-9_-]{43}$/.test(token || '') || !csrfCookie) throw failure('SESSION_SETUP');
      const login = await send('POST', '/api/session', 'anonymous', { cookie: csrfCookie, 'x-csrf-token': token }, { user: actor }); receipts.push(login.observation);
      const sessionCookie = login.headers['set-cookie']?.find(v => v.startsWith('practice_session='))?.split(';')[0];
      if (login.observation.response.status !== 200 || !sessionCookie) throw failure('SESSION_SETUP');
      credential = { headers: { cookie: csrfCookie + '; ' + sessionCookie, 'x-csrf-token': token }, verified: false };
      credentials.set(actor, credential);
    }
    if (!credential.verified) {
      const profile = await send('GET', '/api/me', actor, credential.headers, undefined, false, currentKind === 'profile'), value = profile.observation.response.value?.profile;
      if (profile.observation.response.status !== 200 || !value || value.id !== actor || value.principal !== actor || value.tenant !== ACTORS[actor].tenant || value.role !== ACTORS[actor].role) throw failure('PROFILE_MISMATCH', currentKind === 'profile');
      credential.verified = true;
      if (currentKind === 'profile') return profile.observation;
      receipts.push(profile.observation);
    }
    return null;
  }
  async function run(action) {
    const receipts = []; let actionReached = false;
    try {
      const object = ['order', 'transition'].includes(action.kind);
      if (object && !discovered.has(action.objectId)) throw failure('OBJECT_NOT_OBSERVED');
      const credential = credentials.get(action.actor);
      const setupRequests = action.actor === 'anonymous' || credential?.verified ? 0 : (credential ? 1 : 3);
      admit(setupRequests + (setupRequests && action.kind === 'profile' ? 0 : 1));
      const profile = await ensureActor(action.actor, receipts, action.kind);
      let observation = profile;
      if (!observation) {
        const method = action.kind === 'transition' ? 'POST' : 'GET';
        const path = action.kind === 'page' ? '/' : action.kind === 'profile' ? '/api/me' : action.kind === 'orders' ? '/api/work-orders' : `/api/work-orders/${action.objectId}${action.kind === 'transition' ? '/' + action.transition : ''}`;
        const sent = await send(method, path, action.actor, credentials.get(action.actor)?.headers, method === 'POST' ? {} : undefined, false, true);
        observation = sent.observation;
      }
      actionReached = true;
      if (observation.response.status === 200 && ['orders', 'order'].includes(action.kind)) {
        const records = action.kind === 'orders' ? observation.response.value?.orders : [observation.response.value?.order];
        if (!Array.isArray(records) || records.length > 100 || records.some(o => !o || typeof o.id !== 'string' || !/^WO-[NS][0-9]{3}$/.test(o.id))) throw failure('INVALID_OBJECT_RESPONSE', true);
        for (const record of records) discovered.add(record.id);
      }
      return { ...observation, setupReceipts: clone(receipts) };
    } catch (error) {
      const safe = error?.code?.startsWith('NBRET_PRACTICE_') ? error : failure('EXECUTION_ERROR', actionReached);
      safe.actionReached ||= actionReached; safe.setupReceipts = clone(receipts); throw safe;
    }
  }
  return {
    usage: () => ({ requestCount, executionMs }),
    exportCheckpoint: () => ({ schemaVersion: 1, kind: 'synapse-owned-checkpoint', sourceHash, orders: app.snapshotOrders() }),
    describe: () => ({ origin: app.url, actors: Object.entries(ACTORS).map(([id, identity]) => ({ id, tenant: identity.tenant, role: identity.role })), capabilities: ['page', 'profile', 'orders', 'order', 'transition:submit', 'transition:approve'], sourceHash }),
    execute(action) { let value; try { value = actionRecord(action); } catch (error) { return Promise.reject(error); } const pending = chain.then(() => run(value)); chain = pending.catch(() => {}); return pending; },
    get requestLog() { return clone(app.requestLog); },
    isListening: () => app.isListening(),
    close() { if (!closing) { closed = true; for (const req of active) req.destroy(); credentials.clear(); closing = app.close(); } return closing; },
  };
}
