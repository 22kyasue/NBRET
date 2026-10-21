# What we have, what it establishes, and the next build decision

Inventory by Cass, October 20, 2026 Pacific. This combines the current NBRET working tree, its separate API-investigation worktree, the research register and source catalogs, saved implementation receipts, fresh ARTEX inspection on KrisPC, and the local Synapse CE checkout. It is an implementation/planning inventory, not an assessment of a customer or permission to resume stopped work.

The useful next product slice is a complete, evidence-backed application investigation and repair-verification cycle. We already have substantial collection, records, reporting and local-workflow engineering. We still need measured evidence that a chosen investigator can discover useful problems, support its conclusions, and help verify a real repair. Which investigator/runtime wins is unsettled.

## Scope and evidence vocabulary

The companion [inventory manifest](whole-system-inventory-2026-10-20.json) enumerates source, tests, scripts, documentation, experiments and design artifacts with byte counts and SHA-256. It also preserves research catalog pointers and checked local path availability. This inventories files; it does not credit reading every file. Dependencies, raw run contents, credentials, browser profiles, source trees inside `.tools`, and arbitrary other-PC files are excluded from the full byte manifest. Catalog pointers and selected source reads cover the external projects separately.

**Source inspected** means selected actual implementation paths were read. **Historical fixture evidence** means the named saved receipt/test record describes a past controlled result. **Fresh checked** refers only to this inventory's specified commands. **Documented** is a project's description, not independently observed operation. **Planned** is not implemented.

Initial snapshot before these new inventory documents: 1,387 files across the enumerated roots; 69 JavaScript source modules, 35 test files, 43 scripts; 285 research Markdown files and 590 research JSON files. These are file counts, not tool or completed-study counts. The original reconciliation covered a 264-study snapshot; current directory totals include later guides/digests/additions. The register initially held 325 findings, 203 corrections and 80 hazards. This investigation adds two bounded Synapse CE source findings and one ARTEX permission-boundary finding, bringing findings to 328; counts must not be conflated with empirical tests. The companion manifest also hashes 77 source/test/script/document files in the sibling API branch.

## 1. NBRET on main: collection and understanding

Location: `C:/Users/kotar/githubprojects/NBRET`. Git base `0fcdfa667d1276cfe7e9834ae87d42d917251dfb`, with extensive modified/untracked local work. Git HEAD alone does not identify today's implementation. Preserve the entire working tree; do not replace it with upstream or claim it has been committed/backed up.

| Component | What exists and how it helps | Evidence and practical limits |
| --- | --- | --- |
| Browser/network capture | `src/capture.mjs`, `run.mjs`, `rea.mjs`, harness adapters. Records observed requests/responses, actions, initiators, script identities, limits and optional source/visual material. | Source + historical fixtures. Browser-visible behavior cannot recover hidden server code or every application state. Action timing is not causal proof. |
| Explore and route discovery | `explore.mjs`, `discover.mjs`, interactions and harness. Bounded pages/states, links and route/access candidates. | Existing implementation/docs. Configured or observed coverage, not exhaustive discovery. Uses the existing computeruse harness for live browser work. |
| HTTP probes, assertions and regressions | `probe.mjs`, `http.mjs`, `assertions.mjs`, `checks.mjs`, contracts. Explicit requests, JSON/status predicates, decompression/budgets and baseline comparison. | Historical HTTP fixtures. **Legacy offline checks still match method/URL/body without identity**; do not use them to support identity-sensitive findings. |
| Source and workflow understanding | `structure.mjs`, `analyze.mjs`, `understand.mjs`, `workflow-examples.mjs`, diagnosis. Links saved scripts/source maps, candidate calls/routes, captured requests and scenario coverage. | Static possibilities and observed execution are distinct. It cannot infer the intended business rule from behavior alone. |
| ZAP integration | `zap.mjs`, `managed-zap.mjs`, tier orchestration; portable `.tools/ZAP_2.17.0` exists. Passive default, separately selected active settings and owned lifecycle. | Real historical daemon observations plus mocks/components; scanner output is not a reviewed finding. Historical active demos/scans are not instructions to rerun. |
| COPY/mirror and legacy readers | `copy/` (8 files), `mirror/` (6), earlier reader/renderers. Capture/rebuild/compare appearance and organize evidence. | Useful supporting tools; reconstructed appearance does not prove security equivalence. Earlier report renderers are not the approved Synapse report default. |

