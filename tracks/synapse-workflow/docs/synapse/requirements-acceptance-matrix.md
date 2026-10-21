# Synapse requirements acceptance matrix

Aiko. Originally written 2026-10-18 (task fe684fd2); **updated 2026-10-18 after integration (task 105cf77e)**. This maps **every** requirement in [discovery-decisions.md](discovery-decisions.md) to its current state, so that "we finished what we agreed" is said only where it is true and the genuinely unbuilt or unbuildable parts are named rather than averaged away.

This is a product/process acceptance review, not new research and not a measured discovery result. Method: source inspection of the current tree plus first-hand runs of the focused suite. My existing purpose review ([adaptive-loop-purpose-review-aiko.md](adaptive-loop-purpose-review-aiko.md)) stands unchanged; this is a separate file.

**Test-run audit (facts preserved, newest first):**
- **2026-10-18, integrated:** `npm run synapse:acceptance` (= `synapse:test`, 17 files) → **114 passed, 0 failed, 0 skipped** on this PC. Covers intake/tracks, session CLI, casebook lifecycle, checkpoint/resume, measurement, workflow end-to-end, plus the prior journal/lifecycle/gate/generation-race/cleanup regressions.
- *During integration* I reproduced one transient failure in `practice-workflow.test.mjs` (a measurement/export record reached the journal carrying a non-serializable value — `Journal: plain serializable JSON required`). It was fixed in the same integration window by the owners; my repro no longer throws and the suite is green. Recorded here as an audit fact, not an open blocker.
- **2026-10-18, pre-integration (historical):** `npm run synapse:test` (12 files) → **80 passed, 0 failed, 0 skipped**. This remains the historical workbench audit; it is not erased by the newer run.

## How to read the status column

| Code | Meaning |
| --- | --- |
| **BUILT** | Local engineering exists and is exercised by a passing focused test or a runnable local command. Accept now. |
| **PARTIAL** | Some of the agreed local engineering exists; a concrete, buildable-on-this-PC piece is still missing. Named in the gap. |
| **DEFERRED** | Explicitly a later plan stage in [build-plan.md](build-plan.md). Not a defect; must not be reported as done. |
| **EXTERNAL** | Depends on a human or physical prerequisite that **cannot be fabricated in code** — an isolated OS account/machine, a human custodian, a human expert, a real scope grant, another PC, a real client app or market. Software completeness never discharges these. |

**The overclaim guard.** Six things in this engagement cannot be produced by writing more code on this shared account, and no passing test should be read as evidence for any of them:

1. **True independent reviewer / access isolation** — same unrestricted Windows user; reviewer identity is a *declared string*, not an authenticated or sandboxed boundary. EXTERNAL.
2. **Blind answer-key custody** — a hidden key on the same account is readable by every session here. Needs a separately controlled account/machine. EXTERNAL.
3. **Manual expert baseline** — requires a nominated competent human operator working a matched task. A second model is not a manual baseline. EXTERNAL.
4. **Live production scope** — no live-target authorization exists; this discussion did not grant one. EXTERNAL.
5. **Other-PC engine inspection** — the KrisPC report found no engine within its inspected scope; absence elsewhere is unproven and needs the other machine. EXTERNAL.
6. **Client-replica fidelity, market demand, pricing, exhaustive coverage** — synthetic performance cannot establish any of these. EXTERNAL.

Everything marked BUILT below is engineering coverage of a synthetic owned app. None of it is a discovery-effectiveness, security, or client-readiness claim. The integrated end-to-end example Skye retained (`runs/complete-workflow-*/acceptance-summary.json` with technical + executive reports) shows exactly this honest shape: gate rejection and pass retained, review explicitly scripted (not independent), owner verification inconclusive (no Kotaro verification), same-build/reused retest remaining incomplete, no real baseline so comparison is descriptive — **1 unconfirmed case, 0 verified, target closed.**

---

## 1. Intended outcome

