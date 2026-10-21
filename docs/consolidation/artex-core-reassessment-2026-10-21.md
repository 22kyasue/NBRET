# Reassessment with ARTEX as the core

2026-10-21, Cass. Current product direction from Kotaro: use ARTEX as the core application to evaluate, preserve our research and verification work, and add capabilities only where a demonstrated gap requires them. Custom competing monitoring prototypes remain paused. This document distinguishes source-supported architecture from unperformed runtime validation.

## Outcome and responsibility split

The intended product takes an authorized target and scope, investigates adaptively, makes its actual actions and evidence visible, and produces defensible findings and a client report. A URL is a starting point, not a promise of reachable privileged roles, database access or complete vulnerability coverage. No system here has demonstrated that it finds every hole.

| Responsibility | Starting point | What we should add only if missing |
| --- | --- | --- |
| Operator application | ARTEX dashboard, task/chat/workspace, native activity, traffic, findings and asset/exploration views | Small extensions to existing views or links to supporting evidence; no second dashboard. |
| Investigation and coordination | ARTEX goals/planner/workers/main agent, graph/fact lineage, configurable tools/skills/MCP | Our research-informed strategies, disconfirmation rules and observable coverage expectations. No parallel homegrown scheduler. |
| Model connection | ARTEX provider configuration and Kensei's saved CLI bridge candidate | Verify compatibility and actual available account access before selecting a connection. CLI flags do not constrain later engine tools. |
| Observation and specialist tools | ARTEX's installed tool/HTTP/proxy/MCP mechanisms first; our existing browser/network/source collectors where needed | Admit one collector/tool per measured gap; preserve native artifacts and omitted data. No blanket catalog installation. |
| Research knowledge | Existing register, corrections, hazards, studies and three upstream method reviews | A bounded read-only research interface or task/skill context with exact sources, applicable corrections, limits and disconfirming checks. |
| Effect verification | Existing identity-aware assessment, narrow effect oracle, journal and controlled targets | An evidence adapter from actual ARTEX receipts, plus additional effect-specific checks when a real test requires them. |
| Client presentation | Approved Synapse reader and actual evidence categories | A read-only import/projection of reviewed ARTEX outcomes; preserve raw upstream labels separately. ARTEX remains the operator UI. |
| Evaluation and learning | Local secure/ownership-gap controls, scorer mutations, measurement and failure records | Exercise ARTEX itself; then compare changes under matched access and effort. Our scripted local pass is not an ARTEX result. |

This is an integration plan, not a claim that these adapters are implemented or that the engine has passed admission.

## What the existing ARTEX application changes

The saved README identifies a Go service with an embedded Next.js frontend, PostgreSQL, same-origin API/SSE and native monitoring. Kotaro's supplied dashboard screenshot visibly contains tasks, chat, findings, traffic, tool runs, LLM records, assets, workspace and configuration areas. These are reasons to inspect and reuse the application, not evidence that every menu works in the current instance.

A fresh read of `web/package.json` at `fdfb7a17b7da5e2de716c0e98475ec77a41c64c6` identifies `artex-web` 2.2.0 and declared Next/React, table/chart/graph, component and theme dependencies. Dependency ranges are not an installed lockfile/version audit. The local saved 40-file snapshot is not a full runnable checkout. The known fuller checkout is on KrisPC; active build, database configuration, provider state and tool permissions remain unverified.

Sources: [pinned frontend package](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/web/package.json), [saved README](../../references/artex/fdfb7a17-local-cli/source/README.md), [deep dive](artex-deep-dive.md). Read-only source/document evidence; no engine, dependency installation or model execution in this reassessment.

## What to preserve and what to stop expanding

Preserve the controlled app and real local SMTP mailbox, secure/vulnerable cases, oracle rejection controls, immutable journal, identity-aware evidence logic, research register and canonical reader. They can validate ARTEX and protect report quality. Preserve the earlier API branch's richer capture/session/proxy/visual capabilities as candidate collectors; do not merge duplicate modules by filename.

Stop expanding the separate monitoring application, deterministic practice selector into a general engine, bespoke multi-agent scheduler, or automatic install-all tool catalog. The paused prototype files and provenance remain intact. A source access module or scanner may still be valuable, but only after a target and observed gap justify it.

