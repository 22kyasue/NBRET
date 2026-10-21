# Evaluation admission and frozen run contract

Owner for subsequent schema/code: Skye. Design review: Elm, 2026-10-18.

This contract defines what must be fixed and evidenced before a Synapse evaluation can support a stated conclusion. It is a design prerequisite, not a run authorization, implemented scorer, hidden-target design or effectiveness result. This review performed register searches and source reads only. No tests, models, targets, installations or research experiments were run.

## Decision and current foundation

Adopt a data-only admission package with separate public and protected records. First validate structure and references offline. Admit an actual scored run only after the appropriate owners establish scorer validity, authorized access, role separation and the comparison protocol. A complete metadata record can establish none of those external facts by itself.

The current code supports a narrower foundation:

- `records.mjs` records declared leads, evidence, review, owner verification, requests, progress and terminal stop; it preserves histories and reconstructs them deterministically. Its manifest has only schema/kind/id/target/mode/createdAt/limitations. It has no frozen evaluation manifest, protected eligibility, scorer admission, authenticated verifier or effect oracle.
- `journal.mjs` provides cooperative local persistence, revision/head conflict checks and consistency detection. An external prior head is needed for suffix rollback detection. It does not enforce hidden-key confidentiality against this Windows account.
- `assessment-import.mjs` inspects bounded historical unreviewed assessment artifacts, exact bindings, digests, time/error states and recomputed machine results. `inspect-assessment` exports an inspection; it neither inserts journal leads nor executes an assessment or independent scorer. A successful import is internal consistency with the current interpreter.
- `report.mjs` labels review support and owner reproduction as declarations, with history and limits. These categories must remain distinct from future adjudicated effect results.

Use a new evaluation record/package, linked to the existing investigation ID/head. Do not silently extend or reinterpret old manifest fields. Nothing here authorizes loading an arbitrary module, command, callback, script, template or URL supplied in a scorer record. Scorer descriptors and receipts are inert data. Any future executable evaluator is a separately assigned, inspected implementation with its own boundary and tests.

## Required records and fields

These are semantic requirements for the next schema assignment. Each record requires a supported schema/kind, stable ID, creation time, version, producer/owner reference and explicit limitations. References identify artifacts already retained under an approved access policy; they are not paths to auto-open. Times and identities remain declared unless a separate trust mechanism supports them. Use bounded plain JSON, explicit enums and required nullable fields with reasons for unavailable values; reject unknown fields and ambiguous duplicates.

### Investigator-visible frozen run manifest

| Required group | Minimum content |
| --- | --- |
| Run identity | Evaluation ID, run ID, arm/configuration ID, investigation ID and journal head/revision, protocol ID/version/digest, parent/replacement run reference or explicit none. |
| Purpose and conclusion | Evaluation question, intended conclusion class (`workflow`, `descriptive`, `comparative`), mode (`blind`, `guided`, `familiar`), environment class (`owned-isolated` for the proposed first evaluation), and exclusions. Selecting a mode is a declaration, not proof it qualifies. |
| Authority | Owner-approved scope/authorization reference, its version and valid window, permitted access class, data/effect limits, stop/resume policy and escalation owner. No credentials or secret tokens. A URL, manifest or historical grant never supplies current permission. |
| Versions | Application/build/configuration/policy identifiers, evidence schema, tool/rule/template/runtime versions actually used, and prompts/model configuration where applicable. Unavailable exact provider/model revision is explicit and limits reproducibility. No model selection or invocation is authorized by this field. |
| Initial conditions | Allowed knowledge/source access, unauthenticated versus supplied-account track, declared role/tenant/session references, starting-state/reset receipt reference, allowed tools and access-ready definition. Record familiarity/public exposure without revealing protected answers. |
| Scoring binding | Scorer descriptor ID/version/digest, admission receipt ID/digest and protected eligibility registry reference. Investigator-facing fields must not reveal hidden case IDs, labels, eligible-count totals or answer presence. |
| Trial and budget plan | Predeclared run/repeat count, allocation/order rule, time/request/resource ceilings as applicable, fixed stop conditions, treatment of reruns/setup failure and selection rule. No best-attempt selection unless explicitly predeclared. |
| Assistance policy | Versioned allowed/prohibited assistance classes; logging owner, disclosure procedure and contamination rule. Distinguish human explanation, investigative hints, supplied facts/artifacts, model assistance and safety/scope clarification. |
| Comparison gate | Baseline protocol/owner reference or explicit `pending`/`not-applicable` with reason; matching scope/access/budget conditions; expert qualification/familiarity reference. `pending` blocks comparative conclusions. |
| Measurement plan | Metric definitions, units/denominators, root-cause duplicate rule, treatment of missing/error/inconclusive cases, uncertainty/repetition unit and acceptance/regression thresholds. If descriptive only, explicitly state there is no superiority threshold. Include preparation, review, explanation, report editing and retest labor. |
| Freeze | Manifest digest, freeze timestamp, approving owner reference, external retention receipt for the frozen version and freeze-before-access declaration. Record what corroborates that chronology; a local timestamp/hash alone cannot prove it. |

