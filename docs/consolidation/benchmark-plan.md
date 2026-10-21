# Owned assessment benchmark and learning environment

Proposal, 2026-10-20 Pacific. Question: can a session-operated investigator, ARTEX plus the CLI bridge, or selected Synapse CE scanners produce useful reproducible findings and repair guidance with reasonable total human effort? We must also help Kotaro learn how to investigate and challenge those results.

Yes, a controlled environment is useful. It supplies known expected behavior and a private denominator, so we can distinguish missed cases, false claims and genuine effects. It is one part of evaluation: a synthetic benchmark cannot establish every real client's architecture, all vulnerabilities, or business demand. Existing practice tooling is reusable, but is not already a blind benchmark.

This document fixes the next design decisions. It creates no vulnerable application, hidden key, VM, network grant, paid resource or test run.

## Three separate uses

| Mode | Who knows the answers | What it establishes |
| --- | --- | --- |
| Guided workshop | Kotaro and the teaching/investigation session may see examples and hints. | Skill development and workflow debugging. Explain observations, hypotheses, controls, consequence and retest. |
| Familiar regression | Developers know the fixed cases; prior failures and controls remain visible. | Whether a change breaks previously defined behavior/scoring. Repetition is useful here. |
| Held-out scored evaluation | Protected preparer/scorer knows expected outcomes; investigator and initial reviewer do not. Kotaro receives no answers/hints before frozen submissions if participating in the blind run. | Bounded discovery/false-claim performance on eligible unknown cases, only after access separation and scorer admission are verified. |

After a target family/answer is revealed, keep using it for learning and regression. Use genuinely different held-out variants/families for later unseen-performance claims. Renaming routes or variables is not sufficient novelty. Public vulnerable apps are useful training/compatibility material with possible memorization; label that exposure.

## Target model

Start with one ordinary fictional business application: multiple organizations, representative roles, records and a meaningful approval/revision workflow. It should have working search/navigation, normal allowed operations, consistent errors and enough realistic behavior to require understanding. No real customer data, real third-party accounts or real credentials.

The protected target designer may vary familiar security patterns and composed business rules. Candidate families include identity/tenant/object access, role boundaries, approval/revision consistency, session lifecycle, data exposure, configuration and conventional input-handling patterns. Later families can combine individually ordinary permissions into an unintended outcome. This is a coverage menu, **not** a public statement of which weaknesses exist in any scored target or how many.

“Creative” cases should still violate an independently stated business/security rule with a reproducible observable effect. Surprise puzzles and undocumented expectations would reward guessing. Include secure implementations that look suspicious, inaccessible/unsupported areas and ordinary legitimate controls. Do not require the investigator to find a vulnerability for the run to count as complete.

Choose initial families where we can build reliable effect checks and preserve legitimate behavior. SQL/source/configuration scanners, black-box browser agents and account-authorized workflows have different access needs. Do not mix their scores into one ranking when they did not receive comparable information.

## Roles and information boundaries

| Role | Receives | Must not receive before freeze |
| --- | --- | --- |
| Target preparer/key custodian | Target source/build, intended rules, private variants/eligibility, reset state. | Investigator submissions until preparation is frozen, except safety setup checks. |
| Investigator | Authorized target, user-facing context/rules, supplied test accounts, allowed tools and budget. | Protected source/seed catalog/scorer outcomes, preparation logs, answer-bearing prior sessions, host repo or key. |
| Initial reviewer | Frozen submitted claims and permitted evidence; can request allowed corroboration under the protocol. | Private answers before its initial decisions freeze. |
| Scorer/adjudicator | Frozen target/scorer/eligibility, submissions, reviewer decisions and original evidence. | It must not become an unexposed investigator after seeing answers. |
| Learning facilitator | Guided workshop context; during scored runs only observed evidence and scope clarifications. | No answer-based hints during a blind run. |

Separate names, worktrees and model sessions on this Windows user are procedural separation only. This session has already read existing practice source and known scorer fixtures; neither it nor ARTEX supplied that material is blind to those fixtures.

Keep protected source/answers on a verified separate principal/guest/machine outside investigator authority. Do not put answers in this repository, shared boards, prompts, reports, searchable memory or a mounted host folder. Public IDs and manifest totals must not reveal the weakness count. Store protected commitments with the custodian; unsalted hashes of guessable labels are not secrecy.

## Sandbox decision: inspect first, then prove it

