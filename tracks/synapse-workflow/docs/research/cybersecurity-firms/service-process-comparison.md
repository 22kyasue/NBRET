# Comparing the work customers actually buy

**Research checkpoint 2026-10-17.** This comparison links each provider's canonical evidence. It compares responsibility and process, not quality or a product ranking.

## Four purchases that must stay separate

| Purchase | Typical deliverable | Customer responsibility that remains |
| --- | --- | --- |
| Security product | Installed control, platform access, updates and support | Deploy/connect, configure policy, operate the queue or appoint an operator |
| Managed security | Agreed monitoring/investigation/response work by provider staff | Supply system context and access; define allowed actions; own excluded work and business decisions |
| Assessment/consulting | Findings, advice, scoped tests, report and possibly retest | Authorize exact scope, supply representative roles/data, fix defects and verify the deployed result |
| Incident response | Triage, preservation, investigation and agreed recovery assistance | Coordinate business/legal decisions, accessible evidence, restoration and outside-scope systems |

These are analytical categories. Actual contracts may combine them; the company name alone does not specify the purchased work.

## Evidence-backed provider differences

| Provider | Operational center of the reviewed evidence | What to examine before assuming execution |
| --- | --- | --- |
| [CrowdStrike](crowdstrike.md) | Endpoint/cloud platform plus Complete managed remediation | Direct/partner operating model, per-source licenses, offline-host handling and actual completed action |
| [Palo Alto Networks](palo-alto-networks.md) | Managed response permissions and agentic workflow platform | Unit 42 permissions vary by action and server/workstation; Inform waits, Yes preauthorizes, No forbids |
| [Fortinet](fortinet.md) | Network/security devices with connector/playbook automation | Trigger filters, connector credentials and device rules; an LLM is not required for deterministic tasks |
| [Microsoft](microsoft.md) | Tenant products, expert services and a permission-scoped phishing agent | Agent can close false-positive alerts; downstream remediation has separate authority |
| [Cisco / Splunk](cisco-splunk.md) | Enforcement/identity tools plus data analytics and assistant | Cloud connection for AI, current training/data terms and separate response-agent mandate |
| [Google / Mandiant](google-cloud-security.md) | SIEM investigation agent plus expert services | Supported ingestion/tenant shape, overflow without queue, audit enablement; next steps are not proof of containment |
| [Trend Micro](trend-micro.md) | Multi-source platform, Companion and external MCP bridge | Product assistant and customer-selected external model have different data/approval boundaries |
| [LAC](lac.md) | Human-led, multi-vendor monitoring/operation | Product/menu options, escalation and exact authority; LAC Falcon is distinct from CrowdStrike Falcon |
| [NRI Secure](nri-secure.md) | Shared/customer SIEM operations with AgenticBlue analysis | Important human gates, supported SIEMs and future versus currently deployed response automation |
| [GMO Ierae](gmo-ierae.md) | Assessments, forensic investigation, SOC and WAF operations | Purchased menu; Smart Blocking can execute, second opinion alone supplies advice |

The [GMO Flatt supplement](gmo-flatt-security.md) supplies a separate development workflow: source/live testing → reproduced/unconfirmed report → reviewed patch → PR → separate verification. It is not Ierae's SOC workflow.

## Protection surfaces in plain English

These terms describe **where and what**, while SOC/MDR describe **who operates it**.

| Surface / term | Plain-English meaning and common evidence | Limit |
| --- | --- | --- |
| Endpoint | Laptops, desktops and servers; sensor events about programs, files and connections | Agent installed does not prove healthy telemetry or applied prevention |
| Network | Connections crossing gateways or observed inside the estate | Encryption, placement and unmonitored paths affect visibility |
| Cloud | Accounts, configuration, workloads, containers and cloud event records | Snapshot posture and live workload behavior are different observations |
| Identity | Human/service/agent accounts, sign-ins, permissions and privilege changes | A valid login can still exercise excessive privileges |
| Email | Messages, attachments, links and reported suspicious mail | Classifying an alert and removing all copies are different actions |
| Application | Code, APIs and business workflows | A WAF rule cannot establish correct application authorization |
| Data | Sensitive files/records, movement, sharing and access policy | Detecting a sensitive label is not proof that all copies are controlled |
| Posture / vulnerability | Configuration weaknesses, missing controls and known/software defects | A risk score or vulnerable version is not demonstrated exploitation |
| SOC | Security operations center: people and systems that monitor, investigate and coordinate response | Not necessarily the software vendor's own staff |
| SIEM | Collect/search/correlate security event records | Collection is not guaranteed detection or response |
| SOAR | Connect tools and automate response workflows | Automation may use fixed rules; it need not be generative AI |
| EDR / XDR | Endpoint detection/response; extended detection/response correlates additional domains | “Extended” does not specify every source or license |
| MDR | A managed detection/response service with people and a defined mandate | Scope and permissions determine whether the provider recommends or executes |
| Hunting / intelligence | Proactive searches and knowledge about threats to guide investigation | Intelligence matches and actor labels are not proof of compromise |
| Forensics / recovery | Preserve/reconstruct evidence; restore service and confidence | An investigation report and a restored business are distinct outcomes |

[Assessment terminology](../security-landscape/discipline-map.md) remains canonical for pentesting, red/purple teams and testing disciplines.

## Common lifecycle with separate evidence states

Agree assets, identities and authority → deploy/connect and verify source health → establish policy/baseline → detect → investigate → decide → request/receive permission if needed → submit action → confirm enforcement → remediate root cause → recover business service → report/retest/tune.

Each arrow can fail independently. A successful API call proves submission/response handling at that boundary; it does not automatically prove enforcement, eradication or recovery. Concrete examples live in the linked mechanism pages, so they are not repeated here.

## Contracts and observable delivery

Compare [BT Managed Falcon XDR](bt-falcon-service-schedule.md), [historical Cisco MDR](cisco-mdr-service-description.md), [XDR Premier contract](cisco-xdr-premier-contract.md) and [Managed FortiGate](managed-fortigate-service.md) and the [Mandiant assessment](mandiant-3cx-assessment.md). These are separately dated service scopes, not universal portfolio promises. [Trend MDR document access](trend-mdr-access-boundary.md) remains an explicit evidence boundary.

Operating authority examples: [Trend MDR approval](trend-mdr-approval.md), [remote-task completion caveat](trend-response-task-boundary.md), and [Cortex deployment/customer upgrade policy](pan-deployment-buyer-policy.md). These distinguish a configured control, an approved action and confirmed enforcement.