## Where to gather useful intelligence and capability

| Source | Useful contribution around ARTEX | Admission limit |
| --- | --- | --- |
| Our 335-entry register, 203 corrections and 80 hazards | Prior implementation mistakes, evidence semantics, scope/stop lessons and versioned tool behavior | Cards route us to studies; retrieval rank is not truth or clearance. Not all entries are relevant, implemented or independently reproduced. |
| Actual ARTEX configuration, installed tools, frontend/API and norma SDK version | Establish what the existing engine really can execute, observe, export and stop | Inspect the actual version/configuration; do not infer enforcement from menus, tool binding labels or a container name. |
| Owner-provided business rules, API definitions, architecture and dedicated test identities | Expected permissions and workflow invariants, reachable feature map, meaningful consequences | Use only access genuinely supplied and authorized. URL-only and source-assisted assessment are different access conditions. |
| OWASP WSTG, versioned 4.2 guidance | Systematic testing objectives and method families for a coverage ledger | Method inventory does not prove all features were reachable or tested. Keep development 5.0 content distinct from the versioned baseline. |
| OWASP ASVS, current official 5.0.0 stable identity | Control requirements against which target-specific expectations can be stated | Many controls need internals/source/configuration. Do not mark them passed from a URL alone. |
| PortSwigger Web Security Academy | Worked explanations and practice in access control, authentication, business logic, API and browser behavior | Learning/public lab exposure is familiar training, not unseen evaluation; do not import an exploit recipe as authority to execute it. |
| Cloudflare audit skill | Source-audit question, coverage, strongest-counterexample and review discipline | Source-first workflow requires source; its validators do not establish actual effects. Adapt only the parts that fit the current access. |
| Autoresearch | Baseline-first, small versioned candidate changes, keep/reject learning | Preserve independent evaluation, complete failures and fixed authority. Do not optimize an agent's self-reported score or raw finding count. |
| Awesome-Hacking | Routes to specialist source projects and learning materials | The 81 catalog rows are unreviewed child-resource leads, not installed/validated capabilities. |
| Synapse CE and existing scanner/capture research | Selected source/dependency/configuration analysis or other specialist functions when scope requires them | URL-only access does not supply server source. CE's simulated chain lane is not a real exploit; its real scanner/loop source must not be dismissed wholesale as simulation. |
| Product advisories and maintainer documentation for observed components | Version-specific hypotheses and fixes tied to a real observed technology | Fingerprints can be wrong; a matching advisory is a lead until applicability and effect are checked. Preserve publication and component versions. |

