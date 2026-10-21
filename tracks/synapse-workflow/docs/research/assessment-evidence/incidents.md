# Incident chains and plausible assessment opportunities

All five chains below are attributed public reports, not independently reproduced investigations. Each **counterfactual** proposes a bounded assessment; none establishes that an earlier pentest would have prevented the event. Technical demonstrations in this dossier are synthetic or source-derived, never tests of the affected companies. First-party absence-of-evidence statements remain limited by investigators' visibility. Publication favors organizations able and willing to disclose, and hindsight makes prerequisites look easier to find than they were.

## Cloudflare, November 2023: rotation completeness and containment

**Reported chain:** credentials taken during the Okta compromise remained valid → Atlassian access → persistence and source-repository access → attempted data-center-console access. Cloudflare reports the console attempt failed and customer systems were unaffected; it describes broad credential rotation and hardening afterward. Source: [Cloudflare, February 1, 2024](https://blog.cloudflare.com/thanksgiving-2023-security-incident/).

**Counterfactual assessment:** reconcile every exposed credential with issuer revocation evidence; validate service-account privileges and console segmentation. **Prevention:** complete revocation and least privilege. **Detection:** correlate account use and unexpected administrative persistence. **Response:** test issuer-side invalidation and investigation readiness.

**Capability/evidence/remediation bridge:** the lab's prerequisite graph shows how removing grant authority breaks a modeled path; it does not implement Atlassian semantics. A real retest needs credential inventory, negative authentication results, role/configuration snapshots and timestamped logs. A rotated secret value alone is insufficient. Independent confirmation mentioned by Cloudflare strengthens its account but does not provide public raw evidence for every assertion.

## Microsoft, January 2024: cloud permissions cross a test/production boundary

**Reported chain:** low-volume password spray compromises a legacy test account without MFA → a privileged legacy OAuth application enables further applications and consent → mailbox access through EWS. Microsoft describes audit-log hunting and permission review. Source: [Microsoft Threat Intelligence, January 25, 2024, with February 5 query correction](https://www.microsoft.com/en-us/security/blog/2024/01/25/midnight-blizzard-guidance-for-responders-on-nation-state-attack/).

**Counterfactual assessment:** include legacy tenants and application identities in the trust model; review permission grants across environments. **Prevention:** authentication enforcement and constrained application access. **Detection:** validate consent and mailbox telemetry. **Response:** rehearse removal of applications, grants and sessions.

**Capability/evidence/remediation bridge:** the pinned Sentinel rule in [implementations](implementations.md) queries consent events containing `full_access_as_app`. Source inspection establishes query behavior, not successful detection in Microsoft's incident or another tenant. A real validation needs connector configuration, representative event schema, query execution, alert linkage and an exercised response. Existing grants and alternate events require separate coverage.

## CircleCI, December 2022–January 2023: sessions, keys and downstream dependencies

**Reported chain:** malware on an engineer laptop steals a 2FA-backed session → privileged production access → stores and runtime encryption keys accessed → customer secrets exfiltrated. CircleCI describes customer-reported OAuth activity, restricted production access, step-up controls and rotation. Sources: [incident report](https://circleci.com/blog/jan-4-2023-incident-report/) and [updated customer guidance](https://circleci.com/blog/january-4-2023-security-alert/).

**Counterfactual assessment:** test the trust of a stolen authenticated session with synthetic credentials and inspect who can access runtime keys. **Prevention:** constrained, short-lived privileges and step-up checks. **Detection:** validate endpoint and production audit visibility. **Response:** exercise upstream issuer revocation and downstream consumer updates.

**Capability/evidence/remediation bridge:** a regression can check session revocation and privilege boundaries, but this lab does not simulate malware or key extraction. Necessary evidence includes denied old sessions, approved new identities, issuer logs and consumer functionality. Removing a secret from a CI variable store does not revoke it. A report that closes only the laptop finding misses the downstream remediation dependency graph.

## Sourcegraph, August 2023: public secret becomes application administration

**Reported chain:** an active site-admin token is committed publicly → an attacker gains administrative access → rate limits are increased and API access abused. Sourcegraph reports internal automated controls missed the token and distinguishes potentially accessible information from evidence it was copied. It describes revocation, selected license-key rotation and additional tests. Source: [Sourcegraph, August 30, updated August 31, 2023](https://sourcegraph.com/blog/security-update-august-2023).

**Counterfactual assessment:** test secret detection with synthetic token formats; review whether one token grants unnecessary account-management powers. **Prevention:** pre-publication checks and reduced token authority. **Detection:** correlate administrative changes and anomalous usage. **Response:** verify issuer revocation and identify affected records.

**Capability/evidence/remediation bridge:** deterministic secret-pattern fixtures can establish recognition of selected formats, not all secrets. This dossier does not run a secret scanner. A complete retest would need positive and negative fixtures, token-invalidation receipts and abuse telemetry. Stable pagination can bound records presented to an attacker; it cannot prove what was read without adequate logs.

## Twilio, 2022: social engineering reaches administrative tools

**Reported chain:** employee phishing obtains credentials → internal administrative access → customer information and Authy-device impact. Final reporting describes account/session revocation, stronger factors, tool restrictions and training. Source: [Twilio, final update October 27, 2022](https://www.twilio.com/en-us/blog/august-2022-social-engineering-attack).

**Counterfactual assessment:** an approved synthetic recovery/admin exercise could validate identity checks and tool privileges without targeting real employees. **Prevention:** phishing-resistant authentication and restricted administrative actions. **Detection:** observe unusual admin and device enrollment activity. **Response:** test session invalidation and unauthorized-device removal.

**Capability/evidence/remediation bridge:** the approval-state lab shows that authorization requires a business rule beyond possession of a session. It does not model Twilio. Retesting needs approved personas, tool-specific audit records and recovery confirmation. The account supplies no controlled estimate of the effectiveness of training versus technical changes; those interventions cannot be ranked from this report.

## Supply-chain extension: 3CX, 2023

Mandiant reports a compromised X_TRADER installation preceding access to 3CX and compromise of build environments: [investigator report, April 20, 2023](https://cloud.google.com/blog/topics/threat-intelligence/3cx-software-supply-chain-compromise/). This is a sixth, shorter case, not a complete malware review. **Counterfactual:** validate developer-to-build trust, credential isolation and build provenance. Prevention, build telemetry and artifact withdrawal are separate concerns. Source review of the shipped application alone cannot establish build-host integrity. Mandiant's hunting rules explicitly carry production-use caveats; published rules need local validation. No malware or binaries were downloaded or executed here.

## What these cases do and do not establish

They demonstrate the value of asking about identity lifetimes, cross-boundary authority, administrative workflows and recovery dependencies. They do not estimate market-wide incident causes, tester recall, prevented losses or the probability a particular engagement would discover a path. A useful next study would compare contemporaneous scoped assessment records with later incident evidence; those records are usually private and hindsight bias would still need control.
