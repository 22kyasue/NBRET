# Research integration with ARTEX at the core

Ginger · 2026-10-21 · task `3c67ab16-a995-44c6-a60a-f8152ac715ea` · source-only design review.

## Recommendation

**Evaluate ARTEX as the investigation engine and operator application; put our research, methods, controlled evaluations and effect verification around its existing extension points.** Do not build another planner, dashboard or general agent framework to answer questions the existing application may already handle. This is an evaluation architecture, not automatic engine adoption or proof that ARTEX is safe/effective on a real target.

The practical first integration is a small role-visible research skill plus a read-only, bounded retrieval adapter, with native ARTEX artifacts exported into our existing evidence/case/report path. Method comparison and independent effect adjudication remain outside the investigator's authority. None of those adapters/configurations was installed or executed in this task.

There is a distinction between three layers:

1. **Intelligence:** relevant research, corrections, methods, hypotheses and counterexamples available to the planner/worker.
2. **Authority:** the actual permitted targets, actions, identities, budgets, data and stop conditions enforced outside model text.
3. **Truth:** independently supported observations/effects and their conditions, with uncertainty retained.

A skill improves the first layer; it does not supply the other two. A screenshot establishes that a UI exists. A model-produced `confirmed`, an ARTEX graph fact or a schema-valid finding is not an independently demonstrated consequence.

## Evidence and scope

Read current `AGENTS.md`, `CONTEXT.md`, [research usage guide](../research/reconciliation/USE-RESEARCH.md), [ARTEX deep dive](../../../../docs/consolidation/artex-deep-dive.md), relevant pinned sources and [previous reasoning audit](autonomy-reasoning-audit-ginger.md). Only this Markdown file was written. No provider/CLI inference, target traffic, browser, engine, MCP server, scanner, installation, build/test suite, old lab or configuration mutation occurred. Read-only register retrieval/document hashing are not capability execution. No commit or shared-file edit was made.

Source observations are **source-trace**; upstream descriptions are **public-doc** or attributed claims; the proposed adapters/sequence are **synthesis**. Historical component/integrated evidence is not widened into ARTEX runtime acceptance.

- ARTEX selected snapshot: `https://github.com/jiwoochris/artex-global.git`, full commit **`fdfb7a17b7da5e2de716c0e98475ec77a41c64c6`**, [local provenance](../../../../references/artex/fdfb7a17-local-cli/PROVENANCE.md) and [40-file manifest](../../../../references/artex/fdfb7a17-local-cli/SOURCE-MANIFEST.txt). This is not the complete build/runtime/database. Nine local bridge files were untracked at source inspection; the manifest hashes identify them independently of the commit.
- Register read in this task: **334 findings, 203 corrections, 80 hazards**. `USE-RESEARCH.md` retains earlier 325-entry descriptive counts; live register JSON was counted directly. These are evidence cards, not 334 demonstrated vulnerabilities, installed tools or individually integrated methods.
- Method pins: Cloudflare `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`; autoresearch `228791fb499afffb54b46200aca536f79142f117`; Awesome-Hacking `b2bb13aa69b4f568a1bab0cbb17b7a00a350dc36`. Exact sources and limits are in the three [repository studies](../research/security-landscape/repository-reviews-20261021/README.md), with per-file provenance.
- Synapse CE: `https://github.com/KKloudTarus/synapse-ce`, **`a55a314aab8eb6e5979f7d886c82a0729776949f`**, source-read in the preceding reasoning audit. Separate product; not our Synapse and not adopted by this proposal.

This audit does not modify current target authorization. Cass's fresh public read-only mapping of the owner-selected exact HTTPS agency domain is separate from any future ARTEX trial. No account ladder, source access, live mutation, additional host or provider call follows from this document. Existing stopped actions remain stopped, with no rerouting through another session/tool.

## Actual integration seams in the selected source

