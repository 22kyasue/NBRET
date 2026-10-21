# Consequence and repair content contract

This is the logic handoff for Rowan's presentation work. It adds no executor capability. Existing case records already supplied observed/expected behavior, demonstrated versus potential consequences, repair suggestions, owner verification instructions, retained evidence-filter/review histories, and matched retest admission. This increment structures the remaining explanation, reach, priority, engineering and screenshot requirements.

## Write and read

Submit the existing `case` operation (`POST /api/case`, `session.recordCase`, or `npm run synapse:session -- --endpoint URL case --file command.json`) with an event whose type is `consequence.documented`. Its payload is exactly:

```json
{
  "caseId": "existing-case-id",
  "capability": "Plain-language description of the selected capability or question",
  "whyPossible": "Explain the observed mechanism, separating the policy assumption",
  "severity": {"level": "unknown", "rationale": "Business severity remains unassessed"},
  "extent": {
    "demonstrated": {"description": "Describe the selected observed sample honestly", "evidenceIds": ["existing-complete-observation"]},
    "wider": {"description": "Wider reach is not established", "evidenceIds": [], "assumptions": ["The wider population has not been tested"]}
  },
  "accessEffort": {"level": "unknown", "rationale": "Prerequisites or effort have not been established"},
  "repair": {
    "immediate": "Proposed immediate change, or explain why none is established",
    "broaderRule": "Business invariant that should hold across related paths",
    "legitimateFlowEffects": "What legitimate work must remain possible",
    "acceptanceChecks": ["Original case, related cases, and successful legitimate controls on the changed build"],
    "effort": {"level": "unknown", "rationale": "Engineering estimate not supplied"}
  },
  "sequence": [{
    "id": "step-1", "explanation": "Beginner-readable explanation of this step",
    "evidenceIds": ["existing-complete-observation"], "screenshots": [],
    "expected": "Declared expected rule", "current": "What the retained observation actually shows",
    "proposedRepaired": "Proposed behavior, not an observed repair"
  }],
  "nextInvestigation": {
    "extendDemonstratedPath": "Describe a permitted follow-up or the missing prerequisite",
    "resolveFixUncertainty": "Describe the unresolved repair question"
  }
}
```

The command wrapper is `{ "event": { "type": "consequence.documented", "payload": ... } }`; the session CLI supplies the revision and the workbench supplies an event ID when omitted. Severity accepts unknown/low/moderate/high/critical. Access and repair effort accept unknown/low/moderate/high. These are declared estimates with required rationales. Narratives are nonempty and at most 2,000 characters; sequence has 1–20 steps; evidence arrays have at most 30 unique references; the HTTP/CLI command must also fit the existing 16 KiB envelope. No unknown fields, executable values, getters or arbitrary paths are admitted by this record.

References must resolve to complete, identity-consistent observations on the original case's source hash. Wider context may cite other observed principals, whose actual identities remain in the underlying evidence. Reference presence does not prove that the prose follows from it. Interpretations are appended, at most 20 versions per case. Changed gate/review bindings mark older documentation stale. A consequence document never promotes the case category or authenticates a reviewer.

Read `state.caseSummary.<category>[].consequence` for the latest document, binding and staleness. Read `state.consequenceOverview` for the presentation projection; it is also included in online session `brief`. `entries` retains each case's original category, impact type, explanation, extent, effort, proposed sequence, screenshot status, next-investigation advice and actual retained retest. `groups` maps stable impact types to ordered case IDs; it never adds populations or invents an aggregate severity.

## Advisory priority

Policy `consequence-advisory-v1` separates owner-action triage, missing priority context, unconfirmed triage, and missing/stale documentation. Among documented owner-action cases with known severity and access effort, order is declared severity, presence of wider evidence references, then lower declared access effort. Stable case ID breaks ties. Repair effort is displayed alongside; it does not reduce damage severity. Unknown is not interpreted as low. No quality-times-quantity score, monetary loss model or coverage denominator is produced.

This is an explicit provisional presentation policy, not a validated optimal ordering. A referenced wider sample is not a population count. The default next-investigation focus is to establish the effect first; a currently gate/review-bound owner declaration of reproduction can suggest extending that declared path and resolving repair uncertainty, with its unauthenticated status visible. All advice remains inert. The executor continues to use its original admitted capabilities, discovery prerequisites, scope and budgets; no narrative creates an executable branch.

## Screenshot artifacts

The new `screenshot` command (`POST /api/screenshot`, `session.attachScreenshot`) accepts `{ "sourcePath": "local PNG path", "evidenceId": "existing-complete-observation", "caption": "Describe the capture and its limits" }`, plus expected revision. It copies an existing local PNG into this run's dedicated `screenshots` directory; it does not capture a page, open a URL, or contact a target. The source path is not retained. PNG files are bounded to 4 MiB and 16 million pixels with signature/chunk/checksum validation; this is not a full image decoder. At most 20 screenshot records per run are admitted. Duplicate byte content refuses overwrite; reuse its already registered reference where appropriate.

The returned `state.screenshotArtifacts` record has exactly `artifactId`, `sha256`, `mediaType`, `bytes`, `evidenceId`, `caption`. Sequence `screenshots` entries use exactly `{ "artifactId": "png-<digest>", "sha256": "<64 lowercase hex>", "caption": "Explanation" }`. A pointer resolves only when its registered ID/digest match and its registered observation appears in that step's evidence IDs. Unresolved pointers remain explicitly unavailable. Screenshots cannot substitute for complete underlying observations.

The same-origin local server serves registered PNGs through `/artifacts/png-<digest>` and rechecks bytes against their registered digest on every read. Runtime reports link to this endpoint; exported reports link to the retained relative `screenshots/<artifactId>.png`. Missing or tampered bytes return an explicit error. Arbitrary file paths, external URLs and SVG/HTML are not served through this route.

Operators must inspect and redact the image before attachment. Hashes bind bytes, not capture authenticity, correct redaction, source truth, or independent effects. This runs under the existing unrestricted local-account trust model, not adversarial storage isolation.

## Research and limits

The basis is `standards.claim-record-fields` and assessment-evidence/framework.md:34–49 (versioned assumptions, identity/build binding, changed interpretations and digest limits), plus `service-delivery.instance-vs-class-repair` and executable-claims.md:9/framework.md:69 (original/nearby/legitimate controls and bounded repair claims). The former is a proposed protocol; the repair result is component-lab evidence on a synthetic fixture. Contrary to any universal repair or coverage interpretation, even its class repair establishes only the cases exercised. No calibrated business-loss estimate, authenticated independence, actual repaired build or improved discovery quality is supplied by this content layer.
