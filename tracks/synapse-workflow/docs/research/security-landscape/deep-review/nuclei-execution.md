# Nuclei template execution → event → output

Pin a151a1d54fad0d5ef71f01662b0bb3955a98c7c5, accessed2026-10-17. Source reading below, not template-engine runtime validation. [Executor source](https://github.com/projectdiscovery/nuclei/blob/a151a1d54fad0d5ef71f01662b0bb3955a98c7c5/pkg/tmplexec/exec.go). Queue extended for exact tmplexec dependency files; unread entries are inventory, not coverage credit.

## tmplexec/exec.go1–322 complete

1–61 constructs shared atomic result state, compiles Flow syntax or selects generic for one request and multiproto otherwise.63–98 compiles each protocol and engine and sums request counts; compile-time count cannot establish actual sends/retries/fuzz branches.100–138 emits optional stats start/finished (finished deferred on errors too) and arranges template-context removal. Local executed/matched/callback booleans are separate from shared e.results.

140–192 callback suppresses all-internal matcher events; remembers no-result event or calls writer; matched reflects writer boolean, not independent proof vulnerability or persistence.193–224 makes fresh Flow executor per target, executes engine, logs error and optionally writes last matcher failure with cause.226–259 creates synthetic failure only when callback never called and MatcherStatus enabled; result boolean includes failure-event attempt. Thus false/true is not a complete coverage/clean-scan summary.261–282 cause normalization removes some timeout wrapping;284–307 result-returning API executes engine, logs error and returns context results plus engine return error. If engine logged errors internally then returned nil, caller must inspect context/results/logs.309–322 template-type reporting.

## generic/exec.go1–96 complete

1–35 retains request/options/results and no additional compile step.37–60 copies input args, checks cancellation, clones input and transforms target unless offline response; empty transformed input returns nil without a protocol call.61–88 invokes protocol, carries prefixed history, marks atomic on HasOperatorResult and logs events/errors, updates host-error cache and early-stop. Protocol errors are logged/warned but **function returns nil** at89. For real no-match/error completeness inspect ScanContext, not only returned error. Callback locking is delegated to context; file comment still says callback not concurrently safe. Generic normally receives only one request through constructor selection, constraining early-stop implications.

## multiproto/multi.go1–168 complete

1–63 precomputes variables/constants/options and separately tracks template-owned values.65–104 checks cancellation, merges args/template values and sequentially iterates protocol queue with cloned/transformed input. Despite interface comment saying parallel, implementation is sequential.105–145 logs events, exports internal extractions into shared template context, reevaluates variables; array extras become suffixed names, HTTP-only iterate-all disclosed.147–161 logs errors; special SSL error branch continues but ordinary error also falls through to next request because no break/return appears. Comment "fatal error skip next" does not match this body. Returns nil after queue; input transform/cancellation can exit earlier. No source claim that the full scan is successful follows from nil here.

## interface.go1–72 and utils/utils.go1–49 complete

Interface1–37 defines engine methods; comment parallel multiproto is stale relative to current sequential implementation.39–72 prettifies colon-delimited errors, skips deadline messages and strips kind labels; normalized text can lose original structured context. Utils1–36 prefixes previous event fields by requestID while avoiding selected duplicates;38–49 preserves offline raw response instead of target transformation. Internal event/prefix identity is separate from principal/environment identity.

## scan/scan_context.go1–136 complete

1–49 holds context/input/callbacks/error/warnings/results with mutex.51–66 returns context, raw error and results slice; results are not cloned.68–89 serializes event callback under lock, optionally retains event and appends result pointers.91–116 logs error/callback, appends aggregate error and mutates existing results/error metadata.118–136 stores warnings and updates retained events. Callback reentry into locked methods can deadlock; actual API hooks must be traced before claiming occurrence. LogEvent runs OnResult before appending new results, so later error mutation/stream writing chronology matters. Error returned by engine can differ from accumulated context error.

## helpers/writer/writer.go1–46 complete

[Original](https://github.com/projectdiscovery/nuclei/blob/a151a1d54fad0d5ef71f01662b0bb3955a98c7c5/pkg/protocols/common/helpers/writer/writer.go).1–19 requires operator result.20–46 attempts each out.Write; honeypot suppression prevents issue creation/count increment, other errors warn but still permit issue creation and matched-count increment. Boolean matched becomes true for any iterated result **even on output error or suppression**. Therefore executor comment "matched means exported/written" is stronger than implementation guarantee. No independent output durability receipt or replay-validation step here. Research never configures issue tracker clients or sends external reports.

## Remaining workflow boundaries

Flow VM permissions/timeouts, engine caller/context consumers, actual writer implementations and reporting exporters, clustering/resume/state reuse, native policy dependencies and tests remain queued. Do not equate matcher boolean, internal extraction, attempted output, persisted report and validated security impact.

## Flow VM: vm.go1–121 complete

[Pinned VM](https://github.com/projectdiscovery/nuclei/blob/a151a1d54fad0d5ef71f01662b0bb3955a98c7c5/pkg/tmplexec/flow/vm.go).1–30 creates shared pool from protocolstate JS runtime with builtins.32–54 first initialization raises JsConcurrency to at least100, fixes pool size using first options, waits Get with context.TODO and returns reusable or replacement runtime. This is not per-scan cancellable pool acquisition.56–121 exposes log, iterate and Dedupe; log can print arbitrary template values, so report/privacy boundaries depend on how operators supply data. No native module registry is established in this file; compiler/gojs dependencies determine broader capabilities.

## flow_executor.go1–362 complete

1–111 groups requests by protocol and tracks per-request counts; offline HTTP is mapped to http callback, with append using offline-key slice (multiple-section behavior requires test).113–214 compiles template vars, optionally loads existing file-valued strings through LoadHelperFile, registers request IDs/index callback names and flattens tracked single-value extractions before execution. No model chooses tests: **template-authored Flow JS controls protocol calls**.

216–263 checks initial cancellation, acquires pooled runtime, schedules deletion of set/template/protocol bindings/context ID and reuse based on compiler.CanRunAsIIFE. Non-CI panic recovery logs error but function has unnamed error return, so recovered panic can return nil; context error remains separate.264–304 installs set/template/protocol globals, runs program directly, reconciles progress, returns JS/runtime errors. **No runtime interrupt/deadline hook is visible around RunProgram here**; do not claim protocol HTTP timeouts bound a pure JS loop. That requires compiler/runtime/caller review and a safe child process fixture, not an in-process infinite-loop test.306–327 counts unexecuted Flow requests as processed, adds repeated executions to total and combines runtime errors. Progress completion therefore expressly includes skipped branches.329–362 reads helper file linewise then retains all nonempty lines; streaming read does not make resulting list constant-memory.

## flow_internal.go1–139 and util.go1–41 complete

Internal1–30 reevaluates variables and republishes template after each protocol call.31–62 no-ID mode executes sequentially and stops that callback on first error;64–94 explicit-ID mode records missing ID and returns, records execution errors but can continue later IDs.95–139 callback logs event first, updates boolean/extraction state; no matchers/no operators can yield **true to Flow condition without a vulnerability finding**, by design. Util1–41 only checks presence of matchers/operators and flattens one-element slices. Request conditions, extraction, output and security impact are distinct.

## flow_executor_test.go1–417 complete, NOT RUN

1–52 setup imports templates/testutils and initializes shared options.54–191 several tests target actual public DNS/HTTP names. **Those tests are not authorized local labs and were not executed.**193–341 owned httptest fixtures exercise request-history and payload/header extraction.343–417 checks Flow skipped/repeated progress using local loopback server and temporary synthetic templates. Those local candidates still depend on full templates package currently blocked by Windows module archive; do not rerun blocked dependency or widen to TestFlow*. Fixtures/templates/helper dependencies need exact read before any selected local execution. No full Flow runtime results claimed.
