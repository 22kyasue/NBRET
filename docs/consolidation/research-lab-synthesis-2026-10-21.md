# Research-lab direction: three repositories and our existing decisions

Cass integrating Thistle and Ginger, 2026-10-21. This is source-grounded design synthesis, not a runtime comparison, target assessment or implemented new platform. [Current decisions](decision-reconciliation-2026-10-21.md) resolve the prior interview; [detailed studies](../../tracks/synapse-workflow/docs/research/security-landscape/repository-reviews-20261021/README.md) preserve exact source pins and limitations.

Later sequencing revision: after Kotaro asked for a deeper rethink, Cass, Thistle and Ginger recommended a minimal recorded operational URL-to-report slice before generalizing the experiment schema. Kotaro then authorized implementing all eight stages locally. That guided rehearsal is now implemented and exercised; see the [overnight handoff](overnight-handoff-2026-10-21.md). The contract-first proposal below is historical, not the current next build instruction. The broad lab vision and controlled-comparison requirements remain applicable.

## The product direction is already clear

Build a reusable security research lab. Humans and agents can propose hypotheses, choose or generate a suitable experiment environment, investigate within an admitted boundary, collect evidence, challenge conclusions, and retain what was learned. E-commerce/URL-only self-registration is an initial scenario, not the permanent platform schema. The agent may author new test helpers in the lab; it does not silently rewrite the platform, scorer or permissions.

Existing October 18 decisions already establish autonomous scoped work, steering, evidence-based findings, review/retest, learning versus blind separation, stopping and measured improvement. Recent answers clarify tool selection/discovery improvement, level-3 submissions, dedicated inbox, supplied/generated targets and the wider lab. There is no need for another questionnaire about whether those features are wanted.

## What each repository contributes

| Source | What it actually supplies | What we can borrow | What it does not settle |
| --- | --- | --- | --- |
| Cloudflare `security-audit-skill` | Source-first audit instructions, question/domain companions, coverage/review procedure, finding schema and two record validators. | Trust-boundary reasoning; strongest-counterexample review; coverage/omission tracking; explicit blockers; source-aware reruns; well-defined artifact states. | URL-only registration/browser access, sandbox/promotion implementation, authentic effect evidence, a complete independent scorer or proven discovery accuracy. |
| `Awesome-Hacking` | A five-file resource directory with 81 links/descriptions and discussion-maintenance automation. | A provenance-preserving candidate knowledge index; routes to methods, learning material and possible environment patterns. | Installed/admitted tools, child source quality/versions/licenses, runtime integration, coverage or safety of listed methods. |
| Karpathy `autoresearch` | A single-GPU ML-training experiment governed by an external agent prompt, editable candidate code, repeated validation metric and keep/discard ledger. | Baseline first; small versioned candidate workspace; bounded comparative trials; retain hypotheses, changes and outcomes; iterate based on evidence. | Security targets, account/inbox flows, effect oracles, independently enforced scoring/custody, complete failure retention or a multi-agent security platform. |

These are complementary responsibilities. Installing all three would not produce the lab. The valuable work is connecting their best ideas to the journal, casebook, measurement, evidence admission, collectors and approved reader already here.

## One experiment, with separate sources of authority

Proposed flow:

`Question → hypothesis/version → admitted run contract → target/reset + access setup → bounded investigator/helpers → retained observations → independent effect/review → result/learning record → next candidate`

The experiment record, target preparation, investigator and evaluator must remain different authorities. A record can name all four without proving access separation. Scope is enforced by the actual runtime; truth is established by appropriate effects/controls; the report only presents admitted results. A successful schema validator, model agreement, a completed process and a finding headline are not interchangeable with those facts.

Target, method and platform hypotheses need separate conclusions:

- **Target:** did a specified rule fail for this identity/object/state, with actual consequence?
- **Method:** did a candidate strategy/helper improve useful confirmed results, mistakes, effort or coverage over a matched baseline?
- **Platform:** did an orchestration/evidence change improve engineering behavior without breaking contracts, authority or existing capability?

## Important transfer corrections

### Cloudflare review is useful, but source access changes the experiment

The method requires local source paths/lines and expressly limits checks to source/isolated local validation. Its phases include reconnaissance, planning/hunting waves, critics, candidate verification, final verification and reporting. Fresh reviewers and explicit unresolved blockers are useful process separation, not proof of hidden-key isolation or independently observed deployed behavior.

The validators check record shape and internal declared semantics. They do not read the target source, open listed effect artifacts, cross-check all run/report files, authenticate reviewers or implement the prescribed sandbox/artifact-promotion system. An upstream `confirmed` label must enter our system as an upstream claim with evidence, not automatically populate our independently verified category.

Use its source-audit arm only when source is actually in scope. For URL-only work, adapt the question/refutation/coverage discipline and retain browser/API observations instead of pretending source line requirements were satisfied.

### The awesome list is an intake queue, not know-how by itself

We extracted all 81 rows with pinned source references, explicit child-unreviewed status and planning labels. A candidate resource can progress from catalogued to source-reviewed to evaluated/admitted. Preserve rejected/stale methods and source history too. A listed lab's setup script is not an instruction to run it. Public exercise exposure is useful for guided learning but must be recorded before claiming unseen performance.

