# hackingBuddyGPT: bounded experiments and verification lessons for ARTEX

Ginger · 2026-10-21 · source-only review · task `b7575008-0f36-4254-aaae-b07de2e65558`.

## Recommendation

Keep ARTEX as the foundation. hackingBuddyGPT is useful research material for small, explicit experimental use cases: compare history/state/hint strategies, separate tool-calling from parsed command generation, share parent/child accounting, and retain structured run traces. It is not evidence that we need another application, scheduler, memory store or browser engine. Its Linux privilege-escalation results do not establish unfamiliar-website URL-to-report performance.

The current source includes substantive web/API and AD functionality beyond the early privilege-escalation prototype. Nevertheless, its strongest advertised verification claim needs narrowing: the reviewed root detector combines session UID observation with text/prompt heuristics. Likewise, its shared run limits are useful accounting and loop controls, not a universal hard execution deadline or proof of remote process quiescence. These are source-established distinctions and source-predicted failure possibilities; no runtime false success, escape or stop failure was observed here.

No project code, imports, setup, builds, installs, tests, model/provider requests, browser, scanner or target activity occurred. The only acquisition was data-only repository/document retrieval. No stopped operation was resumed, no security denial rerouted, no shared files/register/context edited and no commit created.

## Identity, pin, date and license

Canonical reviewed repository: **`ipa-lab/hackingBuddyGPT`**, origin `https://github.com/ipa-lab/hackingBuddyGPT.git`, HEAD **`799f57e9d439ff80da506714fcf6c5124b342cd6`**, committer date **2026-09-13T13:19:44+02:00**. A shallow source clone is retained in ignored `.tools/platform-baselines-20261021/ginger-hackingbuddygpt`. Package metadata identifies version **0.5.0**, Python **>=3.13**, original author Andreas Happe, and maintainers Andreas Happe/Juergen Cito. The root license is MIT, copyright 2023 `andreashappe`. Dependencies, model weights/services and benchmark repositories have separate provenance; root MIT is not a blanket rights claim about them. [metadata] [license]

Name resolution on the review date:

- The current official project and its own package URL point to `ipa-lab/hackingBuddyGPT`. [metadata]
- `ipa-labs/hackingBuddyGPT`, a spelling found in historical paper references, returned 404 in the current official GitHub page retrieval. This does not establish a verified rename/redirect history; use the resolved current identity and preserve the historical spelling as such.
- GitHub's `sp0tx/hackingbuddygpt` page identifies it as **forked from ipa-lab/hackingBuddyGPT**. It is not silently substituted for the maintained project. No separate implementation audit of that fork occurred. [fork-page]
- `wintermute` is the package's CLI entry point, not proof of another independently reviewed platform. [cli] [metadata]

Official GitHub API metadata URLs were unavailable through the web reader during this task; identity relies on the successful canonical Git clone, pinned package metadata, official repository pages and the explicit fork label. No ancestry beyond that evidence is claimed.

## What the actual execution system does

### Shared loop and capability dispatch

`AutonomousUseCase.run` starts limits/logging, calls `before_run`, performs rounds while `limits.reached()` is false, then runs `after_run`. It records failure when a limit reason exists; otherwise explicit completion becomes run success. Exceptions are logged and raised. This is workflow completion semantics, not a universal vulnerability oracle. [loop]

Two real styles coexist:

1. **Command strategies:** template history into a prompt, get model text, parse/normalize commands, execute a selected/default capability, append command/output history and call a use-case-specific success predicate. The main LLM response is registered against limits. [strategy]
2. **Chat agents:** retain real assistant/tool messages and offer capability schemas; the shared tool turn gets a model response, registers usage, runs tool calls and appends their results. Default calls execute concurrently with `asyncio.gather`; callers can request sequential processing. Exceptions become error messages rather than automatically stopping the whole investigation. [agents]

Capabilities are explicit Python objects, and the reviewed tool-call conversion rejects unknown names and validates JSON arguments through its generated model. This helps interface correctness. It does not validate business authorization, shell destinations, or every effect behind a valid tool argument. [capability]