Do not put protected answers in investigation roots, shared boards, reports, search indexes, prompts, logs or this repository's ordinary evaluation documentation. Public manifest size or IDs must not deliberately reveal the number/presence of weaknesses. Keep public and protected artifact references opaque. Publishing an unsalted digest of low-entropy answer data can reveal it through guessing; a digest is not a secrecy mechanism. The protected custodian chooses storage/commitment details under a separately approved boundary.

### Protected eligibility and expected-outcome registry

The preparer/custodian retains a frozen task population and registry version, application/state revision, per-unit stable identity, inclusion/exclusion rule and reason, expected disposition and its independently reviewed policy basis, required observation/effect evidence, scoring constraints, legitimate/clean controls, supported/unsupported capabilities and known ambiguities. Record private totals so denominators can later be audited. Unexpected valid findings have a predeclared independent adjudication route outside the planted-key denominator.

Eligibility is decided before seeing arm results. Tool failure, timeout or an inconvenient result does not make an otherwise eligible unit disappear. An unreachable preparation error is an invalid unit under a recorded decision applied consistently to all arms, not a miss silently removed from one arm. Changes after freeze create a new registry version; retain the old one and identify every affected comparison.

The investigator and initial finding reviewer receive only allowed task material, not this registry or its answer labels. A post-submission adjudicator may obtain protected expected outcomes after initial reviewer decisions and submissions freeze. Document this role transition; the adjudicator is then answer-aware and cannot become an unexposed investigator on the same revealed target.

### Scorer descriptor and admission receipt

The descriptor fixes scorer identity/version/source digest, input/evidence schemas, the exact predicate and authoritative policy basis, comparison/extraction rules, normalized/ignored fields, relevant identity/build/state/consistency bindings, allowed effects, completeness/error semantics and eligible population version. It states separately whether it judges text fidelity, model state or independently observed application effects. A text scorer may be admitted for text fidelity; it cannot earn an effect claim.

The admission receipt binds that descriptor to the frozen registry and lists each admission check below, expected/actual verdict, reached assertion IDs, relevant evidence references, reviewer, unresolved objections and disposition. Name which checks are source-inspected, tested on inert records or independently demonstrated in the authorized environment. `not-demonstrated` and `unsupported` are explicit outcomes, not passing checks. No automatic `admitted` result follows from artifact presence.

All mandatory checks must be satisfied for the intended claim. Unsupported capabilities may be excluded prospectively with a bounded conclusion, but a required effect check that has not been demonstrated blocks admission for that effect. Required independence/access evidence is assessed by the responsible reviewer, not inferred from differing name strings.

## Scorer admission checklist

| Check | Required evidence and rejection condition |
| --- | --- |
| A1 Intended case and clean control | Independently establish the stated expected outcome and legitimate behavior under the supplied access/state. A success-shaped object alone does not establish feasibility or actual consequence. Preparation errors, broken controls or unavailable policy authority block the affected unit. |
| A2 Constraint discrimination | For each relevant actor/tenant/owner/object/role/revision/policy/approval constraint, change that field in a harmless scorer input/control and require the defined violation to reject. Preserve intentional abstractions. This is a record-level oracle checklist, not instructions to perform application attacks. |
| A3 Novelty and attribution | Pre-existing success-shaped state with no action cannot pass a predicate claiming this run caused an effect. Specify before/after and operation attribution, without treating timestamps or shared IDs alone as causation. If only a state predicate is supported, narrow its claim accordingly. |
| A4 Missing, partial and error cases | Missing/duplicate/stale/wrong-identity evidence, redacted predicate values, unsupported output and bounded/truncated collection stay unavailable, ambiguous or incomplete. A partial error can coexist with effects; separately record known effects and unknown completion. Never turn error into either clean denial or success. |
| A5 Text and extra effects | Quoted success text, a canary, model agreement, requested tool call, accepted acknowledgement and empty output cannot establish an application effect. Check required effects and separately excluded extra effects. A correct primary field does not excuse unexamined or disallowed additional changes. |
| A6 Reachability | Preserve discovered, selected, skipped, attempted, assertion-reached, scored and adjudicated counts/IDs. Deliberately fail an intended assertion in an inert control and observe failure. A green runner exit or an existing test file with zero reached assertions is insufficient. |
| A7 Frozen interpretation | Bind task/scorer/registry versions, error policy, extraction/normalization limits, artifact transformations and aggregate metric formula. Round-trip receipt to final report without dropping unknowns, objections or original evidence identity. Reject a scorer/version substitution or stale eligibility reference. |

