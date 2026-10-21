# ARTEX: what we know and what we must prove

Reconciled source review, 2026-10-20 Pacific. Pin: `fdfb7a17b7da5e2de716c0e98475ec77a41c64c6`, configured origin https://github.com/jiwoochris/artex-global.git. Nine local bridge files are untracked additions, not contents of that commit. This document deepens the existing review by tracing the selected execution/admission/evidence paths; no application or model was launched.

## What kind of system this is

ARTEX is a model-directed investigation/execution framework. It supplies planning, workers, tools, storage and presentation. A model chooses investigative actions; installed tools perform them. It is not a deterministic scanner with an exhaustive fixed vulnerability-class list, a proven customer-environment replica or a validated business-loss model.

The model/provider, tool registry, agent bindings, skills/MCPs, runtime privileges and interception rules determine the actual capability. Source inspection cannot certify the current active database/settings or successful operation of the deployed instance.

## Trace from goal to report

| Stage | Observed implementation | What it means for our evaluation |
| --- | --- | --- |
| Task description | `agent/goals.go:110–158` takes text goals/context and supplies goal/constraint tools, optionally asset-scope extraction. | A scope extracted by a model is a proposal/record, not an externally enforced destination boundary. |
| Scheduling | `server/engine.go:775–810` registers one planner and N worker loops, checks readiness, and avoids duplicate task starts. Later planner/worker loops claim graph intents. | Agent count does not establish independent reasoning or better results. Freeze worker counts and budgets in comparisons. |
| Worker execution | `agent/worker.go:373–381,429–473` uses general SDK tools and domain helpers, sets a working directory and SDK bypass permission mode, and attaches configured hooks. | Real commands/files/web actions are possible. A working directory is not a filesystem jail. The underlying norma SDK is outside this selected-source audit. |
| Tool assembly | `server/assembly.go:239–323` reads database tool rows, filters known disabled/unbound entries and augments tools. On table-read failure it returns the input list; tools without a database row pass through. | A UI disabled-tools list is not a complete fail-closed boundary. Outer enforcement must cover SDK, custom tools, MCPs and engine-side activity. |
| Interception | `guard/guard.go:1–7,81–132` says the prior scope mechanism was removed. No interceptor / disabled interception / unmatched unjudged call is allowed; configured allow/deny/ask decisions otherwise apply. | We have not established active rules. Review and test the actual execution policy rather than inferring protection from the word guard. |
| Asset enrichment | `enrich/enrich.go:180–249` performs DNS resolution and HTTP GET metadata collection outside a model tool decision. | Preventing only model-selected commands would miss engine-side requests. Network enforcement must include enrichment and redirects/resolution behavior. |
| Finding capture | `agent/finding_workflow.go:13–80` treats traffic binding as configurable/optional and changes schemas/tools when disabled. | Preserve the difference between a model's assertion, stored text, a traffic binding and an independently established effect. Do not invent missing HTTP proof for non-HTTP findings. |
| Reports and retest | Report Markdown/CSV and finding-retest workflows are implemented in `report/` and `server/finding_retests.go`. | Report completion or a new retest execution is not a matched repaired-build result. Use our explicit effect/retest contracts. |

These are source-path observations, not observed production vulnerabilities or a complete safety audit. Positive features coexist: configurable deny/ask hooks, structured findings, graph history and traffic/body integrity checks. Their effective coverage still needs runtime validation.

## Kensei's bridge, step by step

1. ARTEX uses an OpenAI Chat Completions-shaped request with history and tool schemas.
2. The local loopback service authenticates the caller with a bearer token, limits request size, validates supported fields and queues one call per provider.
3. It flattens history/schema data into a text prompt and starts the existing logged-in Codex or Claude CLI. It does not log into providers itself.
4. The CLI is asked for structured content/tool-call decisions with native execution disabled/restricted via flags.
5. The bridge validates returned function names and argument objects, then sends OpenAI-shaped tool calls back.
6. ARTEX executes those tools through its own runtime and supplies their results in the next request.

The source includes text-only support, limited JSON Schema, one active call and four waiting calls per provider, a 120-second request budget, generic error handling, token accounting and buffered SSE-shaped responses. It has no live token streaming, persistent conversation state, image translation, new vulnerability detector or independent target verifier. Incoming arbitrary model sampling/token settings are not generally forwarded to the CLI.

This means multiple ARTEX workers do not automatically get multiple simultaneous Codex decisions through this bridge: same-provider requests serialize, and each turn starts a fresh CLI process with resupplied history. Cold-start/queue time consumes the request budget. Measure that overhead and queue failures separately from the investigator's reasoning quality.

