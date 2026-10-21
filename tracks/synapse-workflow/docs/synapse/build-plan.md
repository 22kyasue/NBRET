# Synapse build plan

Owner: Skye. Builders/reviewers: Bryn and Elm. Date: 2026-10-18.

## Integrated local workflow acceptance

The integrated local workflow is implemented. See [usage and boundaries](LOCAL-WORKFLOW.md), [completion contract](completion-contract.md), and [receipt](local-workflow-receipt.json). The final explicit local acceptance suite passed 114 tests with zero failures or skips. Intake, case evidence gates and retained rejections, declared review and owner-verification records, matched retest admission, bounded checkpoint resume, effort and comparison records, rejection sampling, teaching records, and executive/technical exports are connected through the workbench and session CLI.

The retained acceptance example completed 50 actions and 54 actual synthetic-app requests, then closed its target. It establishes no vulnerability or repair. Independent reviewer isolation, protected blind evaluation, an expert manual baseline, live-target authorization, other-PC engine inspection, and client/market validation remain external prerequisites. Broader-stack execution and autonomous software self-modification remain later work. Earlier acceptance counts below describe their historical increments.

Status: Stage 0 inventory and Stage 1 offline foundation are implemented and hardened; historical artifact inspection, an ordinary practice app and guided investigation are implemented. The new session workbench adds a code-gated observation adapter, durable proposal/evidence/review records, a deterministic observation-driven selector and a session-authored proposal interface. See [SESSION-WORKBENCH.md](SESSION-WORKBENCH.md). Open-ended reasoning still belongs to the existing coding-agent session; this is not a completed autonomous investigator. Stage 2 blind-evaluation prerequisites and the full independent verification/repair/retest cycle remain open. No live assessment, deployment, provider purchase or stopped experiment is authorized by this document.

## Current implementation receipt

### Hardening and offline-adapter continuation

After Kotaro requested deeper hardening and continuation, Bryn reproduced a real journal bug: replacing valid UTF-8 replacement-character bytes with invalid UTF-8 could decode to identical text and evade the old canonical-text comparison. The regression failed before the fix; the store now compares canonical bytes directly against original bytes. Worker-termination tests interrupt immediately before/after atomic publication and prove inspectable lock/pending/commit states; they are not power-loss tests. Common destination validation now prevents nested creation/export from poisoning any enclosing journal, directly or through junctions, in both CLI and public journal creation.

Elm added dense-array/accessor replay checks, per-record structural budgets, a cumulative 16 Mi UTF-16-character serialized history cap, Set-based replay duplicate detection and one-pass summary grouping. A current rejected review stays visibly rejected despite conflicting owner verification; negative owner verification still prevents positive support presentation until a later reproduced declaration. Public applyEvent stays immutable and every review/verification remains retained.

Skye implemented assessment-import.mjs and the inspect-assessment CLI command. This is a read-only historical adapter, not the future target executor. It validates bounded known local files, original byte hashes, normalized digests, exact case/identity/environment bindings, observation populations, chronology, completion/error states and recomputed unreviewed results. Explicit incompleteness remains visible; unknown/reviewed transformations fail closed. Review also found missing timing could become a failed assertion in the old evaluator: imported responses now require measured elapsedMs. A direct-object envelope accessor test ensures getters are rejected before destructuring. Raw request/response data is omitted from the new inspection summary. No journal promotion or independent-effect claim is made.

Bryn independently reviewed the adapter and common output guard; Elm supplied independent import invariants. The final five-file focused run passed **33 tests, 0 failures, 0 skips**, with a reported 1.51-second duration. Cooperative stat checks do not prove source authenticity or defeat a hostile same-account writer. A Windows file-symlink test initially failed because that privilege was unavailable; the final suite tests junction root/artifact rejection instead, with the narrower coverage stated explicitly. No permission bypass was attempted. The final continuation receipt is hardening-receipt.json; the earlier implementation-receipt.json remains a historical source-hash receipt for the first increment.

### Initial foundation delivery (historical)