`AdvancedWebTesting` exposes no direct target tool to its top-level agent; it gives a subagent capability access to SSH commands on an attacker/jump host and flag submission. The subagent receives selected capabilities and a child limit, then returns a model-authored summary through `complete`. This is a real delegated execution method, not independent corroboration: the parent and child share the model/log/capability machinery, and a summary does not authenticate a target effect. [advanced] [subagent]

### Inputs and access: do not reduce every mode to a URL

| Use case | Actual represented inputs/tools | What is not established |
| --- | --- | --- |
| Minimal/strategy Linux privilege escalation | Existing low-privilege target shell/SSH access; credentials/connection; shell commands and credential tests; optional hints/state/RAG | Initial compromise from a website URL, general web assessment or dedicated email registration |
| WebTestingWithExplanation | Host URL, HTTP capability, pentest-playbook capability, configured flag objectives and optional hints | A visual browser, JavaScript interaction or independently verified business-impact finding |
| AdvancedWebTesting | Host/task plus SSH access to a Kali-style machine in the same network; delegated commands and flags | Isolation merely because an agent is delegated; verified target account/mail ownership |
| WebAPITesting | Config path including host/token/credentials/endpoint information; optionally supplied OpenAPI spec or sitemap; document/test/auto modes | Equal information between source/spec-assisted and URL-discovered arms; general multi-account signup/inbox flow |
| AD planner/executor | Assumed-breach scenario, SSH jump-host command execution, structured task plan and knowledge | URL-only public-site discovery or independently validated access grants |

These are source-backed capability shapes, not successful runs. The web/API source supports actual requests and generated testing workflows; it would be wrong to describe the whole project as only an SSH assistant. Conversely, the presence of web agents does not show authenticated browser workflows. No dedicated delivered-email inbox, self-registration lifecycle, browser automation integration or account-isolation contract was established in the selected paths. [web-agent] [api] [ad]

The API orchestrator explicitly warns that sitemap-derived surfaces lack request/response schemas and auth metadata, leading to thinner heuristic testing than OpenAPI-driven runs. A supplied specification, credentials, hints and known flags are substantive access/assistance inputs and must be recorded separately from discovery. [api]

## Hypotheses, memory and learning

Command strategies can use no history, full command/output history, or command-only history; the latter discards output context. Full history is trimmed to a model token allowance when preparing the next prompt. These are distinct experimental treatments with different information retained, not inherently better or worse memory. [history] [strategy]

The fuller Linux use case optionally updates a model-authored state, analyzes results and requests RAG queries. Its hint reader selects by target hostname from a supplied file. Those are guided conditions, not blind discovery. State updates summarize old state and new command output; they are not independent verification or model-weight training. [state]

The optional RAG implementation reads Markdown documents, splits them, embeds them with `OpenAIEmbeddings(model="text-embedding-3-large")`, builds a Chroma store, retrieves ten similar chunks and returns concatenated page content. This is an additional embedding/provider dependency even if command generation uses another model. The returned text does not itself preserve source/correction/hazard metadata. Do not import it as the NBRET research-custody implementation or assume a local generation model makes this mode offline. [rag]

AD has a persistent strategic planner, a fresh tactical executor per task, and knowledge mutators for accounts/entities. The executor prompt explicitly warns that shared knowledge can be incomplete/incorrect. That is a useful method: transfer only the task, relevant state and uncertainty to a bounded worker. Account/entity records remain agent-authored data, not corroborated ownership or authority. `RecordNote` similarly appends supplied title/content to a list; it does not establish durable truth validation. [ad] [ad-executor] [note]

For ARTEX, reuse its graph/history/optional Norma memory first. Translate the useful method into explicit hypothesis, observed outcome, rejected assumption and staleness/provenance fields. No extra vector database or planner/executor engine is justified by this review.

## Verification: positive machinery and exact limits

### Linux root success is not only a model declaration

