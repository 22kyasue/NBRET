# Signed-request identity lab: predefined oracle

This is an isolated custom protocol fixture, not an OAuth, Kubernetes or RFC9421 implementation or conformance test. Use Node built-ins only. Bind an ephemeral HTTP listener to127.0.0.1; call only that address with synthetic random credentials generated in memory. Do not log keys or raw bearer tokens. No proxy, interface/address changes, third-party traffic or persistent service.

Model separately: issuer token, principal kind/subject/tenant, assigned worker, token audience/actions/expiry, worker request-proof key, nonce and current worker authority. Token MAC and request MAC must be checked with timing-safe comparison. Signed request binds method, path, token digest, nonce and synthetic timestamp. Query/body are outside this tiny protocol, so only an exact bodyless GET endpoint exists; reject other routes/methods.

Before running, require these comparisons:

1. Valid tenant-a worker-a request reaches the effect once.
2. Replaying identical signed request returns409 and does not increment effects.
3. Invalid request MAC returns401 without consuming its nonce; a correctly signed fresh attempt using that nonce succeeds.
4. Modified token payload with unchanged MAC returns401.
5. Unknown worker returns401.
6. Worker-a token presented with worker-b proof returns403.
7. Token tenant-b plus worker-a proof returns403.
8. User-kind token sharing worker-a subject string returns403.
9. Wrong token audience returns403.
10. Missing read scope returns403.
11. Expired token returns401.
12. Stale request timestamp returns401.
13. Wrong route returns404.
14. Wrong method returns404.
15. Current-authority revocation rejects a previously valid token/proof with403.
16. Restoring synthetic authority permits a new nonce.
17. Changing an address label does not create new authorization identity or permit replay. The label is only synthetic metadata, never the actual network source.
18. Signature-only token validation still succeeds after local authority revocation: explicitly demonstrate why authenticity/expiry alone are not current permission.
19. All rejected calls preserve the protected effect counter.
20. Listener is closed after success or failure; receipt records version, command, checks, script SHA and no secret material.
21. Additional boundary oracle before its run: a signed GET carrying an unsigned body must return404 and preserve effects. Use Node's HTTP client because fetch prohibits GET bodies.

Single-process synchronous nonce check/insert is intentionally atomic only within this fixture. No distributed replay-store, eviction, outage, key rotation, body canonicalization or real device attribution claim follows. Fresh nonces in one process are not a general replay solution across a fleet.