Entry points and detailed limits: [testing](../testing.md), [tiers](../tiers.md), [workflow understanding](../workflow-understanding.md), [route discovery](../route-discovery.md), [historical testing verification](../testing-verification.md).

## 2. Identity-aware assessment CLI

`src/assessment/` has five modules: CLI, core, matrix, template and transport. `npm run assess` exposes draft intake/planning, explicit case execution, offline evaluation, human review, access-matrix generation and fresh retest comparison.

It binds a case to principal, tenant, role, session epoch, environment/build, policy, request, controls and expected rule. Duplicate/stale/tampered/unfinished evidence becomes incomplete. A denial response that still contains protected data can fail the content rule. A deny-everything repair fails its legitimate-access control. Case-level declared effects and approval are checked before requests; redirects are not followed.

This is implemented JSON/API testing for predefined sequential cases, not general browser exploration or automatic business-logic discovery. Identity/build labels are operator declarations; exact-origin matching is not a DNS/IP or OS sandbox. In-flight cancellation is timeout bounded. Raw secrets/PII are not comprehensively redacted, encrypted or access controlled. Historical verification: 24 tests for the specified four-file suite, including nine assessment tests; a known-answer loopback repair lifecycle, with scripted review. See [assessment toolkit](../assessment-toolkit.md) and [verification](../assessment-verification.md).

## 3. Investigation records and local Synapse workflow

| Component | Built behavior | What remains unsettled |
| --- | --- | --- |
| Durable journal and typed records | `src/investigation/journal.mjs`, `records.mjs`, intake and local-input helpers. Ordered records, revision/concurrency checks, corruption detection, resume and bounded local input. | Shared-account hashes do not authenticate a collector or defeat an administrator rewriting history. |
| Evidence/case lifecycle | `casebook.mjs`, assessment import, report projection. Candidates, controls, evidence rejection reasons, reviews/objections, owner verification and matched retest admission. | Reviewer/owner labels are declarations. The shared-host workflow deliberately leaves independently verified findings empty. |
| Narrow effect checker | `proof.mjs`: exact cross-tenant work-order read, actor/owner identity receipts, exact-object legitimate control, content and build/instance binding. | Fixed owned-app predicate. It cannot evaluate arbitrary websites, account takeover, writes or every business consequence. |
| Structural evidence review | `evidence-admission.mjs` plus `scripts/review-evidence-admission.mjs`. Names missing references/context/prerequisites and contradictions. | Explicitly `consequenceEvaluated:false`: metadata readiness does not establish truth or complete prerequisite enumeration. |
| Measurement and stopping records | `measurement.mjs`: semantic novelty, effort accounting, frozen comparisons, reproducible rejected-candidate sampling, proposed iterations. | Missing labor stays unknown; comparison cannot certify independence or superiority. Pause thresholds are heuristics, not validated optimal stopping. |
| Consequences and screenshots | Consequence and overview modules plus screenshot registration. Separates observed effect, conditional harm, repair guidance and actual retest history. | Narrative consistency still requires review. Missing screenshot/effect evidence cannot be synthesized into a finding. |
| Owned practice business app | `src/practice/app.mjs`, session target and rehearsal. Two fictional organizations, four accounts and work-order submit/approve flows. | Synthetic in-memory application, familiar/source-accessible target; not a replica of a client environment or a blind benchmark. |
| Session workbench and CLI | Workbench server/UI, `session-cli.mjs`, intake/rehearsal CLIs, deterministic next-step selector. Typed proposals, scope/budgets, pause/stop, owner questions, records-only resume and export. | Built-in executor accepts only the owned practice app. Fixed action/actor vocabulary; no general autonomous investigator. A URL entered as intake cannot turn into an executable live target. |
| Proof evaluator baseline | `proof-baseline.mjs`: deliberately labelled denial/disclosure/denial-with-data scorer controls plus ordinary-app no-effect run. | Known-answer engineering acceptance, not a discovery success rate. Existing results do not authorize rerunning stopped/live work. |

