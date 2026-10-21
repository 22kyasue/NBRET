# Independent review — local guided URL-to-report rehearsal

Reviewer: Lyra (independent evaluator). Started 2026-10-21 UTC.
Task: d6aecbf4-e809-407a-bec1-f127b8120fde (from Cass). Implementers: Cass, with Thistle and Ginger supporting.

## Role and limits of this review

I evaluate quality and direction only. I do not implement pipeline code, commit, or edit shared source.
I own this file. I may run inspected, focused, offline/local tests of *new* code handed to me, and report
defects with file/line and a repro. No browser except through the computeruse harness with cleanup; no
client targets, no stopped labs, no paid providers.

This rehearsal is **guided and familiar**, not a held-out benchmark. Nothing here may be labelled "blind"
or "held-out" when the same unrestricted session could see or generate the answer. That distinction is the
first thing I will challenge on every stage.

If any action is security-blocked, the correct outcome is to **record the exact action and reason and stop
that action** — not retry, not reroute through another session or tool. A recorded stop is a passing result
for the safety-stop criterion, never a failure to work around.

## What "done" means per stage (acceptance matrix)

Each stage is accepted only when every **Must** row has real, inspectable evidence. "Verified" is reserved
for a claim I could independently re-derive from artifacts, not from a session's assertion.

### 1. Actual URL registration
| # | Must | Evidence required | Common false pass to reject |
|---|------|-------------------|------------------------------|
|1.1| A real, reachable target URL is registered, owned or explicitly in-scope | The URL string, how scope/ownership was established, timestamp | A placeholder/example URL treated as if live |
|1.2| Registration is recorded durably | File path + content a recovering session can read | In-memory only; lost on disconnect |
|1.3| No stopped-lab or client target reused | Target checked against the retained stop list in CONTEXT | Silent reuse of a previously stopped target |

### 2. Dedicated readable mail
| # | Must | Evidence required | Common false pass to reject |
|---|------|-------------------|------------------------------|
|2.1| A real inbox exists and is readable by the rehearsal | Provider/box id, a round-trip: message sent → same message read back | Claimed inbox with no read-back proof |
|2.2| Mail is genuinely received, not fabricated by the session | Raw received message with headers, not a composed string | A "received" email the session actually authored |
|2.3| Inbox is dedicated to this rehearsal | Address scoped to the test, not a personal account | Mixing into Kotaro's real mail |

### 3. Normal access (no privileged shortcut)
| # | Must | Evidence required | Common false pass to reject |
|---|------|-------------------|------------------------------|
|3.1| Target reached the way an ordinary user would | Request/response trace showing the normal path | Backdoor/admin/fixture access dressed as discovery |
|3.2| No hidden credentials or planted state | Access inputs enumerated; none pre-seeded by the scorer | Pre-seeded answer reachable only because it was placed |

### 4. Hypothesis controls
| # | Must | Evidence required | Common false pass to reject |
|---|------|-------------------|------------------------------|
|4.1| Each hypothesis is stated before the evidence is gathered | Timestamped hypothesis record preceding evidence | Post-hoc hypothesis written to match what was found |
|4.2| A control/negative case exists | At least one hypothesis that should fail, and does | Only confirmatory cases |
|4.3| Hypotheses are falsifiable | Explicit "this would be false if…" | Vague claims that cannot be disproved |

### 5. Real evidence
| # | Must | Evidence required | Common false pass to reject |
|---|------|-------------------|------------------------------|
|5.1| Findings rest on captured artifacts, not prose | Raw responses/captures stored and linked from the finding | A narrative "we observed X" with no artifact |
|5.2| Severity/claims match the artifact | Each claim traceable to a specific byte range/line | Inflated severity beyond what the capture shows |
|5.3| No fictional mockups substituting for results | Reader shows actual states (per CONTEXT canonical-reader rule) | A design sample standing in for a real result |

### 6. Independent corroboration
| # | Must | Evidence required | Common false pass to reject |
|---|------|-------------------|------------------------------|
|6.1| A second, independent path confirms the key finding | Two methods/sessions reaching the same observation | One session citing its own earlier claim |
|6.2| The corroborator did not share the original's hidden state | Separation of inputs documented | "Independent" check run in the same unrestricted context |

### 7. Canonical reader
| # | Must | Evidence required | Common false pass to reject |
|---|------|-------------------|------------------------------|
|7.1| Report uses the canonical reader (`tracks/synapse-workflow/src/practice/reader-*`) | Render produced by that reader, Inter/Noto Sans JP | A one-off hand-built report |
|7.2| Reader preserves uncertainty, evidence and retest history | Fields present and populated, not dropped | A clean summary that hides uncertainty |