Stage 0 completed: [Bryn's source/resource inventory](implementation-inventory-bryn.md) and [Elm's acceptance design](acceptance-review-elm.md) were read by Skye. Installed Node v24.21.0 supports this increment with built-ins. Existing Codex/Claude command surfaces were inspected without inference or authentication inspection; available commands do not establish entitlements or isolation.

Stage 1 implemented: src/investigation/journal.mjs (Bryn), records.mjs (Elm), cli.mjs and report.mjs (Skye), with focused tests. [Usage and trust limits](offline-foundation.md). Records are intentionally declared leads and reviews, not verified effects. No adapter import, target executor, vulnerability discovery or provider launch is implemented in this increment.

Skye's integration run before the replay optimization: `node --test test/investigation-cli.test.mjs test/investigation-journal.test.mjs test/investigation-records.test.mjs test/scope.test.mjs` — **17 passed, 0 failed, 0 skipped**. The scope test was inspected as pure before running. Other suites/demos were not run. Tests include populated reporting, retained objections, negative owner-verification demotion, corruption/gaps/truncation, stale concurrent writes, stopped-state reconstruction, unknown fields and output overwrite refusal. Independent review caught summary-contract drift during implementation and a nested-export bug; integration now tests populated categories and direct/same-root/junction-alias export rejection. Bryn independently approved the export fix after inspecting the canonical-path check and regression assertions. These checks do not establish power-loss durability or adversarial OS isolation. Final optimized-source verification is recorded below when complete.

Single local in-memory replay/summary timing samples, Node v24.21.0: before optimization, 100 progress events 8.62 ms; 500 events 161.01 ms; 1,000 events 613.77 ms. After Elm replaced repeated whole-history cloning during replay with a private fresh-state reducer, Skye observed 2.28 / 5.00 / 10.21 ms respectively. Exported applyEvent remains immutable; differential tests cover complete event histories, alias mutation and failed-replay equivalence. These are storage/projection engineering samples, not investigator effectiveness or a stable benchmark. Duplicate-ID scans and journal rereads still grow with history; no unlimited scaling, performance superiority or SLA is claimed.

Final optimized-source integration run, same four explicit files: **19 passed, 0 failed, 0 skipped**, about 1.04 seconds reported by the Node test runner. Skye independently inspected the private replay path; Bryn approved journal/integration and the export fix, while Elm reviewed journal and authored the lifecycle differential tests. The exact file hashes and receipt are in implementation-receipt.json.

Stage 1 limitations versus Elm's broader L01–L12 proposal: scope/authorization/budget execution gates, actual artifact-content verification, matched repair imports, semantic effect scoring, blind-role access enforcement, secret sanitization and an adaptive investigator are **deferred**, not passing checks. Current metadata prevents accidental self-review labels but does not authenticate roles. A failed append can have committed before a later sync/cleanup error; compare saved heads. A retained external prior head is required to detect valid suffix removal. Stale locks/pending entries require explicit operator inspection. These limits remain in the user documentation/report.

Next executable work: improve the offline adapter contract and scorer/access-separation prerequisites in Stages 2–3 before any adaptive or target-facing loop. The unknown founder engine is not a dependency for this foundation. A separate future integration may reuse it only after inspection. Later-stage work remains unfinished.

## Outcome and decisions

### Stage 2 prerequisite findings

Skye read [the evaluation-boundary inventory](evaluation-boundary-inventory.md) and [the admission/frozen-run contract](evaluation-admission-contract.md) fully after the hardening work. Windows Home and inspected entrypoints do not provide a ready supported Sandbox/full Hyper-V path. Installed VirtualBox 7.2.8 is a candidate, not verified isolation: guest images, boot, guest-only coding-agent access through existing subscriptions and network/mount restrictions remain unverified. No VM, service, account or permissions were changed or started. Avoid treating a host-controlled guest with unrestricted host tools as an answer-key boundary.

The admission design separates investigator-visible frozen run metadata from protected expected-outcome/eligibility records. Do not leak hidden case IDs, answer counts or guessable answer digests into shared logs. The next implemented validator may establish only offline structure/consistency pending external evidence; it must not certify effect, authority or isolation from supplied metadata. Freeze scorer versions, legitimate controls, negative controls, reached-assertion counts, assistance and eligibility before scored access. No arbitrary scorer code/command from a record may execute.