| Seam | Actual source behavior | Practical application and limit |
| --- | --- | --- |
| Task goal/description and constraints | `agent/goals.go:115–170` supplies goal text/description to a model and domain goal/constraint tools. | Put a compact approved scope summary, purpose, completion/no-finding rule and research procedure in initial context. Extracted constraints are model records, not execution permissions. Goal decomposition does not call the general skill/MCP augmentation in this selected path. |
| Role-visible skills | `server/assembly.go:25–65,127–149` loads filesystem skills selected by database visibility and exposes a Skill meta-tool. | A concise research/method skill can instruct planner/workers when and how to retrieve/apply evidence. Actual loader metadata/frontmatter and active role assignments need inspection before packaging; this audit does not invent a working skill YAML format. |
| MCP tools, optionally skill-gated | `assembly.go:67–149` connects enabled visible servers, gathers tools, defers schemas and unlocks skill-associated tools on Skill invocation. `mcpdiscover.go:40–59` supports stdio, HTTP and legacy SSE. | A read-only research service is a plausible adapter. Skill gating limits prompt/tool visibility; it is not an OS/network authorization boundary. Connection/list failures can leave tools unavailable while the agent still runs. |
| Host/custom tools | `assembly.go:151–180,239–323`; `customtool.go:345–473` provides command, Python script and HTTP execution paths. | A fixed read-only wrapper can expose retrieval without a new MCP dependency if that is the smallest compatible seam. Do not expose arbitrary command, path or URL arguments. Custom tool presence does not supply a sandbox. |
| Editable role prompts/tool descriptions | `assembly.go:190–214,239–323` seeds defaults once and permits database overrides. | Research procedure and completion rules may be configurable without an engine fork. Current effective prompt versions/bindings must be captured; code defaults need not be active defaults. |
| Task hints, facts, traces | `agent/tools.go:1305–1368,1564–1651` supports fact/constraint/hint records; other domain tools expose worker traces and graph detail. | Keep research citations as contextual guidance with explicit source kind, not target observations. Native schemas do not implement our independent research/effect provenance contract. |
| Findings/traffic/report artifacts | Existing finding workflow, traffic bindings and report modules. | Reuse ARTEX's operator UI; import its original records/evidence into our canonical client report. Optional traffic binding and model-authored status require exact interpretation; importer must not auto-promote them. |
| Memory/knowledge features described upstream | README mentions memory alongside MCP/skills/report. | No native vector store, research index, import API or access-isolated RAG service was established by the selected source. Use verified skill/tool/context seams instead of assuming an invisible knowledge product already works. |

