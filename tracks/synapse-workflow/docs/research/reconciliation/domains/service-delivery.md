# Service delivery: scoping, engagement process, deliverables, retest

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 23 findings, 14 related corrections, 4 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.external-strategy-path`** [synapse/research-to-service.md:7](../../synapse/research-to-service.md#L7): Agent may cite strategy proposals (prices, staffing) as approved Synapse offerings, or fail to find the files (they are in strategy/decisions/, outside the repo). **Instead:** Treat as unapproved recommendations (synapse/research-to-service.md:8); founder decisions pending.
- **`hazard.rea-ready-integration`** [2026-10-16-rea-and-security-workflows.md:230](../../2026-10-16-rea-and-security-workflows.md#L230): Agent may start pilots (installing promptfoo/garak/CALDERA/Atomic) as if approved. **Instead:** The handoff authorizes no target testing or integration (2026-10-16-rea-and-security-workflows.md:276).
- **`hazard.reproduce-lab-command`** [assessment-evidence/executable-claims.md:16](../../assessment-evidence/executable-claims.md#L16): The 'Reproduce' block invites running a research script. **Instead:** Use the retained receipt lab-receipt-20261017.json; run only with explicit user instruction (docs/research/reconciliation/README.md:5).
- **`hazard.trend-mdr-password-docs`** [cybersecurity-firms/trend-mdr-access-boundary.md:5](../../cybersecurity-firms/trend-mdr-access-boundary.md#L5): An agent might seek credentials or alternate copies of protected Trend MDR service descriptions. **Instead:** Leave them unread; no password, account access or alternate copy was sought (trend-mdr-access-boundary.md:5).

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [A direct-path fix blocked unapproved payment but still allowed payment after edit](#service-deliveryinstance-vs-class-repair) | component-lab | remediation, retest, testing |
| [The attack-path prerequisite graph models possibility only, not demonstrated paths](#service-deliveryprerequisite-graph-is-possibility-only) | component-lab | testing, reporting |
| [Metasploit 'Appears', 'completed' and 'session' do not prove impact or cleanup](#testingexploit-framework-status-semantics) | source-trace | testing, evidence, operations |
| [Real report: 2 consultants, 3.5 engineer-weeks, pinned commit, named exclusions](#commercialtrail-of-bits-engagement-artifact) | public-doc | scoping, reporting, commercial |
| ["24/365" often covers machines only; human hunting and answers are business-hours](#service-deliveryhuman-coverage-hours-not-24x7) | public-doc | scoping, commercial, operations |
| [Ierae forensic service: write-blocked imaging and verified copies before analysis](#service-deliveryierae-forensic-preservation-process) | public-doc | evidence, operations, scoping |
| [Public incidents motivate test areas but can't estimate what pentests would prevent](#service-deliveryincident-counterfactuals-limits) | public-doc | scoping, commercial |
| [Training labs contaminate benchmarks; reporting tools store findings, not validate](#service-deliverylab-targets-and-reporting-tools) | public-doc | testing, reporting, ai-evaluation |
| [Mandiant/3CX: 97 working days, ten consultants; client remediates, Mandiant reassesses](#service-deliverymandiant-assessment-effort-and-roles) | public-doc | scoping, commercial, retest, reporting |
| [MDR mandates are per-action approval matrices (Inform/Yes/No, auto/manual, preauth)](#service-deliverymdr-authority-matrix-patterns) | public-doc | authorization, operations, scoping |
| [Public SLA/service pages and master terms do not supply signed scope or response authority](#service-deliverypublic-pages-are-not-signed-terms) | public-doc | commercial, scoping |
| [SOC/MDR SLA clocks measure contact or start of work, not containment](#service-deliverysla-clocks-measure-engagement-not-containment) | public-doc | commercial, operations, reporting |
| [Scan, pentest, red team, BAS answer different questions; PTaaS is a delivery model](#service-deliverydiscipline-distinctions) | synthesis | scoping, commercial |
| [Engagement checklist: permission, omissions, repro, revoke access, verify cleanup](#service-deliveryengagement-checklist) | synthesis | scoping, authorization, testing, triage, reporting, remediation, retest, operations |
| [Source reads, test reads, component labs and installed-class labs are separate tiers](#service-deliveryevidence-tiers-not-additive) | synthesis | evidence, reporting, commercial |
| [Product, managed service, assessment and IR are different purchases with distinct states](#service-deliveryfour-purchase-types-and-lifecycle-states) | synthesis | scoping, commercial, operations |
| [Estimate labor across scoping to retest; MDR and AI use need a defined mandate](#service-deliverylabor-and-operating-definitions) | synthesis | scoping, operations, commercial |
| [Tool adoption order: known-answer fixture, existing checks first, adapters only on gap](#service-deliveryrea-integration-order) | synthesis | testing, evidence, operations |
| [Worked engagement template: roles, access matrix, finding, repair, retest, untested list](#service-deliverysmall-service-exercise-template) | synthesis | scoping, testing, triage, reporting, retest |
| [Each surface needs specific access: per-role/tenant accounts, IdP config, ranges](#service-deliverysurface-access-requirements) | synthesis | scoping, authorization |
| [Synapse: research supports methods, not a client replica, loss model or full engagement](#service-deliverysynapse-mapping-gaps) | synthesis | scoping, testing, reporting, retest, commercial |
| [Each assessment tool answers one question; every result still needs a named oracle](#service-deliverytool-role-evidence-limits) | synthesis | scoping, discovery, testing, evidence, retest |
| [Agree the vantage point and separate unreachable, unauthenticated and unauthorized](#service-deliveryvantage-and-failure-attribution) | synthesis | scoping, testing, evidence |

### service-deliveryinstance-vs-class-repair

**`service-delivery.instance-vs-class-repair`: A direct-path fix blocked unapproved payment but still allowed payment after edit** (component-lab)

In a synthetic invoice workflow with declared rules, the one-instance repair blocked draft payment but failed the stale-approval-after-edit sequence. The class repair (approval bound to revision) passed all six cases including valid payment and cross-tenant denial. The receipt holds 18 implementation/case results: vulnerable failed 3, instance failed 1, class passed 6/6.

**Do:** Retests must include the original path, nearby state sequences and a legitimate-operation control, so a fix cannot pass by symptom-patching or by blocking everything.

**Limits:** In-memory fixture with no concurrency, database, async worker or alternate interface. The all-deny variant is reasoned, not in the receipt.

**Sources:** [assessment-evidence/executable-claims.md:9](../../assessment-evidence/executable-claims.md#L9), [assessment-evidence/executable-claims.md:19](../../assessment-evidence/executable-claims.md#L19)

**Receipts:** `assessment-evidence/lab-receipt-20261017.json`

**Contrary or narrowing evidence:**
- [assessment-evidence/framework.md:69](../../assessment-evidence/framework.md#L69): Even the class repair only proves tested cases.

### service-deliveryprerequisite-graph-is-possibility-only

**`service-delivery.prerequisite-graph-is-possibility-only`: The attack-path prerequisite graph models possibility only, not demonstrated paths** (component-lab)

The lab's monotone AND-prerequisite graph makes mail-read reachable from session + console reachability + grant authority + mail reachability, and unreachable when grant authority is removed. It is explicitly 'demonstrated: false'. It cannot model revocation during execution, cycles consuming resources, races or uncertain permissions.

**Do:** Use prerequisite graphs to plan and explain, but mark each edge with collected, dated evidence and validate transitions in the environment before claiming a path.

**Limits:** Toy model; no cloud permission semantics.

**Sources:** [assessment-evidence/executable-claims.md:23](../../assessment-evidence/executable-claims.md#L23)

**Receipts:** `assessment-evidence/lab-receipt-20261017.json`

### testingexploit-framework-status-semantics

**`testing.exploit-framework-status-semantics`: Metasploit 'Appears', 'completed' and 'session' do not prove impact or cleanup** (source-trace)

AutoCheck lets Vulnerable/Appears report a vulnerability and continue, and Detected warn and continue. The completed callback runs before cleanup, and cleanup is module code that can fail. A session is framework communication state, not proof of the intended effect; no session is not proof of no side effect.

**Do:** If exploitation modules are ever in scope, keep check, admission, invocation, target-side effect, session, cleanup and defender observation as separate records, with containment outside the module.

**Limits:** Source reading of one Metasploit pin; no module was run.

**Sources:** [toolchain/validation-framework.md:17](../../toolchain/validation-framework.md#L17), [toolchain/validation-framework.md:25](../../toolchain/validation-framework.md#L25)

### commercialtrail-of-bits-engagement-artifact

**`commercial.trail-of-bits-engagement-artifact`: Real report: 2 consultants, 3.5 engineer-weeks, pinned commit, named exclusions** (public-doc)

The Trail of Bits sigstore-rust report (October 15, 2026; PDF pages 3-12 reviewed) identifies two consultants, July 6-August 3 work totaling 3.5 engineer-weeks, kickoff/status/readout milestones, full source/document access and a pinned target commit. Its coverage section names reviewed flows and explicitly excludes further review of sigstore-sign and sigstore-cache; it separates severity from difficulty and gives short/long-term recommendations.

**Do:** Model our report on this: state people, effort, access, target commit, milestones, covered flows and explicit exclusions, and keep severity separate from exploit difficulty. It is a concrete effort comparator for white-box assessment.

**Limits:** Assessor-authored; we did not reproduce its findings or confirm fixes. Signed RoE, internal second review and time per finding are unknown.

**Sources:** [security-landscape/companies.md:51](../../security-landscape/companies.md#L51), [security-landscape/companies.md:51](../../security-landscape/companies.md#L51)

**Contrary or narrowing evidence:**
- [security-landscape/companies.md:53](../../security-landscape/companies.md#L53): Process internals remain unknown.

### service-deliveryhuman-coverage-hours-not-24x7

**`service-delivery.human-coverage-hours-not-24x7`: "24/365" often covers machines only; human hunting and answers are business-hours** (public-doc)

The GMO Ierae SOC brochure separates continuous automatic SOLOBAN analysis from business-day hunting, with round-the-clock human phone contact as a partner-operated option. LAC's Sentinel xPDR has a 24-hour inquiry window but a footnote limits answers to weekday daytime, and routine rule changes happen weekday daytime; LAC's Splunk Advanced table puts hunting in weekday daytime and emergency response in an optional menu. Managed FortiGate runs continuously but is English-only.

**Do:** Specify which activities (collection, automated analysis, human triage, hunting, client answers, emergency response) are covered in which hours and language when scoping or competing on managed services.

**Limits:** Public brochures and catalog pages; the Ierae brochure carries a development-stage caveat and none are signed terms.

**Sources:** [cybersecurity-firms/ierae-soc-brochure.md:5](../../cybersecurity-firms/ierae-soc-brochure.md#L5), [cybersecurity-firms/lac-xpdr-operating-boundary.md:9](../../cybersecurity-firms/lac-xpdr-operating-boundary.md#L9), [cybersecurity-firms/lac-xpdr-operating-boundary.md:17](../../cybersecurity-firms/lac-xpdr-operating-boundary.md#L17), [cybersecurity-firms/managed-fortigate-service.md:5](../../cybersecurity-firms/managed-fortigate-service.md#L5)

### service-deliveryierae-forensic-preservation-process

**`service-delivery.ierae-forensic-preservation-process`: Ierae forensic service: write-blocked imaging and verified copies before analysis** (public-doc)

GMO Ierae's forensic page describes hearing the situation and initial advice; preserving evidence onsite or offsite by imaging disks, producing preservation and analysis copies, comparing original/copy identity and using write-prevention equipment; specialist filesystem/log analysis with timeline reconstruction and deleted-data recovery; then findings and prevention recommendations. It does not establish production rebuilds, legal notifications, guaranteed data recovery, or a guaranteed arrival time despite 24/365 intake.

**Do:** If we offer incident investigation, define evidence preservation (imaging, hash comparison, write blocking) and the client's business/legal responsibilities explicitly, and keep investigation separate from recovery commitments.

**Limits:** Service page description; the sample report requires a request and was not obtained.

**Sources:** [cybersecurity-firms/gmo-ierae.md:41](../../cybersecurity-firms/gmo-ierae.md#L41), [cybersecurity-firms/gmo-ierae.md:45](../../cybersecurity-firms/gmo-ierae.md#L45)

### service-deliveryincident-counterfactuals-limits

**`service-delivery.incident-counterfactuals-limits`: Public incidents motivate test areas but can't estimate what pentests would prevent** (public-doc)

Five first-party incident chains (Cloudflare 2023, Microsoft 2024, CircleCI 2023, Sourcegraph 2023, Twilio 2022) plus 3CX point to credential rotation completeness, legacy app permissions, stolen sessions, public admin tokens and admin tools. Each counterfactual is a proposed bounded assessment. None establishes an earlier pentest would have prevented the event, and they do not estimate market-wide causes or prevented losses.

**Do:** Use incident chains to scope questions (revocation at issuer, cross-boundary authority, admin workflows), not as sales evidence of prevention rates.

**Limits:** Attributed public reports, not reproduced investigations; selection and hindsight bias.

**Sources:** [assessment-evidence/incidents.md:3](../../assessment-evidence/incidents.md#L3), [assessment-evidence/incidents.md:51](../../assessment-evidence/incidents.md#L51)

### service-deliverylab-targets-and-reporting-tools

**`service-delivery.lab-targets-and-reporting-tools`: Training labs contaminate benchmarks; reporting tools store findings, not validate** (public-doc)

Juice Shop is a training target whose published solutions can contaminate benchmarks; WebGoat pins Java 25 on a 2026.6-SNAPSHOT; GOAD needs multi-VM resources and Windows licensing. DefectDojo deduplicates and tracks findings but storing/deduplicating does not validate exploitability; PwnDoc generated prose/QA scores are not test evidence. Guidance: review NBRET's existing ZAP path before adding a second web scanner; for cloud/identity prepare disposable tenants and hard egress limits first; hardware needs devices and specialists.

**Do:** Benchmark with hidden repaired variants and unpublished cases, not only public training apps; treat reporting platforms as bookkeeping.

**Limits:** Metadata/README/manifest level only; nothing pulled or started.

**Sources:** [security-landscape/technical-library.md:32](../../security-landscape/technical-library.md#L32), [security-landscape/technical-library.md:35](../../security-landscape/technical-library.md#L35), [security-landscape/technical-library.md:43](../../security-landscape/technical-library.md#L43)

### service-deliverymandiant-assessment-effort-and-roles

**`service-delivery.mandiant-assessment-effort-and-roles`: Mandiant/3CX: 97 working days, ten consultants; client remediates, Mandiant reassesses** (public-doc)

A buyer-hosted Mandiant update (cover date 2025-03-20) describes multi-phase work on 3CX phone-system components combining source-assisted static review with dynamic pentesting, validating source findings through testing, and reassessing after customer remediation. Work ran November 2023 to September 2024, totaling 97 working days across ten consultants including reverse engineers. The document contains an unresolved chronology conflict about when critical/high findings were remediated.

**Do:** Use as a reference for effort scale and role split (assessor tests and reassesses; client fixes) when scoping source-plus-live product assessments, and record dates precisely in our own reports.

**Limits:** Vendor-authored, buyer-hosted three-page summary; SOW, pricing, full findings and acceptance criteria are not available.

**Sources:** [cybersecurity-firms/mandiant-3cx-assessment.md:5](../../cybersecurity-firms/mandiant-3cx-assessment.md#L5), [cybersecurity-firms/mandiant-3cx-assessment.md:7](../../cybersecurity-firms/mandiant-3cx-assessment.md#L7)

**Contrary or narrowing evidence:**
- [cybersecurity-firms/mandiant-3cx-assessment.md:9](../../cybersecurity-firms/mandiant-3cx-assessment.md#L9): Conflicts with page two's April 2024 critical-issue remediation; do not cite a clean date.

### service-deliverymdr-authority-matrix-patterns

**`service-delivery.mdr-authority-matrix-patterns`: MDR mandates are per-action approval matrices (Inform/Yes/No, auto/manual, preauth)** (public-doc)

Cortex XDR managed services set Unit 42 authority per action and separately for server vs workstation: Inform (wait for contact approval), Yes (act without approval), No (forbidden); actions include isolation, scripts, file destruction (irreversible) and quarantine. Trend MDR mixes automatic and manual approval per action, can scope automatic authority to all endpoints with exclusions or a selected-host CSV, and keeps some categories approval-free. Cisco XDR Premier executes only a customer-approved playbook subset; Managed FortiGate optional preauthorization covers minor or significant changes; BT Foundation only reports, Foundation Plus recommends, Premium contains automatically.

**Do:** Write our own client response mandate as an explicit per-action, per-asset-class matrix with approval mode, escalation contacts, reversibility and release authority, rather than a generic human-in-the-loop promise.

**Limits:** Dated public manuals and service descriptions, not signed customer contracts or observed operations.

**Sources:** [cybersecurity-firms/palo-alto-networks.md:13](../../cybersecurity-firms/palo-alto-networks.md#L13), [cybersecurity-firms/trend-mdr-approval.md:13](../../cybersecurity-firms/trend-mdr-approval.md#L13), [cybersecurity-firms/cisco-xdr-premier-contract.md:5](../../cybersecurity-firms/cisco-xdr-premier-contract.md#L5), [cybersecurity-firms/managed-fortigate-service.md:9](../../cybersecurity-firms/managed-fortigate-service.md#L9), [cybersecurity-firms/bt-falcon-service-schedule.md:7](../../cybersecurity-firms/bt-falcon-service-schedule.md#L7)

**Contrary or narrowing evidence:**
- [cybersecurity-firms/trend-mdr-approval.md:15](../../cybersecurity-firms/trend-mdr-approval.md#L15): Trend documents disagree on whether disabling auto-approval gates every response.

### service-deliverypublic-pages-are-not-signed-terms

**`service-delivery.public-pages-are-not-signed-terms`: Public SLA/service pages and master terms do not supply signed scope or response authority** (public-doc)

A marketing statement mentioning an SLA is evidence of that statement, not the SLA schedule; LAC and NRI pages omit severity definitions, clock rules, exclusions, credits and per-action authority. Trend's current MDR service descriptions are password-protected and were not read. CrowdStrike's public master terms describe a 72-hour outer limit for support-assisted disablement of customer contractor access, which concerns contractors, not managed-response approval.

**Do:** Do not represent competitor or partner capabilities from public pages as contractual; for our own offers, publish the actual SOW/SLA terms (scope, clocks, exclusions, credits, authority) that clients can compare.

**Limits:** Applies to the reviewed public documents as of 2026-10-17.

**Sources:** [cybersecurity-firms/service-artifact-boundaries.md:3](../../cybersecurity-firms/service-artifact-boundaries.md#L3), [cybersecurity-firms/trend-mdr-access-boundary.md:5](../../cybersecurity-firms/trend-mdr-access-boundary.md#L5), [cybersecurity-firms/falcon-public-terms-boundary.md:11](../../cybersecurity-firms/falcon-public-terms-boundary.md#L11)

### service-deliverysla-clocks-measure-engagement-not-containment

**`service-delivery.sla-clocks-measure-engagement-not-containment`: SOC/MDR SLA clocks measure contact or start of work, not containment** (public-doc)

Cisco MDR (v6.0, 2022) measures engagement 30 min after P1 prioritization and 45 for P2, 95% on time, starting 60 days after activation with customer-response holds and capped credits; XDR Premier (2024) has the same objective with no financial liability. BT Falcon P1 acknowledgement targets 15 minutes. LAC's "about 15 minutes" runs from analyst analysis start to customer contact. Managed FortiGate high-priority targets (1 h evaluation, 2 h implementation) start after customer approval.

**Do:** When writing or comparing service levels, define the clock start and stop events explicitly (ingestion, prioritization, contact, approval, enforcement, recovery) and do not compare providers' minute figures directly.

**Limits:** Dated public service descriptions and marketing pages; signed SLAs, credits and actual performance distributions were not reviewed.

**Sources:** [cybersecurity-firms/cisco-mdr-service-description.md:11](../../cybersecurity-firms/cisco-mdr-service-description.md#L11), [cybersecurity-firms/cisco-xdr-premier-contract.md:9](../../cybersecurity-firms/cisco-xdr-premier-contract.md#L9), [cybersecurity-firms/bt-falcon-service-schedule.md:11](../../cybersecurity-firms/bt-falcon-service-schedule.md#L11), [cybersecurity-firms/lac.md:9](../../cybersecurity-firms/lac.md#L9), [cybersecurity-firms/managed-fortigate-service.md:11](../../cybersecurity-firms/managed-fortigate-service.md#L11)

**Contrary or narrowing evidence:**
- [cybersecurity-firms/service-artifact-boundaries.md:7](../../cybersecurity-firms/service-artifact-boundaries.md#L7): LAC English marketing says SLA guaranteed; signed severity, clock and credit terms remain unseen.

### service-deliverydiscipline-distinctions

**`service-delivery.discipline-distinctions`: Scan, pentest, red team, BAS answer different questions; PTaaS is a delivery model** (synthesis)

The discipline map (grounded in NIST SP 800-115, CREST 2022, PTES and provider workflows) separates vulnerability scanning, vulnerability management, penetration testing, red teaming, adversary emulation, purple teaming, detection validation, BAS, EASM, continuous pentesting and PTaaS by objective, access and deliverable. A pentest finds and validates weaknesses in an agreed boundary and time box, and absence of findings is bounded assurance; red teaming tests a business objective and defender response and may sacrifice breadth; PTaaS is a delivery/business model, not a unique test method; an annual subscription is not continuous execution.

**Do:** Define the client question first and pick the discipline that answers it; label offers by what is tested and delivered, not by marketing terms like PTaaS, CTEM or agentic.

**Limits:** Analytical synthesis; vendor labels are not standardized and real contracts overlap.

**Sources:** [security-landscape/discipline-map.md:11](../../security-landscape/discipline-map.md#L11), [security-landscape/discipline-map.md:19](../../security-landscape/discipline-map.md#L19), [security-landscape/discipline-map.md:18](../../security-landscape/discipline-map.md#L18), [security-landscape/companies.md:22](../../security-landscape/companies.md#L22)

**Contrary or narrowing evidence:**
- [learning/chapters/02-services.md:11](../../learning/chapters/02-services.md#L11): Categories blur in contracts.

### service-deliveryengagement-checklist

**`service-delivery.engagement-checklist`: Engagement checklist: permission, omissions, repro, revoke access, verify cleanup** (synthesis)

An inferred procurement/review framework across sampled providers: verify ownership and written permission; define roles, data and excluded techniques; prepare accounts and known positive controls; record test selection and omissions; independently reproduce material findings; agree severity/business impact; deliver reproducible evidence; track fixes and retest conditions; revoke test access and verify cleanup; settle retention and ongoing support. HackerOne RoE adds tester screening/identity checks, official channels, confidentiality, customer approval for disclosure and deletion of stored documentation after completion and retests.

**Do:** Every engagement plan and contract should carry each item, including access revocation, cleanup verification and evidence retention/deletion, which tool-centric designs routinely omit.

**Limits:** An inferred framework, not a common provider workflow; which items each provider actually performs is mostly undisclosed. Deletion obligations are stated, not verified.

**Sources:** [security-landscape/companies.md:103](../../security-landscape/companies.md#L103), [security-landscape/companies.md:103](../../security-landscape/companies.md#L103), [security-landscape/companies.md:35](../../security-landscape/companies.md#L35)

**Contrary or narrowing evidence:**
- [security-landscape/companies.md:35](../../security-landscape/companies.md#L35): Deletion is a stated obligation only.

### service-deliveryevidence-tiers-not-additive

**`service-delivery.evidence-tiers-not-additive`: Source reads, test reads, component labs and installed-class labs are separate tiers** (synthesis)

The reporting comparison states that source reading explains mechanisms, a test read is an author assertion not a passing run, extracted/component experiments have smaller boundaries than the engine, and installed-class labs can bypass daemon/UI/DB; none shows customer-environment performance. Check counts must not be summed into a score or compared across tools.

**Do:** Label every claim in client and internal material with its evidence tier and do not rank tools from these studies.

**Limits:** Methodological synthesis.

**Sources:** [security-landscape/deep-review/reporting-boundaries-comparison.md:19](../../security-landscape/deep-review/reporting-boundaries-comparison.md#L19), [security-landscape/deep-review/reporting-boundaries-comparison.md:21](../../security-landscape/deep-review/reporting-boundaries-comparison.md#L21)

### service-deliveryfour-purchase-types-and-lifecycle-states

**`service-delivery.four-purchase-types-and-lifecycle-states`: Product, managed service, assessment and IR are different purchases with distinct states** (synthesis)

The provider comparison separates security product, managed security, assessment/consulting and incident response by deliverable and remaining customer responsibility. It lays out a lifecycle (agree assets/authority, deploy and verify source health, baseline, detect, investigate, decide, obtain permission, submit action, confirm enforcement, remediate, recover, report/retest/tune) in which each step can fail independently. A successful API call proves submission/response handling at that boundary only.

**Do:** Scope proposals by purchase type and record evidence for each lifecycle state rather than collapsing them into a single "handled" status.

**Limits:** Analytical synthesis across provider evidence; actual contracts may combine categories.

**Sources:** [cybersecurity-firms/service-process-comparison.md:10](../../cybersecurity-firms/service-process-comparison.md#L10), [cybersecurity-firms/service-process-comparison.md:61](../../cybersecurity-firms/service-process-comparison.md#L61)

### service-deliverylabor-and-operating-definitions

**`service-delivery.labor-and-operating-definitions`: Estimate labor across scoping to retest; MDR and AI use need a defined mandate** (synthesis)

Learning chapters: a small service should specify access requirements, exclusions, test plan, evidence handling, review and response times, and estimate labor across scoping, access, investigation, reporting and retest; access troubleshooting and communication are part of delivery. A monitoring service must document monitored sources, hours, severity definitions, escalation, action permissions and verification responsibility and exercise a false alarm, an unreachable asset and a failed action. AI-assisted delivery needs a per-customer capability table (data, tools, actions, approvals, destinations, budgets, recovery).

**Do:** Cost and staff engagements by phase including access and reporting overhead, and define MDR/AI mandates explicitly per customer.

**Limits:** Editorial guidance; no market demand or universal price established.

**Sources:** [learning/chapters/02-services.md:47](../../learning/chapters/02-services.md#L47), [learning/chapters/05-operations.md:39](../../learning/chapters/05-operations.md#L39), [learning/chapters/06-agents-and-workers.md:41](../../learning/chapters/06-agents-and-workers.md#L41)

### service-deliveryrea-integration-order

**`service-delivery.rea-integration-order`: Tool adoption order: known-answer fixture, existing checks first, adapters only on gap** (synthesis)

The October 16 handoff (initial source assessment of 11 repos, nothing installed or executed) proposes: select one known-answer fixture and analyst question; define a portable finding record linked to NBRET records with immutable evidence and revisable interpretations; improve REA only where it reduces effort; turn one confirmed finding into a regression with existing NBRET checks before adding a scanner; add an adapter only on a demonstrated gap; consider Temporal/LangGraph only after durable execution or branching becomes an observed problem. Benchmark REA against a plain workflow; smaller output bytes do not imply lower cost. NBRET pins rea-agents 6.4.0, distinct from the reviewed upstream main.

**Do:** Do not add orchestration frameworks or scanners speculatively; measure against a baseline first. Verify which REA features exist in the pinned 6.4.0.

**Limits:** Proposal; open decisions remain (lead use case, success criteria, processing destinations).

**Sources:** [2026-10-16-rea-and-security-workflows.md:257](../../2026-10-16-rea-and-security-workflows.md#L257), [2026-10-16-rea-and-security-workflows.md:261](../../2026-10-16-rea-and-security-workflows.md#L261), [2026-10-16-rea-and-security-workflows.md:9](../../2026-10-16-rea-and-security-workflows.md#L9)

**Receipts:** `review-findings.json`

**Contrary or narrowing evidence:**
- [2026-10-16-rea-and-security-workflows.md:29](../../2026-10-16-rea-and-security-workflows.md#L29): Nothing was run.

### service-deliverysmall-service-exercise-template

**`service-delivery.small-service-exercise-template`: Worked engagement template: roles, access matrix, finding, repair, retest, untested list** (synthesis)

SERVICE-EXERCISE.md defines a small offer (can one customer read another's order; one reviewed finding; one retest) with included/excluded scope; deliverables: access matrix, request/response observation, one finding, proposed repair, retest receipt and list of untested areas. Roles: scope owner, tester, reviewer, engineer, retester, operations analyst; record when the same person creates and reviews an assumption. The finding states precondition, observation, demonstrated consequence (and what it does not establish), cause and repair; retest includes the owner positive control so deny-all fails.

**Do:** Use as the skeleton for a first paid offer or POC deliverable; make reviewer independence explicit and always ship a list of untested areas.

**Limits:** Fictional loopback fixture template; not a client contract or completed assessment.

**Sources:** [learning/labs/SERVICE-EXERCISE.md:13](../../learning/labs/SERVICE-EXERCISE.md#L13), [learning/labs/SERVICE-EXERCISE.md:26](../../learning/labs/SERVICE-EXERCISE.md#L26), [learning/labs/SERVICE-EXERCISE.md:55](../../learning/labs/SERVICE-EXERCISE.md#L55)

### service-deliverysurface-access-requirements

**`service-delivery.surface-access-requirements`: Each surface needs specific access: per-role/tenant accounts, IdP config, ranges** (synthesis)

Assessment surfaces cut across disciplines. Application work needs accounts per role/tenant and data fixtures (crawlers miss stateful logic); API work needs docs plus tenant/role tokens with synthetic data and an object/action matrix; cloud needs approved accounts/roles, inventory and logs (read-only config review differs from executing a path); identity needs test identities and IdP config (graph reachability is a hypothesis); internal network needs explicit ranges, vantage points and emergency contacts (starting location radically changes results); hardware needs owned devices and bench access; AI application security needs synthetic documents, tool traces and model/config versions.

**Do:** Write the access checklist per surface into scoping before quoting; missing role/tenant accounts or vantage points materially change what can be claimed.

**Limits:** Practitioner synthesis, not a per-provider requirement list.

**Sources:** [security-landscape/discipline-map.md:28](../../security-landscape/discipline-map.md#L28), [security-landscape/discipline-map.md:31](../../security-landscape/discipline-map.md#L31), [security-landscape/discipline-map.md:29](../../security-landscape/discipline-map.md#L29)

### service-deliverysynapse-mapping-gaps

**`service-delivery.synapse-mapping-gaps`: Synapse: research supports methods, not a client replica, loss model or full engagement** (synthesis)

The Synapse mapping finds support for scoped onboarding, source-plus-runtime hypotheses, identity/tenant tests, workflow-state tests, prerequisite path models, execution-vs-detection separation and fresh retests, but no evidence of automated reconstruction of a client network/identity/integrations, a calibrated monetary loss model, or one observed end-to-end engagement. The strategy basis is unapproved proposals (KrisPC transfer, files under strategy/ in a Downloads folder outside the repo); the handoff also states NBRET is not established as Synapse's attack-reproduction engine and the resilience implementation on another PC was not inspected.

**Do:** Do not claim replica fidelity, loss figures or a validated Synapse workflow. The proposed synthetic POC with a manual baseline is the research-suggested next test, but it is not authorized by the research itself; buyer validation and legal authorization remain open gaps.

**Limits:** Decision-oriented mapping; no experiments run for it; strategy files are external and not durable in repo.

**Sources:** [synapse/research-to-service.md:5](../../synapse/research-to-service.md#L5), [synapse/research-to-service.md:73](../../synapse/research-to-service.md#L73), [synapse/research-to-service.md:17](../../synapse/research-to-service.md#L17)

**Contrary or narrowing evidence:**
- [security-landscape/synthesis.md:74](../../security-landscape/synthesis.md#L74): Mapping omits buyer validation as a gap.

### service-deliverytool-role-evidence-limits

**`service-delivery.tool-role-evidence-limits`: Each assessment tool answers one question; every result still needs a named oracle** (synthesis)

The toolchain's entry table maps each assessment question to a tool role, what its result supports, and what still needs independent validation. Nmap/protocol clients support configured probe outcomes and advertised services but not full coverage, identity, actual version or vulnerability. Proxies (Burp, mitmproxy) support observed or modified requests but not the intended authorization property. SharpHound/BloodHound and cloud policy tools support collected relationships and model deductions but not current effective capability, collection completeness or edge preconditions. Retest supports a before/after comparison but not that 'not reported' is a fix rather than filters, failure or drift.

**Do:** When choosing tools for an engagement, write down for each one the claim its output will support and the oracle that will validate the client-facing finding. Start tool-selection questions from toolchain/read-first.md, then map.md.

**Limits:** map.md calls its tools representative examples, not purchase recommendations; no engagement-type-to-toolset mapping (web, network, AD, cloud) is established.

**Sources:** [toolchain/read-first.md:8](../../toolchain/read-first.md#L8), [toolchain/read-first.md:10](../../toolchain/read-first.md#L10), [toolchain/read-first.md:11](../../toolchain/read-first.md#L11), [toolchain/read-first.md:13](../../toolchain/read-first.md#L13), [toolchain/map.md:3](../../toolchain/map.md#L3)

**Contrary or narrowing evidence:**
- [toolchain/reader-guide.md:71](../../toolchain/reader-guide.md#L71): Fuzzing, SAST/SCA/IaC and mobile categories have catalog context only, not source review.

### service-deliveryvantage-and-failure-attribution

**`service-delivery.vantage-and-failure-attribution`: Agree the vantage point and separate unreachable, unauthenticated and unauthorized** (synthesis)

Use connectivity to obtain the agreed vantage point and keep source addresses, accounts and timelines in the engagement record so defenders can correlate activity. Denied reachability, failed authentication and failed authorization are different outcomes, and a timeout alone cannot reliably choose between them. No VPN, proxy or tunnel grants scope or anonymity.

**Do:** Record vantage, route, resolver, proxy, source NAT and actor identity for every test run, and classify failures before drawing conclusions.

**Limits:** Practical synthesis plus one dialer-cache lab; not a measured client network.

**Sources:** [toolchain/connectivity.md:24](../../toolchain/connectivity.md#L24), [toolchain/connectivity.md:18](../../toolchain/connectivity.md#L18)

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| high | [cybersecurity-firms/trend-mdr-approval.md:15](../../cybersecurity-firms/trend-mdr-approval.md#L15) | [cybersecurity-firms/trend-mdr-approval.md:7](../../cybersecurity-firms/trend-mdr-approval.md#L7) | Do not promise clients a universal manual gate for Trend MDR; resolve per-action approval from the service terms and deployed configuration. |
| high | [cybersecurity-firms/service-artifact-boundaries.md:7](../../cybersecurity-firms/service-artifact-boundaries.md#L7) | [cybersecurity-firms/lac.md:9](../../cybersecurity-firms/lac.md#L9) | Describe LAC 15 minutes as analysis-start-to-contact, not detection-to-containment. |
| medium | [security-landscape/technical-library.md:22](../../security-landscape/technical-library.md#L22) | [security-landscape/technical-library.md:24](../../security-landscape/technical-library.md#L24) | Attribute PentestGPT behavior only to pentestgpt_agent at e8b1bb7. |
| medium | [security-landscape/companies.md:89](../../security-landscape/companies.md#L89) | [security-landscape/coverage.md:24](../../security-landscape/coverage.md#L24) | Do not cite Cobalt entitlements as fact without a contract. |
| medium | [review-findings.json:151](../../review-findings.json#L151) | [2026-10-16-rea-and-security-workflows.md:232](../../2026-10-16-rea-and-security-workflows.md#L232) | Follow the Markdown order: existing NBRET checks before any new scanner. |
| medium | [assessment-evidence/coverage.md:59](../../assessment-evidence/coverage.md#L59) | [assessment-evidence/continuation-exhaustion.md:58](../../assessment-evidence/continuation-exhaustion.md#L58) | Do not treat the earlier bounded pass as complete coverage; even the later cutoff is not exhaustion (continuation-exhaustion.md:801). |
| medium | [cybersecurity-firms/mandiant-3cx-assessment.md:9](../../cybersecurity-firms/mandiant-3cx-assessment.md#L9) | [cybersecurity-firms/mandiant-3cx-assessment.md:9](../../cybersecurity-firms/mandiant-3cx-assessment.md#L9) | Do not cite a clean remediation date; the document conflicts. |
| medium | [2026-10-16-rea-and-security-workflows.md:40](../../2026-10-16-rea-and-security-workflows.md#L40) | [2026-10-16-rea-and-security-workflows.md:9](../../2026-10-16-rea-and-security-workflows.md#L9) | Verify each REA feature in 6.4.0 before relying on it. |
| low | [2026-10-16-rea-and-security-workflows.md:178](../../2026-10-16-rea-and-security-workflows.md#L178) | [security-landscape/implementation-reviews.md:95](../../security-landscape/implementation-reviews.md#L95) | Use implementation-reviews.md for garak evaluator behavior. |
| low | [cybersecurity-firms/service-artifact-boundaries.md:9](../../cybersecurity-firms/service-artifact-boundaries.md#L9) | [cybersecurity-firms/lac.md:9](../../cybersecurity-firms/lac.md#L9) | Cite the dated source with any volume; they are not interchangeable. |
| low | [cybersecurity-firms/continuation.md:55](../../cybersecurity-firms/continuation.md#L55) | [cybersecurity-firms/continuation.md:137](../../cybersecurity-firms/continuation.md#L137) | Use coverage-audit.md and scope-audit.md for current remaining evidence, not continuation queues. |
| low | [learning/CONTEXT.md:11](../../learning/CONTEXT.md#L11) | [learning/CONTEXT.md:5](../../learning/CONTEXT.md#L5) | Start with publication.json/chapters; beginner lessons are optional introductions. |
| low | [security-landscape/inventory.md:18](../../security-landscape/inventory.md#L18) | [security-landscape/inventory.md:18](../../security-landscape/inventory.md#L18) | Use receipts and source, not early roadmap tables, for current capability. |
| low | [cybersecurity-firms/gmo-flatt-security.md:49](../../cybersecurity-firms/gmo-flatt-security.md#L49) | [cybersecurity-firms/takumi-github-scope-boundary.md:11](../../cybersecurity-firms/takumi-github-scope-boundary.md#L11) | Treat the App manifest as unknown, not merely queued. |
