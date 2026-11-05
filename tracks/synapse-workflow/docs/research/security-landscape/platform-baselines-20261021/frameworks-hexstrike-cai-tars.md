# HexStrike AI, CAI and TARS: components around an ARTEX foundation

Ginger · source review on 2026-10-21 · task `67ba3e0e-5ff8-4782-a1eb-d3453fc692a4`.

## Decision

Keep ARTEX as the selected foundation. These projects supply useful comparison material, not evidence for replacing it or enabling a large new tool bundle. The most useful candidates are a small, measured tool interface inspired by HexStrike, CAI's separation of investigation, retest and report roles, and ByteDance Agent TARS's explicit DOM/visual browser strategies. The cybersecurity project also named TARS offers a readable example of scan → research → report staging, but its source does not establish a stronger autonomous investigation or containment system.

This is source-trace evidence. No project was installed, imported, built, tested or launched. No model, provider, target, scanner, browser, account or inbox was used. Repository retrieval and official document retrieval were data-only. No blocked operation was retried. Assertions about missing capabilities below mean **not established in the reviewed paths**, not a claim to have searched every dependency or proved universal absence.

## Identity and provenance

| Name | Exact project and maintainer | Immutable pin and commit date | License observed |
| --- | --- | --- | --- |
| HexStrike AI | `0x4m4/hexstrike-ai`; copyright Muhammad Osama, handle 0x4m4. Other similarly named repositories are not this source. | `d689933ff579d839c676c82b231f8e98326c5f04`, 2026-08-03T18:33:01+04:00 | MIT in repository LICENSE. External tools and services retain their own terms. [H-license] |
| Cybersecurity AI, CAI | `aliasrobotics/cai`, Alias Robotics S.L. | `6dc79257777f5f1c9500b4d2319935d34a47412e`, 2026-08-22T15:02:17+02:00 | Mixed MIT-derived portions and research-only Alias additions. The license explicitly excludes commercial/professional/production use of those additions without a commercial license. Do not describe this entire tree as MIT. [C-license] |
| Threat Assessment & Response System, TARS | `osgil-defense/TARS`, Osgil Defense | `6cc646bb1218e615abe784f27492aabcfc5ff64b`, 2025-01-17T14:41:00-08:00 | MIT, copyright 2024 Osgil Defense. [O-license] |
| Agent TARS and UI-TARS Desktop | `bytedance/UI-TARS-desktop`, ByteDance | `3ac2cb8d946d78d5ff92ad17b318eaafa18c178c`, 2026-10-09T09:29:51+08:00 | Apache-2.0 repository license; reviewed source headers agree. Model weights, external packages and remote services are separate dependencies. [B-license] |

All origins were HTTPS GitHub origins ending in `.git` for the exact owner/project above. Local data-only shallow clones are `.tools/platform-baselines-20261021/ginger-hexstrike`, `ginger-cai`, `ginger-tars` and `ginger-ui-tars-desktop`. The HexStrike tree has 14 tracked files, CAI 1,540 and Osgil TARS 31. ByteDance was additionally cloned with `--filter=blob:none`; these are source snapshots, not installed runtimes. Pins identify what was reviewed, not what a separately installed package would contain.

CAI's pinned README calls the tree an archival research artifact, says no further fixes or support will be provided, and distinguishes public PyPI 0.5.10 from this final professional v1.1.5 tree. Its recommendation of a successor named CSI is a vendor statement, not a reviewed successor or an adoption recommendation. [C-archive] [C-versions] GitHub's official Osgil repository page displayed archival on 2026-02-01 when retrieved on 2026-10-21; its README's future plans must not be promoted to implemented features. [O-page] [O-readme]

### The TARS collision matters

Osgil TARS is a cybersecurity CrewAI application. ByteDance's separate repository explicitly ships **Agent TARS**, a general multimodal agent stack with CLI/Web UI, and **UI-TARS Desktop**, a GUI agent application with local/remote operators. The latter links to the separate `bytedance/UI-TARS` model project. These are not aliases for Osgil TARS. [B-identity] A screenshot or the bare word “TARS” cannot resolve which was intended. This report examines Osgil's cybersecurity pipeline and a bounded set of ByteDance's browser/runtime seams so that neither potentially useful interpretation is silently lost. The UI-TARS model's training implementation, weights, datasets and leaderboard results were not audited here.

## What each actually contributes

| Question | HexStrike AI | CAI | Osgil TARS | ByteDance Agent TARS |
| --- | --- | --- | --- | --- |
| Input | MCP tool arguments/HTTP parameters, targets, commands and optional credentials | Agent prompt/history plus selected tools and execution environment | Website/network string plus free-text task; model routes it | Natural-language session, model/configuration and local or AIO environment |
| Reasoning owner | External MCP-compatible model/agent; some local selection/workflow logic is deterministic | Real repeated model → tools/handoff → model SDK loop | CrewAI agent reasoning inside a fixed sequential crew | General multimodal loop with tool calls and DOM/vision browser choices |
| Evidence produced | stdout/stderr/return code, timing, caches, HTTP history and heuristic findings | Conversation, tool events, memory summaries; retester/report agents | Text log, task outputs and JSON completion wrapper | Event stream, browser/tool outcomes and optional LLM traces |
| Independent effect oracle | Not established | Not established by retester role or report | Not established by research/report roles | Not established by navigation success or final assistant message |
| URL-only registration and dedicated inbox | Not established | Not established; its mail agent checks DNS email-auth configuration | Not established | General form/browser tools are relevant primitives; verified account/mail lifecycle not established |
| ARTEX value to investigate | Narrow tool contracts and execution metadata | Bounded role/tool separation, explicit claim/retest method and evaluation taxonomy | Stage clarity and source-linked remediation research | Browser capability selection, multimodal observations and lifecycle seams |

The source explanations and limitations supporting this table follow. None of these source observations is a measured comparison against ARTEX.

## HexStrike: a tool server, not demonstrated autonomous discovery quality

### Execution and autonomy

The real integration path is an external MCP client → FastMCP tool → `HexStrikeClient.safe_post` → Flask route → command execution or a specialized Python method. `HexStrikeClient` owns a requests session and issues HTTP requests to a configured server; its `execute_command` sends a generic command to `/api/command`. The MCP server is named `hexstrike-ai-mcp`. [H-client] The generic Flask route checks only that a command is present before passing it to `execute_command`. That helper checks a command-keyed cache and otherwise instantiates `EnhancedCommandExecutor`. The executor uses a shell. [H-command] [H-execute]

