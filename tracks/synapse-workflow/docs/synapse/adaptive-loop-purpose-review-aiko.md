# Purpose-alignment review: the next Synapse increment (session workbench + scheduler)

Reviewer: Aiko (Claude session, NBRET@main). Date: 2026-10-18.
Requested by Kotaro via Skye. Scope: product and process alignment only. No security techniques, payloads, or exploit guidance appear here by design.

## What I read and the state of the code

- `docs/synapse/discovery-decisions.md` (updated), `docs/synapse/build-plan.md`, `docs/synapse/first-investigation.md` and its review `first-investigation-review.md`, and `docs/research/reconciliation/USE-RESEARCH.md`.
- The built foundation on disk: `src/investigation/` (journal, records, cli, report, assessment-import) and `src/practice/` (app, investigate, rehearsal, demo).
- **The proposed increment's code is not present yet.** No file matching a workbench, session, workspace, or scheduler module exists, and the tree is uncommitted. So this reviews the *proposal* against purpose; I will re-review the actual contracts when the files land, per the task.
- I did not run `find-research.mjs` or any script, contacted no target, and started no app.

## The purpose I am checking alignment against

Source- or session-operated investigation of an owned business application, where observation drives the next hypothesis and step, evidence is retained, review is separate, the owner verifies, progress is measured within a single run first, and no new fees are incurred. The proposed increment is a local bounded session workbench: it accepts typed observation/action proposals from the current coding-agent session, maintains an observation ledger with coverage, steering, stop, and consolidated owner requests, enforces a local-only capability gate in code, and runs a deterministic observation-driven scheduler that is disclosed as rules rather than model intelligence. No arbitrary URL/shell/provider interface, no autonomous vulnerability claim, no production.

## The one alignment risk that dominates the rest

The purpose asks for **adaptive, observation-driven** investigation. The proposal says the scheduler is **deterministic rules, not model intelligence**. Both can be true at once, but only under one honest reading: *adaptivity lives in disclosed rules that branch on the content of prior observations, while the coding-agent session supplies the proposals.* If that is the design, the increment is a disciplined ledger/gate/stop harness around a session, not an autonomous investigator, and it must be labelled that way.

The failure mode to guard against is **fixed-script theatre**: a predetermined sequence of action types, logged with reason strings so it reads as "observation-driven," when the next step would have been the same regardless of what was observed. The current `first-investigation.md` is explicitly a fixed guided script and says so honestly. The danger is that adding a "scheduler" around the same fixed sequence makes it *look* adaptive without *being* adaptive. Every blocker below exists to make that distinction testable rather than asserted.

## Ranked blockers (resolve before accepting the increment as purpose-aligned)

1. **Define, in the contract, exactly where adaptivity lives, and stop calling the harness an investigator.** State plainly that the scheduler branches on observation content via named rules and that the session is the only source of hypotheses. Acceptance of this increment must not claim the scheduler itself discovers or investigates. Highest priority because it determines whether every later claim is honest.

2. **No falsification test separates real branching from theatre.** Require an acceptance test that feeds two or more content-divergent observation streams and asserts the scheduled next actions diverge according to a disclosed rule, while an unchanged stream reproduces the same schedule. Without both the divergence check and the reproducibility check, "observation-driven" and "deterministic" are each unverifiable.

3. **The capability gate needs adversarial tests, not a config flag.** The research is blunt that tools do not enforce scope, that SDK permissions are only configuration, and that the one thing shown to work was a code gate outside the model, and even that only in a fixture (`safety.capability-gate-outside-model`, component-lab; `agent-runtime.sdk-permissions-are-configuration`, source-trace). Acceptance: a deliberately out-of-scope action proposal (arbitrary URL, shell, or provider call) is rejected by the gate even when the session proposes it, the rejection is recorded with a reason, and the decision is demonstrably outside the model. A prompt rule or allowlist alone is not proof, which the build plan's Stage 3 gate already states.

4. **"No arbitrary URL/shell/provider interface" must be scoped honestly against a shared host.** The coding-agent session is itself an arbitrary-capability actor on this account, so the workbench cannot prevent the session from acting on the host directly. The gate constrains what the workbench will *perform and record*, not what the session *can* do. Say this. Otherwise the gate is oversold as host isolation, repeating the shared-host/shared-account limitation already acknowledged throughout the foundation docs.

5. **Carry the build plan's measured stop/coverage definition into this increment, not a weaker placeholder.** Stage 5 already operationalizes stopping well: predeclared hard limits plus a rolling log of genuinely new validated observations, distinct hypotheses, and resolved uncertainties, with paraphrases and duplicates not counting, and human stop taking precedence. Acceptance: the scheduler stops on that measured signal, a duplicate or paraphrased observation does not advance progress, and a human stop preempts an in-flight plan.