Official method pages checked 2026-10-21: [WSTG project](https://owasp.org/projects/web-security-testing-guide), [ASVS project](https://owasp.org/projects/asvs), [PortSwigger topics](https://portswigger.net/web-security/all-topics). These are methodology/learning sources, not measured evidence that adding them improves this engine. The three-repository reviews and limits are already in the research register; this table does not duplicate them as new performance findings.

## How research should enter a run

For each selected hypothesis, retain the actual observations that motivated it, a short user-facing rationale, exact research IDs/source passages and corrections, applicable access/state assumptions, a predicted observation and disconfirming control. The engine should be able to retrieve more detail when needed without dumping every study into its prompt.

Separate three kinds of information: prior research; observations from this target/run; and claims independently checked against the target. Do not preload research cards as confirmed target facts. At the inspected pin, `recordOneFact` requires a nonempty summary, treats evidence as optional, and writes a fact node with status `confirmed` ([source](../../references/artex/fdfb7a17-local-cli/source/agent/tools.go):1316–1344). That describes native fact-record semantics, not a demonstrated exploit or a failure of every ARTEX finding check. Native graph/finding statuses must remain visible as upstream declarations; they are not silently promoted to independent verification. Hazard/correction lookup must use cited source relationships as well as ranked search; absence from a short result list is not clearance.

Coverage should retain discovered features/identities/states, selected checks, actual executions, blocked or unsupported paths, evidence omissions, inconclusive claims and justified deferrals. No aggregate percentage should imply knowledge of all unknown vulnerabilities. Useful intelligence includes knowing that a technique is inappropriate or not yet testable.

## First acceptance sequence using ARTEX itself

1. **Inspect the product:** locate the complete pinned engine/frontend and actual configuration; verify the UI is connected to the real backend rather than its optional mock-data branch. Walk dashboard, tasks, chat, activity, traffic and native evidence/export. Identify existing configuration and extension paths before changing code.
2. **Prove the connection without target execution:** with existing available resources, verify the selected model connection can return a representative structured tool decision against an inert stub. Do not dispatch an engine tool before execution admission. Preserve unsupported schemas, queue/cold-start failures and usage limits; do not assume entitlement or free API access.
3. **Admit execution:** verify actual filesystem/network/tool authority, request budgets and stop behavior across default tools, custom tools, MCP and enrichment. A prompt or provider CLI read-only flag cannot supply the engine boundary.
4. **Run our owned controls through ARTEX:** first use a labeled scripted baseline to prove the exact admitted execution/collection path works. Then give ARTEX the admitted starting URL and allowed mailbox capability without feeding that scripted request sequence. Retain every action, actual identity and complete/incomplete artifact. Freeze ARTEX's submission before a reviewer collects later controls or replay; reviewer work must not backfill a missed engine discovery. Reproduce a real claimed effect using the existing oracle and legitimate controls; a no-finding run remains valid.
5. **Exercise native monitoring and export:** verify the UI shows actual emitted activity, useful short rationale/research context, interruptions, unsupported branches and evidence links. Import outcomes into the existing journal/reader without changing their uncertainty or inventing a repaired-build result.
6. **Then use the authorized real-site scope:** Kotaro selected `tobirastudio.com`. Begin with its fresh public read-only map and observed behavior; do not invent signup, roles or an admin ladder. Do not submit contact forms or expand to third-party assets as a side effect of this first public slice.

Network topology is a real dependency: our current app/mail bind to `127.0.0.1` on Kotaro's PC; an engine on KrisPC or in another container/namespace does not reach them by the same URL. Prefer a co-located controlled fixture/executor for the first exercise, or separately admit a specific bounded route. Do not solve this by exposing the fixture publicly or assuming a tunnel establishes scope.

These are acceptance gates, not an instruction to run historical stopped labs, execute upstream setup scripts, call paid providers or start an unrestricted live-site agent. No actual ARTEX discovery or stop result is established yet.

## Evidence basis and decision criteria

Research used: `agent-runtime.artex-cli-bridge-not-engine-permission-boundary` (pinned source); `evidence-handling.e01-offline-identity-ambiguity` and attached still-present correction (narrow component evidence, separate identity-aware path exists); `authorization.deceptive-403-status-only-oracle-fails` (known fixture controls, not tool recall); `ai-evaluation.audit-evaluator-before-tester` and `commercial.evaluation-and-buyer-evidence-protocol` (proposed evaluation synthesis); `service-delivery.rea-integration-order` (existing-first integration proposal). Cited study passages were read. The local 72-test result validates selected engineering/control behavior, not ARTEX or arbitrary-site discovery.

Success means the existing engine performs observation-dependent investigation, produces reviewable effects/controls, preserves uncertainty and permits useful monitoring and verified stop. Replaying our known script is valid for the separately labeled plumbing baseline; it fails to establish the discovery lane. Undeclared privileged clues invalidate the corresponding comparison. Treating native status as truth, losing artifacts/identity or failing to stop admitted work are separate acceptance failures. Only a demonstrated gap should trigger an additional adapter or targeted fork patch; the default is configuration and reuse.

Detailed admitted maps: [Thistle's existing capability and extension map](../../tracks/synapse-workflow/docs/synapse/artex-core-capability-map-thistle.md), [Ginger's research integration and gathering map](../../tracks/synapse-workflow/docs/synapse/artex-core-research-integration-ginger.md), [Iris's minimal ARTEX acceptance experiment](../../tracks/synapse-workflow/docs/synapse/artex-core-evaluation-iris.md). These are source-based reevaluation, not runtime certification. The newly registered fact-status distinction is in [the short source study](../../tracks/synapse-workflow/docs/research/security-landscape/artex-core-integration-20261021.md).
