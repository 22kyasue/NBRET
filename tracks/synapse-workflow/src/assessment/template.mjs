export function engagementTemplate(origin = 'http://127.0.0.1:3000') {
  return {
    schemaVersion: 1, kind: 'nbret-engagement', id: 'example-application-review', client: 'Example client',
    environment: { id: 'staging', revision: 'build-before-repair' }, policyRevision: 'order-ownership-v1', origins: [origin],
    authorization: { status: 'draft', reference: 'REPLACE_WITH_APPROVED_SCOPE_REFERENCE', approvedBy: 'REPLACE_WITH_SCOPE_OWNER',
      startsAt: '2026-01-01T00:00:00.000Z', expiresAt: '2026-01-02T00:00:00.000Z', caseIds: ['owner-access', 'foreign-order'], allowWrites: false },
    actors: [
      { id: 'alice', principal: 'fixture-alice', tenant: 'tenant-a', role: 'customer', sessionEpoch: 'session-1', headersEnv: { authorization: 'NBRET_ALICE_AUTH' } },
      { id: 'bob', principal: 'fixture-bob', tenant: 'tenant-b', role: 'customer', sessionEpoch: 'session-1', headersEnv: { authorization: 'NBRET_BOB_AUTH' } },
    ],
    budgets: { timeoutMs: 3000, maxMs: 30000, delayMs: 100, maxBytes: 1048576, maxTotalBytes: 4194304 },
    cases: [
      { id: 'owner-access', actor: 'bob', purpose: 'control', effect: 'read', method: 'GET', url: `${origin}/api/orders/2`,
        claim: 'The legitimate owner can read their order', preconditions: 'Order 2 is a synthetic order belonging to Bob', controls: [],
        expect: { status: 200, json: [{ path: '/order/owner', equals: 'bob' }] } },
      { id: 'foreign-order', actor: 'alice', purpose: 'security', effect: 'read', method: 'GET', url: `${origin}/api/orders/2`,
        claim: 'A customer must not receive another tenant\'s private order', preconditions: 'Alice and Bob are distinct customer tenants; order 2 belongs to Bob', controls: ['owner-access'],
        expect: { status: [403, 404], json: [{ path: '/order', exists: false }] } },
    ],
    exclusions: ['Only the two explicit cases are covered.', 'Real authentication/session establishment, other endpoints and concurrency are untested.',
      'No third-party systems, destructive actions, purchases or production changes are authorized by this template.'],
  };
}
