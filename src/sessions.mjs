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
    if (!origins.includes(entry.origin) || !Array.isArray(entry.localStorage) || entry.localStorage.length > 2000 || entry.indexedDB?.length) throw new Error('Session origin outside scope or unsupported storage');
    for (const item of entry.localStorage) if (typeof item.name !== 'string' || typeof item.value !== 'string') throw new Error('Invalid local storage item');
  }
  return { cookies: state.cookies, origins: state.origins.map(({ origin, localStorage }) => ({ origin, localStorage })) };
}

export async function readSession(file, origins) {
  const path = resolve(file);
  if ((await stat(path)).size > 5 * 1024 * 1024) throw new Error('Session state exceeds 5 MiB');
  const raw = await readFile(path, 'utf8');
  return { state: validateSession(JSON.parse(raw), origins), sha256: createHash('sha256').update(raw).digest('hex') };
}

export async function applySession(context, state) {
  await context.setStorageState(state);
}

export async function saveSession(context, file, origins) {
  const state = await context.storageState();
  const scoped = { cookies: state.cookies.filter(c => cookieAllowed(c, origins)), origins: state.origins.filter(o => origins.includes(o.origin)) };
  const raw = JSON.stringify(scoped, null, 2), path = resolve(file);
  if (Buffer.byteLength(raw) > 5 * 1024 * 1024) throw new Error('Session export exceeds 5 MiB');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, raw, { flag: 'wx' });
  return { cookies: scoped.cookies.length, origins: scoped.origins.length, sha256: createHash('sha256').update(raw).digest('hex'),
    limitations: ['Raw cookies/localStorage are sensitive local artifacts; not redacted.', 'SessionStorage and IndexedDB are not exported. Scope is domain/origin-filtered, not a universal data scrub.'] };
}
