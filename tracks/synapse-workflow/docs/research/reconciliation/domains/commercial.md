# Commercial: pricing, effort, staffing, buyer evidence

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 13 findings, 16 related corrections, 8 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.assurance-prototype`** [security-landscape/deep-review/report-assurance-proposal.md:42](../../security-landscape/deep-review/report-assurance-proposal.md#L42): An agent may build the interpretation-envelope prototype as product work. **Instead:** It is a design proposal only; reconciliation forbids launching product implementation (docs/research/reconciliation/README.md:5).
- **`hazard.blocked-build`** [security-landscape/coverage.md:70](../../security-landscape/coverage.md#L70): Agent may retry the build with a different download route or disabled protection. **Instead:** Do not retry or route around the block (docs/research/safety-context/README.md:11,21,37).
- **`hazard.coverage-next-steps`** [security-landscape/coverage.md:36](../../security-landscape/coverage.md#L36): Agent may treat the continuation order as a to-do list and execute scanner/Atomic runs. **Instead:** Next steps are historical proposals, not authorization; existing stopped/rejected operations and their equivalents remain stopped (docs/research/reconciliation/README.md:5; coverage.md:90). Run no scanner/Atomic operation unless the current task explicitly requires it.
- **`hazard.flagged-operation-certainty`** [security-landscape/coverage.md:90](../../security-landscape/coverage.md#L90): Agent may tell Kotaro or clients that a specific action was flagged by a safety system, or try to identify/recreate it. **Instead:** Cause is unknown; keep stopped and do not reproduce (docs/research/safety-context/README.md:25,33,37).
- **`hazard.garak-init-network`** [assessment-evidence/deep-garak.md:27](../../assessment-evidence/deep-garak.md#L27): An agent may initialize garak assuming it is local-only, generating provider traffic and cost. **Instead:** Treat scanner construction as network activity requiring authorization (docs/research/reconciliation/README.md:5).
- **`hazard.repository-catalog-network`** [security-landscape/coverage.md:42](../../security-landscape/coverage.md#L42): Rerunning the catalog script would overwrite dated pins and contact GitHub. **Instead:** Preserve the dated JSON pins (same line); do not rerun without a task that requires it.
- **`hazard.synthesis-open-compile-experiment`** [assessment-evidence/synthesis.md:42](../../assessment-evidence/synthesis.md#L42): Proposes an experiment whose answer already exists, inviting new runtime work against OpenFGA internals. **Instead:** Read continuation-exhaustion.md:60-70 and :104 first; any new OpenFGA runtime work must respect the stop at continuation-exhaustion.md:334.
- **`hazard.takumi-connect-repo`** [cybersecurity-firms/gmo-flatt-security.md:35](../../cybersecurity-firms/gmo-flatt-security.md#L35): An agent evaluating Takumi could upload NBRET or client code or install the write-enabled GitHub App. **Instead:** Do not upload code or install apps without explicit approval (gmo-flatt-security.md:35; takumi-github-scope-boundary.md:11).

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [AI tools record unknown cost as zero and count characters as tokens](#commercialai-cost-accounting-traps) | source-trace | commercial, ai-evaluation |
| [Security AI is sold as capacity (SCU, credits, findings/day), not completed investigations](#commercialai-capacity-units-not-work-units) | public-doc | commercial, operations |
| [HackerOne staffed pentest: 2 weeks, 40 h/tester, report in 3-5 days, retest 30-90 days](#commercialhackerone-staffed-pentest-effort-terms) | public-doc | scoping, testing, triage, reporting, retest, commercial |
| [Japanese MSS prices: WAF Aide ¥42k-99k/month; NRI/LAC quote per scope; AI not a price cut](#commercialjapanese-managed-service-pricing) | public-doc | commercial |
| [No measured breakdown of assessment hours exists; one public report gives days only](#commercialno-measured-assessment-hours) | public-doc | commercial, scoping |
| [Observed public prices: Nessus $4,790/yr; Cobalt autonomous web test $3,500 promo](#commercialobserved-public-prices) | public-doc | commercial |
| [Revenue categories do not reveal managed-service labor; Japanese firms mix SI and resale](#commercialrevenue-categories-not-delivery-model) | public-doc | commercial |
| [Takumi AI assessment: ¥70,000/month incl. 250 credits; extra credit ¥280; graybox min 40](#commercialtakumi-credit-pricing) | public-doc | commercial |
| [Several core tools carry non-standard licences that affect productizing](#commercialtool-licences-not-plain) | public-doc | commercial |
| [Compare at equal scope; a prototype shows feasibility, a paid pilot is other evidence](#commercialevaluation-and-buyer-evidence-protocol) | synthesis | commercial, ai-evaluation |
| [Five candidate offerings with prototypes and disproof criteria; none validated](#commercialfive-falsifiable-hypotheses) | synthesis | commercial, ai-evaluation, retest |
| [Proposal: a report 'interpretation envelope' recording effective config and state](#commercialreport-interpretation-envelope) | synthesis | commercial, reporting |
| [Clients buy accountable engagement, evidence, fix decisions and retest, not bug counts](#commercialwhat-customers-buy) | synthesis | commercial |

### commercialai-cost-accounting-traps

**`commercial.ai-cost-accounting-traps`: AI tools record unknown cost as zero and count characters as tokens** (source-trace)

PentestGPT's trial aggregation turns missing cost into zero, so unreported spend looks free. The Codex backend sets reported cost to None and provider cache counters have different semantics. garak's count_tokens reports characters and estimates calls from configured generations. The UnifiedAgent monitor UI instead shows unknown cost as a dash.

**Do:** When measuring whether AI assistance pays off, use invoices or provider usage receipts. Count failed calls and analyst time separately, and record unknown cost as unknown.

**Limits:** Source reading; no billed runs were measured.

**Sources:** [assessment-evidence/deep-pentestgpt.md:13](../../assessment-evidence/deep-pentestgpt.md#L13), [assessment-evidence/deep-garak.md:160](../../assessment-evidence/deep-garak.md#L160), [assessment-evidence/synthesis.md:18](../../assessment-evidence/synthesis.md#L18)

**Contrary or narrowing evidence:**
- [assessment-evidence/monitor-web-continuation.md:17](../../assessment-evidence/monitor-web-continuation.md#L17): The monitor UI keeps unknown cost distinct.

### commercialai-capacity-units-not-work-units

**`commercial.ai-capacity-units-not-work-units`: Security AI is sold as capacity (SCU, credits, findings/day), not completed investigations** (public-doc)

Security Copilot bills a minimum one provisioned SCU hourly ($4/SCU-hour example) plus $6 overage SCU; E5/E7 inclusion gives 400 SCUs/month per 1,000 paid users capped at 10,000 with no rollover. CrowdStrike Charlotte moved from June 2026 to monthly credit tiers independent of endpoint count; credits pool per customer ID, reset without rollover, and credit-powered agents stop at the cap. Splunk Triage handles the first ten findings per detection batch and about 200 findings per tenant per day (Premier). Google SecOps data benefits exempt eligible sources (e.g. 10 GB/day) but disclose no per-investigation price.

**Do:** Price AI-assisted delivery on workload and human follow-up, plan for caps and untriaged overflow, and never treat an untriaged or capped finding as low risk.

**Limits:** Dated public pricing/licensing pages; no purchase or quota enforcement was observed.

**Sources:** [cybersecurity-firms/pricing-capacity-boundaries.md:7](../../cybersecurity-firms/pricing-capacity-boundaries.md#L7), [cybersecurity-firms/pricing-capacity-boundaries.md:9](../../cybersecurity-firms/pricing-capacity-boundaries.md#L9), [cybersecurity-firms/charlotte-agentworks-contract.md:17](../../cybersecurity-firms/charlotte-agentworks-contract.md#L17), [cybersecurity-firms/splunk-triage-controls.md:23](../../cybersecurity-firms/splunk-triage-controls.md#L23), [cybersecurity-firms/pricing-capacity-boundaries.md:25](../../cybersecurity-firms/pricing-capacity-boundaries.md#L25)

### commercialhackerone-staffed-pentest-effort-terms

**`commercial.hackerone-staffed-pentest-effort-terms`: HackerOne staffed pentest: 2 weeks, 40 h/tester, report in 3-5 days, retest 30-90 days** (public-doc)

HackerOne documentation reviewed 2026-10-17 (dated August 21, 2026) describes two calendar weeks of testing, 40 hours per tester, P40-P200 engagement sizes, report delivery in 3-5 business days and a 30-90-day retest window depending on tier. Workflow: customer scopes assets/roles, HackerOne sizes skills/effort and quotes; a technical engagement manager handles kickoff/credentials; a lead validates, deduplicates and QA-checks submissions before delivery; findings arrive during testing, then report, debrief and retests.

**Do:** Use these documented terms, alongside the Mandiant and Trail of Bits engagement records, as dated effort and turnaround comparators when sizing our own engagements. Build an explicit lead-QA/dedup step and a retest window into the offer.

**Limits:** Documented terms, not measured turnaround; no public numeric price was established for HackerOne. Internal QA rejection rates and reviewer independence are unknown.

**Sources:** [security-landscape/companies.md:33](../../security-landscape/companies.md#L33), [security-landscape/companies.md:30](../../security-landscape/companies.md#L30)

**Contrary or narrowing evidence:**
- [security-landscape/companies.md:37](../../security-landscape/companies.md#L37): Quality of the lead QA step is undisclosed.

### commercialjapanese-managed-service-pricing

**`commercial.japanese-managed-service-pricing`: Japanese MSS prices: WAF Aide ¥42k-99k/month; NRI/LAC quote per scope; AI not a price cut** (public-doc)

GMO Ierae WAF Aide lists monthly base amounts of ¥42,000 Entry, ¥89,000 Classic and ¥99,000 Standard, with features, request volumes, overages and setup varying. NRI Secure's shared log monitoring and LAC's Splunk-based xPDR Advanced are priced by individual quotation. NRI's FAQ positions AI efficiency as a secondary effect rather than a promise of lower prices.

**Do:** Use these as dated Japanese market anchors when positioning service prices; expect enterprise managed services to be quoted per scope, and avoid promising AI-driven price reductions without measured cost data.

**Limits:** Public captures as of 2026-10-17; tier feature mapping was partly lost in text extraction.

**Sources:** [cybersecurity-firms/gmo-ierae.md:34](../../cybersecurity-firms/gmo-ierae.md#L34), [cybersecurity-firms/service-artifact-boundaries.md:17](../../cybersecurity-firms/service-artifact-boundaries.md#L17), [cybersecurity-firms/nri-agenticblue-controls.md:14](../../cybersecurity-firms/nri-agenticblue-controls.md#L14)

### commercialno-measured-assessment-hours

**`commercial.no-measured-assessment-hours`: No measured breakdown of assessment hours exists; one public report gives days only** (public-doc)

Cure53's Obsidian Sync report states eight invested days and five senior testers without per-person or phase hours, so multiplying them into forty person-days is unjustified. The track found no representative measured breakdown of assessment hours. Automation can cut repetitive work while increasing setup, false-positive review and maintenance.

**Do:** Do not price or claim efficiency gains from percentages. Measure end-to-end verified outcomes per analyst hour, including preparation, failed runs and retest.

**Limits:** One selected public deliverable, partially read.

**Sources:** [assessment-evidence/sample-deliverable.md:5](../../assessment-evidence/sample-deliverable.md#L5), [assessment-evidence/overview.md:35](../../assessment-evidence/overview.md#L35)

**Receipts:** `assessment-evidence/sample-report-pin.json`

### commercialobserved-public-prices

**`commercial.observed-public-prices`: Observed public prices: Nessus $4,790/yr; Cobalt autonomous web test $3,500 promo** (public-doc)

On 2026-10-17 the Tenable page displayed Nessus Professional at USD 4,790/year plus $400 advanced support and $275 training (a license, not a pentest). Cobalt advertised a promotional autonomous web test at $3,500/test with findings in 24 hours and Core oversight, deadline Dec 31, 2026. Cobalt staffed tiers are quote-based annual credits, one credit described as eight traditional-hour equivalents combining humans and automation. HackerOne and the other sampled consulting/validation providers showed no numeric public price.

**Do:** There is some public price evidence; do not claim the research has none. But never compare these as equivalent tests: a scanner license, an autonomous promo and a staffed credit buy different work. Quote our own price against defined scope and labor, not these figures.

**Limits:** Page displays, not quotations or total cost of ownership; locale/tax/terms can differ; Cobalt rollover/retest wording is internally inconsistent. "Not established" means no public price was found in the reviewed pages, not that none exists. These prices buy different work (licence, promotional test, credits) and are not equivalent engagements.

**Sources:** [security-landscape/companies.md:87](../../security-landscape/companies.md#L87), [security-landscape/companies.md:88](../../security-landscape/companies.md#L88), [security-landscape/companies.md:89](../../security-landscape/companies.md#L89), [security-landscape/companies.md:91](../../security-landscape/companies.md#L91)

**Contrary or narrowing evidence:**
- [security-landscape/companies.md:89](../../security-landscape/companies.md#L89): Credit entitlements cannot be derived from the pricing table alone.
- [learning/chapters/02-services.md:47](../../learning/chapters/02-services.md#L47): No universal price or demand evidence.

### commercialrevenue-categories-not-delivery-model

**`commercial.revenue-categories-not-delivery-model`: Revenue categories do not reveal managed-service labor; Japanese firms mix SI and resale** (public-doc)

Fortinet FY2025 revenue was $6,799.6M ($2,218.4M product, $4,581.2M service), with service meaning subscriptions/support, geography by billing address and 71% of service revenue from prior deferred revenue. LAC FY2025 standalone revenue was ¥54,643M, recognizing consulting by progress, monitoring evenly over the contract and third-party products at shipment, alongside SI and resale; KDDI owns 100% and contributed ¥4,843M. Trend's ¥275,984M consolidated sales include ¥87,840M Japan region versus ¥87,662M parent-only revenue.

**Do:** Use financials only to understand a competitor's business perimeter and channel, not testing or SOC quality; compare delivery using documented offerings.

**Limits:** Selected filing sections only; no full annual reports read.

**Sources:** [cybersecurity-firms/fortinet-annual-economics.md:12](../../cybersecurity-firms/fortinet-annual-economics.md#L12), [cybersecurity-firms/lac-latest-standalone-accounts.md:7](../../cybersecurity-firms/lac-latest-standalone-accounts.md#L7), [cybersecurity-firms/financial-anchors.md:20](../../cybersecurity-firms/financial-anchors.md#L20), [cybersecurity-firms/trend-annual-economics.md:16](../../cybersecurity-firms/trend-annual-economics.md#L16)

### commercialtakumi-credit-pricing

**`commercial.takumi-credit-pricing`: Takumi AI assessment: ¥70,000/month incl. 250 credits; extra credit ¥280; graybox min 40** (public-doc)

As captured 2026-10-17, Takumi's base plan is ¥70,000/month tax-exclusive with 250 monthly credits; additional credits cost ¥280 each. A graybox scan needs at least 40 credits, with separate enumeration/scan credit thresholds that bound consumption, not completeness. The published vulnerability-category percentages are a distribution of detections (2026-05-29 to Aug 4), not recall.

**Do:** Use as a dated market reference point for pricing AI-assisted assessment; any comparison must add expert review, setup and retest effort, since credit budgets do not buy completeness.

**Limits:** Dated public price capture, not a quote; full pricing scope remains incomplete.

**Sources:** [cybersecurity-firms/gmo-flatt-security.md:9](../../cybersecurity-firms/gmo-flatt-security.md#L9), [cybersecurity-firms/gmo-flatt-security.md:21](../../cybersecurity-firms/gmo-flatt-security.md#L21), [cybersecurity-firms/gmo-flatt-security.md:9](../../cybersecurity-firms/gmo-flatt-security.md#L9)

### commercialtool-licences-not-plain

**`commercial.tool-licences-not-plain`: Several core tools carry non-standard licences that affect productizing** (public-doc)

Nmap is NPSL v0.95 with additional terms taking precedence over GPL, and must not be labelled plain GPL. Impacket is a modified Apache Software License 1.1, not Apache-2.0. AFL++ metadata showed AGPL-3.0, and the Burp suite is proprietary.

**Do:** Get licence review before embedding or redistributing these tools in a commercial service or product.

**Limits:** Licence metadata and root licence files at the catalog date; not legal advice.

**Sources:** [toolchain/catalog.md:9](../../toolchain/catalog.md#L9), [toolchain/catalog.md:13](../../toolchain/catalog.md#L13)

### commercialevaluation-and-buyer-evidence-protocol

**`commercial.evaluation-and-buyer-evidence-protocol`: Compare at equal scope; a prototype shows feasibility, a paid pilot is other evidence** (synthesis)

For each idea measure correctness under known truth, missed cases, analyst assistance, reproducibility, total labor/tool/model cost, setup/maintenance and remediation outcome, with equivalent scope/access/budgets, unsuccessful and unscored runs included, held-out variants, solution text removed and memorization risk recorded. Next customer evidence should come from consented interviews or public buyer-authored accounts on access preparation, retest friction, purchasing responsibility and acceptance criteria. A prototype result is technical feasibility; a paid pilot is different evidence.

**Do:** Plan buyer interviews and a paid pilot separately from technical POCs; do not cite a lab success as market validation. No outreach is authorized by the research itself.

**Limits:** Protocol only; no buyer interviews or pilots have been performed.

**Sources:** [security-landscape/synthesis.md:72](../../security-landscape/synthesis.md#L72), [security-landscape/synthesis.md:74](../../security-landscape/synthesis.md#L74), [security-landscape/coverage.md:16](../../security-landscape/coverage.md#L16)

### commercialfive-falsifiable-hypotheses

**`commercial.five-falsifiable-hypotheses`: Five candidate offerings with prototypes and disproof criteria; none validated** (synthesis)

Five hypotheses: (1) identity-bound finding-to-regression evidence; (2) semantic validation before finding promotion (claim-specific oracle, positive/negative controls, suspected/reproduced/validated/remediation-verified states); (3) capability-restricted testing-agent runtime (typed operations, egress mediation, short-lived grants, stop/kill); (4) evidence of defense and remediation rather than execution counts; (5) change-aware assessment continuity. Each names failure/user/payer, mechanism, requirements, a small prototype and disproof (e.g. no improvement in adjudicated false positives or time per correct finding; any unauthorized effect escapes).

**Do:** Before choosing a product direction, compare against these five hypotheses and their disproof criteria; any prototype that would test one needs its own authorization and a manual baseline. Do not invent a new opportunity list without comparing to these.

**Limits:** Technical hypotheses only: no chosen entry strategy, demand validation or revenue claim.

**Sources:** [security-landscape/synthesis.md:30](../../security-landscape/synthesis.md#L30), [security-landscape/synthesis.md:48](../../security-landscape/synthesis.md#L48), [security-landscape/synthesis.md:56](../../security-landscape/synthesis.md#L56), [security-landscape/coverage.md:17](../../security-landscape/coverage.md#L17)

### commercialreport-interpretation-envelope

**`commercial.report-interpretation-envelope`: Proposal: a report 'interpretation envelope' recording effective config and state** (synthesis)

A design-only proposal for an adjacent, versioned record of tool versions, assessment/principal identity, requested vs effective selection, execution state, coverage basis, finding basis, redaction policy and retest binding. It lists disproof conditions (existing receipts suffice, reviewers do not decide better, adapters too costly) and states no interviews or willingness-to-pay evidence exist; a readable appendix might suffice.

**Do:** Treat as an untested hypothesis; validate with paired reviewer tests before building or selling.

**Limits:** No implementation, customer study or market evidence.

**Sources:** [security-landscape/deep-review/report-assurance-proposal.md:13](../../security-landscape/deep-review/report-assurance-proposal.md#L13), [security-landscape/deep-review/report-assurance-proposal.md:48](../../security-landscape/deep-review/report-assurance-proposal.md#L48)

### commercialwhat-customers-buy

**`commercial.what-customers-buy`: Clients buy accountable engagement, evidence, fix decisions and retest, not bug counts** (synthesis)

Provider workflows show distinct purchases: scarce specialist attention, a bounded accountable engagement, coordinated access/staffing, credible evidence, stakeholder reporting, help deciding what to fix, and rechecking fixes. Consulting sells scoped expertise/effort; software sells reusable execution capacity; managed validation adds operation/interpretation; researcher platforms coordinate labor. Inference: adoption friction may depend on trust, repeatability, procurement relationships and remediation ownership as much as detection capability.

**Do:** Design the offer around scope, accountability, reproducible evidence, fix prioritization and retest; a technically novel engine that cannot explain scope, handle secrets, reproduce findings and accept responsibility may still not sell.

**Limits:** Synthesis of a sample; the adoption-friction point is a hypothesis to test with buyers, not a surveyed fact. No market size or demand validated.

**Sources:** [security-landscape/synthesis.md:7](../../security-landscape/synthesis.md#L7), [security-landscape/synthesis.md:9](../../security-landscape/synthesis.md#L9), [security-landscape/synthesis.md:9](../../security-landscape/synthesis.md#L9)

**Contrary or narrowing evidence:**
- [security-landscape/synthesis.md:26](../../security-landscape/synthesis.md#L26): No evidence AI removes expert labor or that consulting is obsolete.

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| high | [assessment-evidence/synthesis.md:42](../../assessment-evidence/synthesis.md#L42) | [assessment-evidence/continuation-exhaustion.md:104](../../assessment-evidence/continuation-exhaustion.md#L104) | The failed-compile state is an internal component observation only; ordinary model writes reject invalid conditions. |
| high | [security-landscape/coverage.md:78](../../security-landscape/coverage.md#L78) | [security-landscape/coverage.md:78](../../security-landscape/coverage.md#L78) | Report only a helper-level divergence, not a live ZAP proxy vulnerability. |
| high | [cybersecurity-firms/takumi-domestic-inference-announcement.md:5](../../cybersecurity-firms/takumi-domestic-inference-announcement.md#L5) | [cybersecurity-firms/gmo-flatt-security.md:61](../../cybersecurity-firms/gmo-flatt-security.md#L61) | Assume overseas inference for Takumi unless a signed domestic-inference arrangement is in place and active. |
| high | [security-landscape/coverage.md:90](../../security-landscape/coverage.md#L90) | [safety-context/README.md:33](../../safety-context/README.md#L33) | Treat pauses as stops with unknown cause; keep them stopped but do not assert a specific flagged action. |
| high | [cybersecurity-firms/service-artifact-boundaries.md:7](../../cybersecurity-firms/service-artifact-boundaries.md#L7) | [cybersecurity-firms/lac.md:9](../../cybersecurity-firms/lac.md#L9) | Describe LAC 15 minutes as analysis-start-to-contact, not detection-to-containment. |
| medium | [cybersecurity-firms/charlotte-agentworks-contract.md:17](../../cybersecurity-firms/charlotte-agentworks-contract.md#L17) | [cybersecurity-firms/charlotte-agentworks-contract.md:17](../../cybersecurity-firms/charlotte-agentworks-contract.md#L17) | Use the June 2026 credit-tier model for current pricing discussions; legacy applicability is unresolved. |
| medium | [security-landscape/companies.md:89](../../security-landscape/companies.md#L89) | [security-landscape/coverage.md:24](../../security-landscape/coverage.md#L24) | Do not cite Cobalt entitlements as fact without a contract. |
| medium | [cybersecurity-firms/splunk-guided-response.md:15](../../cybersecurity-firms/splunk-guided-response.md#L15) | [cybersecurity-firms/splunk-triage-controls.md:17](../../cybersecurity-firms/splunk-triage-controls.md#L17) | Do not assume the general model setting governs Triage data routing. |
| medium | [assessment-evidence/deep-garak.md:73](../../assessment-evidence/deep-garak.md#L73) | [assessment-evidence/deep-garak.md:91](../../assessment-evidence/deep-garak.md#L91) | Live-plugin tag dependence applies to Report.get_evaluations/AVID export, not the modern digest. |
| medium | [assessment-evidence/framework.md:30](../../assessment-evidence/framework.md#L30) | [assessment-evidence/deep-garak.md:178](../../assessment-evidence/deep-garak.md#L178) | Describe garak evaluation counts as output-per-detector judgments, not prompt counts. |
| medium | [security-landscape/coverage.md:52](../../security-landscape/coverage.md#L52) | [security-landscape/coverage.md:76](../../security-landscape/coverage.md#L76) | Use the latest checkpoint and deep-review files for current reading state. |
| low | [assessment-evidence/deep-pentestgpt.md:13](../../assessment-evidence/deep-pentestgpt.md#L13) | [assessment-evidence/monitor-web-continuation.md:17](../../assessment-evidence/monitor-web-continuation.md#L17) | The zero-cost conflation is in trial aggregation, not the monitor UI. |
| low | [cybersecurity-firms/service-artifact-boundaries.md:9](../../cybersecurity-firms/service-artifact-boundaries.md#L9) | [cybersecurity-firms/lac.md:9](../../cybersecurity-firms/lac.md#L9) | Cite the dated source with any volume; they are not interchangeable. |
| low | [cybersecurity-firms/cisco-splunk.md:17](../../cybersecurity-firms/cisco-splunk.md#L17) | [cybersecurity-firms/splunk-triage-controls.md:45](../../cybersecurity-firms/splunk-triage-controls.md#L45) | Training consent is documented; inference retention and Triage-specific paths remain unknown. |
| low | [assessment-evidence/deep-garak.md:97](../../assessment-evidence/deep-garak.md#L97) | [assessment-evidence/deep-garak.md:202](../../assessment-evidence/deep-garak.md#L202) | The stale-first-digest risk applies to append/rebuild paths other than rebuild_cis. |
| low | [cybersecurity-firms/gmo-flatt-security.md:49](../../cybersecurity-firms/gmo-flatt-security.md#L49) | [cybersecurity-firms/takumi-github-scope-boundary.md:11](../../cybersecurity-firms/takumi-github-scope-boundary.md#L11) | Treat the App manifest as unknown, not merely queued. |
