# A report interpretation envelope: falsifiable design proposal

Dated2026-10-17. **New inference/design proposal**, not an implemented NBRET fix, vendor capability claim, customer finding, market-demand measurement, or runtime result. Grounding: [configuration interpretation](report-interpretation.md), [pinned file annotations](zap-reports.md), and existing separate lab receipts. This continues ordinary reporting/provenance work; the flagged operation remains stopped.

## Observed problem

A report can be well formed while concealing which interpretation produced its contents. Ordinary report preferences, the automation editor, and the report API have different defaults and empty-selection semantics. Summary PASS is absence of an alert count for a listed passive rule. Job COMPLETED is lifecycle state; GUI and CLI apply additional error interpretation. Plus formats intentionally serialize raw message data, with format escaping distinct from credential redaction.

These are specific source observations at pinned versions. They do not establish customer frequency, a universal product defect, or that existing services fail to explain their reports. The ordinary GUI's error-aware renderer and section validation are positive controls to preserve.

## Who might need it and who might pay

Hypothesis: assessment leads, remediation teams and assurance reviewers need to compare artifacts across reruns and entry paths. A security engineering lead or assessment provider could pay for reduced review/retest ambiguity. No interviews, procurement data or willingness-to-pay evidence exists in this investigation yet. A readable report appendix might solve the need without a new product.

## Proposed mechanism

Generate an adjacent, versioned interpretation record after configuration normalization and result finalization. It describes the actual report selection and state, alongside the original artifact; it does not replace raw evidence or change scanner behavior.

| Field group | Minimum representation | Why it matters |
|---|---|---|
| Source identity | Tool/addon/template version and hashes, adapter revision, original source URLs | Entry-path/version changes can change meanings. A hash identifies bytes, not trustworthy authorship. |
| Assessment identity | Explicit assessment/run ID, environment identifier, principal label, authorization reference | Distinguishes assessments sharing a hostname. Credentials are never stored in the record. Unavailable identity stays unknown. |
| Requested selection | Original input with null/empty/present states preserved | Explains user intent without silently interpreting empty as none or all. |
| Effective selection | Normalized sites/contexts/risk/confidence/sections, selection method and warnings | Makes differences reviewable. Raw origin prefixes are labeled as prefixes, not exact origins. |
| Execution state | Not started/running/completed/aborted plus errors/warnings and finalization point | Avoids translating completion or missing job results into success. |
| Coverage basis | Listed/enabled/invoked/applicable/evaluated observations separately, each with evidence source | If evaluated/applicable is unavailable, report unknown; do not derive it from enabled rules, URI count or no alerts. |
| Finding basis | Tool-reported confidence, validation method, evidence pointer and reviewer action separately | A label such as confirmed remains attributed to its source rather than independently certified. |
| Artifact policy | Fields included, redaction policy/version and transformation log | Escaping/Base64 are identified as representation transformations, not secret removal. |
| Retest binding | Parent finding/run IDs and explicit reproducibility limitations | Supports closure review while preserving previous evidence and disagreements. |
| Integrity | Artifact and receipt digests, optional independently anchored signature | Detects changes relative to trusted records; self-authored hashes alone cannot prove correct testing. |

A minimal adapter can honestly expose less. It must not fabricate principal, coverage, cost or validation fields because the source system does not provide them. The report, interpretation record and original receipt should have separately recorded hashes and creation times. Existing evidence is append-only in the research prototype; corrections link to superseded interpretation rather than rewriting history.

## Technical boundaries and integration requirements

The adapter needs access to normalized report configuration, immutable completed progress snapshots, template identity and artifact bytes. It should not need target execution permissions, live credentials or a model. UI event text is insufficient as canonical state: message events can lack plan IDs, and structured event counts may precede per-job snapshots. A finalization hook or explicit snapshot API is preferable to scraping status labels. Adapters must declare whether their state was read before or after finalization.

Identity/environment binding remains Agate's separate investigation and is not solved by adding an arbitrary string. A trustworthy issuer and customer-authorized binding procedure are required for stronger claims. This proposal does not claim a report wrapper can recover evidence that the underlying assessment never captured.

## Small credible prototype

Design-only at this checkpoint. Use committed synthetic records; no scanner, target, API daemon or new runtime capability experiment. Represent ordinary-dialog, automation-editor and API configurations as distinct inputs. Produce an inert comparison showing requested versus effective values and unknown coverage. A reviewer should be able to explain why counts differ without opening source.

Predefine acceptance criteria: preserve null/empty/allfalse distinction; never mark an unrun or missing result as successful; show warnings and context/risk bounds; distinguish reversible encoding from redaction; maintain stable links to prior artifacts; reject a silent identity substitution in the record. A future implementation or runtime validation needs to stay within the permitted alternative scope and must not revive the stopped operation.

## Results that would disprove or weaken the idea

- Existing tools already emit an equally precise effective-configuration/final-state receipt that reviewers use successfully: prefer integrating or documenting it.
- Reviewers cannot make more accurate closure/comparison decisions with the envelope than with the original report and a brief explanation.
- The adapter cannot observe effective configuration/finalized state without privileged target access or unreliable UI scraping.
- Maintaining version-specific adapters costs more than the review ambiguity saves.
- Required identity or coverage data cannot be obtained; the useful output may reduce to an explicit limitations appendix.
- Reviewers treat the envelope as a certification despite explanations; change presentation or abandon the assurance claim.

## Evidence still needed

Read existing report/data lifecycle tests and supported metadata APIs; inspect sample deliverables for effective configuration and explicit limitations; interview assessment/remediation reviewers using paired synthetic examples. Measure interpretation errors and review time, not detection counts. Do not rank vendors or claim an entry strategy from these source observations alone.


## SDK collection dependency — peer source review, 2026-10-17

Agate’s [pinned SDK annotations](../../assessment-evidence/sdk-boundaries-continuation.md#prompt-rendering-and-extension-admission) trace installed MCP 2.3.0 extension composition through server wiring: an interceptor may supply a result without calling the named body, while handler serialization still applies. Separately, the [transport annotations](../../assessment-evidence/sdk-boundaries-continuation.md#legacy-mcp-transport-acceptance-results-and-replay-are-different-evidence) locate acknowledgement before notification/response delivery, and the [Codex schema annotations](../../assessment-evidence/sdk-boundaries-continuation.md#generated-codex-protocol-completion--2026-10-17) document lossy resume/rollback history in openai-codex 0.1.0b3. Exact package/file hashes and ranges belong to Agate’s SDK queue. These are attributed peer source findings, not this dossier’s independent complete source reads or runtime demonstrations. Initial whole-document display was truncated; only bounded relevant sections were subsequently read here. No source-reading credit is added to our implementation queue.

Design consequence (inference): retain separate fields for transport acceptance, parsed/normalized result, effective interceptor path, callback invocation observation, independently observed effect, stored replay and final report assertion. A shaped result or session history alone cannot fill a missing callback/effect observation. Mark a stage unknown when it was not observed; interception is a legitimate extension feature, not itself evidence of deception or a vulnerability. Instrumentation must identify its observation point and effective build/configuration, since a callback log under the same trusted process is not independent attestation.

This complements ZAP result/assertion and report-transformation findings without implying MCP is used by those ZAP paths. Any future inert prototype would compare deliberately distinct recorded stages and missing-stage labeling; no transport, callback, fault injection or suspended operation was attempted for this cross-reference. See Agate’s [claim framework](../../assessment-evidence/framework.md) for the broader evidence model.
