# ARTEX: system understanding and actual-installation inventory

Aiko coordinating Thistle, Ginger, Iris and a narrowly scoped read-only inventory request to Hawk on KrisPC. Opened 2026-10-21 after Kotaro asked to continue and understand the whole platform. This is the working understanding ledger, not a claim every dependency or runtime behavior has been verified.

The maintained main plan is now [SYNAPSE-PLATFORM.md](../SYNAPSE-PLATFORM.md). This ledger supplies supporting coverage detail. Hawk's completed installation receipt and Thistle's completed version reconciliation are aggregated in that main file, superseding the pending language in the original inventory entries below.

## What must be understood

The complete chain is: authorized assessment question and access -> ARTEX task/settings -> model decision -> engine/tool dispatch -> actual observations -> graph/finding/evidence state -> effect/reviewer judgment -> client report -> remediation/retest -> stopped/reset resources. Deployment, authentication, storage, secret handling, budgets, research context and failure recovery support every step. A weakness in one layer cannot be repaired by a confident label at another.

Separate evidence classes throughout: **source-read**, **historical observation**, **fresh installation metadata**, **fresh runtime effect**, **unknown**. Reading source explains mechanisms; it does not prove the active instance uses that source/configuration. A captured response explains one action; it does not establish all-site coverage. Unknown is an open item, not a negative result.

## Architecture in plain language

ARTEX is the operator application and investigation engine. Its task/goal/intent graph represents what it is trying and what it thinks it learned. Planners and workers use model decisions to select actions. Norma supplies underlying agent/tool/session machinery. The configured model may be reached directly or through the separately added local CLI bridge. The bridge returns decisions; ARTEX still runs the selected tools with ARTEX's authority.

Tools may use shell/files, HTTP, custom Python/command handlers, MCP processes, browsers and background enrichment. Those routes have different data and lifecycle behavior. Tool schema validation, model permission flags, process working directory, recording proxy and engagement scope are different controls; none implies the others.

ARTEX already stores versioned traffic/evidence/report artifacts. Our research should guide investigation hypotheses and checks; it must not be inserted as though observed on the target. Our effect verification and canonical reader can review/present actual outcomes, initially by explicit manual mapping. No new software is selected by this ledger.

## Existing source and observation coverage

| Layer | What is already established | What remains to establish |
| --- | --- | --- |
| Product/source identity | ARTEX Global source pin `fdfb7a17b7da5e2de716c0e98475ec77a41c64c6`; declared Norma v0.4.3 commit `320ae32989da97dd91469bb89164cbfe87d83d5d`; preserved selected files | Exact active binary/image, non-mock frontend, deployed modifications and dependency correspondence |
| Operator application | Native task/chat, worker activity, traffic/findings, settings, graph and evidence/report API paths are source-read | Actual accessible instance, active account privileges and what each configured view exposes |
| Intake/access | Goals, constraints, scope/assets and task context exist | Target-specific business policy; URL-only versus source-assisted inputs; accounts, inbox and authorized effects |
| Planning/control | Planner/workers/main-agent use graph and tool results | Effective role/profile bindings, prompts/context and budgets; actual observation-dependent choices |
| Model connection | Native provider configuration and separately preserved Codex/Claude CLI bridge source | Current active profile/bridge process/version/tool-schema compatibility and accounted use |
| Tool dispatch | Norma explicit deny/hard-deny and later hooks are source-read; worker bypass does not mean no checks | Effective hooks/rules, exact enabled lanes and executor/network/secret authority |
| Observation paths | HTTP/proxy, shell/files, custom tools, MCP and enrichment source paths exist | Which are active/installed; redirect/subrequest/identity behavior; completeness and side effects |
| State/memory | Native graph/facts, transcript resume/compaction and optional SDK memory exist | What is enabled; retrieval provenance, staleness, poisoned-input handling and secret retention |
| Storage/evidence | Hash/length checked blobs and frozen traffic/finding/report versions exist | Existing neutral export; raw versus normalized/redacted fields, missing bodies and identity/build bindings |
| Truth/review | Native confirmation is not equivalent to independent effect; owned six-receipt oracle exists for one order rule | Case-specific policy/effect checks, actual controls and independent authority appropriate to the claim |
| Report/retest | Native report/retest plus approved Synapse reader code exist | Actual manual mapping, omitted/negative/inconclusive states, source-version linkage and real repair evidence |
| Stop/recovery | Chat stop, task pause, individual work cancellation, deletion and supervisor shutdown have distinct source behavior | Named effective stop operation; managed/background/MCP/process/queue drain and external effects |
| Deployment/operations | Go/embedded frontend/PostgreSQL, container/bootstrap/config source reviewed | Machine/namespace, mounts/listeners/user/restart policy, datastore/configuration identity and operational owner |
| Evaluation/cost | Guided local controls and prior research counterexamples exist | ARTEX engine outcomes, total model/tool/setup/reviewer spend and a fair later comparison |

