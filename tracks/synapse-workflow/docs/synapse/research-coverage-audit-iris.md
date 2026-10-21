# Research coverage audit: from guided rehearsal to unfamiliar-site investigation

Iris, 2026-10-21. Read-only source/document audit for Cass. Only this document is authored by this assignment. No target traffic, runtime tests, provider/scanner/browser use, installation, commit or shared-source changes were performed.

## Decision and scope

Kotaro wants accumulated research to improve autonomous investigation and monitoring rather than remain an unused catalog. The decision is which missing capabilities deserve the next bounded acceptance exercise. The current implementation is useful engineering evidence, but **72 passing selected tests are not a discovery-accuracy result**. The overnight handoff identifies those as 65 local tests plus seven reader-model regressions, with guided secure/ownership-gap runs. They neither sample 72 independent applications nor establish recall on an unfamiliar website.

Cass subsequently relayed Kotaro's ownership declaration and selection of `https://tobirastudio.com` for a fresh first acceptance target. Cass owns exact-domain public read-only mapping, excluding form submission, account actions, third-party expansion and mutation. This audit makes no requests and asserts no observed features of that site. Treat it as the declared agency-site target, not an assumed commerce app: accounts, administrative routes, orders and verification mail are not established requirements. This new scope does not resume historical stopped experiments.

## Inventory and what was actually read

Direct JSON inventory of `docs/research/reconciliation/register/` at audit time: **334 findings, 203 corrections, 80 hazards**. The older guide's 325 and October 20 inventory's 328 are historical snapshots, not contradictory current counts. Findings span 18 domains:

| Domain | Findings | Application to this decision |
| --- | ---: | --- |
| agent-runtime | 29 | Tool authority, credentials, lifecycle and execution boundaries |
| ai-evaluation | 25 | Scorer correctness, comparison and denominators |
| authorization | 43 | Identity/policy binding and conditional decisions |
| cloud | 16 | Collection completeness; cloud access is not admitted here |
| commercial | 13 | Cost, effort and buyer evidence; not discovery proof |
| providers | 10 | Delivery claims and actual evidence limits |
| service-delivery | 24 | Outcome, scope, policy, repair and acceptance |
| crawling-load | 11 | Shared budgets and permitted collection |
| defensive-response | 17 | Distinct execution/telemetry/response states |
| evidence-handling | 51 | Provenance, confidentiality and lossy export |
| identity-ad | 5 | Conditional reachability; directory access not admitted |
| interception-proxy | 4 | Capture completeness and boundary limits |
| network-discovery | 6 | Reachability inference and target expansion |
| reporting | 17 | Failure/unknown propagation and retest status |
| safety | 10 | External enforcement and stopped-work hazards |
| scanners | 23 | Tool-role limits and actual execution coverage |
| standards | 4 | Versioned claim and authority records |
| workers-queues | 26 | Leases, cancellation, effects and quiescence |

Strength labels across the register: source-trace 183; component-lab 64; public-doc 49; synthesis 27; integrated-lab 6; vendor-claim 5. These classify research entries, not independent experiments, implemented requirements or current runtime reliability. A catalog entry is not necessarily a product requirement; marking an item irrelevant/deferred with a reason can be correct utilization.

Read AGENTS.md, CONTEXT.md and the research usage guide; searched with `find-research.mjs` for autonomous discovery, expert baseline, evaluator custody, business policy, coverage and monitoring. Inspected register metadata, selected relevant cards/corrections and exact study passages listed below. Read whole-system inventory, evaluation boundary/admission documents and local acceptance history; inspected current local evaluator and the runner's protocol/registration/report path. This is a **sampled audit**, not a claim to have read or implemented all 334 findings, all cited receipts, every domain study or all source modules. Historical receipts/tests were read as records, not rerun as current proof.

## Strongest gaps and falsifiable next checks

### 1. Guided protocol execution does not establish unfamiliar-site discovery