## Acceptance checks (how to accept without overclaiming)

- **Decision trace.** Every scheduled step records the triggering observation id(s), the named rule that fired, the hypothesis and its disposition, and the permitted action type. A step that cannot cite a triggering observation and rule is flagged, not counted as adaptive.
- **Reproducibility.** Identical observation input yields an identical schedule.
- **Divergence.** Content-different observation input yields a different schedule wherever a rule branches.
- **Gate.** Out-of-scope or unsupported proposals are rejected outside the model and retained as rejected with a reason.
- **Record separation.** Output keeps recorded declarations distinct from independently corroborated findings, exactly as Stage 1 does; a scheduler decision is never promoted to a finding (`evidence-handling.finding-record-separation`; `ai-evaluation.text-canary-oracle-not-effect`, component-lab: a quoted success is not an effect).
- **Consolidated owner requests.** Blocked or out-of-scope proposals queue with their reason and what each would enable, while other permitted branches continue; urgent items escalate immediately, per discovery-decisions.
- **No fees / local-only.** The workbench invokes no billable provider itself; the session's own model usage is separate and is acknowledged rather than hidden.

## Useful next priorities

1. **Write the workbench contract before any code:** the action-type schema, the disclosed rule catalog, the ledger and coverage schema, the stop signal, the gate decision points, and the reject path. Stage 3's gate already requires an independently reviewed executor contract; this is that artifact, and it is what a reviewer can actually check.
2. **Build the decision trace first.** It is the mechanism that makes adaptivity auditable; the ledger, coverage, and stop all hang off it.
3. **Reuse `src/investigation` (journal/records) rather than a parallel store,** so the hardened provenance, stale-write, and corruption protections and the review discipline carry over instead of being re-earned.
4. **Keep the session as the only intelligence and label it so.** Do not add a model call inside the scheduler in this increment; that would reintroduce the "audit the scorer, keep enforcement outside the model" hazard (`ai-evaluation.audit-evaluator-before-tester`, synthesis).
5. **Stay local against the owned practice app; defer any live target and tobirastudio.com,** consistent with Stage 3 ("no live integration in this stage") and discovery-decisions (ownership is not a test grant).

## Questions for Kotaro

1. For this increment, is "adaptive" acceptable as *disclosed rules that branch on observation content, with the session proposing actions*, or do you expect the scheduler itself to select hypotheses? This decides whether blocker 1 is a labelling fix or a scope expansion.
2. What is the minimum rule catalog that makes the scheduler worth building over the existing fixed script? How many distinct branch types must it support?
3. Should the workbench accept proposals from one named session only, or several? This affects the independence and leakage story given the shared board and account.
4. Should rejected or out-of-scope proposals auto-queue as consolidated owner requests, or surface to you immediately? Discovery-decisions says consolidate but escalate urgent; the threshold is yours.
5. Confirm this increment stays on the owned local practice app with no live target, matching Stage 3.

## Limitations of this review

The increment's code does not exist yet, so this is a review of the proposal and the surrounding built foundation, not of an implementation; I will re-review the action-type and rule contracts when the files are present. I read the five named documents and did not run research scripts, contact any target, or produce payloads or exploit guidance. The 45-test and earlier pass counts are as reported by Skye, Bryn, and Elm; I did not re-run them. The research I lean on here is mostly component-lab and source-trace strength, as `USE-RESEARCH.md` flags, so the gate and scorer cautions are design evidence, not observed behavior of this workbench.

---

# Code-contract re-review: workbench + target adapter

Date: 2026-10-18 (second pass, requested by Skye). Files read: `docs/synapse/session-workbench-design.md`, `src/practice/workbench.mjs`, `src/practice/session-target.mjs`. Scope unchanged: product/process honesty only, no security techniques. Focus per Skye: are owner-facing outcomes, declared review, stop/unknown states, and rules-versus-session decisions honest in the implementation as written.

## State of the increment

The target adapter and orchestrator are present; `src/practice/next-step.mjs` is **not present**, and `workbench.mjs` imports `chooseNext` from it (line 7). So the module does not load and nothing runs end to end yet. Skye's note already says the selector is forthcoming, so this is expected, but it means the increment's central claim — observation-driven branching — is **unverifiable today** and no test can exercise the orchestrator until the selector lands.

## What is honest and holds up in the code

These four are genuinely enforced, not just asserted, and I want them on record as passing:

- **Rules-versus-session is labelled and visible.** A session proposal is stamped `source:'session'`, a selector proposal `source:'rules'`, both persisted on the decision and rendered in the report with the source shown (`workbench.mjs` lines 111–112, 166). An owner can see which decisions came from the deterministic rules and which from the session.
- **"No arbitrary target or provider interface" is real at the code level.** The caller never supplies a URL, header, payload, or path. `session-target.mjs` builds the path itself from the fixed action kind (line 131), the action vocabulary is a closed set validated twice (orchestrator `action()` and target `actionRecord()`), object IDs must match `WO-[NS]###` and must already have been discovered in this instance (line 123), scope is immutable, and per-request/cumulative/size/count/session limits are enforced (lines 6, 54–59). This directly substantiates the honesty claim.
- **Stop and pause are honest.** `stop()` closes the target, awaits the in-flight action, and appends a `stopped` event idempotently (lines 151–154); pause only blocks new pickup and never claims the running action ended, matching the research hazard that pause leaves active work running. Budget exhaustion stops with the explicit reason that unvisited branches remain untested (line 106).
- **Unknown/incomplete states are honest.** A denial (403/404/409) is recorded as a *complete* observation of a denial, while transport/setup failures are `incomplete` with an error code and a consolidated owner request stating "no automatic retry" (lines 121–127). A crash after `action.started` stays an unresolved attempt and is never auto-replayed; replay reconstructs the record read-only (lines 43, 60–64). Review requires an executed decision and must cite the decision's observation plus existing complete evidence (lines 143–146), and every review is stamped "operator-declared review, not verified effect."

## Ranked issues

1. **The adaptivity/real-branching claim cannot be confirmed because the selector is absent.** This is the whole point of the increment. Acceptance must gate on `next-step.mjs` existing *and* passing the divergence test (content-different observations change the eligible next action), the reproducibility test (identical observations reproduce the schedule), and a check that no work-order answer IDs are baked into the selector. Until then, the design's "real branching" sentence is a promise, not a demonstrated property.

2. **The owner-facing HTML omits the observed evidence.** The report renders decisions, reviews, owner requests, and limits, but not the observation outcomes themselves — an owner reading the HTML cannot see that a given action was denied with a 403 versus returned data; that lives only in the JSON export. Since the stated purpose is "return evidence for owner verification," the human-readable report should surface at least each decision's observation status/outcome. This is a completeness gap, not a false claim, but it weakens owner verification.

3. **"Complete observations" counts denials, which a naive reader will misread as successes.** The coverage line reports `completeObservations` where a complete exchange includes 403/404/409 denials. The code is correct, but the owner-facing wording invites a wrong reading. Label it as completed exchanges and show a status breakdown, so a denial is not silently counted as a success.

4. **The three-category delivery is not represented, and the report should say so explicitly.** discovery-decisions requires separating independently verified findings, owner-action items, and unconfirmed leads. The report lists reviews by verdict and disclaims certification, which is honest, but it should state outright that the independently-verified category is empty by design in this increment rather than leaving the mapping implicit.

5. **`maxActions:40` in the manifest is dead; the budget is hard-coded.** The manifest records `maxActions:40` (line 78) but `step()` hard-codes `>=40` (line 106), so a reader who trusts the manifest field is misled about what controls the limit. Drive the budget from the manifest value or drop the field.

6. **Owner verification is not modelled.** discovery-decisions makes Kotaro's verification a separate recorded step, and the hardened Stage-1 records demoted support on negative owner verification; the workbench records reviews but has no owner-verification event. Acceptable to defer for this increment, but the report must never show any item as owner-verified (it currently does not), and the deferral should be stated.

## Useful next priorities

1. Land `next-step.mjs` with its divergence and reproducibility tests and the no-embedded-answers check; nothing else in the increment is acceptance-testable until it loads.
2. Add the observation outcome (status + a bounded summary) to each decision in the HTML report, and relabel the coverage counts.
3. Make the report state the three-category mapping and that the verified category is empty by design this increment.
4. Resolve the `maxActions` source-of-truth inconsistency.

## Limitations of this pass

The selector is absent, so the module does not load and I could not run any test; the orchestrator and adapter were reviewed by reading, not by execution. I read the three named files only, ran no scripts, contacted no target, and produced no payloads or exploit guidance. I will re-check the branching, divergence, and reproducibility properties against `next-step.mjs` once it is present.

---

# Implementation + UI pass: five blockers checked against the code

Date: 2026-10-18 (third pass, requested by Skye). Files read this pass: `session-workbench-design.md`, `src/practice/workbench.mjs`, `workbench-server.mjs`, `workbench.html`, `workbench-ui.js`. `next-step.mjs` is still absent. No target executed, no assessment instructions. Kotaro authorized this increment, so I raise no new scope questions; below is implemented-versus-aspiration only.