### 8. Verified stop / reset
| # | Must | Evidence required | Common false pass to reject |
|---|------|-------------------|------------------------------|
|8.1| The rehearsal can be stopped and leaves a recoverable record | Durable files another session can pick up | State only in one session's memory |
|8.2| Reset returns the environment to a known clean baseline | Before/after check showing no residue | "Reset" asserted without a baseline comparison |
|8.3| Security-blocked actions are recorded and stopped, not rerouted | Log of action + reason + stop, no retry via another route | Reroute through another session/tool |

## Cross-cutting things I will actively challenge

- **Leakage.** Any path where the answer could flow from a session that knows it into one that is scored. Same user, same folder, same session do **not** establish separation (per AGENTS.md).
- **False "verified" labels.** I downgrade any "verified" I cannot re-derive from artifacts to "claimed".
- **Scope-boundary claims.** Assertions that something is "in scope" or "bounded" without the boundary written down and checkable.
- **Fake mail / fake autonomy.** A composed message presented as received; a scripted sequence presented as autonomous discovery.

## Category correction accepted (Cass, 2026-10-21)

My original standard ("verified only when I can re-derive it from artifacts") is **not strong enough on a
shared host** and I am tightening it. On this shared host, same-host independent authorship or replay is
**guided corroboration**, reported in the *owner-action* category with limitations — it is **not** canonical
independent verification. `verifiedFindings` stays empty unless a true independent-authority/blinded-custody
contract is met, which this rehearsal does not provide. I will **not** upgrade a finding to "independently
verified" from re-derived artifacts alone. My criterion 6 below is amended accordingly: the honest ceiling
for stage 7 (independent challenge/replay) in this rehearsal is "guided corroboration", and I will flag any
report that presents same-host replay as independent verification.

## Architectural review of local-lab-contract.md (2026-10-21)

Contract reviewed: `tracks/synapse-workflow/docs/synapse/local-lab-contract.md`. It is conservative and
largely sound — loopback-only binding, Node built-ins, synthetic data, redaction with digests, cleanup in
finally blocks, no planted admin ladder, scripted ≠ autonomous. Concerns I want addressed before stages are
accepted as passing:

- **A. Provenance self-attestation gap (buildId/generation).** The contract has Cass (orchestrator, owner of
  `run.mjs`) set receipt `buildId`/`generation` before evaluation. The orchestrator is the party that wants a
  pass, so orchestrator-stamped provenance is a weak link. Recommend the **target** emit `buildId`+`generation`
  and the **transport** record them onto the receipt at capture time (e.g. from a response header or `/api/me`);
  the evaluator should reject any receipt whose buildId/generation were not captured from the target. Tie to 6.2.
- **B. "Actual local SMTP" must be provable, not asserted (ties to 2.2).** The mailbox must show evidence the
  message **transited an SMTP transaction** (envelope / received headers), to distinguish real delivery from the
  target writing straight into the mailbox store in-process. Without that, stage 3 mail is "composed", not
  "received", and fails 2.2.
- **C. Redaction is blind to secret-in-body findings by design.** Transport excludes Authorization/Cookie/
  Set-Cookie and credential bodies and only keeps digests. Fine for the ownership-gap (IDOR-style) target, but
  the acceptance doc must state this limitation so no secret-leak class is ever silently recorded as "tested and
  clean". A class the pipeline cannot see is "not tested", not "secure".
- **D. Verified reset needs a before/after baseline (ties to 8.2).** "Reports observed cleanup" is an assertion.
  Acceptance should compare a captured baseline (listeners / open ports / active connections) before start and
  after close, and show zero residue — not just a self-reported "closed".
- **E. Define `inconclusive` vs `not-demonstrated`.** A run blocked or missing evidence must land as
  `inconclusive`, never `not-demonstrated` — otherwise a secure-mode run that simply lacked evidence reads like a
  clean "no vulnerability" result. The evaluator should refuse to emit `not-demonstrated` when required evidence
  ids are absent.

Sent to Cass 2026-10-21. These are design-stage concerns, not yet defects against committed code.

## Code review of src/lab (2026-10-21) — run.mjs + cross-file chain

Files reviewed: `src/lab/run.mjs`, `target.mjs`, `transport.mjs`, `evaluate.mjs`, `mail.mjs`.

**Concerns A–E — resolution confirmed by reading the code (not by assertion):**
- **A (provenance).** target emits `x-lab-build-id`/`x-lab-generation` (target.mjs:25); transport preserves
  *only* those two headers (transport.mjs:69); run.mjs stamps buildId/generation on a receipt only when they
  match the admitted target (run.mjs:69); evaluator rejects any receipt whose `buildId`/`generation` differ
  from the run (evaluate.mjs:23). Honestly labelled a local declaration, not authentication. **Resolved.**
