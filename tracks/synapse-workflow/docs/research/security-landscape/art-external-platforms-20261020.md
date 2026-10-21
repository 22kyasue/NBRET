# ARTEX and Synapse CE: bounded implementation reading, 2026-10-20

This is source/documentation inspection for Kotaro's inventory decision, not a runtime benchmark, client assessment or recommendation to execute the projects. No upstream setup, tests, scanners, applications or deployments were run. Findings below apply to the saved revisions only.

## Synapse CE snapshot

Repository: https://github.com/KKloudTarus/synapse-ce. Local checkout: `C:/Users/kotar/githubprojects/synapse-ce`, revision `a55a314aab8eb6e5979f7d886c82a0729776949f`. Its name is unrelated to our Synapse initiative unless separately established. Top-level LICENSE is Apache-2.0. The October 20 context note preserves earlier release/CI observations; those are dated, not freshly reproduced claims.

Read: `docs/guide/features.md`, `installation.md`, documentation index, CLI dispatch portions of `cmd/synapse-cli/main.go`, the opening bounds/implementation descriptions in `internal/infrastructure/tools/sast/analyzer.go` and `secretscan/scanner.go`, OSV request/batching paths, and the complete `internal/usecase/exploitation/simulation.go`. Broader product modules were located but not exhaustively audited.

The source and documentation describe dependency inventories/advisory matching, secrets/configuration/source checks, optional language-specific reachability/taint analysis, findings/evidence/reporting, cloud-posture and runtime-agent modules. Presence and documented design do not establish accuracy, isolation, usable deployment or parity with mature commercial products.

### Chained execution is a rehearsal at this snapshot

The inspected exploitation SimulationExecutor performs no host action and returns a labelled simulated success; its verifier confirms rehearsal completion, not a real exploit. The source deliberately provides no real host executor in that module.

Source: `internal/usecase/exploitation/simulation.go:10–35,44–65`. `docs/guide/features.md:110–117` independently describes no-host rehearsal by default and a review-gated real-host extension point. This finding applies to that chained-exploitation/emulation lane, not every network scanner or optional response lane in the platform. The separate response-execution configuration exists and defaults false (`internal/platform/config/config.go:1199`); it was not audited end to end.

Implication: evaluate useful scanning and evidence modules separately. Do not equate a successful rehearsal chain or sealed simulation record with a demonstrated compromise. No chain, probe or agent was executed here.

### Pattern scanning and stronger analysis are distinct

The basic SAST analyzer is a bounded pattern scanner, with a 500-finding aggregate cap, 50 per file, a 1 MiB ordinary-file cap and skipped long/minified/generated/dependency content; it is not the separate call-graph or taint engine.

Source: `internal/infrastructure/tools/sast/analyzer.go:1–5,27–39,63–67`; `docs/guide/features.md:83–103`. The comments describe skips and retained warnings; no large-tree or precision measurement was repeated. Optional Python/JS taint modules are documented with distinct flags, sidecar requirements, proposals and incomplete-coverage states (`features.md:246–306`). Their runtime correctness was not evaluated.

Implication: report engine, configuration, skipped/truncated coverage and evidence type for each result. A basic pattern hit is a candidate and no-hit is not a complete semantic audit. Availability of optional stronger analysis does not make every scan use it.

## ARTEX on KrisPC

The fresh read-only inventory is `C:/Users/kotar/computeruse-inbox/krispc.tailca4ab9.ts.net-28600146/ARTEX-inventory.md`, with Git evidence alongside it. Checkout: `C:/Users/stake/synapse-security/artex-global`, origin https://github.com/jiwoochris/artex-global.git, revision `fdfb7a17b7da5e2de716c0e98475ec77a41c64c6`. The source is present; the previous dated not-found observation is no longer current.

Nine untracked files under `tools/local-cli-bridge` document a Codex/Claude CLI provider adapter. That inventory establishes files and documentation, not effectiveness, exact correspondence to the morning message or a full autonomous test. A second bounded source inspection supplies the detailed capability report separately. No standalone clain/Cline project was identified within the recorded search scope; its identity remains unknown.

### Provider restrictions and engine permissions are separate

The second report and 40 selected source files were retrieved under `C:/Users/kotar/computeruse-inbox/krispc.tailca4ab9.ts.net-010ce98d`. The archive was extracted with destination-containment checks to `source-review`. Cass independently read the complete bridge runner, guard admission path and worker option block; the broader role/tool/report matrix is attributed to the remote source inspection, whose SDK/runtime configuration coverage is explicitly limited.

ARTEX's worker selects SDK bypass permission mode while attaching its own optional interception hooks; the local bridge's read-only or empty-tool CLI flags do not constrain ARTEX's later tool dispatch.

Source: saved `agent/worker.go:429–473` selects `permission.ModeBypass`; `guard/guard.go:81–104` permits the call when no interceptor, no enabled interception or no matching/judged decision exists, while allow/deny/ask branches follow configured rules. This is inspected source behavior, not an observed escape or determination of the active database configuration. The underlying norma SDK and all possible execution paths were not audited.

The bridge (`tools/local-cli-bridge/runner.mjs:39–67,111–148`) starts provider CLIs with restrictive flags, supplies text history/tool schemas and parses a structured decision. Codex event validation happens after output is collected, so rejecting a native-tool event is not preventative enforcement. Actual CLI flag support and enforcement were not tested. The bridge does not implement scans or a target-scope sandbox; engine-side execution needs its own reviewed boundary.

## Existing research that constrains the comparison

`ai-evaluation.audit-evaluator-before-tester` (draft synthesis, framework.md:79–91) requires evaluating the scorer before comparing testers. `safety.capability-gate-outside-model` (component-lab, executable-claims.md:25) establishes selected gate decisions, not whole-host isolation. `commercial.evaluation-and-buyer-evidence-protocol` (synthesis, security-landscape/synthesis.md:72–74) requires matched access/budget and total labor, including failures. `service-delivery.instance-vs-class-repair` (component-lab) distinguishes a symptom repair from the broader rule. Those studies do not select a winning runtime or establish a paid service's viability.
