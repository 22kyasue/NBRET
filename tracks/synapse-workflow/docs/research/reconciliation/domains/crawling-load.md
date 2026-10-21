# Crawlers and load limits against client systems

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 11 findings, 23 related corrections, 10 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.anti-blocking-advice`** [bots-swarms/continuation.md:1035](../../bots-swarms/continuation.md#L1035): Adopting evasion/IP-rotation advice for client crawling. **Instead:** Identify crawlers and use negotiated quotas; docs/research/bots-swarms/model.md:60 (study, not operational evasion).
- **`hazard.continuation-next-step`** [bots-swarms/continuation.md:2463](../../bots-swarms/continuation.md#L2463): Outdated next-step instruction; the work is done. **Instead:** Reading is closed per docs/research/bots-swarms/scope-closure.md:30.
- **`hazard.drain-regression-fixture`** [bots-swarms/continuation.md:3058](../../bots-swarms/continuation.md#L3058): Building and running a Redis regression unprompted. **Instead:** Treat as an open hypothesis; requires explicit authorization (repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them")).
- **`hazard.mockserver-all-interfaces`** [bots-swarms/continuation.md:1967](../../bots-swarms/continuation.md#L1967): Reusing Scrapy mock servers as an isolated lab (they bind all interfaces). **Instead:** Bind explicitly to loopback in any authorized lab.
- **`hazard.private-cluster-seeds`** [bots-swarms/continuation.md:1227](../../bots-swarms/continuation.md#L1227): Executing tests that contact private network addresses. **Instead:** Do not run; contacting unscoped targets is out of bounds.
- **`hazard.privileged-compose`** [bots-swarms/continuation.md:2977](../../bots-swarms/continuation.md#L2977): Launching the supplied privileged Compose fixture that deletes /data and binds all interfaces. **Instead:** Do not launch; recorded at docs/research/bots-swarms/continuation.md:2977 as unsuitable.
- **`hazard.requires-internet-tests`** [bots-swarms/continuation.md:2231](../../bots-swarms/continuation.md#L2231): Running Scrapy tests assuming they are offline. **Instead:** Exclude internet-marked tests explicitly; no external contact without authorization.
- **`hazard.status-source-notes`** [bots-swarms/source-notes.md:39](../../bots-swarms/source-notes.md#L39): Re-tracing completed work or claiming it is unknown. **Instead:** Traced at docs/research/bots-swarms/continuation.md:2449-2465.
- **`hazard.tox-aws-credentials`** [bots-swarms/continuation.md:585](../../bots-swarms/continuation.md#L585): Running Scrapy tox environments that pass through cloud credentials and download dependencies. **Instead:** Do not run; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them").
- **`hazard.upstream-flushall-suite`** [bots-swarms/continuation.md:2734](../../bots-swarms/continuation.md#L2734): Running upstream test suites against a shared Redis wipes data. **Instead:** Do not run; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them"); docs/research/safety-context/README.md:37 (do not recreate actions).

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [Limiter storage adapters: non-atomic updates, ignored expiry, ineffective flags](#crawling-loadadapter-atomicity-and-expiry) | component-lab | testing, remediation |
| [IP-only quota: 2/4 false rejections on shared IP, 2/2 misses with changing IPs](#crawling-loadaddress-vs-principal-quota) | component-lab | testing, remediation |
| [Limiter timeout/insurance/union wrappers leave late or partial consumption](#crawling-loadfallback-timeout-late-consumption) | component-lab | operations |
| [Mongo limiter duplicate-key retry drops caller tenant attributes on the third query](#crawling-loadmongo-retry-drops-tenant-attrs) | component-lab | testing |
| [Rate limiter covers only its instance and key: two instances doubled the budget](#crawling-loadquota-scope-per-instance-and-key) | component-lab | operations, testing, scoping |
| [Scrapy politeness is per crawler: running several crawlers multiplies load on the target](#crawling-loadcrawler-budgets-multiply) | source-trace | scoping, discovery, operations |
| [Queue rate limits count job starts, not HTTP requests; 17/min is not a 1000/hour cap](#crawling-loadjob-rate-not-request-rate) | source-trace | scoping, operations |
| [Scrapy offsite scope is hostname matching, not an egress sandbox](#crawling-loadoffsite-filter-not-egress-sandbox) | source-trace | scoping, discovery, operations |
| [Scrapy cross-origin 307/308 redirects keep POST body and custom headers](#crawling-loadredirect-keeps-body-cross-origin) | source-trace | testing, operations |
| [A 429 response does not prove the protected handler did not run (Express FailMark)](#crawling-loadstatus-code-not-prevention) | source-trace | testing, retest |
| [Scrapy downloads with TLS certificate verification disabled by default](#crawling-loadtls-verification-off-by-default) | source-trace | operations, evidence |

### crawling-loadadapter-atomicity-and-expiry

**`crawling-load.adapter-atomicity-and-expiry`: Limiter storage adapters: non-atomic updates, ignored expiry, ineffective flags** (component-lab)

RedisNonAtomic reads then writes the counter in a later step; Drizzle/Prisma choose replace-vs-increment from an earlier select without row lock; in a 7-check inert run EtcdNonAtomic returned an already-expired record and accumulated old points (rejected at limit 1); SQLite released its pooled connection before the query callback finished; Prisma's clearExpiredByTimeout:false still starts its timer (opts || true). README claims of no-race atomicity are contradicted by these adapters.

**Do:** If a client relies on such a limiter, test the specific adapter under concurrency; do not accept the product's atomicity claim.

**Limits:** Inert clients only; no database concurrency executed.

**Sources:** [bots-swarms/continuation.md:2882](../../bots-swarms/continuation.md#L2882), [bots-swarms/continuation.md:2904](../../bots-swarms/continuation.md#L2904), [bots-swarms/findings.md:12](../../bots-swarms/findings.md#L12), [bots-swarms/continuation.md:2971](../../bots-swarms/continuation.md#L2971)

**Receipts:** `bots-swarms/adapter-boundary-receipt-1792271261504.json`, `bots-swarms/prisma-contract-receipt-1792271657601.json`

### crawling-loadaddress-vs-principal-quota

**`crawling-load.address-vs-principal-quota`: IP-only quota: 2/4 false rejections on shared IP, 2/2 misses with changing IPs** (component-lab)

With a 2-request quota in the synthetic loopback lab, four legitimate principals sharing one address got 2 false rejections out of 4 under address-only limits, and one over-budget principal with four address labels had 2 of 2 excess requests missed; principal-keyed quotas resolved both fixtures. RFC 6269/8981 explain shared and temporary addresses.

**Do:** When advising clients on bot/abuse controls, recommend authenticated per-principal budgets with IP limits only as a coarse capacity layer, and measure false positives on shared-network cohorts.

**Limits:** Constructed four-request fixtures; not prevalence, precision/recall or vendor accuracy.

**Sources:** [bots-swarms/defense.md:23](../../bots-swarms/defense.md#L23), [bots-swarms/continuation.md:2662](../../bots-swarms/continuation.md#L2662)

**Receipts:** `bots-swarms/lab-receipt-1792266832801.json`

### crawling-loadfallback-timeout-late-consumption

**`crawling-load.fallback-timeout-late-consumption`: Limiter timeout/insurance/union wrappers leave late or partial consumption** (component-lab)

In a 9-check run of the unchanged pinned wrappers: a timeout rejected before the primary settled but did not cancel its later effect; insurance answered the caller while the primary later settled too; union rejection left the successful sibling consumed; allow lists bypass deny and quota. Insurance limiters keep independent budgets and are not used on quota rejection; cluster IPC timeouts do not recall a sent operation.

**Do:** Do not assume a composite limiter keeps exact accounting under failure; reconcile actual request counts against the client agreement.

**Limits:** Synthetic limiters; no Redis or real request path.

**Sources:** [bots-swarms/findings.md:32](../../bots-swarms/findings.md#L32), [bots-swarms/continuation.md:2864](../../bots-swarms/continuation.md#L2864), [bots-swarms/continuation.md:2858](../../bots-swarms/continuation.md#L2858), [bots-swarms/continuation.md:2593](../../bots-swarms/continuation.md#L2593)

**Receipts:** `bots-swarms/limiter-composition-receipt-1792270925219.json`, `bots-swarms/redis-adapter-receipt-1792268550903.json`

### crawling-loadmongo-retry-drops-tenant-attrs

**`crawling-load.mongo-retry-drops-tenant-attrs`: Mongo limiter duplicate-key retry drops caller tenant attributes on the third query** (component-lab)

Running the unchanged pinned Mongo adapter with an inert collection that rejects two updates with code 11000: exactly 3 update calls, the first two carried tenant synthetic-a, the recursive third lost it. The recursive retry has no bound or backoff.

**Do:** Attribute-scoped quota keys are not a tenant boundary; flag such designs in client reviews.

**Limits:** Query construction only; no real cross-tenant record selection shown.

**Sources:** [bots-swarms/continuation.md:2914](../../bots-swarms/continuation.md#L2914)

**Receipts:** `bots-swarms/mongo-retry-receipt-1792271347246.json`

### crawling-loadquota-scope-per-instance-and-key

**`crawling-load.quota-scope-per-instance-and-key`: Rate limiter covers only its instance and key: two instances doubled the budget** (component-lab)

rate-limiter-flexible's memory limiter creates a new storage object per instance and counts a caller-supplied key in a fixed window; it neither authenticates the key nor writes HTTP 429. In the loopback lab using the actual pinned class, two instances each allowed 2 requests for one principal (4 total at a budget of 2).

**Do:** Client-side load budgets must be enforced by one shared store keyed by engagement/target, sized for all workers; per-process limiters silently multiply load on the client.

**Limits:** Memory backend only in this lab; Redis/cluster atomicity not executed.

**Sources:** [bots-swarms/findings.md:14](../../bots-swarms/findings.md#L14), [bots-swarms/source-notes.md:11](../../bots-swarms/source-notes.md#L11)

**Receipts:** `bots-swarms/lab-receipt-1792266832801.json`

### crawling-loadcrawler-budgets-multiply

**`crawling-load.crawler-budgets-multiply`: Scrapy politeness is per crawler: running several crawlers multiplies load on the target** (source-trace)

Scrapy docs and source state concurrency, delay and AutoThrottle apply per crawler, so crawlers run together multiply them; distributed crawling is not built in. CONCURRENT_REQUESTS=0 means unlimited, DOWNLOAD_DELAY has ±50% default jitter, AutoThrottle is off by default and is not a hard concurrency limit.

**Do:** An assessment crawl fleet needs one aggregate limiter per client target agreed in scope; verify settings are effective, because a 0 or omitted value can remove the limit.

**Limits:** Documentation and source; no crawl or load measurement.

**Sources:** [bots-swarms/continuation.md:1033](../../bots-swarms/continuation.md#L1033), [bots-swarms/continuation.md:315](../../bots-swarms/continuation.md#L315), [bots-swarms/continuation.md:977](../../bots-swarms/continuation.md#L977), [bots-swarms/continuation.md:1039](../../bots-swarms/continuation.md#L1039)

### crawling-loadjob-rate-not-request-rate

**`crawling-load.job-rate-not-request-rate`: Queue rate limits count job starts, not HTTP requests; 17/min is not a 1000/hour cap** (source-trace)

BullMQ's limiter increments its counter when a job is acquired, before it completes; one job may make many API calls and separate queues do not share a budget. The Elixir guide's 17/minute substitute for 1000/hour permits 1020 nominal allocations per 60 minutes. Global queue limits cannot see traffic that bypasses the queue.

**Do:** Express client load limits in requests to the target, enforced at the egress point, not as queue job rates.

**Limits:** Source/doc arithmetic; not a load test.

**Sources:** [bots-swarms/continuation.md:513](../../bots-swarms/continuation.md#L513), [bots-swarms/continuation.md:513](../../bots-swarms/continuation.md#L513), [bots-swarms/continuation.md:935](../../bots-swarms/continuation.md#L935)

### crawling-loadoffsite-filter-not-egress-sandbox

**`crawling-load.offsite-filter-not-egress-sandbox`: Scrapy offsite scope is hostname matching, not an egress sandbox** (source-trace)

Scrapy OffsiteMiddleware matches parsed hostnames: empty allowed_domains permits all, ports are ignored, there is no resolved-IP/DNS-rebinding check, and trusted dont_filter/allow_offsite metadata exempts requests. Default link extraction accepts data, file, ftp and s3 schemes; the file handler reads a local path with no root or byte cap.

**Do:** Enforce the client-approved scope (hosts, IPs, schemes) at a network egress control outside the crawler; crawler settings alone cannot prove the engagement stayed in scope.

**Limits:** Source and tests read; nothing executed.

**Sources:** [bots-swarms/continuation.md:2209](../../bots-swarms/continuation.md#L2209), [bots-swarms/continuation.md:2207](../../bots-swarms/continuation.md#L2207), [bots-swarms/continuation.md:1943](../../bots-swarms/continuation.md#L1943), [bots-swarms/continuation.md:2187](../../bots-swarms/continuation.md#L2187)

### crawling-loadredirect-keeps-body-cross-origin

**`crawling-load.redirect-keeps-body-cross-origin`: Scrapy cross-origin 307/308 redirects keep POST body and custom headers** (source-trace)

Scrapy redirect tests explicitly preserve the POST body and content headers on 307/308 to a different host; only Authorization (on scheme/host/port change) and Cookie (by host/scheme rules) are stripped, and custom headers like X-Custom survive. Cookie middleware can repopulate eligible cookies after the redirect.

**Do:** Authenticated testing that posts secrets or tokens in bodies/custom headers must pin redirect destinations, or test credentials may be sent to third parties.

**Limits:** Constructed middleware calls; no hosts contacted.

**Sources:** [bots-swarms/continuation.md:1851](../../bots-swarms/continuation.md#L1851), [bots-swarms/continuation.md:1851](../../bots-swarms/continuation.md#L1851)

### crawling-loadstatus-code-not-prevention

**`crawling-load.status-code-not-prevention`: A 429 response does not prove the protected handler did not run (Express FailMark)** (source-trace)

In rate-limiter-flexible's ExpressBruteFlexible, FailMark sets 429 and still calls next(), so the handler runs; custom fail callbacks decide continuation. The core limiter returns a promise rejection that the application must turn into denial before protected work.

**Do:** When testing a client's rate limiting, verify the protected effect did not occur, not just the status code.

**Limits:** Source trace; tests not run.

**Sources:** [bots-swarms/continuation.md:2870](../../bots-swarms/continuation.md#L2870)

### crawling-loadtls-verification-off-by-default

**`crawling-load.tls-verification-off-by-default`: Scrapy downloads with TLS certificate verification disabled by default** (source-trace)

Pinned default_settings sets DOWNLOAD_VERIFY_CERTIFICATES=False and the context factory takes the non-verifying branch; Scrapy's security page documents the same and that plaintext HTTP/FTP and local file/data handlers are enabled.

**Do:** Turn verification on for authenticated client testing, or a man-in-the-middle can capture test credentials and alter evidence.

**Limits:** Configuration trace; verification-enabled behavior delegates to unreviewed Twisted/OpenSSL.

**Sources:** [bots-swarms/continuation.md:2822](../../bots-swarms/continuation.md#L2822), [bots-swarms/continuation.md:1021](../../bots-swarms/continuation.md#L1021)

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| medium | [bots-swarms/continuation.md:2884](../../bots-swarms/continuation.md#L2884) | [bots-swarms/continuation.md:2888](../../bots-swarms/continuation.md#L2888) | Treat the res.length concern as weakened by contrary test evidence; unresolved without runtime. |
| medium | [bots-swarms/continuation.md:2628](../../bots-swarms/continuation.md#L2628) | [bots-swarms/continuation.md:2636](../../bots-swarms/continuation.md#L2636) | Coraza Include is implemented; the 100-include bound is cumulative, not depth. |
| medium | [bots-swarms/catalog.md:10](../../bots-swarms/catalog.md#L10) | [bots-swarms/findings.md:19](../../bots-swarms/findings.md#L19) | Coraza enforcement path is fully traced at source level (still no Go run). |
| medium | [bots-swarms/source-notes.md:39](../../bots-swarms/source-notes.md#L39) | [bots-swarms/continuation.md:2465](../../bots-swarms/continuation.md#L2465) | Use cont:2449-2465 for drain/child shutdown semantics. |
| medium | [bots-swarms/continuation.md:2987](../../bots-swarms/continuation.md#L2987) | [bots-swarms/continuation.md:3007](../../bots-swarms/continuation.md#L3007) | Do not use getFlow maxChildren as a memory or result cap. |
| medium | [bots-swarms/continuation.md:3094](../../bots-swarms/continuation.md#L3094) | [bots-swarms/continuation.md:3094](../../bots-swarms/continuation.md#L3094) | Do not claim BullMQ shared suites are validated on Postgres from the setup files. |
| medium | [bots-swarms/continuation.md:1573](../../bots-swarms/continuation.md#L1573) | [bots-swarms/continuation.md:1569](../../bots-swarms/continuation.md#L1569) | For TypeScript BullMQ, sync listener throws are caught; malformed JSON and async rejections remain the failure modes. |
| medium | [bots-swarms/continuation.md:2479](../../bots-swarms/continuation.md#L2479) | [bots-swarms/continuation.md:2497](../../bots-swarms/continuation.md#L2497) | The watchdog finding is about method ordering; real cluster reconnect attempts are capped at 30 s each, though there is still no end-to-end bound. |
| low | [bots-swarms/continuation.md:1985](../../bots-swarms/continuation.md#L1985) | [bots-swarms/continuation.md:1977](../../bots-swarms/continuation.md#L1977) | Do not claim a Scrapy shutdown hang from CallLaterOnce. |
| low | [bots-swarms/continuation.md:2898](../../bots-swarms/continuation.md#L2898) | [bots-swarms/continuation.md:2904](../../bots-swarms/continuation.md#L2904) | Etcd expiry accumulation and SQLite early release are confirmed for adapter control flow only. |
| low | [bots-swarms/continuation.md:2033](../../bots-swarms/continuation.md#L2033) | [bots-swarms/continuation.md:2029](../../bots-swarms/continuation.md#L2029) | FilesPipeline tests are read; use cont:2029-2031. |
| low | [bots-swarms/continuation.md:2977](../../bots-swarms/continuation.md#L2977) | [bots-swarms/continuation.md:2980](../../bots-swarms/continuation.md#L2980) | Current CI is GitHub Actions; still no passing-run receipt. |
| low | [bots-swarms/continuation.md:1727](../../bots-swarms/continuation.md#L1727) | [bots-swarms/continuation.md:1677](../../bots-swarms/continuation.md#L1677) | Multi-selector update remains an untested source hypothesis. |
| low | [bots-swarms/coverage.md:40](../../bots-swarms/coverage.md#L40) | [bots-swarms/continuation.md:157](../../bots-swarms/continuation.md#L157) | ipMatch.json is fully read; coverage.md:40 contradicts coverage.md:3. |
| low | [bots-swarms/defense.md:33](../../bots-swarms/defense.md#L33) | [bots-swarms/incident-review.md:3](../../bots-swarms/incident-review.md#L3) | Use incident-review.md. |
| low | [bots-swarms/source-notes.md:31](../../bots-swarms/source-notes.md#L31) | [bots-swarms/source-notes.md:43](../../bots-swarms/source-notes.md#L43) | moveJobToWait is read. |
| low | [bots-swarms/continuation.md:557](../../bots-swarms/continuation.md#L557) | [bots-swarms/continuation.md:547](../../bots-swarms/continuation.md#L547) | worker.ex is fully reviewed; use cont:547-553 findings. |
| low | [bots-swarms/continuation.md:1623](../../bots-swarms/continuation.md#L1623) | [bots-swarms/continuation.md:1617](../../bots-swarms/continuation.md#L1617) | Read finalization order per cont:1617. |
| low | [bots-swarms/continuation.md:2983](../../bots-swarms/continuation.md#L2983) | [bots-swarms/continuation.md:3001](../../bots-swarms/continuation.md#L3001) | Flow suite is fully read. |
| low | [bots-swarms/continuation.md:2543](../../bots-swarms/continuation.md#L2543) | [bots-swarms/continuation.md:2568](../../bots-swarms/continuation.md#L2568) | memberlist has a 40 MiB per-decompression cap only. |
| low | [bots-swarms/continuation.md:1485](../../bots-swarms/continuation.md#L1485) | [bots-swarms/continuation.md:1477](../../bots-swarms/continuation.md#L1477) | Python worker.py is fully reviewed. |
| low | [bots-swarms/continuation.md:3042](../../bots-swarms/continuation.md#L3042) | [bots-swarms/continuation.md:3062](../../bots-swarms/continuation.md#L3062) | Queue.clean overshoot is confirmed at the caller boundary (real deletion untested). |
| low | [bots-swarms/continuation.md:1601](../../bots-swarms/continuation.md#L1601) | [bots-swarms/continuation.md:1597](../../bots-swarms/continuation.md#L1597) | Job rescheduling updates local delay/priority properties, not opts. |