## Status of the five earlier blockers

1. **Adaptivity source, rules vs session — implemented as labelling, not yet as behaviour.** The UI notice names both sources and says "no model runs inside this workbench"; each decision shows `source` plus status plus HTTP code (`workbench-ui.js` line 32), and the session-proposal form is clearly separate. But the UI also asserts "Suggestions branch on collected evidence" as fact, while the selector that would branch is absent and `workbench.mjs` line 7 imports `chooseNext` from it, so the module does not load. The label is honest; the behavioural claim is not yet earned.
2. **Falsification / divergence / reproducibility — still gated on the selector.** The orchestrator records the evidence trace needed to check branching (source, evidenceIds, observationId), so the raw material is implemented; the tests cannot exist until `next-step.mjs` does.
3. **Capability gate outside the model — gate implemented, adversarial tests unconfirmed.** The gate is genuinely outside any model: fixed action vocabulary validated in both `action()` and `actionRecord()`, object must be discovered first, no URL/header/payload accepted, plus the server's same-origin/nonce/host/size/CSP checks. What I cannot confirm is a test proving a hostile or out-of-scope proposal is rejected and recorded.
4. **Boundary vs shared host — addressed.** The UI states plainly "The gate constrains this workbench, not every tool available to the surrounding coding-agent session," and the review form and limitations call reviewer identity an operator declaration on a shared host. This is the honest framing I asked for.
5. **Measured stopping — not implemented, but not falsely claimed.** Stopping is budget (40 actions), frontier exhaustion (inside the missing selector), and human stop/pause. The Stage-5 rolling-progress signal is absent. The UI does not claim diminishing-returns stopping, so there is no dishonesty, but the measured signal is deferred rather than met.

## Ranked concrete issues (implemented vs aspiration)

1. **The UI ships a branching claim ahead of the mechanism, and the module will not load.** `import { chooseNext } from './next-step.mjs'` has no target, so the workbench cannot start, yet `workbench.html` already tells the owner that suggestions branch on evidence. Acceptance: land `next-step.mjs` with divergence and reproducibility tests and a no-embedded-answer-IDs check; until then, state the branching as intent, not fact.
2. **Rejected proposals are not persisted, though the contract says to preserve them.** A malformed or out-of-scope session proposal throws in `step()` before any journal append, so it surfaces only as a transient UI message and leaves no durable record; `session-workbench-design.md` line 13 explicitly lists "rejected proposals" among what must be preserved. Acceptance: append a `proposal.rejected` event (reason, no target request) so the ledger retains rejections. This is the clearest implemented-versus-claimed gap in the increment.
3. **The exported report omits observation evidence that the live UI shows.** The live screen renders each decision's HTTP status and full observation JSON, which is good; but `renderWorkbenchReport` (served at `/report` and written by export) shows decisions, reviews, requests, and limits without the observations. The exported artifact is the one that survives for owner verification, so it should carry each decision's observation outcome, not only the live screen.
4. **Measured diminishing-returns stopping is deferred.** Acceptance: either implement the rolling log of genuinely new observations and distinct hypotheses from build-plan Stage 5, or state in the design that this increment relies on budget plus frontier plus human stop by choice and defers the measured signal. Right now it is silently deferred.
5. **`maxActions:40` in the manifest is dead; the budget is hard-coded at `>=40`.** A reader trusting the manifest field is misled about what controls the limit. Acceptance: drive the budget from the manifest value or drop the field.
6. **The nonce gives no protection from other local processes, consistent with the disclosed shared-host limit.** `GET /api/state` returns the nonce with only a host check, so any process that can reach the loopback port can read it and drive POSTs. This is within the stated shared-host caveat, but it is an honesty point worth making concrete: the nonce is CSRF/same-origin hygiene, not access control against co-resident sessions.

## What is honest and already holds

Source labelling, the no-arbitrary-interface gate, the shared-host framing, stop/pause semantics, crash-to-unresolved-attempt with no auto-replay, review requiring an executed decision and cited existing evidence, the "observations have not been promoted to findings" empty state, and the metrics labelled "not a security score" are all implemented and honest. The dishonesty risk is concentrated in one place: owner-facing text that describes observation-driven branching as a present fact while the selector that would produce it does not yet exist.

## Limitations of this pass

The selector is absent, so the server and orchestrator were reviewed by reading, not by running; I started nothing and contacted no target. I will re-check branching, divergence, reproducibility, and the rejected-proposal retention once `next-step.mjs` and the workbench tests are present.

---