Current `src/lab/run.mjs` checks the linked `/api-docs` shape and exact order rule, then invokes known registration/login/order paths. `evaluate.mjs` admits one object-read predicate. URL-first startup is real, but the action sequence and meaning are familiar. The inventory already contains explore/discover/structure tools, so “nothing exists” would also be wrong: their presence and historical fixtures do not establish a connected investigator that chooses useful next actions on an unfamiliar site.

Basis: [framework](../research/assessment-evidence/framework.md):7–13, 19–28; [autoresearch review](../research/security-landscape/repository-reviews-20261021/autoresearch-review-ginger.md):75–133; `commercial.evaluation-and-buyer-evidence-protocol` (synthesis). **Decision:** make the next read-only TOBIRA exercise observation-driven: record each discovered page/interaction candidate, why it matters, the next discriminating observation and its stopping reason. Do not force the local order workflow onto the site. **Check:** a reviewer can reconstruct which next actions came from observed evidence; absent/unsupported features produce explicit gaps rather than fabricated accounts or findings. A proposed later unfamiliar held-out trial requires gap 5 first.

### 2. The effect oracle covers one rule; broader effects require their own contracts

The current oracle has meaningful identity/object/build/generation/positive/anonymous/partial/redaction controls. It is not a general evaluator for writes, session takeover, workflow transitions, asynchronous effects, injections or business loss. Existing approval-revision fixtures offer reusable ideas, not an already integrated multi-effect engine.

Basis: `service-delivery.instance-vs-class-repair`, [executable claims](../research/assessment-evidence/executable-claims.md):5–9,19,23–27 (component-lab with explicit exclusions); `ai-evaluation.audit-evaluator-before-tester`, [framework](../research/assessment-evidence/framework.md):75–87 (draft synthesis). **Decision:** add an oracle only when an observed, admitted surface poses a specific outcome question; a helper cannot appoint itself score authority. **Check:** each oracle rejects wrong actor/resource/revision, pre-existing success-shaped state, quoted success, incomplete evidence and excluded extra effects; a deliberate failing control must reach its assertion. For public TOBIRA mapping, lack of an applicable protected-state oracle means no such effect claim. Contrary evidence: [AgentDojo](../research/assessment-evidence/deep-agentdojo.md):53–59 and `corr.ai-evaluation.agentdojo-not-blanket-weak` show selected defective predicates coexist with stronger ones; avoid dismissing whole tools from a single counterexample.

### 3. Coverage must retain reachable, blocked, unsupported and untested separately

Request totals, route inventories and zero findings omit the denominator of meaningful work. Authentication unavailable, dependency absent, timeout, parser failure, out-of-scope target and safely unattempted action have different meanings. The local report records limits, but arbitrary-site coverage and consistent propagation across legacy adapters remain unproven.

Basis: `authorization.false-is-not-deny`, [AuthZEN study](../research/assessment-evidence/authzen-evidence-boundaries.md):17–21 (source-trace); `reporting.nbret-failed-scan-no-gaps`, [scanner reporting study](../research/security-landscape/deep-review/nbret-scanner.md):54–56 (selected synthetic execution). **Decision:** retain a surface × identity × operation/state ledger with observed, attempted, blocked(reason), unsupported, untested and inconclusive outcomes. “Not applicable” requires an explicit rationale, not a pass. **Check:** counts conserve discovered candidates through disposition; error/omitted/unsupported inputs survive every canonical-report projection. No missing scan becomes “no gaps.” For TOBIRA, distinguish observed public links from unvisited destinations and excluded form submission.

Reachability is also a claim-admission gate: `corr.authorization.cel-sync-once-not-reachable`, [ordinary admission correction](../research/assessment-evidence/continuation-exhaustion.md):102–107, narrows a component defect because normal model admission rejects its prerequisite. A source pattern or modeled path is not enough to report a reachable vulnerability.

### 4. Intended business policy cannot be inferred solely from observed behavior

The local order rule is deliberately declared. An unfamiliar site's implementation, names or responses cannot establish who should access what or how much harm matters. Agency-site success may concern public navigation, inquiry routing, confidentiality and intended external integrations; those are questions to resolve from evidence/owner authority, not assumed defects or permission to submit forms.