This establishes a powerful tool surface. It does not establish 12 independently reasoning model agents or a complete investigator from source presence alone. The advertised agent/tool counts in the README are upstream descriptions. In the reviewed `IntelligentDecisionEngine`, initial effectiveness numbers are literal tables; “quick” sorts those numbers and chooses three, “comprehensive” chooses entries above a threshold, and technology branches add tools. Confidence and risk labels are computed from available profile features. These are heuristics, not measured probabilities or a learning result. [H-select] A symbol search found `learning_database` initialized as an empty dictionary, but did not establish a persisted, outcome-trained learning loop. Do not export such ratings into ARTEX as empirically calibrated rankings.

A browser-related dependency or tool integration does not establish end-to-end authenticated UI exploration. The dependency list includes Selenium, webdriver-manager and other specialist packages; separate native tools must also exist on the server. No automatic account creation, email delivery verification, mailbox isolation, role corroboration or reliable session custody was established in the selected tool/HTTP paths. Credentials supplied to a tool are access inputs, not evidence that the authenticated principal is the intended one.

### Scope and stop: concrete admission problems

The HTTP framework has a `scope` field and `_in_scope`. With no scope or a missing hostname/target, that function returns true; exceptions also return true. More decisively, `_apply_match_replace` detects an out-of-scope result, logs it and **returns the original URL, data and headers**. `intercept_request` then sends a request using those returned values. The source therefore establishes that this check does not implement “deny this request.” This is a narrow source trace, not a live bypass demonstration. Requests also use the standard session behavior here without explicit redirect rejection at these call sites. [H-http] [H-scope]

The generic command path does not pass through that HTTP scope field. The main Flask entry binds to all interfaces. The reviewed command route has no local authorization decorator and no global request authorization hook was found by the targeted search; deployment authentication and network protection remain separate, unverified requirements. Do not expose this service merely because its client is called “safe.” [H-command] [H-main]

`EnhancedCommandExecutor` waits with a timeout, terminates its subprocess, waits up to five seconds and then kills it. The force-kill branch shown does not subsequently await termination, and this shell path does not establish descendant process/network quiescence. It then deliberately reports `success=true` on timeout if **either stdout or stderr** exists. This is collection/command status, not vulnerability confirmation. [H-timeout] A different async execution manager has a process registry and terminate/wait/kill handling, but that does not repair every execution path or prove shared stop semantics. Its kill branch returns true without a further wait. [H-async]

The recovery path can retry, rebuild parameters or suggest another tool. Some branches return a suggested alternative rather than actually switching it, which is an important limit on an “autonomous recovery” claim. [H-recovery] ARTEX integration must preserve our stronger rule: a security denial is terminal for that action; it is not a transient error to retry through another tool or identity.

### Evidence and reporting

The HTTP history stores request headers/data and a response body prefix of 10,000 characters while retaining full response length. That is useful collection metadata but also potential credential exposure and incomplete evidence. A prefix is not the full body; absence from it is not absence from the response. No digest, redaction/completeness contract or independent business-effect check was established in this path. [H-http]

The command cache is keyed by command in the reviewed helper. Reusing a result without binding it to environment/build, principal, time and state could produce stale evidence. An ARTEX adapter would need to preserve whether a result came from cache, timed out or was incomplete; it must never convert the upstream `success` field into a canonical confirmed finding. No reproducible discovery-quality benchmark with denominator, task custody, independent scorer and equal-budget comparator was established in this review. The README's tool count is not such a benchmark.

**Borrow:** small typed tool wrappers, return code/timing/output distinctions, and targeted capability discovery. **Avoid:** blanket import of the entire tool surface, literal effectiveness scores as measured quality, automatic fallback after security stops, and upstream success as proof. Admission would require executor-level authorization, independent egress/isolation, a shared budget and verified stopping across the selected tool's descendants and backend.

## CAI: genuine agent runtime, distinct evidence and licensing limits

### Loop and tool choice

CAI's SDK `Runner.run` repeatedly invokes a model, handles a final output, changes agents on handoff, or executes tools and loops again. This is actual model/tool orchestration in source, not just a diagram. It supports input/history and run context; the reviewed pattern class represents parallel, swarm, hierarchical, sequential and conditional configurations. The pattern names themselves do not prove that more agents improve quality. [C-run] [C-pattern]

The web pentester assembles generic shell, code execution, an HTTP request framework and additional web-intelligence tools, optionally adding search when configured. Its source labels the latter helpers as SSRF-guarded; their complete fetch policy was not audited here, so that comment is not a proven universal egress boundary. [C-web] Generic shell dispatch can select Docker, CTF, SSH or local execution. Container selection is configuration-dependent; a generic shell tool is not automatically isolated. [C-dispatch]

The runtime's `DEFAULT_MAX_TURNS` is infinity when the environment does not supply a usable value. Loop hooks are called inside a catch that ignores their exceptions, so an external enforcement invariant must not depend on an arbitrary hook throwing. A finite turn limit is useful but does not by itself bound requests, descendants, token spend or effects. [C-run-bounds] Cost and model dependencies must be recorded per admitted run; provider/model availability, local serving resources and remote transfer of target data were not tested. The inspected project declares Python >=3.10 and many provider/tool dependencies; source availability does not make those dependencies available or free. [C-deps]

### Guardrails and termination

The selected security guardrails and generic shell checks use `CAI_GUARDRAILS` defaulting to false. `get_security_guardrails` returns empty lists when disabled. Enabling them adds input/output checks, including string/pattern-based checks; it is not an OS or network sandbox. [C-guardrails] The SDK runs first-turn input guards concurrently with the first turn, and final output guards only when final output is produced. These timing/placement semantics must not be described as a pre-execution capability gate for every tool call. [C-first-turn] The narrower claim is that a triggered guardrail raises a typed exception in its runner path; all external effects stopping is not established by that exception.

The generic shell's timeout can be supplied by the model, then falls back to environment/default values. The selected implementation dispatches to interactive sessions or an async command executor. [C-shell] ShellSession termination tries process-group TERM, then KILL, checks whether its process still runs and can return a warning; `terminate_session` nevertheless removes that session from the active registry afterwards. That is valuable contrary evidence against equating registry removal with verified quiescence. Other local async paths kill/wait their own subprocesses on timeout, but a universal shared stop over Docker, SSH and all child operations was not established. [C-session-stop] [C-local-stop]

### Hypotheses, memory and verification

CAI's triage prompt articulates claim → minimal reproduction → observation → verdict and a TRACE-style hypothesis/success/abandon discipline. This is a useful method to translate into an ARTEX skill. Its instruction to always attempt practical exploitation cannot be imported unconditionally: allowed actions, data sensitivity and safe effect checks remain engagement-specific. The retester has shell/code tools; its role and prompt can generate proposed verification, but do not independently adjudicate their own truth. [C-triage] [C-retester]