The tool-calling minimal agent does more than trust the `task_solved(evidence)` string. A closure remembers a root demonstration or successful credential test, and otherwise `task_solved` runs a live identity probe and checks session user/UID. This is a material positive control. The persistent SSH connector wraps commands with unique markers and records `id -u`/`id -un` values from its end frame. A successful root credential test can satisfy a different win condition even when the original shell remains low-privilege. Preserve these distinct outcomes rather than claiming every solve is a persistent root shell. [root-agent] [ssh-interactive]

However, `_RootWatchingRunCommand` calls the **shared** `check_command_success` on captured command output plus session UID. That shared function accepts a root UID when available, but otherwise also searches output for a root-looking identity marker and falls back to a root-looking prompt. `is_root_from_id` is not restricted here to the return of a separately trusted `id` invocation; it is applied to arbitrary command result text. Thus the pinned source does not justify the blanket assertion that only real privilege change can score success. A success-shaped string could satisfy the text predicate without independently proving a privilege transition. **This is a source-predicted possibility, not a reproduced false positive**, and the live UID/credential branches are still stronger evidence than an agent's unsupported claim. [root-watcher] [root-detector]

An additional provenance limit: the SSH interactive connector sets `known_hosts=None`. The framed identity is evidence reported by that remote session, not proof of independently authenticated intended-host custody or an immutable collector. Missing marker handling returns cleaned output with default nonzero return code; `last_uid`/`last_user` are updated only when a frame matches. Consumers must preserve collection/identity freshness rather than treating a prior field as a newly observed state. No attack on that framing was attempted. [ssh-interactive]

### Flags and API reports mean different things

`SubmitFlag` checks exact membership in a configured valid-flag set, deduplicates submissions and invokes success after all expected flags are submitted. This is a defined CTF predicate, not proof of the role/object/build and forbidden access that produced a value. Known answers must stay outside investigator context if the intended evaluation is held out. [flags]

The API report handler records expected versus actual status codes, some narrow body conditions, and generated analysis in Markdown. A status mismatch can add a vulnerability finding; this is not a universal exploitability or identity-bound authorization check. It would miss distinctions such as an expected denial status that still contains forbidden data unless the applicable body predicate captures them. The response-analysis path also uses model judgments. Report formatting and a populated finding list do not establish independently verified effect, complete coverage or false-positive precision. [report] [response-analysis]

ARTEX should retain native traffic bodies/hashes/versions and use an independently specified, scoped effect predicate where needed. Borrow the discipline of having an explicit success check, not this detector wholesale. Neither another model nor another agent supplies independent authority by itself.

## Scope, limits, stopping and execution topology

The HTTP capability fixes a configured host prefix and defaults `follow_redirects=False`; those are useful narrower defaults. Its request still performs real state-changing methods, uses a session/cookies and can disable TLS verification when a client proxy environment is configured. The synchronous requests call inside `async __call__` has **no explicit timeout parameter**, and no engagement origin/path/action allowlist is enforced there beyond the configured construction. Blocking I/O can hold up the event loop; an outer between-round duration check cannot by itself interrupt it. This is a source trace, not a measured hang or scope escape. [http]

The shared web prompt asks for assumptions before tool calls and reflection afterwards, which is useful investigative method. It also tells the model it has full permissions, cannot ask for confirmation and should keep going; it encourages multiple tools per limited round. Those instructions are benchmark motivation, not the user's authority contract. Do not copy the force-progress/full-permission language into ARTEX or let it override stopped actions, service limits or engagement-specific review. A round cap is not a request cap. [web-base]

`Limits` tracks rounds/tokens/cost/time and propagates message/round accounting to a parent. Child allocation checks remaining resources; this is more concrete than merely telling a model a budget. Yet limits are evaluated at loop boundaries after model calls and tool work, and `cancel()` sets state/reason rather than directly stopping a backend. Explicit completion takes precedence over resource checks. Default zero disables token/duration limits; default max cost is 10 and max rounds 100. These are configuration defaults, not measured spend guarantees. [limits]

