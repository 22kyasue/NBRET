# Local capability evaluation

Executed 2026-10-17 on Windows x64 / Node v24.21.0. This is a controlled **local validated** evaluation of NBRET assertions/evidence reuse, not an evaluation of autonomous discovery or commercial services.

## Reproduce

From NBRET: `node scripts/research-security-lab.mjs`. No parameters or external targets are accepted. It binds two servers to `127.0.0.1` on OS-selected ports and writes a fresh ignored run. Read [the original plan](lab-plan.md) and [follow-up plan](lab-followup-plan.md) before interpreting the receipts.

Dependencies are the existing NBRET modules and installed package tree. The source hashes in each receipt identify the precise working-tree inputs. No packages, certificates, VM infrastructure or real identities were added for this lab. Both fixtures are closed even on assertion failure. This is loopback-only target construction, not an OS-enforced network sandbox for arbitrary added code.

## Known-answer authorization variants

Each request uses a synthetic `x-fixture-tenant` header, with A and B invoices containing synthetic data. The own-tenant positive control checks successful content. The security check requires 403 **and** absence of the invoice object for a foreign tenant.

| Fixture truth | Strong check, 3 repeats | Status-only 403 check, 3 repeats | Availability-only 200 check |
| --- | --- | --- | --- |
| Vulnerable: foreign invoice with 200 | Fails 3/3, correctly identifies violation | Fails 3/3 | Passes 3/3 despite disclosure |
| Fixed: 403 without invoice | Passes 3/3 | Passes 3/3 | Fails 3/3 because denial is not availability |
| Deceptive denial: 403 with foreign invoice | Fails 3/3, correctly identifies violation | Passes 3/3, misses disclosure | Fails 3/3 |

Own-tenant positive controls passed 9/9. The strong live oracle has zero false negatives across six leaking executions and zero false positives across three repaired executions. These are repeated fixtures, not nine independently sampled applications. The weak status-only denial oracle misses the entire deceptive variant. Neither baseline represents a claim about how a named scanner or expert performs.

## Transport and evidence controls

The first run made 20 fixture requests; the follow-up made 21. The redirect destination server received zero. Write-without-opt-in and out-of-origin cases rejected without sending requests. Structured-body assertions over a text-only response returned incomplete, not pass. Offline reassessment generated zero requests. App and destination servers both reported `listening: false` at completion.

The original run's measured in-process duration was about 76.9 ms; the expanded follow-up about 79.6 ms. These small local figures exclude human research/design time and are not performance benchmarks. Individual local request timings were 0–6 ms. There were zero model calls and $0 model API cost; no total labor/infrastructure cost was measured. All cases and expected outcomes were human/agent-authored from known fixture truth; the tool did not discover them independently.

## NBRET-E01: offline identity ambiguity

Predefined after the first source/lab result, in a separate plan. In fixed mode, a fresh tenant-B request for invoice A correctly passes the denial/security assertion. Reassessing the prior tenant-A response at the same URL with tenant-B headers fails because `checks.mjs:82–83` ignores those headers when selecting saved evidence. The offline label is present, but the specified identity is not enforced by matching.

This demonstrates a narrow reproducible evidence-selection problem, not a live cross-tenant exploit and not a claim that all offline checks are invalid. The source record actually contains the synthetic identity header, so this mismatch is independently inspectable in the saved JSON. Real secrets may be redacted, making a simple raw-header comparison an inadequate general repair. Candidate next experiment: bind a non-secret principal/tenant/role/session-policy identity to both capture and check, reject ambiguous matches, and verify it against changed-session negative cases. No production code was changed.

## Receipts and limits

- [Original receipt](lab-receipt.json): `runs/security-lab-1792263542679/receipt.json`; preserves the pre-follow-up runner hash.
- [Follow-up receipt](lab-followup-receipt.json): `runs/security-lab-1792263876973/receipt.json`; includes both original repetitions and identity mismatch.
- [Focused test receipt](test-receipt.json): nine existing tests passed using loopback/fake-harness/synthetic saved evidence. It is not the entire browser/ZAP integration suite.
- Per-request evidence, assertion JSON, Markdown and JUnit remain in the corresponding ignored run directories.

No TLS/IdP implementation, real session expiration, asynchronous mutation, race condition, multi-step business transaction, cloud path, endpoint sensor, scanner, model provider or paid customer environment was validated. No tool rankings are justified. Benchmark leakage is minimized here by constructing a small unpublished known-answer fixture, but this is too narrow to establish generalization. Next evaluations should keep unseen variants and independent adjudication separate from the tools generating cases.