| Requirement (discovery-decisions.md) | Status | Evidence / gap |
| --- | --- | --- |
| Resumable workflow operated through a coding-agent session | **BUILT** (synthetic) | Default `--resume` is record-only continuation (cases/reviews/verification/effort/reports advance, no target); `--resume-target` restarts only a clean-stopped checkpoint with matching code + valid digest + unexpired scope + remaining budget, fresh credentials/epoch, carried-forward counters (`workbench.mjs` resume path, `src/practice/session-cli.mjs`; `practice-checkpoint.test.mjs`, `practice-workflow.test.mjs` resume cases). Old stop never silently undone. |
| Investigate one business web app at a time, from a URL + optional context | **BUILT** (synthetic) | Intake binds target origin + optional context/businessRules as inert records (`src/investigation/intake.mjs`, `src/practice/intake-cli.mjs`); executor stays the owned synthetic app. |
| Explore features/data/identities/workflows before prioritizing | **BUILT** (synthetic) | Deterministic observation-driven selector (`next-step.mjs`; `practice-next-step.test.mjs`). |
| Combine independent discovery with client-described rules; missing context stays explicit → follow-up questions | **BUILT** (synthetic) | `businessRules` captured as owner-declared (not inferred); owner-request/omission ledger derived and preserved across stop/reopen; request record/resolve (`workbench.mjs`; workflow scope test). |
| Outside access primary; unauth and supplied-account as separate tracks | **BUILT** (synthetic) | `tracks: anonymous|accounts|both`, `permitTransitions` narrows to reads; config cannot widen (`intake.mjs`, scope normaliser; "immutable scope" workflow test). |
| Source/configuration-assisted mode as eventual complement | **DEFERRED** | Later direction (Stage 3+). Not built. |
| Broader stack coverage = long-term direction, not a v1 completeness claim | **BUILT (stated limit)** | Disclaimed in `LOCAL-WORKFLOW.md`, `SESSION-WORKBENCH.md`. |

## 2. Adaptive investigation and human control

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Improve hypothesis selection within one investigation first | **BUILT (synthetic) / across-run DEFERRED** | Session-authored proposals via `/api/step --file` and session CLI, plus deterministic default rules (`session-cli.mjs`, `next-step.mjs`). Cross-investigation learning and automatic self-modification remain explicitly later. |
| Cross-investigation learning later; no self-change of permissions/eval rules in v1 | **BUILT** | Immutable scope; config/resolution/requests never widen permissions; proposals gate-validated (scope tests). |
| Autonomous work + conversational steering; answers from saved records | **BUILT** (synthetic) | Continue-frontier, pause/resume, priority, decision ledger from saved observations; session `brief`/`state` (`workbench.mjs`, `session-cli.mjs`). |
| One initial approval of target/accounts/activity/evidence/budget/stop; out-of-bounds needs approval | **BUILT** (synthetic) | Structured local authorization record binds origin, actors, effects, evidence limits, budgets, stop conditions; immutable (`intake.mjs`; config example in `LOCAL-WORKFLOW.md`). This closes my earlier "first-class intake record" gap. |
| URL-only input does not establish authorization | **BUILT** | Intake rejects credentials/query/fragment; `executionAuthority: none`; blind-requested stays pending custody (`intake.mjs`; workflow intake test asserts `/none/`). |
| Blocked branch recorded while others continue; consolidate pending; escalate urgent | **BUILT** (synthetic) | Rejected proposals/gates retained; owner requests consolidated; `note {kind:escalation}` records declared escalations (`workbench.mjs recordNote`). |
| Configurable stopping; diminishing-returns main signal under hard ceiling; exhaust alternatives; no vuln required | **BUILT (synthetic, heuristic) / was DEFERRED** | `progressSummary` scores semantic novelty (ignores new IDs/timestamps/confidence/paraphrase), configurable `windowSize/windows/minUseful`, pauses only after eligible frontier exhausted (`measurement.mjs`; `investigation-measurement.test.mjs`). **Honesty caveat kept:** thresholds are calibration heuristics, *not* a research-validated optimal-stopping claim. |