The deliberate failing control validates that the assertion path can reject. The intended positive and clean controls ensure it is not an always-failing oracle. Neither proves complete semantic correctness or generalization. Independently written expected outcomes and external observation are still required for effect claims.

## Distinct states and accepted outputs

Use separate dimensions rather than one `passed` flag:

| Dimension | Required distinctions |
| --- | --- |
| Admission | `draft`, `offline-validated`, `pending-external-evidence`, `admitted-for-stated-claim`, `invalidated`, with reasons and evidence. These are proposed contract states, not currently implemented statuses. |
| Execution | `not-attempted`, `attempted`, `completed`, `stopped`, `infrastructure-error`; completion alone says nothing about correctness. |
| Evidence | `complete-for-predicate`, `incomplete`, `missing`, `ambiguous`, `integrity-rejected`; complete means the declared predicate inputs are present, not trustworthy origin. |
| Capability/eligibility | `eligible-supported`, `eligible-unsupported`, `excluded-before-freeze`, `invalid-preparation`; preserve why, who decided and which denominator includes each. |
| Verdict | `demonstrated-for-listed-case`, `not-demonstrated`, `inconclusive`, `not-scored`. Independent observation provenance is required before using the first for effect, not supplied by its enum value. |
| Review | Author hypothesis, initial filter decision, reviewer disposition/objections, owner reproduction declaration and final adjudication are separate linked records. A later negative decision cannot leave an old positive presented as current. |

“Clean” is a known expected-outcome control label retained by the preparer. After scoring, say that a particular legitimate/control case produced its expected observation under the listed conditions. Never translate zero leads, absent evidence, rejected import, unsupported work or a completed run into “application clean.”

Accepted package outputs are: the frozen public manifest; protected registry retention receipt; scorer descriptor/admission record; per-attempt execution and evidence ledger; assistance/deviation ledger; frozen submissions; independent adjudication records; and a report with exact numerator/denominator tables, disagreements, costs/time, exclusions and claim limits. Sensitive protected material is released only to its permitted role at the appropriate phase. Existing public artifact inspection is useful evidence input but cannot substitute for these records.

An offline validator may output structural pass/fail, unresolved references, supported version bindings, computed populations and missing prerequisites. Its accepted output is **offline-validated / pending external evidence**, unless an explicitly reviewed external admission record for the same versions is also supplied. Even then it checks the record's consistency; it does not independently authenticate the signer's authority or effect.

## Blind, guided and familiar runs

For blind admission, freeze the application/scorer/eligibility and allowed inputs before investigator access. Establish protected storage and access boundaries for preparation answers, including actual tool, directory, account, memory and search access. On this shared unrestricted Windows account, separate sessions/folders are procedural separation only. A `blind` label without verified protection and exposure review cannot support independent blind-performance claims.

Kotaro does not open the key or give investigative hints before submissions freeze. Questions and teaching during the run stay grounded in observed evidence. Urgent safety/scope clarification remains allowed, logged and reviewed for any change in investigative knowledge. Record each assistance event: ID/time, giver/recipient, human-versus-agent declaration and its basis, class, content/evidence reference, affected units, policy version and contamination disposition. Do not call an agent-generated accepted response human verification.

Guided mode permits steering and teaching, with assistance retained. It supports assisted-workflow/learning observations, not independent discovery performance. After answer exposure, later runs on the same revealed material are familiar practice. Once leakage occurs, preserve the original blind designation plus an invalidation/contamination event; do not rewrite history to make the run look newly blind. Continue only under the permitted assisted scope and documented mode revision.

Freeze investigator submissions and initial review before revealing the key. Freeze references include the journal head and artifact digest at that time, retained outside the mutable store. Subsequent objections, unexpected findings and adjudications are append-only revisions linked to that submission. Chronology declarations require corroboration before stronger integrity claims; this local journal does not provide an independent timestamp authority.

## Baseline owner and comparison gate

Before a comparative claim, name an appropriately experienced human baseline operator and independent adjudication owner; record competence, prior target/key exposure and permitted tools. Freeze equivalent access-ready starting conditions, information, scope, accounts, budget, assistance and reporting/retest requirements. A model-only arm is not a manual baseline. Kotaro's guided learning is not automatically an expert baseline.

Predeclare allocation/order, comparable unseen variants, repeat count and reporting/uncertainty unit. The same human repeating an answer-revealed target produces a familiar-practice comparison. Repeated prompts on one application are correlated trials, not independent application samples. Report full setup/reviewer/report-editing/retest labor and unavailable costs, not only model runtime or a zero marginal API bill.

