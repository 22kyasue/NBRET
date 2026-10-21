# Assessment infrastructure and durable knowledge

This is a proposed threat model, not an audit attestation. Concrete code evidence is limited to the [walkthroughs](implementations.md), synthetic gate and Tomo's identity-reuse experiment. Proposed controls need tests at the actual executor and storage boundary.

| Boundary | Failure | Enforcement and verification proposal |
| --- | --- | --- |
| Operator → engagement | Scope is ambiguous or stale | Versioned authorization manifest covering assets, actions, times and stops; deny capabilities not issued |
| Target → model | Page, source comment or tool output gives hostile instructions | Preserve input provenance; validate actions independently of model compliance |
| Planner → executor | Shell, protocol or alternate tool bypasses allowlist | Typed capability API, process/network restrictions; test every route; no broadly privileged ambient shell |
| Credentials → job | Tokens leak, cross tenants or outlive engagement | Short-lived per-job scope, injection outside prompts, issuer revocation receipts, crash tests |
| Job → host | Shared filesystem, container socket or metadata expands authority | Separate identities/resources, minimal mounts, restricted egress; test isolation rather than assume containers suffice |
| Collector → store | Hostile output is executed or sensitive bodies escape redaction | Inert bounded parsers, quarantine, structured evidence and audited redaction transformations |
| Store → reviewer | Another role/customer's observation is selected | Enforce tenant and actor binding before retrieval; ambiguous identity yields unavailable evidence |
| Completion → cleanup | Partial failure leaves accounts, files or processes | Baseline comparison, per-effect receipts, retained cleanup failure and capability expiry |
| Dependencies → runner | Template, plugin or model changes effects/data destinations | Pin versions, inspect effects, validate updates with safe positive/negative fixtures |

The local gate shows deterministic proposal rejection only. It does not establish another system's isolation. REA's owner pattern distinguishes operation completion from confirmed resource release. Hashes and prompt warnings cannot enforce tenant isolation.

## Separate facts from reusable lessons

An evidence object needs tenant, collector/version, collection time, environment, actor context, artifact digest/reference, transformations and retention class. A claim adds predicate, policy authority, assumptions, reviewer, status, coverage and expiry. A reusable lesson contains a generalized failure pattern and safe synthetic test without customer identities, topology or raw data.

“Editing invalidates approval” is reusable. A customer's named approver and billing endpoint are confidential facts. Retain failed hypotheses with their reasons and expiry conditions under the right tenant. Changed interpretations should supersede earlier versions without rewriting raw evidence. Retained artifacts do not imply continuing authorization to contact a target.

## Freshness and deletion

Link claims to build, role policy, identity/session epoch and configuration. Changes can make a pass stale; old intact bytes do not establish current privileges. Distinguish historical retention from authorization for a current decision.

Deletion must cover source objects, summaries, embeddings, caches, exports and backups under the retention policy. A receipt should identify stores and exceptions. Filters must enforce information barriers before content reaches a model, including conversation and tool traces. Pseudonymous identities still need access controls; hashes of low-entropy identifiers can be guessable. Avoid raw credentials as durable identity keys.

## Falsifiable memory evaluation

Create two synthetic organizations with overlapping asset names and distinct canaries. Include verified facts, rejected hypotheses and stale permissions. Hold out follow-up tasks; compare the same expert workflow with and without memory. Predefine correct answers, prohibited retrievals and deletion expectations. Measure verified success, total time including review, stale-fact use, cross-tenant retrieval and deletion propagation.

Memory helps only if correct outcomes improve after maintenance/review cost while confidentiality holds. A cross-tenant disclosure is a boundary failure that must remain visible separately from average scores. This experiment has not run; more stored text is not evidence of learning.
# Peer evidence update: field masking versus artifact sanitization

Tomo's [installed SARIF builder experiment](../security-landscape/deep-review/zap-sarif-lab.md) and [receipt](../security-landscape/deep-review/zap-sarif-lab-receipt.json), read here on 2026-10-17, confirm a narrow transformation boundary in reports addon 0.43.0. Eight predefined synthetic assertions show Authorization masked while request Cookie/custom key/query/body, response Set-Cookie/body and attack text remain in builder output. Agate read these artifacts; this is Tomo's runtime evidence, not independent Agate execution. No actual secret, network request or generated JSON report was involved. Full serialized-artifact sanitization and customer disclosure are not established.

For evidence handling, validate a **field-by-field data-flow policy** across builder objects, serialization, attachments, logs and exports. Use distinct synthetic canaries in each potentially confidential field, retain an authorized original separately, and test the exact artifact intended for sharing. A masked header is a positive control for that field, not a confidentiality guarantee for the exchange or report. Preserve enough redaction provenance to reproduce the finding without silently changing its meaning. Final serialization/recipient access remain separate checks; Tomo owns the report call-site trace.

Follow-up, same date: Tomo's [selected-template serialization study](../security-landscape/deep-review/zap-sarif-lab.md) and [render receipt](../security-landscape/deep-review/zap-sarif-render-lab-receipt.json) now extend the earlier builder-only boundary. Two locally parsed 6,190-byte JSON artifacts were byte-identical and passed nine structured checks each, preserving the synthetic fields while masking Authorization. The experiment combines actual installed builder/support/Thymeleaf classes with a pinned source template and hand-built alert tree; it is explicitly mixed provenance, not a reproduced addon build or full daemon/filter/database report invocation. The selected serialized-artifact behavior is demonstrated; whole-product sanitization, complete SARIF schema conformance, recipient access and customer disclosure remain unestablished. Agate reviewed the peer study/receipt rather than rerunning it.

