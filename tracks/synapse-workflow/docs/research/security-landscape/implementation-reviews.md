# Implementation reviews and end-to-end walkthroughs

Reviewed 2026-10-17. Full-file reads were split into bounded outputs where necessary. Early oversized outputs were truncated; those were not accepted as full coverage and the selected files were re-read. [source-reads.json](source-reads.json) records exact hashes, commits, ranges and unfinished dependencies. Lines below use the saved snapshots; local NBRET is a dirty working tree and is pinned by file hash rather than falsely attributed to committed `main`.

## 1. NBRET: explicit case to assertion and report

### Control and data flow

`runChecks(config)` validates case/expectation configuration → `runProbe` prepares scoped requests → `requestBounded` collects a bounded response → `runProbe` parses/redacts JSON and stores request/response evidence → `evaluateExpect` evaluates explicit properties → `runChecks` builds snapshots, optionally compares a baseline, and writes JSON/Markdown/JUnit.

An offline `probeFile` takes a separate path directly into evidence matching and assertions. It makes no HTTP calls. Both paths operate on supplied test cases; neither invents an authorization matrix or discovers a vulnerability by itself. The [new lab](lab-results.md) exercises this complete workflow.

### `src/scope.mjs`, complete file

| Lines | Operation / significance |
| --- | --- |
| 1–9 | Requires a nonempty list of HTTP(S) origins; rejects credentials, path, query and fragment; normalizes origins into a set. Configuration is trusted authorization input. |
| 10–15 | Tests exact URL origin and rejects user/password. Scheme, hostname and port matter; subdomains are not implicitly included. |
| 16–22 | `require` fails outside scope and returns a normalized URL. This is URL selection, not DNS/IP egress enforcement or a signed authorization check. |

`test/scope.test.mjs` fully checks scheme/port/subdomain/lookalike-host escapes and malformed origin entries. It does not test DNS rebinding, IP transitions or an independent firewall.

### `src/http.mjs`, complete file

| Lines | Operation / significance |
| --- | --- |
| 1–15 | Selects Node HTTP/HTTPS and validates credential-free HTTP URLs, byte budgets and timeout. This lower-level function has no origin allowlist of its own: callers must enforce scope. |
| 16–24 | Keeps completion state, counters, chunks and a single failure path that clears the timer and destroys streams/request. |
| 25–35 | Sends one request, negotiates compression, rejects unsupported encodings, counts wire bytes and handles aborts/errors. No redirect-following loop exists. |
| 36–49 | Counts decoded bytes independently, bounds memory, decodes and resolves UTF-8 text. A successful transport is not a security verdict. |
| 50–57 | Enforces wall-clock deadline, normalizes DNS/TLS/connect failures and ends the request with the supplied body. There is no retry that could silently repeat a write. |

### `src/probe.mjs`, complete file

| Lines | Operation / significance |
| --- | --- |
| 1–19 | Imports scope, transport and redaction; derives recursive value shape and a method/origin/path contract key. Contract grouping intentionally omits query and identity. |
| 20–42 | Validates all bounded cases before execution: scope, status expectation, method allowlist, explicit write opt-in, body and header restrictions. “GET” still relies on application semantics; it cannot guarantee no server-side effect. |
| 43–50 | Creates a new output directory and initializes evidence, coverage and total deadline. Fresh-directory creation avoids overwriting earlier runs. |
| 51–71 | Sends each prepared case using original URL/headers/body; saves cleaned request/response JSON, status and hash; records redirect scope without following it. Non-JSON text is omitted. Errors become explicit codes, not passes. |
| 72–88 | Tracks elapsed time and output budgets, explicitly drops bodies when required, checkpoints progress and spaces requests. Serial execution limits concurrency but does not constitute a network sandbox. |
| 89–99 | Compares same-contract observations for status/shape/body changes and derives completion. This comparison does not control for account, tenant or state. |
| 100–112 | Enforces final output size, marks omissions/incomplete status and saves final/progress records. Metadata too large can throw; filesystem-write recovery is not a durable workflow transaction. |

The redaction dependency is **partially** inspected: `capture.mjs:1–39` recursively masks secret-shaped keys and selected URL fields. It is not a general content secret detector. In-memory original credentials can be sent while evidence is redacted; nested innocuously named secrets may survive. An evidence hash is calculated over cleaned body content, not raw response bytes or trusted origin.

### `src/assertions.mjs`, complete file

