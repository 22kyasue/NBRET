# How major cybersecurity providers work

Research opened **2026-10-17**. Pearl owns this research; Rowan owns the HTML learning reader. **Dossier package delivered; source research continues. Evidence limits and continuation questions are retained.** This is a representative ten-provider sample with meaningful Japan relevance, not a verified top-ten ranking.

A security product collects evidence and enforces configured controls. A managed service adds people who operate agreed controls. A consultancy investigates or tests a defined problem. This library follows the work from customer systems through detection, human decisions, actions and recovery.

## Start with the question

| Question | Read |
| --- | --- |
| Why these ten, and what does “major” mean? | [Selection](selection.md), [dated financial anchors](financial-anchors.md) |
| How did their businesses develop? | [Origins and history timeline](history-timelines.md) |
| What work is actually bought, and who does it? | [Service/process comparison](service-process-comparison.md), [public service evidence](service-artifact-boundaries.md) |
| What does the AI actually receive, decide and execute? | [AI evidence matrix](ai-evidence-matrix.md), then the feature-specific notes below |
| What has been read, and what remains uncertain? | [Scope audit](scope-audit.md), [continuation](continuation.md), [source catalog](sources.json), [source reading ledger](source-reads.json) |

## Ten provider dossiers

| Global platforms with Japanese relevance | Japan-headquartered providers |
| --- | --- |
| [CrowdStrike](crowdstrike.md) | [Trend Micro](trend-micro.md) |
| [Palo Alto Networks](palo-alto-networks.md) | [LAC](lac.md) |
| [Fortinet](fortinet.md) | [NRI Secure](nri-secure.md) |
| [Microsoft Security](microsoft.md) | [GMO Cybersecurity by Ierae](gmo-ierae.md) |
| [Cisco Security / Splunk](cisco-splunk.md) | |
| [Google Cloud Security / Mandiant](google-cloud-security.md) | |

[GMO Flatt Security](gmo-flatt-security.md) is a separate-entity supplement. It must not be merged into Ierae's revenue, SOC or product responsibilities.

## Follow the work through public code

These are pinned, selected workflow reviews with explicit remaining dependencies, not complete proprietary-platform audits. No code or vendor tests were executed.

- [Trend external MCP bridge](trend-mcp-source.md): tool registration, default read-only mode, HTTP handling and selected tests.
- [Google investigation wrapper](google-investigations-source.md): trigger/get/list, pagination, auth/request helpers and tests.
- [Falcon host-action sample](falcon-host-action-source.md) and [authentication](falcon-auth-source.md): requesting containment, token freshness and authority.
- [Splunk LSASS detection](splunk-lsass-source.md): telemetry, rule conditions, field/macro dependencies and test limits.
- [Sentinel contributed playbooks](sentinel-playbooks-source.md): manager approval versus device isolation; [Defender action API contract](defender-action-contract.md) explains completion states.
- [Cortex isolation graphs](pan-isolation-source.md): version-specific dispatch, one product branch and a test graph.
- [FortiSOAR incident connector](fortinet-sentinel-source.md): incident retrieval/update, authentication and configuration.

## Inspect individual AI mechanisms

- [Charlotte AgentWorks invocation, approval pauses and credits](charlotte-agentworks-contract.md).
- [Microsoft phishing investigator](microsoft-phishing-agent.md) and [randomized-trial limitations](microsoft-phishing-trial.md).
- [Microsoft DTDA research/evaluation](microsoft-dtda-evaluation.md).
- [AgentiX action permissions, data handling and retention](pan-agentix-controls.md).
- [Google platform orchestration versus the TIN feature contract](google-architecture-boundary.md).
- [Splunk Guided Response, model choice and improvement use](splunk-guided-response.md).
- [FortiAnalyzer 7.6 privacy path](fortianalyzer-ai-privacy.md) and [transparency disclosure](fortianalyzer-transparency.md).
- [Takumi blackbox benchmark limitations](takumi-blackbox-benchmark.md) and [future domestic-inference availability](takumi-domestic-inference-announcement.md).

## Follow onboarding and economic boundaries

- [Cortex versioned installation and buyer-authored deployment policy](pan-deployment-buyer-policy.md).
- [Falcon configuration and maintenance](falcon-deployment-maintenance.md).
- [Trend MDR approval/onboarding](trend-mdr-approval.md) and [isolation/task completion](trend-response-task-boundary.md).
- [Defender endpoint automation and the September 2026 interface transition](defender-automation-boundaries.md).
- [Security Copilot automatic provisioning: data, geography and roles](security-copilot-provisioning.md).
- [Takumi organization approval versus target ownership](takumi-authority-boundary.md).
- [Capacity and pricing denominators](pricing-capacity-boundaries.md), [Trend annual geography/accounting](trend-annual-economics.md), and [LAC ownership/acquisition accounting](lac-ownership-accounting.md).

## Read concrete delivery and incident artifacts

[BT's Falcon service schedule](bt-falcon-service-schedule.md) is a partner-operated offering with tier-specific responsibilities. [Cisco's historical MDR description](cisco-mdr-service-description.md) separates approval, recommendations and measured engagement. [Trend's access boundary](trend-mdr-access-boundary.md) records restricted current service descriptions. [Mandiant's buyer-hosted assessment update](mandiant-3cx-assessment.md) shows testing, customer remediation and reassessment, with a date conflict preserved. [CrowdStrike's final incident report](crowdstrike-final-rca.md) supplies a bounded technical failure case.

[Ierae SOC brochure](ierae-soc-brochure.md) adds a public sample with explicit development-stage limits. [Buyer evidence discovery](buyer-evidence-queue.md) records bounded searches and access restrictions.

## Evidence and integration rules

Provider manuals establish documented behavior; filings establish accounting boundaries; neither establishes independent effectiveness. Vendor-selected case studies and buyer-hosted vendor reports retain their authorship. Representative days/incidents are labelled reconstructions. Unknown contracts, exact models and closed internals stay unknown.

[workflow-flows.json](workflow-flows.json) provides six evidence-labelled flows for Rowan's existing reader. The existing [assessment glossary](../security-landscape/discipline-map.md) and [assessment-provider processes](../security-landscape/companies.md) remain canonical for their scopes; this library adds security-operations terminology in its comparison.

[Repository pins](repositories.json), [declared read ranges](reading-ranges.json) and [local verification](verification.json) distinguish retrieval, reading and execution. Captures/source copies remain ignored in `runs/cybersecurity-firms-20261017/`. Zero missing local links is a navigation check, not research completion.

[Managed FortiGate operating scope](managed-fortigate-service.md) adds another dated service example. Diagram data now includes six flows.

See [LAC latest standalone accounts and completed operating merger](lac-latest-standalone-accounts.md) for the newer, separately scoped notice.

Further evidence: [NRI AI controls](nri-agenticblue-controls.md) and [Cisco XDR Premier contract](cisco-xdr-premier-contract.md).

Further operating evidence: [Mandiant processing outage](mandiant-processing-incident.md), [Duke endpoint health checks](falcon-buyer-health-check.md), and [LAC two-SIEM service models](lac-xpdr-operating-boundary.md).

[Coverage audit](coverage-audit.md) maps every provider to its detailed operating evidence and retained limitations.

[Reader handoff](reader-handoff.md) records integration order, evidence labels and validation boundaries.