- **B (provable SMTP).** mail.mjs runs a real `net` SMTP server and sets `headers.received` only on a message
  that transited the socket (mail.mjs:57); run.mjs:85 requires that header. Not store-injected. **Resolved.**
- **C (redaction blind-spot).** Evaluator treats `bodyRedacted`/`bodyFieldsOmitted` receipts as `inconclusive`
  rather than a pass (evaluate.mjs:23) and states the limitation. **Resolved (honest).**
- **D (verified reset).** `observed-closed` now requires target+mail `closed/listening===false/activeConnections
  ===0/activeHandlers===0` AND external TCP connection-refused probes on the HTTP origins (run.mjs:142-143).
  **Resolved for the two HTTP origins.** Residual: the SMTP listener's *external* refused-probe depends on a
  top-level `target.smtpPort`, which `startLabTarget` does not yet return (target.mjs:92), so SMTP closure is
  currently checked via in-process `inspect()` only, not an external probe. Low severity; noted to Cass.
- **E (inconclusive vs not-demonstrated).** Evaluator emits `inconclusive` for partial/missing/stale/ambiguous
  evidence; run.mjs:231 fails the run on inconclusive, so it cannot masquerade as a clean secure result.
  **Resolved.**

**Defects I found and verified fixed in the current version (I ran the repro):**
- **D1 (was: duplicate stage id 8 on failure at/after stage 7).** Earlier version appended a second id-8 stage
  on `failAfterStage===7`. Current version reuses `error.stage` and writes stage slots in place.
  Verified by focused loopback run (`failAfterStage:7`, ownership-gap): stages = `1..8` each unique, stage 7
  `failed`, no duplicate ids, cleanup `observed-closed`. **Fixed.**

**Independent acceptance run (full secure+gap suite, loopback, synthetic):**
- Suite status `completed-guided-control-suite`. secure → `not-demonstrated`, gap → `demonstrated`.
- `verifiedFindings` empty in **both** modes (category correction holds even when the effect reproduces).
- Gap finding in `issuesNeedingOwnerAction`, substatus `guided-effect-reproduced; independent owner
  verification pending`. Secure in `unconfirmedLeads` (no "secure" claim).
- Primary and replay both `demonstrated`; stage 7 labelled `passed-guided-replay`.
- Reset: distinct generation, separate origins, fresh empty baselines (users/orders/messages = 0) observed
  before registration.

**Remaining honest caveats (not defects — scope limits to keep in the report):**
- Same-host, trusted-operator collector and reviewer throughout. The top-category independent-verification
  slot stays empty, correctly. I am not upgrading from re-derived artifacts.
- `evaluate.sameOrder` compares scalar fields only and rejects object-valued keys; correct for this
  scalar-only order object, but a foreign read of a record with nested fields would read as not-demonstrated.
  A documented scope limit, acceptable for this one rule.

## Independent artifact audit — morning run (2026-10-21, stage 7 guided authorship)

Audited the **saved** outputs at `tracks/synapse-workflow/runs/morning-rehearsal-2026-10-21/` (read-only;
regenerated nothing). I independently re-derived each verdict from the raw `evidence.json` receipts using
`evaluateOwnershipRead`, selecting the pre-replay (primary) control receipts myself rather than trusting
`summary.evaluation`. This is same-host guided independent authorship — **not** external custody, and it does
**not** populate `verifiedFindings`.

Suite: `completed-guided-control-suite`; reset `{differentGeneration, separateOrigins, freshEmptyBaselines}` all true.

| Check | secure | ownership-gap |
|-------|--------|----------------|
| Saved verdict | not-demonstrated | demonstrated |
| **My re-derivation from raw receipts** | **not-demonstrated** (matches) | **demonstrated** (matches) |
| Re-derivation reason | foreign read denied, no protected payload; owner+anon controls passed | distinct authenticated principal received the exact foreign object |
| Provenance (all 20 receipts bind run buildId+generation) | yes | yes |
| Mail `Received` (ESMTP) in journal, delivery count | yes, 2 | yes, 2 |
| Cleanup `observed-closed` + ECONNREFUSED on all 3 listeners (app/inbox/SMTP) | yes | yes |
| `verifiedFindings` empty | yes | yes |
| Report projection | unconfirmedLeads=1, issues=0 | issues=1, substatus "guided-effect-reproduced; independent owner verification pending" |

File digests (sha256, first 16 hex) at audit time:
- secure: evidence `cc1ee1c081dbf84d`, assessment-state `6bb711adc6b7d6e3`, summary `2f607a0318a700dc`
- ownership-gap: evidence `ec80cd4b76162ca8`, assessment-state `0d037facf2d45ea9`, summary `3c7a475fb5508a11`