Basis: [research-to-service](../research/synapse/research-to-service.md):13–19, `service-delivery.synapse-mapping-gaps` (synthesis); [framework](../research/assessment-evidence/framework.md):32–45; [executable claims](../research/assessment-evidence/executable-claims.md):5 explicitly calls its rules declared. **Decision:** separate observed behavior, policy hypothesis and owner-confirmed requirement. **Check:** every violation/severity claim cites a policy authority/version and affected condition; absent policy stays unknown with an owner question. No CVSS, model confidence or finding count substitutes for calibrated business loss. Public read-only mapping can continue while policy-dependent conclusions remain pending.

### 5. Shared-host review is useful corroboration, not protected custody

The current journal, raw digest and named reviewer cannot establish inaccessible hidden answers or authenticated external collection. `verifiedFindings` correctly remains empty. Separate chats, folders and labels do not enforce separation. Installed virtualization software is not demonstrated role isolation.

Basis: [framework](../research/assessment-evidence/framework.md):47–49; [evaluation boundary inventory](evaluation-boundary-inventory.md), [admission contract](evaluation-admission-contract.md); `safety.capability-gate-outside-model`, [executable claims](../research/assessment-evidence/executable-claims.md):25 (only gate decisions tested). **Decision:** continue useful openly guided discovery without calling it blind; establish custody only as a separately scoped capability. **Check proposed for later admission:** actual investigator tools cannot read key-side synthetic canaries via files, mounts, memory, board, connectors or management/network services, while permitted target access works. Freeze boundary/scorer versions and record exposure. This audit neither sets up nor validates a VM/account. A real owned site improves relevance but does not by itself supply hidden truth or independence.

### 6. There is no matched expert baseline or discovery-quality denominator

The 72 selected passing tests demonstrate specified engineering behavior. They do not measure expert-relative effectiveness, total flaw recall, marginal value of AI/tool selection, or reduction in analyst labor. Register retrieval scores measure research retrieval on their question set, not security discovery.

Basis: [framework](../research/assessment-evidence/framework.md):9–28; [synthesis](../research/security-landscape/synthesis.md):68–74, `commercial.evaluation-and-buyer-evidence-protocol` (proposed method, not measured outcome). **Decision:** report descriptive TOBIRA coverage and assistance now; defer superiority claims. **Check for later comparison:** name qualified baseline/adjudication owners, freeze equivalent scope/access/time/tools/hints, retain failed/unscored runs and all setup/review/retest labor. Report precision on adjudicated claims, unknown/inconclusive totals and recall only on independently established eligible seeds. Repeated prompts against one app are correlated observations. No universal acceptable sample size or expert qualification is established by these sources.

### 7. Repetition alone does not establish useful monitoring or verified repair

The local suite starts fresh secure/gap generations; these are controls, not a demonstrated repair of one deployed build. A scheduler that repeats reads would establish cadence, not correct change attribution, coverage of changed behavior, alert delivery or response.

Basis: [discipline map](../research/security-landscape/discipline-map.md):15–18 (synthesis); [framework](../research/assessment-evidence/framework.md):25–26,69–73; [executable claims](../research/assessment-evidence/executable-claims.md):7–9,27; `service-delivery.instance-vs-class-repair`. **Decision:** define what change invalidates each claim (content/build/configuration/policy/identity/dependency), its permitted recheck and owner. **Check:** retained before/after evidence links explain a detected change; old assurance becomes stale rather than silently current; unchanged functionality and nearby paths are tested when an actual repair is admitted. For TOBIRA, a public-page change can be an observation without becoming a vulnerability. Any recurring execution requires its own scope/expiry/budget contract; none is scheduled here.

### 8. Enforcement and evidence retention are narrower than the intended agent

The typed loopback transport has useful enforced request budgets, scope and observed cleanup. It does not confine an unrestricted coding session's other tools. Exported root HTML/API-guide details are deliberately omitted; a raw digest without retained raw bytes cannot recover them. Ordinary source reading and runtime records should not be confused with independently replayable collection evidence.