Pinned source: [agent assembly:26–72](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/agent/assembly.go#L26-L72), [server skill/MCP assembly:25–180](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/server/assembly.go#L25-L180), [prompt/tool resolution:190–323](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/server/assembly.go#L190-L323), [MCP transport:40–59](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/server/mcpdiscover.go#L40-L59), [goal context:115–170](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/agent/goals.go#L115-L170).

Three operational implications are easy to miss. First, each augmented run can connect/spawn MCP clients; discovery/listing is itself runtime activity, not a harmless catalog read. Second, a skill referencing an MCP does not prove that the endpoint, dependencies or credentials exist. Third, the CLI bridge's empty-tool/read-only restrictions concern **decision generation**; ARTEX invokes the returned tools afterward. Put research tools into ARTEX's admitted tool set, not secretly into the provider CLI's disabled native-tool path. The [bridge boundary study](../research/security-landscape/art-external-platforms-20261020.md#provider-restrictions-and-engine-permissions-are-separate) remains applicable.

## Route the register through a small read-only retrieval surface

### What we already have

`find-research.mjs` reads local register/study files, supports ranked search, machine-readable output and exact entry lookup, and never imports research artifacts or contacts a target. `lib.mjs:38–68` loads register data and resolves exact study lines. `192–270` builds keyword/BM25 card/passage indexes and includes attached correction/hazard metadata. These are actual implementation seams; a paid embedding service/vector database is not required to try retrieval. [Finder](../research/reconciliation/find-research.mjs), [library](../research/reconciliation/lib.mjs).

The implementation is useful but **not a complete safety policy**. Top-level ranked corrections are capped at three, hazards at two, with relevance thresholds; returned passage attachments are based on cited line proximity. Findings do not automatically carry every correction affecting every source under all query formulations. An empty returned hazard list is not clearance. The existing retrieval regression measures retrieval on its fixed question set, not ARTEX choosing better actions or exhaustive hazard recall. [lib.mjs:226–270](../research/reconciliation/lib.mjs).

### Proposed thin adapter, not implemented

Expose two narrowly typed operations under an approved read-only research namespace:

- `research_search(question, bounded_filters)` returns ranked cards/passages, strengths/limits/contrary evidence and stable references, plus explicit truncation/completeness and corpus version.
- `research_read(reference_id, bounded_line_window)` returns exact approved source lines and attached corrections/hazards. Resolve reference IDs against a frozen allowlist; no arbitrary filesystem path, command, URL, module, external fetch or protected answer access.

The actual tool names and schema must be chosen after checking ARTEX/bridge schema support; these are an interface proposal, not tools currently callable from ARTEX. Either a small MCP service or a fixed custom wrapper could host it. Select the one that works with the inspected runtime at lower integration cost. Do not create both merely for architectural symmetry.

A response should bind corpus digest, entry ID, source path/line/digest, evidence strength, exact excerpt, implication, limits, contrary evidence, correction links, hazard links and retrieval time. Attach **all known source-linked corrections/hazards** for the selected citations independently of ranking. Keep a separate immutable operational stop registry; semantic search cannot enforce the no-reroute rule. Mark missing linkage/source or a truncated decisive passage as incomplete and require bounded follow-up rather than an answer inferred from a preview.

Use a curated read-only research snapshot, not an unrestricted mount of the whole repository, runs, environment or host home. `lib.walkMarkdown` recursively indexes the research root, which means later sensitive files placed there would become searchable. Hidden target keys, scorer labels, client secrets and private evidence must not enter that investigator-readable root. Same-host folders are not custody. The adapter must preserve realpath/root containment and reject symlink/path escape at its actual read boundary; an input schema alone cannot establish that behavior.

The investigator sees a small stable procedure and retrieves detail when choosing an action, interpreting an unexpected result, escalating a claim, proposing a method change or preparing verification. It need not load 334 cards into every prompt. Log which evidence changed a decision and which relevant method was deferred because access or authority was absent. That is a concrete way to use the corpus without treating bulk context size as intelligence.

### Do not turn research cards into target facts

Fresh source reading found `recordOneFact` only requires a nonempty summary. Evidence and confidence are optional; the stored fact node is created with status `confirmed`. The comments correctly distinguish facts from vulnerability findings, but the stored status is not independent corroboration. [tools.go:1305–1368](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/agent/tools.go#L1305-L1368).

**Register-ready observation:** At ARTEX `fdfb7a17b7da5e2de716c0e98475ec77a41c64c6`, `recordOneFact` accepts a summary without evidence or confidence and inserts a fact node with status `confirmed`; that status can therefore represent an upstream declaration rather than independently verified target evidence. [Exact path:tools.go:1316–1344](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/agent/tools.go#L1316-L1344). This is source-trace evidence about fact insertion, not a runtime test, all finding workflows or an observed false client report.

Therefore do not preload register findings through `record_fact` as though their mechanism was observed on the current website. Use role skill/context and bounded task hints for research guidance; retain a separate citation/decision ledger in our wrapper or existing journal. If an ARTEX fact cites research, preserve it as upstream declared guidance and its source kind. A `confirmed` status, `confidence=observed` string or model-supplied command quotation cannot supply our verified-effect authority.

## Apply the three method studies selectively

| Method source | Useful addition to ARTEX | Thin integration | What must not transfer |
| --- | --- | --- | --- |
| Cloudflare audit method | State intended boundary; inspect strongest preventing control; retain exact decisive missing fact; adversarial critique and coverage/omission ledger | A compact role skill/checklist and review template; separate source-assisted profile when source is actually admitted | Do not give URL-only investigators invented source lines or silently add server-code knowledge. Upstream source-audit workflow forbids deployed probing and prescribes a sandbox; importing it unchanged would conflict with a live browser task. Its validators inspect declared records, not effect truth or sandbox enforcement. |
| Autoresearch | Baseline first, one versioned candidate change, bounded trial, retain failure/discard rationale, compare against previous method | Versioned method/prompt/config snapshots plus existing journal/measurement records; external promotion/adjudication | Do not import `NEVER STOP`, tune on the final holdout, delete failed logs, or let the candidate print its own authoritative score. Native workload is single-GPU training, not an ARTEX runtime component. |
| Awesome-Hacking | Broad candidate-method/source discovery, preserving original row/provenance | Read-only catalog lookup linked to reviewed method cards | Parent list does not pin, license, install, validate or authorize linked tools. Eighty-one rows do not equal eighty-one admitted methods. |

Opened source constraints: [Cloudflare SKILL.md:17–86](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/SKILL.md#L17-L86), with the [full review](../research/security-landscape/repository-reviews-20261021/cloudflare-review-thistle.md); [autoresearch program.md:25–39,90–114](https://github.com/karpathy/autoresearch/blob/228791fb499afffb54b46200aca536f79142f117/program.md#L90-L114) and [review](../research/security-landscape/repository-reviews-20261021/autoresearch-review-ginger.md); [Awesome README](https://github.com/Hack-with-Github/Awesome-Hacking/blob/b2bb13aa69b4f568a1bab0cbb17b7a00a350dc36/README.md#L12-L98) and [catalog review](../research/security-landscape/repository-reviews-20261021/awesome-review-cass.md).

For ARTEX itself, preserve useful frontier diversity, dependency readiness, parent evidence and trace retrieval. Override or mediate unsafe persistence incentives: `planner.go:303–329` forces a fresh intent when the goal is unmet and frontier empty and permits some blocked/exhausted work to be reissued. A skill saying “be careful” is not sufficient enforcement. Goals must allow no-finding completion, exact security denials must remain terminal for that action/equivalents, and new authority cannot be inferred from a model's revised plan. [Pinned planner](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/agent/planner.go#L303-L340).

## How CE contributes without becoming another core application

CE has useful typed proposal/verification interfaces, a real LLM/recon loop, optional source analyzers and explicit simulation states. Its model catalog exposes proposal/read interfaces without confirmation writers, and the wiring aligns inline/durable tool availability. We can reuse the **separation principles and artifact interpretation**, without installing a second complete operator application or claiming its modules are already compatible with ARTEX. [Pinned catalog:1–198](https://github.com/KKloudTarus/synapse-ce/blob/a55a314aab8eb6e5979f7d886c82a0729776949f/internal/usecase/agenttools/catalog.go#L1-L198), [wiring:9–57](https://github.com/KKloudTarus/synapse-ce/blob/a55a314aab8eb6e5979f7d886c82a0729776949f/internal/usecase/agenttools/wiring.go#L9-L57).

Treat a CE capability as an optional future arm only when an observed gap needs it. For example, if an authorized source-assisted investigation produces unresolved data-flow questions, inspect the exact language-specific analyzer, sidecar, coverage/warning semantics, input rights and output contract. A public URL alone does not supply source/dependencies or make a backend taint pass possible. A model proposing a chain is also not execution; CE's exploitation simulation explicitly performs no host action. Conversely, its real recon executor prevents a blanket “CE is all simulated” conclusion. [Simulation:10–77](https://github.com/KKloudTarus/synapse-ce/blob/a55a314aab8eb6e5979f7d886c82a0729776949f/internal/usecase/exploitation/simulation.go#L10-L77), [recon executor:19–95](https://github.com/KKloudTarus/synapse-ce/blob/a55a314aab8eb6e5979f7d886c82a0729776949f/internal/usecase/orchestrator/recon_executor.go#L19-L95).

Likewise CE's no-tool-call `StatusSucceeded` can mean the model gave up, not that the target objective was established. Importer/adjudicator must interpret outcomes from actual evidence and run type rather than copying status names. This and optional-analysis limits are detailed in the [reasoning audit](autonomy-reasoning-audit-ginger.md#synapse-ce-more-reasoning-structure-exists-than-the-scanner-label-implies).

## Evidence integration: thin wrapper around the engine

The wrapper should preserve **ARTEX as the application**, while providing four narrow responsibilities:

1. An owner-controlled admission/configuration snapshot identifying actual engine/SDK/bridge/provider/tool/role/prompt versions, scope, budgets and safety-stop references.
2. Read-only research retrieval and a decision/method citation ledger linked to native task/intent IDs.
3. A loss-aware artifact adapter retaining original task/intent/finding/traffic/transcript IDs, raw provenance/digests and declared versus actual identity/build/completeness/simulation states.
4. External effect adjudication and a read-only projection into the existing canonical client report, with reviewer objections, owner actions, leads and genuine retest history preserved.

The evidence adapter is practical new code, not a feature already built for ARTEX. Confirm the actual export/read API/schema before implementing it; do not guess endpoints or rely on the screenshot. Original raw artifacts stay under an approved secret-aware retention policy. A digest binds bytes, not the truth of the collector or the vulnerability. Partial proxy coverage must remain explicit; missing HTTP proof cannot be fabricated for a non-HTTP finding.

Our owned local controls supply useful narrowly known outcomes and stop/reset checks. They are development/regression cases, not a fresh blind benchmark once their source/answers are visible. An ARTEX trial can first establish that real observations and correct controls survive the complete reasoning/export/review/report path. It cannot establish general discovery accuracy by replaying the known order-read sequence. Keep hidden keys and adjudication rules outside investigator authority before later held-out comparisons.

## Controls that are still engineering, not configuration claims

Some high-value work will not be solved by adding a skill or MCP entry:

- **Execution boundaries across every path.** Tool resolution can pass unregistered tools and return originals on database lookup failure. General SDK tools, custom tools, MCP handlers and engine enrichment need actual enforcement/observation. [assembly.go:239–323](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/server/assembly.go#L239-L323).
- **Platform self-modification.** `server/platform_tools.go:18–35` exposes skill/tool/MCP creation/update and asset deletion for configured agents. Investigator-authored helpers must not silently become new tool grants, revised scorers or platform changes. Inspect effective role bindings and enforce separate owner authority. [Platform tools](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/server/platform_tools.go#L18-L35).
- **Custom tool effects and environment.** Command tools invoke SDK Bash; script tools write/run Python with inherited environment; HTTP tools call a standard HTTP client and return a bounded body without a surfaced truncation flag in the selected method. These are real runtime paths, not declarative safety. The selected HTTP method supplies no custom redirect policy; exact defaults/dependencies require inspection before claiming destination confinement. [customtool.go:345–473](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/server/customtool.go#L345-L473).
- **Completion, budget and stop semantics.** Measure actual process/request settlement and aggregate target demand, including queues and background work. A completed planner, child kill request, transport close or cancelled intent does not independently prove no remaining effects.
- **Effects and independent authority.** Wrong actor/object, stale/partial evidence, quoted success and pre-existing success-shaped state must not pass. A reviewer model is helpful critique, not replacement for a rule-specific observation/control. `verifiedFindings` cannot be populated merely by imported model or same-host declarations.

These are reasons to inspect and run separately admitted owned controls, not reasons to invent a competing engine or stop all useful source/configuration work.

## Gather source and capabilities in this order

| Priority and concrete gap | Gather/inspect first | Smallest next integration if supported | Acceptance / stop condition |
| --- | --- | --- | --- |
| 1. Actual ARTEX instance differs from selected snapshot | Effective image/commit, frontend/workflow paths, role/tool/prompt/configuration inventory and full resolved dependency set without secrets | Configuration snapshot and one observed native task trace; reuse existing UI | Do not certify runtime from source/screenshot or a cached tool list. Missing runnable/config identity blocks the corresponding trial. |
| 2. Scope/stop boundary unknown | norma `v0.4.3` actual tool/skill/MCP/agentcore executors; ARTEX intercept implementation, enrichment and cancellation callers | A separately reviewed constrained execution/admission path and denial persistence | Denied/equivalent operation must produce no send/effect; remaining independent work may continue. Do not retry a security block or fetch/install dependencies here. |
| 3. Research not available at the moment of decision | Actual Skill loader metadata and role visibility; bridge schema limits; current register search shapes and linked corrections | One compact skill + one bounded retrieval surface | Selected decision cites full correct passage with attached known correction/hazard; missing service/limit is explicit, not silently absent. |
| 4. Reviewer cannot reconstruct why/what happened | Native artifact/export/schema and recording switches, raw observation retention/truncation, exact identity/state bindings | One saved-artifact import adapter into journal/canonical reader | Upstream `confirmed`, simulation, missing body or stale identity cannot become independently verified effect. |
| 5. Measured unfamiliar-site observation gap | Existing permitted browser/capture/computeruse adapters and relevant read-only collectors | Connect the smallest actual collector to ARTEX, after its execution boundary is admitted | Actual inspected visible state supports the next action; screenshot/text loss and third-party subresources remain visible limits. Browser preference remains the existing computeruse harness. |
| 6. A particular question remains unresolved | Exact method from our register/toolchain, then primary child source/version/dependencies; CE only if relevant source/analysis is admitted | Add one tool/profile adapter with matched controls and retained failed trials | Tool adds independently confirmed insight or saves total review effort at equal scope; no gain or unsafe behavior means reject/narrow the integration. |

The output of gathering is a capability matrix: available, configured, exercised, refused, unsupported, evidence-proven and unknown. An installed binary, MCP `tools/list`, read-only annotation or health endpoint alone cannot establish the later states. No broad scanner installation, every-list-item import or CE deployment is justified merely by catalog breadth.

The licensing/dependency facts should travel with each candidate: ARTEX README/go.mod identify AGPL-3.0 and norma `v0.4.3` plus Go `1.26.3` and declared dependencies; the selected snapshot does not include a complete license/dependency audit or reproducible binary. Cloudflare's repository has an MIT license; autoresearch declares MIT in README but no standalone license file at its inspected pin; Awesome-Hacking's parent is CC0, which does not license linked projects; CE's top-level license is Apache-2.0 at the reviewed snapshot. These are provenance facts, not clearance, legal conclusions or reasons to halt source study. Preserve notices/source identities when preparing any actual copied/distributed integration; dependency resolution and active platform remain separate evidence. [ARTEX README:382–390](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/README.md#L382-L390), [go.mod:1–18](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/go.mod#L1-L18).

## Contrary evidence and acceptance of the research integration

The opened research provides real cautions, not blanket rejection of frameworks:

- `agent-runtime.artex-cli-bridge-not-engine-permission-boundary` is pinned source evidence, with active configuration/SDK enforcement untested. It does not report an observed escape.
- `agent-runtime.tool-hints-and-catalogs-not-authority`, [SDK study:423,509](../research/assessment-evidence/sdk-boundaries-continuation.md), explains that MCP annotations are advisory and one reviewed SDK aggregation does not follow pagination. That SDK is not automatically ARTEX's norma implementation; inspect the actual client before claiming the same pagination defect. The transferable requirement is to measure effective catalog completeness and real effects.
- `agent-runtime.mcp-dependency-drift-failures`, [SDK study:62,111](../research/assessment-evidence/sdk-boundaries-continuation.md), reports particular historical dependency/platform failures. It motivates pinning and compatibility, not a claim ARTEX's MCP currently fails.
- The [AgenticBlue study:5–14](../research/cybersecurity-firms/nri-agenticblue-controls.md) describes just-in-time procedures, MCP data retrieval and deterministic customer destination checks. It is a developer-authored implementation account without inspected source/tested isolation; its productivity claim cannot be borrowed as our expected gain.
- `ai-evaluation.audit-evaluator-before-tester`, the [draft framework:75–92](../research/assessment-evidence/framework.md), and selected [AgentDojo counterexamples](../research/assessment-evidence/deep-agentdojo.md#default-suite-follow-up-what-the-current-task-actually-checks) require scorer controls. Some task versions check recipients correctly; do not generalize one predicate defect to every benchmark or upstream result.
- Our [research guide](../research/reconciliation/USE-RESEARCH.md) has explicit stopped-work hazards, little integrated evidence relative to source reading, and a warning that bot-swarm source coverage is not LLM-agent runtime evidence. Carry those limits into method cards rather than just their attractive conclusions.

Validate the integration at three levels after separate admission:

1. **Configuration/adapter correctness:** only approved roles see tools; unknown paths/IDs and protected documents cannot be read; source changes invalidate stale references; corrections/hazards survive truncation; absent MCPs/failed queries are reported. This can start with inert records and no target/model, after implementation review.
2. **Operational use:** an owned controlled run shows ARTEX actually retrieves evidence, makes an observation-grounded next-action decision, obeys security stops, retains complete provenance and exports a report with no false promotion. A retrieval call alone does not establish the method affected reasoning.
3. **Measured value:** compare declared prompt/retrieval/tool versions at matched scope/access/budget, count all failed/inconclusive attempts and total person-time, and retain held-out variants for generalization. More citations, longer traces or a rising ARTEX coverage graph are not measures of useful discovery.

Reject or narrow the integration if research citations are decorative, stale/missing corrections change the recommendation, a blocked action is reissued elsewhere, secrets/keys become retrievable, model output controls scoring, failure states vanish during import, the wrapper duplicates core ARTEX functionality without need, or reviewer/operating cost outweighs the measured useful result. No numerical improvement or discovery quality is established by this source-only plan.

## Provenance and work retained

The exact register bytes observed:

| Register file | SHA-256 |
| --- | --- |
| `findings.json` | `28e77221028c7844ced57cbc1f67abafb3a3b8fcac15357065537cc25de44db6` |
| `corrections.json` | `6694acb9b3cb06d6c4c1b8603c7a0f0f7ff9b58892a53bf9374e5d5abae4a256` |
| `hazards.json` | `e5d85f645c2fd0d3a232edf938d4b80bebcd17779d60104f8f160edd3f67365f` |

Fresh source reading covered complete `agent/assembly.go`, `server/mcpdiscover.go`, server skill/MCP/prompt assembly `1–240` plus previously read resolver `239–323`, custom tools `331–480`, platform tool inventory `1–75`, goals `106–170`, fact/constraint/hint selected ranges `1305–1414,1564–1651` in `agent/tools.go`, and retrieval finder/library sections cited above. Method studies and relevant primary constraints were reopened; the previous audit retains broader source pins/coverage, including CE. No complete dependency/runtime certification is claimed. The prior 40-file snapshot manifest identifies source bytes; six selected source hashes were recomputed during this audit and matched recorded snapshot identities.

Only this report was added; paused custom UI prototypes, original research, source snapshots and failed/successful local receipts remain intact. Cass owns any integration implementation, configuration/admission decision, source gathering assignment or register update.
