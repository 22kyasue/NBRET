import { validateEngagement } from './core.mjs';

/** Expand a client-approved access policy into explicit owner/foreign-role cases. */
export function compileAccessMatrix(engagement, matrix) {
  const e = structuredClone(engagement);
  if (matrix?.schemaVersion !== 1 || !Array.isArray(matrix.resources) || !matrix.resources.length) throw new Error('Access matrix resources required');
  const resources = new Set();
  e.cases = [];
  for (const r of matrix.resources) {
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(r.id) || resources.has(r.id)) throw new Error('Unique bounded resource IDs required');
    resources.add(r.id);
    if (!Array.isArray(r.allowedActors) || !r.allowedActors.length || r.allowedActors.some(id => !e.actors.some(a => a.id === id))) throw new Error('Explicit allowed actors required');
    if (!r.identity || typeof r.identity.path !== 'string' || !Object.hasOwn(r.identity, 'equals') || typeof r.privateObjectPath !== 'string') throw new Error('Resource identity and private-object oracle required');
    const controls = r.allowedActors.map(id => `${r.id}-${id}`);
    for (const actor of e.actors) {
      const allowed = r.allowedActors.includes(actor.id);
      e.cases.push({ id: `${r.id}-${actor.id}`, actor: actor.id, purpose: allowed ? 'control' : 'security', effect: 'read', method: 'GET', url: r.url,
        claim: allowed ? `Permitted actor ${actor.id} can read ${r.id}` : `Actor ${actor.id} must not receive private object ${r.id}`,
        preconditions: r.preconditions, controls: allowed ? [] : controls,
        expect: allowed ? { status: 200, json: [{ path: r.identity.path, equals: r.identity.equals }] }
          : { status: r.deniedStatuses || [403, 404], json: [{ path: r.privateObjectPath, exists: false }] } });
    }
  }
  e.authorization = { ...e.authorization, status: 'draft', caseIds: e.cases.map(c => c.id) };
  return validateEngagement(e);
}
