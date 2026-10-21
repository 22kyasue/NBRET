# Run the session workbench

For the integrated workflow, session CLI, narrowed intake, casebook, measurement and checkpoint resume, use [LOCAL-WORKFLOW.md](LOCAL-WORKFLOW.md). This document also preserves the earlier workbench increment and its historical acceptance results; current integrated validation is in [local-workflow-receipt.json](local-workflow-receipt.json).

The goal is to help you understand an authorized business app: what it permits, what could cause damage, what the evidence establishes, and what you should verify or fix. This build adds a usable observation/decision harness around your coding-agent session. It is a step toward the full investigation/review/repair/retest workflow, not a claim that an autonomous investigator is complete.

```sh
npm run synapse:workbench
```

Open the printed loopback URL. No external sign-in, model API, paid dependency or production access is needed. The workbench creates one fresh owned synthetic application; all records are fictional.

## What you can do

**Run next step** executes the displayed typed proposal. Its question, reason and supporting observation IDs are saved before execution. **Continue rules frontier** repeatedly chooses the next distinct eligible step from current observations. Profiles and returned records establish which IDs, roles and states can be considered; new evidence changes the frontier. These are explicitly deterministic rules, not an LLM or a trained investigator.

Change **Coverage / Workflow** to reorder eligible work. **Pause** stops new pickup after the current action settles; it does not claim an in-flight action was terminated. **Stop target** interrupts/closes the owned application, records the terminal state and prevents further actions against that instance. You may record reviews after stop. **Start fresh after stop** creates a new application and journal, preserves the old record and rotates the HTTP session nonce.

Open the decision ledger to inspect actual normalized responses, observed principal/tenant/role, source hash, response byte digest and completeness. Account setup receipts remain separate from the selected action; an unauthenticated session-creation request is not relabeled authenticated. Stored evidence is a projection, not raw HTTP. Credential headers and synthetic session secrets remain in memory.

**Propose a step from your coding-agent session** lets the current agent supply the question, interpretation of prior observations and next typed action. It must cite existing complete observations for object work and remains subject to the same gate. Rules and session-authored decisions are labeled separately. The workbench executes no shell, target-provided instruction, arbitrary URL/header/payload or provider call.

A separate reviewer can record an interpretation, observed consequence, possible damage, suggested repair, manual verification and objections. The review must cite its executed decision's actual observation. Reviewer names are declarations on a shared host; they are not authenticated isolation or proof of an independently reproduced effect. No observation is automatically promoted into a verified vulnerability.

**Save report snapshot** writes a self-contained HTML report and matching JSON beside the journal. The HTML includes per-decision normalized observations, rejected-proposal reasons, full review history, owner requests and omissions. Opening a report does not run the investigation.

## Working through an existing coding-agent session

Ask the session to read the current workbench state and explain why a next step is worthwhile. The local interface is:

| Route | Meaning |
| --- | --- |
| `GET /api/state` | Current evidence, decisions, next suggestion, revision and local nonce |
| `POST /api/step` | Execute next rules suggestion, or a supplied typed `proposal` |
| `POST /api/steer` | Change `priority`, or set `mode` to `pause` / `resume` |
| `POST /api/review` | Record a separately declared review with cited evidence |
| `POST /api/stop` | Close the owned target; stop takes precedence over stale views |
| `POST /api/new` | Start a fresh session only after stop; old records remain |
| `POST /api/export` | Write an immutable report snapshot |

POST commands use JSON, exact same-origin `Origin`, the state nonce in `x-workbench-nonce` and `expectedRevision`. A proposal has `question`, `reason`, `evidenceIds` and `action`. The only action kinds are `page`, `profile`, `orders`, `order` and `transition`; the target adapter validates actors, fields and previously observed objects. The session cannot alter scope through a proposal or a reviewer/request record.

Use the UI or the PC's existing computeruse harness for browser interaction. The surrounding coding-agent session still has its own capabilities outside this interface. This gate constrains workbench execution; it is not a sandbox for that session or protection against another process running as the same Windows user. The nonce provides browser request hygiene, not multiuser authentication.

## Continuation and honest limits

The ordinary local frontier covers all four supplied member/approver identities, own-object details, selected positively controlled cross-organization reads, sequential role/state controls and legitimate submission/approval with fresh owner reads. The concrete six-record practice case exhausts in 50 actions / 54 HTTP requests. That count is engineering coverage for this app, not discovery accuracy or a security score.

Limits are 52 selected actions, 60 total target HTTP requests including setup, 64 KiB per response, a 2-second event-loop request deadline, 90 seconds cumulative request execution and a 30-minute target admission lifetime. Exceeding a boundary produces incomplete/unvisited work, never a clean result. There is no OS-level CPU preemption. The measured diminishing-useful-returns signal from Stage 5 remains deferred; current stopping uses budgets, finite-frontier exhaustion and owner stop.

Remaining work: broader session-authored hypothesis/interpretation practice, independently reviewed evidence and effect predicates, owner verification, matched repair/retest, and controlled performance comparisons. Browser behavior, concurrency, other stack layers, real-client fidelity and live application scope remain outside this increment. No finding or repair is fabricated when the app behaves correctly.

The journal reuses the existing hash-chain/CAS store. A crash may leave an unresolved intent or lock; do not replay mutations automatically or steal the lock. A new process starts a fresh in-memory target. Saved history can be reconstructed offline with `readWorkbench(directory)` from `src/practice/workbench.mjs`; that does not resume target execution. Shared-account rewriting, tail rollback without a retained prior head and power-loss durability remain explicit limitations.

Purpose check: [Aiko's review](adaptive-loop-purpose-review-aiko.md). Design and research basis: [session-workbench-design.md](session-workbench-design.md). Overall continuation: [build-plan.md](build-plan.md).

Build validation on 2026-10-18: **80 focused tests passed, zero failures or skips**. The independent integration review reproduced and caught stale-request and old-continuation generation races before their fixes; both now have passing regressions. Stop also preserves the derived owner-request ledger through reopening. Source hashes and the observed local acceptance run are in [session-workbench-receipt.json](session-workbench-receipt.json). Aiko accepted the purpose/claim alignment after source and test review; that review is not independent target-effect reproduction.