### Autoresearch's editable candidate cannot also be our judge

Native autoresearch asks the agent to leave `prepare.py` fixed and improve `train.py`. The evaluator still calls the editable model's returned loss and editable `train.py` prints the score. The fixed-file rule and timeout/disallowed-edit conditions are prompt requirements, not supplied OS enforcement. This is a trust boundary in the transfer, not an accusation about any upstream experiment.

For security, keep the scorer, protected expected outcomes, target rules and run authority outside the candidate helper's write/read privileges as appropriate. Admit rule-specific effect checks with wrong-identity/object, missing/stale/partial, no-action and quoted-success controls. Account creation/setup failure is an access result, not a clean security pass.

Do not optimize raw finding count or a model's confidence. Preserve a vector of unique adjudicated findings, false/inconclusive claims, known eligible misses, evidence/reproduction, scope deviations and total labor/resources. Keep development, familiar regression and restricted held-out populations separate.

Retain every candidate diff/full version, original output, failed run and disposition in our durable journal. Autoresearch's overwritten `run.log`, untracked TSV and reset branch are too weak as the only long-lived security evidence. Its nominal five-minute training budget excludes overhead/warmup/evaluation and is not a lab-wide process deadline. Use enforced per-run budgets; no strict project calendar is being imposed on Kotaro.

## Reuse existing code before creating a second foundation

| Responsibility | Existing asset | Proposed increment / unresolved evidence |
| --- | --- | --- |
| Durable experiment history | `tracks/synapse-workflow/src/investigation/journal.mjs`, records and local input | Add typed experiment/method/candidate-version records rather than replacing history with mutable score files. Verify current contracts first. |
| Claim/admission/review | Casebook, proof, structural evidence reviewer and assessment import | Preserve raw external status, evidence, identity/build, failed/incomplete/stale state; add effect-specific oracles as admitted capabilities. |
| Observation | Both capture tracks, identity-aware API assessment, owned-app target adapter | Select one needed adapter contract; no blind merge of conflicting modules and no assumption of general live execution. |
| Strategy/helper workspace | Existing session-authored proposals and installed coding sessions | Bounded candidate artifacts, declared tool dependencies and a reviewed execution path. Helper output does not certify truth. |
| Targets and access | Ordinary practice app/rehearsal, prior boundary inventory | Supplied/generated target-provider interface, reset receipts, self-registration and dedicated inbox adapter; protected preparer/custody remains unverified. |
| Measurement | Existing semantic progress/effort/comparison/rejection sampling module | Real total-time/assistance/failure observations, admitted scoring population and held-out promotion rules. |
| Knowledge | Research register/corrections/hazards, teaching material and new source catalog | Versioned method cards linking hypothesis, access, controls, effect check, prior results and contraindications. Do not inflate catalog rows into validated findings. |
| Presentation | Canonical Synapse reader | Keep existing layout and evidence categories; add experiment context only through a reviewed read-only projection. |

## Concrete next build slice

The next reversible slice should be a **data-only experiment/method contract connected to the existing journal**, with a worked openly guided example. Specify hypothesis, predicted/disconfirming observations, target/access/version, candidate helper/strategy revision, fixed evaluator reference, limits, artifact references, failure/unknown states, review and keep/reject rationale. Reference protected information opaquely; do not create it inside the investigator workspace.

This slice can establish records/recovery/provenance and reporting without launching an unrestricted agent, a VM, a scanner or a hidden vulnerable target. Separately verify an actual runtime/custody/inbox path before the first autonomous execution. Then admit one actual effect family and compare baseline/candidate strategies under matched URL-only starting conditions. Generated target scenarios and self-written helpers expand through that contract rather than widening permissions implicitly.

This is a proposed implementation order, not a claim that the architecture is settled or that this task built it. An alternative is immediate guided practice using the existing known app while records/access integration is designed; that is useful learning, with no blind-performance claim. A whole new agent framework, replacement report dashboard or broad catalog installation has no demonstrated need yet.

## Evidence and uncertainty

The three new source studies are pinned, with hashes and read coverage. Cloudflare was read by Thistle, autoresearch by Ginger, Awesome-Hacking by Cass; Cass independently spot-checked the Cloudflare input/validator semantics and autoresearch candidate/evaluator/time paths. These are source/public-document and synthesis observations, not executed capability comparisons.

Relevant original research: `ai-evaluation.audit-evaluator-before-tester` (framework.md:79–91, draft synthesis); `ai-evaluation.agentdojo-usertask6-accepts-wrong-recipient` (selected component-lab with contrary versions); `safety.capability-gate-outside-model` (component decisions only, not OS sandbox); `commercial.evaluation-and-buyer-evidence-protocol` (synthesis); `service-delivery.rea-integration-order` (proposal, not runtime proof). New register entries link the source studies. Existing stopped experiments and client restrictions remain in force.

Remaining unknowns: actual runtime enforcement, mailbox/provider access, scorer truth/custody, reset/quiescence, agent compatibility, discovery effectiveness, review/learning benefit and total cost. Validation must show allowed observation works, forbidden authority/evaluator changes cannot affect scoring, useful effects are independently reproduced and held-out gains survive matched comparison. Failure of any boundary is reported separately rather than averaged into an attractive score.