The most recent durable context found is [ibis-context](ibis-context.md): it records 162 passes plus one Windows skip for the then-current Synapse suite, and 11 separately invoked structural-review tests. Older 44/80/114/144 counts refer to earlier suites/revisions and must not be added together. The saved baseline reports 26 observations/30 requests in the ordinary app, the selected cross-tenant effect not demonstrated, and all targets closed.

Fresh inventory verification: the existing evidence-admission and measurement suites passed **23 tests, zero failures/skips**. No HTTP targets or models were needed. This was not a fresh full-suite run. Source inspection and historical receipts cover the other engineering claims.

Guides: [complete workflow](LOCAL-WORKFLOW.md), [workbench](SESSION-WORKBENCH.md), [proof POC](proof-driven-poc.md), [requirements matrix](requirements-acceptance-matrix.md), [evidence gaps](tobira-evidence-gap-review-20261019.md). Some earlier documents still describe now-built pieces as future work; use newer receipts and actual source. The requirements matrix's earlier engine-not-found row is superseded by the fresh ARTEX observation.

## 4. Approved reader and existing visual artifacts

The canonical deliverable is `src/practice/reader-report.mjs`, `reader-model.mjs`, `reader-ui.js`, `reader-ui.css`, with bundled Inter and Noto Sans JP fonts. It presents company/application/test scope, actual cases, consequence maps, observations, uncertainty, repair proposals and real retest history. Standalone export and read-only projection exist. Continue using it; importing an external tool's dashboard does not replace the approved reporting direction.

`artifacts/synapse-ui` contains historical design work and provenance; fictional examples are not assessment evidence. The historical connected report shows one unconfirmed question and an error-only denial, not a verified breach. Current TOBIRA retained material has narrower separately documented observations and unresolved prerequisites; local counterfactual form behavior must not become a claim of live credential theft.

See [reader report](reader-report.md), [consequence contract](consequence-contract.md) and [evidence-admission records](evidence-admission-records.md).

## 5. Separate API-investigation branch: reusable work we must not lose

Location: `C:/Users/kotar/githubprojects/NBRET-api-investigation`, branch `feat/api-investigation`, HEAD `62e2b7274daee13750a0b974edf0af599f8e2d19`. Fresh `git status --short` was empty. Source filenames/package scripts, `docs/RESUME.md` and `docs/gaps.json` were inspected; its tests were not rerun or branch merged.

Its committed local work includes same-interacted-state DOM/CSS/assets/screenshot extraction; child frames and out-of-process frames; worker/service-worker requests and lifecycle; scoped cookie/localStorage/sessionStorage/IndexedDB transfer; observed API contracts and nested fields; structured WebSocket/SSE comparison and binary-message digests; canvas pixels and bounded motion/responsive comparisons; profile/cost advisor; artifact secret-shape review; proxy integrations and CA audit/trust experiments.

Historical local evidence covers Burp, mitmproxy and portable ZAP fixture comparisons, plus 53 then-passing tests. It does not establish current broad authenticated-app coverage. The CA audit is post-hoc detection, not browser enforcement; Windows trust changes require their own explicit scope and are not proposed here. Exported session artifacts can contain raw credentials. Browser/target lifecycles and stream limitations remain.

Next integration should be a selective source/contract comparison of one concrete missing capability, particularly retaining the exact interacted authenticated state. A blind merge of the older branch could regress main's newer evidence and workflow work. Neither branch has been modified by this inventory.

## 6. Research, source library and teaching assets

