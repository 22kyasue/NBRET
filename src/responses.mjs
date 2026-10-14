export function localResponses(url, responses = []) {
  if (!Array.isArray(responses) || responses.length > 20) throw new Error('At most 20 local response overrides are allowed');
  if (!responses.length) return [];
  const target = new URL(url);
  if (!['http:', 'https:'].includes(target.protocol) || !['127.0.0.1', '[::1]'].includes(target.hostname)) throw new Error('Response overrides require a literal loopback target');
  const keys = new Set();
  return responses.map(r => {
    if (!r || typeof r.path !== 'string' || !r.path.startsWith('/') || r.path.includes('?') || r.path.includes('#') || new URL(r.path, target.origin).pathname !== r.path) throw new Error('Override path must be an exact normalized pathname');
    const method = r.method || 'GET', status = r.status ?? 200, delayMs = r.delayMs ?? 0;
    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method) || !Number.isInteger(status) || status < 200 || status > 599 || [204, 205, 304].includes(status) || !Number.isInteger(delayMs) || delayMs < 0 || delayMs > 5000) throw new Error('Invalid override method, status or delay (0..5000 ms)');
    const key = `${method} ${r.path}`;
    if (keys.has(key)) throw new Error('Duplicate response override'); keys.add(key);
    const body = JSON.stringify(r.json);
    if (typeof body !== 'string' || Buffer.byteLength(body) > 1048576) throw new Error('Override JSON body required; maximum 1 MiB');
    return { path: r.path, method, status, delayMs, body, hits: 0 };
  });
}

export async function installLocalResponses(context, origin, responses) {
  if (!responses.length) return;
  await context.route(u => u.origin === origin && responses.some(r => r.path === u.pathname), async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    const r = responses.find(r => r.path === path && r.method === request.method());
    if (!r) { await route.continue(); return; }
    r.hits++;
    if (r.delayMs) await new Promise(resolve => setTimeout(resolve, r.delayMs));
    await route.fulfill({ status: r.status, contentType: 'application/json', body: r.body });
  });
}