The previous read-only inventory found VirtualBox executable metadata on this PC, no Docker/Podman on the checked PATH/standard locations, and no launchable Windows Sandbox entrypoint. Those observations are dated and do not establish a working isolated guest. Recheck suitable existing guest/principal assets before selecting an implementation; do not install, change firmware or start another paid platform by default.

A restricted investigator VM/principal is a candidate. The key custodian stays outside its authority. Expose only the lab target and an approved provider connection; do not expose host workspaces, management endpoints, container sockets, cloud metadata or unrelated services. Review shared folders, clipboard/drag-drop, mounts, inherited environment, service connectors, DNS/redirect paths and alternative tools. Restrict target egress too. A model instruction or URL allowlist cannot substitute for enforcement.

Separate **target reset/isolation**, **investigator execution containment** and **answer-key confidentiality**. These are different controls; one container running everything does not establish all three. ARTEX has engine-side enrichment and configurable custom/MCP execution, so the boundary must cover more than model tool names.

Before a blind claim, use harmless synthetic canaries to demonstrate denied key/host/management access from the actual investigator runtime, while legitimate target and required provider access work. Inspect effective configuration as well as observed denial; one guessed missing path is insufficient. Verify provider credentials remain appropriately separated and never enter reports/Git. Retain boundary evidence and resource cleanup. Failure means the run stays guided/familiar or pending admission; it is not secretly scored as blind.

## Reuse versus new work

| Existing asset | Reuse | Missing work |
| --- | --- | --- |
| Ordinary practice app and workbench | Guided workshops, lifecycle/regression controls, evidence/history/UI. | No hidden variations in that familiar app should be called unseen. |
| Journal/casebook/intake | Immutable interpreted records, explicit authority/context, objections, owner requests. | Frozen evaluation manifest and protected eligibility/custody linkage. |
| Identity-aware assessment | Explicit cases, positive controls, build/session bindings and retest comparisons. | More effect predicates and real identity provenance for the chosen lab. |
| Proof baseline | Tests that denial, disclosure and denial-with-data are distinguished for a fixed work-order predicate. | Separate expected outcomes, new family predicates and scorer admission. |
| Structural evidence reviewer | Missing context/reference/freshness/contradiction checks. | It does not execute semantic oracles or certify origin. |
| Measurement module | Effort, descriptive comparison, rejected-candidate sample, proposed iteration records. | Actual time/effort observations, admitted scoring population and matched human baseline. |
| Canonical report | Clear case/consequence/evidence/repair/retest presentation. | Actual scored/adjudicated results; no sample results substituted. |
| ARTEX / bridge | Candidate adaptive investigator and subscription-CLI model transport. | Reproducible complete stack, enforced boundaries, current compatibility and evidence import. |
| Synapse CE | Candidate source/dependency/configuration scanner arm when scope/access fit. | Pinned executable/configuration, labelled engine coverage and result import. Its chain simulation is not an attack-effect arm. |
| API branch capture | Candidate exact-interacted-state/session/worker/stream collection. | Selective contract integration and credential/provenance review. |

## Freeze the experiment before investigator access

Public run contract: opaque run/target revision, permitted origin/interfaces/accounts and effects, access mode, relevant business rules, tool/model/prompt/config versions, authorized provider route, time/request/resource ceilings, stop/reset procedure, evidence schema, submission deadline, allowed assistance and output requirements. Public records do not contain seeds/expected labels or disclose their counts.

Protected registry: eligible units/family labels and exclusions fixed before results, intended policy, independently established expected outcomes, legitimate controls, complete private denominator, source/reset versions and ambiguity/adjudication rules. Unanticipated valid findings have a separate adjudication path; they do not silently alter the planted-key denominator.

Scorer descriptor/admission: exact effect predicate and extraction/comparison rules, required identities/build/state/controls, supported/incomplete cases, truth source, error policy and version. Require:

1. An independently checked intended effect and secure/legitimate control; not always-pass or always-fail scoring.
2. Record/control mutations for wrong actor, tenant, owner, object, role, revision and approval context.
3. Pre-existing success-shaped state with no action cannot prove this run caused an effect.
4. Missing, stale, duplicate, partial, truncated, redacted or contradictory evidence stays incomplete/unscored.
5. Quoted success, model agreement, HTTP success/denial labels and a submitted tool call cannot replace observed effects. Check excluded extra effects too.
6. A deliberate failing assertion control proves the intended scorer path can fail; retain reached assertions/counts.
7. Freeze target/scorer/tool/extraction/eligibility versions; preserve original artifacts through final presentation.

