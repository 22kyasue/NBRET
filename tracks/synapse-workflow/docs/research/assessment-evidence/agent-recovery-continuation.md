# PentestGPT recovery and prompt projection continuation

Reviewed 2026-10-17 at PentestGPT e8b1bb77d1ac00329675cec3b060aba971ec1ac8 and UnifiedAgent acff8eeadf93e367d4a1578d3a2739cbc9d3ace5. This extends the active exhaustion queue; it does not close it. The queue records full-file ranges separately from runtime evidence.

## Recovery is conditional on the journal

Complete test_loop.py (1–1711) and a fresh complete loop.py (1–314) read connect these behaviors:

* loop.py 44–81 returns terminal persisted state before provider invocation and counts persisted plan commits against the decision budget. Tests 832–896 and 1559–1635 exercise those cases by constructing state and re-opening a MemoryKernel in the same pytest process. Despite test names mentioning process restart, they do not terminate and restart an OS process.
* loop.py 83–122 recovers supervisor output only with successful, non-truncated trace and matching run, episode, role and revision, then recompiles the plan. Invalid proposals receive a new logged episode and bounded attempts. Tests 1220–1372 cover completed-but-uncommitted supervisor output, rejected target proposals and exhausted contract failures. The target proposal is data; no connection to the out-of-scope documentation address occurs.
* loop.py 124–182 distinguishes an existing journal from a new episode. Missing initialization may receive a new attempt; malformed required files settle terminally. Tests 899–1217 create the pre-commit window by directly executing the scripted Executor, deliberately omit output.json, or create an empty episode directory. Tests 1638–1711 write malformed input into owned temporary files. These are reproducible state fixtures, not power-loss experiments.
* loop.py 184–258 first rejects truncated tails, then tries successful output or narrowly typed structured-transport recovery. Candidates are checked without evidence fallback first; an older exact candidate can beat a newer ungrounded one. agents.py 547–588 supplies newest-first candidates, with a single exact marker repair for one malformed shape. Tests 1423–1556 retain original failed episode status while canonical state can complete. A provider transport failure and an accepted task result therefore coexist; reporting one undifferentiated success bit loses evidence.
* trace.py 342–350 treats command_started, command_run, file_changed and non-StructuredOutput tool_call as action receipts. loop.py 247–251 permits failure retry only for provider/validation/interruption, no truncated tail and no such receipt. memory.py 744–875 uses BEGIN IMMEDIATE, revision/active-state checks and attempt-count limits to atomically settle or lease another attempt. Tests 601–769 contrast terminal post-action failure with a pre-action provider retry.

**Limit/inference:** absence of a journaled action is not proof that the SDK or external tool caused no effect. This layer receives events after/between provider work; its SQLite transaction does not transact an external operation. The tests establish conservative behavior for represented events, not exactly-once execution across the tool-to-journal gap. Smallest credible follow-up: an inert local counter tool with an injected stop between counter increment and durable event append; compare recovered counter and attempt state. Disproof of the gap for a specific backend requires tracing an enforced pre-dispatch durable intent/idempotency protocol, not merely another successful restart test. No such OS-crash/tool experiment was run here.

## Prompt projection preserves selected context, not all knowledge

Complete test_supervisor.py (1–349), test_executor.py (1–210), and agents.py 350–640 re-read:

agents.py 360–470 includes all open tasks, four recent closed tasks, required basis producers/dependencies, six recent observations plus required observations, and four diagnostic attempts. Feedback is sliced to 1,000 characters. Tests supervisor 155–317 confirm required old basis survives and successful DONE summaries are excluded; 320–336 checks feedback truncation. These are bounded recent slices, **not a fixed total token/byte bound**: open tasks, required references, goal, objectives and evidence can still grow. They are also not full-history retrieval or measured learning across engagements. No cross-customer memory benefit follows.

The executor tests 71–153 and 171–210 capture declared per-kind budgets, one reserved transport turn, prior same-task evidence and retry diagnostic separation. Their backend merely records RunOptions; they do not prove that every provider SDK enforces max_turns. Prior UnifiedAgent source review established the backend-specific forwarding difference. Tests asserting instruction substrings (supervisor 111–128; executor 156–168) establish prompt presence, not compliance or a tool permission boundary.

support/local_target.py was read completely (1–94): owned loopback/ephemeral-port ThreadingHTTPServer, fresh random synthetic flag, restricted regex arithmetic rather than eval, normal/vulnerable response switch and finally shutdown/close/join. It was **not invoked** by these selected tests. This is a deliberately simplified oracle, not a real template engine or a demonstration against a third-party application.

## Runtime receipts

Predefined success criteria: unchanged selected test files pass with script/capture backends and isolated temporary storage; no provider calls, dispatched shell commands or HTTP requests. Source-path imports and package freeze are retained; this is not a fully locked SDK installation.

| Receipt | Result | What it supports |
|---|---|---|
| agent-recovery-receipt-1792273419521.json | 20 passed, 1.95 s | Loop state/journal cases above, in-process reconstruction |
| agent-recovery-receipt-1792273450429.json | 16 passed, 0.19 s | Captured prompt/schema/options contracts |

These extend earlier episode/execution (34) and trial (12) selected tests; test counts are not independent security experiments or a coverage percentage. Original commands, source/log hashes, elapsed time, package versions, researcher intervention and preserved runner hashes are in each JSON receipt. No paid inference cost. verify-continuation.mjs verifies receipt provenance without rerunning experiments.

Next accessible work: complete plan tests and remaining package/test/config/docs inventory, then UnifiedAgent monitor HTTP/UI and SDK dependencies. Outstanding uncertainty includes external-effect atomicity, permission enforcement below this wrapper, environment freshness on resume, and whether bounded prompt selection changes measured security outcomes.

## Plan compiler boundary, subsequent complete read

Complete test_plan.py 1–770 and plan.py 1–344 re-read resolve additional distinctions. plan.py 91–154 compares normalized HTTP(S) origin and decoded path segments (with ambiguity rejection), or exact non-HTTP target text. It does not inspect commands, resolve DNS, restrict redirects or gate SDK dispatch. Its error text 195–196 requests exact copying, but the implementation and positive test 104–131 allow a same-origin descendant URL. Instruction wording therefore is not the precise accepted language.

plan.py 157–275 bounds individual proposal fields, proposes at most one immediately selected new task, checks observed basis IDs, producer dependencies and cycles. This narrows the preceding prompt-size concern for normal compiled state: individual task fields and basis/dependency counts are bounded and only one task is leased at a time. It still is not an explicit total prompt/token budget, and RunSnapshot can also be constructed by library callers as the tests do. Distinguish reachable normal canonical state from arbitrary dataclass fixtures.

The latest same-target completed TEST requirement (222–243) is a provenance prerequisite. Exact target text includes the query (tests 478–519). No predicate here determines that the TEST evidence demonstrates a vulnerability or that an EXPLOIT objective is authorized in substance. TEST/exploitation separation (79–88, 200–204) is a finite English substring rule, not a semantic oracle or execution filter. No bypass experiment or external activity was performed.

Finish validation 277–304 checks no open tasks, one to four unique existing basis IDs and completed producer tasks. It does not compare the evidence with the run goal. Test 566–622 accepts `200 OK` from completed discovery for the generic assessment goal; helper 17–63 constructs ValidExecution directly and inserts it without retrieving a trace. Thus these compiler tests establish structural consistency, not factual grounding or goal satisfaction. Caller-level compile_execution/audit provide other checks, but prior canary lab already separates quote grounding from independently observed effect.
