# LAC: a Japanese security operator with an integration business

**Accessed 2026-10-17; active dossier.** LAC's [history](https://www.lac.co.jp/corporate/info/history.html) starts with the former LAC systems-development company in 1986, security assessments in 1995, monitoring in 2000 and JSOC in 2002. The present legal entity dates to the 2007 holding-company combination; three subsidiaries were merged in 2012. This explains the different founding/incorporation dates. [Company profile](https://www.lac.co.jp/corporate/info/) lists security solutions, systems integration and IT product sales/services. FY2025 consolidated sales of ¥62.8B are therefore not security-only revenue.

The [IR page](https://www.lac.co.jp/english/ir/) records delisting on 2025-02-25. The [corrected KDDI filing trace](lac-ownership-accounting.md) now establishes control on January 22, 2025 and 100% ownership by March 31. Delisting, control, full ownership and the separately announced KDSec merger are distinct milestones.

## What JSOC delivers

The [JSOC description](https://www.lac.co.jp/corporate/unit/jsoc.html) reports approximately 740 organizations, 4,000 sensors, 16B daily logs/alerts and roughly 300 security analysts/engineers involved, with log quantities labeled 2025 actuals. “About 15 minutes” is described from **analyst analysis beginning** through severity decision and customer contact. It is not an ingestion-to-resolution SLA and has no reviewed distribution or independent measurement.

LAC Falcon is LAC's own monitoring/operations support system. It must not be confused with CrowdStrike Falcon. LAC's JSIG signatures and JLIST intelligence are additional provider content. They do not establish that all underlying enforcement products are developed by LAC.

The [MSS service](https://www.lac.co.jp/operation/jsoc_mss.html) offers network detection, cloud WAF, firewall, intrusion detection/prevention, server and endpoint operations, plus Microsoft 365/zero-trust xPDR variants. It lists alert analysis, emergency contact and response assistance, monthly reporting, portal information, policy operation and 24/365 inquiries. The page explicitly says some capabilities depend on the supported product and some are optional.

## Delivery and responsibility

1. Customer and provider select supported devices/services and operating scope; equipment rental is an option. Public text does not supply exact setup roles, baseline checklist or acceptance test.
2. Device logs/alerts are collected and analyzed continuously using LAC's platform and analysts.
3. Analysts distinguish routine/malicious activity and assess severity; relevant customers are notified and receive response support.
4. Portal and monthly reports communicate activity and response status; signatures/policies are maintained where the product/menu supports them.

The source establishes operational services, but not an unconditional mandate to isolate any endpoint or shut down a production application without customer approval. Full incident investigation, recovery, pentesting and training are separate catalog services. Customer business owners still need to assess operational consequences and arrange remediation/recovery scope. Exact escalation tree, on-call acknowledgement, retention, change approvals and rollback are not disclosed in these pages.

## AI: owned workflow versus operated third-party detection

The JSOC history records Vectra AI NDR operations beginning February 2024, cloud AI security operations in 2022 and multiple other vendor integrations. This establishes **LAC operating an AI-enabled vendor product**, not LAC owning that detection model. The company history also mentions internal generative-AI efficiency work; it does not expose a complete agent input/tool/action/audit mechanism. No absence-of-AI claim is warranted, and no autonomous generative containment claim is established.

## Representative workday and incident

**Illustrative inference:** an analyst reviews the correlated queue, assesses a suspicious network event, checks relevant product context, contacts the customer's security team and documents the outcome in the portal. Customer staff provide asset/maintenance context; monthly review can drive policy changes.

For suspected malware activity, the selected EDR/network menu supplies alerts and the analyst determines severity and response assistance. Whether LAC executes isolation, only recommends it, or invokes a separately contracted emergency team depends on product/menu and permissions not established here. An alert count or a signature deployment is not evidence that the host was restored.

Next evidence: exact EDR/xPDR service descriptions, public incident artifacts and operator training material, permission manifests and LAC Falcon internals if published. Provider-selected satisfaction quotes are not independent buyer-authored evaluation.

See [public service-artifact boundaries](service-artifact-boundaries.md) for the English SLA wording, monthly reporting and health-check claims, preserved separately from signed terms.

See [LAC latest standalone accounts and completed operating merger](lac-latest-standalone-accounts.md) for the newer, separately scoped notice.

The [xPDR operating comparison](lac-xpdr-operating-boundary.md) supplies subsequent Sentinel/Splunk prerequisites, operating hours and response-option evidence; AI expansion remains a roadmap claim in the reviewed release.
