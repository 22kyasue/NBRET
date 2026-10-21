# Google Cloud Security and Mandiant: analytics, intelligence and expert services

**Accessed 2026-10-17; active dossier.** This selected unit is Google's security business, not all Google Cloud or Alphabet revenue. A separate current security revenue total is not established.

The [January 2022 Siemplify acquisition](https://cloud.google.com/blog/products/identity-security/raising-the-bar-in-security-operations) added security orchestration/response; the [September 2022 Mandiant completion](https://cloud.google.com/blog/products/identity-security/google-completes-acquisition-of-mandiant) added intelligence, consulting and incident response. The [Chronicle Security Operations introduction](https://cloud.google.com/blog/products/identity-security/introducing-chronicle-security-operations) describes unifying SIEM analytics and Siemplify SOAR. These announcements establish history and intent, not one uniform implementation or service mandate.

## What buyers receive

Google Security Operations is a product platform for collecting/normalizing security events, detections, investigation and response workflows. Mandiant consulting, red teaming and incident response add expert engagements. Existing [Mandiant assessment research](../security-landscape/companies.md) remains canonical for the earlier red-team process. Cloud-native controls and third-party telemetry are separate connections, not automatically complete coverage of every customer system.

The [product page](https://cloud.google.com/security/products/security-operations?hl=en) describes curated detections, intelligence and Gemini assistance. Detailed onboarding/source permissions, Japanese delivery entities and individual service contracts are still being verified; Japanese-language documentation alone is not a staffing or data-residency guarantee.

## Triage and Investigation agent: a documented bounded workflow

The [agent manual](https://cloud.google.com/chronicle/docs/secops/triage-investigation-agent), captured with an update date of 2026-10-15, defines the following:

| Stage | Actual documented behavior | Operational boundary |
| --- | --- | --- |
| Input | Supported alerts from SIEM-ingested data | SOAR-connector alerts are excluded in this manual |
| Trigger | Automatic or manual investigation; automatic start defaults to five minutes after alert creation to allow related events to arrive | Delay is configurable up to 20 minutes; filter fields constrain selection |
| Analysis | Search/refine queries, intelligence enrichment, command-line explanation and process-tree reconstruction | Requires available data; a missing source cannot be reconstructed by branding |
| Sequence | Initial risk assessment, parallel context/evidence gathering and adaptive follow-up | Low-risk cases may stop early |
| Output | True/false-positive disposition, confidence, explanation, investigation timeline and suggested next investigative steps | This manual does not establish automatic endpoint containment or full incident recovery |
| Limits | Investigation described as averaging about 60 seconds, with maximum 20 minutes; no queue for overflow | Above-limit alerts are not automatically analyzed; average is vendor-described, not independently measured |
| Visibility | Past investigations and reruns are separate entries; feedback and dashboard metrics | Confidence is the agent's assessment, not calibrated accuracy proof |
| Audit | Chronicle API audit configuration and investigation method filters | Customer must enable the documented audit setting; UI history and audit collection differ |

The source supports specific single-/multi-tenant arrangements and says case-summary integration depends on Enterprise/Enterprise+ licensing. It states TIN is not FedRAMP compliant. These are feature-specific constraints, not claims about every Google Cloud product.

Before/after: an analyst normally searches related events and intelligence and writes a disposition. TIN performs those investigative steps and presents a structured result for review. The reviewed manual leaves execution of recommended remediation outside this demonstrated path. Exact model/version, training/retention/residency and unit prices still require separate evidence.

## Source-backed API boundary

The [Python wrapper @ ca553eb7dc940bd113704c737db04324f25c2ed1](https://github.com/google/secops-wrapper/tree/ca553eb7dc940bd113704c737db04324f25c2ed1) now declares **maintenance mode**, not active feature development. The SDK is not the proprietary investigation engine.

The complete `investigations.py` read shows GET association/detail/list wrappers and a POST trigger that submits an alert ID to a v1alpha endpoint. It returns the API result without waiting for completion. The complete mocked investigation test file includes an in-progress trigger response; success there is not a completed investigation. The [source annotation](google-investigations-source.md) now covers selected auth, pagination/request helpers and tests; construction/transitive dependencies remain partial.

## Representative daily and incident work

**Illustrative inference:** customer operators monitor source-ingestion health and supported alert coverage, review agent explanations/uncertainty, and take unsupported or overflow alerts into a human queue. An analyst can rerun an investigation after additional evidence arrives. Separate response playbooks or a scoped Mandiant engagement perform their own approved actions.

A suspicious command-line alert can lead to process-tree/context investigation and an analyst verdict. That does not demonstrate that a host was isolated, credentials revoked or business restored. Those steps require verified connectors, authority and outcome checks. No live customer environment was accessed.

Remaining: founding/origin detail, Japanese delivery proof, economic/channel evidence, data-handling terms, complete SDK dependency trace and public buyer/incident artifacts.

Concrete consultancy example: [buyer-hosted 3CX assessment update](mandiant-3cx-assessment.md), with testing/remediation/reassessment roles and an unresolved chronology. This is not independent effectiveness proof.

The [English architecture/TIN cross-check](google-architecture-boundary.md) preserves a broader platform automation statement separately from the bounded TIN manual. English main content is updated October 13, whereas the earlier Japanese translation capture showed October 15; do not overwrite one source date with the other.

## Origin: a data-volume problem before the current agent platform

The complete [X graduation account](https://www.x.company/blog/posts/graduation-day-introducing-chronicle/), dated January 24, 2018, traces an internal cybersecurity project to early 2016 and its graduation into an Alphabet company. Its stated problem was that existing tools already produced useful clues, but analysts could not efficiently see patterns in enormous data volumes. The proposed combination was storage, compute and machine learning to improve visibility and discovery. Predicting/deflecting attacks was explicitly a longer-term ambition, not an achieved 2018 capability or evidence of deployed generative agents. This is a parent-company origin account, not independent proof of its promised improvement.

Operational limits: [May 2026 processing incident](mandiant-processing-incident.md) and [Japan-facing delivery evidence](google-japan-delivery-evidence.md).

The separate [conversational Gemini client trace](google-gemini-client-source.md) follows question/context submission, response formatting and automatic preference-write fallback. It is distinct from TIN and includes source/test error-contract limitations.

[Generated-query and executed-search source trace](google-natural-language-search-source.md) separates translation, automatic execution, retries, time normalization and returned-count limits.

[Detection-rule lifecycle source trace](google-rule-lifecycle-source.md) distinguishes generated code, compilation, historical replay, continuous execution and alerting.
