# CrowdStrike: endpoint telemetry, managed response and AI triage

**Accessed 2026-10-17; active dossier.** CrowdStrike's [founder IPO account](https://www.crowdstrike.com/en-us/blog/crowdstrike-celebrates-ipo/), published in 2019, describes a 2011 response to ineffective endpoint security: combine breach prevention with a cloud-native platform. It is a founder's retrospective, not independent history. A [2018 Japan expansion announcement](https://www.crowdstrike.com/en-us/press-releases/crowdstrike-expands-operations-within-japan-registers-massive-growth-in-region/) establishes Japanese operations at that date; historical growth/market-share claims are not current rankings.

## Business and scope

Falcon is a product platform; Falcon Complete adds managed detection and response (MDR); consulting and incident response are separate services. The current [Complete page](https://www.crowdstrike.com/en-us/services/falcon-complete-next-gen-mdr/) describes telemetry across endpoints, identity, cloud, SaaS and third-party sources, with experts, automation and managed remediation. This does not mean an endpoint-only package automatically buys every source or forensic engagement.

The buyer's purchased problem changes with the offering: endpoint/security engineers need deployed prevention and investigation tooling; a CISO may buy an outsourced operating team; an incident owner needs a scoped investigation. Service-provider distribution adds another party's responsibilities. The [financial anchor note](financial-anchors.md) now records the primary release extract; full recognition/geographic analysis remains pending: the attempted investor-results page returned 403 and was not retried or bypassed.

Acquisitions extend the platform beyond its original endpoint design. [SGNL](https://www.crowdstrike.com/en-us/blog/crowdstrike-to-acquire-sgnl/) (2026-01-08) and [Onum](https://www.crowdstrike.com/en-us/blog/crowdstrike-to-acquire-onum/) announcements describe identity authorization and telemetry pipelines. These specific pages establish **agreements**, not closing dates, integration completeness or realized revenue. The later annual-report acquisition notes remain a priority.

## Delivery: what is established and what is not

The endpoint sensor is installed on managed hosts, collects evidence and applies configured prevention/content. Cloud services analyze cross-domain data and surface detections. A customer operating the product investigates and chooses response; Complete adds provider analysts who investigate and remediate within the purchased mandate. Sensor rollout, source connections, permissions, exclusions, escalation contacts and authority to act need to be agreed during onboarding. The [public configuration/maintenance trace](falcon-deployment-maintenance.md) now separates local privilege, CID, sensor/API regions and update-policy membership. Complete installation prerequisites and direct-customer operating terms remain open.

The Complete page claims full-cycle remediation and reports containment/response metrics. Its footnotes define containment from initial detection to controls applied and acknowledge offline hosts/incident complexity. Business Value Assessments are conducted with selected customers. These are vendor-reported outcomes, not an independent service-level distribution or universal contractual promise.

## Charlotte AI: classify first, route action separately

The [2025-02-13 Detection Triage explanation](https://www.crowdstrike.com/en-us/blog/agentic-ai-innovation-in-cybersecurity-charlotte-ai-detection-triage/) describes endpoint detections as input, AI trained using provider triage decisions as mechanism, and classification, priority and recommended next action as output. Fusion automation can route a ticket or perform configured containment using that result. Customer-defined autonomy governs final action.

Its over-98% figure is agreement with Falcon Complete human triage decisions, not proven ground-truth accuracy for every environment. The “40 hours/week” calculation multiplies alert counts by an estimated five-minute manual baseline. It is not a directly observed randomized time study. Exact model, retained inputs, regional processing and rollback are not established by this article. Current product pages advertise additional agentic capabilities; their manuals must be read separately rather than retroactively assigning them to this launch.

## A real failure illuminates the update boundary

The [preliminary July 2024 incident review](https://www.crowdstrike.com/en-us/blog/falcon-content-update-preliminary-post-incident-report/) distinguishes sensor releases from rapidly delivered content configuration. A defective July 19 content update caused Windows crashes; reverting its distribution did not itself repair every crashed host. The review attributes failure to validator/interpreter handling and proposes stronger testing, canaries and customer content controls. These were then remediation commitments, not proof they had already shipped. The [final RCA is now read](crowdstrike-final-rca.md); later implementation verification remains open.

This is operationally relevant: updating the endpoint program and updating the content it interprets have different control paths. Model-based prevention and behavioral content matching are also distinct mechanisms.

## Representative day and incident

**Illustrative inference:** customer staff check sensor/source health and asset coverage; analysts or Complete review a detection and its AI triage, correlate related evidence, and apply the permitted response. Customer teams own business recovery tasks outside that mandate and validate service availability afterward. If a host is offline, a queued platform command is not evidence of containment.

During suspicious execution, a classification can lead to a containment workflow, an analyst investigation and removal of malicious persistence under the service scope. Restoration of business data, credential resets, broader forensic preservation and regulatory reporting require their own accountable steps. No customer engagement was observed here.

Public [FalconPy @ 06a5df86bc68e492db339dccacdff4a9b9ad61ec](https://github.com/CrowdStrike/falconpy/tree/06a5df86bc68e492db339dccacdff4a9b9ad61ec) is pinned; the [selected host-action/sample/test trace](falcon-host-action-source.md) is now available, with [authentication and logging traced](falcon-auth-source.md) and remaining dependencies explicitly partial. SDK access does not expose proprietary sensor/Charlotte internals.

Further delivery evidence: [BT partner service schedule](bt-falcon-service-schedule.md) is a separate ordered offering, not direct Complete terms. [Authentication source trace](falcon-auth-source.md) separates token freshness from action authority.

## Current agent invocation contract

The [AgentWorks manual and credit trace](charlotte-agentworks-contract.md) documents version selection, read/write scopes, asynchronous execution, observation and approval pauses. It extends this dossier beyond the older Detection Triage launch; it does not expose the closed reasoning engine.

See [public master-term boundaries](falcon-public-terms-boundary.md) for installation, data categories and the distinction between contractor access and managed-response authority.

Buyer operating evidence: [Duke Falcon health checks](falcon-buyer-health-check.md), including the difference between heartbeat, successful communication and protection.