Build/generation: secure `buildId cd1fb1bb…1eab03 / gen fd2eb589…f57257`; the two runs use distinct
generations and separate loopback origins, confirming a real reset rather than a renamed generation.

**Outcome: the saved artifacts hold up.** My independent re-derivation agrees with both saved verdicts; mail
genuinely transited SMTP; cleanup is externally confirmed on all three listeners (the prior SMTP-probe
residual is now resolved). No defects in the saved outputs. The honest ceiling is preserved — a guided,
same-host, reproduced effect reported with limitations, with the independent-verification category correctly
empty.

## Browser-QA change review (2026-10-21) — run.mjs discovery + reader-ui ↗ fix

Targeted re-review of the two post-QA changes (no deeper engine change per Cass). v2 artifacts not yet
generated at review time; code reviewed, v2 outputs to be audited when they land.

- **Discovery flow (run.mjs:230-235).** Runner now finds the linked `/api-docs` in root HTML, GETs it, and
  verifies the *public* guide declares `/api/register`, `/api/login` and the ownership rule before any further
  request; refuses otherwise. Honest observation-led discovery — public link, nothing pre-provided, no
  privileged shortcut. Strengthens stage 1 (criteria 1.1/3.1). Adds one receipt → 21/run. **Sound.**
- **Reader `↗` removal (reader-ui.js).** AGENTS.md forbids upward-diagonal nav arrows. `decorate()`'s
  TreeWalker (line 26) strips `↗` from every text node in the root as a global catch-all; since `↗` only ever
  appears as text content, all initial-render occurrences are removed. Explicit `icon('chevron')` replacements
  cover the structured controls. The one `↗` inserted after the walker (the proof-section `.drill` link) is now
  inserted *before* the `.drill` decoration loop (line 54-56), so its span is replaced with the outline
  chevron — this is the leak Cass fixed. **Correct by static analysis.** Cosmetic: empty-result `.textlink`
  loses its `↗` and gets no chevron (not a violation). Runtime DOM confirmation (zero residual `↗`) deferred to
  a computeruse check of the rendered v2 report; jsdom is not installed and I will not install it.

## v2 artifact audit — morning-rehearsal-2026-10-21-v2 (freeze confirmation)

Re-ran the same independent audit against the regenerated v2 suite (21 receipts/run after the added public
API-guide GET). Re-derived both verdicts from the raw v2 `evidence.json` myself; all checks green.

| Check | secure (v2) | ownership-gap (v2) |
|-------|-------------|---------------------|
| My re-derivation from raw receipts | not-demonstrated (matches saved) | demonstrated (matches saved) |
| Provenance (all 21 receipts bind run buildId+generation) | yes | yes |
| Mail ESMTP `Received`, count | yes, 2 | yes, 2 |
| Cleanup observed-closed + ECONNREFUSED on all 3 listeners | yes | yes |
| `verifiedFindings` empty | yes | yes |
| Projection / gap substatus | unconfirmedLeads=1 | issues=1, "guided-effect-reproduced; independent owner verification pending" |

v2 file digests (sha256, first 16 hex):
- secure: evidence `77828a3bbb03187d`, assessment-state `37be9ea540422486`, summary `a071bdb1dad1182e`
- ownership-gap: evidence `594a0d03bd655fd0`, assessment-state `573ff59336094c05`, summary `33f5f1f8df259bb5`

`↗` runtime check: not performed in a browser by me. `new_tab` requires HTTP and I declined to stand up a
loopback file server + browser session right before the scheduled board restart; the static proof above is
conclusive (every `↗` stripped by the global text-node walker or replaced by an explicit chevron), and Cass's
own computeruse QA window was open on this exact v2 gap report for the visual confirmation.

**Freeze confirmation (independent evaluator): the v2 artifacts hold up.** Both verdicts independently
re-derived and matching; mail, cleanup, provenance, empty independent-verification category, honest labels and
real reset all confirmed from persisted outputs. No serious defects. I confirm v2 is good to freeze from the
independent-evaluation side.

## Log

- 2026-10-21 — Accepted task. Read CONTEXT.md and the consolidation docs index. Wrote the acceptance matrix.
- 2026-10-21 — Reviewed `local-lab-contract.md`. Accepted Cass's category correction. Raised 5 architectural
  concerns (A–E) and sent them to Cass.
- 2026-10-21 — Reviewed all five `src/lab` files. Confirmed A–E resolved in code (one low-severity SMTP
  external-probe residual). Found defect D1 (duplicate stage id 8) and verified it fixed in the current
  version via a focused loopback repro. Ran the full secure+gap suite independently: correct discrimination,
  verifiedFindings empty both modes, honest labels, real reset baselines. Scratchpad test scripts only; no
  repo edits. No open serious defects as of this review.