Current conclusion: continue ordinary offline/guided engineering; blind-effectiveness and expert-superiority claims remain inadmissible until those separate prerequisites are demonstrated. The smallest next setup proposal should use existing installed capabilities and show the actual investigator/reviewer access surface. It must preserve the user's sessions and avoid unapproved host changes or new fees. The foundation and historical inspector are useful now; they are not an autonomous investigator or a client-readiness certificate.

The authoritative discussion record is [discovery-decisions.md](discovery-decisions.md). Kotaro subsequently approved workflow acceptance separate from investigation effectiveness, with a measured performance-improvement program after the first cycle. He has now authorized local foundation implementation and delegated builder/reviewer roles to Bryn and Elm, with Skye responsible for architecture and integration.

The user operates through an existing coding-agent session: provide a URL and available context, approve boundaries once, inspect progress, steer priorities and manually verify written findings. The eventual workflow investigates one application at a time, supports anonymous and supplied-account tracks, explores before prioritizing, preserves uncertainty and continues useful permitted branches when another branch is blocked. Teaching accompanies internal practice. Client output is separate.

## Research decisions and limits

These entries were located through the research register and their underlying passages read. Research is design evidence, not permission to run its sample commands.

| Decision | Register entry and source | Strength, limits and consequence |
| --- | --- | --- |
| Bind every observation to identity, environment and claim | `standards.claim-record-fields`; assessment-evidence/framework.md, Evidence-backed claim record; security-landscape/synthesis.md, Identity-bound finding-to-regression evidence | Source-backed proposed design. Digests establish relative integrity, not origin or true identity. Preserve evidence and interpretation separately. |
| Distinguish actual effect from agent text and status | `ai-evaluation.text-canary-oracle-not-effect`; assessment-evidence/deep-pentestgpt.md; framework.md, scorer audit | Component-lab counterexample plus synthesis. An accurately quoted receipt can pass while the intended effect is false. No metadata-only promotion to effect-confirmed status. |
| Keep permissions outside model decisions | `safety.capability-gate-outside-model`; assessment-evidence/executable-claims.md and infrastructure-and-memory.md | Component-lab decisions only, not an OS sandbox. The first offline increment has no target execution path. A future executor requires its own enforced boundary and bypass tests. |
| Compare repairs under matched conditions and retain legitimate controls | `service-delivery.instance-vs-class-repair`; executable-claims.md; framework.md | Component-lab, finite sequential cases. Does not establish every interface, concurrency or a real client repair. Reuse existing identity-bound assessment/retest semantics only after source review. |
| Audit the scorer before measuring investigator quality | `ai-evaluation.audit-evaluator-before-tester`; framework.md, Audit the evaluator before evaluating the tester | Synthesis protocol, explicitly a draft rather than an industry standard. Include deliberate failing controls, missing/partial evidence and versioned scoring. |
| Compare equal scope/access/budget and include failures | `commercial.evaluation-and-buyer-evidence-protocol`; security-landscape/synthesis.md, Evaluation before choosing a business | Synthesis; no market validation. Use held-out tasks and report assistance, total human effort and unsuccessful/unscored runs. |
| Keep observations, hypotheses and business interpretation distinct | `evidence-handling.finding-record-separation`; framework.md and infrastructure-and-memory.md | Source/design synthesis. Unknown business policy cannot be inferred solely from observed capability. Damage beyond demonstrated effect stays conditional. |

Contrary evidence matters: shared-account file hashes cannot establish independent evidence provenance; separate folders do not enforce secrecy; the existing assessment actor labels are operator declarations; a synthetic result cannot establish production fidelity or demand. The research does not settle which runtime is best for this workflow or prove the effectiveness of an autonomous investigator.

## Technology choice and inventory gate

Retain the existing Node ESM project and built-in runtime capabilities for the offline foundation. No package upgrades or new agent framework are required. This is a reversible implementation choice for local evidence/process tooling, not a claim that the existing architecture is predetermined.