## 3. Evidence, review and outputs

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Initial evidence check before independent review; retain rejection reasons | **BUILT** | Gate requires complete identity/build-matched receipts + distinct successful positive controls; rejections retained (`casebook.mjs` `evidence.filtered`; casebook + workflow tests). |
| Agent agreement is not proof; independent confirmation must establish actual effect | **BUILT (enforced honesty) / EXTERNAL (real independence)** | `supported` review needs complete matched evidence + a distinct declared producer; **verifiedFindings category is structurally always empty** on this shared host (`casebook.mjs summarizeCasebook`; `LOCAL-WORKFLOW.md` states it explicitly). Real independent effect is EXTERNAL. |
| Kotaro's verification a separate recorded step | **BUILT** | `owner.verified` (reproduced/not-reproduced/inconclusive), now bound to gate+review so a newer gate or superseding review invalidates prior owner status while keeping history — the stale-owner bug I reproduced is fixed (`casebook.mjs:91,120`; confirmed by me and by Bryn's regression). |
| Three separated output categories + preserved objections/uncertainty | **BUILT** | verified (empty) / issues-needing-owner-action / unconfirmed-with-rejections; objections retained (`casebook.mjs`, `src/practice/workflow-report.mjs`). |
| Each material finding: weakness/identity/evidence/demonstrated + potential consequence/uncertainty/repair/independent-verification instructions | **BUILT (as declared records)** | Candidate carries expected, observed, demonstratedConsequence, potentialConsequences, uncertainties, suggestedRepair, manualVerification, impactType (`casebook.mjs candidate.created`; `LOCAL-WORKFLOW.md` template). Strength is bounded by the synthetic/declared evidence behind it. |
| Damage coverage (exposure/actions/disruption/reach/availability/resource); no financial-loss requirement; disruptive only in owned isolated env | **BUILT (stated limit)** | `impactType` enumerates the categories without adding execution capability; availability limited to owned app; no financial model. |
| Recommend repairs, don't modify client apps; after fixes independently reassess original + related + legitimate cases | **BUILT (admission engine) / EXTERNAL (real repair evidence)** | `retest.planned`/`retest.recorded` + `attach-evidence` from a clean-stopped run: requires changed build, one consistent environment, distinct chronological matches for every original/related/legitimate receipt; same build / reused / mixed / changed-semantics stay incomplete; **never infers a fix** (`casebook.mjs`; retest workflow tests). This closes my earlier #1 gap as *engineering*; a genuine changed-build repair is still EXTERNAL input. |
| No review dashboard required initially; written instructions + artifacts sufficient | **BUILT** | Self-contained technical + executive reports and JSON (`workflow-report.mjs`, workbench export). |

## 4. Environments and evaluation

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Support eventual live + isolated; isolation alone can't establish production behavior | **BUILT (stated limit)** | Disclaimed throughout; only synthetic owned app built. |
| First build/evaluate on an owned synthetic app | **BUILT** | `src/practice/app.mjs`; practice-app tests. |
| tobirastudio.com a subsequent candidate, not approved scope | **EXTERNAL / DEFERRED** | build-plan Stage 6; no current grant. |
| Preparation vs investigation in separate sessions with **actual access separation**; hidden key; no prep answers/source to investigator/reviewer | **EXTERNAL** | Cannot be fabricated on one unrestricted account; intake `blind-requested` stays pending protected custody + verified separation (`LOCAL-WORKFLOW.md`, `evaluation-admission-contract.md`, Elm blocker 3). |
| Realistic legitimate + clean cases; don't disclose count/presence of weaknesses | **BUILT** (synthetic) | Legitimate flows + positive controls; no planted-vuln disclosure. |
| Freeze target + scoring before eval; independently adjudicate unexpected findings; unseen evals later | **BUILT (record/arithmetic) / EXTERNAL (integrity)** | `compareRuns` requires a frozen protocol; `validateIteration` records held-out *plan* as inert proposal only. Freeze integrity, adjudication and held-out execution are EXTERNAL. |
| Evaluate findings/misses, surviving false claims, damage accuracy, reproduction, total time incl. review; compare to manual baseline | **BUILT (conditional arithmetic) / EXTERNAL (baseline + admission)** | `compareRuns` computes a *conditional* pass/fail, canonicalises arithmetic, and returns `superiorityEstablished:false`, `admission: externally-asserted-unverified`; `effort` summary labels unreported labor unknown (`measurement.mjs`; measurement + workflow tests). **A real expert baseline and authenticated admission are EXTERNAL;** no superiority claim follows. |
| Synthetic ≠ client/market/pricing/coverage; real app w/o complete key can't establish recall | **BUILT (stated limit)** | Explicit in reports, `measurement.mjs` limitations, and this guard. |
| Rejected-candidate sample audit with frozen population/seed | **BUILT** | `sampleRejected` (SHA-256 seeded, reproducible, retains denominator) + `rejectionAudit` CLI; labeled "not a false-negative-rate estimate" (`measurement.mjs`; workflow seeded-audit test). Independent adjudication of sampled rejects remains EXTERNAL. |