| Lines | Operation / significance |
| --- | --- |
| 1–13 | Restricts matcher names/types; rejects unknown expectations rather than treating them as success. |
| 15–23 | RFC6901 pointer traversal uses own properties, distinguishing missing from undefined/inherited names. |
| 25–42 | Redacted values yield unavailable. Existence/type/value/length/range properties yield individual pass/fail results. Absence is a valid check only when the structured body exists. |
| 44–58 | Validates status, duration, header and JSON expectations before evaluation. |
| 60–75 | Missing response or missing structured body becomes unavailable; header keys normalize; no configured assertion is unavailable. A user-specified weak oracle can still pass a vulnerable response. |

### `src/checks.mjs`, complete file

| Lines | Operation / significance |
| --- | --- |
| 1–26 | Imports dependencies; canonical hashing, escaping and sampled schema summaries. Arrays sample at 2,000, recursion caps at 15, and large objects become dictionaries; changes beyond sampling can be missed. |
| 27–38 | Clones body, removes explicit volatile paths, records status/content type/schema/hash. Snapshot equivalence is bounded by omission and configured ignores. |
| 40–53 | Compares saved tests by key and change kind, including missing snapshots and removed cases. A matching name is not proof of identical scenario identity. |
| 55–75 | Validates policies/cases, creates a new directory, reads offline probe evidence or executes the probe. |
| 76–88 | Matches offline records by method, sanitized URL and cleaned body; evaluates assertions and folds failed/unavailable states. **Headers/identity are not compared.** The follow-up lab confirms a wrong-identity saved response can be selected. |
| 89–95 | Compares optional baseline; only configured change types fail the policy; produces counts and final status. Default status/schema policy does not fail merely on every body or removed-case change. |
| 96–109 | Emits machine/readable/JUnit outputs, XML-escapes values and marks unavailable tests skipped; regression failures get their own case. Reporting does not independently adjudicate the oracle. |

### Tests and trust boundaries

`test/testing.test.mjs` was fully read (1–184): transport compression/abort/budget checks (18–38), assertions/redaction (40–52), static parsing without execution (54–73), live/offline regression and POST body matching (75–109), analysis evidence links (111–134), diagnosis categories (136–150), fake harness/UI constraints (152–169), and total-output omission (171–184). The focused suite ran successfully: nine tests, [receipt](test-receipt.json). Browser inventory tests use a fake harness; they do not validate an actual browser here.

Boundary map: trusted configuration/allowed origins → live network → untrusted headers/bodies → parsing/redaction → persisted evidence → analyst-defined assertions → reports. Scope and write gates run before requests. No model controls this path, no credential discovery occurs, retries are absent, and servers remain external to the library's lifecycle. The lab runner owns and closes its own fixtures.

**Finding NBRET-E01, locally validated:** offline observations need an explicit identity/session/configuration binding or must be declared ambiguous. A direct header comparison cannot be the whole fix because real authorization headers may be intentionally redacted. A non-secret identity label bound to the capture and case, plus rejection of ambiguous matches, is a candidate mechanism. No production fix is applied in this research.

## 2. garak: probe result to detector score to report