| Corpus | What we can use today | Important qualification |
| --- | --- | --- |
| `research/reconciliation` | Search register, corrections, hazards, 18 domain digests, cited decision guidance. | Register points to studies; read source passages and corrections before relying on a claim. |
| `research/security-landscape` | Service/discipline map, practitioner tools, NBRET identity/scanner evidence, comparative evaluation/business hypotheses. | Historical source snapshots; little integrated real-tool evidence. |
| `research/assessment-evidence` | Evidence claims, incidents, approval/retest methods, agent runtimes/SDKs, scorers, identity/cache/provenance studies and receipts. | A model saying success and an accurate quote are not proof of target effect. Most deep dependency reads are not runtime validation. |
| `research/toolchain` | Proxies, network discovery, packets, identity/AD, cloud posture, validation frameworks, report import/retest; source queues and pins. | A downloaded source tree is not an installed integration. Some plans are stopped; historical status prose can be stale. |
| `research/bots-swarms` | Queue/crawler/cancellation/rate-limit/cookie/identity/WAF boundaries; bounded source closure and fixtures. | Does not establish AI swarm capability or production bot detection. Per-worker limits may multiply. |
| `research/cybersecurity-firms` | Eleven company dossiers, delivery/process/AI/authority/retention/claims comparisons. | Vendor claims, contracts and first-party studies need their own evidence labels. Not measured buyer demand or our prices. |
| `research/learning` | Seven teaching chapters, linked dossiers, reconstruction notebooks and fictional service exercise. | Teaching labs and sample commands are not blanket run instructions. |
| `research/synapse` and `docs/synapse/strategy-review` | Research-to-service mapping and 15 reviewed strategy decisions; discovery/build/acceptance/evaluation contracts. | Planning assumptions and unresolved human prerequisites remain explicit. |
| `research/safety-context` | Stop chronology and hazard boundaries with evidence limitations. | Do not reproduce a blocked operation to diagnose it. Current aggregate request does not resume stopped operations. |

Catalogued local source families include REA, Semgrep, Nuclei/ZAP, Ghidra/Frida, CALDERA/Atomic, garak/promptfoo, PentestGPT, AgentDojo/OpenFGA and agent SDK snapshots; mitmproxy/Nmap/Wireshark, SharpHound/BloodHound/Impacket, Prowler/Metasploit/DefectDojo; Scrapy/BullMQ/rate-limiter-flexible/Coraza/memberlist and Temporal/LangGraph. Catalogs also contain metadata/README-only entries, which must not be called full checkouts. The manifest retains these distinctions where the catalog provides them.

Fresh file-existence checks found the recorded source paths available. Portable ZAP 2.17.0 files exist. Node, Python and Java resolve on PATH; Go, Docker, Semgrep, Nuclei and Nmap did not resolve in this shell. That does not rule out portable binaries or other-PC installs, and no installers were run. Source presence is not a working scanner/model/service.

Research-register `--check` passed after all three additions: 328 findings, 203 corrections, 80 hazards, zero problems and three existing question-count warnings. Retrieval evaluation still finds a matching passage/card in the top five for all 54 existing held-out questions; this is a retrieval check, not validation of conclusions or fresh blind evaluation. The reconciliation's evidence tally is dominated by source reading (175 of the original 325) and includes only six integrated-lab findings. It does not prove our future service's discovery accuracy.

## 7. External candidates

### ARTEX and Chris's local bridge

ARTEX source is at `C:/Users/stake/synapse-security/artex-global`, origin https://github.com/jiwoochris/artex-global.git, revision `fdfb7a17b7da5e2de716c0e98475ec77a41c64c6`. It is separate from the parent Synapse website repository. Nine untracked `tools/local-cli-bridge` files adapt ARTEX's model interface to logged-in Codex/Claude CLIs. The first inventory found no tracked engine changes relative to cached origin/main. The improvement is a provider integration, not yet evidence of better discovery or safer tool execution.

The detailed report and source archive are saved under `C:/Users/kotar/computeruse-inbox/krispc.tailca4ab9.ts.net-010ce98d/`; the report is `ARTEX-CAPABILITIES.md` and the extracted files are in `source-review/`. The October 21 JST local adapter timestamps do not prove which change the October 20 morning message meant. “clain” remains unidentified. No project or scanner was executed during either remote inventory; original code stays on KrisPC and selected non-secret copies accompany its detailed report.

| ARTEX capability | Concrete behavior and limits |
| --- | --- |
| Investigate a task | Text goal → planner → parallel workers → shared facts/assets/exploration graph. Human chat can add hints and steer tasks. It is model-directed, not a fixed list of guaranteed vulnerability checks. |
| Execute tools | Worker shell/file/web tools, optional interactive shell/search, enabled skills/MCPs, custom Python/command/HTTP tools. Actual registry depends on runtime bindings/configuration. Native execution uses process privileges; a task directory is not an OS sandbox. |
| Track results | Findings, facts, asset graph, traces, per-intent transcripts and optionally recorded HTTP traffic. Capture depends on settings and proxy use; findings can lack complete traffic bindings. |
| Report/retest | Markdown/CSV/task/finding reporting and a retest execution workflow. Model text, report generation and a retest run are not independent proof of a bug or repair. |
| Controls | Pause/steer/stop and configurable allow/deny/ask interception. Source explicitly removed an earlier authorization-scope mechanism; worker SDK permission mode is bypass, with separate hooks. No safe confinement or active rule configuration was established. |

