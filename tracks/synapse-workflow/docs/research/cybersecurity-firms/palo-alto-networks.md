# Palo Alto Networks: network controls, SOC automation and scoped managed action

**Accessed 2026-10-17; active dossier.** The [historical corporate backgrounder](https://media.paloaltonetworks.com/documents/Palo_Alto_Networks_Corp_Backgrounder.pdf) records founding in 2005 and first products in 2007; its network-security origin is a dated positioning statement. The [Japan ten-year retrospective](https://www.paloaltonetworks.com/blog/2019/07/trusted-partner-in-japan/?lang=ja) establishes a Japanese subsidiary history, not current local revenue.

## Expansion and economics

The [2026-02-11 CyberArk closing announcement](https://www.paloaltonetworks.com/company/press/2026/palo-alto-networks-completes-acquisition-of-cyberark-to-secure-the-ai-era) establishes acquired identity-security capability. The [2026-09-01 fiscal results](https://www.paloaltonetworks.com/company/press/2026/palo-alto-networks-reports-fiscal-fourth-quarter-and-fiscal-year-2026-financial-results) also describes the Console acquisition. This is a platform assembled through internal development and acquisitions; ownership does not prove instant product integration.

The results report Q4 FY2026 revenue of $3.41B and next-generation security annual recurring revenue of $9.10B. Those are different measures and periods. The full release tables report FY2026 revenue of $11.48B: $2.28B product and $9.20B subscription/support. ARR annualizes a selected active-contract perimeter; it is not annual recognized revenue. The annual filing retrieval returned SEC 403; it was not retried or rerouted. Product breadth includes network, cloud, security operations, AI and identity; Unit 42 adds intelligence, incident response and managed services. A firewall subscription is not an unlimited consulting or SOC contract.

## A concrete managed-service approval matrix

The [Cortex XDR 5.x action-permissions manual](https://cortex-docs.paloaltonetworks.com/cortex-xdr-5.x/configure-cortex-xdr/managed-services-configuration/configure-actions-permissions) documents Unit 42 authority independently **per action and per server/workstation asset type**:

- **Inform:** request approval from designated escalation contacts; no execution until approval.
- **No:** provider is not authorized to perform the action.
- **Yes:** provider may act without prior approval.

Actions include retrieving endpoint files, live terminal, endpoint isolation, scripts, file destruction, support-file retrieval, process termination and file quarantine. Inform requires an escalation contact. This is stronger operational evidence than a generic “human in the loop” slogan. File deletion is irreversible; quarantining preserves the file. The customer must configure the mandate to match asset importance. These are managed-service permissions, not proof that all AgentiX tools inherit an identical matrix.

## Telemetry and response path

The supported agent/source must first be deployed and connected, then data and detection policies configured. Cases and issues support investigation; allowed actions operate on managed assets. Public navigation identifies data connectors, API keys, deployment steps and endpoint protection, and a [versioned macOS deployment/buyer-policy trace](pan-deployment-buyer-policy.md) now adds local permission and installation-time response restrictions. Other deployment paths remain unread. Do not infer exact OS privileges, default retention, tenant-region controls or network isolation exceptions from the permission table alone.

In an illustrative incident, an analyst correlates suspicious execution and requests workstation isolation. If configured Yes, Unit 42 can isolate without waiting; if Inform, it waits for the customer contact; if No, it must use another authorized response or customer handoff. After containment, eradication/recovery and business verification remain separate outcomes.

## AgentiX AI mechanism

The current [AgentiX product page](https://www.paloaltonetworks.com/cortex/agentix) describes agents grounded in organization context, able to plan and execute workflows through integrations/MCP, with roles and configurable approval boundaries. Before: analysts manually search, summarize and coordinate playbooks. After: agents can prepare and execute assigned workflow work while people define authority and supervise.

This establishes vendor-described features, not a reviewed model implementation or benchmark. Its claim that over 1,000 customers enabled AgentiX is adoption reporting, not measured quality. Exact model routing, prompt retention, residency, failed-action recovery and prices require technical/contractual evidence. A product tour or forthcoming-feature announcement does not establish every deployment's version/license.

The [demisto/content repository @ e46f08b8fafc9207f4f658fca4fa949c3ffd687d](https://github.com/demisto/content/tree/e46f08b8fafc9207f4f658fca4fa949c3ffd687d) is pinned for integration/playbook inspection. Its content is not the closed AgentiX orchestration engine. The [selected isolation graph, CrowdStrike child and test](pan-isolation-source.md) are now read; integration execution and other branches remain partial.

Daily work and incident steps above are reconstructions, not observed operations. Next: detailed endpoint deployment, incident artifacts and buyer-authored outcomes; canonical control and selected source traces below supersede earlier product-page unknowns.

The [AgentiX control manuals](pan-agentix-controls.md) now establish assigned actions, invoking-user permissions, sensitive-action approval, regional processing and six-month chat/artifact retention. Closed model implementation remains unknown.

[Buyer-authored deployment governance and versioned macOS prerequisites](pan-deployment-buyer-policy.md) separate customer rollout policy, OS permission, installed restrictions and provider response authority.
