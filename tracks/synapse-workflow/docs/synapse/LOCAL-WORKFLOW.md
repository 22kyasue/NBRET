# Complete local workflow

Consequence explanations, advisory priority, evidence-linked sequences, engineering repair checks and retained screenshot artifacts are documented in [consequence-contract.md](consequence-contract.md). This additive content layer preserves the existing three case categories and grants no execution authority.

This is the session-operated local workflow agreed in discovery: intake, exploration, observation-led hypotheses, evidence filtering, review, owner verification, repair recommendations, matched retest admission, reporting and measured iteration records. It uses the current coding-agent session for reasoning and existing installed programs. Its executor is still the owned synthetic application. An external URL, a review label or an intake file cannot authorize live activity.

## Start and use the coding-agent interface

```sh
npm run synapse:workbench
npm run synapse:session -- --endpoint http://127.0.0.1:PRINTED_PORT/ brief
```

The dashboard supports all workflow operations through a strict JSON editor. The session CLI reads the same state and submits the same commands:

```sh
npm run synapse:session -- --endpoint http://127.0.0.1:PRINTED_PORT/ step
npm run synapse:session -- --endpoint http://127.0.0.1:PRINTED_PORT/ case --file case-command.json
npm run synapse:session -- --endpoint http://127.0.0.1:PRINTED_PORT/ export
```

Use `state` for complete retained observations, `brief` for grounded learning/context, and `step --file` for a session-authored proposal. Default suggestions use deterministic observation-driven rules. No unattended model or paid inference interface is introduced.

## Intake and one initial local boundary

```sh
npm run synapse:intake -- --url https://example.invalid/
npm run synapse:workbench -- --config local-config.json
```

The intake command contacts nothing. Optional context is bounded JSON with `context`, `businessRules`, `requestedMode` (`guided` or `blind-requested`) and `scope`. No credential fields are supported. Query strings, fragments and URL credentials are rejected. Blind-requested remains pending protected answer custody and verified access separation.

Example local config:

```json
{
  "scope": {
    "tracks": "both",
    "permitTransitions": true,
    "maxActions": 52,
    "progress": {"windowSize": 6, "windows": 2, "minUseful": 1}
  },
  "intake": {
    "url": "https://example.invalid/",
    "context": ["Planning context only; execute against the owned practice app."],
    "businessRules": ["Intended policy supplied by the owner, not inferred from behavior."]
  }
}
```

Tracks can be `anonymous`, `accounts` or `both`. `permitTransitions:false` narrows execution to reads. Config cannot add targets, headers, commands or capabilities, or increase the 52-action ceiling. A structured local authorization record binds actual target origin, provided actors, effects, evidence limits, budgets and stop conditions. Resolving an owner request changes records only, never permissions.

## Case lifecycle

Send a case event through `/api/case` or CLI `case --file`:

```json
{"event":{"type":"candidate.created","payload":{
  "id":"case-1","title":"Unconfirmed question about observed behavior",
  "question":"Does the behavior match the declared business rule?",
  "authorId":"session","basisEvidenceIds":["ACTUAL_OBSERVATION_ID"],
  "identity":{"principal":"alice","tenant":"north","role":"member"},
  "environment":{"sourceHash":"ACTUAL_TARGET_SOURCE_HASH"},
  "expected":"The owner-declared rule and its authority.",
  "observed":"What the retained response actually shows.",
  "demonstratedConsequence":"No unauthorized consequence established yet.",
  "potentialConsequences":"Conditional damage, with assumptions stated.",
  "uncertainties":"What remains untested or unsupported.",
  "suggestedRepair":"No repair justified before a weakness is established.",
  "manualVerification":"Written independent check and expected result.",
  "impactType":"other"
}}}
```

The UI can load this template from a real observation. Filling it is an interpretation, not a finding. Supported impact types cover exposure, unauthorized action, disruption, additional reach, availability and resources; this does not add corresponding execution capabilities.

| Event | Payload after `event.type` |
| --- | --- |
| `evidence.filtered` | `caseId`, `positiveControlIds` |
| `review.recorded` | `caseId`, `reviewerId`, `verdict` (`supported`, `needs-action`, `rejected`), `evidenceIds`, `objections`, `notes` |
| `owner.verified` | `caseId`, `result` (`reproduced`, `not-reproduced`, `inconclusive`), `evidenceIds`, `notes` |
| `retest.planned` | `caseId`, `originalEvidenceIds`, `relatedEvidenceIds`, `legitimateControlIds` |
| `retest.recorded` | `caseId`, `evidenceIds`, `notes` |

