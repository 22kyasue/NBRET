# AI agent runtimes and SDKs: permissions, sandboxing, budgets, memory

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 27 findings, 46 related corrections, 10 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.ce-gateway-continuation-priorities`** [assessment-evidence/continuation-exhaustion.md:801](../../assessment-evidence/continuation-exhaustion.md#L801): An agent could resume the 8,622-line Swagger and binary-asset reading as if it were the active task. **Instead:** Only if Kotaro requests it; the review ended at a user-approved cutoff (continuation-exhaustion.md:799).
- **`hazard.ce-outdated-next-queue-model-write`** [assessment-evidence/continuation-exhaustion.md:94](../../assessment-evidence/continuation-exhaustion.md#L94): An agent may rerun an already completed admission fixture as a 'next step'. **Instead:** Already done and passed (continuation-exhaustion.md:104); do not rerun for volume (continuation-exhaustion.md:147).
- **`hazard.openfga-container-tests`** [assessment-evidence/continuation-exhaustion.md:283](../../assessment-evidence/continuation-exhaustion.md#L283): Running OpenFGA Postgres/MySQL package tests publishes all container ports and modifies replication auth, plus package-wide cleanup. **Instead:** Use the inert-driver approach (continuation-exhaustion.md:257) unless a fixture/ownership review is done and the user approves.
- **`hazard.openfga-recovery-channel-close-stopped`** [assessment-evidence/continuation-exhaustion.md:334](../../assessment-evidence/continuation-exhaustion.md#L334): An agent might design an equivalent recovery, panic or channel-close fixture for OpenFGA to close an open question. **Instead:** Permanently stopped for this scope (continuation-exhaustion.md:360, :799); see docs/research/safety-context/README.md:15 (Agate pause, cause unknown). Do not reproduce by another route.
- **`hazard.scope-closure-redis-integration`** [bots-swarms/scope-closure.md:22](../../bots-swarms/scope-closure.md#L22): Reading the "what would resolve it" column as a to-do to stand up Redis/Postgres/Go integrations. **Instead:** These are conditions for future, separately authorized work; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them").
- **`hazard.sdk-copy-mode-force-replace`** [assessment-evidence/sdk-boundaries-continuation.md:62](../../assessment-evidence/sdk-boundaries-continuation.md#L62): Testing skill copy mode on a real workspace can replace real directories. **Instead:** Only use fresh owned temp trees (sdk-boundaries-continuation.md:62).
- **`hazard.sdk-credential-lab`** [assessment-evidence/sdk-boundaries-continuation.md:80](../../assessment-evidence/sdk-boundaries-continuation.md#L80): A credential-copy lab without overriding config sources would copy the user's real agent credentials. **Instead:** Follow sdk-boundaries-continuation.md:80: synthetic config dir and owned temp-root deletion checks.
- **`hazard.sdk-live-backend-tests`** [assessment-evidence/sdk-boundaries-continuation.md:531](../../assessment-evidence/sdk-boundaries-continuation.md#L531): Running the Claude SDK live Redis/S3 tests would use configured credentials and destructive teardown against real buckets. **Instead:** Do not inspect credentials or contact configured services (continuation-exhaustion.md:360).
- **`hazard.sdk-live-scripts`** [assessment-evidence/sdk-boundaries-continuation.md:64](../../assessment-evidence/sdk-boundaries-continuation.md#L64): Running wrapper live scripts makes paid provider calls with real credentials and deletes workspaces. **Instead:** Source only; historical plan steps are not authorization (sdk-boundaries-continuation.md:60).
- **`hazard.sdk-tests-visible-windows`** [assessment-evidence/sdk-boundaries-continuation.md:125](../../assessment-evidence/sdk-boundaries-continuation.md#L125): Running these transport tests opens console windows on the user's monitor. **Instead:** Do not run without hidden-window adaptation (user CLAUDE.md no-terminal-popup rule).

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [Codex SDK router discards a turn completion that arrives before turn registration](#agent-runtimecodex-early-completion-lost) | component-lab | operations, ai-evaluation |
| [Agent wrapper silently drops the max_turns budget for the Codex backend](#agent-runtimecodex-wrapper-drops-max-turns) | component-lab | operations, ai-evaluation |
| [Claude transport ends silently on an incomplete JSON tail when the process exits 0](#agent-runtimeeof-incomplete-tail-no-error) | component-lab | evidence, operations |
| [Claude SDK 0.2.90 query tests fail with resolved MCP 2.3.0 due to an API change](#agent-runtimemcp-dependency-drift-failures) | component-lab | operations |
| [Transcript mirroring retries 3x then drops; a Result can arrive despite mirror failure](#agent-runtimemirror-retry-and-result-separate) | component-lab | evidence, operations |
| [An agent tool call can change state and still report a validation error](#agent-runtimenested-call-partial-effects) | component-lab | testing, evidence, operations |
| [Agent wrapper normalization drops native permission denials and server tool-use blocks](#agent-runtimenormalization-drops-native-denials) | component-lab | evidence, ai-evaluation, reporting |
| [PentestGPT's 46 passing recovery tests cover accounting, not crash recovery or redaction](#agent-runtimepentestgpt-recovery-tests-scope) | component-lab | ai-evaluation, operations, evidence |
| [Reference Postgres/Redis/S3 session stores lack principal binding, UUID dedup and TTL](#agent-runtimereference-stores-no-principal-or-dedup) | component-lab | operations, evidence |
| [Agent session store keys derive from a path sanitizer; two different dirs collided](#agent-runtimesession-key-not-tenant-identity) | component-lab | operations, evidence, authorization |
| [ARTEX CLI bridge restrictions do not govern ARTEX engine tools](#agent-runtimeartex-cli-bridge-not-engine-permission-boundary) | source-trace | authorization, operations, ai-evaluation |
| [SDK resume copies auth config minus refresh token; cleanup ignores removal errors](#agent-runtimecredential-copy-cleanup-not-deletion) | source-trace | operations, evidence |
| [Injection detector runs after the tool acted; the tool filter is a substring match](#agent-runtimeinjection-defenses-not-enforcement) | source-trace | authorization, operations, ai-evaluation |
| [MCP HTTP returns 202 before handler delivery and can send an error after HTTP 200](#agent-runtimemcp-ack-before-outcome) | source-trace | evidence, operations |
| [MCP resource templates block base-escaping paths but exempt params and FileResource skip it](#agent-runtimemcp-resource-path-policy) | source-trace | testing, scoping |
| [PentestGPT agent runs with SandboxPolicy.FULL_ACCESS; isolation left to deployment](#agent-runtimepentestgpt-full-access) | source-trace | testing, ai-evaluation, operations |
| [PentestGPT runs both agent roles with full access and relies on deployment for isolation](#agent-runtimepentestgpt-full-access-no-scope) | source-trace | authorization, testing, operations |
| [PentestGPT Docker image runs a legacy wrapper, not the maintained framework](#agent-runtimepentestgpt-image-not-maintained-framework) | source-trace | ai-evaluation, operations |
| [PentestGPT TEST/EXPLOIT gating is an English substring rule, not an execution filter](#agent-runtimeplan-compiler-not-sandbox) | source-trace | authorization, testing |
| [Agent crash recovery cannot prove an external tool had no effect](#agent-runtimerecovery-journal-gap) | source-trace | operations, testing |
| [Agent SDK sandbox, approval and permission options are serialized config, not enforcement](#agent-runtimesdk-permissions-are-configuration) | source-trace | scoping, authorization, testing, ai-evaluation |
| [Codex and Claude SDK transports pass the parent's whole environment to the agent CLI](#agent-runtimesubprocess-inherits-full-environment) | source-trace | operations, authorization, evidence |
| [MCP tool annotations are hints and aggregated tool catalogs read only one page](#agent-runtimetool-hints-and-catalogs-not-authority) | source-trace | scoping, ai-evaluation, evidence |
| [Vendor agent runs continue after client timeout or AI disable; timeout is not cancellation](#agent-runtimeagent-runs-outlive-timeouts-and-disable) | public-doc | operations, ai-evaluation |
| [Codex resumed thread history is documented as lossy; command executions are not persisted](#agent-runtimecodex-resume-history-lossy) | public-doc | evidence, reporting |
| ['Triage' AI agents still change state: close alerts, write preferences, run SOAR actions](#agent-runtimetriage-agents-mutate-state) | public-doc | operations, authorization, ai-evaluation |
| [The bots/swarms research covers queues, crawlers, limiters, WAF, gossip; not LLM agents](#agent-runtimebots-slice-scope) | synthesis | operations, ai-evaluation |

### agent-runtimecodex-early-completion-lost

**`agent-runtime.codex-early-completion-lost`: Codex SDK router discards a turn completion that arrives before turn registration** (component-lab)

In openai-codex 0.1.0b3 the router discards a turn/completed notification when no queue is registered yet, and the high-level API waits on that queue. An inert test routing the typed completion immediately before the constructed turn/start response left the new queue empty, while the same event after registration was delivered. Two tests passed.

**Do:** Agent workers need an independent turn timeout and missing-terminal failure state; a hung await is not evidence of ongoing work.

**Limits:** Injected interleaving only; native app-server ordering, production frequency and the separate replay-order race are unestablished.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:14](../../assessment-evidence/sdk-boundaries-continuation.md#L14), [assessment-evidence/sdk-boundaries-continuation.md:34](../../assessment-evidence/sdk-boundaries-continuation.md#L34)

**Receipts:** `assessment-evidence/sdk-router-receipt-1792273867807.json`

### agent-runtimecodex-wrapper-drops-max-turns

**`agent-runtime.codex-wrapper-drops-max-turns`: Agent wrapper silently drops the max_turns budget for the Codex backend** (component-lab)

UnifiedAgent's Codex backend build_turn_kwargs forwards only output schema and effort, not RunOptions.max_turns, and its stream loop does not count turns. AST-extracted functions produced identical kwargs for max_turns 2 and 99. A synthetic MCP completion with an inner error-shaped result was normalized without an error flag.

**Do:** Verify that every adapter actually enforces declared budgets and policies at its wire boundary. A budget in a config is not evidence of a bound.

**Limits:** This is a wrapper-level finding. Downstream SDK limits and real SDK payload compatibility were not tested.

**Sources:** [assessment-evidence/deep-pentestgpt.md:29](../../assessment-evidence/deep-pentestgpt.md#L29), [assessment-evidence/deep-pentestgpt.md:64](../../assessment-evidence/deep-pentestgpt.md#L64)

**Receipts:** `assessment-evidence/deep-agent-receipt.json`

### agent-runtimeeof-incomplete-tail-no-error

**`agent-runtime.eof-incomplete-tail-no-error`: Claude transport ends silently on an incomplete JSON tail when the process exits 0** (component-lab)

Claude SDK subprocess transport buffers decoded characters (its limit message says bytes) and, at EOF with a remaining incomplete JSON buffer and exit 0, raises no parse error: the inert test yielded only the complete object. A 9-character limit accepted a 9-character value of 10 UTF-8 bytes. receive_response's docstring promises a final ResultMessage but iterates until Result or EOF.

**Do:** Callers must fail an episode lacking its terminal result event and record transport truncation explicitly instead of treating stream end as success.

**Limits:** Inert fake process and chunks; not a demonstrated accepted assessment result or resource exhaustion.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:98](../../assessment-evidence/sdk-boundaries-continuation.md#L98), [assessment-evidence/sdk-boundaries-continuation.md:121](../../assessment-evidence/sdk-boundaries-continuation.md#L121)

**Receipts:** `assessment-evidence/claude-evidence-receipt-1792274255291.json`

### agent-runtimemcp-dependency-drift-failures

**`agent-runtime.mcp-dependency-drift-failures`: Claude SDK 0.2.90 query tests fail with resolved MCP 2.3.0 due to an API change** (component-lab)

Claude SDK metadata only requires MCP>=1.23; the resolver picked 2.3.0, whose Server lacks the list_tools decorator the SDK calls, so 4 of the selected query tests failed constructing an in-process MCP server (22 passed, 4 failed, 7 deselected). Separately the UnifiedAgent offline suite had 54 pass and 1 fail because default symlink skill install returns WinError 1314 on Windows.

**Do:** Pin and record the resolved dependency set and platform for any agent tooling used in engagements; lower-bound declarations do not reproduce an environment.

**Limits:** Specific recorded combination; not a model-security failure or historical deployment behaviour.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:111](../../assessment-evidence/sdk-boundaries-continuation.md#L111), [assessment-evidence/sdk-boundaries-continuation.md:62](../../assessment-evidence/sdk-boundaries-continuation.md#L62)

### agent-runtimemirror-retry-and-result-separate

**`agent-runtime.mirror-retry-and-result-separate`: Transcript mirroring retries 3x then drops; a Result can arrive despite mirror failure** (component-lab)

Claude SDK transcript mirror batcher retries ordinary append errors three times then drops, but gives timeouts one attempt because a write might still land; the source comment calling it at-most-once/not retried is contradicted. Unchanged mirror tests (42 passed) show a Result still arrives alongside a mirror failure and that unmapped paths disappear without error.

**Do:** Model completion and evidence persistence are separate claims; record persistence status per batch and make remote appends idempotent.

**Limits:** Mocked transports/stores; no production store durability, isolation or memory bound under load.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:131](../../assessment-evidence/sdk-boundaries-continuation.md#L131), [assessment-evidence/sdk-boundaries-continuation.md:84](../../assessment-evidence/sdk-boundaries-continuation.md#L84)

### agent-runtimenested-call-partial-effects

**`agent-runtime.nested-call-partial-effects`: An agent tool call can change state and still report a validation error** (component-lab)

AgentDojo's FunctionsRuntime executes nested function-call arguments before validating the outer call, with no rollback. Executed directly with Pydantic 2.14.1, it incremented a synthetic counter before rejecting the outer argument. The pipeline also has no rollback when a later element raises.

**Do:** After any tool error, inspect post-state for partial effects. 'The call failed' does not mean 'nothing changed' on a client system.

**Limits:** Synthetic counter only. Each specific tool path was not tested.

**Sources:** [assessment-evidence/deep-agentdojo.md:38](../../assessment-evidence/deep-agentdojo.md#L38), [assessment-evidence/deep-agentdojo.md:20](../../assessment-evidence/deep-agentdojo.md#L20)

**Receipts:** `assessment-evidence/deep-agentdojo-receipt.json`

**Contrary or narrowing evidence:**
- [assessment-evidence/deep-agentdojo.md:254](../../assessment-evidence/deep-agentdojo.md#L254): 15 runtime tests pass, but none asserts rollback.

### agent-runtimenormalization-drops-native-denials

**`agent-runtime.normalization-drops-native-denials`: Agent wrapper normalization drops native permission denials and server tool-use blocks** (component-lab)

Passing an actual Claude Agent SDK 0.2.90 ResultMessage with is_error=True, permission_denials and an API 429 through the UnifiedAgent wrapper yields success=False, but the denial and error details disappear; a ServerToolUseBlock yields no normalized event at all. Upstream parser tests require these fields to survive parsing, so the loss is located in wrapper normalization, not the SDK parser. Four predefined inert component cases passed.

**Do:** Any AI-assisted assessment pipeline needs a native-to-normalized field map with explicit loss markers and must retain raw native records; an empty normalized action list must be reported as 'not represented', never as 'no action happened'.

**Limits:** Hand-constructed native messages through actual parser/normalizer code; no native CLI, provider or real tool run, and only the pinned wrapper's normalization was examined.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:100](../../assessment-evidence/sdk-boundaries-continuation.md#L100), [assessment-evidence/sdk-boundaries-continuation.md:103](../../assessment-evidence/sdk-boundaries-continuation.md#L103), [assessment-evidence/sdk-boundaries-continuation.md:145](../../assessment-evidence/sdk-boundaries-continuation.md#L145), [assessment-evidence/sdk-boundaries-continuation.md:96](../../assessment-evidence/sdk-boundaries-continuation.md#L96)

**Receipts:** `assessment-evidence/claude-evidence-receipt-1792274255291.json`

**Contrary or narrowing evidence:**
- [assessment-evidence/sdk-boundaries-continuation.md:161](../../assessment-evidence/sdk-boundaries-continuation.md#L161): The failure bit itself is preserved; only the detail is lost.

### agent-runtimepentestgpt-recovery-tests-scope

**`agent-runtime.pentestgpt-recovery-tests-scope`: PentestGPT's 46 passing recovery tests cover accounting, not crash recovery or redaction** (component-lab)

Unchanged PentestGPT episode/execution (34) and trial (12) tests passed. The sensitive-payload test proves two markers are omitted, not universal redaction; torn-tail injects a partial line after a completed episode, not a crash/fsync test; resume only resumes an already completed run; changing a receipt exit code to 255 leaves quote grounding true; 'all episodes complete' can coexist with audit failure.

**Do:** Do not market agent run recovery, redaction or completion metrics from these tests; define metric state machines and test mid-attempt crash recovery separately.

**Limits:** Scripted synthetic events; no provider, model or live target.

**Sources:** [assessment-evidence/continuation-exhaustion.md:293](../../assessment-evidence/continuation-exhaustion.md#L293), [assessment-evidence/continuation-exhaustion.md:296](../../assessment-evidence/continuation-exhaustion.md#L296), [assessment-evidence/continuation-exhaustion.md:302](../../assessment-evidence/continuation-exhaustion.md#L302)

### agent-runtimereference-stores-no-principal-or-dedup

**`agent-runtime.reference-stores-no-principal-or-dedup`: Reference Postgres/Redis/S3 session stores lack principal binding, UUID dedup and TTL** (component-lab)

Claude SDK reference Postgres, Redis and S3 session stores (README: not maintained production code) bind no customer principal, have no entry-UUID uniqueness and leave retention to the caller. With injected clocks the S3 adapter loaded [second,second,first] for skewed writers and duplicated UUIDs, and silently dropped a malformed middle line. The conformance harness auto-skips optional contracts, so passing does not mean all 14 contracts ran.

**Do:** Agent memory persistence needs explicit tenant ACLs, idempotency keys, retention/deletion policy and an attempted/skipped contract ledger before client data is stored.

**Limits:** Recording-client and in-memory fixtures; no real AWS/Redis/Postgres, IAM or crash recovery tested.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:155](../../assessment-evidence/sdk-boundaries-continuation.md#L155), [assessment-evidence/sdk-boundaries-continuation.md:153](../../assessment-evidence/sdk-boundaries-continuation.md#L153), [assessment-evidence/sdk-boundaries-continuation.md:141](../../assessment-evidence/sdk-boundaries-continuation.md#L141)

**Contrary or narrowing evidence:**
- [assessment-evidence/sdk-boundaries-continuation.md:157](../../assessment-evidence/sdk-boundaries-continuation.md#L157): Some enforced controls exist.

### agent-runtimesession-key-not-tenant-identity

**`agent-runtime.session-key-not-tenant-identity`: Agent session store keys derive from a path sanitizer; two different dirs collided** (component-lab)

Claude Agent SDK project keys replace every non-alphanumeric character with a hyphen (hash only above 200 chars), so owned temp directories synthetic-a-b and synthetic-a_b produced the same project key; the reference InMemorySessionStore returned entry aliases whose mutation changed later loads. SessionKey carries no authenticated principal and resume performs no owner authorization check.

**Do:** Never rely on SDK session/memory keys to separate clients; partition agent memory per engagement with authenticated namespaces and separate storage.

**Limits:** Synthetic directories and the reference in-memory adapter; production adapters, authentication and distinct session IDs were not exercised; not cross-customer disclosure.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:101](../../assessment-evidence/sdk-boundaries-continuation.md#L101), [assessment-evidence/sdk-boundaries-continuation.md:78](../../assessment-evidence/sdk-boundaries-continuation.md#L78), [assessment-evidence/sdk-boundaries-continuation.md:90](../../assessment-evidence/sdk-boundaries-continuation.md#L90)

**Receipts:** `assessment-evidence/claude-evidence-receipt-1792274255291.json`

**Contrary or narrowing evidence:**
- [assessment-evidence/sdk-boundaries-continuation.md:101](../../assessment-evidence/sdk-boundaries-continuation.md#L101): Bounded to component behaviour.

### agent-runtimeartex-cli-bridge-not-engine-permission-boundary

**`agent-runtime.artex-cli-bridge-not-engine-permission-boundary`: ARTEX CLI bridge restrictions do not govern ARTEX engine tools** (source-trace)

ARTEX's worker selects SDK bypass permission mode while attaching its own optional interception hooks; the local bridge's read-only or empty-tool CLI flags do not constrain ARTEX's later tool dispatch.

**Do:** Evaluate engine tool admission and actual execution isolation independently of restrictive provider CLI flags.

**Limits:** Pinned source reading only; active rules, SDK behavior and runtime enforcement untested. No escape or compromise observed.

**Sources:** [security-landscape/art-external-platforms-20261020.md:39](../../security-landscape/art-external-platforms-20261020.md#L39)

### agent-runtimecredential-copy-cleanup-not-deletion

**`agent-runtime.credential-copy-cleanup-not-deletion`: SDK resume copies auth config minus refresh token; cleanup ignores removal errors** (source-trace)

Claude session resume copies auth config and .claude.json into a temporary configuration, removing only claudeAiOauth.refreshToken from valid JSON; malformed JSON is written through. Cleanup retries lock errors then eventually ignores removal errors, so 'cleanup called' is not verified deletion. MCP OAuth clear_tokens clears only in-memory fields, not the persistent store.

**Do:** Treat agent credential materialization as a retention risk: verify deletion of every copied artifact, and keep client credentials out of shared agent config directories.

**Limits:** Source-only; no real configuration, keychain or credential was copied or inspected.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:80](../../assessment-evidence/sdk-boundaries-continuation.md#L80), [assessment-evidence/sdk-boundaries-continuation.md:485](../../assessment-evidence/sdk-boundaries-continuation.md#L485)

### agent-runtimeinjection-defenses-not-enforcement

**`agent-runtime.injection-defenses-not-enforcement`: Injection detector runs after the tool acted; the tool filter is a substring match** (source-trace)

In AgentDojo's pipeline the prompt-injection detector runs after tool execution and before the next model call, so it cannot undo an earlier side effect. By default it rewrites text rather than aborting. ToolFilter keeps any tool whose name occurs as a substring of the model's reply. Repeat-prompt and spotlighting are prompt/serialization measures with no code-enforced privilege separation.

**Do:** Do not count model-directed tool filtering or post-hoc injection detection as access control in an AI-assisted service. Enforce capabilities in code before tool dispatch.

**Limits:** Source reading; classifier accuracy and real prevention were not tested.

**Sources:** [assessment-evidence/deep-agentdojo.md:190](../../assessment-evidence/deep-agentdojo.md#L190), [assessment-evidence/deep-agentdojo.md:192](../../assessment-evidence/deep-agentdojo.md#L192)

### agent-runtimemcp-ack-before-outcome

**`agent-runtime.mcp-ack-before-outcome`: MCP HTTP returns 202 before handler delivery and can send an error after HTTP 200** (source-trace)

Installed MCP 2.3.0 streamable HTTP sends 202 for notifications/responses before forwarding to the session; SSE responses can commit status 200 and later carry a JSON-RPC error. The abstract EventStore promises no durability, retention or purge, source acknowledges a replay-to-live ordering window, and the client's reconnect maximum counts consecutive failures, not total. Clients also synthesize local CONNECTION_CLOSED errors.

**Do:** Score agent/tool outcomes from parsed results, not HTTP status; distinguish locally synthesized errors from target-supplied evidence, and never treat a resumption cursor as a completeness certificate.

**Limits:** Source-only; no HTTP server, interruption or replay was run.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:297](../../assessment-evidence/sdk-boundaries-continuation.md#L297), [assessment-evidence/sdk-boundaries-continuation.md:192](../../assessment-evidence/sdk-boundaries-continuation.md#L192), [assessment-evidence/sdk-boundaries-continuation.md:300](../../assessment-evidence/sdk-boundaries-continuation.md#L300)

### agent-runtimemcp-resource-path-policy

**`agent-runtime.mcp-resource-path-policy`: MCP resource templates block base-escaping paths but exempt params and FileResource skip it** (source-trace)

MCP 2.3.0 resource templates reject NUL, base-escaping dot components and absolute forms on decoded parameters, but exempt parameters skip all checks, and the traversal helper permits internal '..' that does not climb above the start despite a docstring saying any '..' is rejected. FileResource/DirectoryResource read operator-configured absolute paths with no allowed-root policy, and HttpResource does not use the endpoint redirect helper.

**Do:** When assessing MCP servers that expose files or URLs, trace which callbacks build resources from caller input and test exempted parameters and redirects explicitly.

**Limits:** Source-only; no resource read, traversal or fetch attempted.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:387](../../assessment-evidence/sdk-boundaries-continuation.md#L387), [assessment-evidence/sdk-boundaries-continuation.md:391](../../assessment-evidence/sdk-boundaries-continuation.md#L391)

### agent-runtimepentestgpt-full-access

**`agent-runtime.pentestgpt-full-access`: PentestGPT agent runs with SandboxPolicy.FULL_ACCESS; isolation left to deployment** (source-trace)

In pentestgpt_agent at e8b1bb7, trial.py:68-104 configures both roles with SandboxPolicy.FULL_ACCESS and states deployment isolation is the security boundary, so a checked task target does not block a shell command to another address. Code controls schemas, state transitions, budgets and evidence matching; grounding validates exact quotes, not that output proves the vulnerability. No mandatory per-action human approval, hard network boundary or measured prompt-injection resistance was established. Root unified_agent/ is obsolete and must not be reviewed as current runtime.

**Do:** Any agent used against client systems needs OS/network-level mediation and approval outside the model; prompt instructions are not enforcement.

**Limits:** Source review only; no model calls; wrapper, memory and full tests unreviewed.

**Sources:** [security-landscape/implementation-reviews.md:160](../../security-landscape/implementation-reviews.md#L160), [security-landscape/implementation-reviews.md:146](../../security-landscape/implementation-reviews.md#L146), [security-landscape/technical-library.md:24](../../security-landscape/technical-library.md#L24)

**Contrary or narrowing evidence:**
- [security-landscape/implementation-reviews.md:168](../../security-landscape/implementation-reviews.md#L168): Benchmark results do not transfer.

### agent-runtimepentestgpt-full-access-no-scope

**`agent-runtime.pentestgpt-full-access-no-scope`: PentestGPT runs both agent roles with full access and relies on deployment for isolation** (source-trace)

trial.py gives both injected roles FULL_ACCESS, relying on deployment isolation. The Claude backend maps FULL_ACCESS to bypassPermissions and adds a wildcard allow for registered MCP tools. Target validation is not tool-command mediation. The Docker image grants passwordless sudo, Compose adds NET_ADMIN and the tunnel device, mounts the host workspace, and implements no target-route allowlist.

**Do:** If using or modelling an autonomous pentest agent, enforce scope, egress and credentials at the executor/network layer outside the model. Never treat a container label or a target list as scope enforcement.

**Limits:** Source reading only; no image build, deployment or isolation test was run.

**Sources:** [assessment-evidence/deep-pentestgpt.md:12](../../assessment-evidence/deep-pentestgpt.md#L12), [assessment-evidence/deep-pentestgpt.md:27](../../assessment-evidence/deep-pentestgpt.md#L27), [assessment-evidence/deep-pentestgpt.md:71](../../assessment-evidence/deep-pentestgpt.md#L71)

**Contrary or narrowing evidence:**
- [assessment-evidence/deep-pentestgpt.md:73](../../assessment-evidence/deep-pentestgpt.md#L73): Some credential hygiene (dockerignore, umask on login) exists.

### agent-runtimepentestgpt-image-not-maintained-framework

**`agent-runtime.pentestgpt-image-not-maintained-framework`: PentestGPT Docker image runs a legacy wrapper, not the maintained framework** (source-trace)

At the pin, docs state that the maintained nested framework and the root tool image differ. The Dockerfile copies the drifted root compatibility wrapper and legacy package. The Docker health test imports only those. The Makefile's docker-run intentionally exits 2. Image installs are not all version- or hash-pinned, so the Git pin is not a reproducible image digest.

**Do:** When evaluating an open-source AI pentest tool, confirm which code path the packaged artifact actually runs before attributing results to it.

**Limits:** No image was built or run.

**Sources:** [assessment-evidence/deep-pentestgpt.md:69](../../assessment-evidence/deep-pentestgpt.md#L69)

### agent-runtimeplan-compiler-not-sandbox

**`agent-runtime.plan-compiler-not-sandbox`: PentestGPT TEST/EXPLOIT gating is an English substring rule, not an execution filter** (source-trace)

plan.py requires a completed TEST basis before EXPLOIT and rejects dependency cycles. Its TEST/exploitation separation is a finite substring rule. Target matching normalizes HTTP origin and path but does not inspect commands, resolve DNS, restrict redirects or gate SDK dispatch. The finish check verifies structural consistency, not that evidence meets the goal.

**Do:** Do not describe an agent's planning constraints as scope or exploitation control. Scope must be enforced where commands and network traffic leave.

**Limits:** No bypass experiment was performed.

**Sources:** [assessment-evidence/agent-recovery-continuation.md:42](../../assessment-evidence/agent-recovery-continuation.md#L42), [assessment-evidence/deep-pentestgpt.md:50](../../assessment-evidence/deep-pentestgpt.md#L50)

### agent-runtimerecovery-journal-gap

**`agent-runtime.recovery-journal-gap`: Agent crash recovery cannot prove an external tool had no effect** (source-trace)

PentestGPT's loop permits retry only when no action receipt (command, file change or tool call) is journaled, and SQLite transactions settle attempts atomically. That transaction does not cover the external operation, so absence of a journaled action is not proof that no effect happened. 'Restart' tests reopen state in the same pytest process rather than killing an OS process. A provider transport failure and an accepted task result can coexist.

**Do:** For any agent or worker that touches client systems, require durable intent before dispatch plus idempotency/fencing and effect reconciliation. Do not rely on 'no event logged' to decide a retry is safe.

**Limits:** This is source and test reading plus in-process fixtures; no OS-crash or tool-gap experiment was run.

**Sources:** [assessment-evidence/agent-recovery-continuation.md:15](../../assessment-evidence/agent-recovery-continuation.md#L15), [assessment-evidence/agent-recovery-continuation.md:9](../../assessment-evidence/agent-recovery-continuation.md#L9)

**Receipts:** `assessment-evidence/agent-recovery-receipt-1792273419521.json`

### agent-runtimesdk-permissions-are-configuration

**`agent-runtime.sdk-permissions-are-configuration`: Agent SDK sandbox, approval and permission options are serialized config, not enforcement** (source-trace)

In Codex Python 0.1.0b3 the sandbox preset is a wire enum, not an OS sandbox, and auto_review maps to on_request; the default Python approval handler accepts command/file-change requests that reach it. In Claude Agent SDK 0.2.90 allow/disallow lists, permission mode and sandbox settings are assembled into CLI argv; can_use_tool only handles otherwise-prompting actions. Wrapper permission tests assert option values, not enforcement.

**Do:** Enforce client scope, target allowlists and destructive-action blocks outside the agent SDK (network egress, OS sandbox, executor-level checks) and test the enforcement independently.

**Limits:** Python source plus wrapper tests only; native CLI enforcement and app-server auto-review behaviour were not reviewed or run.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:11](../../assessment-evidence/sdk-boundaries-continuation.md#L11), [assessment-evidence/sdk-boundaries-continuation.md:13](../../assessment-evidence/sdk-boundaries-continuation.md#L13), [assessment-evidence/sdk-boundaries-continuation.md:42](../../assessment-evidence/sdk-boundaries-continuation.md#L42), [assessment-evidence/sdk-boundaries-continuation.md:76](../../assessment-evidence/sdk-boundaries-continuation.md#L76)

**Contrary or narrowing evidence:**
- [assessment-evidence/sdk-boundaries-continuation.md:13](../../assessment-evidence/sdk-boundaries-continuation.md#L13): Not a demonstrated bypass; which requests reach the handler is unknown.

### agent-runtimesubprocess-inherits-full-environment

**`agent-runtime.subprocess-inherits-full-environment`: Codex and Claude SDK transports pass the parent's whole environment to the agent CLI** (source-trace)

Codex client copies the parent's whole environment then applies overrides before starting the stdio subprocess; Claude transport inherits all environment except CLAUDECODE. Neither implements a credential allowlist, and upstream environment tests explicitly expect PATH and trace propagation. By contrast MCP 2.3 stdio_client copies only a small named default set plus explicit server env.

**Do:** Launch assessment agents from a scrubbed environment containing only engagement-specific credentials; never run them from an operator shell holding other clients' secrets.

**Limits:** Source review; no secret exposure was demonstrated and no real credentials were read.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:12](../../assessment-evidence/sdk-boundaries-continuation.md#L12), [assessment-evidence/sdk-boundaries-continuation.md:44](../../assessment-evidence/sdk-boundaries-continuation.md#L44), [assessment-evidence/sdk-boundaries-continuation.md:177](../../assessment-evidence/sdk-boundaries-continuation.md#L177)

### agent-runtimetool-hints-and-catalogs-not-authority

**`agent-runtime.tool-hints-and-catalogs-not-authority`: MCP tool annotations are hints and aggregated tool catalogs read only one page** (source-trace)

mcp-types marks readOnlyHint, idempotentHint and destructiveHint as hints clients should not trust from untrusted servers. ClientSessionGroup aggregation makes one list call per family without following nextCursor. Extension interceptors may return a shaped result without running the named tool body, and the OTel span is stamped before the downstream chain. Apps CSP/permissions are only serialized metadata.

**Do:** Do not scope an AI agent by tool metadata or assume a tool catalog is complete; independently observe tool invocation and effect.

**Limits:** Source-only; no pagination fixture, interceptor or UI run.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:423](../../assessment-evidence/sdk-boundaries-continuation.md#L423), [assessment-evidence/sdk-boundaries-continuation.md:509](../../assessment-evidence/sdk-boundaries-continuation.md#L509), [assessment-evidence/sdk-boundaries-continuation.md:453](../../assessment-evidence/sdk-boundaries-continuation.md#L453)

### agent-runtimeagent-runs-outlive-timeouts-and-disable

**`agent-runtime.agent-runs-outlive-timeouts-and-disable`: Vendor agent runs continue after client timeout or AI disable; timeout is not cancellation** (public-doc)

CrowdStrike AgentWorks invocation polls 45 seconds by default; on timeout or waiting-for-tool-approval it returns an ID while the server run continues, and the MCP tool cannot approve a paused tool. Splunk ES 8.6 says an already-started Guided Response investigation continues even if AI is turned off. Google secops-wrapper natural-language search retries re-run both translation and search, up to 5,115 seconds of sleeps by code calculation.

**Do:** Any orchestration around vendor or our own agents must track run IDs to a terminal state, have an explicit cancel path, and not equate client timeout, UI disable or retry exhaustion with work stopping.

**Limits:** Manual and source-reading observations; no invocation or retry was executed.

**Sources:** [cybersecurity-firms/charlotte-agentworks-contract.md:7](../../cybersecurity-firms/charlotte-agentworks-contract.md#L7), [cybersecurity-firms/splunk-guided-response.md:9](../../cybersecurity-firms/splunk-guided-response.md#L9), [cybersecurity-firms/google-natural-language-search-source.md:18](../../cybersecurity-firms/google-natural-language-search-source.md#L18)

### agent-runtimecodex-resume-history-lossy

**`agent-runtime.codex-resume-history-lossy`: Codex resumed thread history is documented as lossy; command executions are not persisted** (public-doc)

The generated Codex v2 schema (0.1.0b3) explicitly describes rollback/resume ThreadItems as lossy because not all interactions, including command executions, are persisted, and many responses return empty turns. Process-exit notifications carry stdout/stderr cap flags and streamed output leaves final buffered strings empty.

**Do:** Collect the original action/result stream separately, with capture mode and cap flags, rather than reconstructing an engagement record from resumed agent history; empty history or empty output is not absence of activity.

**Limits:** Schema-described fields only; native CLI persistence was not executed or reviewed.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:284](../../assessment-evidence/sdk-boundaries-continuation.md#L284), [assessment-evidence/sdk-boundaries-continuation.md:262](../../assessment-evidence/sdk-boundaries-continuation.md#L262)

### agent-runtimetriage-agents-mutate-state

**`agent-runtime.triage-agents-mutate-state`: 'Triage' AI agents still change state: close alerts, write preferences, run SOAR actions** (public-doc)

Microsoft's Phishing Triage Agent resolves alerts it judges false positive and inherits the assigned identity's permissions. Splunk Triage can be given selected SOAR connectors for autonomous enrichment or adaptive response, with connectors preselected; Guided Response can disable users (double confirmation) through inherited SOAR permissions. Trend's MCP server registers write tools whenever read-only is disabled and adds no per-call approval. Google's Gemini chat wrapper can PATCH a user preference during a query. PAN AgentiX restricts agents to assigned actions within the invoking user's permissions and requires approval for sensitive actions, and FortiAnalyzer writes need UI confirmation.

**Do:** Inventory every state change an AI feature can make (classification, closure, preference, connector action), bind it to a least-privilege identity, and audit erroneous auto-closures; do not accept "triage only" or "read-only" labels without checking registration and permissions.

**Limits:** Feature-specific manuals and source; no tenant configuration or action was exercised.

**Sources:** [cybersecurity-firms/microsoft-phishing-agent.md:15](../../cybersecurity-firms/microsoft-phishing-agent.md#L15), [cybersecurity-firms/splunk-triage-controls.md:33](../../cybersecurity-firms/splunk-triage-controls.md#L33), [cybersecurity-firms/trend-mcp-source.md:29](../../cybersecurity-firms/trend-mcp-source.md#L29), [cybersecurity-firms/google-gemini-client-source.md:14](../../cybersecurity-firms/google-gemini-client-source.md#L14), [cybersecurity-firms/pan-agentix-controls.md:5](../../cybersecurity-firms/pan-agentix-controls.md#L5)

**Contrary or narrowing evidence:**
- [cybersecurity-firms/fortianalyzer-transparency.md:5](../../cybersecurity-firms/fortianalyzer-transparency.md#L5): Some products gate writes; confirmation is still not correctness validation (line 11).

### agent-runtimebots-slice-scope

**`agent-runtime.bots-slice-scope`: The bots/swarms research covers queues, crawlers, limiters, WAF, gossip; not LLM agents** (synthesis)

The pinned study set is Scrapy, BullMQ (with ports), rate-limiter-flexible, Coraza and memberlist: 1511 implementation/test files and 651 supporting files fully read, plus RFC/Kubernetes reading. "Agent" is defined conceptually only; all runtime results come from inert or synthetic fixtures, with no real Redis, Postgres, Go or cluster integration.

**Do:** Use this slice for worker, queue, crawler, quota and WAF decisions; look elsewhere for AI-agent reliability evidence.

**Limits:** Reading completeness is not semantic or runtime certification.

**Sources:** [bots-swarms/scope-closure.md:3](../../bots-swarms/scope-closure.md#L3), [bots-swarms/scope-closure.md:18](../../bots-swarms/scope-closure.md#L18), [bots-swarms/model.md:3](../../bots-swarms/model.md#L3)

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| high | [assessment-evidence/deep-openfga.md:112](../../assessment-evidence/deep-openfga.md#L112) | [assessment-evidence/continuation-exhaustion.md:104](../../assessment-evidence/continuation-exhaustion.md#L104) | Do not report the CEL sync.Once issue as a vendor vulnerability; it is a component-level defect not reachable through ordinary model writes. |
| high | [assessment-evidence/continuation-exhaustion.md:104](../../assessment-evidence/continuation-exhaustion.md#L104) | [assessment-evidence/continuation-exhaustion.md:106](../../assessment-evidence/continuation-exhaustion.md#L106) | Cite only receipt 1792271857692 for OpenFGA admission; never 1792271828082. |
| high | [assessment-evidence/synthesis.md:42](../../assessment-evidence/synthesis.md#L42) | [assessment-evidence/continuation-exhaustion.md:104](../../assessment-evidence/continuation-exhaustion.md#L104) | The failed-compile state is an internal component observation only; ordinary model writes reject invalid conditions. |
| high | [assessment-evidence/continuation-exhaustion.md:223](../../assessment-evidence/continuation-exhaustion.md#L223) | [assessment-evidence/continuation-exhaustion.md:231](../../assessment-evidence/continuation-exhaustion.md#L231) | Report terminal-error suppression as an evidence-quality issue, not stale authorization or missed revocation. |
| medium | [assessment-evidence/sdk-boundaries-continuation.md:14](../../assessment-evidence/sdk-boundaries-continuation.md#L14) | [assessment-evidence/sdk-boundaries-continuation.md:34](../../assessment-evidence/sdk-boundaries-continuation.md#L34) | Treat Codex early-completion loss as confirmed for the Python router under injected order, unconfirmed natively. |
| medium | [assessment-evidence/sdk-boundaries-continuation.md:84](../../assessment-evidence/sdk-boundaries-continuation.md#L84) | [assessment-evidence/sdk-boundaries-continuation.md:131](../../assessment-evidence/sdk-boundaries-continuation.md#L131) | Transcript mirror is not at-most-once; remote stores need idempotent appends. |
| medium | [security-landscape/technical-library.md:22](../../security-landscape/technical-library.md#L22) | [security-landscape/technical-library.md:24](../../security-landscape/technical-library.md#L24) | Attribute PentestGPT behavior only to pentestgpt_agent at e8b1bb7. |
| medium | [assessment-evidence/sdk-boundaries-continuation.md:111](../../assessment-evidence/sdk-boundaries-continuation.md#L111) | [assessment-evidence/sdk-boundaries-continuation.md:117](../../assessment-evidence/sdk-boundaries-continuation.md#L117) | These failures are dependency drift, not model or SDK security failures. |
| medium | [assessment-evidence/sdk-boundaries-continuation.md:198](../../assessment-evidence/sdk-boundaries-continuation.md#L198) | [assessment-evidence/sdk-boundaries-continuation.md:333](../../assessment-evidence/sdk-boundaries-continuation.md#L333) | Host/origin protection depends on construction path and host; verify per deployment. |
| medium | [assessment-evidence/deep-lab-plan.md:26](../../assessment-evidence/deep-lab-plan.md#L26) | [assessment-evidence/deep-monitor.md:28](../../assessment-evidence/deep-monitor.md#L28) | The _owner_alive helper did not terminate the child; cite only the narrower console-signal portability concern. |
| medium | [assessment-evidence/deep-agentdojo.md:37](../../assessment-evidence/deep-agentdojo.md#L37) | [assessment-evidence/deep-agentdojo.md:104](../../assessment-evidence/deep-agentdojo.md#L104) | The mismatch is confined to the optional injectable precheck, not to injection placement in attacks. |
| medium | [assessment-evidence/deep-agentdojo.md:53](../../assessment-evidence/deep-agentdojo.md#L53) | [assessment-evidence/deep-agentdojo.md:57](../../assessment-evidence/deep-agentdojo.md#L57) | Cite per-task, per-version oracle weaknesses; do not dismiss the whole benchmark. |
| medium | [assessment-evidence/continuation-exhaustion.md:159](../../assessment-evidence/continuation-exhaustion.md#L159) | [assessment-evidence/continuation-exhaustion.md:159](../../assessment-evidence/continuation-exhaustion.md#L159) | OpenFGA ignores extra context keys when parameters exist; do not rely on the comment. |
| medium | [assessment-evidence/continuation-exhaustion.md:151](../../assessment-evidence/continuation-exhaustion.md#L151) | [assessment-evidence/continuation-exhaustion.md:196](../../assessment-evidence/continuation-exhaustion.md#L196) | Cite the caller-level receipt, but keep the finding as a conversion boundary, not a bypass. |
| medium | [assessment-evidence/continuation-exhaustion.md:374](../../assessment-evidence/continuation-exhaustion.md#L374) | [assessment-evidence/continuation-exhaustion.md:374](../../assessment-evidence/continuation-exhaustion.md#L374) | Do not report OpenFGA as failing open on resolver errors. |
| medium | [assessment-evidence/continuation-exhaustion.md:241](../../assessment-evidence/continuation-exhaustion.md#L241) | [assessment-evidence/continuation-exhaustion.md:259](../../assessment-evidence/continuation-exhaustion.md#L259) | SQLite has component runtime evidence; PostgreSQL/MySQL remain source-only. |
| medium | [assessment-evidence/continuation-exhaustion.md:120](../../assessment-evidence/continuation-exhaustion.md#L120) | [assessment-evidence/continuation-exhaustion.md:129](../../assessment-evidence/continuation-exhaustion.md#L129) | No lost-edge defect exists on the ordinary builder path. |
| medium | [cybersecurity-firms/charlotte-agentworks-contract.md:17](../../cybersecurity-firms/charlotte-agentworks-contract.md#L17) | [cybersecurity-firms/charlotte-agentworks-contract.md:17](../../cybersecurity-firms/charlotte-agentworks-contract.md#L17) | Use the June 2026 credit-tier model for current pricing discussions; legacy applicability is unresolved. |
| medium | [cybersecurity-firms/microsoft-phishing-agent.md:38](../../cybersecurity-firms/microsoft-phishing-agent.md#L38) | [cybersecurity-firms/microsoft-phishing-agent.md:38](../../cybersecurity-firms/microsoft-phishing-agent.md#L38) | Neither figure is authoritative; confirm contractually before stating Security Copilot shared-data retention. |
| medium | [cybersecurity-firms/splunk-guided-response.md:15](../../cybersecurity-firms/splunk-guided-response.md#L15) | [cybersecurity-firms/splunk-triage-controls.md:17](../../cybersecurity-firms/splunk-triage-controls.md#L17) | Do not assume the general model setting governs Triage data routing. |
| medium | [assessment-evidence/coverage.md:59](../../assessment-evidence/coverage.md#L59) | [assessment-evidence/continuation-exhaustion.md:58](../../assessment-evidence/continuation-exhaustion.md#L58) | Do not treat the earlier bounded pass as complete coverage; even the later cutoff is not exhaustion (continuation-exhaustion.md:801). |
| medium | [bots-swarms/catalog.md:8](../../bots-swarms/catalog.md#L8) | [bots-swarms/scope-closure.md:3](../../bots-swarms/scope-closure.md#L3) | catalog.md status cells are historical; use scope-closure.md. |
| medium | [bots-swarms/continuation-checkpoint.md:23](../../bots-swarms/continuation-checkpoint.md#L23) | [bots-swarms/scope-closure.md:30](../../bots-swarms/scope-closure.md#L30) | continuation-checkpoint.md counts are historical. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:9](../../assessment-evidence/sdk-boundaries-continuation.md#L9) | [assessment-evidence/sdk-boundaries-continuation.md:280](../../assessment-evidence/sdk-boundaries-continuation.md#L280) | The Codex schema is fully source-read; native runtime remains unvalidated. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:234](../../assessment-evidence/sdk-boundaries-continuation.md#L234) | [assessment-evidence/sdk-boundaries-continuation.md:234](../../assessment-evidence/sdk-boundaries-continuation.md#L234) | Capture error origin layer; do not infer origin from the code alone. |
| low | [assessment-evidence/deep-pentestgpt.md:13](../../assessment-evidence/deep-pentestgpt.md#L13) | [assessment-evidence/monitor-web-continuation.md:17](../../assessment-evidence/monitor-web-continuation.md#L17) | The zero-cost conflation is in trial aggregation, not the monitor UI. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:137](../../assessment-evidence/sdk-boundaries-continuation.md#L137) | [assessment-evidence/sdk-boundaries-continuation.md:137](../../assessment-evidence/sdk-boundaries-continuation.md#L137) | The import failure was a fixture error; use the v2 receipt. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:157](../../assessment-evidence/sdk-boundaries-continuation.md#L157) | [assessment-evidence/sdk-boundaries-continuation.md:531](../../assessment-evidence/sdk-boundaries-continuation.md#L531) | Live Redis/S3 tests were read (late), never executed; they supply no backend evidence. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:389](../../assessment-evidence/sdk-boundaries-continuation.md#L389) | [assessment-evidence/sdk-boundaries-continuation.md:389](../../assessment-evidence/sdk-boundaries-continuation.md#L389) | Record the actual base-escape predicate. |
| low | [assessment-evidence/agent-recovery-continuation.md:21](../../assessment-evidence/agent-recovery-continuation.md#L21) | [assessment-evidence/agent-recovery-continuation.md:44](../../assessment-evidence/agent-recovery-continuation.md#L44) | Normal compiled state is field-bounded; only arbitrary library-constructed snapshots remain unbounded. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:381](../../assessment-evidence/sdk-boundaries-continuation.md#L381) | [assessment-evidence/sdk-boundaries-continuation.md:381](../../assessment-evidence/sdk-boundaries-continuation.md#L381) | Do not repeat the docstring; reconnection code exists, though delivery completeness is unproven. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:54](../../assessment-evidence/sdk-boundaries-continuation.md#L54) | [assessment-evidence/sdk-boundaries-continuation.md:68](../../assessment-evidence/sdk-boundaries-continuation.md#L68) | Not a defect in the wrapper's normal path. |
| low | [2026-10-16-rea-and-security-workflows.md:178](../../2026-10-16-rea-and-security-workflows.md#L178) | [security-landscape/implementation-reviews.md:95](../../security-landscape/implementation-reviews.md#L95) | Use implementation-reviews.md for garak evaluator behavior. |
| low | [assessment-evidence/continuation-exhaustion.md:704](../../assessment-evidence/continuation-exhaustion.md#L704) | [assessment-evidence/continuation-exhaustion.md:706](../../assessment-evidence/continuation-exhaustion.md#L706) | The Echo4 omission is explained by generator shared-field exclusion, not a bypass. |
| low | [assessment-evidence/continuation-exhaustion.md:714](../../assessment-evidence/continuation-exhaustion.md#L714) | [assessment-evidence/continuation-exhaustion.md:714](../../assessment-evidence/continuation-exhaustion.md#L714) | Sibling nId.val is not excluded by the gateway filter. |
| low | [assessment-evidence/continuation-exhaustion.md:225](../../assessment-evidence/continuation-exhaustion.md#L225) | [assessment-evidence/continuation-exhaustion.md:251](../../assessment-evidence/continuation-exhaustion.md#L251) | Constructor cleanup behaviour is adapter-specific. |
| low | [assessment-evidence/continuation-exhaustion.md:455](../../assessment-evidence/continuation-exhaustion.md#L455) | [assessment-evidence/continuation-exhaustion.md:455](../../assessment-evidence/continuation-exhaustion.md#L455) | Do not repeat the old invalidation suspicion without the key-code trace in openfga-request-contract.md. |
| low | [assessment-evidence/continuation-exhaustion.md:153](../../assessment-evidence/continuation-exhaustion.md#L153) | [assessment-evidence/continuation-exhaustion.md:153](../../assessment-evidence/continuation-exhaustion.md#L153) | Read the corrected fixture description in those receipts, not the inherited one. |
| low | [assessment-evidence/continuation-exhaustion.md:202](../../assessment-evidence/continuation-exhaustion.md#L202) | [assessment-evidence/continuation-exhaustion.md:245](../../assessment-evidence/continuation-exhaustion.md#L245) | Adapter reading statuses in early paragraphs are outdated; check later checkpoints. |
| low | [assessment-evidence/continuation-exhaustion.md:421](../../assessment-evidence/continuation-exhaustion.md#L421) | [assessment-evidence/continuation-exhaustion.md:597](../../assessment-evidence/continuation-exhaustion.md#L597) | Library-level redaction does not describe what OpenFGA logs; check application logger config. |
| low | [assessment-evidence/continuation-exhaustion.md:277](../../assessment-evidence/continuation-exhaustion.md#L277) | [assessment-evidence/continuation-exhaustion.md:281](../../assessment-evidence/continuation-exhaustion.md#L281) | Cleanup targets generated containers, but those tests still provision Docker infrastructure and should not be run casually. |
| low | [cybersecurity-firms/microsoft-phishing-agent.md:3](../../cybersecurity-firms/microsoft-phishing-agent.md#L3) | [cybersecurity-firms/microsoft.md:5](../../cybersecurity-firms/microsoft.md#L5) | Read microsoft.md for portfolio context. |
| low | [cybersecurity-firms/cisco-splunk.md:17](../../cybersecurity-firms/cisco-splunk.md#L17) | [cybersecurity-firms/splunk-triage-controls.md:45](../../cybersecurity-firms/splunk-triage-controls.md#L45) | Training consent is documented; inference retention and Triage-specific paths remain unknown. |
| low | [assessment-evidence/continuation-exhaustion.md:735](../../assessment-evidence/continuation-exhaustion.md#L735) | [assessment-evidence/continuation-exhaustion.md:735](../../assessment-evidence/continuation-exhaustion.md#L735) | grpc-gateway is BSD-3-Clause. |
| low | [assessment-evidence/deep-agentdojo.md:262](../../assessment-evidence/deep-agentdojo.md#L262) | [assessment-evidence/deep-agentdojo.md:277](../../assessment-evidence/deep-agentdojo.md#L277) | AgentDojo uv.lock is fully read as metadata (not installed or implementation-reviewed). |
| low | [assessment-evidence/deep-deepdiff.md:181](../../assessment-evidence/deep-deepdiff.md#L181) | [assessment-evidence/deep-agentdojo.md:277](../../assessment-evidence/deep-agentdojo.md#L277) | Superseded; lock fully read. |
