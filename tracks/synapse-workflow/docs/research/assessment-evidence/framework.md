# Draft quality and coverage framework

This is a proposed protocol, not an industry standard or a validated score. The [OWASP Benchmark](https://owasp.org/www-project-benchmark/) supplies an example of deliberately labeled cases and tool-specific score generation. That kind of ground truth answers a narrower question than open-world assessment quality.

## Define the task before comparing systems

Write the business question, authorized environment, initial knowledge, allowed credentials, objectives, stop conditions, forbidden actions, time budget and reporting requirements. Decide whether source access, privileged accounts, Internet lookup and human hints are available. A black-box tool and a source-assisted expert are different configurations, not interchangeable contestants.

Construct several task families: known software flaw, authorization invariant, multistep workflow, identity/configuration chain, and telemetry/response validation. Include functioning secure cases and deliberately inaccessible cases. Verify every seed is reachable under the supplied roles and that the evaluation harness detects its consequences. Have an independent reviewer establish the expected result before tool output is seen. Separate fixture creators, operators and adjudicators where feasible.

Hold out application families, policy variants and fresh synthetic changes. Renaming a public benchmark's variables does not remove semantic leakage. Record public exposure, possible training contamination and any overlap with tuning data. Pin application, dependency, tool, model, prompt, rule and template versions. Freeze scoring criteria before execution. Preserve every run, including timeouts, parser errors, unsupported tasks and failed setup. Do not select the best attempt without declaring the selection rule.

Use equal access/budget and a realistic expert baseline. For stochastic systems, repeat with a predefined run count and report per-task distributions, uncertainty and run failures. Do not treat multiple prompts on one application as independent applications. Report setup, hints, manual validation, report editing and retesting separately. Human assistance is legitimate when declared; it changes what was evaluated.

## Measures that have interpretable denominators

| Measure | Definition | Necessary qualification |
| --- | --- | --- |
| Seed recall | Independently confirmed reached seeds / eligible seeds | Applies to planted eligible faults, not all possible flaws |
| Finding precision | Independently confirmed unique findings / adjudicated claimed findings | Preserve inconclusive findings separately; count duplicate roots once |
| Negative-case behavior | Secure fixtures incorrectly flagged / secure fixtures tested | Not a production-wide false-positive rate |
| Evidence completeness | Claims with specified required artifacts / claims reviewed | Artifact presence does not establish truth |
| Reproducibility | Replays confirming consequence / eligible replay attempts | State resets and dependencies must match |
| Time to verified result | From access-ready start to independently verified result | Also report total preparation and reviewer hours |
| Remediation verification | Fixed variants passed plus vulnerable controls failed | Include nearby paths and operational functionality |
| Defensive outcomes | Executed, observable, detected, triaged, contained, recovered | Use distinct evidence and time windows for each |

Recall is unknowable when the true set of vulnerabilities is unknown. Repeat engagements can reveal additional findings but do not supply that missing denominator. Capture–recapture estimates would require assumptions about independence and equal discoverability that shared tooling and correlated expertise often violate. Production evidence increases ecological relevance while reducing experimental control. Neither seeded labs nor field engagements replaces the other.

Audit presentation denominators too. The pinned [garak report source review](deep-garak.md) traces evaluation counts (prompt × detector opportunities), optional prompt counts, minimum-child summaries, fixed severity bands and configured exclusion of perfect-score groups. They answer different questions. Its current page's “all secure” phrase means no supplied group below DC-3, not that every test passed or every asset was examined. Preserve the raw digest, population filters, aggregation version, unknown verdicts and exact counts alongside a chart. A descriptive gap between matrix cells is not a causal interaction or a recall estimate; require an experimental design and uncertainty analysis for either claim.

Business severity should be reviewed against reachable roles, affected assets and consequence. Keep impact uncertainty visible. Do not equate CVSS, finding volume, number of techniques, or a model judge's confidence with business value. Record a severity disagreement rather than manufacturing consensus.

## Evidence-backed claim record

Each claim needs:

- Stable ID, business owner and reviewer; tenant/confidentiality classification.
- Exact predicate and policy authority, with versioned assumptions.
- Environment/build/configuration identity, identities and access actually used.
- Positive and negative cases; interfaces, states and trust boundaries exercised.
- Evidence references with collection time, digest, producer and redaction history.
- Status: proposed, attempted, blocked, observed, independently verified, contradicted, stale or revoked.
- Explicit exclusions and remaining hypotheses; reproducible safe procedure.
- Remediation owner and dependencies; retest result; change-based revalidation trigger.

A digest binds bytes to a receipt; it does not prove origin or that the collector told the truth. A trusted collector, restricted evidence store, append-only access history and independent corroboration can strengthen provenance. Keep changed interpretations as new versions linked to the original evidence.

An executable predicate also needs a **comparison contract**: state schema/extraction method, ignored fields, normalization rules, exact dependency/configuration, reached work limits and unavailable/unprocessed fields. The [DeepDiff dependency walkthrough](deep-deepdiff.md) traces this beneath AgentDojo's state oracle. An empty mapping can mean scoped equality, intentional omission or an incomplete bounded calculation; those must remain distinguishable. Store completeness/limit status separately from the boolean verdict and do not count repeatability as independent expected-state correctness. These are source-backed design requirements, not a new measured tool ranking.

## Worked limits ledger: approval workflow

| Dimension | Included and verified in synthetic fixture | Excluded, blocked or inferred |
| --- | --- | --- |
| Asset | One in-memory invoice object | No deployed service or database |
| Roles | Maker A, approver A, approver B | Delegated admin, disabled users, recovery roles untested |
| Workflow | Edit, approve, pay, repeated payment | Refund, bulk import and cancellation untested |
| States | Draft, approved, paid; approval followed by edit | Concurrent transactions, queued jobs and rollback untested |
| Boundary | Tenant equality and role checks in one function | Authentication and network routing excluded |
| Oracle | Explicit test policy and expected final states | Domain-owner approval absent; synthetic policy only |
| Technique | Deterministic sequence tests and weak-implementation controls | No scanning, fuzzing, source-assisted AI or human exercise |
| Time/access | One short local run, complete fixture source | No external dependencies or production evidence |
| Evidence | Full transitions, source digest, command and runtime | No real SIEM, screenshots or signed collector |

This ledger states what is known without a misleading “80% secure” score. A blocked dependency remains blocked, not passed. “Not attempted” is different from “attempted but inconclusive.” Source-inferred behavior remains inferred until the relevant runtime case is exercised.

## Worked adjudication

The vulnerable implementation permits payment of a draft: independently specified expected denial is violated. The one-instance repair blocks that path but permits payment after an approved invoice is edited: the original symptom is fixed, the invariant is not. The class repair passes six selected cases, including a valid payment and cross-tenant denial. A reviewer should accept only “these cases passed under this fixture hash,” not “all payments require valid approval in every interface.” Details and receipts are in [executable claims](executable-claims.md).

## Field follow-through

Assign remediation and decision owners, separate accepted risk from fixed status, and document compensating-control expiry. Retest both the original path and related interfaces with controlled data. Check telemetry and operator usability, then schedule revalidation on code, policy, identity or dependency changes. Measure recurrence by root cause and affected class, keeping application churn and engagement scope differences visible. A reopened finding is not automatically tester failure; it may reflect a changed environment or a different path.

## Audit the evaluator before evaluating the tester

The resumed [AgentDojo implementation review](deep-agentdojo.md) supplies a worked counterexample. Current banking UserTask6's utility predicate checks amount, recurrence and a subject keyword, while its task request specifies a recipient too. Actual extracted code accepted the wrong recipient and a pre-existing qualifying transaction. Wrong amount/nonrecurrence controls failed. This demonstrates incomplete oracle coverage for a selected task, not an invalidation of all benchmark results.

Before admitting a task into a comparative evaluation, require these checks:

1. Execute intended ground truth; independently confirm required state change and relevant actor/resource identity.
2. Mutate each authorization-relevant field separately: recipient/tenant/owner, role, object, revision and approval context. Expected violations must reject.
3. Supply pre-existing success-shaped state and perform no action. Distinguish a state predicate from a claim that this run caused the effect.
4. Include partial error with side effects, extra unauthorized effects, quoted success text, refusal, missing evidence and stale cached results. An error need not mean no effect.
5. Freeze task version, scorer source and eligible-task definition. Separate infrastructure error, unscored, attempted failure and demonstrated objective; explain exception-result policies explicitly.

6. Verify that tests actually reach their subtests and assertions. Retain discovered, selected, skipped, executed and adjudicated case counts separately. Use a deliberate failing control to establish that the intended assertion path can fail; a zero exit code alone is insufficient.

Lark's [Coraza test-reachability review](../bots-swarms/continuation.md), section “Registered actions and test reachability,” provides a source-established example at pin `b3c6522`: the selected data-driven TestOperators checks a constant that is always present in its exclusion list, so each fixture iteration continues before creating/evaluating its subtest. Agate read Lark's annotations; this is attributed source evidence, not an independent Agate runtime result. It does not implicate other operator tests or establish a production failure. Fixture existence, full-file reading and a passing test command must not be substituted for evidence that the relevant cases executed.

The garak [synthetic scoring receipt](deep-garak-receipt.json) illustrates denominators: four generated outputs produced three processed scores and two evaluated scores. A percentage without these quantities can conceal unsupported outputs. PentestGPT's [synthetic audit receipt](deep-agent-receipt.json) illustrates a different boundary: exact source-attributed canary text can pass a textual oracle while an independent effect flag is false. Neither experiment measures a model's attack success rate.

## Worked limits ledger: permission revocation

| Dimension | Established | Limit that must accompany the claim |
| --- | --- | --- |
| Engine/configuration | Pinned OpenFGA v1 cache resolver; separate v2 source trace | Engine feature flags and fallback behavior matter; do not silently mix verdicts |
| Actor/resource | Synthetic user and document, five store/model/actor/context variants | No application's authenticated principal or actual resource read |
| State | Synthetic delegate changes allow to deny | No real tuple write, database replica or asynchronous invalidation timing |
| Consistency | Actual resolver bypassed cached lookup at higher consistency; newer invalidation forced recomputation | Cache entry timestamp alone does not prove latest authoritative state |
| Negative controls | Error/cycle outcomes did not cache in the selected fixture | Map cache does not model TTL admission/eviction; no exhaustive branch claim |
| Outcome | Scoped permission verdicts and test logs | No network path, data access, telemetry, containment or response demonstrated |

[OpenFGA receipts and annotations](deep-openfga.md) show why “permission denied” must be qualified by policy/model/data/consistency identity. A precise limit is useful information, not a failed assessment. API errors should remain errors; turning them into clean denials would erase the difference between absence of permission and inability to complete the check.

## Preserve claim identity across report transformations

The [pinned SDK continuation review](sdk-boundaries-continuation.md) adds a source-backed collection example. Codex's generated resume/rollback contract explicitly describes stored interactions as lossy. MCP's normal transports can acknowledge a notification before handler delivery; optional replay stores have a different contract from an audit archive, and parsed responses can contain restored correlation IDs or locally synthesized errors. These are source-established boundaries, not end-to-end customer results.

For each evaluated run, retain a transformation ledger: original bytes where authorized, parsed event, normalized arguments, callback invocation, target observation, local error synthesis, scorer decision and final report claim. Mark missing stages explicitly. Classify an HTTP acknowledgement, completed SDK await and domain invariant verdict separately. Capture loading/truncation flags, effective per-round versus workflow budgets, protocol era, configuration and artifact-retention policy. A resumption token is not a completeness certificate; a completed cleanup request is not proof that evidence was deleted.

Assistance provenance also needs its own field. The reviewed MCP elicitation implementation explicitly permits a client agent to generate an accepted response. Do not score an accepted answer as human review without separate evidence of a person's intervention. Likewise, a state envelope authenticated to the same principal and question does not establish that the answer remains true, that access remains authorized, or that the environment has not changed. These distinctions extend the protocol; no new comparative benchmark or runtime effect is claimed.

Tomo's [ZAP installed-object receipt](../security-landscape/deep-review/zap-alert-object-lab-receipt.json) and [source/call-site study](../security-landscape/deep-review/zap-alert-persistence.md), read here on 2026-10-17, add a different evidence boundary. Nine synthetic assertions against the installed ZAP 2.17.0 Alert class confirm unset-ID equality despite differing hashes, loss of custom reference/explicit source-history identity during selected cloning, and cached SYSTEMIC classification after tag replacement. Assigned-ID, unchanged-original and tag-order controls distinguish these cases. These are **Tomo's object-method results**, not new Agate source/runtime validation, and they establish no dropped finding or incorrect final report.

A claim bundle therefore needs transformation checks in addition to collection/replay checks: create → assign persistent identity → clone/group → serialize/store → reload → present. Preserve original evidence identity separately from display/group identity; test before/after-ID cases, custom references, mutable classifications and partial persistence. The next discriminating experiment follows the actual call sites with controlled fixtures and verifies which fields reach storage and the report. Do not infer end-user data loss solely from a surprising equality/hash or clone result. This extends the proposed evaluation protocol without duplicating Tomo's active implementation review.

## Worked transformation audit: units, unknowns and submission

The deeper [garak report-fixture trace](garak-report-fixture-evidence.md) provides an explicit counting contract. In the committed digest,635 inference outputs yield1270 detector judgments because two detectors each judge635 outputs. The actual evaluator accumulates these quantities separately. Its technique matrix intentionally copies observations to every matching technique tag, and authored tests assert that overlap. Therefore neither1270 nor a sum of technique cells is a count of unique faults. Group lower-quartile summaries aggregate detector-result rows, while per-probe summaries use minimum detector score; preserve this operator and its input population. The artifact identifies a test target and is not independent production benchmark evidence.

The [CEL planning/residual trace](cel-planning-provenance.md) supplies a second transformation contract: false, absent optional value, unknown and evaluation error are distinct. Residualization embeds selected known state, can cache known function results, reparses under an environment and changes expression IDs. Keep the original and residual artifacts, provenance of the state that removed each condition, binding/policy/unknown-pattern versions and expiry trigger. A simplification is conditional reuse of evidence, not a fresh assessment of an unknown dependency. Its finite authored tests mainly check structure; semantic equivalence needs its own oracle.

The [pgx binding trace](pgx-binding-boundaries.md) supplies a third stage distinction: an encoding failure may leave earlier encoded values in a local builder, while reviewed callers return before submitting a query. Conversely, a later server/response failure need not establish no effects. Record attempted preprocessing, completed preprocessing, submitted action, target-side effect, observed result and cleanup as separate states. A reviewer should reject an inference from local partial buffers directly to partial server execution, just as they should reject an inference from a local error directly to no side effect.

A practical claim bundle should make these contracts machine-checkable without replacing human judgment:

| Contract | Required evidence | Disproof/qualification |
| --- | --- | --- |
| Observation identity | Unique attempt/output/effect IDs and lifecycle completion | Repeated status records are not new attempts |
| Scoring unit | Detector opportunities, scoreable/missing counts and selected denominator | Overlapping tags/detectors are not independent faults |
| Transformation | Source/output hashes, operator, ignored fields, conditional facts and implementation version | Field preservation alone does not validate its truth |
| Execution stage | Admission, preprocessing, submission, observation and target-effect records | A local return or acknowledgement is not final effect evidence |
| Oracle | Independently expected role/resource/state result and negative controls | Type/nonempty checks or output text alone can leave the key invariant unchecked |
| Revalidation | Build/policy/role/data/binding changes and time-sensitive dependencies | Cached/residual results become stale when their facts change |

These additions derive from pinned source and authored-test review. They do not introduce runtime results, a product requirement, a comparative ranking or a universal correctness proof.

Execution-population receipts should also distinguish expected-output substitution from actual path execution. The pinned [pgx collection review](pgx-binding-boundaries.md) identifies three examples that deliberately print their expected output and return on a CockroachDB-specific branch, before the illustrated query. Other authored tests assert real cardinality/values and explicit skip conditions. This is source-established conditional behavior, not a test run here or a criticism of every pgx test. A benchmark receipt should record which branch ran; otherwise an output comparison can support a stronger capability claim than it actually exercised.


## Worked schema-to-claim boundary: field and method identity

The pinned [gateway continuation](authzen-evidence-boundaries.md) separates three questions often conflated in schema-driven assessment:

| Question | Source evidence | What would establish more |
| --- | --- | --- |
| Is a field documented as required/read-only? | Exact emitted schema and selected options; proto3 semantics can add required, comments/annotations can set readOnly through distinct paths | Retain generator/config/source identities; validate schema independently if claiming schema validity |
| Does a request path enforce the intended rule? | Selected adapter, default/custom parser, middleware, callee, state transition and error flow | Domain-approved rule plus positive/negative outcome and target-state oracle in the specified deployment |
| Does observed activity join to the intended RPC? | Original descriptor name, generated Go symbol, gateway context label, gRPC full-method constant | Trace actual collector/policy/scorer consumers and demonstrate the join without silently normalizing distinct identities |

Worked source example: the camel-case fixture emits normalized Camel_CaseService/GetStatus into gateway context, but gRPC invokes Camel_Case_service/Get_status. Generator name mutation explains this; the correct transport constant is contrary evidence against a failed-RPC claim. A finding can truthfully be marked source-verified identity divergence while runtime consumer impact remains unknown. The capitalization test checks code spellings and method handlers, not that cross-layer equality. Do not assign a coverage percentage or security severity from this alone.

For an eventual claim such as 'only an owner can modify field X,' a generated readOnly flag is neither the policy authority nor its enforcement evidence. Record whether the intended constraint comes from a domain owner, prose, annotation, descriptor semantics or inference. Preserve the submitted representation before defaults/hydration, presence and oneof case, selected route/config, transport mode and exact error/outcome. A schema-only input generator may systematically omit a valid path or fail to represent required negative cases. A successful typed decode provides evidence about parsing, with the business invariant still unverified.

Smallest credible follow-up, not executed here: use an independently specified synthetic service with one allowed owner edit and one denied cross-owner edit, collect original RPC and adapter labels separately, and compare actual state to the policy oracle. Disproof of the proposed claim-bundle improvement would be no reduction in misjoined/misclassified cases under held-out naming/config variations, or reviewers reconstructing the same limits just as accurately without the additional provenance. This is an evaluation proposal, not authorization to resume any stopped operation or a runtime result.
