# Proof-driven investigation baseline

Kotaro's 2026-10-19 direction: investigate until the selected effect is demonstrated, disproved for the selected case, or blocked by a named evidence or authority boundary. Assumptions generate work; they do not establish findings. A successful-looking response or a completed tool call is insufficient. A demonstration is welcome but never required to manufacture a finding.

## What is implemented

The existing coding-session workflow retains typed hypotheses, execution, observations, objections, owner requests and bounded continuation. `src/investigation/proof.mjs` adds a deterministic **cross-tenant work-order read** predicate. It requires distinct complete actor/owner profiles, a successful exact-object owner control, a matched attempt, current instance/source binding and full structured protected contents. It checks the returned contents even on a denial status. Quoted text, a success status, missing controls, wrong identities, mismatched objects and incomplete receipts cannot establish the effect.

This adapter is deliberately narrow. It does not evaluate arbitrary websites, token theft, writes, account takeover or all business consequences. Such questions remain explicitly unevaluated until an appropriate effect check and authorized controls exist. The built-in executor remains restricted to the owned practice app. The TOBIRA assessment uses separate session-led browser operations; it is not secretly routed through this executor.

`recordProof({expectedRevision,plan})`, `/api/proof`, and `synapse:session ... proof --file PLAN.json` persist proof evaluations. The plan has exactly these fields:

```json
{
  "caseId": "existing-case",
  "claim": "Selected controlled cross-tenant read",
  "kind": "cross-tenant-object-read",
  "attemptId": "existing-case-basis-observation",
  "controlId": "successful-owner-object-observation",
  "actorProfileId": "successful-actor-profile-observation",
  "ownerProfileId": "successful-owner-profile-observation"
}
```

The projection recalculates the result from retained observations. A new gate, superseding review, source or target epoch makes the displayed proof stale; history remains. Imported/historical observations cannot be used to establish the current execution epoch. Proof records do not change target scope, execute requests, populate independently verified findings or certify reviewer isolation. The approved reader includes an effect-verification view, separate from narrative claims.

## Investigation loop

1. Name the question, rule, actor, protected object and exact effect being tested.
2. Establish permitted access and a legitimate matched control. Discover object identity through evidence rather than guessing customer data.
3. Execute a bounded test; retain identity, environment, content and completeness.
4. Evaluate the particular effect. Missing prerequisites become specific collection tasks. A denial proves only the selected denial; it does not establish a clean application.
5. Challenge the result with another reviewer and counterexamples. Shared-PC reasoning does not enforce independent access.
6. Continue other permitted hypotheses and resolve contradictions. Pause at the original budget, a real authority boundary, uncertain side effects or exhausted useful alternatives. Report those reasons.
7. For a demonstrated effect, describe its demonstrated reach, conditional further harm, repair rule and matched retest. Never convert potential harm into observed damage.

“One step away” is not an automatic status. It requires evidence for every named prerequisite and an explicit description of the one unperformed action. A withheld final action is not a demonstrated compromise. The current adapter makes no such claim.

## Run the POC baseline

```sh
npm run synapse:proof-poc -- --out runs/proof-baseline-YOUR-UNIQUE-NAME
```

Use a new directory. The run performs three actual loopback HTTP trials against an **explicit known-answer evaluator fixture**: isolation holds, a synthetic disclosure is returned, and a denial response still contains the synthetic object. The positive behaviors are intentionally constructed scorer controls. They are not discoveries, a blind benchmark or TOBIRA vulnerabilities.

It then runs the existing observation-driven selector against the unchanged ordinary practice app, records a real denied cross-tenant request through the casebook and proof API, stops the target and exports the canonical reader. Inspect `receipt.json`, the three fixture receipts, `ordinary-session/journal`, and `assessment.html`. Raw fixture bodies and their hashes are retained; credentials are not. All servers close after collection.

Pass requires the secure control to remain unproven, both positive fixtures to demonstrate the selected effect, the ordinary application to retain its no-effect result, and all targets to close. Mutation tests independently exercise wrong actor/tenant/object/source, incomplete evidence, missing controls, success-only responses and quoted text.

This is a reproducible **engineering baseline**, not measured improvement over a human expert. Person-time, independent manual baseline, blind answer custody, discovery recall, live-client fidelity and optimal stopping remain unmeasured. The existing measurement/compare records accept later real baseline observations; no improvement over a matched manual baseline must be treated as a failed performance hypothesis, not hidden by larger request counts.

## Research basis and limits

- `ai-evaluation.text-canary-oracle-not-effect`, `assessment-evidence/deep-pentestgpt.md:56–65`: component fixture showing text grounding can pass without target effect. It motivates inspecting actual protected content; it does not establish deployment attack success.
- `ai-evaluation.audit-evaluator-before-tester`, `assessment-evidence/framework.md:79–91`: draft synthesis requiring intended success, wrong identity/object, pre-existing state, errors and reachable failing controls. This is a proposed protocol, not validated universal scoring.
- `evidence-handling.e01-offline-identity-ambiguity`, summarized in `USE-RESEARCH.md`: the legacy matcher ignores principal; this adapter never uses that matcher.
- Contrary limits: same-app profiles and local hashes establish consistency, not trusted origin, enforced independence or a causal claim about arbitrary external systems. Read-only disclosure is the only effect evaluated here. State-changing effects need before/attempt/fresh after-state controls and a separate adapter.

No stopped research experiments, external scanners, paid inference or production deployment are part of this POC.
