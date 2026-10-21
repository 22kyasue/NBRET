# Session workbench increment

Purpose: help Kotaro investigate one authorized business application, learn why each step matters, distinguish observed business effect from possible damage, and receive evidence plus unresolved owner actions. The eventual outcome includes independent review, manual verification, structural remediation and matched retesting. Bug count is not the completion criterion.

This increment makes next-step selection depend on current observations rather than a fixed known-answer script. It remains an owned synthetic target with declared demo accounts. A deterministic selector supplies bounded suggestions; the current coding-agent session can instead submit its own typed proposal. These are distinct sources of decisions. No unattended model, provider API or new subscription is introduced.

## Implementation contract

Elm owns `session-target.mjs`: creates the only permitted application, holds synthetic credentials in memory, normalizes evidence and enforces the fixed action vocabulary before transport. No supplied URL, headers, payload, shell command or new target can execute. Objects must have been observed in this instance. Scope is immutable. Per-request wall-clock, cumulative active-time, request-count and response-size limits apply; same-account shell access remains outside this adapter boundary.

Bryn owns `next-step.mjs`: pure observation-driven frontier with identity/profile prerequisites, discovered object IDs, fresh state after transitions, semantic deduplication, no silent retries after incomplete work, two steering priorities and explicit exhausted frontier. It is deterministic policy logic. It is not learned reasoning or an effectiveness result.

Skye owns orchestration, local UI, report and integration. Before each action, append its declared question, reason, supporting evidence and source to the existing durable journal. Append execution intent before transport; preserve observation/error, rejected proposals, reviewer disagreements, steering, owner requests and stop. A crash after intent is an unresolved attempt, never automatically replayed; a new process cannot resume a vanished in-memory target under old evidence. Reading a saved journal reconstructs the record for review only.

Every action result is an observation, not an automatically verified finding. A separately declared reviewer can record a rationale and cited evidence; labels do not authenticate independence. Potential consequences and repair suggestions require explicit interpretation. No fabricated confirmation or repair result is added when the application behaves correctly.

## User flow

One local command starts a workbench. Kotaro can inspect the proposed next step and its evidence, execute one step, continue the bounded rules frontier, change priority, pause, stop and inspect/export the complete ledger. The existing coding-agent session can read `/api/state`, propose a typed step through the session interface, and interpret the response without buying model API credits. HTTP mutation is same-origin and nonce-protected; the nonce is a local session convenience, not authenticated multiuser access.

Rejected or unsupported work creates a consolidated owner request and does not expand permissions. Stop closes the owned target and prevents new actions. Pausing prevents new pickup but does not claim active work terminated. Budgets and incomplete branches stay visible even when there are no findings.

Stopping in this increment uses the immutable action/request/time budgets, observed-frontier exhaustion and owner stop. Stage 5's measured diminishing-useful-returns signal remains deferred; there is no claim that frontier exhaustion measures optimal investigation effort. Syntactically usable session proposals rejected after a current-revision command receive a durable rejection reason, with raw rejected fields omitted to avoid copying credentials. Malformed transport, unauthorized HTTP and stale-revision commands are refused before journal mutation. The loopback nonce provides same-origin request hygiene, not access control against other local processes.

## Acceptance and research

Require real branching: changed observed object IDs/states and missing or denied evidence change the eligible next action; no app answer IDs may be built into the selector. Reject unknown fields, undiscovered objects, alternate URLs, scope changes and stale UI revisions before target requests. Concurrent steps must not duplicate effects. Stop during work must leave an explicit terminal/incomplete record and close the target. Review must cite existing evidence and preserve objections; it must never manufacture supported findings. Replay must recover the same visible history, including unresolved attempts.

`safety.capability-gate-outside-model`, [executable-claims.md](../research/assessment-evidence/executable-claims.md), supplies component-lab evidence for gates outside a model; it does not prove an OS sandbox or every execution path. `standards.claim-record-fields`, [framework.md](../research/assessment-evidence/framework.md), grounds explicit predicates, identity, evidence, omissions and assistance; its protocol remains proposed. `ai-evaluation.text-canary-oracle-not-effect`, [deep-pentestgpt.md](../research/assessment-evidence/deep-pentestgpt.md), supplies a component counterexample to equating grounded text with effect. E01 and its current-code correction exclude legacy identity-agnostic matching. [infrastructure-and-memory.md](../research/assessment-evidence/infrastructure-and-memory.md) requires treating target text as data and not treating stored text as demonstrated learning.

These sources guide engineering, not comparative discovery claims. Blind separation, scorer mutation admission, expert baseline, real-client fidelity and pricing remain unresolved. Aiko independently reviews whether this increment serves the stated purpose and whether claims match implemented behavior.
