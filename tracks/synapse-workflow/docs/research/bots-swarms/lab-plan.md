# Synthetic experiment protocol, recorded before execution

Only loopback HTTP and in-memory synthetic principals. No browser, real credentials, address changes, remote test traffic, Redis installation, or production changes. Source dependencies are the pinned CommonJS memory limiter and its fully read dependency chain; no package installation is required.

Oracles:

1. For a two-request quota, four different synthetic principals sharing one address cause exactly two false rejections under address-only policy and zero under principal policy. These are constructed examples, not population accuracy.
2. Four requests by one synthetic principal with four address labels cause zero rejections under address-only policy and two under principal policy. Labels are server-selected fixtures, never trusted request-supplied forwarding headers.
3. Two independent memory limiter instances each accept two requests for one principal: four total. A single shared instance accepts two total. This demonstrates deployment scope, without a multi-process race claim.
4. A loopback protected endpoint denies missing identity (401), disallowed tenant (403), excess quota (429), and revoked principal (401); identity A must never return tenant B data.
5. Toy scheduler: lease expiry permits reassignment; a stale lease token cannot commit; a retried operation with the same idempotency key produces one side effect; cancellation invalidates an outstanding lease; attempts stop at the configured bound; heartbeats extend a current lease only. This is a model experiment, not BullMQ execution.

Record runtime, source hashes, script hash, all expected/actual comparisons, and server cleanup. Fail the run on any mismatch. Retain receipts; reruns get distinct filenames.
