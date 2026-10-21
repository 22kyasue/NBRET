# NRI SecureTechnologies: operating across products

**Primary evidence accessed 2026-10-17; research active.** NRI Secure is a specialist subsidiary, not the entire Nomura Research Institute group. Its [profile and history](https://www.nri-secure.co.jp/company/outline) records an internal venture starting in June 1995, managed security that December, consulting in 1996, assessments in 1998 and incorporation on 2000-08-01. Own products include Cryptobin secure file exchange (2001), SecureCube Access Check privileged-access management (2005) and Secure SketCH organizational security evaluation (2018). UBsecure joined the group in 2012; NDIAS was formed with Denso in 2018 for automotive security. This is both organic product development and group expansion, not simply reseller growth.

The profile names NRI as shareholder and 815 consolidated / 679 standalone employees on 2026-04-01. Standalone revenue, service/product proportions and geographic sales are not established. Offices include Japan and North America; the history records additional SOC coverage locations. That is not evidence that every customer's data is processed in every location.

## What customers buy

The [company catalog](https://www.nri-secure.co.jp/company/) groups consulting, assessments, products, managed security and education. Consulting/assessment and an ongoing SOC contract are separate purchases. Buyers include security leadership seeking an operating capability, SOC teams with an underused SIEM, product teams needing testing and organizations needing access/file controls.

The [shared SOC log service](https://www.nri-secure.co.jp/service/mss/log_monitoring) advertises correlation across over 200 products/services, 24/365 monitoring, Japanese/English support and over 80 analysts. Those are provider-reported capabilities, not measured coverage on a customer estate. Price is quoted from the licensed environment and scope.

The [SIEM monitoring service](https://www.nri-secure.co.jp/service/mss/siem_monitoring) explicitly lists Splunk Enterprise/Cloud, Cortex XSIAM and Falcon Next-Gen SIEM. It can provide rules, tune custom detections and take on SIEM introduction/operation. Logs from WAF, endpoint and firewall systems reach the customer's SIEM; the provider analyzes alerts and reports high-risk events. Product license, device types and configuration affect price. “Product-independent” here means several supported products, not every SIEM without integration work.

## AI delivery mechanism: AgenticBlue

A [2026-08-06 launch notice](https://www.nri-secure.co.jp/news/2026/0806) says AgenticBlue began operating in NeoSOC that day for shared-log and SIEM monitoring services. The developer-authored [technical explanation](https://www.nri-secure.co.jp/blog/agenticblue), published the same day, supplies a more specific contract:

| Layer | Documented mechanism | What remains unknown |
| --- | --- | --- |
| Inputs | Customer systems, procedures, severity criteria and report format encoded as version-controlled Skills; SIEM access through MCP | Actual Skill files, connector scopes, independently tested partitioning and exact models |
| Workflow | Fixed phase order: triage → analysis → severity scoring → report | Scheduling, retries, timeouts and maximum work budget |
| Execution | Orchestrator advances phases; execution agents search SIEM; separate reviewer agents check phase gates and request rework | Reviewer independence, common-model failures and quantified validation |
| Security | Shared web UI, role permissions, centralized proxy credentials, sandbox isolation and allowlisted tools/actions | Code, policy evaluator, sandbox escape testing and exact privileges |
| Data | Describes a closed environment, minimal inputs and masking, without exporting logs as external training data | Region, retention/deletion, subprocessors and masking failure behavior |
| Decisions | Human approval at important stages; analysts handle difficult decisions and incidents | Exact stage-by-stage approval policy and per-customer customization |
| Audit | Structured reasoning and visible tool/decision steps | Immutable storage, audit retention and replay guarantees |
| Roadmap | Extend beyond initial analysis; automate application of detection/protection rules later | Future automation must not be reported as current autonomous containment |

The before/after is concrete: Tier-1 analysts previously gathered evidence, prioritized, assessed severity and drafted reports manually; agents now perform that preparatory sequence under review, while analysts supervise and handle deeper analysis. A later internal timing comparison is scoped in the linked control note below; no independent production measurement was reviewed. Multiple agents agreeing is not itself a correctness proof.

## Daily work and incident narrative

**Illustrative inference:** the customer supplies its system context and ensures collectors/SIEM are functioning. An alert enters the four-phase AI analysis, reviewer gates request additional work if needed, and an analyst approves an important report. The customer receives the risk finding and decides business-impacting response under its contract. Rule tuning and onboarding new sources occur through a separate operating change.

For a suspected account compromise, correlated identity/endpoint evidence can be searched from the SIEM; the provider prepares severity and reports the case. The reviewed announcement does not establish that AgenticBlue autonomously disables that account. Incident-response services are available elsewhere in the catalog, but a SOC subscription must not silently be expanded into full forensic recovery.

Next: public service diagrams/manuals, incident SOW/report samples, connector manifests, version/dependency source, and customer-authored outcomes. No public AgenticBlue implementation is pinned yet.

See [public service-artifact boundaries](service-artifact-boundaries.md) for the shared-SOC pricing/support boundary; no signed SLA or containment authorization was obtained.

Further evidence: [AgenticBlue control details and evaluation limits](nri-agenticblue-controls.md).