Exact source links and read-scope limitations: [ARTEX deep baseline](../../tracks/synapse-workflow/docs/research/security-landscape/platform-baselines-20261021/artex-deep-baseline.md), [prior capability map](../../tracks/synapse-workflow/docs/synapse/artex-core-capability-map-thistle.md), [decision brief](artex-research-decision-2026-10-21.md). Other platform studies supply method comparisons, not proof of these ARTEX runtime properties.

## Local and cross-PC inventory: observed versus pending

Fresh local observation on 2026-10-21: top-level project directories matching ARTEX/Synapse/NBRET contained `NBRET`, `NBRET-api-investigation`, `NBRET-consolidation-backups` and `synapse-ce`. No matching `artex` process was returned by a name-filtered process query; `Get-Command docker` returned no command. These are narrow local observations, not an exhaustive disk/service inventory or a statement about KrisPC.

The preserved earlier [inventory source study](../../tracks/synapse-workflow/docs/research/security-landscape/art-external-platforms-20261020.md) links `C:/Users/kotar/computeruse-inbox/krispc.tailca4ab9.ts.net-28600146/ARTEX-inventory.md`. That saved receipt reports a full nested checkout at `C:/Users/stake/synapse-security/artex-global`, branch `feat/local-cli-providers`, the pinned HEAD, nine untracked bridge files and a documented image/Compose project. It did not inspect active settings or running service state. It supersedes old engine-not-found language but is historical.

Fresh Kokuban inventory found Hawk's existing KrisPC session had separately reported a Docker ARTEX response/title at `127.0.0.1:18787` roughly two hours earlier. This is a second-hand historical service observation, not a fresh response checked here. Hawk also referred to Mac launch/bridge work: that is a separate installation lineage, not interchangeable with KrisPC Docker. No Mac action has been requested by this inventory.

Hawk has been assigned a read-only receipt for the existing KrisPC checkout and containers: hashes/versions/status, filtered image/port/mount/user/restart metadata, available nonsecret profile/tool/skill/MCP/limit metadata and an already saved neutral export/schema. No service launch/restart, container execution, database content, broad environment dump, credentials, browser, target requests, model/profile test or MCP refresh is requested. Pending receipt must be integrated before treating actual settings as known.

Hawk's preliminary fresh metadata, observed 2026-10-22 02:33 JST (2026-10-21 17:33 UTC), reports ARTEX and PostgreSQL containers running, checkout `fdfb7a17b7da5e2de716c0e98475ec77a41c64c6`, and image revision label **`d6964594a0221cd921b85056d604bce9d8ce54df`**. This differs from the reviewed checkout. The label is metadata, not independent proof the binary matches that source. Nine untracked bridge files remain. Active database-backed profile/tool/budget state is still unknown. Detailed filtered metadata and a bounded source-difference review are pending; never silently treat the reviewed pin as the deployed build.

## Source coverage gaps, explicitly retained

Thistle returned a twelve-subsystem source coverage matrix. Its unresolved **source** questions are not silently marked complete by the seven comparison studies:

- Database migrations, backup/restore consistency and full artifact import/archive/garbage-collection behavior.
- Every API handler's ownership/authentication checks, CSRF/log redaction and actual reviewer privilege separation.
- Full provider pool/failover/schema/retry and settlement accounting.
- All scheduler readiness/fairness/stall/retry/completion paths.
- Interceptor matching/judge/race behavior and dispatch paths outside reviewed hooks.
- Every shell/PTY/custom-tool descendant and network cleanup path.
- Underlying skill loader, deferred tools and all MCP HTTP/SSE transport behavior.
- Complete proxy/TLS/redirect/no-proxy/browser lifecycle and background enrichment policy.
- Self-update and global shutdown joins across managed work, MCP and enrichment.
- Memory activation/ranking/compaction, cross-task leakage and evidence-kind retention.
- All UI states, staleness/reconnect behavior, notification connectors and asset synchronization.

These remain on the understanding map. Prioritize them against the actual deployed revision and enabled lanes so source-reading conclusions apply to the system in use. Unused capabilities remain documented unknowns rather than becoming hidden assumptions or automatic install/build tasks.

## Research-to-decision map

Ginger's source reconciliation separates intelligence, authority and truth:

| Research role | Existing seam/support | Required interpretation |
| --- | --- | --- |
| Guidance | Filesystem skills/Skill, role visibility, seeded prompts with database overrides, goals/hints | Methods influence choices; they do not grant permission or establish target facts. Active override/visibility state is unknown. |
| Retrieval | Existing corpus finder/register and attached studies/corrections/hazards | Ranked corrections/hazards are capped in displayed search results; no hit is not clearance. Read underlying sources and applicable attached records. No new retriever selected yet. |
| Memory | Native graph/intents/traces, optional Norma memory/relevance injection | Memory is contextual state, not independently learned truth. Never preload research as target-confirmed fact. |
| Method improvement | Cloudflare strongest-counterexample discipline; autoresearch baseline/one-change/retention; source catalogs for discovery | Preserve source-access assumptions, failed attempts and independent scoring. Validators/candidate scores/catalog presence are not admission or effect proof. |
| Effect/report | Native hash/version bindings, existing narrow effect controls, canonical reader | Status, grounded quote, schema and digest do not replace actor/object/policy/build/effect evidence. Manual mapping can precede automation. |

Exact source/correction pointers: [research integration study](../../tracks/synapse-workflow/docs/synapse/artex-core-research-integration-ginger.md), [method repository studies](../../tracks/synapse-workflow/docs/research/security-landscape/repository-reviews-20261021/README.md), [research usage guide](../../tracks/synapse-workflow/docs/research/reconciliation/USE-RESEARCH.md), and the [platform index](../../tracks/synapse-workflow/docs/research/security-landscape/platform-baselines-20261021/README.md). Their older wrapper proposals remain conditional under the current decision brief.

Iris's completed [input-to-client-report map](../../tracks/synapse-workflow/docs/research/security-landscape/platform-baselines-20261021/input-to-client-report-iris.md) covers eight stages with exact source pointers, current support, missing verification and user-visible outcomes. It preserves finding/node ID differences, versioned artifacts, frozen discovery versus review replay, bounded effects, review authority, canonical reader, changed-build retest and actual cleanup. The matrix is integrated into the main living plan; it does not require an automated adapter.

## Completion of this understanding pass

For each intended workflow decision, retain the exact applicable source/configuration version, known mechanism, contradictory/limiting evidence, unresolved predicate and the smallest observation needed to settle it. Distinguish a missing preference, missing resource, unread source path and unmeasured effect. None should be disguised as a need to build a new subsystem.

We have not claimed every line/dependency is read or that source review proves runtime safety/effectiveness. The objective is a complete map of the working system and its explicit unknowns, then evidence to close each relevant unknown.

## Continuing sequence

First close the actual-installation metadata gaps. In parallel, the three source reviewers map native subsystem coverage, research applicability and input-to-report evidence. Their task is to explain existing mechanisms and finite missing questions, without another round of tool shopping or implementation.

Then classify each remaining question by how it can be answered: existing source, passive configuration metadata, saved neutral artifact, or a separately scoped runtime observation. Reading cannot settle an empirical effect or prove complete stopping; a runtime test cannot supply an absent business policy. Preserve the distinction rather than forcing every question into a code task.

No new implementation, provider request, target action, service mutation or stopped-operation retry has occurred in this inventory. No browser tab was opened.
