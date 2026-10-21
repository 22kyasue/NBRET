# Companies, products and delivery processes

As of **2026-10-17**. This is a representative, evidence-weighted sample. Descriptions below are **primary / vendor** unless explicitly called an engagement artifact or inference. Public pages establish what is sold and documented, not actual service reliability. No vendor product was executed in this investigation.

## Who sells what

Buyer and purchased-problem columns are this investigation's interpretation of the cited offerings. “Undisclosed” means not established by the reviewed material, not that a vendor refuses to disclose it.

| Provider | Business / delivery | Likely buyer and purchased problem | Scope / outputs / support | Evidence limits |
| --- | --- | --- | --- | --- |
| Tenable Nessus Professional | Licensed practitioner software | Consultant or vulnerability team buying repeatable assessment capacity | Plugin/template assessments, prioritization and configurable exports | Does not buy an expert-led engagement or guarantee novel business-logic discovery. [Product](https://www.tenable.com/products/nessus/nessus-professional) |
| Cobalt | Platform plus expert community; hybrid PTaaS and separately promoted autonomous offering | AppSec/security teams buying testing capacity, coordination and assurance reports | Multiple app/API/network/cloud/AI offerings, collaboration and fix verification | Do not transfer human-service promises to every autonomous package. [Service](https://www.cobalt.io/penetration-test) |
| HackerOne Pentest | Scoped staffed testing through a researcher platform; separate from open bounty participation | Security teams buying accountable assessment effort and reporting | Asset/role scoping, named lead, findings, debrief and retests | Bounty discovery and time-boxed pentesting are different purchases. [Process](https://docs.hackerone.com/en/articles/8538644-pentest-phases-and-terminology) |
| Trail of Bits | Specialist consulting with engineering artifacts | Product/security engineering buying deep design/code review and usable prevention tooling | Multidisciplinary software/AI/crypto review, findings and fix review | General service descriptions do not prove every artifact ships in every contract. [Service](https://trailofbits.com/services/software-assurance/) |
| Mandiant / Google Cloud | Specialist objective-led red-team consulting | CISO/SOC leadership buying evidence of attacker reach and response readiness | Customized objectives, attack narrative, technical and executive reports | Broad service claims leave detailed operational controls undisclosed. [Service](https://cloud.google.com/security/consulting/mandiant-red-team?hl=en) |
| NCC Group | Broad technical-assurance consulting plus other managed offerings | Product, infrastructure and assurance owners buying specialist breadth | Manual plus automated assessments; application, cloud, network and hardware practices | Service breadth is not a reconstructed delivery process. [Service](https://www.nccgroup.com/penetration-testing-services/) |
| AttackIQ | Control-validation software and managed variants | Detection/security engineering buying repeatable defense measurements | Selected emulation scenarios, control results and remediation/retest cycles | Scenario execution does not establish novel path discovery. [Blueprint](https://www.attackiq.com/blueprints/phase-1-automated-security-validation/) |
| Pentera | Automated validation platform with advertised advisory/testing services | Exposure/security owners buying demonstrated paths and repeat validation | Internal/external/cloud execution layers and remediation routing | Marketing “proven” is not independently measured here. [Platform](https://pentera.io/pentera-platform/) |
| Horizon3.ai NodeZero | SaaS-directed autonomous testing with local execution options | Infrastructure/security teams buying path evidence and repeat fix checks | Internal/external/cloud/Kubernetes operations, path reports and Quick Verify | Agentless does not mean execution-free: internal testing uses a host. [Platform](https://horizon3.ai/nodezero/) |
| Detectify | Subscription discovery and dynamic testing informed by researcher content | AppSec/exposure owners buying changing asset visibility and repeat checks | Surface discovery, authenticated app scanning and API testing | Asset attribution, unknown business workflows and test limitations still need review. [Platform](https://detectify.com/) |

These are overlapping offerings. “PTaaS,” “BAS,” “CTEM,” “agentic” and “continuous” do not independently specify access, test depth, staff effort or accountable deliverables.

## Process A: staffed platform pentesting

### HackerOne: documented commercial workflow

1. Customer prepares asset/role scope; HackerOne sizes required skills and effort and quotes.
2. A technical engagement manager handles kickoff, credentials and environment preparation; a lead and supporting testers are assigned.
3. Testers execute the agreed work, maintain coverage checklists and send updates. The lead validates, deduplicates and quality-checks submissions before delivery.
4. Findings arrive during testing; a report follows, with a debrief and customer-requested retests.

The reviewed August 21, 2026 documentation describes two calendar weeks of testing, 40 hours per tester, P40–P200 sizes, report delivery in 3–5 business days and 30–90-day retesting depending on tier. These are documented terms, not measured turnaround. No numerical public price was established. [Process](https://docs.hackerone.com/en/articles/8538644-pentest-phases-and-terminology)

The separate RoE requires screening/identity checks, engagement-specific scope, official communication channels and confidentiality; public disclosure needs customer approval. It calls for deletion of locally or third-party-stored documentation after completion and retests. This establishes a stated handling obligation, not verified deletion, platform retention policy, or a complete customer authorization contract. [RoE](https://www.hackerone.com/policies/pentest-rules-of-engagement)

**Unknown:** per-engagement permission wording, exact tool policy, cleanup verification, internal reviewer independence, escalation response times and QA rejection/error rates.

### Cobalt: in-house workflow must be distinguished from purchased Core delivery

The in-house instructions tell an assigned tester to read targets, dates, credentials and requirements; coordinate in chat; test using suitable methods; and update coverage. A Nuclei-backed detector produces potential vulnerabilities. The tester discards or promotes them, writes reproduction, request, prerequisites, realistic impact and a suggested fix, then triages as invalid, duplicate, out of scope or pending fix. Findings and draft states are finalized before remediation. Retesting returns a finding to fixed or pending fix. A report summarizes scope, constraints, results and recommendations. Checklists explicitly do not define exhaustive completion. This is strong evidence of platform workflow, not proof that Core freelancers follow identical internal QA. [In-house instructions](https://docs.cobalt.io/guide/articles/complete-an-in-house-pentest-for-pentesters-y7RCf5izE6)

The commercial service describes expertise matched to the technology, live collaboration, ticket integrations, stakeholder reports and six- or twelve-month retest windows. [Service](https://www.cobalt.io/penetration-test)

**Unknown:** Core report-review staffing, final liability terms, environment teardown, artifact retention/deletion and independent measured quality. Preparation fields are not proof of legal authorization.

## Process B: specialist software assurance

Trail of Bits describes technical onboarding and artifact collection by a project manager, specialist team assembly, parallel review with cross-discipline integration, continuous discussion and weekly syncs, final readout, and optional-return fix review. It advertises reusable rules, fuzzing/invariant harnesses and SDLC recommendations alongside findings. These are vendor-described deliverables, not proof of universal delivery or superiority over other firms. [Software assurance](https://trailofbits.com/services/software-assurance/)

**Engagement artifact:** the October 15, 2026 sigstore-rust report identifies two consultants, July 6–August 3 work totaling 3.5 engineer-weeks, kickoff/status/readout milestones, full source/document access and a target commit (`6d268a5d8005e5c3e91a44c20fcfd557f514e668`). Its coverage section names reviewed flows and excludes further review of `sigstore-sign` and `sigstore-cache`. It separates severity from difficulty, identifies code locations and gives short/long-term recommendations. This is evidence of a real bounded assessment artifact; we did not reproduce its vulnerabilities or establish that all fixes were accepted. [Pinned report](https://raw.githubusercontent.com/trailofbits/publications/abba1a6033b85035e3858de17ce939ffa96044da/reviews/2026-10-sigstore-rust-securityreview.pdf), PDF pages 3–12 reviewed; original saved locally with hash in `sources.json`.

**Unknown:** signed RoE, internal second-review procedure, exact test/tool inventory, time per finding, retention, patch-review scope and post-review regression outcomes.

Its AI service separately describes scoping models/pipelines/artifacts/agent loops; inspecting data provenance, CI/CD, serialization and hardware; adversarial/capability testing; root-cause analysis; and reporting/retesting. That treats AI as a system under assessment. It is broader than a model-output jailbreak score. [AI/ML service](https://trailofbits.com/services/ai-ml/)

## Process C: objective-led adversary assessment

Mandiant describes deciding starting knowledge, relevant threat intelligence and objectives with leadership; reconnaissance using intelligence/OSINT; attempts at access, privilege expansion and persistence; then non-disruptive pursuit of the agreed goal. Consultants produce technical steps/remediation and executive recommendations, with emphasis on detection and response. This is an objective-led narrative rather than exhaustive asset scanning. [Service](https://cloud.google.com/security/consulting/mandiant-red-team?hl=en)

**Unknown:** the public page does not disclose detailed signed authorizations, operator/tool restrictions, payload safety validation, live approvals, stopping latency, cleanup receipts, independent QA or retest/retention contract. “Non-destructive” is a vendor safety claim, not a demonstrated guarantee. This task performs none of those operations.

## Process D: recurring control validation

AttackIQ's blueprint specifies goals/stakeholders/RoE, scope/responsibilities/scenarios, deployment and execution, contextual interpretation, remediation, retest, then continuous operation. It includes event logs, network controls and SIEM in the validation question. Automation executes selected behaviors; customers still need to interpret and improve their defensive operation. Managed and self-managed offerings differ. [Blueprint](https://www.attackiq.com/blueprints/phase-1-automated-security-validation/)

**Unknown:** reviewed public material does not establish all test preconditions, per-action approvals, sensor-correlation reliability, cleanup verification, pricing or independent customer performance. A missing alert could mean a test never ran, telemetry was absent, a query failed, or a rule missed it.

## Process E: automated attack-path validation

NodeZero describes creating an operation, preparing an internal Docker/OVA host or using external cloud execution, choosing operation settings, watching autonomous execution, reviewing prioritized paths/proof, fixing weaknesses and running Quick Verify. Ephemeral cloud resources are an architecture claim; their teardown and all local artifacts were not independently verified. Public numeric pricing, human-review coverage, hard network-scope enforcement and error rates remain unestablished. [Platform](https://horizon3.ai/nodezero/)

Pentera describes coordinated internal/external/cloud testing, customer-defined scope/timing, attack-path context, deduplication, prioritization, routing and revalidation, with an AI interface and separate services. This does not disclose the complete internal planner or validation oracle. Reviewed claims about confidentiality/retention and safety require contract/architecture verification before sensitive use. [Platform](https://pentera.io/pentera-platform/)

## Process F: discovery and scanner operations

Tenable's product page establishes deployable templates/plugins, historical-result reassessment, prioritization and exports; it leaves operators responsible for assessment scope and follow-through. It does not establish each check's exploit validation or human review. [Nessus](https://www.tenable.com/products/nessus/nessus-professional)

Detectify advertises domain/subdomain/IP/port discovery, payload testing, authenticated app crawling, API coverage and a researcher-to-test pipeline. Its customer totals, speed and coverage statistics are self-reported. Internal triage logic, attribution error rates, signed authorization, retention and cleanup are not reconstructed from the homepage. [Platform](https://detectify.com/)

## Commercial details actually observed

Prices below are observed page displays, not quotations or total ownership costs. Do not compare them as equivalent tests.

| Offering | Public commercial evidence on 2026-10-17 | Important qualification |
| --- | --- | --- |
| Nessus Professional | Page displayed USD $4,790 / one year, $400 advanced support and $275 training | License purchase, not a staffed pentest; locale/tax/terms can differ. [Source](https://www.tenable.com/products/nessus/nessus-professional) |
| Cobalt autonomous web test | Promotional $3,500/test; listed findings in 24 hours and Core oversight; completion deadline December 31, 2026 | Promotion and scope matter; not a generally applicable manual pentest price. [Pricing](https://www.cobalt.io/platform/pricing) |
| Cobalt staffed tiers | Standard/Premium/Enterprise quote-based annual credits; credit described as eight traditional-hour equivalents combining humans/automation | Not necessarily eight logged human hours. Rollover table and FAQ appear inconsistent; retest wording also varies. Confirm contract rather than infer. [Pricing](https://www.cobalt.io/platform/pricing) |
| HackerOne | Scoped hours/consumption model | No public numeric amount established. [Process](https://docs.hackerone.com/en/articles/8538644-pentest-phases-and-terminology) |
| Other sampled consulting/validation providers | No numeric price established from reviewed pages | “Not established” does not mean no public price exists elsewhere. |

## Adoption and outcome evidence, with selection limits

Cobalt's undated, vendor-hosted [Pendo customer story](https://www.cobalt.io/customers/pendo), accessed 2026-10-17, attributes to the customer's CISO a complex-app engagement with five complementary testers, Slack clarification during testing, and retests requested through the platform and handled by the original finder. It supports a concrete coordination/remediation use case. Its cost/value and quality comparisons are selected testimonial claims, without published matched baselines, raw findings or denominator. It does not establish current staffing or a market-wide advantage.

Horizon3's [February 3, 2025 financial-services article](https://horizon3.ai/intelligence/blogs/securing-financial-services-from-promises-to-proof-with-nodezero/) describes an unnamed institution and a path found within 16 hours, followed by remediation and continued use. This is vendor-selected customer-environment evidence, weaker than independently reproducible receipts. Customer identity, scope, starting access, failures, costs and before/after verification data are not established. It cannot be compared with a CTF success percentage or our millisecond fixture times.

The sigstore-rust artifact above is more inspectable about scope, people, effort and exclusions, but it remains assessor-authored. No independently controlled customer-environment benchmark or representative adoption survey was established in this pass. Counts and case studies are not converted into market size or universal reliability claims.

## What remains necessary across engagements

This is an **inferred procurement/review framework**, not an invented common internal workflow: verify ownership and written permission; define roles, data and excluded techniques; prepare accounts and known positive controls; record test selection and omissions; independently reproduce material findings; agree severity/business impact; deliver reproducible evidence; track fixes and retest conditions; revoke test access and verify cleanup; settle retention and ongoing support. The company evidence above tells us which of these are public, and which remain unanswered.