The reporter is more narrowly designed: `tools=[]`, with an explicit comment that it synthesizes the conversation into HTML to avoid following pentest instructions from history. This is a concrete separation worth borrowing. It still transforms supplied content; it cannot establish missing evidence. A report adapter must preserve observation, inference, uncertainty, errors and untested surfaces rather than trusting eloquence or an agent's “confirmed” conclusion. [C-reporter]

Memory is real persistence, with an important trust boundary. `/memory save` asks a model to summarize history, writes a Markdown memory with generated timestamp/agent/model metadata and registers it. `/memory apply` reads the **entire** file, uses it as the summary and appends it to compacted summaries. This is context reuse, not demonstrated model-weight learning, independent validation or reliable protection from poisoned/stale facts. [C-memory-save] [C-memory-apply] ARTEX research retrieval should instead retain pin, source passage, correction/hazard links, engagement identity and evidence strength. Summaries may guide hypotheses; they must not become permission or proof.

CAI's “Mail Agent” checks SPF, DMARC and DKIM DNS configuration. It is not a dedicated registration inbox or evidence of email verification account lifecycle. [C-mail] A URL prompt plus shell capability also does not establish autonomous signup, recovery, CAPTCHA/terms handling or safe credential custody on unfamiliar sites. Those remain explicit missing admission contracts for our intended workflow.

### Evaluation and operational status

CAIBench's documented taxonomy separates Jeopardy CTFs, attack/defense CTFs, cyber ranges, knowledge and privacy. The official paper abstract explicitly distinguishes conceptual security knowledge from multistep operational performance and says model/scaffold combinations affect results. This supports separate outcome metrics, not a universal winner. Only the abstract and repository evaluation entry were reviewed for that paper; its full experimental methodology was not independently replicated. [C-bench-doc] [C-paper]

The inspected `benchmarks/eval.py` entry is a model evaluator for multiple-choice/QA/PII datasets, not a complete unfamiliar-website URL-to-report assessment. Its pricing helper retrieves a changing external pricing table and falls back to zero on fetch failure. A displayed zero may therefore mean unavailable price data, not free inference. [C-eval] Repository documentation's “best-in-class” or competition claims are upstream claims with their own task/access/model/budget population. They do not measure ARTEX, registration/inbox reliability, negative-case precision or business-impact report quality on our controls.

**Borrow:** narrow investigation/retest/report tool separation, explicit hypothesis and abandonment criteria, persistent context with stronger provenance, and the distinction between knowledge and operational evaluation. **Avoid:** wholesale adoption of an archived mixed-license tree, unbounded default loops, guardrail flags as containment, and model-generated memory/report as independent truth. Method reuse can be described without copying restricted source into a commercial implementation; any source embedding would need a file-specific license determination.

## Osgil TARS: sequential investigation and report composition

The Streamlit frontend accepts a target website/network address and a free-text task. It embeds both in a prompt, rewrites localhost references to `host.docker.internal`, starts a background CLI through a shell and polls a process listing for a matching job. This is significant topology behavior: host/container loopback is not interchangeable. No scope authority should be inferred from that rewrite or the UI's “valid website” check, which only checks non-empty input in the submission path. [O-ui]

`call_crew` asks an LLM router to classify the question and recognizes Web Application or Network to select a crew. Those are the two actual selected crews even though config lists more categories. Both have four sequential tasks: pentest, internet research, report writing and Markdown conversion. Both set `memory=True`, `cache=True`, `full_output=True`. Individual agents have `allow_delegation=False`. This is a fixed staged workflow with model tool choices inside stages, not evidence of an adaptive multi-agent swarm learning its own strategy. [O-crews] [O-agents] Config names a dated GPT-4 Turbo model; the router constructs a configured model object but the composed chain uses `ChatOpenAI()` without that selected model argument, so declared and actual router-model selection must not be assumed identical. [O-config] [O-router]

Network tools wrap scanner commands; the web agent receives RustScan and selected ZAP wrappers. The “researcher” receives crawling, scraping and search tools. The writer and Markdown converter have restricted/no tools, which is a useful conceptual split. The task prompts ask the researcher to fact-check scan results and cite sources, but this is textual research, not an independent test of an authorization boundary or business effect. The report task even prescribes paragraph count; prose quantity is not evidence completeness. [O-agents] [O-tasks]

Scanner wrappers concatenate target/options into shell commands and generally block on `communicate` without a supervisor deadline. The reviewed ZAP API and baseline wrappers have return-code checks commented out and return stdout. A report can consequently receive output without an explicit failure verdict from those wrappers. Do not infer that every source wrapper is reachable: for example, the full-scan function exists but is not in the inspected web agent's tool list. [O-nettacker] [O-zap] [O-agents]

The scraper uses same-netloc link discovery and a Selenium page fetch, not a general agent action/credential/mail lifecycle. It strips HTML and trims content to a token bound. Same-domain crawling and token trimming are not containment or complete evidence capture. Its search tool uses Brave, while agent assembly also exposes Serper/WebsiteSearch; configured keys and third-party data transfer are real dependencies. [O-scraper] [O-search] [O-agents]

CLI output wraps success as `completed=True` after the crew function returns and writes exceptions as `completed=False`; neither outcome adjudicates vulnerabilities. Logs capture stdout to a local text file. The selected frontend/CLI have no durable cancellation/quiescence handshake. Process disappearance, JSON completion and a finished Markdown report are different states. [O-cli] [O-support] Docker packaging installs Kali tooling, Chrome and additional projects; it is not a proven egress or credential boundary. A moving base image and unpinned external source fetch also prevent the top-level commit alone from specifying a reproducible built runtime. [O-docker]

No independently scored outcome benchmark or account/inbox workflow was established in the reviewed source. The README's reactive defense and patching roadmap is future intent. **Borrow:** explicit stage outputs and separation of remediation research from findings. **Avoid:** adopting its old dependency/runtime foundation, treating agent biographies or `memory=True` as a measured intelligence improvement, or presenting scanner stdout and cited web prose as verified impact.

## ByteDance Agent TARS: browser methods worth a bounded comparison

This additional review resolves the ambiguous name and examines practical browser components; it is not a full audit of this monorepo or a recommendation to install it. Agent TARS extends `MCPAgent`, chooses an AIO environment only when configured, otherwise constructs a local environment, and registers that environment's tools/MCP registry. It exposes pre/post-tool and per-loop hooks, browser state and a Web UI configuration. Its own loop-termination hook returns `finished:true`; this is a general task agent, not a security-specific verification gate. [B-agent]