Bridge flow: ARTEX sends text history and function schemas to an authenticated loopback Chat Completions-compatible endpoint → bridge launches `local-codex` or `local-claude` → CLI returns structured text/tool decisions → bridge validates names/argument shapes → ARTEX executes the returned tools and sends results on the next turn. It has no new scanner or vulnerability verifier.

The bridge uses existing CLI authentication and removes selected API-provider environment overrides; it does not prove subscription entitlement, billing or local inference. Prompt/history content still goes through the provider CLI and is not redacted by this adapter. Text-only input, limited JSON Schema support, no live token streaming, one concurrent call per provider, up to four waiting calls and a 120-second overall deadline are implemented. No persistent conversation is stored by the bridge; history is resent. Native tools are disabled/restricted via CLI flags, but **those flags do not constrain ARTEX's own tools**. Process cancellation has no demonstrated descendant-tree termination guarantee. The README claims connection/smoke checks and 14 tests; the inspection did not rerun them and the README excludes a full autonomous security test.

Read independently here: copied bridge `runner.mjs`, guard and worker options; the detailed report covers the remaining selected wiring. Forty selected source files were copied, not the complete runnable ARTEX repository. The tool is a candidate to evaluate, not an already admitted assessor.

### Synapse CE

Local checkout `C:/Users/kotar/githubprojects/synapse-ce`, origin https://github.com/KKloudTarus/synapse-ce, revision `a55a314aab8eb6e5979f7d886c82a0729776949f`. This is a separate public project with an Apache-2.0 top-level license; it is not our Synapse codebase.

It provides a much broader documented platform: dependency/package inventory and vulnerability matching; secret/source/configuration/container checks; optional language-specific reachability and taint proposals; code-quality gates; findings, evidence and reporting; cloud-posture connectors; Linux runtime/fleet modules; optional AI triage and probe workflows. Basic scanning is deterministic; AI is optional. The code contains actual scanner implementations, not just a dashboard.

Two independently source-read limits change the build decision:

1. Its chained exploitation/emulation lane uses an explicitly labelled **no-host simulation executor** at this revision. A simulated success is not an exploit result. This does not imply all other scanners or optional response lanes are simulated.
2. Basic SAST is bounded pattern matching, separate from optional stronger call-graph/taint modules. It has finite findings/file/line limits and skips. A no-hit result cannot establish a full semantic audit.

Live recon, governed probes and isolation depend on Linux capabilities; eBPF requires suitable Linux privileges. Source says code/report development features can run on Windows. Go/Docker are not on PATH here, and no binaries were built or executed. Its full development Compose configuration is not a reviewed deployment recipe. Exact component behavior and classification: [bounded external-platform reading](../research/security-landscape/art-external-platforms-20261020.md).

## 8. Shared gaps that buying another dashboard will not resolve

1. General session-operated investigation of an unfamiliar owned app: main's typed practice executor is intentionally narrow; ARTEX is a candidate investigator, not an admitted replacement.
2. More effect checkers: currently one explicit work-order read predicate, plus structural metadata review. Each additional effect needs a clear business rule, authentic observations, legitimate controls and adversarial scorer checks.
3. Provenance-preserving imports: scanner messages, exact rule/template/tool/build, identities, stopped/error/truncated states and raw artifacts must survive normalization. An external alert must enter as a lead.
4. A complete changed-build repair cycle with actual repair evidence and related/legitimate tests. Admission machinery exists; matching records alone cannot invent a repair.
5. Measured discovery value: correct unique findings, missed known cases, false claims, reproduction, human effort, failures, cost and setup/maintenance against a matched baseline. None of the three platforms has been comparatively validated here.
6. Independent evidence/review and blind custody: sessions on the same unrestricted user are not an enforced boundary. A human/OS-controlled setup is required for stronger claims.
7. Client operations: evidence access/encryption/retention, method/report review, real scope, responsible delivery and actual buyer evidence. Existing tools do not establish these automatically.