Use already-open coding-agent sessions initially; no provider integration or model invocation is needed to build/test the offline foundation. Bryn's inventory must establish installed versions and actual supported interfaces before any automation adapter is selected. Do not read or copy credentials. Subscription entitlement, limits and billing are not inferred from executable presence.

Current official integration guidance was opened on 2026-10-18: [Codex platform integration](https://developers.openai.com/blog/codex-as-a-platform) distinguishes bounded exec jobs from SDK and app-server integration; [App Server documentation](https://learn.chatgpt.com/docs/app-server) documents persistent application integration. These are future options, not an adopted dependency. Existing sessions satisfy the initial interface requirement. Do not substitute a paid API for subscription use or silently purchase credits. Package/model upgrades require a demonstrated benefit, compatibility check and regression evaluation; newest alone is not a quality criterion.

## Stages and gates

### 0. Read-only implementation and resource inventory

Bryn owns implementation-inventory-bryn.md. Elm owns acceptance-review-elm.md. Inspect actual code and locally available interfaces without starting providers, scanners or applications. Identify identity-bound assessment paths versus legacy offline matching; review test entrypoints before execution. Preserve the dirty shared working tree.

Gate: identify reusable files, missing controls, available versions, unknowns and disjoint first-increment file ownership. No sandbox, provider access or account entitlement claim without observation.

### 1. Offline records, review and verification foundation

Build an inert local journal and deterministic record lifecycle. It records scope declarations, hypotheses, evidence references, review disagreements, requests, time/progress, human verification and limitations. It cannot execute URLs, shell commands, scanners or model calls. Target text is stored as data only.

Records have stable IDs, declared actor/environment identity, provenance and completeness. Evidence is distinct from interpretation. Reviews identify author/reviewer and cite the exact evidence; identical author/reviewer cannot count as independent. The package exposes three categories: independently corroborated findings only when the required evidence contract is met; items needing owner action; unconfirmed leads. If this increment only records human declarations, label them declarations, not independently corroborated findings.

Persist sequence/version and reject stale concurrent writes; reconstruct state from validated records after restart. Detect missing, malformed or changed journal entries. Do not silently repair or discard them. Restrict this implementation to trusted local operator files and describe the shared-account trust limitation. A local hash chain does not resist an administrator rewriting the entire history.

Produce a concise review package with observed effect, possible consequence, limits, proposed repair and manually supplied verification instructions. Preserve uncertainty and unresolved objections. Pending approval is a record, never an execution grant. No auto-generated security procedure is required for this foundation.

Gate: independent tests exercise restart, duplicate/stale writes, corruption/truncation, malformed input, missing/ambiguous evidence, self-review and incomplete records, plus a real offline CLI round trip. No target contact. Present limitations explicitly; do not label Stage 1 as completed adaptive v1.

### 2. Evaluation integrity and ordinary practice environment

Specify evaluation roles and access boundaries before creating hidden answers. Separate preparer, investigator, reviewer and scorer artifacts. A shared Windows account with unrestricted shell cannot provide an enforced answer-key barrier. Until a verified execution/storage boundary exists, label trials procedural/familiar-target and do not publish blind-performance claims. Choose an available isolation mechanism only after inventory; no new fees or assumed container isolation.

Create or select a small owned business application with realistic legitimate behavior. Its hidden evaluation design is prepared separately from investigators. This plan contains no exploit, vulnerable-target design or attack procedures. Freeze application revision, permitted access, answer/scorer versions, eligible cases, known clean behavior and assistance rules. Scorer admission tests must establish that wrong/missing/stale evidence and deliberate negative controls fail. A separate assessor must independently adjudicate unexpected valid findings.

Blind scored run: Kotaro does not open answers or provide hints before freeze. Guided learning run: free steering and teaching, clearly assisted. After answers are exposed, repeated trials on that target are familiar-target debugging.

Gate: demonstrated access separation or honestly limited evaluation label; validated scorer; fixed trial protocol and budget. A target with a hidden answer file in the same accessible repo does not pass.

### 3. Session-operated investigation and evidence adapter

Connect the trusted record workflow to existing approved observation/evidence functions only after reviewing their identity, data handling, cancellation and boundary behavior. Preserve native results and partial/error states. Plan selection and human steering remain distinct from executor permissions; the agent cannot approve itself. Start with an owned local environment. No live integration is included in this stage's current implementation assignment.

Maintain an exploration ledger: observed features/data/workflows, roles, policy facts, unknowns and coverage limits. Investigative hypotheses have supporting observations, expected effect, permitted next action and disposition. Defer unsafe or out-of-scope actions into consolidated owner requests while continuing other permitted work. No loop requires finding a vulnerability to terminate.

Gate: independently reviewed executor contract, permission and isolation tests, fresh identity binding, retained partial failure, bounded stop behavior, and no hidden-answer access. A prompt instruction, URL allowlist or completed process alone is not proof of enforcement or effect.

### 4. Full local cycle and workflow acceptance

Complete intake, exploration, adaptive investigation, evidence check, independent review, reporting, manual verification and matched repair retest. Prove resume/steering and consolidated requests work. Retest legitimate functionality and relevant related cases with retained versions; accepted risk and changed scope are not repairs.

Workflow acceptance is separate from discovery quality. A trustworthy cycle can pass engineering checks while discovery performance fails. Any boundary breach, unsupported promoted claim, missing execution/evidence state or undetected answer leakage fails the relevant gate rather than being averaged away.

### 5. Measured performance improvements

Classify misses and false claims by exploration gap, hypothesis selection, verification, filtering, review, reporting and premature stopping. Budget a reproducible sample audit of rejected candidates; preserve its denominator and uncertainty. Use a fixed known-answer corpus for regression/debugging and separate unseen variants/families for effectiveness measurement.

For each iteration record a failure, proposed change, predicted benefit, fixed comparison conditions, prior/candidate versions, metrics, regression limits and reject/rollback criterion. Freeze criteria before the comparison. Report seed recall only for eligible known seeds, unique confirmed precision with inconclusive cases separate, reproducibility, review/verification effort and total elapsed/resource use. Unknown subscription cost stays unknown; no zero-dollar inference claim from missing accounting.

Manual baseline: no claim of improvement over an expert until an appropriately experienced baseline operator completes an equivalent task with matched scope/access/budget, separately timed preparation/review/reporting. Kotaro's guided learning is useful but is not automatically an expert baseline. Until that baseline exists, report engineering acceptance and absolute measured outcomes without a superiority claim.

Stopping operationalization: predeclared hard limits plus a rolling log of new validated observations, genuinely distinct hypotheses and resolved uncertainties. Repeated paraphrases and duplicate findings do not count as progress. Thresholds are planning parameters to calibrate on local trials; investigator self-reported confidence is not the signal. Human stop takes precedence; pending requests are returned with reasons after other useful permitted branches are exhausted.

### 6. Later authorized application pilot

tobirastudio.com is a candidate owned application, not a current test grant. Obtain a fresh recorded scope, identities, data/effect limits, budget, contacts and stop/cleanup conditions before any target activity. Distinguish live demonstration, isolated demonstration and potential consequences. Disruptive availability work remains outside ordinary live assessment. External tester/method review is required before stronger client-readiness claims. No production code changes or deployment are part of assessment permission.

## Delivery and review responsibilities

Skye owns this plan, architecture contract, integration, user updates and final evidence. Bryn and Elm own only assigned files; each reviews the other's implementation independently. No wholesale cleanup, branch switch, install, global test suite or demo launch in the shared dirty checkout. Run inspected, focused local tests and record exact results, failures and remaining gaps.

Before the next stage, update this document with implementation receipts and remaining conditions. Do not convert planned gates into claimed achievements. Stage 1 is implemented and hardened. The next increment adds an ordinary owned practice app and guided six-control execution/evidence/report rehearsal, runnable through `npm run synapse:demo`; see [RUN-LOCAL.md](RUN-LOCAL.md). This establishes a usable local engineering path, not blind evaluation admission or adaptive investigation. Access separation, a session-operated exploratory adapter, independent finding adjudication and the full repair/retest cycle remain open gates.