# Final pass: selector landed, gaps resolved

Date: 2026-10-18 (fourth pass, requested by Skye). This pass verifies the current files and tests by reading, not running (Skye reports 13 selector tests and the workbench suite passing). The earlier absence findings above stay as historical record; the increment has since moved. Files read this pass: `next-step.mjs`, `test/practice-next-step.test.mjs`, the current `workbench.mjs`, `test/practice-workbench.test.mjs`, and the updated `session-workbench-design.md`, `workbench.html`, `workbench-ui.js`.

## Resolution of the pass-3 issues

1. **Branching ahead of the mechanism — RESOLVED.** `src/practice/next-step.mjs` exists, loads, and is deterministic policy logic that derives every actor/object/state only from identity-matched complete observations; no work-order answer IDs are embedded. `test/practice-next-step.test.mjs` defines 13 tests, including determinism (`chooseNext(s)` deep-equals a repeated call) and divergence (different observed records change the proposed object ID; a different observed state changes the proposed transition actor and the proposal ID). The UI's "suggestions branch on collected evidence" is now earned, not aspirational.
2. **Rejected proposals not persisted — RESOLVED.** A syntactically usable session proposal that fails semantic validation now appends a `proposal.rejected` event carrying only the reason, surfaced as `rejectedProposals` and reconstructed on replay. The workbench test asserts two rejections are journaled and that a planted field value never appears in the journal, so raw rejected fields are deliberately omitted to avoid copying secrets. Malformed transport and stale-revision commands are still refused before any journal mutation, which is the honest scope.
3. **Exported observation evidence — PARTIALLY RESOLVED, one item open.** The JSON export writes the full state including observations, and the HTML report now carries reviewer rationale, objections, and owner requests. The HTML report still omits each decision's observation outcome (HTTP status/value); the live UI shows it. Skye notes this export detail is being added. This is the single remaining item from my reviews, and it is a completeness gap in the standalone HTML artifact, not a false claim.
4. **Measured stopping — RESOLVED by honest documentation.** The design now states that this increment stops on the immutable action/request/time budgets, observed-frontier exhaustion, and owner stop, and that Stage 5's diminishing-returns signal is deferred with no claim that frontier exhaustion measures optimal effort.
5. **Dead `maxActions` field — RESOLVED.** The budget is `maxActions:52` in the manifest and the step guard reads `snapshot.manifest.maxActions`; the selector test confirms the ordinary six-record workflow exhausts within 52 actions.
6. **Nonce caveat — RESOLVED.** The design states the loopback nonce is same-origin request hygiene, not access control against other local processes, and the workbench test exercises origin, nonce, `sec-fetch-site`, host, content-type, size, and path-traversal rejection.

## On the capability gate (earlier blocker 3)

The adversarial gate tests I asked for now exist: a proposal with an arbitrary extra field is rejected and its value never stored; a proposal naming an undiscovered object returns `OBJECT_NOT_OBSERVED` with no target request; path traversal and cross-origin posts are refused. The gate is enforced in code outside any model, and it is now tested, not just read.

## Standing assessment

The honesty concern that ran through my earlier passes — owner-facing text describing observation-driven branching as present fact while the mechanism was absent — is resolved: the mechanism exists, loads, and is tested for exactly the divergence and reproducibility the claim depends on. The remaining work is the one export-detail item in point 3. I did not run the suites; this pass is a source and test read, and the pass counts are as Skye reported.

---

# Acceptance

Date: 2026-10-18 (closing note). On a final re-read, the current `workbench.mjs` renders the full observation for each decision in the exported HTML report and adds a dedicated rejected-session-proposals section; the JSON export already carried full normalized observations. That closes the one item I left open in the pass above, so point 3 there is now resolved in both export formats. (The open-item wording in the fourth pass reflects an earlier revision and is kept as history.)

With that, I find **no remaining material purpose or claim mismatch** between what the increment says to the owner and what it does. The owner-facing branching claim is backed by a deterministic selector with divergence and reproducibility tests and no embedded object answers; rejected proposals are retained safely without raw fields; stale, unauthorized, and malformed transport is refused before any journal mutation; the budget cap is sourced from the manifest; and the design is explicit that the measured diminishing-returns stop is deferred and that the loopback nonce is request hygiene, not access control.

I accept this as an honestly bounded local harness. The work correctly named as still ahead, and not claimed here, is: independent effect verification rather than same-app observation, blind evaluation with enforced role separation, an expert manual baseline, the full repair-and-retest cycle, and any live or client target. Those remain future stages, not properties of this increment. This closes my implementation review; I will look again only if the selector's branching rules or the evidence/claim boundaries change materially.