## 9. Proposed build path and acceptance gates

This is a bounded plan, not authorization to contact targets, deploy or resume historical experiments. It preserves the current Node prototype while the runtime choice is tested. No whole-platform migration is justified by the available evidence.

| Order | Concrete work | Reuse | Accept only when |
| --- | --- | --- | --- |
| 1 | Freeze this capability map and preserve a recoverable snapshot of main's substantial local work, the sibling branch and Chris's untracked bridge through the existing repository/private-backup workflow. | This manifest, Git states, existing source provenance. | Snapshot includes modified/untracked files without exposing raw credentials/run data; restore/readback verifies selected hashes. No push or publication has been authorized. |
| 2 | Specify one neutral result-import contract and a canonical reader projection. Start with an offline saved-artifact adapter for one selected tool, chosen after source comparison. | Assessment identity bindings, journal/casebook, structural review, canonical reader. | Exact source artifact/run/version/identity and completeness survive; ambiguous identity, stopped scan, simulation, missing bodies and duplicates cannot become confirmed findings. No tool execution required for this increment. |
| 3 | Run a newly designed, separately reviewed evaluation on an ordinary owned application with known secure behavior and controlled variants. Compare existing session workflow, ARTEX+bridge, and only relevant CE scanners at matched access/budget. | Practice/effect-checker contracts, measurement records, original external receipts. | Frozen task/scorer/tool versions; scorer negative/mutation controls work; no-answer custody claims without enforced separation; every failed/unscored run included. Prior stopped labs are excluded. |
| 4 | Choose the investigator and collection pieces on observed results. Implement only the largest demonstrated bottleneck, e.g. selective same-state capture reuse or a new narrowly defined effect checker. | Sibling API branch where useful; selected ARTEX or CE components if they earn their place. | Measured benefit on held-out cases, no regression of identity/provenance/stop behavior, known legitimate workflows still work. Reject the change if effort rises without useful confirmed evidence. |
| 5 | Complete one actual repair and retest handoff, then prepare an explicitly authorized staging pilot and expert method/report review. | Existing retest admission, owner/review records and approved reader. | Changed build, original + neighboring + legitimate controls, actual reviewer verification, uncertainty retained, total human hours recorded. Pilot scope and production changes remain separate approvals. |

The first decision to make after this inventory is which **single tool output** is most useful to import offline. ARTEX needs strong action/identity/effect evidence before its prose can be trusted; CE is a plausible dependency/configuration evidence source; NBRET already supplies detailed browser/workflow evidence. One shared contract can keep these options replaceable. It does not require connecting every platform at once.

## 10. Decision evidence and contrary evidence

Question: what should we build next to deliver a defensible scoped web/API assessment and repair-verification service, using the assets already available?

Research used: `standards.claim-record-fields` (framework.md:34–49; synthesis), `ai-evaluation.audit-evaluator-before-tester` (framework.md:79–91; draft synthesis), `safety.capability-gate-outside-model` (executable-claims.md:25; component-lab), `service-delivery.instance-vs-class-repair` (executable-claims.md and framework.md; component-lab), `commercial.evaluation-and-buyer-evidence-protocol` (synthesis.md:72–74; synthesis), `evidence-handling.e01-offline-identity-ambiguity` (lab-results.md; component-lab, with later still-present correction). The studies and relevant corrections were read through the existing build/inventory reviews plus selected cited passages in this session.

Contrary limits: same-account hashes cannot establish independent origin; source presence cannot establish operational safety or effectiveness; synthetic scorer controls are not discovery; a comparison needs an admitted scorer; the existing code is a prototype to assess, not a predetermined architecture. ARTEX may eventually replace parts of the investigation workflow; CE may make some custom scanners unnecessary. Current evidence does not settle either choice, human effort/pricing, demand, or broad client fidelity.

Validation/disproof: the neutral import should retain exact source context and reject misleading inputs. A held-out, matched comparison should show useful confirmed results with reasonable total human effort. Identity confusion, promotion of simulations, unsupported claims, failed legitimate controls, material misses or no practical efficiency benefit disprove the respective implementation/performance hypothesis. Preserve those outcomes rather than hiding them behind test totals or larger feature lists.