The local environment assembles browser, filesystem, commands and optional search dependencies. A workspace helps organize files; local execution is not automatically sandboxed. The source has explicit browser strategy construction for DOM, visual grounding and hybrid modes. Hybrid registers GUI-agent and complementary navigation/content/visual tools plus MCP browser operations. That is a concrete way to make browser modality an explicit capability choice rather than assuming that a text-only model can interpret screenshots. [B-local] [B-strategy] [B-hybrid]

There is a contrary constraint: the reviewed validator allows GUI-based strategies only for its listed `volcengine` provider, otherwise it falls back to DOM. Its log names a particular Doubao vision model. Do not generalize that local restriction to every version/model or claim arbitrary providers support the visual path. Provider costs, API credentials, actual model availability and local/remote browser topology must be recorded. The core package declares version 0.3.1 and workspace dependencies plus fixed external infrastructure versions; these were not installed or dependency-audited. [B-validator] [B-package]

The Tarko loop checks an abort signal between iterations, permits a termination hook and emits a distinct maximum-iteration outcome. Its agent defaults to 1,000 iterations in the reviewed constructor. The execution controller's `abort()` signals and changes status synchronously; cleanup handlers run later in `endExecution`. Neither a boolean abort acknowledgement nor a UI stop label proves all current external actions have ended. [B-loop] [B-default] [B-controller] The selected tool processor invokes `await tool.function(args)` without a universal abort signal argument. This does not prove every tool ignores cancellation, but it means cancellation propagation must be shown for the actual tool/backend rather than inferred from the loop. [B-tool]

The selected navigation tool accepts a string and calls `page.goto`, then returns “success.” This proves only the source's navigation-call return path. It has no engagement origin/path authority check in that function; redirects, popups, subresources, downloads and remote operators need their own admission review. [B-nav] Resource cleanup awaits settled MCP/browser cleanup promises and catches/logs errors, so “cleanup complete” is not by itself an all-resources-closed assertion. [B-cleanup] UI-TARS Desktop's separate IPC stop path aborts its controller and calls GUI-agent stop; that is a separate product path, not proof of Agent TARS's generic tools stopping. [B-desktop-stop]

Event streams and optional message-history dumps are useful observation artifacts. The latter stores LLM request/response payloads for debugging, not an independently validated learning system; it can contain sensitive input and must inherit engagement retention/redaction policy. [B-history] No reviewed generic-browser path supplies a security hypothesis ledger, independent cross-identity oracle or canonical assessment report. Browser form filling is a building block for permitted account registration, not demonstrated URL-only self-registration with verified dedicated-mail custody. Its natural-language demos and GUI outcomes cannot establish security discovery quality.

**Borrow:** explicit modality/capability selection, browser state observations, tool event correlation and separate lifecycle hooks. **Avoid:** bringing in a second UI/engine, assuming AIO/local environment names establish isolation, ignoring provider-specific fallback, or treating screenshots/navigation/tool success as a security effect. On this PC any eventual computer/browser work must still follow Kotaro's existing computeruse preference; this source review authorizes no alternative runtime.

## How this feeds ARTEX without another platform rebuild

Use the existing [ARTEX research-seam map](../../../synapse/artex-core-research-integration-ginger.md) and [ARTEX-core reassessment](../../../../../../docs/consolidation/artex-core-reassessment-2026-10-21.md). That prior source audit identifies native skills/context, role-visible tools/MCP and artifact surfaces, while also separating local bridge additions from the pinned upstream commit. This report has not changed or revalidated its runtime. These proposals are configuration/admission requirements, not code written here:

1. **Research skill:** retrieve the relevant hypothesis/method, cited passage and attached corrections/hazards. Have the investigator state what observation would support or reject the next hypothesis. CAI's retest discipline is useful method material, not an authority to execute any proposed exploit.
2. **Capability selection:** first inspect the actual ARTEX instance, norma/provider and available tool contracts. If one required observation cannot be collected, choose one narrow tool or browser primitive to evaluate against that gap. HexStrike's broad MCP server is not the default package; ByteDance's browser strategy is a comparison for an identified visual/DOM limitation, not a new dashboard.
3. **Executor boundary:** action authority, account/tenant, URL/path, external egress, resource limits and stop state must be enforced beneath every admitted execution path. Skills, model prompts, containers selected by environment variables and tool labels cannot substitute for this. Security-blocked actions remain stopped without alternate-tool/session retries.
4. **Artifact import:** retain raw output separately from model summaries, binding evidence to run/build/time, principal, object and completeness. Preserve timeout, cache, truncation, redaction and error states. An upstream status or model-authored “confirmed” record remains a claim until a relevant independent effect observation corroborates it.
5. **Report:** keep the canonical Synapse reader and its actual cases/retests. CAI's no-tool reporter is a useful restriction on synthesis, but a report role must not silently repair missing evidence, grant permissions, alter scoring or convert uncertainty to a negative result.