Missing baseline owner, contamination or unmatched conditions blocks the superiority conclusion. It need not block honest workflow or descriptive measurements. Preserve unsuccessful/unscored runs, eligible unsupported cases and inconclusive adjudications separately. Define whether each metric is conditional on supported/scored cases and show the broader eligible totals beside it; do not label conditional precision/recall as end-to-end performance. No universal sample size, numeric quality threshold or adequate expert qualification is established by the research; these require a predeclared defensible choice and reviewer approval.

## What can be checked next without a target

| Can be checked offline on inert records after code assignment | Requires protected preparation or independent observation |
| --- | --- |
| Strict schemas, bounds, duplicate/reference checks, frozen digest links, unknown versions, immutable replacement history and external-head comparison. | Actual current authority, authentic identities/producer and reliable external time/provenance. |
| State transitions, latest-negative precedence, assistance classification, count conservation, missing/error/unsupported handling and report round trips. | Whether the preparer/key truly remained inaccessible and the investigator/reviewer actually stayed unexposed. |
| Harmless predicate-input mutations, a deliberate failing assertion, reached-count receipts and deterministic expected record comparisons. | Feasibility and correctness of protected expected outcomes; actual effect occurrence, attribution and excluded extra effects. |
| Baseline fields present and comparison conditions equal as declared; explicit pending gate when missing. | Baseline competence, equivalent real operating conditions and independently adjudicated outputs. |
| Existing historical inspector rejects inconsistent bindings/results and preserves incompleteness. | New discovery, generalization, production applicability, pricing, client demand or effective repair. |

Future offline acceptance cases: absent/wrong/stale scorer receipt rejects admission; no reached assertions rejects; unsupported/missing/error cannot become clean/success; a changed eligibility set requires a new frozen version; hidden labels/counts do not enter public projection; extra or duplicate result IDs cannot inflate denominators; a human-verification flag without provenance remains declared; a supplied executable path/command is rejected; assistance leaks invalidate affected blind units; baseline pending prevents comparative output; missing external admission evidence yields pending rather than admitted; revised adjudication preserves original submission and earlier dissent. Implementing these checks is Skye's next assignment, not work already performed here.

A scorer defect invalidates the affected admission/version. Preserve prior receipts, identify affected runs/arms, repair under a new version and apply a recorded re-adjudication policy symmetrically. No quiet rescoring, eligibility pruning or retroactive threshold changes. Permission/scope expiry, compromised isolation, evidence corruption or exhausted hard budgets stop the relevant run/admission; remaining work and resumption conditions stay explicit. This contract does not resume stopped research.

## Research basis, alternatives and limits

Read the current research guide, discovery decisions/build plan, source modules described above and cited passages below. This applies existing research to a product contract; it adds no study finding or new measured evidence.

| Register entry | Cited source passages opened | Strength and constraint |
| --- | --- | --- |
| `ai-evaluation.audit-evaluator-before-tester` | assessment-evidence/framework.md:75–91, especially 79–87 | Synthesis admission procedure. Line 3 expressly calls the framework proposed, not an industry standard or validated score. |
| `ai-evaluation.agentdojo-usertask6-accepts-wrong-recipient` with `corr.ai-evaluation.agentdojo-not-blanket-weak` | assessment-evidence/deep-agentdojo.md:45–59 | Component-lab counterexample at a particular task/version. Contrary evidence at 57: other predicates check recipients; no blanket benchmark dismissal. |
| `ai-evaluation.trace-predicates-credit-failed-calls` | assessment-evidence/deep-agentdojo.md:148–152,200–204 | Source-trace: a requested call can be credited without successful effect. Contrary evidence at 204 includes both exact parameters and final membership in another task. No prevalence or current agent effectiveness measured. |
| `standards.claim-record-fields` | assessment-evidence/framework.md:34–49,106–116 | Synthesis: identity/version, completeness and transformation/assistance provenance. A digest does not prove origin or true effect; claimed usability benefits remain unmeasured. |
| `commercial.evaluation-and-buyer-evidence-protocol` | security-landscape/synthesis.md:70–74; assessment-evidence/framework.md:5–30 | Synthesis: equal conditions, realistic expert baseline, all runs and held-out material. A prototype is feasibility evidence; buyer demand and superiority remain unsettled. |

Alternative: continue guided local practice with declared records while external prerequisites remain pending. That is useful for workflow/debugging and requires fewer isolation commitments, but it cannot answer blind-discovery or expert-superiority questions. A large generic benchmark runner would add execution and scorer-trust surfaces before these decisions are settled. The selected minimal data contract keeps those choices reviewable and fails admission when required evidence is missing.

Success for the next offline increment means malformed or incomplete admission records cannot acquire stronger claims, and valid bounded records preserve the agreed versions, populations and limits. Success for a later evaluated workflow additionally requires the protected-role, actual-effect and baseline evidence above. Neither outcome has been demonstrated by writing this document.