Codex has a temporary request directory and restrictive flags; Claude is launched with empty tools and strict MCP/safe settings. Flag support/enforcement are properties of the actual installed CLIs and remain untested here. Checking Codex output for native-tool events happens after the child finishes; it cannot undo earlier effects. Child termination has no demonstrated descendant-tree kill guarantee. These restrictions do not govern the ARTEX tool call returned afterward.

“Local bridge” describes where translation runs. Model requests/history still pass through provider CLIs and their configured services. The bridge does not redact supplied history or prove account entitlement/billing. No paid API fallback is implemented in the inspected bridge, but account/billing state was not verified.

## Practical strengths to evaluate

- Goal-driven exploration and hypothesis selection could reduce manual coordination.
- Parallel workers, retained graph/facts and human steering could support broader investigation than our fixed practice selector.
- Existing tool/skill/MCP integration could avoid writing every scanner wrapper ourselves.
- Finding/trace/traffic records could supply useful source artifacts for our existing journal and canonical reader.
- The CLI bridge may let us evaluate those capabilities with already configured programs, subject to verified access and usage limits.

None of these establishes improved discovery, lower analyst effort or client readiness. Those are the performance hypotheses in the benchmark plan.

## Admission gates before a real autonomous trial

| Gate | Required observation | Current status |
| --- | --- | --- |
| Complete reproducible build/config | Full pinned source/image, bridge file hashes, SDK version, installed tools/provider versions, active tool/agent/rule configuration, reproducible clean startup. Do not collect tokens/secret values into Git. | Selected source and bridge preserved; full runnable stack and current active configuration unverified. |
| Network and filesystem boundaries | Investigator cannot access host/key/management/other targets through shell, custom tools, MCP, enrichment or alternate routes; legitimate lab access still works. Validate with harmless synthetic canaries and effective configuration. | Not established. No sandbox or VM configured in this task. |
| Bridge compatibility | Representative real ARTEX tool schemas/history fit the limited validator; provider login/model calls work; unsupported fields fail visibly; cold-start, queue and cancellation behavior retained. | Mocked test source and historical author's smoke claims only. No current live validation. |
| Evidence export | Preserve exact tool/run/task/intent/finding IDs, original transcript/artifact bytes, identities/builds, proxy coverage, partial/error/simulation states and source digests. | Source capabilities located; neutral import adapter not implemented. |
| Actual effects | Independent rule-specific observations and legitimate controls support a selected finding; report prose alone cannot pass. | Existing Synapse has one narrow work-order read predicate, not a general ARTEX verifier. |
| Stop/reset | No new pickup, active requests/processes settle or terminate under a hard limit, pending work cannot replay after reset, fixtures return to known state and owned resources close. | Code paths exist; end-to-end quiescence/reset not tested for ARTEX. |
| Fair scoring | Frozen task/scorer versions, matched information/budget, independent custody and retained failures/review burden. | Design exists; no admitted comparative trial. |

Do not run ARTEX against a live site to close these gates. The first execution, once scoped, belongs in the owned isolated lab. Existing stopped tests stay excluded.

## Saved evidence and next deep reading

The [detailed remote inspection](../../references/artex/fdfb7a17-local-cli/ARTEX-CAPABILITIES.md) contains the role/tool inventories and explicit limitations. Its original `sources/` links refer to the remote delivery layout; in this consolidated tree the actual selected originals are under [source](../../references/artex/fdfb7a17-local-cli/source/README.md), with [hash list](../../references/artex/fdfb7a17-local-cli/SOURCE-MANIFEST.txt). All 40 copies were hash-checked during import. All nine bridge files are present; this is not a full engine checkout.

Next source audit should cover the actual norma tool executors, interception-rule evaluation, subprocess/environment behavior, HTTP redirects/DNS/egress, task cancellation/process cleanup, and authoritative finding/traffic export. Read at the pinned versions before designing an adapter. Do not infer behavior from the latest online documentation or a Docker label.

Research basis: existing `agent-runtime.artex-cli-bridge-not-engine-permission-boundary` (source-trace); `safety.capability-gate-outside-model` (component-lab, not OS isolation); `ai-evaluation.audit-evaluator-before-tester` and `commercial.evaluation-and-buyer-evidence-protocol` (draft synthesis). Relevant studies/corrections are in the preserved research register. This document reconciles already recorded source observations; no new runtime finding or effectiveness result is claimed.
