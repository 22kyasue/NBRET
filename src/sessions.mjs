import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const cookieAllowed = (cookie, origins) => {
  const domain = cookie.domain?.replace(/^\./, '').toLowerCase();
  return !!domain && origins.some(o => { const host = new URL(o).hostname.toLowerCase(); return host === domain || host.endsWith('.' + domain); });
};

export function validateSession(state, origins) {
  if (!state || !Array.isArray(state.cookies) || !Array.isArray(state.origins) || state.cookies.length > 1000 || state.origins.length > 50) throw new Error('Invalid or oversized session state');
  for (const cookie of state.cookies) if (!cookieAllowed(cookie, origins) || typeof cookie.name !== 'string' || typeof cookie.value !== 'string') throw new Error('Session cookie outside explicit origins or malformed');
  for (const entry of state.origins) {
    if (!origins.includes(entry.origin) || !Array.isArray(entry.localStorage) || entry.localStorage.length > 2000) throw new Error('Session origin outside scope or unsupported storage');
    if (entry.sessionStorage !== undefined && (!Array.isArray(entry.sessionStorage) || entry.sessionStorage.length > 2000)) throw new Error('Invalid session storage');
    for (const key of ['localStorage', 'sessionStorage']) for (const item of entry[key] || []) if (typeof item.name !== 'string' || typeof item.value !== 'string') throw new Error(`Invalid ${key} item`);
    if (entry.indexedDB !== undefined && (!Array.isArray(entry.indexedDB) || entry.indexedDB.length > 50 || entry.indexedDB.some(db => typeof db?.name !== 'string' || !Array.isArray(db.stores)))) throw new Error('Invalid IndexedDB snapshot');
  }
  return { cookies: state.cookies, origins: state.origins.map(({ origin, localStorage, sessionStorage, indexedDB }) => ({ origin, localStorage, ...(sessionStorage?.length ? { sessionStorage } : {}), ...(indexedDB?.length ? { indexedDB } : {}) })) };
}

export async function readSession(file, origins) {
  const path = resolve(file);
  if ((await stat(path)).size > 5 * 1024 * 1024) throw new Error('Session state exceeds 5 MiB');
  const raw = await readFile(path, 'utf8');
  return { state: validateSession(JSON.parse(raw), origins), sha256: createHash('sha256').update(raw).digest('hex') };
}

export async function applySession(context, state) {
  await context.setStorageState({ cookies: state.cookies, origins: state.origins.map(({ sessionStorage, ...entry }) => entry) });
  const tabs = Object.fromEntries(state.origins.filter(o => o.sessionStorage?.length).map(o => [o.origin, o.sessionStorage]));
  // sessionStorage is per tab: seed each in-scope document while its tab storage is still empty.
  if (Object.keys(tabs).length) await context.addInitScript(tabs => {
    const items = tabs[location.origin];
    if (items && sessionStorage.length === 0) for (const { name, value } of items) sessionStorage.setItem(name, value);
  }, tabs);
}

async function readSessionStorage(context, origins) {
  const byOrigin = new Map();
  for (const page of context.pages()) for (const frame of page.frames()) {
    let origin; try { origin = new URL(frame.url()).origin; } catch { continue; }
    if (!origins.includes(origin) || byOrigin.has(origin)) continue;
    try { byOrigin.set(origin, await frame.evaluate(() => Object.keys(sessionStorage).map(name => ({ name, value: sessionStorage.getItem(name) })))); } catch {}
  }
  return byOrigin;
}

export async function saveSession(context, file, origins) {
  const state = await context.storageState({ indexedDB: true }), tabs = await readSessionStorage(context, origins);
  const scopedOrigins = new Map(state.origins.filter(o => origins.includes(o.origin)).map(o => [o.origin, { origin: o.origin, localStorage: o.localStorage || [], ...(o.indexedDB?.length ? { indexedDB: o.indexedDB } : {}) }]));
  for (const [origin, items] of tabs) if (items.length) (scopedOrigins.get(origin) || scopedOrigins.set(origin, { origin, localStorage: [] }).get(origin)).sessionStorage = items;
  const scoped = { cookies: state.cookies.filter(c => cookieAllowed(c, origins)), origins: [...scopedOrigins.values()] };
  const raw = JSON.stringify(scoped, null, 2), path = resolve(file);
  if (Buffer.byteLength(raw) > 5 * 1024 * 1024) throw new Error('Session export exceeds 5 MiB');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, raw, { flag: 'wx' });
  const count = key => scoped.origins.reduce((n, o) => n + (o[key]?.length || 0), 0);
  return { cookies: scoped.cookies.length, origins: scoped.origins.length, sessionStorageItems: count('sessionStorage'), indexedDBDatabases: count('indexedDB'), sha256: createHash('sha256').update(raw).digest('hex'),
    limitations: ['Raw cookies, localStorage, sessionStorage and IndexedDB records are sensitive local artifacts; not redacted.', 'sessionStorage is read from open tabs (first frame per origin) and reseeded into each new tab whose storage is empty. IndexedDB values Playwright cannot serialize are not preserved. Scope is domain/origin-filtered, not a universal data scrub.'] };
}
