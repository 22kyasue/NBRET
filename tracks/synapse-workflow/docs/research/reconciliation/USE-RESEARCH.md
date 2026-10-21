# Using the NBRET security research

This directory turns roughly 5 MB of security research (264 studies plus the Synapse mapping) into something an agent or engineer can act on. It covers delivering authorized client security assessments: scoping, tools, evidence, reporting, retest, AI assistance, providers and pricing.

The **register** is the core of it: 325 findings, 203 corrections and 80 hazards, each tied to an exact quoted line in a study. A validator re-checks every quote against its source. The register is a map into the evidence, not a replacement for it. Before you make a client-facing claim, read the cited lines.

## Start here

1. **Search before you advise, choose a tool or build anything.**
   ```sh
   node docs/research/reconciliation/find-research.mjs "your question in plain words"
   ```
   Results come back in this order: hazards, then findings (claim, what to do, limits, sources), then corrections, then study passages (at most two per file). Passages that a later study supersedes are flagged inline. `--show <id>` prints one entry in full and `--json` gives machine-readable output. Japanese queries work for common terms.
2. **Check the [hazards](#do-not-do-these) below.** Several studies still contain "next step" text for work that was stopped, and setup commands that touch live services.
3. **Read the cited lines and their corrections**, then write your recommendation using the [decision record](#decision-record).
4. **Browse by area** with the [domain digests](#domain-digests) when you need the full picture of one topic.

## Ten things the research establishes

These rules apply across the tools, providers and AI systems studied. Each one rests on several findings. The evidence level is given in brackets: real tool run, fixture run, source reading or documentation. Each finding is stated for the tool and version it was observed on; don't widen it without checking. These are also the claims an agent is most likely to get wrong without the research.

1. **A status is not an effect.** "Completed", "PASS", HTTP 200/201, "session opened", "closed on reimport" and "Autofix completed" each describe a step, not an outcome.
   - In two real ZAP daemon stop runs, NBRET wrote `completed` while a rule's request was still in flight, and an alert arrived afterwards [real tool run] (`scanners.zap-stop-completed-before-quiescence`).
   - ZAP reports a stopped scan as progress 100, FINISHED [source reading] (`scanners.zap-stopped-scan-reports-100`).
   - Defender returns 201 when an isolation action is created, whether or not it later succeeds [documentation] (`defensive-response.defender-action-created-not-succeeded`).
   - Takumi's "Completed" means a pull request was opened [documentation] (`ai-evaluation.takumi-autofix-completed-is-pr-created`).
   - A Metasploit session is not proof of impact or cleanup [source reading] (`testing.exploit-framework-status-semantics`).
2. **An empty result is not a clean result.** Output can be empty because collection was denied, a call errored, a cap or deadline cut the run short, or nothing was attempted.
   - Prowler's admin-privilege check body returns PASS when the policy document was not collected [fixture run; end-to-end CLI output not verified] (`cloud.prowler-false-pass-on-missing-policy`).
   - A cancelled BloodHound traversal returned no error after one visit [fixture run] (`identity-ad.traversal-cancel-returns-nil`).
   - OpenFGA ListObjects/ListUsers results can be silently truncated by caps or deadlines [source reading] (`authorization.enumeration-not-complete`).
   - rpcdump can print "No endpoints found" after a protocol failure [source reading] (`network-discovery.empty-protocol-output-not-negative`).
   - Takumi's "Not Vulnerable" means it could not reproduce the issue [documentation] (`reporting.takumi-not-vulnerable-means-not-reproduced`).
3. **The tools do not enforce scope; within an authorized engagement, enforce it outside them.**
   - A real ZAP daemon configured for `/allowed` also requested `/allowed/` [real tool run, one case] (`scanners.zap-path-scope-not-enforced`).
   - Nuclei's network policy is a denylist, and in same-scheme redirect mode redirects can reach other hosts [source reading] (`scanners.nuclei-network-policy-is-denylist`).
   - mitmproxy forwards ignored hosts raw and, by default, does not record them [source reading] (`interception-proxy.allowlist-not-scope-control`).
   - Scrapy's offsite filter only matches host names [source reading] (`crawling-load.offsite-filter-not-egress-sandbox`).
   - Takumi's manual says excluded URLs may still be requested [documentation] (`safety.takumi-exclusions-not-access-block`).
   - The Python agent SDKs only pass sandbox and permission options to the CLI; whether the CLI enforces them was not tested [source reading] (`agent-runtime.sdk-permissions-are-configuration`).
   - Use an independent egress control, and check every discovered target against the authorized scope (`network-discovery.target-expansion-needs-scope-check`).
4. **Assessment tools can change client state.** This rule rests on source and test reading; no duplicate request was observed on the wire.
   - ZAP treats every request as safe to retry, and its upstream tests expect POST/PATCH/DELETE to be sent five times on IO failure [source and unrun test reading] (`scanners.zap-retries-mutating-requests`).
   - Nuclei replay resends state-changing requests with their auth headers (`scanners.nuclei-replay-resends-requests`).
   - The HTTP verb does not tell you whether a request is safe (`authorization.http-verb-not-safety`).
   - Prowler calls GenerateCredentialReport, does work at module import, can load checks from S3 and has fixers (`cloud.posture-tool-not-read-only`).
   - Nuclei's OpenAPI ingestion generates state-changing requests (`scanners.nuclei-openapi-ingestion-scope`).
5. **Every piece of evidence must be bound to an identity.**
   - A status-only 403 check missed a 403 that still returned another tenant's invoice [fixture run, 3/3] (`authorization.deceptive-403-status-only-oracle-fails`).
   - NBRET's offline matcher picks saved evidence by method, URL and body, ignoring the principal [fixture run] (`evidence-handling.e01-offline-identity-ambiguity`). The audit confirmed the same code is still in `src/checks.mjs` (`corr.evidence-handling.e01-still-present`).
   - In a component test, Nuclei's project cache keyed responses on pre-auth request bytes, so a stored tenant-A response was replayed for an identical pre-auth request [fixture run]. Full-engine cross-tenant behavior is a source prediction (`authorization.nuclei-project-cache-preauth-key`).
   - A failed Nuclei dynamic login returns no error to the request path, so requests may proceed unauthenticated [source reading] (`authorization.nuclei-dynamic-auth-failure-silent`).
   - In an authorized assessment, test whether user A can make the app query the policy engine as user B [source reading] (`authorization.caller-vs-subject-binding`).
6. **Deliverables leak secrets unless you redact them field by field.**
   - ZAP's SARIF builder, run on a fixture, masked only `Authorization`; cookies, API keys, query strings and bodies survived [fixture run of the installed builder] (`evidence-handling.zap-sarif-keeps-secrets`).
   - garak writes nested `api_key` values into its report setup row without redaction [fixture run, synthetic key] (`evidence-handling.garak-report-keeps-api-key`).
   - ZAP "plus" reports embed full HTTP messages [source reading] (`reporting.zap-plus-reports-raw-messages`).
   - Nuclei redacts four fields and leaves trace and debug output raw [source reading] (`evidence-handling.nuclei-redaction-four-fields`).
   - Proxy captures and pcapng files can carry credentials and decryption secrets [source reading] (`evidence-handling.proxy-captures-unredacted-ca-key-plain`, `evidence-handling.pcap-carries-secrets-and-mixed-names`).
7. **A retest compares like with like; a disappearance is not a fix.**
   - A cached "allow" survived revocation until higher consistency was requested [fixture run, in-memory backend] (`authorization.revocation-retest-consistency`).
   - A direct-path fix still allowed payment after an edit, which is an instance fix, not a class fix [fixture run] (`service-delivery.instance-vs-class-repair`).
   - A finding can drop out of reimport because of filters, failed authentication, narrower scope or a parser change [source reading] (`reporting.defectdojo-closure-not-fix`).
   - Pin the model or policy version [source reading] (`authorization.model-version-not-pinned`).
8. **For AI, audit the scorer before trusting it, and keep enforcement outside the model.**
   - One AgentDojo check (banking user_task_6, v1.2.2) accepts a wrong recipient [fixture run] (`ai-evaluation.agentdojo-usertask6-accepts-wrong-recipient`).
   - AgentDojo's "security=true" means the attack succeeded, and some infrastructure errors also score true [fixture run] (`ai-evaluation.agentdojo-security-field-means-attack-success`).
   - A quoted canary passed while the real effect was false [fixture run] (`ai-evaluation.text-canary-oracle-not-effect`).
   - A truncated preview passed exact-quote grounding [fixture run] (`ai-evaluation.preview-grounding-accepted-as-complete`).
   - Nuclei's LLM matcher accepts evidence that is not in the response [fixture run] (`ai-evaluation.nuclei-llm-matcher-ungrounded`).
   - PentestGPT gives both roles full access, with no scope enforcement at the tool or network layer [source reading] (`agent-runtime.pentestgpt-full-access-no-scope`).
   - The agent SDK transports pass the whole parent environment to the agent CLI [source reading] (`agent-runtime.subprocess-inherits-full-environment`).
   - What does work: a code gate outside the model rejected hostile actions [fixture run] (`safety.capability-gate-outside-model`). Admission procedure: `ai-evaluation.audit-evaluator-before-tester`.
9. **Vendor numbers measure something other than what their headline says.**
   - SOC-AI figures measure agreement, feedback or internal timing, not accuracy [vendor claims] (`ai-evaluation.vendor-ai-metrics-are-not-accuracy`).
   - In Microsoft's phishing trial, analysts shown AI verdicts missed more of the planted false negatives [vendor study] (`ai-evaluation.ms-phishing-trial-automation-bias`).
   - In GMO Flatt's single-target Takumi vs AWS benchmark, which the vendor designed, the winner depends on the metric and threshold chosen (`ai-evaluation.takumi-benchmark-threshold-dependent`).
   - SOC/MDR SLA clocks measure contact or start of work, not containment [documentation] (`service-delivery.sla-clocks-measure-engagement-not-containment`).
   - Storing data in Japan does not mean AI inference runs in Japan [documentation] (`providers.japan-storage-not-japan-inference`).
10. **Stop does not stop running work, and load limits multiply.**
    - Pause stops new pickup only; drain, obliterate and scheduler removal delete state without ending running jobs [source reading] (`workers-queues.pause-leaves-active-running`, `workers-queues.admin-ops-not-kill-switch`).
    - Close and timeout are not hard termination deadlines [source reading] (`workers-queues.close-timeout-not-hard-deadline`).
    - BullMQ cancel signals and returns true, but a processor that ignores the signal keeps working [fixture run] (`workers-queues.cancel-acknowledged-not-stopped`).
    - Scrapy politeness applies per crawler, so several crawlers multiply the load on the target [source reading] (`crawling-load.crawler-budgets-multiply`).
    - In-memory rate limiters apply per instance and key; two instances doubled the budget [fixture run] (`crawling-load.quota-scope-per-instance-and-key`).
    - Queue job rate limits count job starts, not requests [source reading] (`crawling-load.job-rate-not-request-rate`).
    - Kill-switch design: `workers-queues.kill-switch-sequence`.

## Across an engagement

| Stage | What the research says to do | Start with |
| --- | --- | --- |
| Sell and scope | Agree the client question, purchase type, surfaces, accounts per role or tenant, vantage point and what is out of scope. Size effort against dated public comparators; quote price from our own scope and labor, since comparator prices buy different work. | `service-delivery.four-purchase-types-and-lifecycle-states`, `service-delivery.surface-access-requirements`, `service-delivery.engagement-checklist`, `commercial.hackerone-staffed-pentest-effort-terms`, `commercial.observed-public-prices`, `commercial.takumi-credit-pricing`, `service-delivery.mandiant-assessment-effort-and-roles` |
| Authorize | Get written permission, cite standards by exact version, and treat MDR or response authority as a per-action matrix. | `standards.versions-to-cite`, `standards.procurement-regimes`, `service-delivery.mdr-authority-matrix-patterns`, `service-delivery.public-pages-are-not-signed-terms` |
| Choose tools | Write down the claim each tool's output supports and the oracle that will confirm it. Enforce scope and egress outside the tools. Get licence review before embedding tools, and add a scanner or adapter only on a demonstrated gap. | `service-delivery.tool-role-evidence-limits`, `scanners.zap-path-scope-not-enforced`, `network-discovery.target-expansion-needs-scope-check`, `commercial.tool-licences-not-plain`, `service-delivery.rea-integration-order` |
| Discover and test | Report states with their reason codes. Check every discovered target against scope. Never treat a verb as a safety class. A false, denied or missing result, or a missing graph path, is not a negative finding. | `network-discovery.nmap-states-are-inferences`, `network-discovery.target-expansion-needs-scope-check`, `authorization.http-verb-not-safety`, `identity-ad.bloodhound-edges-skip-deny`, `authorization.false-is-not-deny`, `cloud.collection-states-collapse` |
| Keep evidence | Bind evidence to identity, keep the raw native output, redact field by field and record completeness. | `evidence-handling.finding-record-separation`, `evidence-handling.har-roundtrip-lossy`, `standards.claim-record-fields` |
| Report | Separate observation, inference and hypothesis. List what was not tested. Never report an empty or terminal state as clean. | `reporting.nbret-failed-scan-no-gaps`, `reporting.zap-report-filter-fail-open`, `service-delivery.small-service-exercise-template` |
| Remediate and retest | Use the same identity, scope, model version and consistency mode. Test the class as well as the instance. | `reporting.defectdojo-closure-not-fix`, `authorization.revocation-retest-consistency`, `service-delivery.instance-vs-class-repair` |
| Use AI | Compare against a realistic expert baseline at equal scope, access and budget, using a scorer audited before use, and include failed and unscored runs. Keep capability gates outside the model. | `ai-evaluation.audit-evaluator-before-tester`, `commercial.evaluation-and-buyer-evidence-protocol`, `safety.capability-gate-outside-model` |
| Operate workers | Use leases, attempt tokens, fencing of external effects and verified quiescence. Budget load per target, not per worker. | `workers-queues.kill-switch-sequence`, `workers-queues.lease-token-not-effect-fence`, `crawling-load.crawler-budgets-multiply` |

## Domain digests

Each digest lists that area's hazards, findings (strongest evidence first), and corrections with links to source lines. They are generated from the register, so do not edit them by hand.

| Area | Findings | Digest |
| --- | --- | --- |
| Service delivery: scoping, process, deliverables, retest | 23 | [service-delivery](domains/service-delivery.md) |
| Commercial: pricing, effort, buyer evidence | 13 | [commercial](domains/commercial.md) |
| Standards and procurement | 4 | [standards](domains/standards.md) |
| Security providers: services, SLAs, AI claims | 10 | [providers](domains/providers.md) |
| Defensive response: EDR/MDR actions, approval | 17 | [defensive-response](domains/defensive-response.md) |
| Evaluating AI contributions | 24 | [ai-evaluation](domains/ai-evaluation.md) |
| AI agent runtimes and SDKs | 26 | [agent-runtime](domains/agent-runtime.md) |
| Authorization testing | 43 | [authorization](domains/authorization.md) |
| Scanners: ZAP, Nuclei, NBRET adapter | 21 | [scanners](domains/scanners.md) |
| Evidence capture, integrity, confidentiality | 49 | [evidence-handling](domains/evidence-handling.md) |
| Reports and finding state | 17 | [reporting](domains/reporting.md) |
| Cloud configuration auditing | 16 | [cloud](domains/cloud.md) |
| Network discovery: Nmap, DNS, packets | 6 | [network-discovery](domains/network-discovery.md) |
| Directory and identity analysis: AD, BloodHound | 5 | [identity-ad](domains/identity-ad.md) |
| Interception proxies | 4 | [interception-proxy](domains/interception-proxy.md) |
| Workers and queues | 26 | [workers-queues](domains/workers-queues.md) |
| Crawlers and load against client systems | 11 | [crawling-load](domains/crawling-load.md) |
| Safety boundaries and stopped work | 10 | [safety](domains/safety.md) |

## Do not do these

The full list is in [`register/hazards.json`](register/hazards.json). Search surfaces the relevant hazard first, and flags it again on any passage that contains it. The categories that matter most:

- **Resuming stopped work.** Several studies still propose these as "next steps", but they were stopped. Do not run, re-propose or route around them without Kotaro's explicit instruction. The pauses' causes are unknown: [safety-context](../safety-context/README.md) records user reports, not recovered warnings. The dependency build is different: Windows blocked a downloaded archive (event E01). Do not retry it or work around the block.
  - The Prowler denied-collection experiment: `hazard.prowler-next-oracle`, `hazard.toolchain-continuation-prowler`.
  - The OpenFGA recovery and channel-close reproduction: `hazard.openfga-recovery-channel-close-stopped`.
  - Further scanner capability and reachability labs: `hazard.priorities-capability-backlog`, `hazard.nbret-scanner-next-daemon-fixture`, `hazard.control-path-real-daemon-needed`.
  - The Windows-blocked dependency build: `hazard.blocked-build`, `hazard.nuclei-full-path-reproduce`.
- **Treating "flagged operation" as a known cause.** Do not report that a specific action was flagged (`hazard.flagged-operation-certainty`).
- **Running upstream test suites or setup scripts.** Some call live services: AWS buckets, CrowdStrike, Palo Alto (demisto) endpoint isolation, Google SecOps and public DNS. Others flush Redis, drop tables, launch privileged containers or open console windows. Examples: `hazard.go-integration-tests-live`, `hazard.falconpy-tests-call-live-services`, `hazard.pan-isolation-test-performs-real-isolation`, `hazard.upstream-flushall-suite`, `hazard.privileged-compose`, `hazard.sdk-live-scripts`, `hazard.google-rule-integration-test-live`, `hazard.pgx-benchmark-drop-table`, `hazard.sdk-tests-visible-windows`.
- **Running research labs, demos or active scans** as part of a reading or audit task (`hazard.lab-script-rerun`, `hazard.demo-tiers-active-scan`).
- **Adopting evasion or IP-rotation advice** for client crawling (`hazard.anti-blocking-advice`).
- **Trusting stale status text.** Many large studies are partly newest-first, so "partial", "unread" and "next" lines lower down are often historical. Search flags these.

## Corrections that change client claims

203 corrections pair an earlier passage with the later one that narrows, reverses or supersedes it. Search attaches them to the affected passages, and each digest lists its own. The 25 high-risk corrections are the ones where reading only the earlier text would produce a wrong client claim. Examples:

- **Do not report as a vendor vulnerability:**
  - The OpenFGA CEL sync.Once compile defect. Ordinary model writes rejected invalid conditions before storage in a command-level test with the in-memory backend (`corr.authorization.cel-sync-once-not-reachable`, `corr.authorization.openfga-failed-compile-not-public`).
  - Checksum retention across retries, which is intended behavior (`corr.evidence-handling.checksum-retry-intent`).
  - The ZAP history cache. It is a helper-level divergence, not a live proxy vulnerability (`corr.interception-proxy.zap-proxy-cache-caller`).
- **Confirmed by later evidence, although earlier text calls it untested or source-only:**
  - Stop reported as completed: real ZAP daemon run (`corr.scanners.sc05-interruption-untested`).
  - Out-of-path requests: one real ZAP daemon run (`corr.scanners.sc01-real-alert-selection`).
  - SARIF secret retention: fixture run of the installed report builder; filters, database and daemon untested (`corr.evidence.sarif-builder-confirmed`).
  - Mutating-request retries: an upstream ZAP test, read but not run, expects them (`corr.scanners.retry-test-found`).
- **Provider claims to describe precisely:**
  - Do not promise a universal manual approval gate for Trend MDR. Its documents conflict, and some actions are catalogued as no-approval-required (`corr.defensive-response.trend-approval-gate`).
  - Assume Takumi inference may run outside Japan unless a signed domestic-inference arrangement is active. The paid option was announced for 2026-11-02 and has not been verified as available (`corr.providers.takumi-domestic-inference`).
  - LAC's 15 minutes is analysis-start-to-contact (`corr.service-delivery.lac-sla-scope`).

## What the research does not establish

Say so plainly when a decision depends on one of these:

- **No measured assessment hours, validated buyer demand or pricing model of our own.** Prices and effort figures are dated public comparators (`commercial.no-measured-assessment-hours`, `commercial.five-falsifiable-hypotheses`).
- **No client-system replica, calibrated business-loss estimate or complete observed Synapse engagement** (`service-delivery.synapse-mapping-gaps`). The Synapse strategy files sit outside this repository (`hazard.external-strategy-path`).
- **No full Nuclei engine run.** The dependency build was blocked (`safety.nuclei-full-engine-never-run`).
- **Little real-tool evidence.** Only 6 of 325 findings rest on a real integrated tool run, 64 on component or fixture runs and 175 on source reading. The rest are documentation (48), vendor claims (5) and our own synthesis (27). Treat source-trace findings as candidates for your own context, not as observed client behavior.
- **No studies of AI agent runtimes in bots-swarms.** That research covers job queues, crawlers, rate limiters, a WAF and peer membership (`agent-runtime.bots-slice-scope`).
- **Receipts largely unread.** Most supporting JSON receipts and scripts were not read in the reconciliation. The reconciliation credited 18 of 580 JSON files as read. Auditors spot-checked about 30 receipts, and all matched their Markdown summaries except one PDF with no extractable text.

## Evidence strength

When you cite a finding, state its strength. Strongest first:

| Strength | Meaning |
| --- | --- |
| integrated-lab | A real tool or daemon ran in a controlled lab |
| component-lab | Extracted, mock or fixture code ran |
| source-trace | The code path was read, not run |
| public-doc | Vendor or standards documentation, contracts or pricing pages |
| vendor-claim | Self-reported marketing or benchmark results |
| synthesis | Our own reasoning across studies |

## Decision record

Include these fields in any material service or technical recommendation, either in the answer or in the task's design document:

1. **Question and client outcome.** What decision is being made, for whom, and under what scope and access assumptions?
2. **Relevant research.** Which register entries and passages support the approach, which narrow or contradict it, and which hazards and corrections apply?
3. **Evidence strength.** Use the scale above. Name what has not been observed.
4. **Choice and alternatives.** Why this approach fits, what an alternative would improve, and what remains unsettled.
5. **Validation.** What independent observation would prove success, and what result would disprove it?

Do not start a fresh implementation just because the research contains a plausible tool combination. The existing NBRET code is a prototype to assess, not a chosen architecture.

## Maintaining the register

- **Adding a finding or correction.** Add the entry to the JSON in [`register/`](register/), then run:
  ```sh
  node docs/research/reconciliation/build-register.mjs   # regenerate domain digests
  node docs/research/reconciliation/find-research.mjs --check   # quotes, schema, links
  node docs/research/reconciliation/find-research.mjs --eval   # retrieval recall
  ```
  The schema is enforced by `--check`. Quotes must be copied exactly from the cited line.
- **Writing a new study.** Record its claims, contrary evidence and the decision it changes, and add register entries for anything decision-relevant. When a later result corrects an earlier one, add a correction rather than editing the earlier study.
- **Search quality.** It is measured against independent question sets in [`eval/`](eval/). On 54 independently written questions:
  - **The original search:** found the answering passage within its top five results for 35% of questions.
  - **The register search, passages only:** 81%.
  - **The register search, findings alone:** 100%.
  - **The register search, findings or passages:** 100%.
  - **Answer-level judgment:** an independent reviewer read only the top results for each question. 52 of 54 were answered outright and 2 pointed to the right file. None was misleading.

  See [README](README.md) for method and limits.

The history of how this was built is in the [README](README.md): Pine's original reading ledger and the independent audit that rebuilt the register.
