/** Offline oracle for the guided local order-read rehearsal. No I/O or model calls. */
export function evaluateOwnershipRead(input = {}) {
  const limitations = [
    'Trusted local collector/operator receipts; no authenticated external provenance or independent secret custody.',
    'Guided single-object read only; no autonomous discovery, class-wide repair, or general authorization assurance.',
    'Raw response digests are retained metadata; redacted bodies cannot independently verify raw bytes.',
  ];
  const evidenceIds = [];
  const result = (status, reason) => ({ status, reasons: [reason], evidenceIds, limitations });
  const fail = reason => result('inconclusive', reason);
  const { buildId, ownerIdentity, otherIdentity } = input;
  const nonempty = x => typeof x === 'string' && x.trim().length > 0;
  if (!nonempty(buildId) || !nonempty(ownerIdentity) || !nonempty(otherIdentity) || ownerIdentity === otherIdentity || [ownerIdentity, otherIdentity].includes('anonymous')) return fail('Distinct authenticated identity labels and buildId are required.');
  const names = ['ownerCreate', 'ownerRead', 'otherRead', 'otherMe', 'ownerMe', 'anonymousRead'];
  const bodies = {}, urls = {};
  const generation = input.ownerCreate?.generation;
  if (!nonempty(generation)) return fail('A nonempty collector generation is required.');
  let origin;
  for (const name of names) {
    const r = input[name];
    if (!r || !nonempty(r.id) || evidenceIds.includes(r.id)) return fail(`Missing or duplicate receipt: ${name}.`);
    evidenceIds.push(r.id);
    if (r.complete !== true || r.error != null || r.response?.bodyFieldsOmitted === true || r.response?.bodyRedacted === true || r.buildId !== buildId || r.generation !== generation) return fail(`Incomplete, errored, redaction-ambiguous, stale or mismatched receipt: ${name}.`);
    const expectedIdentity = name === 'anonymousRead' ? 'anonymous' : name.startsWith('other') ? otherIdentity : ownerIdentity;
    if (r.identity !== expectedIdentity) return fail(`Wrong identity label: ${name}.`);
    if (!Number.isInteger(r.response?.status) || !/^[a-f0-9]{64}$/i.test(r.response?.bodySha256 ?? '') || typeof r.response?.body !== 'string') return fail(`Missing response or raw digest: ${name}.`);
    try {
      const u = new URL(r.request?.url);
      if (u.protocol !== 'http:' || u.hostname !== '127.0.0.1' || u.username || u.password || u.search || u.hash || (origin && u.origin !== origin)) return fail(`Invalid or mismatched origin/path: ${name}.`);
      origin = u.origin;
      urls[name] = u.pathname;
      bodies[name] = JSON.parse(r.response.body);
      if (!bodies[name] || typeof bodies[name] !== 'object' || Array.isArray(bodies[name])) return fail(`Expected JSON object response: ${name}.`);
    } catch { return fail(`Invalid URL or JSON response: ${name}.`); }
    if (r.request.method !== (name === 'ownerCreate' ? 'POST' : 'GET')) return fail(`Wrong method: ${name}.`);
  }
  const status = name => input[name].response.status;
  if (urls.ownerMe !== '/api/me' || urls.otherMe !== '/api/me' || status('ownerMe') !== 200 || status('otherMe') !== 200) return fail('Authenticated principal controls are unavailable.');
  const owner = bodies.ownerMe.user?.id, other = bodies.otherMe.user?.id;
  if (!nonempty(owner) || !nonempty(other) || owner === other) return fail('Principal controls must establish distinct actual user IDs.');
  const order = bodies.ownerCreate.order;
  if (urls.ownerCreate !== '/api/orders' || status('ownerCreate') !== 201 || !order || !nonempty(order.id) || order.ownerId !== owner || !nonempty(order.description)) return fail('Owned-object creation control is invalid.');
  const sameOrder = candidate => candidate && typeof candidate === 'object' && !Array.isArray(candidate) && Object.keys(candidate).sort().join(',') === Object.keys(order).sort().join(',') && Object.keys(order).every(key => typeof order[key] !== 'object' && candidate[key] === order[key]);
  const path = `/api/orders/${encodeURIComponent(order.id)}`;
  for (const name of ['ownerRead', 'otherRead', 'anonymousRead']) if (urls[name] !== path) return fail(`Wrong object path: ${name}.`);
  if (status('ownerRead') !== 200 || !sameOrder(bodies.ownerRead.order)) return fail('Normal owner read must return the exact created object.');
  // Denial is accepted only for a small structured error, without object or quoted payload.
  const denial = name => {
    const b = bodies[name];
    return [401, 403].includes(status(name)) && Object.keys(b).length === 1 && typeof b.error === 'string' && b.error.length > 0 && !b.error.includes(order.description) && !b.error.includes(order.id);
  };
  if (!denial('anonymousRead')) return fail('Anonymous denial control failed or contains possible protected payload.');
  if (sameOrder(bodies.otherRead.order)) return result('demonstrated', 'Distinct authenticated principal received the exact foreign owned object; HTTP status does not override payload evidence.');
  if (denial('otherRead')) return result('not-demonstrated', 'Foreign read denied without protected payload; normal owner and anonymous controls passed.');
  return fail('Foreign response is neither the exact protected object nor an unambiguous denial.');
}
