# Consequence logic — independent source/purpose review

Aiko, 2026-10-18 (task 157d6617, requested by Skye on Kotaro's behalf). Read-only source/purpose review of the Rowan-directed consequence logic: `src/investigation/consequence.mjs`, `consequence-overview.mjs`, `screenshot-artifact.mjs`, and their integration in `casebook.mjs`, `workbench.mjs`, `workbench-server.mjs`, `workflow-report.mjs`. No edits. Per Skye's note, source is still settling and Elm's practice-consequence integration tests land next, so I did **not** run the full suite; this is a source/purpose pass only. Final acceptance to follow once those tests land and I'm cleared to run them.

## Verdict: no blockers found

Each exact-worded requirement from the Rowan task maps to honest, purpose-aligned code:

| Requirement | Where | Assessment |
| --- | --- | --- |
| Consequence-grouped overview preserving the 3 categories | `consequence-overview.mjs` (`categories`, `groups`), `workflow-report.mjs` | verifiedFindings / issuesNeedingOwnerAction / unconfirmedLeads retained; grouped by `impactType` without merging categories. Verified section stays empty with explicit text. |
| Beginner capability + why | `consequence.mjs` `capability`, `whyPossible` (both required text) | Present and rendered first in the detail view. |
| Declared severity; no fabricated score | `estimate()` levels + rationale; `priority.basis` | Severity is a declared level (unknown/low/moderate/high/critical) **with required rationale**; overview states "No numerical risk or coverage score." No invented number. |
| Demonstrated sample vs wider evidence + assumptions | `extent.demonstrated` / `extent.wider` (+ `assumptions`) | Separated; wider support labeled `cited-observations-only` vs `unsupported`; assumptions carried. |
| Damage/reach/access advisory priority with repair effort alongside; no fabricated score | `priority` block in overview | Tiered advisory ordering (severity → wider-reach referenced → lower access effort), repair effort shown alongside, `policy: consequence-advisory-v1`, `authority: Advisory presentation; no executor input`. |
| Evidence-linked sequences; screenshot pointers resolved only to registered bytes | `sequence[].evidenceIds` admitted in `casebook.mjs`; `consequence-overview` screenshot resolution; `/artifacts` route | See "Screenshots" below — resolution is strictly content-addressed and registration-gated. |
| Expected / current / proposed repair distinct from actual retest | `sequence[].{expected,current,proposedRepaired}`; report labels | Report renders "Proposed repaired outcome — not a retest" and separately "Actual retained retest: …". Clean separation. |
| Immediate / broader-repair / legit-flow / acceptance | `repair.{immediate,broaderRule,legitimateFlowEffects,acceptanceChecks,effort}` | All present and rendered. |
| Next-investigation advisory only | `nextInvestigation` + overview `authority` string | Advisory text only; explicitly "no execution permission is granted". |
| No executor / authority expansion | see "Executor isolation" | Confirmed by tracing the step path. |

### Screenshots — content-addressed, registration-gated, no arbitrary path
- `screenshot-artifact.mjs` validates real PNG structure (signature, per-chunk CRC32, IHDR dims/bit-depth, IDAT present, IEND), bounds (4 MiB / 16 MP), rejects symlinks, and re-stats across open for TOCTOU (ino/dev/size/mtime). `artifactId` is forced to `png-<sha256>`; writes are exclusive (`wx`, 0600).
- `consequence.mjs` restricts pointer `artifactId` to `^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$` and `sha256` to 64 lowercase hex — no path characters.
- `consequence-overview.mjs` resolves a pointer **only** when a registered artifact matches `artifactId` **and** `sha256` **and** the artifact's `evidenceId` is cited in that step; otherwise `unresolved-pointer`, `href:null`.
- HTTP route `workbench-server.mjs:38`: `^/artifacts/png-[a-f0-9]{64}$` → `session.screenshot(id)`, which serves only a registered record via `readScreenshot` (re-reads the regular file, re-verifies size + digest). Headers: `image/png`, `no-store`, `nosniff`, CSP `default-src 'none'`, `X-Frame-Options: DENY`. A query string or any non-hex char fails the anchored regex and 404s. No traversal is reachable.
- Export (`workflow-report.mjs:11`) rewrites served hrefs `/artifacts/png-<id>` → relative `screenshots/png-<id>.png`, which resolves beside the report in the session root (where `retainScreenshot` wrote them). Unresolved pointers render "Screenshot unavailable", never a broken/forged link.

### Executor isolation (priority never feeds execution)
Traced the step path: `workbench.mjs:137` calls `chooseNext({...result, observations, decisions, enabledActors, permitTransitions, stopped})` — it passes **no** consequence, severity, overview, or `screenshotArtifacts`. In `next-step.mjs` `priority` is only the selector mode `coverage|workflow` (throws on anything else) — unrelated to consequence advisory priority. `session-target.mjs` contains no consequence/severity/priority reference at all. The consequence overview is computed purely as projection output (`workbench.mjs:75`). **Advisory priority cannot influence what the target executor does.**

### Evidence admission and staleness
- `casebook.mjs` `consequence.documented` requires every evidenceId across demonstrated/wider/sequence to resolve to a complete, identity/source-bound observation (`check(ctx, ids, c.environment.sourceHash)`), and binds the record to the latest passed gate + its review.
- `projectConsequence` / overview mark the document `stale` when a newer gate or superseding review has landed (same gate+review binding pattern as the owner-verification fix). A stale document is shown as `needs-documentation`/`refresh-stale-interpretation`, never presented as current. No stale-leak equivalent to the earlier owner bug.

## Minor notes (not blockers — for acceptance coverage, not fixes)

1. **Pointer vs registration timing.** `consequence.documented` admits a screenshot *pointer* even if no artifact is retained yet; registration/authenticity is resolved later at overview/serve time (unregistered → `unresolved-pointer`, `href:null`, and the server refuses it). This is honest and safe. Acceptance should include a case: *documented consequence citing an unregistered artifactId → shown unresolved, never served, never linked.*
2. **Consequence binds to latest passed gate; staleness is vs latest gate overall.** Deliberate and conservative (a later failed/new gate makes the document stale). Acceptance should assert *consequence goes stale on a new gate or superseding review, history preserved.*
3. **`/artifacts` GET is not nonce-gated** (same as `/report`, `/executive`). Acceptable because it serves only content-addressed, registered PNG bytes with `nosniff` + strict CSP, but worth stating so it's a conscious decision: the artifact route is readable same-host without the write nonce.

## What this review did not establish
Source/purpose only, no suite run. This does not verify runtime behavior, Elm's forthcoming integration tests, or any effect/authenticity of the screenshots themselves (hashes bind bytes, not provenance or redaction — the modules say so). The consequence logic remains **declared interpretation**: it does not create a verified finding, a numeric risk score, or any execution authority. Final acceptance after the integration tests land and a clean suite run.
