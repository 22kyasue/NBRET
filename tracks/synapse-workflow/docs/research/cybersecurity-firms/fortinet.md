# Fortinet: an enforcement fabric and the workflows around it

**Accessed 2026-10-17; active dossier.** Fortinet's [company page](https://www.fortinet.com/corporate/about-us/about-us) traces founding to 2000. Its [Japan profile](https://www.fortinet.com/jp/corporate/about-us/company) dates the Japanese company to February 2003. The network-security origin now spans secure networking, cloud-delivered access and security operations. The [Lacework completion announcement](https://www.fortinet.com/jp/corporate/about-us/newsroom/press-releases/2024/fortinet-completes-acquisition-of-lacework) records the acquisition effective 2024-08-01; cloud protection breadth is therefore not solely organic development.

## What the business measures

The [2025 results](https://investor.fortinet.com/news-releases/news-release-details/fortinet-reports-strong-fourth-quarter-and-full-year-2025) report $6.80B revenue, of which $2.22B is product. Service includes security subscriptions/support rather than only analyst labor. This distinction matters when comparing Fortinet to a Japanese consulting/MSSP business. Direct capture returned 403; the primary indexed results were available through search, with no retry/bypass. Selected annual-report channel/geography sections are now documented below; the whole filing remains partial.

A customer may buy appliances/software, subscription updates, a management/analytics platform or separately scoped services. Network engineers, security operators, resellers and managed-service providers operate different parts. Buying FortiGate does not mean Fortinet itself runs the customer's daily SOC.

## A deterministic automation path, before discussing agents

The [FortiAnalyzer 7.6 trigger/task manual](https://docs.fortinet.com/document/fortianalyzer/7.6.0/administration-guide/592522/playbook-triggers-and-tasks) defines one initial trigger per playbook: matching event, matching incident, schedule or manual demand. With no filters, all relevant events/incidents trigger it. Tasks execute on FortiAnalyzer or connector-linked devices after preceding linked tasks finish. Inputs can come from defaults, trigger data or previous tasks. FortiOS actions depend on automation rules configured on FortiGate.

This is an operational chain: source event → selected trigger → task inputs → connector/device action. It is not inherently an LLM. The [playbook manual](https://docs.fortinet.com/document/fortianalyzer/7.6.0/administration-guide/028682/playbooks) requires the relevant administrator profile permissions; exact connector privileges and approval handling need their own configuration documentation.

## FortiAI: distinguish assistance, orchestration and security for AI

The current [FortiAI Assist page](https://www.fortinet.com/products/fortiai-assist) describes several different mechanisms. FortiAnalyzer uses telemetry and intelligence for natural-language queries/reports. FortiManager can generate/configure policies and support troubleshooting. FortiSOC correlates alerts, assets and activity and selects workflows under customer controls. FortiSOAR combines agents with playbooks and human supervision. FortiAIOps uses network telemetry to detect/baseline trends and describes a recommend/generate/execute/validate loop.

Those are product-specific vendor claims. They do not disclose one universal model, one approval policy or one retention period. “Protect” detection ML, “Assist” generative/agentic operations and “SecureAI” protections for AI workloads are different questions; protecting a model does not prove that a model decides every network block. Full version/license/release-note mapping remains open.

## Responsibility and representative work

**Illustrative inference:** customer or partner deploys enforcement devices and collectors, connects analytics, defines baselines/filters and configures connector credentials. Operators inspect events and any AI-generated analysis, authorize or preconfigure response workflows, then monitor task outcomes. Provider updates and support do not remove customer responsibility for business impact, backups and change management.

For a suspected compromised host, an event may trigger an allowed quarantine/block task. Successful task submission is not proof the host was isolated or application service recovered. Outcome polling, offline-device handling, compensating changes and retest need explicit artifacts. Initial blocking does not replace a separate forensic investigation.

The [selected pinned FortiSOAR–Sentinel connector trace](fortinet-sentinel-source.md) now explains incident retrieval/update, authentication, configuration and missing test/dependency boundaries. This is a different product from FortiAnalyzer. Next: exact FortiAI version/approval/audit manuals, broader product boundaries and public customer evidence. No Fortinet software was installed or operated.

The [FortiAnalyzer 7.6 AI privacy manual](fortianalyzer-ai-privacy.md) now traces masked prompt, proxy/cloud model, callback and local query. Its scope does not establish other FortiAI products’ inference or retention behavior.

[FortiAnalyzer transparency disclosure](fortianalyzer-transparency.md) supplies additional version-scoped evidence.

[Managed FortiGate service scope](managed-fortigate-service.md) adds a distinct operating offering.

The [Fortinet annual channel/geography/accounting trace](fortinet-annual-economics.md) now supplies selected filing evidence; full-document reading is not claimed.
