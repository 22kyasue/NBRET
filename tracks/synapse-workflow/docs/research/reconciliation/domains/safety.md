# Safety boundaries and stopped work

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 10 findings, 84 related corrections, 24 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.anti-blocking-advice`** [bots-swarms/continuation.md:1035](../../bots-swarms/continuation.md#L1035): Adopting evasion/IP-rotation advice for client crawling. **Instead:** Identify crawlers and use negotiated quotas; docs/research/bots-swarms/model.md:60 (study, not operational evasion).
- **`hazard.atomic-whatif-as-dry-run`** [assessment-evidence/deep-atomic.md:38](../../assessment-evidence/deep-atomic.md#L38): An agent may assume -WhatIf is a safe dry run on a real endpoint. **Instead:** Do not run Atomic tests on this PC or client endpoints without explicit approval (docs/research/assessment-evidence/implementations.md:25).
- **`hazard.continuation-next-step`** [bots-swarms/continuation.md:2463](../../bots-swarms/continuation.md#L2463): Outdated next-step instruction; the work is done. **Instead:** Reading is closed per docs/research/bots-swarms/scope-closure.md:30.
- **`hazard.drain-regression-fixture`** [bots-swarms/continuation.md:3058](../../bots-swarms/continuation.md#L3058): Building and running a Redis regression unprompted. **Instead:** Treat as an open hypothesis; requires explicit authorization (repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them")).
- **`hazard.garak-init-network`** [assessment-evidence/deep-garak.md:27](../../assessment-evidence/deep-garak.md#L27): An agent may initialize garak assuming it is local-only, generating provider traffic and cost. **Instead:** Treat scanner construction as network activity requiring authorization (docs/research/reconciliation/README.md:5).
- **`hazard.go-flagged-operation-wording`** [toolchain/go-material-review.md:9](../../toolchain/go-material-review.md#L9): Agent infers a specific recovered safety warning or rejected call behind repeated "flagged operation" phrases, or guesses what it was. **Instead:** Treat it as a conservative stop instruction with unknown cause; do not infer or retry (safety-context/README.md:33).
- **`hazard.go-integration-tests-live`** [toolchain/go-material-review.md:1350](../../toolchain/go-material-review.md#L1350): Agent runs upstream SDK integration/perf tests that load AWS config and create/delete real buckets. **Instead:** Do not run; go-material-review.md:1348 heading says do not run; research is source-only.
- **`hazard.go-jsonschema-example-network`** [toolchain/go-material-review.md:1200](../../toolchain/go-material-review.md#L1200): Agent runs `go test` on jsonschema and triggers an outbound GitHub request. **Instead:** Run nothing without containment review; filter tests.
- **`hazard.go-partial-file-status`** [toolchain/go-material-review.md:1379](../../toolchain/go-material-review.md#L1379): Agent reports api_client.go as partially reviewed. **Instead:** Completed at go-material-review.md:1391 (1–1372).
- **`hazard.go-prioritized-queue-outdated`** [toolchain/go-material-review.md:1118](../../toolchain/go-material-review.md#L1118): Agent takes the old "Prioritized unread queue" as current next work. **Instead:** Queue was completed later (S3 manager closure go-material-review.md:1361; serializers go-material-review.md:1623); verify in go-material-queue.json.
- **`hazard.go-stale-unread-counts`** [toolchain/go-material-review.md:9](../../toolchain/go-material-review.md#L9): Agent believes S3 module review is incomplete and re-reads or re-plans based on stale counts. **Instead:** Section order is newest-first in lines 3–712; later passages record file closures (e.g. go-material-review.md:1623, 1869, 2049). Check go-material-queue.json.
- **`hazard.go-transport-test-large-workloads`** [toolchain/go-material-review.md:827](../../toolchain/go-material-review.md#L827): Agent runs net/http transport tests with 1GiB bodies, unbounded producers or real DNS. **Instead:** Keep unexecuted; see go-material-review.md:847 (real DNS) and go-material-review.md:881.
- **`hazard.mockserver-all-interfaces`** [bots-swarms/continuation.md:1967](../../bots-swarms/continuation.md#L1967): Reusing Scrapy mock servers as an isolated lab (they bind all interfaces). **Instead:** Bind explicitly to loopback in any authorized lab.
- **`hazard.pgx-benchmark-drop-table`** [assessment-evidence/pgx-binding-boundaries.md:373](../../assessment-evidence/pgx-binding-boundaries.md#L373): Running pgx benchmarks against an existing database would drop table t. **Instead:** Never run against a non-disposable database; source review only (pgx-binding-boundaries.md:373).
- **`hazard.pgx-dev-commands`** [assessment-evidence/pgx-binding-boundaries.md:202](../../assessment-evidence/pgx-binding-boundaries.md#L202): Running pgx host setup or devcontainer scripts would install unpinned software and privileged services. **Instead:** Read only (pgx-binding-boundaries.md:190, :202); no installs without approval.
- **`hazard.priorities-capability-backlog`** [security-landscape/deep-review/priorities.md:7](../../security-landscape/deep-review/priorities.md#L7): An agent may treat the finite backlog as authorization to continue capability/scope/auth-failure investigation. **Instead:** Tomo's continuation was stopped and moved to report interpretation (docs/research/safety-context/README.md:14); later entries say no further capability/reachability lab is authorized (priorities.md:31).
- **`hazard.private-cluster-seeds`** [bots-swarms/continuation.md:1227](../../bots-swarms/continuation.md#L1227): Executing tests that contact private network addresses. **Instead:** Do not run; contacting unscoped targets is out of bounds.
- **`hazard.privileged-compose`** [bots-swarms/continuation.md:2977](../../bots-swarms/continuation.md#L2977): Launching the supplied privileged Compose fixture that deletes /data and binds all interfaces. **Instead:** Do not launch; recorded at docs/research/bots-swarms/continuation.md:2977 as unsuitable.
- **`hazard.readme-reachability-next`** [security-landscape/deep-review/priorities.md:29](../../security-landscape/deep-review/priorities.md#L29): An agent may pursue scanner reachability tracing/labs as an open next step. **Instead:** Superseded by the stop recorded at priorities.md:31 and docs/research/safety-context/README.md:14.
- **`hazard.reproduce-lab-command`** [assessment-evidence/executable-claims.md:16](../../assessment-evidence/executable-claims.md#L16): The 'Reproduce' block invites running a research script. **Instead:** Use the retained receipt lab-receipt-20261017.json; run only with explicit user instruction (docs/research/reconciliation/README.md:5).
- **`hazard.requires-internet-tests`** [bots-swarms/continuation.md:2231](../../bots-swarms/continuation.md#L2231): Running Scrapy tests assuming they are offline. **Instead:** Exclude internet-marked tests explicitly; no external contact without authorization.
- **`hazard.takumi-connect-repo`** [cybersecurity-firms/gmo-flatt-security.md:35](../../cybersecurity-firms/gmo-flatt-security.md#L35): An agent evaluating Takumi could upload NBRET or client code or install the write-enabled GitHub App. **Instead:** Do not upload code or install apps without explicit approval (gmo-flatt-security.md:35; takumi-github-scope-boundary.md:11).
- **`hazard.tox-aws-credentials`** [bots-swarms/continuation.md:585](../../bots-swarms/continuation.md#L585): Running Scrapy tox environments that pass through cloud credentials and download dependencies. **Instead:** Do not run; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them").
- **`hazard.upstream-flushall-suite`** [bots-swarms/continuation.md:2734](../../bots-swarms/continuation.md#L2734): Running upstream test suites against a shared Redis wipes data. **Instead:** Do not run; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them"); docs/research/safety-context/README.md:37 (do not recreate actions).

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [A code gate rejected hostile export and cross-tenant actions; no model involved](#safetycapability-gate-outside-model) | component-lab | authorization, operations |
| [Atomic installers fetch unpinned master and setup mutates host services and registry](#safetyatomic-install-mutates-host-unpinned) | source-trace | operations, scoping |
| [Scrapy remote control and Telnet are on by default, allowing in-process Python](#safetycrawler-remote-control-default-on) | source-trace | operations |
| [pgx devcontainer shares AI agent config/history on one volume; not client isolation](#safetydev-environment-not-client-isolation) | source-trace | operations, scoping |
| [Running pinned upstream Go test suites unfiltered can touch real cloud, DNS and internet](#safetygo-upstream-tests-have-live-side-effects) | source-trace | operations |
| [garak can contact a configured model service at construction, before any probe](#safetyllm-scanner-contacts-providers-on-init) | source-trace | scoping, operations, authorization |
| [Upstream queue/limiter test suites flush Redis, drop schemas or reach the internet](#safetyupstream-test-suites-destructive) | source-trace | operations, testing |
| [Takumi graybox: excluded URLs may still be requested and live tests can alter target data](#safetytakumi-exclusions-not-access-block) | public-doc | scoping, authorization, testing |
| [No full Nuclei engine/package run exists: Windows blocked a dependency build](#safetynuclei-full-engine-never-run) | synthesis | testing, operations |
| [Only one research stop has a known cause: Windows blocked a downloaded build dependency](#safetystop-causes-unknown) | synthesis | operations |

### safetycapability-gate-outside-model

**`safety.capability-gate-outside-model`: A code gate rejected hostile export and cross-tenant actions; no model involved** (component-lab)

The lab treated a hostile target instruction as data and submitted candidate actions directly to a code gate. The gate validates operation, tenant, record and unexpected fields: one allowed read passed, export and another tenant's read failed. It is not an LLM prompt-injection benchmark or an OS sandbox.

**Do:** Put scope and tenant enforcement in code at every tool path (shell, network, filesystem, alternate tools), then test bypass attempts. Model compliance is not a control.

**Limits:** Only gate decisions were tested. All execution paths using the gate is unproven.

**Sources:** [assessment-evidence/executable-claims.md:25](../../assessment-evidence/executable-claims.md#L25)

**Receipts:** `assessment-evidence/lab-receipt-20261017.json`

### safetyatomic-install-mutates-host-unpinned

**`safety.atomic-install-mutates-host-unpinned`: Atomic installers fetch unpinned master and setup mutates host services and registry** (source-trace)

install-atomicredteam.ps1 downloads a caller-selected branch archive (default master) without a content hash and installs unpinned powershell-yaml. Runner setup can elevate, store credentials, register services/tasks and modify profile/cron/registry/PATH. The k8s example is privileged:true. The Docker image tag does not bind the framework bytes.

**Do:** Defensive-validation offerings need a pinned, hash-verified runner and explicit approval of host mutations. Install only on a disposable representative endpoint.

**Limits:** Source only; nothing was installed.

**Sources:** [assessment-evidence/deep-atomic.md:61](../../assessment-evidence/deep-atomic.md#L61), [assessment-evidence/deep-atomic.md:55](../../assessment-evidence/deep-atomic.md#L55)

### safetycrawler-remote-control-default-on

**`safety.crawler-remote-control-default-on`: Scrapy remote control and Telnet are on by default, allowing in-process Python** (source-trace)

Remote-control HTTP is enabled by default on loopback with a random port and a token stored in a job file (owner-only permissions claimed only for Linux/macOS); one token grants arbitrary Python execution with crawler authority and no scopes. Telnet is also on by default on loopback with a logged generated password and full process authority, without transport encryption.

**Do:** Disable both on assessment hosts, or treat any local user/process as able to take over crawls holding client credentials.

**Limits:** Source/test reading; Windows ACL behavior unverified; nothing started.

**Sources:** [bots-swarms/continuation.md:1023](../../bots-swarms/continuation.md#L1023), [bots-swarms/continuation.md:2826](../../bots-swarms/continuation.md#L2826), [bots-swarms/continuation.md:1029](../../bots-swarms/continuation.md#L1029)

### safetydev-environment-not-client-isolation

**`safety.dev-environment-not-client-isolation`: pgx devcontainer shares AI agent config/history on one volume; not client isolation** (source-trace)

pgx's devcontainer puts AI agent configuration/home, shell history, PostgreSQL history and tool caches on one external shared volume and conditionally runs an unversioned shared post-create executable; five Go tools use 'latest'. The test OAuth validator logs the token and unconditionally authorizes. CI comments out TLS/SCRAM-plus test variables despite docs claiming identical auth paths.

**Do:** Assessor environments for client work need per-engagement volumes, pinned tooling and their own information barriers; do not copy developer convenience setups or treat test OAuth plumbing as assurance.

**Limits:** Configuration source only; no image built, no volume contents accessed.

**Sources:** [assessment-evidence/pgx-binding-boundaries.md:344](../../assessment-evidence/pgx-binding-boundaries.md#L344), [assessment-evidence/pgx-binding-boundaries.md:400](../../assessment-evidence/pgx-binding-boundaries.md#L400), [assessment-evidence/pgx-binding-boundaries.md:181](../../assessment-evidence/pgx-binding-boundaries.md#L181)

**Contrary or narrowing evidence:**
- [assessment-evidence/pgx-binding-boundaries.md:186](../../assessment-evidence/pgx-binding-boundaries.md#L186): Positive control against cross-target false passes.

### safetygo-upstream-tests-have-live-side-effects

**`safety.go-upstream-tests-have-live-side-effects`: Running pinned upstream Go test suites unfiltered can touch real cloud, DNS and internet** (source-trace)

S3 manager integration init loads default AWS config and TestMain creates a random bucket then runs destructive cleanup; perf harnesses retry uploads indefinitely without deletion; a jsonschema example performs a real client.Get to a public GitHub URL; net/http transport_test includes a real-DNS test and up to 1GiB request bodies.

**Do:** Never run `go test ./...` on vendored dependencies during research or engagements without a containment review; filter to known local tests.

**Limits:** Source-reading only; none were run.

**Sources:** [toolchain/go-material-review.md:1350](../../toolchain/go-material-review.md#L1350), [toolchain/go-material-review.md:1200](../../toolchain/go-material-review.md#L1200), [toolchain/go-material-review.md:847](../../toolchain/go-material-review.md#L847)

### safetyllm-scanner-contacts-providers-on-init

**`safety.llm-scanner-contacts-providers-on-init`: garak can contact a configured model service at construction, before any probe** (source-trace)

garak's OpenAI-compatible generator performs a connectivity GET at construction when a URI is set, and may list models when a name is missing. Credentials load from the environment. There is no engagement allowlist or billing budget, and backoff has a max wait but no max tries or total duration. Payload and plugin caches validate by mtime, not content hash.

**Do:** Treat initializing an LLM scanner as outbound traffic to the configured endpoint. Approve endpoints and budgets per engagement and record payload content hashes for reproducibility.

**Limits:** Source reading; no provider contacted.

**Sources:** [assessment-evidence/deep-garak.md:27](../../assessment-evidence/deep-garak.md#L27), [assessment-evidence/deep-garak.md:67](../../assessment-evidence/deep-garak.md#L67)

### safetyupstream-test-suites-destructive

**`safety.upstream-test-suites-destructive`: Upstream queue/limiter test suites flush Redis, drop schemas or reach the internet** (source-trace)

rate-limiter-flexible Redis suites call flushAll before every test; BullMQ Python tests flushdb localhost without prefix restriction and a helper runs FLUSHALL; Postgres migration tests DROP SCHEMA CASCADE; Scrapy conftest marks requires_internet tests flaky with retries rather than skipping them; some suites seed a private 10.0.6.161 cluster address.

**Do:** Never run these suites against shared or client infrastructure; run only in disposable isolated environments after reviewing targets.

**Limits:** Read only; no suite was run.

**Sources:** [bots-swarms/continuation.md:2734](../../bots-swarms/continuation.md#L2734), [bots-swarms/continuation.md:1513](../../bots-swarms/continuation.md#L1513), [bots-swarms/continuation.md:1387](../../bots-swarms/continuation.md#L1387), [bots-swarms/continuation.md:2231](../../bots-swarms/continuation.md#L2231)

### safetytakumi-exclusions-not-access-block

**`safety.takumi-exclusions-not-access-block`: Takumi graybox: excluded URLs may still be requested and live tests can alter target data** (public-doc)

The Takumi graybox manual (updated 2026-10-16) lets customers list exclusion URLs, but states this is not a complete access block: excluded URLs may still be accessed. Live reproduction can create, modify or delete accounts and data, so the provider recommends an isolated staging target. The model can also add its own exclusions to configured include paths.

**Do:** Do not rely on an AI assessor's exclusion list as scope enforcement; enforce scope at a network/proxy layer we control and run destructive-capable live verification only against an isolated replica or staging environment with disposable accounts and data.

**Limits:** Documented vendor behavior from manuals; no Takumi assessment was executed and actual request patterns to excluded URLs were not observed.

**Sources:** [cybersecurity-firms/gmo-flatt-security.md:19](../../cybersecurity-firms/gmo-flatt-security.md#L19), [cybersecurity-firms/gmo-flatt-security.md:22](../../cybersecurity-firms/gmo-flatt-security.md#L22), [cybersecurity-firms/gmo-flatt-security.md:18](../../cybersecurity-firms/gmo-flatt-security.md#L18)

### safetynuclei-full-engine-never-run

**`safety.nuclei-full-engine-never-run`: No full Nuclei engine/package run exists: Windows blocked a dependency build** (synthesis)

The predeclared composition lab failed with zero tests because Windows blocked a downloaded goimpacket archive used transitively by interactsh; it was deliberately not retried. All Nuclei evidence is source reading plus narrow component tests; a standalone NetworkPolicy run also executed zero tests.

**Do:** Do not cite Nuclei findings as engine-validated; do not retry the blocked build or change Windows security controls.

**Limits:** Describes evidence availability, not Nuclei quality.

**Sources:** [security-landscape/deep-review/nuclei-matchers.md:3](../../security-landscape/deep-review/nuclei-matchers.md#L3), [security-landscape/deep-review/priorities.md:13](../../security-landscape/deep-review/priorities.md#L13)

**Receipts:** `security-landscape/deep-review/nuclei-composition-lab-receipt.json`, `security-landscape/deep-review/nuclei-network-policy-lab-receipt.json`

**Contrary or narrowing evidence:**
- [safety-context/README.md:11](../../safety-context/README.md#L11): Safety audit record of the same event.

### safetystop-causes-unknown

**`safety.stop-causes-unknown`: Only one research stop has a known cause: Windows blocked a downloaded build dependency** (synthesis)

The safety-context audit (2026-10-17 events) establishes one actual error: Windows endpoint/file security blocked a downloaded dependency archive during Tomo's build (the dependency graph, not test intent, decided what the OS encountered). The later pauses (Linden, Tomo, Agate) have user reports and stop instructions but no recovered warning text, rejected tool-call ID or policy reason. Earlier phrases like "flagged operation" overstated the evidence.

**Do:** Do not retry, recreate or route around any stopped operation to learn its cause; do not describe pauses as specific flagged actions. Expect transitive dependencies to trigger endpoint blocks on this PC.

**Limits:** Not an account-enforcement audit; account status unavailable.

**Sources:** [safety-context/README.md:21](../../safety-context/README.md#L21), [safety-context/README.md:33](../../safety-context/README.md#L33), [safety-context/README.md:37](../../safety-context/README.md#L37)

**Receipts:** `safety-context/audit.json`

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| high | [toolchain/go-material-review.md:569](../../toolchain/go-material-review.md#L569) | [toolchain/go-material-review.md:563](../../toolchain/go-material-review.md#L563) | Believe the conditional A/B mismatch; it is not a demonstrated bypass. |
| high | [toolchain/go-material-review.md:1009](../../toolchain/go-material-review.md#L1009) | [toolchain/go-material-review.md:999](../../toolchain/go-material-review.md#L999) | Treat the A→B→B redirect token restoration as an open source-level candidate. |
| high | [toolchain/go-material-review.md:1890](../../toolchain/go-material-review.md#L1890) | [toolchain/go-material-review.md:1895](../../toolchain/go-material-review.md#L1895) | Treat GetObject checksum validation as conditional (200, EOF, supported algorithm, non-multipart). |
| high | [toolchain/go-material-review.md:1927](../../toolchain/go-material-review.md#L1927) | [toolchain/go-material-review.md:1935](../../toolchain/go-material-review.md#L1935) | Checksum retention across retries is intended; do not report it as an integrity bypass. |
| high | [toolchain/go-material-review.md:2019](../../toolchain/go-material-review.md#L2019) | [toolchain/go-material-review.md:2023](../../toolchain/go-material-review.md#L2023) | Require an observed End event for completeness. |
| high | [cybersecurity-firms/takumi-domestic-inference-announcement.md:5](../../cybersecurity-firms/takumi-domestic-inference-announcement.md#L5) | [cybersecurity-firms/gmo-flatt-security.md:61](../../cybersecurity-firms/gmo-flatt-security.md#L61) | Assume overseas inference for Takumi unless a signed domestic-inference arrangement is in place and active. |
| high | [security-landscape/coverage.md:90](../../security-landscape/coverage.md#L90) | [safety-context/README.md:33](../../safety-context/README.md#L33) | Treat pauses as stops with unknown cause; keep them stopped but do not assert a specific flagged action. |
| medium | [security-landscape/deep-review/nuclei-matchers.md:9](../../security-landscape/deep-review/nuclei-matchers.md#L9) | [security-landscape/deep-review/nuclei-matchers.md:27](../../security-landscape/deep-review/nuclei-matchers.md#L27) | Nuclei LLM matcher default confidence is 0.5. |
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
| medium | [assessment-evidence/pgx-binding-boundaries.md:308](../../assessment-evidence/pgx-binding-boundaries.md#L308) | [assessment-evidence/pgx-binding-boundaries.md:429](../../assessment-evidence/pgx-binding-boundaries.md#L429) | pgx does test selected integer narrowing rejection; do not claim that coverage is missing. |
| medium | [assessment-evidence/pgx-binding-boundaries.md:121](../../assessment-evidence/pgx-binding-boundaries.md#L121) | [assessment-evidence/pgx-binding-boundaries.md:126](../../assessment-evidence/pgx-binding-boundaries.md#L126) | Do not report the ltree index as reachable without a registration path. |
| medium | [assessment-evidence/pgx-binding-boundaries.md:356](../../assessment-evidence/pgx-binding-boundaries.md#L356) | [assessment-evidence/pgx-binding-boundaries.md:391](../../assessment-evidence/pgx-binding-boundaries.md#L391) | The weakness is specific to one batch example; pgx stdlib rollback testing is strong. |
| medium | [assessment-evidence/pgx-binding-boundaries.md:294](../../assessment-evidence/pgx-binding-boundaries.md#L294) | [assessment-evidence/pgx-binding-boundaries.md:299](../../assessment-evidence/pgx-binding-boundaries.md#L299) | The int64 conversion is reachable only via the sql.Scanner adapter path, not ordinary database/sql rows. |
| medium | [toolchain/go-material-review.md:1749](../../toolchain/go-material-review.md#L1749) | [toolchain/go-material-review.md:2025](../../toolchain/go-material-review.md#L2025) | Select results are delivered via the eventstream middleware. |
| medium | [toolchain/go-material-review.md:1083](../../toolchain/go-material-review.md#L1083) | [toolchain/go-material-review.md:979](../../toolchain/go-material-review.md#L979) | Length mismatches error at transport but may have partial remote effect. |
| medium | [toolchain/go-material-review.md:1467](../../toolchain/go-material-review.md#L1467) | [toolchain/go-material-review.md:961](../../toolchain/go-material-review.md#L961) | No header injection claim via standard transport; custom RoundTrippers differ. |
| medium | [assessment-evidence/deep-garak.md:73](../../assessment-evidence/deep-garak.md#L73) | [assessment-evidence/deep-garak.md:91](../../assessment-evidence/deep-garak.md#L91) | Live-plugin tag dependence applies to Report.get_evaluations/AVID export, not the modern digest. |
| medium | [assessment-evidence/framework.md:30](../../assessment-evidence/framework.md#L30) | [assessment-evidence/deep-garak.md:178](../../assessment-evidence/deep-garak.md#L178) | Describe garak evaluation counts as output-per-detector judgments, not prompt counts. |
| medium | [security-landscape/learning-reader-map.md:40](../../security-landscape/learning-reader-map.md#L40) | [safety-context/README.md:33](../../safety-context/README.md#L33) | Keep the stop, drop the implied certainty about a flag. |
| medium | [assessment-evidence/cel-async-boundaries.md:27](../../assessment-evidence/cel-async-boundaries.md#L27) | [safety-context/README.md:33](../../safety-context/README.md#L33) | Keep the OpenFGA recovery reproduction stopped, but do not claim a specific policy flag or cause. |
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
| low | [assessment-evidence/pgx-binding-boundaries.md:3](../../assessment-evidence/pgx-binding-boundaries.md#L3) | [assessment-evidence/pgx-binding-boundaries.md:47](../../assessment-evidence/pgx-binding-boundaries.md#L47) | Use 5e583fa7aabfa88b796292f849fc9d7d75ac159d as the pgx v5.11.0 pin. |
| low | [assessment-evidence/pgx-binding-boundaries.md:217](../../assessment-evidence/pgx-binding-boundaries.md#L217) | [assessment-evidence/pgx-binding-boundaries.md:219](../../assessment-evidence/pgx-binding-boundaries.md#L219) | pgx interval-to-duration conversion has no overflow check and uses a fixed 30-day month. |
| low | [assessment-evidence/pgx-binding-boundaries.md:384](../../assessment-evidence/pgx-binding-boundaries.md#L384) | [assessment-evidence/pgx-binding-boundaries.md:384](../../assessment-evidence/pgx-binding-boundaries.md#L384) | Inspect actual conversion, not metadata suggestions, when judging decimal precision. |
| low | [assessment-evidence/pgx-binding-boundaries.md:73](../../assessment-evidence/pgx-binding-boundaries.md#L73) | [assessment-evidence/pgx-binding-boundaries.md:330](../../assessment-evidence/pgx-binding-boundaries.md#L330) | Cite specific weak oracles, not a blanket claim that pgx tests lack cardinality checks. |
| low | [assessment-evidence/pgx-binding-boundaries.md:160](../../assessment-evidence/pgx-binding-boundaries.md#L160) | [assessment-evidence/pgx-binding-boundaries.md:174](../../assessment-evidence/pgx-binding-boundaries.md#L174) | The template import mismatch is not a broken generation pipeline. |
| low | [assessment-evidence/pgx-binding-boundaries.md:315](../../assessment-evidence/pgx-binding-boundaries.md#L315) | [assessment-evidence/pgx-binding-boundaries.md:318](../../assessment-evidence/pgx-binding-boundaries.md#L318) | tsvector has a default registered codec in pgx; there is no negative registration finding. |
| low | [assessment-evidence/pgx-binding-boundaries.md:440](../../assessment-evidence/pgx-binding-boundaries.md#L440) | [assessment-evidence/pgx-binding-boundaries.md:433](../../assessment-evidence/pgx-binding-boundaries.md#L433) | Typed nil handling depends on the Valuer; do not assume NULL. |
| low | [toolchain/go-material-review.md:429](../../toolchain/go-material-review.md#L429) | [toolchain/go-material-review.md:425](../../toolchain/go-material-review.md#L425) | Misleading return contract only. |
| low | [toolchain/go-material-review.md:1945](../../toolchain/go-material-review.md#L1945) | [toolchain/go-material-review.md:1949](../../toolchain/go-material-review.md#L1949) | Checksum package findings apply to UploadPart/PutObject, with different trailer placement. |
| low | [toolchain/go-material-review.md:895](../../toolchain/go-material-review.md#L895) | [toolchain/go-material-review.md:951](../../toolchain/go-material-review.md#L951) | Closed bodies may be drained (≤256KiB) and reused. |
| low | [toolchain/go-material-review.md:1411](../../toolchain/go-material-review.md#L1411) | [toolchain/go-material-review.md:1419](../../toolchain/go-material-review.md#L1419) | Do not claim a connection leak from the NopCloser wrapper alone. |
| low | [toolchain/go-material-review.md:141](../../toolchain/go-material-review.md#L141) | [toolchain/go-material-review.md:369](../../toolchain/go-material-review.md#L369) | Do not cite RecursionDetection as a loop detector. |
| low | [toolchain/go-material-review.md:783](../../toolchain/go-material-review.md#L783) | [toolchain/go-material-review.md:803](../../toolchain/go-material-review.md#L803) | Response parsing tolerates spaces in field names. |
| low | [assessment-evidence/deep-garak.md:97](../../assessment-evidence/deep-garak.md#L97) | [assessment-evidence/deep-garak.md:202](../../assessment-evidence/deep-garak.md#L202) | The stale-first-digest risk applies to append/rebuild paths other than rebuild_cis. |
| low | [cybersecurity-firms/gmo-flatt-security.md:49](../../cybersecurity-firms/gmo-flatt-security.md#L49) | [cybersecurity-firms/takumi-github-scope-boundary.md:11](../../cybersecurity-firms/takumi-github-scope-boundary.md#L11) | Treat the App manifest as unknown, not merely queued. |
| low | [bots-swarms/coverage.md:40](../../bots-swarms/coverage.md#L40) | [bots-swarms/continuation.md:157](../../bots-swarms/continuation.md#L157) | ipMatch.json is fully read; coverage.md:40 contradicts coverage.md:3. |
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
