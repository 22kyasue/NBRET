# Security providers: services, contracts, AI claims, SLAs

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 10 findings, 11 related corrections, 1 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.takumi-connect-repo`** [cybersecurity-firms/gmo-flatt-security.md:35](../../cybersecurity-firms/gmo-flatt-security.md#L35): An agent evaluating Takumi could upload NBRET or client code or install the write-enabled GitHub App. **Instead:** Do not upload code or install apps without explicit approval (gmo-flatt-security.md:35; takumi-github-scope-boundary.md:11).

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [Cobalt: Nuclei-backed candidates promoted by tester; 6/12-month retest windows](#commercialcobalt-workflow-and-retest-windows) | public-doc | testing, triage, reporting, retest |
| [Security-AI retention differs per feature (30d/90d/6mo); opt-out is not deletion](#providersai-feature-retention-clocks) | public-doc | operations, scoping, commercial |
| [Security Copilot auto-provisioning turns on M365 data access and broad role inheritance](#providerscopilot-onboarding-defaults) | public-doc | scoping, authorization, operations |
| [Six delivery models; agentless != execution-free; missing alert has four causes](#providersdelivery-model-unknowns) | public-doc | commercial, operations |
| [GMO Ierae Smart Blocking executes blocks automatically; approval and rollback undocumented](#providersgmo-ierae-smart-blocking-executes) | public-doc | operations, commercial, authorization |
| [Google SecOps TIN agent: SIEM alerts only, ~60s average, 20-min max, no overflow queue](#providersgoogle-tin-bounded-investigation) | public-doc | operations, triage |
| [Japan data storage does not mean Japan AI inference (Takumi, Security Copilot)](#providersjapan-storage-not-japan-inference) | public-doc | scoping, operations, commercial |
| [LAC JSOC: LAC Falcon is not CrowdStrike; its AI is operated third-party vendor tech](#providerslac-jsoc-operated-third-party-ai) | public-doc | commercial, operations |
| [Vendor case studies and promo turnaround are selected testimony, not outcome statistics](#commercialvendor-outcome-evidence-weak) | vendor-claim | commercial |
| [NRI AgenticBlue: fixed-phase agent SOC with reviewer gates and deterministic tenant hook](#providersnri-agenticblue-gated-agent-soc) | vendor-claim | operations, ai-evaluation, authorization |

### commercialcobalt-workflow-and-retest-windows

**`commercial.cobalt-workflow-and-retest-windows`: Cobalt: Nuclei-backed candidates promoted by tester; 6/12-month retest windows** (public-doc)

Cobalt in-house tester instructions: read targets/dates/credentials, coordinate in chat, test, update coverage; a Nuclei-backed detector produces potential vulnerabilities which the tester discards or promotes with reproduction, request, prerequisites, realistic impact and suggested fix; triage states invalid/duplicate/out-of-scope/pending fix; retest returns a finding to fixed or pending fix. Checklists explicitly do not define exhaustive completion. The commercial service advertises six- or twelve-month retest windows.

**Do:** Scanner output should be candidate input that a human promotes with reproduction and impact, never a direct finding. Offer a defined retest window and do not present a checklist as completeness.

**Limits:** Platform workflow evidence, not proof that Core freelancers follow identical QA; report-review staffing, liability, teardown and retention are unknown.

**Sources:** [security-landscape/companies.md:41](../../security-landscape/companies.md#L41), [security-landscape/companies.md:41](../../security-landscape/companies.md#L41), [security-landscape/companies.md:43](../../security-landscape/companies.md#L43)

**Contrary or narrowing evidence:**
- [security-landscape/companies.md:45](../../security-landscape/companies.md#L45): Platform intake does not replace written permission.

### providersai-feature-retention-clocks

**`providers.ai-feature-retention-clocks`: Security-AI retention differs per feature (30d/90d/6mo); opt-out is not deletion** (public-doc)

Trend Companion retains prompts up to 30 days (500-prompt session limit) and action audit logs 180 days, and data may be processed outside the account region. FortiAnalyzer 1.1 logs proxy requests/responses up to 90 days and newly typed sensitive values can escape masking. PAN AgentiX keeps cases and assistant chats/artifacts six months by default. Splunk ES training opt-out stops new use but does not delete previously collected data. Microsoft's privacy page gives both 90-day and 180-day shared-data retention.

**Do:** Inventory each AI feature's prompt, artifact, audit and training-use retention separately before putting client data through it, and record the governing document date.

**Limits:** Feature- and version-specific documentation; no tenant settings were inspected and contract terms may override.

**Sources:** [cybersecurity-firms/trend-micro.md:17](../../cybersecurity-firms/trend-micro.md#L17), [cybersecurity-firms/fortianalyzer-transparency.md:9](../../cybersecurity-firms/fortianalyzer-transparency.md#L9), [cybersecurity-firms/pan-agentix-controls.md:11](../../cybersecurity-firms/pan-agentix-controls.md#L11), [cybersecurity-firms/splunk-guided-response.md:17](../../cybersecurity-firms/splunk-guided-response.md#L17), [cybersecurity-firms/microsoft-phishing-agent.md:38](../../cybersecurity-firms/microsoft-phishing-agent.md#L38)

### providerscopilot-onboarding-defaults

**`providers.copilot-onboarding-defaults`: Security Copilot auto-provisioning turns on M365 data access and broad role inheritance** (public-doc)

For eligible E5/E7 tenants, auto-provisioning creates capacity and a default workspace; two human-review/model-improvement sharing settings default off, while access to Microsoft 365 service data defaults on. Owner inheritance extends beyond Global Administrator to security, conditional-access, Intune and named compliance administrators. Capacity provisioning does not deploy agents.

**Do:** When onboarding a client's Copilot-based tooling or assessing their tenant, review storage, processing geography, service-data access and inherited owner/contributor roles as part of the engagement.

**Limits:** Manual updated June 18, 2026; no tenant inspected.

**Sources:** [cybersecurity-firms/security-copilot-provisioning.md:9](../../cybersecurity-firms/security-copilot-provisioning.md#L9), [cybersecurity-firms/security-copilot-provisioning.md:11](../../cybersecurity-firms/security-copilot-provisioning.md#L11), [cybersecurity-firms/pricing-capacity-boundaries.md:13](../../cybersecurity-firms/pricing-capacity-boundaries.md#L13)

### providersdelivery-model-unknowns

**`providers.delivery-model-unknowns`: Six delivery models; agentless != execution-free; missing alert has four causes** (public-doc)

Six models were documented: staffed platform pentesting (HackerOne, Cobalt), specialist software assurance (Trail of Bits), objective-led adversary assessment (Mandiant), recurring control validation (AttackIQ), automated attack-path validation (NodeZero, Pentera) and discovery/scanner operations (Tenable, Detectify). NodeZero internal testing uses a Docker/OVA host, so agentless does not mean execution-free; Mandiant "non-destructive" is a vendor safety claim; for AttackIQ a missing alert could mean the test never ran, telemetry was absent, a query failed or a rule missed it.

**Do:** When positioning against or partnering with these, ask for signed authorization terms, stop latency, cleanup receipts, retention and independent QA, which public pages do not disclose.

**Limits:** Primary/vendor descriptions; no vendor product was executed.

**Sources:** [security-landscape/companies.md:19](../../security-landscape/companies.md#L19), [security-landscape/companies.md:61](../../security-landscape/companies.md#L61), [security-landscape/companies.md:67](../../security-landscape/companies.md#L67)

### providersgmo-ierae-smart-blocking-executes

**`providers.gmo-ierae-smart-blocking-executes`: GMO Ierae Smart Blocking executes blocks automatically; approval and rollback undocumented** (public-doc)

GMO Cybersecurity by Ierae (341 employees, 2026-04-01) runs SOLOBAN collection and self-learning analysis for supported products such as AWS WAF, Cloudflare WAF and CrowdStrike Falcon. Smart Blocking applies blocking configuration to covered products when a serious event is found, which is execution rather than advice; per-action approval, preauthorization, exclusions and rollback are not specified. The second-opinion service can be bought alone but is not equivalent to monitoring and blocking. Its AI claims split into SOLOBAN analysis, an LLM Cyber Bulletin beta, an ML Cyber Forecast beta, and AI-system pentesting as a target.

**Do:** When competing with or partnering alongside Ierae, distinguish automated blocking scope from advisory menus and ask for written approval/rollback terms; AI-system pentesting is a market offering we may need to match.

**Limits:** Public service pages and a development-stage brochure; no signed terms, permission manifests or measured performance.

**Sources:** [cybersecurity-firms/gmo-ierae.md:24](../../cybersecurity-firms/gmo-ierae.md#L24), [cybersecurity-firms/gmo-ierae.md:28](../../cybersecurity-firms/gmo-ierae.md#L28), [cybersecurity-firms/gmo-ierae.md:54](../../cybersecurity-firms/gmo-ierae.md#L54)

**Contrary or narrowing evidence:**
- [cybersecurity-firms/ierae-soc-brochure.md:3](../../cybersecurity-firms/ierae-soc-brochure.md#L3): Brochure-derived details are not current contractual scope.

### providersgoogle-tin-bounded-investigation

**`providers.google-tin-bounded-investigation`: Google SecOps TIN agent: SIEM alerts only, ~60s average, 20-min max, no overflow queue** (public-doc)

Google's Triage and Investigation agent investigates supported SIEM-ingested alerts (SOAR-connector alerts excluded), starting by default five minutes after alert creation (configurable to 20). It outputs disposition, confidence, explanation, timeline and suggested next steps, averages about 60 seconds with a 20-minute maximum, and has no queue for overflow. Audit requires enabling Chronicle API audit configuration, and TIN is stated not FedRAMP compliant.

**Do:** If a client relies on an AI triage agent, monitor unanalyzed overflow alerts as a human queue and do not treat agent confidence as calibrated accuracy or as containment.

**Limits:** Manual description (Oct 2026); no live performance validation; architecture page describes broader automation whose configuration is unresolved.

**Sources:** [cybersecurity-firms/google-cloud-security.md:24](../../cybersecurity-firms/google-cloud-security.md#L24), [cybersecurity-firms/google-cloud-security.md:23](../../cybersecurity-firms/google-cloud-security.md#L23), [cybersecurity-firms/google-cloud-security.md:28](../../cybersecurity-firms/google-cloud-security.md#L28)

**Contrary or narrowing evidence:**
- [cybersecurity-firms/google-architecture-boundary.md:9](../../cybersecurity-firms/google-architecture-boundary.md#L9): Platform architecture page suggests broader automation; TIN manual does not establish it.

### providersjapan-storage-not-japan-inference

**`providers.japan-storage-not-japan-inference`: Japan data storage does not mean Japan AI inference (Takumi, Security Copilot)** (public-doc)

Takumi stores customer data in Japan by default but names Vertex AI, AWS Bedrock and Anthropic API as inference providers, says inference may run outside Japan, and requests zero data retention without guaranteeing it. Its paid domestic-inference option is only announced for 2026-11-02. Microsoft Security Copilot auto-provisioning stores data by Entra geography but processes non-EU prompts globally (US/UK/EU/ANZ).

**Do:** For Japanese clients, contract and document storage location, inference location, provider retention and training use separately; never infer Japanese processing from Japanese storage or a Japanese UI.

**Limits:** Provider documentation as of 2026-10-17; actual contract terms and runtime routing were not verified.

**Sources:** [cybersecurity-firms/gmo-flatt-security.md:41](../../cybersecurity-firms/gmo-flatt-security.md#L41), [cybersecurity-firms/gmo-flatt-security.md:43](../../cybersecurity-firms/gmo-flatt-security.md#L43), [cybersecurity-firms/security-copilot-provisioning.md:7](../../cybersecurity-firms/security-copilot-provisioning.md#L7), [cybersecurity-firms/takumi-domestic-inference-announcement.md:7](../../cybersecurity-firms/takumi-domestic-inference-announcement.md#L7)

### providerslac-jsoc-operated-third-party-ai

**`providers.lac-jsoc-operated-third-party-ai`: LAC JSOC: LAC Falcon is not CrowdStrike; its AI is operated third-party vendor tech** (public-doc)

LAC's JSOC reports about 740 organizations, 4,000 sensors, 16B daily logs/alerts and about 300 analysts/engineers (2025 figures). LAC Falcon is LAC's own monitoring support system, not CrowdStrike Falcon. LAC operates AI-enabled vendor products (Vectra AI NDR since February 2024) rather than owning the detection model; AI-assisted detection/analysis/response for the Splunk-based xPDR Advanced (available 2026-10-01) is future expansion. The Sentinel and Splunk xPDR services have different prerequisites (Azure Lighthouse delegation vs managed Splunk infrastructure).

**Do:** When comparing Japanese SOC providers, separate owned technology from operated third-party tools and check which xPDR variant and menu actually include isolation or emergency response.

**Limits:** Public pages; no customer contract or authorization matrix reviewed.

**Sources:** [cybersecurity-firms/lac.md:11](../../cybersecurity-firms/lac.md#L11), [cybersecurity-firms/lac.md:26](../../cybersecurity-firms/lac.md#L26), [cybersecurity-firms/lac-xpdr-operating-boundary.md:23](../../cybersecurity-firms/lac-xpdr-operating-boundary.md#L23)

### commercialvendor-outcome-evidence-weak

**`commercial.vendor-outcome-evidence-weak`: Vendor case studies and promo turnaround are selected testimony, not outcome statistics** (vendor-claim)

Cobalt's Pendo story (five complementary testers, Slack clarification, retests by original finder) and Horizon3's financial-services article (path found within 16 hours) are vendor-selected claims without matched baselines, raw findings or denominators. The sigstore-rust report is more inspectable but still assessor-authored. No independently controlled customer-environment benchmark or representative adoption survey was found.

**Do:** Do not quote vendor speed/quality numbers as market facts or compare them with CTF scores or our fixture timings; collect our own controlled measurements.

**Limits:** Sample of public pages accessed 2026-10-17.

**Sources:** [security-landscape/companies.md:97](../../security-landscape/companies.md#L97), [security-landscape/companies.md:99](../../security-landscape/companies.md#L99)

### providersnri-agenticblue-gated-agent-soc

**`providers.nri-agenticblue-gated-agent-soc`: NRI AgenticBlue: fixed-phase agent SOC with reviewer gates and deterministic tenant hook** (vendor-claim)

NRI Secure's AgenticBlue (operating in NeoSOC from 2026-08-06) encodes customer procedures as version-controlled Skills, accesses SIEMs via MCP, and runs a fixed order of triage, analysis, severity scoring and report, with reviewer agents gating phases and humans approving important stages. An implementation article describes a deterministic pre-execution hook that stops tool calls whose SIEM destination does not match the customer under investigation, plus blocks on destructive commands and unexpected writes. Automated application of detection/protection rules is roadmap only.

**Do:** Multi-tenant AI investigation should enforce tenant binding and tool allowlists in deterministic code outside the model, with structured tool logs; treat this as a design reference, not validated isolation.

**Limits:** Developer-authored description; no source, tested isolation, models or retention were inspected.

**Sources:** [cybersecurity-firms/nri-agenticblue-controls.md:7](../../cybersecurity-firms/nri-agenticblue-controls.md#L7), [cybersecurity-firms/nri-agenticblue-controls.md:10](../../cybersecurity-firms/nri-agenticblue-controls.md#L10), [cybersecurity-firms/nri-secure.md:28](../../cybersecurity-firms/nri-secure.md#L28)

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| high | [cybersecurity-firms/google-architecture-boundary.md:9](../../cybersecurity-firms/google-architecture-boundary.md#L9) | [cybersecurity-firms/google-cloud-security.md:23](../../cybersecurity-firms/google-cloud-security.md#L23) | Treat TIN as an investigation/recommendation agent; any automated closure or response requires separately verified configuration. |
| high | [cybersecurity-firms/takumi-domestic-inference-announcement.md:5](../../cybersecurity-firms/takumi-domestic-inference-announcement.md#L5) | [cybersecurity-firms/gmo-flatt-security.md:61](../../cybersecurity-firms/gmo-flatt-security.md#L61) | Assume overseas inference for Takumi unless a signed domestic-inference arrangement is in place and active. |
| high | [cybersecurity-firms/service-artifact-boundaries.md:7](../../cybersecurity-firms/service-artifact-boundaries.md#L7) | [cybersecurity-firms/lac.md:9](../../cybersecurity-firms/lac.md#L9) | Describe LAC 15 minutes as analysis-start-to-contact, not detection-to-containment. |
| medium | [security-landscape/companies.md:89](../../security-landscape/companies.md#L89) | [security-landscape/coverage.md:24](../../security-landscape/coverage.md#L24) | Do not cite Cobalt entitlements as fact without a contract. |
| medium | [cybersecurity-firms/microsoft-phishing-agent.md:38](../../cybersecurity-firms/microsoft-phishing-agent.md#L38) | [cybersecurity-firms/microsoft-phishing-agent.md:38](../../cybersecurity-firms/microsoft-phishing-agent.md#L38) | Neither figure is authoritative; confirm contractually before stating Security Copilot shared-data retention. |
| medium | [cybersecurity-firms/splunk-guided-response.md:15](../../cybersecurity-firms/splunk-guided-response.md#L15) | [cybersecurity-firms/splunk-triage-controls.md:17](../../cybersecurity-firms/splunk-triage-controls.md#L17) | Do not assume the general model setting governs Triage data routing. |
| low | [cybersecurity-firms/google-cloud-security.md:15](../../cybersecurity-firms/google-cloud-security.md#L15) | [cybersecurity-firms/google-cloud-security.md:48](../../cybersecurity-firms/google-cloud-security.md#L48) | Cite the language-specific date of the source used. |
| low | [cybersecurity-firms/service-artifact-boundaries.md:9](../../cybersecurity-firms/service-artifact-boundaries.md#L9) | [cybersecurity-firms/lac.md:9](../../cybersecurity-firms/lac.md#L9) | Cite the dated source with any volume; they are not interchangeable. |
| low | [cybersecurity-firms/microsoft-phishing-agent.md:3](../../cybersecurity-firms/microsoft-phishing-agent.md#L3) | [cybersecurity-firms/microsoft.md:5](../../cybersecurity-firms/microsoft.md#L5) | Read microsoft.md for portfolio context. |
| low | [cybersecurity-firms/cisco-splunk.md:17](../../cybersecurity-firms/cisco-splunk.md#L17) | [cybersecurity-firms/splunk-triage-controls.md:45](../../cybersecurity-firms/splunk-triage-controls.md#L45) | Training consent is documented; inference retention and Triage-specific paths remain unknown. |
| low | [cybersecurity-firms/gmo-flatt-security.md:49](../../cybersecurity-firms/gmo-flatt-security.md#L49) | [cybersecurity-firms/takumi-github-scope-boundary.md:11](../../cybersecurity-firms/takumi-github-scope-boundary.md#L11) | Treat the App manifest as unknown, not merely queued. |