Basis: `safety.capability-gate-outside-model`; [executable claims](../research/assessment-evidence/executable-claims.md):25; [framework](../research/assessment-evidence/framework.md):42–49; [overnight handoff](../../../../docs/consolidation/overnight-handoff-2026-10-21.md):38–40. Worker design is also bounded: `workers-queues.kill-switch-sequence` is synthesis, not proof of an end-to-end kill switch; see [worker model](../research/bots-swarms/model.md):37–39. **Decision:** specify the actual admitted executor and retain safe, sufficient observations for each claim. **Check:** scope/redirect/budget/cancellation denials are observable at the real request boundary, credential/omission status survives export, and claimed stop includes active-work/effect reconciliation. No renderer invents missing page evidence. Do not expand capture or execute historical stopped scanners to fill an evidence gap.

## Verifiable research → decision → test → evidence accounting

Use the existing register and journal as references rather than copying every study into prompts or building another parallel platform first. Proposed traceability records should carry:

| Link | Required check |
| --- | --- |
| Research | Stable entry IDs; exact study path/line plus source digest; read extent/date; strength/limits; applicable correction and hazard IDs. A card-only read cannot count as study verification. |
| Decision | Target outcome, applicability, selected approach/alternative, affected capability and explicit rationale. States: applied, partially applied, deferred, not applicable, unknown. None implies measured effectiveness. |
| Contract/test | Versioned predicate, policy authority, executor/identity/object/build bindings, controls, excluded states and failure/unsupported behavior. Distinguish proposed test from implemented and actually reached test. |
| Evidence | Exact command or observed request, source/config hashes, timestamps, run/receipt IDs, completeness/redaction, reached assertions, expected-vs-observed outcome and actual cleanup. No historical receipt silently becomes fresh proof. |
| Claim/revision | Canonical report reference, reviewer objections, bounded conclusion and stale/retest triggers. Preserve original failed runs and corrections; never quietly replace a disappointing outcome. |

Two-way audit: (1) every material decision/claim must resolve back to opened research and actual evidence or explicitly say hypothesis; (2) every in-scope research entry must resolve to an applicability disposition, with unresolved high-impact items visible. Include corrections/hazards even when a finding is applied. Later automated checks can validate references, hashes, duplicate IDs, count conservation, missing evidence and stale versions; they cannot certify that an owner policy is true or custody exists. No such checker is implemented by this audit.

Report research-use coverage as disposition counts over a frozen, explicitly selected relevant set, with unread/unknown and deferred counts beside applied counts. Do not use 334 as an implementation denominator without item-by-item review; some domains are deliberately outside a public agency-site assessment. Prioritize the eight gaps above over maximizing a superficial “research implemented” percentage.

## Implications for the three monitoring UI prototypes

Cass's subsequently relayed UI scope is interactive replay of saved rehearsal evidence, not live monitoring. All three alternatives should visibly identify saved replay, source run/build/generation and collection time, and distinguish replay position from original event time. A moving cursor or progressing timeline cannot stand in for a fresh request receipt.

Expose the current hypothesis, observable rationale, selected next action and its expected discriminating result; link concise research references to exact study/decision records with strength and limitations. Keep blocked/unsupported/untested/inconclusive states and their reasons accessible beside completed work. Display observed/exercised counts with their denominators rather than a percent-secure or discovery-accuracy badge. Show independently verified findings separately from guided effects and leads; preserve actual empty categories. A tool's success status and a verified effect need different visible fields.

Evidence details should retain receipt IDs, principal/object/build bindings, completeness/omission flags, raw digest limitations and reviewer objections. Show missing owner policy as an unresolved question. Show cleanup as observed, failed or unknown, with active-work/listener evidence when available. None of these UI requirements authorizes new target traffic, revealing hidden labels, redesigning the canonical report or changing prototype files in this audit.

Immediate acceptance order: establish evidence-backed public-site mapping and its coverage ledger; resolve policy-dependent questions; admit only a genuinely relevant discriminating test; retain negative/inconclusive results and reviewer challenge. Run matched comparative discovery and protected held-out evaluation only after their separate evidence gates are met. A completed investigation with no demonstrated vulnerability is a legitimate outcome.