The evidence gate retains rejection reasons and requires complete matched identity/build receipts and separate successful declared controls. It does not judge all business semantics. Review must follow a passed gate and cite that exact immutable evidence. A newer gate or superseding review invalidates prior owner-verification status while preserving history. Negative or inconclusive owner results demote positive presentation.

Reports contain three categories: independently verified findings, issues needing owner action, and unconfirmed leads with rejections retained. **The verified section remains empty in this shared-host harness**: labels, agreement, owner declarations and hashes alone cannot establish independent effect. No vulnerability or damage is fabricated when ordinary controls work.

## Retest and real changed-build evidence

Plan original, related and legitimate controls before a retest. After an actual repair is supplied and a separate owned run is cleanly stopped, attach its retained observations:

```json
{"directory":"runs/ACTUAL_STOPPED_WORKBENCH_DIRECTORY"}
```

Submit that command using `attach-evidence --file`. Attached observations preserve original identity, environment, source hash and journal head; they cannot authorize current target actions. A retest requires changed build, one consistent new environment and distinct chronological matches for every original/related/legitimate receipt. Same build, missing evidence, mixed sessions, reused original evidence and changed semantics remain incomplete or mismatched. Even matched observations do not automatically establish a proper repair. No real repair exists merely because a clean synthetic exercise completed.

## Resume without replaying effects

```sh
npm run synapse:workbench -- --resume runs/STOPPED_SESSION
npm run synapse:workbench -- --resume runs/STOPPED_SESSION --resume-target
```

Default resume is record continuation only: cases, reviews, verification, effort and reports can advance with no target process. Explicit `--resume-target` restarts only a clean-stopped owned checkpoint with matching code, valid checkpoint digest, unexpired original scope and remaining original budget. Credentials and discovery are fresh; prior-epoch facts cannot authorize actions. The original action, request and cumulative execution counters carry forward. The old stop is never silently undone.

Checkpoints contain only the six ordinary synthetic records, never credentials. They are private local continuity artifacts, not hidden evaluation answers or proof of isolation. A crash with unresolved intents/locks requires operator inspection; no automatic mutation replay or lock stealing occurs. Expired or exhausted sessions need a fresh scoped run, not a reset disguised as resume.

Budget enforcement uses Node event-loop request deadlines and conservative admission across resumed phases; it is not OS CPU preemption or a mathematical hard wall-clock guarantee. Resume reserves room for bounded session setup before admission. Limits can stop work conservatively with unvisited branches visible.

## Owner work, teaching and measurements

| CLI/API operation | Record |
| --- | --- |
| `request` | `{operation:"record",question,reason}` or `{operation:"resolve",requestId,resolverId,resolution}` |
| `effort` | `{effort:{person,stage,minutes}}` (optional stable `id`) |
| `note` | `{note:{kind:"teaching",question,answer,evidenceIds}}` or declared `{kind:"escalation",caseId,priority,reason}` |
| `rejection-audit` | `{seed,count}`; population/denominator and sample retained |
| `evaluate` | `{comparison:{baseline,candidate,protocol}}` using the frozen schema in `measurement.mjs` |
| `iteration` | `{iteration:{id,failureStage,previousVersion,candidateVersion,change,predictedBenefit,protocolId,regressionLimits,rollbackCriterion,heldOutPlan}}` |

Effort stages are preparation, exploration, hypothesis, investigation, verification, filtering, review, reporting, stopping, infrastructure, teaching and retest. Missing effort is unknown, not zero labor or zero cost. Semantic novelty ignores new IDs, timestamps, confidence and paraphrased prose. Useful eligible branches take priority over a diminishing-return pause. Once none remain, configurable consecutive low-progress windows pause pickup and retain owner work. Thresholds are calibration parameters, not proven optimal stopping.

Comparisons require frozen equal scope/access/budget/assistance/familiarity and versions, a declared expert manual baseline and retained unsuccessful/unscored populations. Missing data is descriptive; mismatches are not comparable. No improvement over a comparably admitted manual baseline fails. A conditional arithmetic pass still does not authenticate external admission, blind separation, expert competence or superiority. Rejected samples cannot establish a false-negative rate without independent adjudication.

Technical reports include actual normalized evidence and full histories. Executive briefs separate observed consequences, conditional damage, repair recommendations, owner verification and limits. Internal teaching remains separate. Neither report is published externally.

## Acceptance and remaining external inputs

Run `npm run synapse:acceptance` after integration. This targets inspected local tests only; it does not start the old scanner/research suites. Aiko's [requirements matrix](requirements-acceptance-matrix.md) distinguishes software readiness from protected blind custody, genuinely independent effects, a human expert baseline, live scope, other-PC inspection and client/market validation. Those inputs cannot be manufactured by this program. Broader stack coverage and automatic software self-modification remain later stages from discovery.
