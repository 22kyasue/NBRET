# GMO Cybersecurity by Ierae: assess, monitor and respond

**Evidence checkpoint: 2026-10-17.** The selected provider is **GMO Cybersecurity by Ierae, Inc.**, not GMO Internet Group as a whole. Its [profile](https://gmo-cybersecurity.com/company/) lists 341 employees as of 2026-04-01. Revenue and service-level margins are not established.

## Origin and business model

The legal company dates to Cocon's formation on 2013-02-22; the Ierae predecessor dates to December 2011. The [history](https://gmo-cybersecurity.com/company/history/) records Cocon ownership in 2015, a four-company merger in January 2022, GMO subsidiary status in February and the present name in April. These are different milestones, so “founded 2011” and “established 2013” need their entity context.

The reviewed history does not establish a detailed founder problem statement. The current [service catalog](https://gmo-cybersecurity.com/service/) establishes a specialist testing/consulting business that also develops subscription/managed offerings. It names web/mobile/cloud/network testing, internal-network and IoT penetration testing, red teaming, incident investigation, training, security operations, WAF operations and developer/security-team advice. PriceSearch is a nonsecurity offering, another reason not to assume all company revenue is cybersecurity consulting.

Buyers inferred from those services include application owners buying pre-release assessments, security leaders buying operational coverage, and incident owners buying evidence preservation and investigation. Named company customers on a provider page establish vendor-listed relationships only. The SOC supports both direct customers and providers through reseller and OEM models; WAF Aide is also offered through AWS Marketplace. The Japanese website establishes Japanese-language delivery, not a quantified geographic sales split.

## Managed monitoring: the documented path

The [SOC service page](https://gmo-cybersecurity.com/service/soc/soc-plan/) describes the following flow. These are documented capabilities, not an observed customer deployment.

| Stage | Provider work | Customer boundary / unanswered contract question |
| --- | --- | --- |
| Coverage | Support examples include AWS WAF, Cloudflare WAF and CrowdStrike Falcon Insight + Prevent | Customer needs supported products and an agreed menu; this is not proof of universal connector support |
| Collection | SOLOBAN collects product logs and alerts continuously | Exact API scopes, credentials, log filters, collection delay and data residency are not disclosed here |
| Detection | Automatic analysis, self-learning logic and ATT&CK-based attack-stage assessment | Model family, features, training data and evaluation rates are undisclosed |
| Investigation | Specialist analyst hunting; second opinions can include other providers' reports/logs | Page repeats monitoring text in the detailed hunting subsection; no invented step-by-step hunt procedure |
| Notification | Risk-graded reports and ticket creation | Response-time SLA, delivery guarantee and customer acknowledgement rules are unknown |
| Blocking | Smart Blocking applies blocking configuration to covered products when a serious event is found, alongside the report | This is execution, not merely advice. Per-action approval, preauthorization, exclusions and rollback are not specified |
| Prevention | Provider signatures are automatically distributed/applied; custom signatures address customer-specific systems | Change testing, staging, false-positive budgets and emergency disable process are unknown |
| Improvement | Combine pentest findings with customer detection/response observations; assess organizational arrangements | Requires customer participation; the service page does not establish a full signed acceptance/retest protocol |

The second-opinion service can be purchased alone. It must not be represented as equivalent to buying continuous monitoring and blocking. Training content can explain analyst reasoning to customer staff; it is not evidence of staffing transfer.

## WAF Aide: operating an existing enforcement point

A web application firewall (WAF) evaluates web requests before they reach an application. [WAF Aide](https://gmo-cybersecurity.com/service/soc/waf/) operates AWS WAF or Cloudflare WAF, adds provider rules and dynamic blocklists, analyzes activity and can block source IP addresses automatically. The WAF must already exist, or its separate introduction support is needed. The customer still owns application changes and business decisions about acceptable traffic.

The page lists monthly base amounts of ¥42,000 Entry, ¥89,000 Classic and ¥99,000 Standard. Features, request volumes, overages and possible setup costs vary. Its rendered feature table loses some visual tier markers, so do not infer every feature is included in Entry from this text capture. Standard advertises vulnerability diagnosis; that does not establish a manual pentest. False-positive handling is to contact the portal for tailored rules. Monthly reports include detection and defense trends. No exact read/write cloud role, safe staging or automated rollback is established.

## Incident investigation: preserving evidence before interpretation

The [forensic response page](https://gmo-cybersecurity.com/service/incident/forensics/) is unusually concrete:

1. Hear the situation and advise on initial response. Determine available logs, encryption, device restrictions and investigative targets.
2. Preserve evidence onsite or receive devices for offsite work. Image the disk, produce preservation and analysis copies, compare original/copy identity and use equipment that prevents writing to the original.
3. Assign specialist engineers; analyze filesystems, logs and formats; reconstruct a timeline; attempt deleted-data recovery where appropriate.
4. Report findings and prevention recommendations. The sample report requires a request and was not obtained; no outside contact was made.

This describes evidence collection and investigation. It does not establish that the provider rebuilds all production systems, makes legal notifications, guarantees recovered data, or automatically executes every recommended fix. The customer must make affected systems/logs available and determine business/legal actions with its advisers. The page offers a small initial scope with additional investigation proposed as needed. A 24/365 intake number is not a guaranteed arrival or resolution time.

## AI mechanisms: four different claims

| Feature / state on reviewed page | Input → mechanism → output | Decision and action | Evidence limit |
| --- | --- | --- | --- |
| SOLOBAN smart analysis, offered | Supported-product logs/alerts → “self-learning” analysis plus attack-stage mapping → risk reports/tickets | Separately purchased Smart Blocking can change supported controls | No model/version, retention, training or benchmark disclosed |
| Cyber Bulletin beta | Security research material → LLM assistance for analyst research → security information | Research support; no documented direct containment from this beta | Explicit trial label, not established general availability |
| Cyber Forecast beta | Provider attack-observation system → machine learning → forecasts such as mass-mail precursors | Forecast output; buyer action not specified | No measured forecast precision, false-alarm rate or horizon |
| AI application/agent pentest, offered | Customer AI system → security assessment → findings | Customer remediation and agreed retest need separate scope | AI is the assessment target; this alone says nothing about AI used by testers |

All four derive from the catalog/SOC page accessed 2026-10-17. Automatic WAF blocking does not by itself establish a generative action-taking agent.

## Representative day and incident

**Illustrative inference from the documented components:** a customer operator checks overnight SOC tickets, supplies business context for an unusual request pattern and asks for a second opinion on another tool's alert. Provider analysts review the relevant logs, issue a risk report and discuss tailored signatures. A monthly WAF report supports management review. There is no published shift schedule or proof of the exact queue order.

**Illustrative incident:** serious malicious web traffic is identified in the covered WAF logs. If Smart Blocking/WAF automatic blocking is in the purchased scope, blocking is applied and a report is issued. The customer checks service impact and supplies server evidence. If compromise is suspected, a separately scoped forensic engagement preserves evidence, reconstructs activity and recommends prevention. Blocking an IP is not proof of eradication, restored service or absence of stolen data.

## Distinct next evidence

Obtain public architecture/setup manuals and exact permission manifests; inspect any public SOLOBAN/WAF API or source (none pinned yet); read Japanese registry entries rather than treating the provider's registration statement as independently verified; seek public buyer-authored outcomes and complete public report samples. Signed authorization, SLA, retention/deletion and rollback remain unknown. Source-reading states are in the [ledger](continuation.md).

## Public service/report example

The [SOC brochure trace](ierae-soc-brochure.md) adds a public example, with development-stage and delivery-scope limits retained. It does not replace current terms.