The subagent's final summary path removes all tools except complete, which restricts final actions. It then performs an extra round using a fresh `Limits(max_rounds=0,max_cost=0)` outside the shared parent. That is a concrete settlement-accounting exception to a blanket “all child resources are always counted” claim. [subagent-settlement]

Connector/CLI distinctions matter:

- Interactive SSH has per-command waits and a reset/close path, but close does not await a remote command tree's exit. The command framing has idle/read deadline stages, not a universal effect fence. [ssh-interactive]
- AD's async SSH connector runs separate channels with a timeout and closes its connection without a joined remote-process termination proof. [ssh-async]
- The local connector drives an existing tmux session, sending keys/capturing output. Its wrapper returns zero after capture succeeds rather than establishing the remote command's actual exit code in that branch. Local mode is the current machine's shell, not an isolated target by default. [local]
- CLI catches KeyboardInterrupt and exits; on other exceptions it uses `os._exit(1)`. The selected top-level loop does not put every connector's cleanup in an encompassing finally. These facts do not establish all descendants/remote effects stopped; no live stop test was performed. [cli] [loop]

No reviewed path mediates all shell, HTTP and remote destinations through a single engagement boundary. That does not mean no useful checks exist; it means schema/host prefixes/loop limits must not be credited as whole-system isolation. Any eventual ARTEX tool must use the already-admitted execution boundary, exact action authority and independent quiescence observations. No new runtime is admitted here.

## Model, compute and cost

The selected implementation uses LiteLLM and synchronous completion, with provider-specific model strings, API credentials, timeouts and retries. Many Python dependencies are unconstrained in project metadata; a lock file exists but was not installed/resolved or audited package-by-package. SSH/tmux/psexec tools and target/jump-host access are separate runtime prerequisites. Local models require their own serving/compute and do not remove target/tool/embedding costs. [metadata] [llm]

The declared `api_base` default is not sufficient proof of routing: the actual `raw_completion` has its `api_base` argument commented out. Real routing depends on LiteLLM's model/provider/configuration semantics, which were not exercised. The cost calculation asks LiteLLM, then falls back to `usage.cost` or zero on exception. Unknown pricing can therefore appear as zero; treat it as unknown spend unless corroborated. [llm-cost] [llm-route]

Main command/chat responses are registered to limits. Selected optional Linux helpers for state updates and RAG-query generation call and log the LLM without a visible `limits.register_message` in those helpers. Together with the subagent summary exception and embedding work, this prevents interpreting the run's cost counter alone as complete total spend. This is a bounded call-site observation; provider billing, other helper accounting and actual totals were not verified. [strategy] [agents] [state] [subagent-settlement] [rag]

Structured JSONL spans preserve run configuration, model/tool messages, token/cost fields and status, and flush each write. They are inspectable local records, not cryptographic independent target truth, OS append-only custody or automatic secret redaction. The inspected logger stores the supplied serialized run configuration; tool messages and knowledge may contain credentials. Redaction and export require a separate reviewed policy. [logging] [storage]

## Paper version and evaluation limits

The early FSE 2023 **Getting pwn'd by AI** paper cited by the repository is distinct from **LLMs as Hackers: Autonomous Linux Privilege Escalation Attacks**, arXiv `2310.11409v7`, revised 2026-02-11. Current source pin/package0.5.0 is not automatically the artifact used for either paper. [readme] [paper-version]

The v7 paper's §§3.1–3.2, Table8 and §6.7 describe a 12-case single-vulnerability Linux VM study with prearranged low-privilege access; the human comparison was one professional given roughly five minutes per task. It reports GPT-4-Turbo results up to 83% with guidance versus 75% unaided human baseline, but also reports a stronger hinted human result and cross-case password recognition. Hint, state/context and round conditions vary. These are author-reported results, not a matched ARTEX comparison. Threats include selected models/tasks and training contamination. Fresh targets reduce some leakage risks without proving enduring blindness once published. No reported rate transfers to URL-only web discovery, reliable email registration or business-report quality. [paper]

