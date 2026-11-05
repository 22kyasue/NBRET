# ARTEX live installation and takeover

Owner: Rook. Observed 2026-10-21, approximately 17:48–18:00 UTC. Kotaro explicitly requested taking over from departed sessions, incorporating KrisPC advancements, and making the existing ARTEX foundation usable. He subsequently authorized provisioning its login.

## Working installation

- Existing KrisPC Docker installation retained, without container restart, rebuild, upgrade or task migration. ARTEX `v0.3.15-global.1`, image label `d6964594...`, checkout `fdfb7a17...`; earlier version reconciliation remains applicable.
- ARTEX and PostgreSQL freshly observed running for 14 hours; PostgreSQL healthy. ARTEX publishes only KrisPC loopback 18787/18788.
- A loopback SSH tunnel makes the operator interface accessible on Kotaro's PC at `http://127.0.0.1:18787/`. This depends on the current tunnel, KrisPC and the tailnet connection; it is not public hosting or an installed auto-reconnect service. Current exec tunnel session: `40307`.
- Sole task-owned browser tab `3E0987D314BC56C5E15F88088FBE181D`, window `1246080`, kept for Kotaro's review. Existing unrelated tabs preserved.
- Login username is `ARTEX`. Newly generated password is stored in Windows Credential Manager under `computeruse/127.0.0.1/ARTEX`; no plaintext password in this repository or conversation. User-authorized reset follows the upstream reset-password script's pgcrypto/bcrypt upsert mechanism. Prior verifier retained in a separate OS-vault recovery entry. Login API and actual UI authentication succeeded without service restart. Existing sessions are invalidated by the password reset.
- Local CLI bridge was offline. Started with its existing `tools/local-cli-bridge/start.ps1`; PID `42168`, loopback `127.0.0.1:18789`, authenticated health verified by launcher. It remains a separately managed process, with no newly installed boot persistence.

## Effective configuration: actual read-only DB observations

Used existing container psql, read-only transaction, five-second statement timeout, explicit selected columns and ROLLBACK. No keys, full endpoint URLs, prompts, task descriptions, MCP args/env or other free-text content dumped.

| Item | Observation |
| --- | --- |
| Model profiles | Two OpenAI-format profiles: Local codex subscription / `local-codex`, default; Local claude subscription / `local-claude`, not default. Both exclude rotation and disable streaming. |
| Tasks | Zero before setup checks; zero after the initial chat check. |
| Agent roles | Eight enabled: auto, goals, mainagent, pentest, planner, reporter, retester, worker. No explicit profile binding; max_turns 0; run_seconds 1200 except pentest 0. Zero values must not be described as finite limits. |
| Registered native tools | 51 enabled builtin tool records. This is registration state, not proof every underlying SDK/tool lane works. |
| MCP | ScopeSentry HTTP disabled; browser stdio disabled. Neither enabled or refreshed here. |
| Intercepts | 19 enabled deny rules, one disabled deny rule. Bodies not read; this count does not prove scope enforcement. |
| Worker/task limits | No saved values for workers/task_concurrency_enabled/task_concurrency_limit/llm_pool_enabled/llm_pool_bind_fallback. Label-matched source defaults workers to 3, task concurrency cap off, model pool off; not an independent execution-limit measurement. |

## Fresh runtime evidence

Native ARTEX conversation `3`, `http://127.0.0.1:18787/chat/?c=3`, contains the setup-only instruction and actual returned string `ARTEX is alive — Rook 2026-10-21.`. The UI completed the call, removed Running/Streaming status, and displayed one model invocation. This verifies UI → ARTEX → configured Codex bridge → model → saved UI response. It is not an investigation, target test, finding, tool-effect or safety-boundary result.

Dashboard freshly displayed zero tasks/findings/assets/traffic, traffic capture off, configured LLM and active `local-codex`. Displayed total tokens include prior setup conversations plus these checks; token totals are not investigation results or billing receipts.

Second native check in the same conversation completed one `list_tasks {}` call, visibly marked successful, followed by `There are 0 current tasks.`. The conversation showed three cumulative model invocations (one initial response, then tool selection and tool-result response), with Running/Streaming cleared. This is a fresh ARTEX-selected native read-only tool round trip, consistent with the independent DB task count. It does not establish shell/browser execution, investigation discovery or stop enforcement.

## KrisPC / Mac advancements incorporated into understanding

Read KrisPC `handoff/juniper-20261022/START_HERE.md` and `rulebook.md`, and received Hawk's inventory/schema/export handoff. Nine untracked Windows bridge files remain preserved. Mac-only startup scripts and the provider-refusal error-classification patch have not been synchronized to KrisPC. Mac connection/Read-tool/stop tests are attributed Mac observations, not fresh KrisPC results. No refusal bypass or provider switching performed here.

Retain the rulebook's direction: autonomous work inside an approved plan, human approval for expansion/important changes, enforceable limits and stop, evidence and retest. Proposed three-layer rules UI remains a design; do not build a second dashboard merely to represent it. The observed source's automatic unfinished-task resume is an explicit gap against that rulebook, although this database currently has no tasks.

## Concrete next gaps

1. Native read-only tool round trip is now demonstrated. Next is an isolated owned investigation with actual effects and stop observations. Connection/tool success is the first milestone only.
2. Decide which observation lane is needed before enabling browser/ScopeSentry or adding tools. Capture is currently off.
3. Verify actual scope, budgets, cancellation and startup-resume behavior for enabled lanes against the operating rulebook.
4. Supply relevant existing research through native skills/context, then manually map a real native artifact into the canonical Synapse reader. No new retrieval server, report adapter, memory store or orchestration engine is selected.
5. Reconcile the Mac refusal-reporting fix and version differences as bounded changes with tests; preserve provenance. Robust startup/reconnect and backup/restore remain operational work.

No client/TOBIRA target assessment, scanner installation, production deployment or external contact was performed.
