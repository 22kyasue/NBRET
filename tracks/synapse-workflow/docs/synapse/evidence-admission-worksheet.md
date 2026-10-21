# Evidence admission worksheet

Use one copy per claim before writing or revising a reader report. This is a manual review aid, not an execution plan, automated gate, permission grant or new case status. Keep the copy beside the run; retain prior versions. The canonical reader and existing casebook categories remain authoritative.

## Claim and boundary

- Claim ID, revision, author, reviewer and review date:
- Exact question, protected object/action and expected rule; who supplied that rule:
- Environment: live / captured-source local reproduction / synthetic evaluator fixture / source reading:
- Actual principal, role, tenant and access; use non-secret labels:
- Build/configuration/instance and collection interval; unknown fields explicitly marked:
- Permitted actions, exclusions, stopping reason and relevant authority record:

## Evidence ledger

| Proposition | Observation/artifact IDs | Identity, object and build match | Completeness and provenance limits | Supports / contradicts / missing |
| --- | --- | --- | --- | --- |
| Actor and relevant access | | | | |
| Object ownership and policy prerequisite | | | | |
| Legitimate matched control | | | | |
| Selected attempt | | | | |
| Actual consequence | | | | |
| Normal-flow or other counterevidence | | | | |

Preserve raw/normalized distinctions, collection times, producer, byte digests and redaction history. A hash establishes byte consistency, not origin authenticity. Do not copy credentials into this worksheet. An anonymous observation may legitimately have no tenant; do not invent one or silently treat it as an authenticated role.

## Consequence decision

- Exact observable effect and comparison rule (including ignored fields):
- Oracle/version and why it measures that effect rather than success text or status:
- For a read: protected contents actually returned and exact owner/object control:
- For a write: before-state, selected attempt, fresh after-state and legitimate controls; distinguish pre-existing state from this attempt's effect:
- Missing, stale, truncated or contradictory evidence:
- Result: demonstrated in the selected collected evidence / not demonstrated in this selected case / inconclusive / not attempted:
- Wider harm remains conditional on:

A 2xx response, denied response, tool completion, quoted canary, screenshot, reviewer label or owner declaration alone does not resolve the effect. Inspect returned content even on a denial. When no suitable oracle exists, preserve the observation and state that the consequence is unevaluated. Do not generalize a selected denial into application-wide safety.

## Optional “one step away” review

Leave this description unused unless every prerequisite below is demonstrated. This worksheet introduces no automatic status or authorization to perform the final step.

| Necessary prerequisite | Exact supporting evidence | Same actor/object/build? | Remaining uncertainty |
| --- | --- | --- | --- |
| Enumerate every necessary prerequisite separately | | | |

- Exact single unexecuted action:
- Why it was not executed; applicable boundary:
- Why no other prerequisite is still assumed:
- Explicit statement: the final consequence was not demonstrated:

If any prerequisite is an assumption, retain a lead and name the missing evidence. A local reproduction does not establish attacker control of the corresponding production condition.

## Report handoff

- Existing case category and unchanged uncertainty; no worksheet-driven promotion:
- Observed behavior, source facts, inference and hypothesis written separately:
- Live evidence and local/synthetic evidence visibly labeled at each relevant step:
- Contrary evidence visible next to the claim:
- Proposed repair distinguished from deployed repair; actual matched retest history or “not retested”:
- Reviewer identity and limits of independence, plus unresolved objections:
- Revalidation trigger (identity, build, policy or evidence change):
- Next bounded evidence question or final stopping reason:

Synthetic positive controls validate only the selected evaluator behavior. They cannot become a live finding. Use [proof-driven-poc.md](proof-driven-poc.md) for the narrow existing oracle and [reader-report.md](reader-report.md) for presentation. This worksheet cannot substitute for either.

Basis: `standards.claim-record-fields` (synthesis; framework.md:34–49), `ai-evaluation.audit-evaluator-before-tester` (draft synthesis; framework.md:79–91), `ai-evaluation.text-canary-oracle-not-effect` (constructed component fixture; deep-pentestgpt.md:56–65), and `evidence-handling.finding-record-separation` (source-trace; 2026-10-16-rea-and-security-workflows.md:42–46). Source paths are under `docs/research`. These support review discipline; worksheet effectiveness remains unmeasured.