The useful experimental lesson is to record access, hints, history strategy, exact model and reached resources for each arm, keep failed/unscored cases, and compare a changed method against ARTEX under matched conditions. Current benchmark launcher source was only indexed for options, not fully audited or run; its existence does not validate current scoring or reproduce the paper. Neither its target recipes nor historical prompt choices authorize sensitive activity.

## ARTEX transfer: smallest useful methods and nonblocking unknowns

| Transferable method | ARTEX use | Limitation to preserve |
| --- | --- | --- |
| Explicit use-case inputs and success predicate | State allowed access, expected observation and disconfirming condition for a hypothesis | Predicate must validate actor/object/build/effect; textual root/flag checks are domain-limited |
| Full history versus compacted state versus hints | Evaluate a single native skill/context change | Keep source/correction/hazard links, failures, information loss and guided/held-out labels |
| Capability subset for a delegated worker | Reuse native ARTEX role/tool visibility and bounded handoffs | Shared custody, prompts and budgets are not an independent evaluator or egress boundary |
| Parent accounting plus settlement visibility | Record aggregate model/tool time, tokens, requests and cleanup | Include extra summary/analysis/embedding calls and unknown prices |
| Structured native run trace | Link original ARTEX traffic/report versions to later review | Preserve errors, missing data, identity uncertainty and secret-handling policy |

No mandatory adapter, RAG database, alternate browser or extra runtime follows. First inspect ARTEX's effective build/tool/provider bindings and one native export; manually map a case to the canonical reader before automating if sufficient. A later admitted owned evaluation could challenge quoted-success text, stale session identity, wrong object, denied status with leaked body, pre-existing success-shaped state, missing evidence and stop during active work. Those are proposed controls, not tests run here.

Unresolved questions are **nonblocking for ARTEX configuration research**: exact old-paper-to-code correspondence, current benchmark scorer correctness, every optional use-case/helper's accounting and remote cleanup, external model/embedding routing and cost, dependency-specific licensing/versions, and completeness of fork ancestry. Resolve a question only when its component is actually being considered. Existing ARTEX deployment identity, native evidence mapping, accounts/mail authority and selected stop policy remain the relevant prerequisites to active execution; this source task authorizes none.

## Research reconciliation and read coverage