## 5. Teaching and resources

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Two eval modes: blind scored vs guided learning | **BUILT (mode plumbing) / EXTERNAL (blind integrity)** | `requestedMode: guided|blind-requested` captured; blind stays pending custody/separation. Running a true blind scored mode is blocked by the EXTERNAL key-custody boundary. |
| Teach at milestones; grounded in observed evidence; never reveal answers / present hypotheses as fact | **BUILT (basic)** | `note {kind:teaching}` requires complete cited evidence (rejects absent evidence), graded "not automatically graded"; internal teaching kept separate from reports (`workbench.mjs recordNote`; workflow teaching test). This closes my earlier teaching gap at a basic level; richer teach-back scoring remains later. |
| Use existing subscriptions; no new fees/APIs; inventory before choosing tech | **BUILT** | Runs on installed Node only; no external sign-in/API/paid dep; Stage 0 inventory. |

## 6. Existing implementation inventory & handoff

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Treat existing CLI/evidence slice as reuse candidates needing source inspection | **BUILT** | Inventoried read-only; new modules are purpose-built, not claimed as the legacy integrated system. |
| Don't assume one identity-path fix covers all; legacy `src/checks.mjs` identity-agnostic | **BUILT (caution honored)** | New casebook/journal enforce identity/environment matching; legacy matcher kept out of the accepted route (Elm blocker 5). |
| Engine "not found in inspected scope" ≠ proven absent; keep wording conditional | **EXTERNAL** | Other-PC inspection outstanding. |

## 7. First milestone & improvement program

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Workflow acceptance as first milestone even if discovery quality is initially weak | **BUILT** | Full local cycle passes engineering acceptance (114 tests) with discovery quality explicitly unmeasured. |
| Separate workflow operation from measured discovery quality; classify misses/false-claims by stage; freeze comparisons; validate on unseen | **BUILT (record/plumbing) / EXTERNAL (measured result)** | `iteration` records failureStage, versions, protocol, regression limits, rollback criterion, held-out plan as inert proposal; `progressSummary.failures` classifies by stage. A measured improvement needs the EXTERNAL baseline + protected held-out run. |
| Local foundation authorized 2026-10-18 (Bryn/Elm build, Skye architecture); no fees/purchases/production/live-target | **BUILT (honored)** | Work stayed local, synthetic, offline. |

---

## Ranked remaining items

**Local engineering — materially complete.** My earlier top gaps (matched repair→retest, active resume, first-class intake, session-authored hypotheses, rejection-sample tooling, teaching, measurement harness) are now BUILT and exercised by the 114-test suite. Remaining local refinements, not blockers:

1. **Teach-back scoring** beyond "not automatically graded" (a measured teach-back/independent-reproduction check) — later.
2. **Diminishing-returns thresholds** are unvalidated calibration parameters; they need local trial data to set, and must never be presented as an optimal-stopping result.
3. **Broader session-authored hypothesis practice** across more of the app surface (depth, not a missing mechanism).

**External / physical prerequisites that code cannot satisfy (must stay named, never marked done):**

A. Independent reviewer with enforced access isolation (separate OS account/machine).
B. Blind answer-key custody outside every session's reach.
C. Nominated human expert manual baseline.
D. A real live-target scope grant (Stage 6 only).
E. Other-PC engine/BUSINESS-ALIGNMENT inspection.
F. Client-replica fidelity, market demand, pricing, exhaustive-coverage evidence.

**Later-stage by discovery (not current scope):** broader stack coverage; automatic across-investigation software self-modification.

## Acceptance

**Accept now:** the complete local, session-operated workflow as an honestly bounded **synthetic** harness — intake and immutable scope, anonymous/accounts/both tracks, session-authored and rules-driven steps, evidence gate with retained rejections, distinct-label review, operator-only owner verification (gate+review bound), damage/repair/manual-verification records, matched retest admission that never infers a fix, three output categories with an always-empty verified section, owner-request resolution that never widens permissions, record-only resume plus scoped owned resume-target, configurable semantic-progress stopping, effort/comparison/iteration/rejection-audit/teach-back records, and technical + executive reports. Verified first-hand: 114 focused tests pass, 0 failed, 0 skipped; the integrated end-to-end example produced 1 unconfirmed case, 0 verified, target closed.

**Do not accept as done, and do not let any "all built" summary imply:** independent-effect verification, blind scored evaluation, a manual-baseline superiority claim, an authenticated scorer admission, measured/validated stopping optima, or any live/client/market claim. Items A–F are external prerequisites that remain open by nature, not by omission; the three local refinements above are depth, not missing mechanism.

This matrix reflects the tree and the 114-test acceptance as of 2026-10-18. Re-run it if the casebook/measurement/resume contracts or the evidence/claim boundaries change materially.