These requirements use existing register entries `agent-runtime.sdk-permissions-are-configuration` (source trace), `safety.capability-gate-outside-model` (component lab only), and `ai-evaluation.audit-evaluator-before-tester` (proposed synthesis). Their cited [SDK boundary study](../../assessment-evidence/sdk-boundaries-continuation.md), [gate limits](../../assessment-evidence/executable-claims.md#additional-linked-claims) and [evaluator protocol](../../assessment-evidence/framework.md#audit-the-evaluator-before-evaluating-the-tester) were opened. Contrary limits matter: the SDK study does not demonstrate a native permission bypass; the component gate does not prove every real tool passes through it; the evaluator protocol is not a validated industry standard. None is evidence that ARTEX already has those controls.

The [autoresearch review](../repository-reviews-20261021/autoresearch-review-ginger.md) and [Cloudflare review](../repository-reviews-20261021/cloudflare-review-thistle.md) remain method inputs through the prior ARTEX seam map, not packages to transplant. In particular, candidate-authored output is not an independent oracle, and tool execution isolation is a separate question from model reasoning. An Awesome-Hacking-style catalog can locate a capability, but presence in a catalog cannot admit a tool or establish its measured benefit.

## Measured acceptance and failure conditions for a later authorized evaluation

No such evaluation was run here. Use ARTEX as the baseline and change one method/component at a time with the same model, access, environment and aggregate time/request/token budget. Keep guided learning, familiar regression and held-out tasks distinct; do not give the investigator benchmark source, scorer answers or hidden labels.

| Proposed control | Evidence needed | Fail admission if |
| --- | --- | --- |
| One useful next action | A hypothesis, disconfirming condition, allowed observation and reached tool/effect trace | Extra tool volume replaces justified choices; tool descriptions are treated as empirical rankings |
| URL-only/account/mail mode | Declared URL-only vs source-assisted inputs; actual permitted account creation; own inbox; verification delivery and principal corroboration; credential export exclusion | An existing session/source answer is silently supplied, mailbox ownership is assumed, or account identity remains merely a model label |
| Scope/isolation | Negative controls for origin/path/tenant and all admitted network/browser/shell paths; independent egress observations | Any alternate path bypasses policy, redirects escape, or a security stop triggers fallback/retry |
| Stop | Stop during active work; await backend/descendant termination and observe no subsequent requests/effects over a declared interval | UI/registry/abort acknowledgement is counted as quiescence without reached work and external observation |
| Evidence | Raw receipt plus completeness, cache/truncation/error flags and independent identity-bound oracle | Timed-out stderr, a body prefix, cited prose or a model “confirmed” is scored as demonstrated impact |
| Incremental value | Paired baseline comparison, all selected/reached/unscored cases and spend; negative-case precision and valid workflow preservation | Only successful demos are retained, retries hide failure, or unknown pricing is counted as zero cost |

A misleading benchmark could reward a copied success string, a pre-existing target state, a correctly formatted report, a known CTF flag, or familiar task memory. It could also give an added component more requests, stronger source access or a better model and attribute the improvement to “swarm intelligence.” Browser navigation scores, security knowledge accuracy, scan finding counts and business-effect verification are different measurements. Count infrastructure failures, unsafe-action attempts, unsupported claims, missed controls and unscored runs separately. No absence of findings should be called clean when collection failed or a budget stopped the run.

## Read coverage and unresolved questions

This was a targeted control/evidence review, not a whole-monorepo audit. Search results identified sources; substantive claims above cite opened source paths, not search snippets. Exact line spans are linked below and their limits are stated in the text.

- **HexStrike:** README/dependencies/MCP configuration/license; client147–285 and generic-command MCP3969–4005; server selected decision572–625/930–1015, async5236–5375, command executor6810–6990, cache/execution/recovery8636–8830, command route9137–9158, HTTP13288–13475 and entry17256–17289. Tool decorators/symbols were searched across both large files; the complete 17k-line server and full payload/tool catalog were not read. No external tool implementation was audited.
- **CAI:** README archive/version boundaries, complete license texts and pyproject; web/retester/reporter/mail agent definitions; pattern1–100; SDK run50–65/136–178/226–275/310–340/1050–1095; security-guardrail configuration paths; generic shell configuration/dispatch475–535/697–785; common re-export shim; executor264–315/418–440/690–785/1289–1380; memory save618–655/apply780–832; triage prompt1–90, MCP/guardrail documentation; benchmark overview, selected CTF documentation and eval1–150. Most of its 1,540 files, provider/model wrappers, full TUI/REPL, fetch guards and benchmark task/scorer implementations remain unread. No broad CAI efficacy or security claim follows.
- **Osgil TARS:** small README, license/dependencies/Dockerfile; crew, agent, config, router, task/dynamic task, CLI/support/helper/search files; frontend1–100/245–290 and selected completion/UI search; Nettacker wrapper, selected RustScan and ZAP wrappers; scraper function/fetch/crawl/browser/trim paths. Vendored tool documentation, image assets and upstream CrewAI/scanner dependencies were not deep-read. `memory=True` does not confer reading credit for the CrewAI memory implementation.
- **ByteDance:** README identity/product boundary, license opening/header and core package manifest; AgentTARS32–240, local environment1–145, browser validator/strategy/hybrid files, navigation1–53; Tarko execution-controller, loop50–139/188–211 and default iteration constructor; tool manager1–145 and actual tool processor1–145; resource cleaner, history-dumper1–75 and Desktop IPC agent1–120. The underlying browser/command/filesystem packages, AIO backend, model adapters, model training and benchmark suites were not fully audited. This is a bounded component review, not a comparison of the two complete TARS products.

Open questions before any adoption: Which TARS did Kotaro originally mean? Which actual ARTEX tool/browser gap remains after inspecting the runnable instance? Can the selected backend enforce exact scope and stop with independent observations? Can any added method improve corroborated discoveries and report usefulness under equal budgets? What model/provider, execution host, dependency versions and commercial terms would actually apply? A full CAI source embed or remote operator would add unresolved license/data/execution dependencies; this report does not authorize either.

## Pinned source references

All GitHub blob links below contain the complete reviewed commit. Line anchors identify the supporting source span. Archive-state pages and the paper abstract are dated external documentation, not immutable runtime evidence.

[H-license]: https://github.com/0x4m4/hexstrike-ai/blob/d689933ff579d839c676c82b231f8e98326c5f04/LICENSE#L1-L21
[H-client]: https://github.com/0x4m4/hexstrike-ai/blob/d689933ff579d839c676c82b231f8e98326c5f04/hexstrike_mcp.py#L147-L285
[H-command]: https://github.com/0x4m4/hexstrike-ai/blob/d689933ff579d839c676c82b231f8e98326c5f04/hexstrike_server.py#L9137-L9158
[H-execute]: https://github.com/0x4m4/hexstrike-ai/blob/d689933ff579d839c676c82b231f8e98326c5f04/hexstrike_server.py#L8636-L8662
[H-select]: https://github.com/0x4m4/hexstrike-ai/blob/d689933ff579d839c676c82b231f8e98326c5f04/hexstrike_server.py#L930-L1001
[H-http]: https://github.com/0x4m4/hexstrike-ai/blob/d689933ff579d839c676c82b231f8e98326c5f04/hexstrike_server.py#L13288-L13360
[H-scope]: https://github.com/0x4m4/hexstrike-ai/blob/d689933ff579d839c676c82b231f8e98326c5f04/hexstrike_server.py#L13370-L13425
[H-main]: https://github.com/0x4m4/hexstrike-ai/blob/d689933ff579d839c676c82b231f8e98326c5f04/hexstrike_server.py#L17256-L17289
[H-timeout]: https://github.com/0x4m4/hexstrike-ai/blob/d689933ff579d839c676c82b231f8e98326c5f04/hexstrike_server.py#L6868-L6946
[H-async]: https://github.com/0x4m4/hexstrike-ai/blob/d689933ff579d839c676c82b231f8e98326c5f04/hexstrike_server.py#L5236-L5368
[H-recovery]: https://github.com/0x4m4/hexstrike-ai/blob/d689933ff579d839c676c82b231f8e98326c5f04/hexstrike_server.py#L8725-L8830
[C-license]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/LICENSE#L1-L23
[C-archive]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/README.md#L23-L45
[C-versions]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/README.md#L65-L118
[C-run]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/sdk/agents/run.py#L136-L172
[C-pattern]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/agents/patterns/pattern.py#L15-L100
[C-web]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/agents/web_pentester.py#L1-L67
[C-dispatch]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/tools/executor.py#L1289-L1380
[C-run-bounds]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/sdk/agents/run.py#L50-L243
[C-deps]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/pyproject.toml#L1-L150
[C-guardrails]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/agents/guardrails.py#L517-L535
[C-first-turn]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/sdk/agents/run.py#L226-L269
[C-shell]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/tools/reconnaissance/generic_linux_command.py#L475-L535
[C-session-stop]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/tools/executor.py#L264-L430
[C-local-stop]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/tools/executor.py#L690-L785
[C-triage]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/prompts/system_triage_agent.md#L1-L90
[C-retester]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/agents/retester.py#L1-L44
[C-reporter]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/agents/reporter.py#L1-L30
[C-memory-save]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/repl/commands/_memory_monolith.py#L618-L655
[C-memory-apply]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/repl/commands/_memory_monolith.py#L780-L832
[C-mail]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/src/cai/agents/mail.py#L1-L117
[C-bench-doc]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/docs/benchmarking/overview.md#L1-L157
[C-paper]: https://arxiv.org/abs/2510.24317v1
[C-eval]: https://github.com/aliasrobotics/cai/blob/6dc79257777f5f1c9500b4d2319935d34a47412e/benchmarks/eval.py#L1-L150
[O-license]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/LICENSE#L1-L21
[O-page]: https://github.com/osgil-defense/TARS
[O-readme]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/README.md#L7-L62
[O-ui]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/frontend/main.py#L34-L289
[O-crews]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/tars/crews.py#L16-L102
[O-agents]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/tars/agents.py#L1-L97
[O-config]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/tars/config.py#L1-L37
[O-router]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/tars/routers.py#L30-L82
[O-tasks]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/tars/tasks.py#L1-L56
[O-nettacker]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/tars/tools/nettacker.py#L64-L100
[O-zap]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/tars/tools/zaproxy.py#L127-L249
[O-scraper]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/tars/tools/scrapper.py#L36-L89
[O-search]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/tars/tools/search.py#L23-L48
[O-cli]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/tars/cli.py#L18-L56
[O-support]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/tars/support.py#L1-L46
[O-docker]: https://github.com/osgil-defense/TARS/blob/6cc646bb1218e615abe784f27492aabcfc5ff64b/Dockerfile#L1-L50
[B-license]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/LICENSE#L1-L201
[B-identity]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/README.md#L7-L48
[B-agent]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/multimodal/agent-tars/core/src/agent-tars.ts#L32-L228
[B-local]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/multimodal/agent-tars/core/src/environments/local/index.ts#L1-L145
[B-strategy]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/multimodal/agent-tars/core/src/environments/local/browser/browser-control-strategies/strategy-factory.ts#L1-L38
[B-hybrid]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/multimodal/agent-tars/core/src/environments/local/browser/browser-control-strategies/browser-hybrid-strategy.ts#L1-L60
[B-validator]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/multimodal/agent-tars/core/src/environments/local/browser/browser-control-validator.ts#L1-L57
[B-package]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/multimodal/agent-tars/core/package.json#L1-L48
[B-loop]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/multimodal/tarko/agent/src/agent/runner/loop-executor.ts#L50-L211
[B-default]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/multimodal/tarko/agent/src/agent/agent.ts#L80-L100
[B-controller]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/multimodal/tarko/agent/src/agent/execution-controller.ts#L40-L112
[B-tool]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/multimodal/tarko/agent/src/agent/runner/tool-processor.ts#L91-L145
[B-nav]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/multimodal/agent-tars/core/src/environments/local/browser/tools/navigation.ts#L18-L53
[B-cleanup]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/multimodal/agent-tars/core/src/utils/resource-cleaner.ts#L25-L104
[B-desktop-stop]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/apps/ui-tars/src/main/ipcRoutes/agent.ts#L80-L98
[B-history]: https://github.com/bytedance/UI-TARS-desktop/blob/3ac2cb8d946d78d5ff92ad17b318eaafa18c178c/multimodal/agent-tars/core/src/shared/message-history-dumper.ts#L1-L75

## Byte provenance and static checks

SHA-256 values below distinguish local checkout bytes from pinned git-blob bytes. Windows checkout line-ending conversion means these may differ; every cited file matched its pinned blob after CRLF-to-LF normalization. This is content provenance, not runtime or dependency validation. No upstream code was executed.

| Repository / file | Checkout SHA-256 | Git blob SHA-256 |
| --- | --- | --- |
| 0x4m4/hexstrike-ai/LICENSE | 71e6bffda6cfdcd339fb326224ddca503385bbe6df8b41f854f76125f9032d63 | 53c8aba3da4c01bea9f848e7ca19b9efa48ada268b1b688114a465989831f2b0 |
| 0x4m4/hexstrike-ai/hexstrike_mcp.py | 214bd81987766133b88fad0f4c8f87152100937c5169386eae0b0335efcb8b4a | 6274ad945e282ecd94c4ef58ba33f26b5ea79d1aec750af3594cdb118b31db2c |
| 0x4m4/hexstrike-ai/hexstrike_server.py | 37cf021de67d094e5a7d3eba9c980ae39885d2a41ecd286d130dd0d45247e2ab | 590a31b5e2115331d8ef56abbd73880ebd98a1c66a64e8c8bc99a78c5907a675 |
| aliasrobotics/cai/LICENSE | 67a88ab9d38e6257006f22ef4194a17f99544592235d8a738041792e98cee98e | 446b387b531149e29e46f45220ae18062c5ad31e4fe355441803e25718af99c9 |
| aliasrobotics/cai/README.md | 4bbf7945d6459ec9d7951a042805b0b1f838c9abfe8ad4427e0017b1597e5fc5 | 9b8abf6d98f5d0323f6db1e30d1b2ccb75da144d6b9cd4d15beb0f38aa81d554 |
| aliasrobotics/cai/src/cai/sdk/agents/run.py | 3abd7af6f04269576c0b2488bca6aa919b8ed16a6cec9bb5d0828fcb941ffb3e | 1671b575c329b25e74313a65d66e8ae3bbbf797bdf9494960ec23d2daaffad3a |
| aliasrobotics/cai/src/cai/agents/patterns/pattern.py | 9a1be0c4a1201db343408c4d98a52ad7677831c8e4f4b083e89478366488c32d | ebb95acd4e01347c8dbe39e893fdf63151b35e089fab0c0308ac2cf988de85b7 |
| aliasrobotics/cai/src/cai/agents/web_pentester.py | 507ec6d4b62460d2ed483b4d0cf689939cfc1555509769105eadcbbdf057d781 | 1170b19cfa7c8838b9f28171f487325add109d7a92a990c7a9c04bbcc91e796b |
| aliasrobotics/cai/src/cai/tools/executor.py | 7803c73bd81cd53a026673f4c79312bbb36f6b1443d3b9087471dc0a7f3b1ee9 | 0dc1b37cf8c7c3323943f7f06cbc07d343f8c78ddf92f77ec3959b192ecf0c0b |
| aliasrobotics/cai/pyproject.toml | 0cf73c8bba36fdd39909ca6faf8c6039526b302acf12e9a0d1ff7acf6bd45915 | 8f67f7bbe885bff297ca5a8b5806d39d80db3d6438082a24a9afd187b1ef63be |
| aliasrobotics/cai/src/cai/agents/guardrails.py | 559c824bedf06467d97f8e528cc7c87510ceb29dee223f7b7b15ff52617f603d | 0c9cb46e7e2e1d95d2882e3460c9a2b596920e75eca3d4be269223385026a9a0 |
| aliasrobotics/cai/src/cai/tools/reconnaissance/generic_linux_command.py | ddc847715614eac8a46604d907c483f7c21f1683a042fc2e74e536a33382e316 | 8c435063b3fd5527d9f4c31919459fa1406393d5353c63a4a0e7e6b0ca8fed54 |
| aliasrobotics/cai/src/cai/prompts/system_triage_agent.md | 3040bdee2fccb73510ac86a6c71bce07256fd7369d4da15b9df07dccee4e07b8 | 61983f6e332d5dc1f7fd03db11f4d82f943c5ddbff92e5af6e5d5fc45dd33447 |
| aliasrobotics/cai/src/cai/agents/retester.py | 4c15df96c85719ac50e66b4489ae78c2492d6b82484ce95a759a4ab60c9d4b50 | 64fc5d063c567ddb1bed7154cf64babc3a505fe87170594fa15b69bd6ff78477 |
| aliasrobotics/cai/src/cai/agents/reporter.py | 96c871230c4376ff54f2eb85bb5e5733a58b3dbb66e50d9deab24fa0453baf85 | c9e00843fb3d3d95c19283d97ecdd17fdf074f61f358663fdd6ebd8c80dc162c |
| aliasrobotics/cai/src/cai/repl/commands/_memory_monolith.py | 0dea75a0a8913729949e232157b68bce98c266276518ced5d4f782e6e49d486a | b20f40b77b9a08b25f64b7fba7559952eb53d899099934712e67bc30770aeade |
| aliasrobotics/cai/src/cai/agents/mail.py | 87572b3e1abe5a6afebb1281d5d2ecf965956e264b14c6c094a8d2ee69438938 | 9d5bd7a13bc2b20d546a6027e64a2edb36aa544306a153c0cbf0e897f562cf3c |
| aliasrobotics/cai/docs/benchmarking/overview.md | 7620f0a9f60c952ed6e564c916a675b147deb92d881b414184c787d2d37eb67c | d311684206f220e0fae0dd44bea422b4b75a5084263f14c15a945be13c4de187 |
| aliasrobotics/cai/benchmarks/eval.py | 3e187183b6a48b27d1d66975b682ab3370eb83a25242cef0f902a1af41d080d0 | 17b1d60364574a86c708e7d9a77e4275fcfe99cd50862925244969bd96c130d1 |
| osgil-defense/TARS/LICENSE | cd70185811f2b274494f92f3b5446358d50fcc690ecee658b2f0ddbd2e85392c | 1627e2858b5efc14d466fe5c2db1d3014a6a74c16e78f213fa37bbcff926bf1b |
| osgil-defense/TARS/README.md | f9397494dda8ca461981ba3425d8bf9448522acf6fefe3ba4578e3b5b6abb55b | 2733f7b28b4ac63e909a1c22b15f377de7d1b12b86ab9825eb5fee0d631baa51 |
| osgil-defense/TARS/frontend/main.py | 9cd7c43af586ca310599a91f6876d51752044924afbcdbecb9e6b346d8a35ecf | 7ca9831c8ee6f0fc0d4f86ad18f9e0cf09b4e9aa0477235d6eff0bb44a178365 |
| osgil-defense/TARS/tars/crews.py | 181cb780b71ec12ded18019247000b6a70a66cb898dfa23ca0c68c28886166a1 | 002a8837043f787436f1e2dba470fac6b37d4fc4f71dd0431acc383981e62068 |
| osgil-defense/TARS/tars/agents.py | f7c4404814c7494ed2112c857c8c171e3524718d87eb27d8c1a811f5b6f3b626 | dbbde708b926c52481ed4ec59dd32f44c989e8fc6e941b64f1eedd64e93f404f |
| osgil-defense/TARS/tars/config.py | e2fd47403fd44de5ee9a6e71e37162888806da241145020765ee7648fcd365ea | eedeb6ff70b79582e0274e66b030fc306c1102fedf47a3267a32f30d7fb3ccc4 |
| osgil-defense/TARS/tars/routers.py | d0b0e6a00ae27356f21534db606de7dee21e4baeb538710793cfb33b1d069bee | 99e3acdf3f7984c80da92e3b45a64ab2cab6164553a83bc5d676e13b07bebb05 |
| osgil-defense/TARS/tars/tasks.py | ae8729cf8a7b70b77b1e8fb4bdc9f53cdbbe3afdcc3ce6635f73ace83640a4d3 | 1cacde547d976f8405229048567937547168247c6740395e075429909b0906e1 |
| osgil-defense/TARS/tars/tools/nettacker.py | 6f6821bd1c9073cbfd55457249f2c6b2f3974cd6ea0fe04d06fad95f621e7d8d | 49cb270423b970438e56cb3277586e11104887074a9a459f324b38ce2762a0ac |
| osgil-defense/TARS/tars/tools/zaproxy.py | 90045598419b5f403a5dac84fe840d7d1da1ec321ec51594d0a09cff2180d334 | 01cd46c640978faf1c3fada3a52245f02773f43de40eb326f76686cd3323d7b3 |
| osgil-defense/TARS/tars/tools/scrapper.py | 5fc5d2ca5f4055e3e1cd1e84aa6bc3e966d72ec57bd48f89a836b86926383883 | 920d21c158c3e6a892718e1c48272e566e9f9b68d19b61ad4767f34827e2e370 |
| osgil-defense/TARS/tars/tools/search.py | b9309581d80284f1f0ec750c661a6e8d96a58f3ede72c75bf632a01c6bbc1bea | 1cfd6acfe8a3f3b47cf70611369a6a10d8cb75950ab7ba1041994f7c94fbb1f4 |
| osgil-defense/TARS/tars/cli.py | 8aaff6ad11c1c220930aa6acb068c33a08f86b0a5e2a61dcf24b4c706d94ae81 | 41cd913fc94376479570d721c42a474b65281adcd873bda92043456c3c907428 |
| osgil-defense/TARS/tars/support.py | 720531aa50eb8e33961c2aae2981fe5d478fab442ac5f7b92e664aec9b93dc5e | 9ef36998605ff35c38b71381821ecd2ae2d3883dc16136425502d365869a373e |
| osgil-defense/TARS/Dockerfile | dd1630896df0012a756c328bb37334c37efb1f13b394426da92d7a6779028679 | 859dcd68286bd892636b58688fd9f5a699184af0b7b1f07c3216bc64f6ec3290 |
| bytedance/UI-TARS-desktop/LICENSE | 1eb85fc97224598dad1852b5d6483bbcf0aa8608790dcc657a5a2a761ae9c8c6 | c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4 |
| bytedance/UI-TARS-desktop/README.md | 679d202eddd3d71ab1f84bb81ce441b7fdd2394958ae84186452fc3634069a93 | 0f05aa4f447d43439f6b3f4ab179cbe1e59d170eaf6c0684fa9c2eb0872e5985 |
| bytedance/UI-TARS-desktop/multimodal/agent-tars/core/src/agent-tars.ts | 3d95d4a676b480d949493ff1cca7fb8e6abc6da1d37e350621b404bc9ac64a90 | 67170589851eaec5dbc3034f8a8868945c5b3ac09526021028cf14f219a3a969 |
| bytedance/UI-TARS-desktop/multimodal/agent-tars/core/src/environments/local/index.ts | 7cc090c84cb2bd4c1ea5f31983a004194c3cd8e460230bb3deb2a83e98463915 | 46a9ef08c962d667833e5144d83973237959cc8391a3c53424c26150de5adcdd |
| bytedance/UI-TARS-desktop/multimodal/agent-tars/core/src/environments/local/browser/browser-control-strategies/strategy-factory.ts | 2f7ab9ba5cde5280ac6e760c625b690e52887a4accea5ae834410b50438dbdfd | dd57f290cb20369c8d1b244798e18ae495dfd0902ae0986e46296651b67f7449 |
| bytedance/UI-TARS-desktop/multimodal/agent-tars/core/src/environments/local/browser/browser-control-strategies/browser-hybrid-strategy.ts | 95bc54c34beb8e863ddc542fa0fc73c1cab2b7892b9d39344ef838c7059c9392 | 95d8f966f0ff037b72eefd7e5a59370da12b88c9fe28841e02ed0b31657f4fec |
| bytedance/UI-TARS-desktop/multimodal/agent-tars/core/src/environments/local/browser/browser-control-validator.ts | ad16a7934dc0ddd60e5dcc63770d31a3441fe8b737eee369b26e1c66c5c0082d | 08921a1423d769e513e9ecc1f5458393d6b59618cb745e695c00221ba9b20c0a |
| bytedance/UI-TARS-desktop/multimodal/agent-tars/core/package.json | 151f78750ab9bc5a65ea79cee720a8379d1fb62613310c04c28d47ef2e580f65 | 1bb73823de49de3c4e766a2c51ace665d72700f9817a96045f573351942e52fe |
| bytedance/UI-TARS-desktop/multimodal/tarko/agent/src/agent/runner/loop-executor.ts | 5c2eb2738a552665d1038d3a86b511a9aefc7c996b7973ccdf80c41b38dc19d8 | cc9848596ef920cdb2b524b26cbdee6d1b91773d693872f17c984814039d54b5 |
| bytedance/UI-TARS-desktop/multimodal/tarko/agent/src/agent/agent.ts | bc5dec3037a25a8dd8def41212214048524f0df5748b3c114039dfa0300c3cff | 153d4dd32f8555bf22019cd8b8a4b7916135d67c069e744af1625b460e1ab86b |
| bytedance/UI-TARS-desktop/multimodal/tarko/agent/src/agent/execution-controller.ts | b154a30ba6f3d75c53defe3c98f62005e4dbe9ce55badfcd68fbd7c93fbfda81 | 4bb35141895ab3dd57c0651d19a076fd569247ba8c3b903f6efbcee453620b26 |
| bytedance/UI-TARS-desktop/multimodal/tarko/agent/src/agent/runner/tool-processor.ts | 3a67121a60672b0259f4a18e01cbe69c57aa203d751d9b8d8f4fd225d538a2bd | 465b474d3dd6a0507ade3540f1f613530b61498e2f50fc39e02370aa4edb1315 |
| bytedance/UI-TARS-desktop/multimodal/agent-tars/core/src/environments/local/browser/tools/navigation.ts | f24d262939ce4d0d8e4588c56a87b3abb34248212b4fecbd46cfd2c5d77718b8 | d1bf504da2849560f4d833a7fac4f3cee32cff40d921b0f8040ff386fe1f686e |
| bytedance/UI-TARS-desktop/multimodal/agent-tars/core/src/utils/resource-cleaner.ts | 2400d1ed43df14b397f73cb101b284062c3f0bbf12d15b9b1a78454d9cdb5d4b | 26913b18fa4b9d8cbb4cef7eeb230fbf18718e3ec105c25e7081f2af536bd620 |
| bytedance/UI-TARS-desktop/apps/ui-tars/src/main/ipcRoutes/agent.ts | 4b5f665ce48bc5f52d227132134fa7a2762ae8b90e7bf12aff48c02357fc4383 | a30fa3be382834a12df32b6a094f2375ca369f839ea5942af9f9efb9d604575c |
| bytedance/UI-TARS-desktop/multimodal/agent-tars/core/src/shared/message-history-dumper.ts | 3b045f9b2a5a1481b5b8cc1c019049aaa67206b2d6a3e637ae447f9e29aacf3d | 6fcdfafe28d3bd10be7cfb7c19f702983b920d78cb6944a07d7cab939bd7afbc |

Static checks: 50 cited source files content-matched their pinned git blobs with line-ending normalization; 64 immutable source-span citations checked for file existence and valid line bounds; local report/study links checked for existence. Data-only source snapshots and this report were the only task artifacts; no commit, shared register edit, runtime execution or browser tab was created.