Corpus search for hackingBuddyGPT and the candidate owner names found no substantive prior project review, only the new assignment/index. Register search `hackingBuddyGPT shell access evaluation memory tool` retrieved existing evaluator, status/content and execution-boundary lessons. The source studies previously opened in this session remain applicable: [framework](../../assessment-evidence/framework.md#audit-the-evaluator-before-evaluating-the-tester), [executable-claims](../../assessment-evidence/executable-claims.md#additional-linked-claims), and [SDK boundary continuation](../../assessment-evidence/sdk-boundaries-continuation.md). Relevant entries: `ai-evaluation.audit-evaluator-before-tester` is a proposed synthesis, `safety.capability-gate-outside-model` proves only selected component decisions, and `authorization.deceptive-403-status-only-oracle-fails` is a known-answer local fixture result, not measured discovery quality. No correction is a license to restart historical stopped work.

Read scope: README relevant identity/use-case/config sections, MIT license, pyproject metadata; core usecase1–104, strategies1–170, agents1–175 and215–328, capability tool-call model/conversion blocks; minimal tool-calling privilege agent and shared root detector; interactive SSH1–223 and async SSH1–70; HTTP capability and selected local tmux/capability path1–120; web base/with-explanation/advanced and flag/end tools; Linux state/config/hint/helper paths100–150/180–258, histories and RAG/note helpers; API orchestrator40–170, report-handler47–155 and response analyzer1–95; AD planner1–128, executor1–102 and knowledge mutator/table blocks; logging137–168, storage1–145; CLI. Large outputs were emitted in bounded ranges, and omitted/truncated portions were not credited as full-file reads. Most prompt/information modules, full API engines, Windows/psexec, benchmark launcher, test suite, complete logging/analysis/replay tools, configuration serializer and dependency internals remain unread/partial. The paper was read in selected method/result/threat sections, not independently replicated. Tests were not run or credited as passing.

## Pinned sources

[metadata]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/pyproject.toml#L1-L85
[license]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/LICENSE#L1-L21
[readme]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/README.md#L14-L100
[fork-page]: https://github.com/sp0tx/hackingbuddygpt
[loop]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/usecase.py#L55-L104
[strategy]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/strategies.py#L18-L133
[agents]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/agents.py#L18-L175
[capability]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/capability.py#L165-L202
[advanced]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/web/advanced.py#L1-L48
[subagent]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/agents.py#L215-L258
[subagent-settlement]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/agents.py#L260-L328
[web-agent]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/web/with_explanation.py#L1-L30
[web-base]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/web/_base.py#L12-L66
[api]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/web_api/web_api_testing.py#L40-L166
[ad]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/ad/ad.py#L33-L128
[ad-executor]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/ad/executor.py#L19-L102
[history]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/utils/histories.py#L1-L45
[state]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/priv_esc/linux_privesc.py#L180-L258
[rag]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/utils/rag.py#L1-L42
[note]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/capabilities/record_note.py#L1-L18
[root-agent]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/priv_esc/minimal_linux_privesc_tool_calling.py#L87-L170
[root-watcher]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/priv_esc/minimal_linux_privesc_tool_calling.py#L15-L59
[root-detector]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/utils/shell_root_detection.py#L19-L68
[ssh-interactive]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/utils/connectors/ssh_interactive_connection.py#L66-L223
[ssh-async]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/utils/connectors/async_ssh_connection.py#L28-L69
[local]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/utils/connectors/local_shell.py#L13-L91
[flags]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/capabilities/submit_flag.py#L8-L33
[report]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/usecases/web_api/report_handler.py#L67-L145
[response-analysis]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/utils/web_api/response_analyzer_with_llm.py#L1-L95
[http]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/capabilities/http_request.py#L12-L93
[limits]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/utils/limits.py#L29-L195
[cli]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/cli/wintermute.py#L1-L37
[llm]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/utils/llm.py#L16-L54
[llm-cost]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/utils/llm.py#L56-L123
[llm-route]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/utils/llm.py#L129-L148
[logging]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/utils/logging.py#L137-L168
[storage]: https://github.com/ipa-lab/hackingBuddyGPT/blob/799f57e9d439ff80da506714fcf6c5124b342cd6/src/hackingBuddyGPT/utils/log_storage.py#L110-L144
[paper-version]: https://arxiv.org/abs/2310.11409v7
[paper]: https://arxiv.org/html/2310.11409v7

## Provenance checks

Each cited source file below content-matched its pinned Git blob after CRLF-to-LF normalization. Checkout and Git-blob SHA-256 are recorded separately because Windows line-ending conversion can change bytes. These hashes establish preserved content, not runtime truth, dependency safety or complete reading.

| File | Checkout SHA-256 | Git blob SHA-256 |
| --- | --- | --- |
| pyproject.toml | 6a2d474584c7e234f95f6ef9b03471e8c1d367acf2686575d8bfd7c21cf1ea44 | 2321bbd75f8c3719727ba68d10fd7838ba135fca3323a9cbbb9ba230d59a9bf7 |
| LICENSE | c18d8132c5944424df263eac6dbe9a4d23558f4d2033a38c923538083af29fd2 | 5fe98f6341e27bb34ab3fc20a5d1843b9d5b3ceed2db0d46e032710adf8235a4 |
| README.md | 856d1cc9822ed501317e18c8bebd988bbcec6120bbb3509b76f65934503d4f24 | d9ab924c36d31f234c7ece0b7da14d2988dca899fbe3733fc9e8d151cf1fc5a3 |
| src/hackingBuddyGPT/usecases/usecase.py | 80b2b6aaff50a9787cbba5180c486e387681e1012980ff201e19bfbaafb7cb79 | 809053beedd7ac7493e353b35760cfdab8df1abb633fa437c30c0f740105c15d |
| src/hackingBuddyGPT/strategies.py | 0c024c3bdcf2f6a1fdee23bad30d697db11f4a2ee1eafa15390c35e8cf9c0113 | 7a9bd95039394c54165b4b43e890641effed2f89d450d9a2994dca74d1c2a9cf |
| src/hackingBuddyGPT/usecases/agents.py | 0af936c9fa53a3052fb6a68e30f3d57205ff11ca00e70811d1b8fa21eec116cf | 15e693f5b989cab6db0f0d7dd97395bb5c41ec82ff97595e8e398a826c1c1d67 |
| src/hackingBuddyGPT/capability.py | 3faf780804906b2bc22609a1f0de3f0e17ee5a7c87bdaec00a6fc78349b8de52 | de93ad9c11119da939a6cb3538d951a1eeeb98e36cb789da42aa9c60917676e7 |
| src/hackingBuddyGPT/usecases/web/advanced.py | e12e64fd4ab5d322f5097897c5317eb7f5579a664d3b3830750165239c9763a0 | aa786160afe782d53801104ba16e86e419e42a6283d5fa5b1a54c60f9a94b67b |
| src/hackingBuddyGPT/usecases/web/with_explanation.py | d4652b1906a9953bedff9d81502f2a8736dc60c0a519cd89b934efcb2901c828 | 287921ed1df152bfd165c9ceead3088568a5a87d62cbc508eca5332cc6fe28c0 |
| src/hackingBuddyGPT/usecases/web/_base.py | 7f3b22581169b1dee362d14adfa0e494882b4db5a0bcd2b22b9ce951a8577892 | b8f6ad13a3e2d5a3e27469e3723d3fd675e5f381358d2205fd6cf01a7110a3d9 |
| src/hackingBuddyGPT/usecases/web_api/web_api_testing.py | 032b4ad970685c3add8b41c3171bec12fabcde9b4562805111c60eb16af03b1c | 57886760d8f264756d66d2ddb9123ba87bf9b6127c3d518367dde168ff69eea9 |
| src/hackingBuddyGPT/usecases/ad/ad.py | 87f4683297331139550333fe6f16595272e46613d86426730668e77186361bb9 | af8c22195c5b22c51a66d0bf6ae56bbf02c26178ecfa751cfebab3f305b9994b |
| src/hackingBuddyGPT/usecases/ad/executor.py | de3255392c8b4e7cb36de3ce43ccbbf963e51f3faa1bb918bb1d2d2d43ec9132 | ac1b77eaa05e7765d5daa50f143e5e62d0679f819489ccd940ebdda5c604bd22 |
| src/hackingBuddyGPT/utils/histories.py | 0b4ec728b816fa8569b0161965a3481def068b82cb96e6c0cdcdfe87e319c466 | 853d49da54fd0d27dba34e56a0aed373b6f6bc75420c3dea16719a3fe65fd47c |
| src/hackingBuddyGPT/usecases/priv_esc/linux_privesc.py | 34214f0be2351b73f5bccad1bde0341a6b25e3d7fcbf1f4e9691f9f06350f5c9 | 7418d0d3b15d429edf8266439406a9d52cb7a8f22cec15f1d1deb18fc4bc5bc4 |
| src/hackingBuddyGPT/utils/rag.py | 036684df7713f7448e259e5a5da8aaa97b37990d0c1c12d7d0c3e2d00df19b97 | 5b929d0ac4f9a1c276dfa3807e04a9c2d2ffa9c343a8660c775e50f8f7e340eb |
| src/hackingBuddyGPT/capabilities/record_note.py | 8f7dcaedb4c201f13e2cd9c1703125fcf6109d782f2270a95595b30a5890cd37 | 301d33b6798c1738139c9d2226eb2555a686768eab59c332bd40f592bc57ab8d |
| src/hackingBuddyGPT/usecases/priv_esc/minimal_linux_privesc_tool_calling.py | 286cbfe61fe8fbad29a68f15b4c9409b5f673aa312640a4ad1d13ea841842af1 | 13d096a47fbfa8867c6854fc5ef5b46527f0318a5e5d2d81e036a00171894f68 |
| src/hackingBuddyGPT/utils/shell_root_detection.py | f7cedf79efdba01449be259d26385c68957e0c9e5b7f052de30fbbf247a6ac79 | 4b87ccd61f385a02f7fc5db354e9f69507008e1e94b143e98e587eeb57fde16d |
| src/hackingBuddyGPT/utils/connectors/ssh_interactive_connection.py | e963805f0c584af3ab47cf690984efeba61607c60d61c6ed23f132b81bc962b0 | 803d644753c14addda44da239a8f84029ae7701dc144b3820733030cac031352 |
| src/hackingBuddyGPT/utils/connectors/async_ssh_connection.py | dc9bf0fba48874df0cc090700738b16a3a1fc2f5d79300142ba4a98b0750e907 | 3ab104c001b01d1a8b96b85ad8c24247b55772501f5061bff148f270eb15133f |
| src/hackingBuddyGPT/utils/connectors/local_shell.py | d20ef28f35c419a34dd1ceaf083d605130595826639c7ed2b2acf6a43a3f13e5 | 0cdc60368f82fb50e32603fadf3d8895c499ae3cc83899635090b500e5f89d2f |
| src/hackingBuddyGPT/capabilities/submit_flag.py | 1b45df50da7ac7a0c03db857e01342a5591729437df23bbb7ab07895406c6020 | 67581512d234d86a7280832eeb8dac543785342d43f4e2dae2b3b8fe7310384d |
| src/hackingBuddyGPT/usecases/web_api/report_handler.py | 7ebaaf641f2bd0ecd44e61b758ce952a7f034db47e594db637d90ec43f6533fd | a13a591692607928027b25466abc4b79454e482d87cb1860a573e992c8d15d5e |
| src/hackingBuddyGPT/utils/web_api/response_analyzer_with_llm.py | 1128bf1812d935fd287aa1bedf615c5eed472beed3632d83cdeafb53cccdef77 | 3366f2367885bd2314b5760171f1544f0f9b8c3c9a418687ecb6934d14f54a6a |
| src/hackingBuddyGPT/capabilities/http_request.py | 384b4b425de99b8e8641502e076234bda415e22be328b0e9878a00638a087adb | 78dcdf6a648b98a0351b500165bb04fe221475cea8d9e33f0de03824cc08f647 |
| src/hackingBuddyGPT/utils/limits.py | 06b509ac018691497bf370ee5c977942cf966bd21572eaf27f1c77600d22ca03 | 6997a1c003a6ad45c58d1c854aba356c4f596c6ed04a7d2800b2c1a2ec2afa45 |
| src/hackingBuddyGPT/cli/wintermute.py | f815274b32e704b7e4212c466a0cb5cb1b1e32bc6388ed9e7faa39cf695e5016 | 343964d89d58b3209d2c893a7b859abc7d5714fd857eeb57f29196da03458225 |
| src/hackingBuddyGPT/utils/llm.py | aecfd3ee1a994b0775e87c51238b7d63bdd48506d5c1afd5539bb5e2333ff424 | e238355e9c8abc82ec2f0ebbce1778608e1dd58556ae31de5ae423e231858edd |
| src/hackingBuddyGPT/utils/logging.py | 5204018800652b3767503fa90006dda5b9b1501dd2b05f47644737aeda293a58 | bef58fc911abc3a68a997c968ceb07e2335e8bd946313fe88d109a1820720a59 |
| src/hackingBuddyGPT/utils/log_storage.py | 02dd58d5a52f6613b519679da1ec5c313b8f302996c79a7d3828c393180c9fd7 | 53123252411590034fcaf4408782c774084711cb515409f392baac7288d8c049 |

Static checks: 36 pinned source-span citations resolve to existing files with valid line bounds; 31 unique cited files content-matched their pinned blobs. Local study links resolve. Source acquisition and report only; no upstream code execution.