Pin: [`cc1215c5c301a69f115b0b2b7ef8e4172ae2e7fc`](https://github.com/NVIDIA/garak/tree/cc1215c5c301a69f115b0b2b7ef8e4172ae2e7fc). This is an AI system **being tested**, not a network-agent execution policy.

### Full-file annotations

[`garak/harnesses/base.py`](https://github.com/NVIDIA/garak/blob/cc1215c5c301a69f115b0b2b7ef8e4172ae2e7fc/garak/harnesses/base.py):

| Lines | Operation / significance |
| --- | --- |
| 1–49 | Imports and initializes enabled language/intent services; service setup failure is raised. Services can add dependencies and processing destinations. |
| 51–80 | Writes plugin metadata/version/run records. This improves interpretability of later reports; it does not validate a detector's accuracy. |
| 82–127 | Loads configuration and optional transformation plugins, recording load errors. Extensions are executable code, not untrusted text sandboxed here. |
| 129–158 | Changes/restores HTTP user agents and runs a detector over attempts, storing its scores. |
| 159–195 | Requires nonempty probe/detector lists, starts hooks and records initial plugin identity. |
| 196–274 | Checks modality, invokes probes, runs configured detectors or intent-selected detector subsets, and records dynamically loaded metadata. Selection logic changes which oracle is applied. |
| 277–302 | Writes completed attempts, invokes evaluator and restores HTTP agents on normal completion; modality matching checks containment or exact match. End-hook restoration is not wrapped in a `finally` in this file; exception cleanup deserves a separate runtime test. |

[`garak/evaluators/base.py`](https://github.com/NVIDIA/garak/blob/cc1215c5c301a69f115b0b2b7ef8e4172ae2e7fc/garak/evaluators/base.py), complete 1–544:

| Lines | Operation / significance |
| --- | --- |
| 1–61 | Loads formatting/calibration/statistics helpers; base evaluator fails scores unless subclass policy overrides. |
| 63–145 | Iterates detector scores, counts `None` separately, folds pass/fail under `test`, and writes hit logs with prompt/output/attempt/run/probe/detector identifiers. Raw content handling needs engagement-specific review. |
| 147–196 | Computes evaluated versus processed totals, optional hit-at-k, and bootstrap intervals using configured detector sensitivity/specificity. Statistical precision cannot remove a wrong oracle or biased sample. |
| 198–251 | Prints and persists evaluation records, optional intent breakdowns and confidence fields. |
| 253–340 | Materializes attempts, counts inference outputs separately from detections, groups by detector, aggregates and writes probe summaries. Multiple detectors can score the same output; summing their counts is not a unique-output denominator. |
| 342–370 | Calibration score/rating and hit-at-k display helpers. |
| 372–520 | Wide/narrow formatting; zero evaluated outputs display SKIP rather than PASS; optional failure excerpts are printed. |
| 523–544 | Zero-tolerance and threshold policies: exact 0 passes in the first, score strictly below threshold passes in the second. Score semantics depend on detector and evaluator pairing. |

Full supporting files: `generators/test.py:1–208` provides deterministic empty/repeat/fixed/None stubs plus random lorem/reasoning stubs; `probes/test.py:1–50` defines non-production test prompts; `detectors/always.py:1–55` returns fixed, passthrough or random scores. These are infrastructure test doubles, not genuine security detectors.

### Cross-file path and test evidence

For a basic configured probe, `harness.run` calls `Probe.probe`. The inspected contiguous `probes/base.py:311–472` builds attempts from prompts (including localization), applies buffs, dispatches serially or via a process pool, calls generator, postprocesses and writes attempt records. `generators/base.py:138–245` manages seeded generation, dispatch count/concurrency, output-count validation and output postprocessing. A test `Repeat` generator simply echoes the last input. `always.Pass` returns zero scores; threshold evaluation counts them as passes. That path proves bookkeeping behavior, not model resistance.

`tests/harnesses/test_harness_intent_plugin_cache.py:1–146`, fully read, uses a stubbed single probe result, a real intent service/detector loader and an offline Repeat generator to ensure dynamically selected detector metadata reaches reports/digests. `tests/evaluators/test_base.py:1–185`, fully read, checks rating stubs, per-intent score totals, `None` accounting and detector-specific subsets. Its **test-local** ThresholdEvaluator intentionally uses the opposite threshold polarity from the production threshold subclass; don't mistake the test fixture for production behavior. These tests were read, not executed here.

**Limits:** base probe/generator files are partial reads; plugin initialization, attempt schema, translation, every real detector/provider, remote egress, cost and retry policies remain unfinished. No scoped-network execution allowlist was established by these evaluation files. Untrusted model content is input to detectors, not evidence that a tool action occurred. Whole-agent validation needs actual tool/access traces and an independent outcome oracle.

## 3. PentestGPT: model proposals, trace grounding and execution boundaries

Pin: [`e8b1bb77d1ac00329675cec3b060aba971ec1ac8`](https://github.com/GreyDGL/PentestGPT/tree/e8b1bb77d1ac00329675cec3b060aba971ec1ac8). This review specifically covers `pentestgpt_agent`, not the root legacy or obsolete wrapper implementation. No model calls or testing-agent commands were executed.

### `pentestgpt_agent/src/pentestgpt_agent/agents.py`, complete 1–641

| Lines | Operation / significance |
| --- | --- |
| 1–97 | Supervisor/executor prompt contracts: target content is untrusted; task types have different purposes; provider tools and shell/file access remain available. Prompt instructions constrain intended behavior but are not an OS/network sandbox. |
| 99–216 | Strict structured-output schemas and per-task turn budgets; proposals include target, objective, completion condition, basis and dependencies. |
| 219–255 | Enforces exact keys; supervisor calls a trace-wrapped role episode with run/revision identity and parses the result. |
| 258–357 | Executor verifies active lease/task, builds provenance from prior observations, derives bounded task turns plus a result turn, includes retry diagnostics and invokes its episode. |
| 360–471 | Builds a compact supervisor state: open/recent tasks, required dependency context, canonical observations and separately labeled diagnostics. Pruning is a model-context policy, not proof that omitted history is irrelevant. |
| 474–544 | Parses and type-checks supervisor/executor JSON into typed proposals; it does not prove natural-language summaries are true. |
| 547–593 | Recovers structured-output candidates from captured calls, skipping malformed/empty-evidence completion candidates. |
| 596–641 | Parses task fields and string-tuples; exports contracts and role helpers. |

### `execution.py`, complete 1–392

| Lines | Operation / significance |
| --- | --- |
| 1–48 | Defines outcomes, proposals, compiled results and evidence-quality flags. |
| 51–79 | Exact excerpt matching also tolerates CRLF/LF changes while retaining original offsets. |
| 82–157 | Builds bounded contiguous spans from ordered exact lines or unique-line envelopes. Widening changes what context is retained and is labeled. |
| 160–239 | Collects eligible grounding receipts, supports explicitly flagged single-receipt projection, and matches excerpts with a 4,000-character bound. |
| 242–268 | Finds a bounded fallback receipt or newest same-task prior observation. Same-task reuse is explicit rather than invented fresh execution. |
| 271–309 | Checks task/run/revision/attempt/episode identity and successful or narrowly recoverable transport, then validates summary length. |
| 310–354 | Matches evidence or prior observations, optionally falls back, and downgrades a claimed DONE to PROGRESS for fallback/truncation/unresolved evidence. |
| 356–392 | Completion requires captured/reused evidence; returns provenance and quality flags. It validates source grounding, not whether the quoted output semantically proves the claimed vulnerability or goal. |

### `loop.py`, complete 1–315

| Lines | Operation / significance |
| --- | --- |
| 1–81 | Opens canonical run state, recovers active lease, caps supervisor decisions and drives one task at a time. |
| 83–122 | Reuses recoverable supervisor episodes, validates identity/revision, compiles plans, or retries a bounded contract correction. |
| 124–182 | Existing executor trace is recovered rather than blindly replayed; new episodes are compiled before committing memory. |
| 184–258 | Distinguishes truncated/corrupt/interrupted/validation/provider outcomes; attempts structured-output recovery; retries only selected failures without action receipts. |
| 260–315 | Commits failure/retry state, validates one active task/attempt/revision and derives episode identity. Persistence and plan compilers remain separate trust boundaries. |

### Boundary checks, tests and unresolved work

The inspected `trial.py:68–104` intentionally configures both roles with `SandboxPolicy.FULL_ACCESS` and says deployment isolation is the security boundary. Thus a checked task target in canonical planning does not itself block a shell command to another address. The partial `plan.py:157–220` validates revisions, target membership and basis/dependency structure, with some phrase checks for TEST versus EXPLOIT. It is not packet-level mediation of provider tools.

The partial `trace.py:342–367` distinguishes action receipts from grounding receipts: command output with an integer exit code can be evidence even for a nonzero result; ordinary tool results require no error and exit code 0/None, and StructuredOutput is excluded. A command printing attacker-provided text can still produce an exact quote. Grounded text is not trusted truth.

`tests/test_execution.py:1–220` was inspected alongside the compiler: extra output fields reject; invented evidence may fall back to captured output and become PROGRESS; same-task evidence can be reused; another-task reuse is a negative case. The rest of this 1,014-line test file is not yet reviewed. No tests were run for this upstream project.

**Model controls:** task proposals and tool actions inside broadly enabled provider episodes. **Code controls:** schemas, canonical state transitions, budgets and evidence matching. **Prompt-injection resistance:** explicit instructions exist; no independent runtime resistance measurement or hard network boundary was demonstrated. **Human approvals:** no mandatory per-action approval established in the reviewed trial/role path. **Memory:** canonical snapshots/leases are passed to the model, but the 1,003-line memory implementation and external wrapper remain unreviewed. **Costs:** trace result serialization exposes usage/cost fields (`trace.py:403–415`); no provider bill, reproducibility or hard dollar ceiling was validated. **Cleanup:** replay conservatism reduces duplication risk, but target-state teardown and rollback are not established by these files.

The [USENIX 2024 publication](https://www.usenix.org/conference/usenixsecurity24/presentation/deng) reports earlier benchmark results and context-management challenges. The current README explicitly treats its December 2025 XBOW result as historical and reference-only. Neither proves reliable autonomous testing in customer environments under the code reviewed here.
