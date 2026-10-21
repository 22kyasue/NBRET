# Buyer evidence: discovery is not completed reading

Updated 2026-10-17. These bounded searches supplement the buyer-hosted [Mandiant assessment](mandiant-3cx-assessment.md). They do not convert vendor testimonials into independent evidence.

| Search scope | Outcome | Next permissible state |
| --- | --- | --- |
| CrowdStrike on Mercari/LINE engineering domains | No relevant buyer account established in returned results | Unknown; do not infer absence of adoption |
| CrowdStrike on NARO/Nakatsugawa buyer domains | No relevant buyer-authored artifact established | Vendor-hosted NARO/Nakatsugawa stories remain vendor-selected |
| ZOZO engineering security evidence | [GHAS operations article](https://techblog.zozo.com/entry/github-advanced-security-operation) found in indexed extract | Full reading unavailable: search tool explicitly returned non-retryable robots restriction for this domain; no retrieval/reroute |
| PAN annual SEC filing | Primary filing discovered; direct retrieval rejected with SEC 403 | No retry/alternate-route retrieval; full filing unread |

The ZOZO extract describes routing unresolved serious code findings to SOC through Sentinel and reports different average fix times for findings with accepted Autofix suggestions versus findings without suggestions. It does not establish random assignment or equivalent finding complexity; subtracting those averages is not causal proof of time saved. This is a candidate buyer workflow, not independent validation of Defender phishing or a general Copilot effect.

The bounded queries and no-result states are research limits, not claims that permissible public material is exhausted. Avoid attributing an unrelated “Takumi” repository to GMO Flatt merely because search returns the same product name.

Buyer operating evidence: [Duke Falcon health checks](falcon-buyer-health-check.md), including the difference between heartbeat, successful communication and protection.