These implement the existing evaluation-admission contract, a draft research-derived protocol rather than an industry certification. A complete JSON manifest cannot authenticate custody or establish scorer correctness.

## Fair comparisons and useful measurements

Compare arms only within a declared access track: unauthenticated black-box, supplied-account black-box, or source-assisted. Use equivalent authorized accounts/data, budget and reset state. Start with a bounded engineering pilot to measure startup/readiness and recording overhead, then predeclare repeats and budgets for the scored experiment. Do not infer a suitable universal run duration or request quota from a fixture timing.

Record all setup failures, timeouts, unsupported tasks, stops and unscored results. Report startup/setup separately from investigation, review, manual verification, report editing, repair/retest, compute/provider use and total person-time. Missing cost/labor stays unknown, not zero. Multiple workers/model prompts on one app are not independent applications.

| Measure | Meaning |
| --- | --- |
| Eligible-seed recall | Independently confirmed eligible hidden cases found / eligible hidden cases. Not all possible vulnerabilities. |
| Unique finding precision | Confirmed unique findings / adjudicated submitted findings, with inconclusive claims separate. |
| Secure-case mistakes | Secure controls wrongly accused / eligible secure controls tested. Not a production-wide false-positive estimate. |
| Evidence/reproduction quality | Required artifacts/identity/state present, and independent reproduction attempts with outcomes and limits. |
| Consequence accuracy | Demonstrated harm, conditional wider harm and unsupported escalation separated. |
| Repair outcome | Changed-build original/neighboring/legitimate cases, vulnerable comparison controls and retained actual observations. |
| Effort and learning | Total person-time and tool resources; what Kotaro could explain/reproduce unaided after a guided lesson. Learning observation is separate from agent discovery. |

A competent manual baseline needs an actual appropriate human with matched access/budget. Another model or Kotaro receiving hints is not automatically that baseline. Until it exists, report absolute outcomes and engineering acceptance without superiority claims.

## Implementation sequence and stop gates

1. Finish preservation/context reconciliation. This task does that on the new branch; no runtime merge is assumed.
2. Review a real available boundary and tool/provider access. Pass synthetic-canary containment and permitted-access checks before creating protected held-out material.
3. Build the public data-only run-contract validator and scorer-admission records. Keep protected content outside this repo. Validate malformed/missing/mismatched versions and reachable failing controls offline.
4. Under the admitted preparer boundary, create the first ordinary target family and secure controls, freeze reset and expected behavior independently, and admit the selected effect scorers. Do not expose its solution here.
5. Prove ARTEX startup/bridge compatibility, recording, stop/reset and result import against ordinary permitted behavior before an adaptive scored run.
6. Conduct matched familiar engineering trials; fix setup/evidence failures. Then freeze a genuinely held-out trial with submissions/review before key reveal.
7. Classify misses/false claims by observation, hypothesis, tool use, evidence, filtering, review, consequence or stopping. Change one measurable bottleneck, regress familiar cases and evaluate on fresh held-out families.

Pause when a boundary fails, scope/effects become uncertain, reset/cleanup cannot be established, evidence is incomplete or the budget is exhausted. Preserve the failure. No requirement to produce a vulnerability, no live internet targets, no destructive tests against real services and no resumption of stopped labs.

## Evidence, limits and disproof

Uses `ai-evaluation.audit-evaluator-before-tester` (framework.md:79–91, draft synthesis); `ai-evaluation.agentdojo-usertask6-accepts-wrong-recipient` (selected component-lab, not a blanket benchmark defect); `commercial.evaluation-and-buyer-evidence-protocol` (synthesis.md:72–74, synthesis); `safety.capability-gate-outside-model` (executable-claims.md:25, component-lab, not OS isolation); `service-delivery.instance-vs-class-repair` (selected component-lab); existing discovery/evaluation admission and boundary inventory. Framework.md:5–15 and 34–49 support matched access, hidden/frozen tasks and evidence identities. Relevant passages/counterevidence were read; the existing register remains the citation map.

The environment/hypotheses are not settled by those studies. Success requires observable permitted access and denied key/host access, admitted effect scoring, retained failures and useful reproducible findings with reasonable total effort. Answer leakage, invalid scorers, unnoticed identity confusion, false promoted effects or no measured improvement falsify the corresponding claim. Retain them as results. Do not convert learning progress or repeated familiar successes into unseen discovery performance.
