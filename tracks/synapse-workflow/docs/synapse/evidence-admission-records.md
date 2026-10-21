# Local evidence record review

This executable companion to [the worksheet](evidence-admission-worksheet.md) checks declared metadata and references. It does not execute an oracle, read evidence artifacts, authenticate provenance, test a target, grant permission, establish a finding or modify the canonical reader/casebook. A well-shaped lie can pass structural review. Human review of source evidence and a suitable effect oracle remain necessary.

Run with Node from the repository root:

```sh
node scripts/review-evidence-admission.mjs docs/examples/evidence-admission-synthetic-thistle.json
node scripts/review-evidence-admission.mjs INPUT.json --out NEW-RESULT.json
node --test test/evidence-admission.test.mjs
```

Stdout is JSON when no output path is supplied. `--out` exclusively creates a new file; existing files are never overwritten and parent directories are not created. Exit codes: 0 means `structural-record-ready`, 2 means `record-gaps`, 1 means malformed input or I/O error (JSON error on stderr). Neither success nor gap-free output means a consequence occurred. Output is deterministic and contains no generated timestamp.

Input must be a regular UTF-8 local JSON file, at most 1 MiB. URL and UNC paths and direct input symlinks are refused. Use a trusted local directory: mapped network drives, parent reparse points, concurrent filesystem replacement and privileged writers are outside this tool's containment guarantees. The CLI makes no network requests, starts no subprocesses and evaluates no supplied code. Artifact fields are inert labels, never opened or fetched.

## Schema version 1

All objects have exactly the fields listed below. Unknown fields, missing fields, duplicate JSON keys/IDs, duplicate references within a requirement, non-JSON values, accessors, proxies, custom prototypes, sparse arrays and dangerous property names are rejected. The library examines property descriptors before reading values. It cannot make arbitrary hostile in-process runtime code safe; callers must retain control of their runtime.

Strings are nonempty and at most 2,000 characters; use non-secret labels. The bounded parser accepts depth at most 24, with a 30,000-node inert-data budget. Catalogs/requirements contain at most 200 entries; reference and text lists at most 30. Empty reference arrays are valid and produce missing-support gaps. Empty limitations arrays are permitted.

```text
record = {
  schemaVersion: 1,
  claim: {id, statement, context},
  evidence: [{id, context, provenance, completeness, freshness}],
  requirements: [{id, kind, statement, expected: context, references}],
  effect: {execution, oracle, limitations: [text]},
  oneStepAway: null | {
    declaration: "enumerated-prerequisites-only",
    prerequisiteIds: [requirementId], unexecutedStep, reason
  }
}
context = {
  environment: "live" | "captured-local" | "synthetic" | "source",
  instance, build, principal, tenant: null | text, role, object
}
provenance = {
  producer, collectedAt, artifact, sha256, representation, limitations: [text]
}
references = [{evidenceId, relation: "supports" | "contradicts" | "missing"}]
```

`kind` is `identity`, `control`, `attempt`, `effect` or `prerequisite`. At least one requirement of each of the first four kinds is needed for record readiness. This is a generic record checklist, not an exhaustive evidence model for every assessment class. Each prerequisite has its own expected context. A legitimate owner control may have a different actor/tenant than the attempted read; matching is against the requirement's expected context, not a global actor. Instance/build/environment must also match the claim. Object/context labels compare exactly; no implicit aliases or normalization.

Identity, attempt and effect requirements additionally match the claim's principal, tenant, role and object. Controls and prerequisites may explicitly use other identities or objects.

`completeness` is `complete`, `partial` or `missing`; `freshness` is `current`, `stale` or `unknown`. Freshness is a supplied declaration, not an age calculation. Context value `unknown` yields an explicit gap; a null tenant is legitimate for anonymous/public evidence and compares as null. `collectedAt` requires canonical UTC `YYYY-MM-DDTHH:mm:ss.sssZ`. `sha256` requires 64 lowercase hex characters; this tool does not recompute it. `representation` should distinguish raw bytes, normalized records, local reproduction or synthetic metadata.

`effect.execution` is `performed`, `unperformed` or `unknown`; it is a declaration, never a computed target result. `oracle` describes the external comparison rule/version; `unknown` produces a missing-description gap. No oracle code is accepted or invoked. An unperformed effect always produces `effect-not-performed`, even when every listed prerequisite has matched supporting metadata.

## Interpretation and gaps

Exports are `parseEvidenceAdmissionJson(text)` and pure `reviewEvidenceAdmission(record)` from [evidence-admission.mjs](../../src/investigation/evidence-admission.mjs). Neither mutates the input. The CLI additionally exports `reviewLocalFile(inputPath, outputPath?)`.

The result includes `claimId`, `status`, `gaps: [{code, subject, detail}]`, an optional declared one-step review, `consequenceEvaluated: false`, and fixed limitations. Gaps include:

- `unknown-context`, `incomplete-evidence`, `stale-or-unknown-evidence` for catalog uncertainty, even in unused catalog records.
- `dangling-reference`, `contradictory-evidence`, `declared-missing-evidence`, `missing-support` for unresolved requirements. Contradictions remain gaps even beside matched support.
- `context-mismatch`, `environment-mismatch`, `claim-context-mismatch`, `claim-environment-mismatch` for conflicting bindings, including local/synthetic-to-live substitution.
- `missing-required-kind`, `effect-not-performed`, `missing-oracle-description` for absent record components.
- `missing-prerequisites`, `invalid-prerequisite-reference`, `unlisted-prerequisite`, `one-step-execution-conflict` for optional one-step review inconsistencies.

One-step review must enumerate every declared requirement of kind `prerequisite`; identity/control/attempt/effect requirements cannot substitute for that kind. The result always says `declared-review-only`, `exhaustivenessEstablished: false` and `consequenceEstablished: false`. It does not claim that the author knows every real prerequisite. Empty or omitted support remains a gap. The final action stays unexecuted; the output is not a request or permission to execute it.

The [synthetic example](../examples/evidence-admission-synthetic-thistle.json) is invented metadata to demonstrate the format. It deliberately retains an unperformed effect and empty effect references; expected exit code is 2. It is not collected target evidence or an observed TOBIRA finding.

## Research and limits

This applies existing `standards.claim-record-fields` (synthesis, assessment-evidence/framework.md:34–49), `ai-evaluation.audit-evaluator-before-tester` (draft synthesis, framework.md:79–91), `ai-evaluation.text-canary-oracle-not-effect` (constructed component fixture, deep-pentestgpt.md:56–65), and `evidence-handling.finding-record-separation` (source-trace, 2026-10-16-rea-and-security-workflows.md:42–46). Read under `docs/research` before making claims. Contrary evidence/limits: the framework is a draft, the canary example executed no target command, and coverage.md:22 leaves reader benefit unmeasured. Structural checks do not establish semantic support, actual freshness, policy correctness, independent origin or complete prerequisite knowledge. No new empirical research finding is asserted.

Live/account collection remains stopped under the current instructions. This tool is not an alternate route for restricted work. No shared proof/casebook/reader/package integration or production deployment is included.
