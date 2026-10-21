# Workers and queues: admission, leases, cancellation, effects

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 26 findings, 68 related corrections, 18 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.anti-blocking-advice`** [bots-swarms/continuation.md:1035](../../bots-swarms/continuation.md#L1035): Adopting evasion/IP-rotation advice for client crawling. **Instead:** Identify crawlers and use negotiated quotas; docs/research/bots-swarms/model.md:60 (study, not operational evasion).
- **`hazard.continuation-next-step`** [bots-swarms/continuation.md:2463](../../bots-swarms/continuation.md#L2463): Outdated next-step instruction; the work is done. **Instead:** Reading is closed per docs/research/bots-swarms/scope-closure.md:30.
- **`hazard.drain-regression-fixture`** [bots-swarms/continuation.md:3058](../../bots-swarms/continuation.md#L3058): Building and running a Redis regression unprompted. **Instead:** Treat as an open hypothesis; requires explicit authorization (repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them")).
- **`hazard.go-flagged-operation-wording`** [toolchain/go-material-review.md:9](../../toolchain/go-material-review.md#L9): Agent infers a specific recovered safety warning or rejected call behind repeated "flagged operation" phrases, or guesses what it was. **Instead:** Treat it as a conservative stop instruction with unknown cause; do not infer or retry (safety-context/README.md:33).
- **`hazard.go-integration-tests-live`** [toolchain/go-material-review.md:1350](../../toolchain/go-material-review.md#L1350): Agent runs upstream SDK integration/perf tests that load AWS config and create/delete real buckets. **Instead:** Do not run; go-material-review.md:1348 heading says do not run; research is source-only.
- **`hazard.go-jsonschema-example-network`** [toolchain/go-material-review.md:1200](../../toolchain/go-material-review.md#L1200): Agent runs `go test` on jsonschema and triggers an outbound GitHub request. **Instead:** Run nothing without containment review; filter tests.
- **`hazard.go-partial-file-status`** [toolchain/go-material-review.md:1379](../../toolchain/go-material-review.md#L1379): Agent reports api_client.go as partially reviewed. **Instead:** Completed at go-material-review.md:1391 (1–1372).
- **`hazard.go-prioritized-queue-outdated`** [toolchain/go-material-review.md:1118](../../toolchain/go-material-review.md#L1118): Agent takes the old "Prioritized unread queue" as current next work. **Instead:** Queue was completed later (S3 manager closure go-material-review.md:1361; serializers go-material-review.md:1623); verify in go-material-queue.json.
- **`hazard.go-stale-unread-counts`** [toolchain/go-material-review.md:9](../../toolchain/go-material-review.md#L9): Agent believes S3 module review is incomplete and re-reads or re-plans based on stale counts. **Instead:** Section order is newest-first in lines 3–712; later passages record file closures (e.g. go-material-review.md:1623, 1869, 2049). Check go-material-queue.json.
- **`hazard.go-transport-test-large-workloads`** [toolchain/go-material-review.md:827](../../toolchain/go-material-review.md#L827): Agent runs net/http transport tests with 1GiB bodies, unbounded producers or real DNS. **Instead:** Keep unexecuted; see go-material-review.md:847 (real DNS) and go-material-review.md:881.
- **`hazard.mockserver-all-interfaces`** [bots-swarms/continuation.md:1967](../../bots-swarms/continuation.md#L1967): Reusing Scrapy mock servers as an isolated lab (they bind all interfaces). **Instead:** Bind explicitly to loopback in any authorized lab.
- **`hazard.private-cluster-seeds`** [bots-swarms/continuation.md:1227](../../bots-swarms/continuation.md#L1227): Executing tests that contact private network addresses. **Instead:** Do not run; contacting unscoped targets is out of bounds.
- **`hazard.privileged-compose`** [bots-swarms/continuation.md:2977](../../bots-swarms/continuation.md#L2977): Launching the supplied privileged Compose fixture that deletes /data and binds all interfaces. **Instead:** Do not launch; recorded at docs/research/bots-swarms/continuation.md:2977 as unsuitable.
- **`hazard.requires-internet-tests`** [bots-swarms/continuation.md:2231](../../bots-swarms/continuation.md#L2231): Running Scrapy tests assuming they are offline. **Instead:** Exclude internet-marked tests explicitly; no external contact without authorization.
- **`hazard.scope-closure-redis-integration`** [bots-swarms/scope-closure.md:22](../../bots-swarms/scope-closure.md#L22): Reading the "what would resolve it" column as a to-do to stand up Redis/Postgres/Go integrations. **Instead:** These are conditions for future, separately authorized work; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them").
- **`hazard.status-source-notes`** [bots-swarms/source-notes.md:39](../../bots-swarms/source-notes.md#L39): Re-tracing completed work or claiming it is unknown. **Instead:** Traced at docs/research/bots-swarms/continuation.md:2449-2465.
- **`hazard.tox-aws-credentials`** [bots-swarms/continuation.md:585](../../bots-swarms/continuation.md#L585): Running Scrapy tox environments that pass through cloud credentials and download dependencies. **Instead:** Do not run; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them").
- **`hazard.upstream-flushall-suite`** [bots-swarms/continuation.md:2734](../../bots-swarms/continuation.md#L2734): Running upstream test suites against a shared Redis wipes data. **Instead:** Do not run; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them"); docs/research/safety-context/README.md:37 (do not recreate actions).

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [BullMQ AsyncFifoQueue: a waiting fetch can hang when the last pending promise rejects](#workers-queuesasyncfifo-stranded-fetch) | component-lab | operations |
| [BullMQ cancelJob returns true and aborts a signal, but an ignoring processor keeps working](#workers-queuescancel-acknowledged-not-stopped) | component-lab | operations, testing |
| [Lost lease (renewal failure) only emits events; the running processor is not told to stop](#workers-queueslock-renewal-failure-no-abort) | component-lab | operations |
| [Queue.clean(limit=15000) returned 20000 IDs: batch size ignores remaining limit](#workers-queuesqueue-clean-overshoots-limit) | component-lab | operations, evidence |
| [Blocking-wait watchdog fires, yet the call stays pending while reconnect is pending](#workers-queueswatchdog-not-bounded-return) | component-lab | operations |
| [Obliterate, drain, clean and scheduler removal delete state; none terminates running work](#workers-queuesadmin-ops-not-kill-switch) | source-trace | operations, evidence |
| ["All-or-nothing" bulk/flow insert is false: some roots admitted, others fail](#workers-queuesbulk-flow-partial-admission) | source-trace | operations, testing |
| [Step-checkpoint and batch patterns repeat external effects on retry](#workers-queuescheckpoint-crash-window) | source-trace | operations, testing |
| [Worker close/timeout paths are not hard termination deadlines in any reviewed port](#workers-queuesclose-timeout-not-hard-deadline) | source-trace | operations |
| [Job deduplication suppresses enqueue only; TTLs expire mid-job and IDs can be reused](#workers-queuesdedup-is-admission-not-idempotency) | source-trace | operations |
| [Queue event streams are not an acknowledged journal: in-memory cursor, can skip](#workers-queuesevents-not-durable-ack) | source-trace | operations, evidence |
| [BullMQ "exactly-once" jobs are an unimplemented proposal; reality is at-least-once](#workers-queuesexactly-once-is-a-proposal) | source-trace | operations, commercial |
| [Python BullMQ can emit "completed" locally without a persisted completion on forced close](#workers-queuesforced-close-false-completion) | source-trace | operations, evidence |
| [Several SDK/transport errors are raised after a write may already be applied](#workers-queuesgo-errors-after-applied-writes) | source-trace | operations, testing |
| [S3 multipart upload can return an error after the object was already completed](#workers-queuesgo-s3-manager-error-after-effect) | source-trace | operations, evidence |
| [AWS Go SDK defaults do not bound total request time, uploads or retries in all cases](#workers-queuesgo-sdk-timeouts-and-bounds) | source-trace | operations, scoping |
| [Queue lease tokens guard queue transitions only; they cannot fence external effects](#workers-queueslease-token-not-effect-fence) | source-trace | operations |
| [memberlist: group key is not node identity; Join success is not admission](#workers-queuesmemberlist-group-key-not-node-identity) | source-trace | operations, authorization |
| [Pausing a queue stops new pickup only; active jobs keep running](#workers-queuespause-leaves-active-running) | source-trace | operations |
| [BullMQ language ports differ in semantics despite shared Lua/SQL](#workers-queuesport-parity-not-guaranteed) | source-trace | operations |
| [BullMQ Postgres backend: completion/renewal check the token but not lease expiry](#workers-queuespostgres-lease-expiry-unchecked) | source-trace | operations |
| [attempts:3 = 1 run + 2 retries; broker retries default Infinity; counters reset](#workers-queuesretry-and-attempt-budgets) | source-trace | operations |
| [BullMQ "sandboxed" processors are reused trusted children, not a security sandbox](#workers-queuessandbox-not-security-boundary) | source-trace | operations, evidence |
| [Scrapy JOBDIR resume loses the in-flight request; it is not lease-based redelivery](#workers-queuesscrapy-resume-not-lease) | source-trace | operations, discovery |
| [BullMQ worker counts come from client names: largest node only, unsupported = count 1](#workers-queuesworker-discovery-not-inventory) | source-trace | operations, evidence |
| [Worker control model: lease, attempt token, resource fencing, verified quiescence](#workers-queueskill-switch-sequence) | synthesis | operations, authorization |

### workers-queuesasyncfifo-stranded-fetch

**`workers-queues.asyncfifo-stranded-fetch`: BullMQ AsyncFifoQueue: a waiting fetch can hang when the last pending promise rejects** (component-lab)

Running the actual pinned AsyncFifoQueue class (15 comparisons pass): with default ignoreErrors=false, a fetch started before the final pending operation rejected did not resolve within a 30 ms watchdog even though counts became zero; adding a fulfilled sentinel recovered it. waitAll uses Promise.all and rejects while another promise is still pending.

**Do:** Treat main-loop liveness in the worker as something to test under failure injection before relying on it in production fleets.

**Limits:** Helper-class result; whether the normal Worker reaches this input is unresolved (retryIfFailed often converts failures).

**Sources:** [bots-swarms/continuation.md:2457](../../bots-swarms/continuation.md#L2457)

**Receipts:** `bots-swarms/fifo-receipt-1792267623919.json`, `bots-swarms/fifo-initial-failure.json`

### workers-queuescancel-acknowledged-not-stopped

**`workers-queues.cancel-acknowledged-not-stopped`: BullMQ cancelJob returns true and aborts a signal, but an ignoring processor keeps working** (component-lab)

At BullMQ pin a5e710bf, LockManager.cancelJob aborts the job's AbortController and returns true; it does not untrack the job or await the processor. In a 9-comparison run of the actual lock-manager class (synthetic backend), a processor that ignores the signal still performed its effect after cancellation, and the job stayed tracked (count 1) until explicit untracking.

**Do:** Treat a cancellation acknowledgement as a request, not proof of quiescence. A worker platform must confirm processor exit, close resources and reconcile external effects before reporting a job or engagement step stopped.

**Limits:** Class-level experiment with stub broker and synthetic processor; no Redis, real worker loop or OS process kill was tested.

**Sources:** [bots-swarms/findings.md:17](../../bots-swarms/findings.md#L17), [bots-swarms/source-notes.md:37](../../bots-swarms/source-notes.md#L37), [bots-swarms/cancellation-lab-plan.md:9](../../bots-swarms/cancellation-lab-plan.md#L9)

**Receipts:** `bots-swarms/cancellation-receipt-1792267100379.json`

**Contrary or narrowing evidence:**
- [bots-swarms/continuation.md:941](../../bots-swarms/continuation.md#L941): Same conclusion from the cancellation guide; also notes event listeners cannot preempt blocked JS.

### workers-queueslock-renewal-failure-no-abort

**`workers-queues.lock-renewal-failure-no-abort`: Lost lease (renewal failure) only emits events; the running processor is not told to stop** (component-lab)

BullMQ LockManager renewal failure emits lockRenewalFailed/error but does not abort the processor signal (confirmed in the 9-check class run). The Elixir LockManager only cancels for explicit failed-ID lists; transport errors just log. The Python LockManager likewise emits diagnostics without aborting.

**Do:** A worker that lost its lease can keep causing effects while another worker reclaims the job. Effects against client systems need their own fencing (resource-side idempotency or attempt tokens) rather than relying on lease loss to stop the old worker.

**Limits:** Source traces plus one synthetic class experiment; actual lease-expiry races were not run.

**Sources:** [bots-swarms/source-notes.md:37](../../bots-swarms/source-notes.md#L37), [bots-swarms/continuation.md:539](../../bots-swarms/continuation.md#L539), [bots-swarms/continuation.md:1517](../../bots-swarms/continuation.md#L1517), [bots-swarms/source-notes.md:41](../../bots-swarms/source-notes.md#L41)

**Receipts:** `bots-swarms/cancellation-receipt-1792267100379.json`

**Contrary or narrowing evidence:**
- [bots-swarms/continuation.md:2453](../../bots-swarms/continuation.md#L2453): The upstream test titled Lock Renewal Failure does not actually exercise renewal failure.

### workers-queuesqueue-clean-overshoots-limit

**`workers-queues.queue-clean-overshoots-limit`: Queue.clean(limit=15000) returned 20000 IDs: batch size ignores remaining limit** (component-lab)

Extracting only the pinned Queue.clean method with an inert backend (4 checks pass): a 15000 total limit issued two unchanged 10000 batches and returned 20000 fabricated IDs; an exact 10000 limit made one call. The remaining allowance is not passed to later batches.

**Do:** Do not rely on library limits to cap destructive maintenance; preserve evidence before cleanup and pass remaining budgets explicitly.

**Limits:** Caller accounting only; no Redis/Lua deletion executed; real IDs depend on backend eligibility.

**Sources:** [bots-swarms/findings.md:9](../../bots-swarms/findings.md#L9)

**Receipts:** `bots-swarms/queue-clean-contract-receipt-1792272518208.json`

### workers-queueswatchdog-not-bounded-return

**`workers-queues.watchdog-not-bounded-return`: Blocking-wait watchdog fires, yet the call stays pending while reconnect is pending** (component-lab)

Executing the unchanged extracted waitForJob/reset bodies with synthetic timers (11 comparisons): the watchdog fired but the outer wait stayed pending while the reconnect promise was unresolved; releasing reconnect completed it. Real RedisConnection does have a separate default 30-second cap on one cluster.connect attempt.

**Do:** Shutdown and reconnect need an explicit end-to-end deadline if a bounded stop is required.

**Limits:** Synthetic connection; not a real Redis outage.

**Sources:** [bots-swarms/continuation.md:2479](../../bots-swarms/continuation.md#L2479)

**Receipts:** `bots-swarms/watchdog-receipt-1792267783154.json`

**Contrary or narrowing evidence:**
- [bots-swarms/continuation.md:2497](../../bots-swarms/continuation.md#L2497): Real cluster connect has a 30 s cap; the synthetic receipt must not be read as "no cap".

### workers-queuesadmin-ops-not-kill-switch

**`workers-queues.admin-ops-not-kill-switch`: Obliterate, drain, clean and scheduler removal delete state; none terminates running work** (source-trace)

Force obliterate deletes lock/data without aborting the processor and its own test expects a cross-queue parent with pending children to remain; drain defaults to keeping delayed jobs and exempts scheduler iterations; removing a job scheduler only deletes the next job if it is in the delayed set; SQL clean selects active jobs by age and can delete still-active state. A source concern also exists that drain on a mixed scheduler/ordinary list trims the wrong entry.

**Do:** Build the engagement kill switch as: stop assignment, revoke credentials/authority, terminate processes, then verify target-side quiet and reconcile; do not wipe queue state first, because that destroys the evidence of what ran.

**Limits:** Source traces and upstream test definitions; no destructive operation was executed.

**Sources:** [bots-swarms/continuation.md:3064](../../bots-swarms/continuation.md#L3064), [bots-swarms/continuation.md:3078](../../bots-swarms/continuation.md#L3078), [bots-swarms/continuation.md:3038](../../bots-swarms/continuation.md#L3038), [bots-swarms/continuation.md:801](../../bots-swarms/continuation.md#L801), [bots-swarms/continuation.md:1421](../../bots-swarms/continuation.md#L1421)

**Contrary or narrowing evidence:**
- [bots-swarms/continuation.md:3058](../../bots-swarms/continuation.md#L3058): Drain mixed-list LTRIM issue is an unreproduced hypothesis.

### workers-queuesbulk-flow-partial-admission

**`workers-queues.bulk-flow-partial-admission`: "All-or-nothing" bulk/flow insert is false: some roots admitted, others fail** (source-trace)

BullMQ FlowProducer.addBulk sends one MULTI and only updates IDs for successful string results; the project's own test expects a valid root to persist while an invalid missing-parent root is absent. Queue.addBulk uses a pipeline and can partially insert. The Postgres add_flow returns negative codes and CONTINUEs, so successful siblings commit. No caller performs compensation.

**Do:** When enqueuing a batch of test cases, record intended IDs and reconcile persisted state per item; never report "all N cases were scheduled" from a bulk call return.

**Limits:** Source plus upstream test expectations; no Redis/Postgres transaction or crash was run.

**Sources:** [bots-swarms/findings.md:10](../../bots-swarms/findings.md#L10), [bots-swarms/continuation.md:2989](../../bots-swarms/continuation.md#L2989), [bots-swarms/continuation.md:777](../../bots-swarms/continuation.md#L777), [bots-swarms/continuation.md:1419](../../bots-swarms/continuation.md#L1419), [bots-swarms/findings.md:11](../../bots-swarms/findings.md#L11)

### workers-queuescheckpoint-crash-window

**`workers-queues.checkpoint-crash-window`: Step-checkpoint and batch patterns repeat external effects on retry** (source-trace)

BullMQ's step-job pattern performs an external step then updateData, leaving an effect→checkpoint gap where a crash or retry repeats the effect; the batches guide's one-payload loop sends each invoice before updateProgress, so retry can resend earlier items. Several samples also release ownership before saving the checkpoint.

**Do:** For multi-step assessment jobs, checkpoint before acting or make each step idempotent with a recorded key; otherwise a retried job may re-send probes or notifications to the client.

**Limits:** Documentation/sample analysis; not reproduced.

**Sources:** [bots-swarms/continuation.md:859](../../bots-swarms/continuation.md#L859), [bots-swarms/continuation.md:775](../../bots-swarms/continuation.md#L775)

### workers-queuesclose-timeout-not-hard-deadline

**`workers-queues.close-timeout-not-hard-deadline`: Worker close/timeout paths are not hard termination deadlines in any reviewed port** (source-trace)

Elixir close sends :shutdown and waits up to 2 s per tracked process without killing survivors; Python forced close calls Task.cancel but skips awaiting processor tasks; the Node child pool escalates to SIGKILL but still awaits an exit event; the sandbox timeout pattern runs its timers on the same event loop it admits may hang. Graceful close has no timeout of its own.

**Do:** A kill switch for assessment workers needs an outer, OS-level deadline (process/container termination) plus a post-stop check that no requests continue; library close() return is not evidence.

**Limits:** Source traces of pinned code; no hung-process experiment was run.

**Sources:** [bots-swarms/continuation.md:549](../../bots-swarms/continuation.md#L549), [bots-swarms/continuation.md:1477](../../bots-swarms/continuation.md#L1477), [bots-swarms/continuation.md:2465](../../bots-swarms/continuation.md#L2465), [bots-swarms/continuation.md:925](../../bots-swarms/continuation.md#L925), [bots-swarms/continuation.md:951](../../bots-swarms/continuation.md#L951)

### workers-queuesdedup-is-admission-not-idempotency

**`workers-queues.dedup-is-admission-not-idempotency`: Job deduplication suppresses enqueue only; TTLs expire mid-job and IDs can be reused** (source-trace)

BullMQ dedup suppresses duplicate enqueue IDs but does not fence a stale worker after lease loss; TTL suppression can expire while the job is still active; keepLastIfActive keeps only the latest pending data (intermediate inputs are dropped) and is documented as at-least-once-after-active; removed job IDs can be reused.

**Do:** Use queue dedup to avoid duplicate scheduling only; protect target-side actions with your own idempotency, and namespace dedup IDs by tenant/engagement deliberately.

**Limits:** Source and documentation; no race was executed.

**Sources:** [bots-swarms/continuation.md:493](../../bots-swarms/continuation.md#L493), [bots-swarms/continuation.md:929](../../bots-swarms/continuation.md#L929), [bots-swarms/continuation.md:921](../../bots-swarms/continuation.md#L921), [bots-swarms/continuation.md:211](../../bots-swarms/continuation.md#L211)

### workers-queuesevents-not-durable-ack

**`workers-queues.events-not-durable-ack`: Queue event streams are not an acknowledged journal: in-memory cursor, can skip** (source-trace)

BullMQ QueueEvents starts at "$" (new events) or a supplied ID and advances an in-memory cursor before decoding/emitting; there is no consumer-group acknowledgement or persisted cursor, so a restarted consumer skips the backlog and trimming is approximate. A custom producer's payload "event" field can override the event name. "drained" is not a completion barrier.

**Do:** Do not build engagement evidence or client notifications on queue events; record results transactionally (outbox) and reconcile from persisted state.

**Limits:** Source trace; no restart/trim loss experiment.

**Sources:** [bots-swarms/continuation.md:783](../../bots-swarms/continuation.md#L783), [bots-swarms/continuation.md:785](../../bots-swarms/continuation.md#L785), [bots-swarms/continuation.md:1567](../../bots-swarms/continuation.md#L1567)

**Contrary or narrowing evidence:**
- [bots-swarms/continuation.md:1569](../../bots-swarms/continuation.md#L1569): Narrows the failure mode: TS emit catches sync listener throws; JSON decode and async rejections still escape.

### workers-queuesexactly-once-is-a-proposal

**`workers-queues.exactly-once-is-a-proposal`: BullMQ "exactly-once" jobs are an unimplemented proposal; reality is at-least-once** (source-trace)

The Elixir transactional-jobs design is labelled Proposal and its exactly-once language is not an implemented capability; even as designed it only covers writes in the same Postgres transaction. The existing SQL completion guard does not check lease expiry, so "an expired worker can never commit" is stronger than the code. BullMQ's own overview falls back to at-least-once in the worst case.

**Do:** Assume at-least-once delivery for any queued assessment action and design duplicates to be harmless; do not promise clients exactly-once probing.

**Limits:** Design document and SQL source read; nothing executed.

**Sources:** [bots-swarms/continuation.md:677](../../bots-swarms/continuation.md#L677), [bots-swarms/continuation.md:679](../../bots-swarms/continuation.md#L679), [bots-swarms/continuation.md:663](../../bots-swarms/continuation.md#L663)

### workers-queuesforced-close-false-completion

**`workers-queues.forced-close-false-completion`: Python BullMQ can emit "completed" locally without a persisted completion on forced close** (source-trace)

In the Python worker, processJob emits a completed event even when forceClosing suppresses the backend completion, so a processor that swallows cancellation and returns produces a local completion with no persisted terminal transition. A completed-listener exception can also push an already completed job into the failure handler.

**Do:** Never use local worker events as the record of what was tested or delivered; reconcile with persisted job state and the target-side evidence.

**Limits:** Source-only; no forced-close test in the upstream suite covers this combination.

**Sources:** [bots-swarms/continuation.md:1479](../../bots-swarms/continuation.md#L1479), [bots-swarms/continuation.md:1469](../../bots-swarms/continuation.md#L1469)

### workers-queuesgo-errors-after-applied-writes

**`workers-queues.go-errors-after-applied-writes`: Several SDK/transport errors are raised after a write may already be applied** (source-trace)

Configuration-write handlers can return a drain-failure error after the service applied the write. The trailing checksum middleware raises a missing-EOF-checksum error after downstream success. The HTTP/1 writer detects short/excess bodies only after declared bytes were written. A second transport-level retry layer runs inside one SDK HTTP Do, below SDK attempt metrics.

**Do:** Retry and reporting logic must reconcile actual remote state; an error is not proof of no effect and attempt counts understate network sends.

**Limits:** Source-level ordering; no remote effects observed.

**Sources:** [toolchain/go-material-review.md:1731](../../toolchain/go-material-review.md#L1731), [toolchain/go-material-review.md:1915](../../toolchain/go-material-review.md#L1915), [toolchain/go-material-review.md:979](../../toolchain/go-material-review.md#L979), [toolchain/go-material-review.md:963](../../toolchain/go-material-review.md#L963)

### workers-queuesgo-s3-manager-error-after-effect

**`workers-queues.go-s3-manager-error-after-effect`: S3 multipart upload can return an error after the object was already completed** (source-trace)

The pinned manager v1.22.22 calls CompleteMultipartUpload, then checks the expected part count, so a mismatch error can follow a successful complete; failure abort is not rollback. Abort uses the original context and ignores its error, LeavePartsOnError skips abort, and the service docs warn in-flight parts may succeed after abort and ListParts verification is needed. The manager is deprecated in favor of transfermanager (2026-02-05).

**Do:** Treat an upload error as "state unknown": reconcile with ListParts/HeadObject before reporting failure or cleanup.

**Limits:** Source ordering only; no object-store defect reproduced.

**Sources:** [toolchain/go-material-review.md:1288](../../toolchain/go-material-review.md#L1288), [toolchain/go-material-review.md:1401](../../toolchain/go-material-review.md#L1401), [toolchain/go-material-review.md:295](../../toolchain/go-material-review.md#L295)

### workers-queuesgo-sdk-timeouts-and-bounds

**`workers-queues.go-sdk-timeouts-and-bounds`: AWS Go SDK defaults do not bound total request time, uploads or retries in all cases** (source-trace)

BuildableClient defaults: 30s dial, 10s TLS handshake, 90s idle, MaxConnsPerHost 2048, overall timeout zero; custom HTTP clients receive none of these. ResponseHeaderTimeout starts after the request write, so it does not bound a stalled upload. Standard retry defaults to 3 attempts, but AddWithMaxAttempts(0) reopens unlimited attempts. The deprecated read-timeout middleware is documented as able to cause networking panics.

**Do:** Tools built on the SDK need explicit context deadlines and budgets per engagement; do not rely on SDK defaults as a traffic or time bound.

**Limits:** Source-only; quotas/context may still bound real deployments.

**Sources:** [toolchain/go-material-review.md:1019](../../toolchain/go-material-review.md#L1019), [toolchain/go-material-review.md:953](../../toolchain/go-material-review.md#L953), [toolchain/go-material-review.md:2093](../../toolchain/go-material-review.md#L2093), [toolchain/go-material-review.md:289](../../toolchain/go-material-review.md#L289)

### workers-queueslease-token-not-effect-fence

**`workers-queues.lease-token-not-effect-fence`: Queue lease tokens guard queue transitions only; they cannot fence external effects** (source-trace)

BullMQ Lua scripts compare stored lock tokens before renewal and terminal transitions, so a stale worker cannot commit queue state. They do nothing for side effects the stale worker already performed. A toy scheduler run showed stale-token commits rejected and an idempotency key producing one effect, but that fencing lived in the fixture, not the queue.

**Do:** Design every external action (scan request, ticket, notification) with resource-side idempotency keys or attempt fencing, and reconcile effects after reassignment. A "lock missing" error at finalization means a duplicate may already have happened.

**Limits:** BullMQ Lua read in full; the toy scheduler is our own model, not BullMQ execution.

**Sources:** [bots-swarms/findings.md:16](../../bots-swarms/findings.md#L16), [bots-swarms/model.md:37](../../bots-swarms/model.md#L37), [bots-swarms/continuation.md:709](../../bots-swarms/continuation.md#L709)

**Receipts:** `bots-swarms/lab-receipt-1792266832801.json`

### workers-queuesmemberlist-group-key-not-node-identity

**`workers-queues.memberlist-group-key-not-node-identity`: memberlist: group key is not node identity; Join success is not admission** (source-trace)

At memberlist pin 5cd2c4b, any holder of the current key is trusted; SECURITY.md excludes designed replay protection; the default NetTransport ignores Address.Name so RequireNodeNames is not peer authentication; an Alive-rejection test expects Join to succeed while each member view excludes the peer; a rejected newcomer can still learn existing peers; broadcast Finished can fire before any network write. Verification toggles default true but encryption needs a nonempty keyring, and an empty CIDR list skips filtering despite the comment.

**Do:** Peer-to-peer worker coordination needs per-node workload identity and explicit admission; do not treat gossip membership or suspicion as job authority or delivery proof.

**Limits:** Complete Go source/tests read; no Go execution or cluster run.

**Sources:** [bots-swarms/continuation.md:1069](../../bots-swarms/continuation.md#L1069), [bots-swarms/continuation.md:2557](../../bots-swarms/continuation.md#L2557), [bots-swarms/continuation.md:2607](../../bots-swarms/continuation.md#L2607), [bots-swarms/findings.md:21](../../bots-swarms/findings.md#L21)

### workers-queuespause-leaves-active-running

**`workers-queues.pause-leaves-active-running`: Pausing a queue stops new pickup only; active jobs keep running** (source-trace)

BullMQ queue pause prevents new acquisition while active jobs continue; pause(true) only skips waiting for them. An upstream test holds a long job behind a latch and shows other work finishing while it continues. In the Elixir port, already-running autonomous processes carry no paused state and request fetch_next after completion, so they may keep acquiring jobs after pause (source hypothesis).

**Do:** Do not present "paused" as "stopped" to a client during an incident or scope dispute. A stop procedure must separately wait for or terminate active work and verify no further requests were issued.

**Limits:** Upstream tests read, not run; the Elixir continued-acquisition path is an unreproduced source hypothesis.

**Sources:** [bots-swarms/continuation.md:793](../../bots-swarms/continuation.md#L793), [bots-swarms/continuation.md:2439](../../bots-swarms/continuation.md#L2439), [bots-swarms/continuation.md:547](../../bots-swarms/continuation.md#L547)

### workers-queuesport-parity-not-guaranteed

**`workers-queues.port-parity-not-guaranteed`: BullMQ language ports differ in semantics despite shared Lua/SQL** (source-trace)

Shared Lua/SQL does not cover argument serialization, exception handling, cancellation, timers or lifecycle. Example: the Elixir Scripts wrapper wraps negative Lua codes (missing/mismatched lock -2/-6) as {:ok, code}, so the worker can emit on_completed for a rejected terminal transition; TypeScript vs Python Postgres differ in metric-error handling and negative-code conversion; PHP is a producer-only client.

**Do:** Pick one implementation and test its own failure paths; do not borrow guarantees across language ports.

**Limits:** Source traces; generated script payloads were absent from the checkout for Elixir, so that path is conditional.

**Sources:** [bots-swarms/continuation.md:565](../../bots-swarms/continuation.md#L565), [bots-swarms/continuation.md:529](../../bots-swarms/continuation.md#L529), [bots-swarms/continuation.md:1403](../../bots-swarms/continuation.md#L1403)

### workers-queuespostgres-lease-expiry-unchecked

**`workers-queues.postgres-lease-expiry-unchecked`: BullMQ Postgres backend: completion/renewal check the token but not lease expiry** (source-trace)

In the pinned SQL functions, terminal completion/failure and extend_lock require active state plus matching token (or token 0) but do not compare locked_until_ms, so an expired owner can renew or finalize before stalled recovery changes the row. Bulk renewal also has no expiry check. Redis key-expiry semantics therefore cannot be assumed for the SQL backend.

**Do:** If choosing a Postgres-backed queue for assessment workers, add explicit expiry/fencing checks or external idempotency before relying on leases.

**Limits:** Source concern; no concurrent SQL interleaving test was run.

**Sources:** [bots-swarms/continuation.md:1425](../../bots-swarms/continuation.md#L1425), [bots-swarms/continuation.md:1397](../../bots-swarms/continuation.md#L1397)

### workers-queuesretry-and-attempt-budgets

**`workers-queues.retry-and-attempt-budgets`: attempts:3 = 1 run + 2 retries; broker retries default Infinity; counters reset** (source-trace)

BullMQ job attempts include the first run (attempts 3 = initial plus 2 retries, no backoff by default). Broker connection-operation retries are a separate bound that defaults to Infinity unless supplied. Attempt counters can be reset by manual retry; maxStartedAttempts is not a hard lifetime prohibition.

**Do:** Set explicit per-job and per-engagement action budgets outside the queue counters, and bound connection retries/shutdown separately, or a broken broker can keep a worker looping indefinitely.

**Limits:** Source and upstream test reading; no failure injection run.

**Sources:** [bots-swarms/findings.md:18](../../bots-swarms/findings.md#L18), [bots-swarms/continuation.md:931](../../bots-swarms/continuation.md#L931), [bots-swarms/continuation.md:931](../../bots-swarms/continuation.md#L931), [bots-swarms/continuation.md:1161](../../bots-swarms/continuation.md#L1161)

### workers-queuessandbox-not-security-boundary

**`workers-queues.sandbox-not-security-boundary`: BullMQ "sandboxed" processors are reused trusted children, not a security sandbox** (source-trace)

Sandboxed processors run in forked processes or threads to relieve the parent event loop; children are pooled and reused, inherit the environment, and forward stdout/stderr unfiltered. Job data is stored in clear text in the datastore.

**Do:** Do not run untrusted payloads or per-client secrets in shared sandboxed processors; isolate per engagement at the OS/container level and keep secrets out of job payloads.

**Limits:** Source and test reading.

**Sources:** [bots-swarms/continuation.md:953](../../bots-swarms/continuation.md#L953), [bots-swarms/continuation.md:953](../../bots-swarms/continuation.md#L953), [bots-swarms/continuation.md:1193](../../bots-swarms/continuation.md#L1193)

### workers-queuesscrapy-resume-not-lease

**`workers-queues.scrapy-resume-not-lease`: Scrapy JOBDIR resume loses the in-flight request; it is not lease-based redelivery** (source-trace)

Scrapy's crash test (SQLite FIFO disk queue, JOBDIR_SYNC_EVERY=1, os._exit mid-scheduling) explicitly states the downloading request is lost and accepts at least 19 of 20 unique requests. JOBDIR needs clean shutdown, is single-job, and unserializable requests are lost on pause; SpiderState is a pickle written without rename/fsync.

**Do:** For resumable authorised crawls, keep an external ledger of issued requests and treat resume as possibly missing or repeating work.

**Limits:** Upstream tests read, not run.

**Sources:** [bots-swarms/continuation.md:1837](../../bots-swarms/continuation.md#L1837), [bots-swarms/continuation.md:1027](../../bots-swarms/continuation.md#L1027)

### workers-queuesworker-discovery-not-inventory

**`workers-queues.worker-discovery-not-inventory`: BullMQ worker counts come from client names: largest node only, unsupported = count 1** (source-trace)

getWorkers matches mutable Redis client names (not authenticated identities), takes the single cluster node with the most matches rather than a union (four disjoint workers can be reported as 2), and returns a one-element placeholder when CLIENT LIST is unsupported, which getWorkersCount reports as 1. Missing/malformed metrics map to 0.

**Do:** Do not use queue worker counts or metrics to prove how many agents were acting on a client at a time; keep an authenticated enrollment/attestation record.

**Limits:** Source and mocked-test reading only.

**Sources:** [bots-swarms/continuation.md:3067](../../bots-swarms/continuation.md#L3067), [bots-swarms/continuation.md:1219](../../bots-swarms/continuation.md#L1219), [bots-swarms/continuation.md:3069](../../bots-swarms/continuation.md#L3069)

### workers-queueskill-switch-sequence

**`workers-queues.kill-switch-sequence`: Worker control model: lease, attempt token, resource fencing, verified quiescence** (synthesis)

The study's design synthesis: verify workload identity via an issuer, give jobs scope/budget/deadline, use a new attempt token on reassignment and reject stale commits, add resource-side idempotency/fencing, bound retries with jitter, and make a kill switch stop assignment, invalidate authority and request cancellation, then confirm drain, closed resources and reconciled effects.

**Do:** Use this as the checklist for any assessment worker fleet; each step needs its own observable evidence.

**Limits:** Explicitly a design synthesis, not an existing NBRET subsystem and not tested end to end.

**Sources:** [bots-swarms/model.md:39](../../bots-swarms/model.md#L39), [bots-swarms/model.md:37](../../bots-swarms/model.md#L37), [bots-swarms/scope-closure.md:9](../../bots-swarms/scope-closure.md#L9)

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| high | [toolchain/go-material-review.md:569](../../toolchain/go-material-review.md#L569) | [toolchain/go-material-review.md:563](../../toolchain/go-material-review.md#L563) | Believe the conditional A/B mismatch; it is not a demonstrated bypass. |
| high | [toolchain/go-material-review.md:1009](../../toolchain/go-material-review.md#L1009) | [toolchain/go-material-review.md:999](../../toolchain/go-material-review.md#L999) | Treat the A→B→B redirect token restoration as an open source-level candidate. |
| high | [toolchain/go-material-review.md:1890](../../toolchain/go-material-review.md#L1890) | [toolchain/go-material-review.md:1895](../../toolchain/go-material-review.md#L1895) | Treat GetObject checksum validation as conditional (200, EOF, supported algorithm, non-multipart). |
| high | [toolchain/go-material-review.md:1927](../../toolchain/go-material-review.md#L1927) | [toolchain/go-material-review.md:1935](../../toolchain/go-material-review.md#L1935) | Checksum retention across retries is intended; do not report it as an integrity bypass. |
| high | [toolchain/go-material-review.md:2019](../../toolchain/go-material-review.md#L2019) | [toolchain/go-material-review.md:2023](../../toolchain/go-material-review.md#L2023) | Require an observed End event for completeness. |
| medium | [toolchain/go-material-review.md:753](../../toolchain/go-material-review.md#L753) | [toolchain/go-material-review.md:753](../../toolchain/go-material-review.md#L753) | Do not attribute the Express token redirect hypothesis to CopyObject. |
| medium | [toolchain/go-material-review.md:563](../../toolchain/go-material-review.md#L563) | [toolchain/go-material-review.md:561](../../toolchain/go-material-review.md#L561) | Scope the Express mismatch to static default credentials plus per-operation override. |
| medium | [toolchain/go-material-review.md:1021](../../toolchain/go-material-review.md#L1021) | [toolchain/go-material-review.md:999](../../toolchain/go-material-review.md#L999) | Use go-material-review.md:999 as the current state of the redirect question. |
| medium | [toolchain/go-material-review.md:703](../../toolchain/go-material-review.md#L703) | [toolchain/go-material-review.md:693](../../toolchain/go-material-review.md#L693) | No default conflicting-region signing issue. |
| medium | [toolchain/go-material-review.md:307](../../toolchain/go-material-review.md#L307) | [toolchain/go-material-review.md:307](../../toolchain/go-material-review.md#L307) | Preserve both; do not catalog the addition as retained. |
| medium | [toolchain/go-material-review.md:207](../../toolchain/go-material-review.md#L207) | [toolchain/go-material-review.md:211](../../toolchain/go-material-review.md#L211) | Do not treat the Lambda BPA announcement as durable functionality. |
| medium | [toolchain/go-material-review.md:1409](../../toolchain/go-material-review.md#L1409) | [toolchain/go-material-review.md:1411](../../toolchain/go-material-review.md#L1411) | Check per-operation registration before claiming silent acceptance. |
| medium | [toolchain/go-material-review.md:1493](../../toolchain/go-material-review.md#L1493) | [toolchain/go-material-review.md:1499](../../toolchain/go-material-review.md#L1499) | Nil UploadId dereference is a conditional source route, not an observed panic. |
| medium | [toolchain/go-material-review.md:747](../../toolchain/go-material-review.md#L747) | [toolchain/go-material-review.md:667](../../toolchain/go-material-review.md#L667) | Conditional legacy-path source reachability; modern path rejects empty buckets. |
| medium | [toolchain/go-material-review.md:611](../../toolchain/go-material-review.md#L611) | [toolchain/go-material-review.md:607](../../toolchain/go-material-review.md#L607) | URL presign rejects negative expiry; POST presign still lacks that guard (go-material-review.md:601). |
| medium | [toolchain/go-material-review.md:1945](../../toolchain/go-material-review.md#L1945) | [toolchain/go-material-review.md:1957](../../toolchain/go-material-review.md#L1957) | Presigning does not send the application request (V4 and Express); provider effects remain separate. |
| medium | [bots-swarms/continuation.md:2884](../../bots-swarms/continuation.md#L2884) | [bots-swarms/continuation.md:2888](../../bots-swarms/continuation.md#L2888) | Treat the res.length concern as weakened by contrary test evidence; unresolved without runtime. |
| medium | [bots-swarms/continuation.md:2628](../../bots-swarms/continuation.md#L2628) | [bots-swarms/continuation.md:2636](../../bots-swarms/continuation.md#L2636) | Coraza Include is implemented; the 100-include bound is cumulative, not depth. |
| medium | [toolchain/go-material-review.md:1749](../../toolchain/go-material-review.md#L1749) | [toolchain/go-material-review.md:2025](../../toolchain/go-material-review.md#L2025) | Select results are delivered via the eventstream middleware. |
| medium | [toolchain/go-material-review.md:1083](../../toolchain/go-material-review.md#L1083) | [toolchain/go-material-review.md:979](../../toolchain/go-material-review.md#L979) | Length mismatches error at transport but may have partial remote effect. |
| medium | [toolchain/go-material-review.md:1467](../../toolchain/go-material-review.md#L1467) | [toolchain/go-material-review.md:961](../../toolchain/go-material-review.md#L961) | No header injection claim via standard transport; custom RoundTrippers differ. |
| medium | [bots-swarms/catalog.md:8](../../bots-swarms/catalog.md#L8) | [bots-swarms/scope-closure.md:3](../../bots-swarms/scope-closure.md#L3) | catalog.md status cells are historical; use scope-closure.md. |
| medium | [bots-swarms/catalog.md:10](../../bots-swarms/catalog.md#L10) | [bots-swarms/findings.md:19](../../bots-swarms/findings.md#L19) | Coraza enforcement path is fully traced at source level (still no Go run). |
| medium | [bots-swarms/continuation-checkpoint.md:23](../../bots-swarms/continuation-checkpoint.md#L23) | [bots-swarms/scope-closure.md:30](../../bots-swarms/scope-closure.md#L30) | continuation-checkpoint.md counts are historical. |
| medium | [bots-swarms/source-notes.md:39](../../bots-swarms/source-notes.md#L39) | [bots-swarms/continuation.md:2465](../../bots-swarms/continuation.md#L2465) | Use cont:2449-2465 for drain/child shutdown semantics. |
| medium | [bots-swarms/continuation.md:2987](../../bots-swarms/continuation.md#L2987) | [bots-swarms/continuation.md:3007](../../bots-swarms/continuation.md#L3007) | Do not use getFlow maxChildren as a memory or result cap. |
| medium | [bots-swarms/continuation.md:3094](../../bots-swarms/continuation.md#L3094) | [bots-swarms/continuation.md:3094](../../bots-swarms/continuation.md#L3094) | Do not claim BullMQ shared suites are validated on Postgres from the setup files. |
| medium | [bots-swarms/continuation.md:1573](../../bots-swarms/continuation.md#L1573) | [bots-swarms/continuation.md:1569](../../bots-swarms/continuation.md#L1569) | For TypeScript BullMQ, sync listener throws are caught; malformed JSON and async rejections remain the failure modes. |
| medium | [toolchain/go-material-review.md:1927](../../toolchain/go-material-review.md#L1927) | [toolchain/go-material-review.md:1973](../../toolchain/go-material-review.md#L1973) | Changed retry bodies require external mutation, not the SDK retry loop. |
| medium | [toolchain/go-material-review.md:1983](../../toolchain/go-material-review.md#L1983) | [toolchain/go-material-review.md:2093](../../toolchain/go-material-review.md#L2093) | Check for retry wrappers with max 0 before assuming a bounded retry count. |
| medium | [toolchain/go-material-review.md:1965](../../toolchain/go-material-review.md#L1965) | [toolchain/go-material-review.md:1983](../../toolchain/go-material-review.md#L1983) | Default retries are bounded at 3; see the later AddWithMaxAttempts(0) exception. |
| medium | [bots-swarms/continuation.md:2479](../../bots-swarms/continuation.md#L2479) | [bots-swarms/continuation.md:2497](../../bots-swarms/continuation.md#L2497) | The watchdog finding is about method ordering; real cluster reconnect attempts are capped at 30 s each, though there is still no end-to-end bound. |
| low | [toolchain/go-material-review.md:567](../../toolchain/go-material-review.md#L567) | [toolchain/go-material-review.md:565](../../toolchain/go-material-review.md#L565) | No default unprotected-cache race. |
| low | [toolchain/go-material-review.md:299](../../toolchain/go-material-review.md#L299) | [toolchain/go-material-review.md:299](../../toolchain/go-material-review.md#L299) | Release note does not close the redirect candidate. |
| low | [toolchain/go-material-review.md:687](../../toolchain/go-material-review.md#L687) | [toolchain/go-material-review.md:683](../../toolchain/go-material-review.md#L683) | No deployment-wide stale V4a cache inference. |
| low | [toolchain/go-material-review.md:1585](../../toolchain/go-material-review.md#L1585) | [toolchain/go-material-review.md:2039](../../toolchain/go-material-review.md#L2039) | SDK does not locally validate completed part lists. |
| low | [toolchain/go-material-review.md:631](../../toolchain/go-material-review.md#L631) | [toolchain/go-material-review.md:627](../../toolchain/go-material-review.md#L627) | Path style only without custom endpoint. |
| low | [toolchain/go-material-review.md:1879](../../toolchain/go-material-review.md#L1879) | [toolchain/go-material-review.md:1879](../../toolchain/go-material-review.md#L1879) | No usable partial output from public GetObject on error. |
| low | [toolchain/go-material-review.md:1356](../../toolchain/go-material-review.md#L1356) | [toolchain/go-material-review.md:1356](../../toolchain/go-material-review.md#L1356) | Interpret multipart checksum by algorithm and checksum type. |
| low | [toolchain/go-material-review.md:1379](../../toolchain/go-material-review.md#L1379) | [toolchain/go-material-review.md:1427](../../toolchain/go-material-review.md#L1427) | Options.Copy is shallow. |
| low | [bots-swarms/continuation.md:1985](../../bots-swarms/continuation.md#L1985) | [bots-swarms/continuation.md:1977](../../bots-swarms/continuation.md#L1977) | Do not claim a Scrapy shutdown hang from CallLaterOnce. |
| low | [bots-swarms/continuation.md:2898](../../bots-swarms/continuation.md#L2898) | [bots-swarms/continuation.md:2904](../../bots-swarms/continuation.md#L2904) | Etcd expiry accumulation and SQLite early release are confirmed for adapter control flow only. |
| low | [bots-swarms/continuation.md:2033](../../bots-swarms/continuation.md#L2033) | [bots-swarms/continuation.md:2029](../../bots-swarms/continuation.md#L2029) | FilesPipeline tests are read; use cont:2029-2031. |
| low | [bots-swarms/continuation.md:2977](../../bots-swarms/continuation.md#L2977) | [bots-swarms/continuation.md:2980](../../bots-swarms/continuation.md#L2980) | Current CI is GitHub Actions; still no passing-run receipt. |
| low | [bots-swarms/continuation.md:1727](../../bots-swarms/continuation.md#L1727) | [bots-swarms/continuation.md:1677](../../bots-swarms/continuation.md#L1677) | Multi-selector update remains an untested source hypothesis. |
| low | [toolchain/go-material-review.md:451](../../toolchain/go-material-review.md#L451) | [toolchain/go-material-review.md:449](../../toolchain/go-material-review.md#L449) | Reject CBOR infinite-loop and header-sized allocation claims. |
| low | [toolchain/go-material-review.md:1073](../../toolchain/go-material-review.md#L1073) | [toolchain/go-material-review.md:987](../../toolchain/go-material-review.md#L987) | SDK body logging buffers whole bodies. |
| low | [toolchain/go-material-review.md:2055](../../toolchain/go-material-review.md#L2055) | [toolchain/go-material-review.md:2075](../../toolchain/go-material-review.md#L2075) | Report only the malformed-length relationship as an open candidate, not the missing cap. |
| low | [toolchain/go-material-review.md:475](../../toolchain/go-material-review.md#L475) | [toolchain/go-material-review.md:445](../../toolchain/go-material-review.md#L445) | Weakness limited to the shared document helper. |
| low | [toolchain/go-material-review.md:1146](../../toolchain/go-material-review.md#L1146) | [toolchain/go-material-review.md:1146](../../toolchain/go-material-review.md#L1146) | No jsonschema duplicate bypass from hash collisions. |
| low | [toolchain/go-material-review.md:429](../../toolchain/go-material-review.md#L429) | [toolchain/go-material-review.md:425](../../toolchain/go-material-review.md#L425) | Misleading return contract only. |
| low | [toolchain/go-material-review.md:1945](../../toolchain/go-material-review.md#L1945) | [toolchain/go-material-review.md:1949](../../toolchain/go-material-review.md#L1949) | Checksum package findings apply to UploadPart/PutObject, with different trailer placement. |
| low | [toolchain/go-material-review.md:895](../../toolchain/go-material-review.md#L895) | [toolchain/go-material-review.md:951](../../toolchain/go-material-review.md#L951) | Closed bodies may be drained (≤256KiB) and reused. |
| low | [toolchain/go-material-review.md:1411](../../toolchain/go-material-review.md#L1411) | [toolchain/go-material-review.md:1419](../../toolchain/go-material-review.md#L1419) | Do not claim a connection leak from the NopCloser wrapper alone. |
| low | [toolchain/go-material-review.md:141](../../toolchain/go-material-review.md#L141) | [toolchain/go-material-review.md:369](../../toolchain/go-material-review.md#L369) | Do not cite RecursionDetection as a loop detector. |
| low | [toolchain/go-material-review.md:783](../../toolchain/go-material-review.md#L783) | [toolchain/go-material-review.md:803](../../toolchain/go-material-review.md#L803) | Response parsing tolerates spaces in field names. |
| low | [bots-swarms/coverage.md:40](../../bots-swarms/coverage.md#L40) | [bots-swarms/continuation.md:157](../../bots-swarms/continuation.md#L157) | ipMatch.json is fully read; coverage.md:40 contradicts coverage.md:3. |
| low | [bots-swarms/source-notes.md:31](../../bots-swarms/source-notes.md#L31) | [bots-swarms/source-notes.md:43](../../bots-swarms/source-notes.md#L43) | moveJobToWait is read. |
| low | [bots-swarms/continuation.md:557](../../bots-swarms/continuation.md#L557) | [bots-swarms/continuation.md:547](../../bots-swarms/continuation.md#L547) | worker.ex is fully reviewed; use cont:547-553 findings. |
| low | [bots-swarms/continuation.md:1623](../../bots-swarms/continuation.md#L1623) | [bots-swarms/continuation.md:1617](../../bots-swarms/continuation.md#L1617) | Read finalization order per cont:1617. |
| low | [bots-swarms/continuation.md:2983](../../bots-swarms/continuation.md#L2983) | [bots-swarms/continuation.md:3001](../../bots-swarms/continuation.md#L3001) | Flow suite is fully read. |
| low | [bots-swarms/continuation.md:2543](../../bots-swarms/continuation.md#L2543) | [bots-swarms/continuation.md:2568](../../bots-swarms/continuation.md#L2568) | memberlist has a 40 MiB per-decompression cap only. |
| low | [toolchain/go-material-review.md:423](../../toolchain/go-material-review.md#L423) | [toolchain/go-material-review.md:415](../../toolchain/go-material-review.md#L415) | Stack steps do not reject duplicate middleware IDs. |
| low | [bots-swarms/continuation.md:1485](../../bots-swarms/continuation.md#L1485) | [bots-swarms/continuation.md:1477](../../bots-swarms/continuation.md#L1477) | Python worker.py is fully reviewed. |
| low | [bots-swarms/continuation.md:3042](../../bots-swarms/continuation.md#L3042) | [bots-swarms/continuation.md:3062](../../bots-swarms/continuation.md#L3062) | Queue.clean overshoot is confirmed at the caller boundary (real deletion untested). |
| low | [bots-swarms/continuation.md:1601](../../bots-swarms/continuation.md#L1601) | [bots-swarms/continuation.md:1597](../../bots-swarms/continuation.md#L1597) | Job rescheduling updates local delay/priority properties, not opts. |
| low | [toolchain/go-material-review.md:1965](../../toolchain/go-material-review.md#L1965) | [toolchain/go-material-review.md:1983](../../toolchain/go-material-review.md#L1983) | No default token leak; record only a quota-accounting boundary. |
| low | [toolchain/go-material-review.md:393](../../toolchain/go-material-review.md#L393) | [toolchain/go-material-review.md:375](../../toolchain/go-material-review.md#L375) | Negative delay not reached through HeadBucket/HeadObject waiters. |
