# Authorization testing and policy engines

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 43 findings, 106 related corrections, 30 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.anti-blocking-advice`** [bots-swarms/continuation.md:1035](../../bots-swarms/continuation.md#L1035): Adopting evasion/IP-rotation advice for client crawling. **Instead:** Identify crawlers and use negotiated quotas; docs/research/bots-swarms/model.md:60 (study, not operational evasion).
- **`hazard.ce-gateway-continuation-priorities`** [assessment-evidence/continuation-exhaustion.md:801](../../assessment-evidence/continuation-exhaustion.md#L801): An agent could resume the 8,622-line Swagger and binary-asset reading as if it were the active task. **Instead:** Only if Kotaro requests it; the review ended at a user-approved cutoff (continuation-exhaustion.md:799).
- **`hazard.ce-outdated-next-queue-model-write`** [assessment-evidence/continuation-exhaustion.md:94](../../assessment-evidence/continuation-exhaustion.md#L94): An agent may rerun an already completed admission fixture as a 'next step'. **Instead:** Already done and passed (continuation-exhaustion.md:104); do not rerun for volume (continuation-exhaustion.md:147).
- **`hazard.continuation-next-step`** [bots-swarms/continuation.md:2463](../../bots-swarms/continuation.md#L2463): Outdated next-step instruction; the work is done. **Instead:** Reading is closed per docs/research/bots-swarms/scope-closure.md:30.
- **`hazard.drain-regression-fixture`** [bots-swarms/continuation.md:3058](../../bots-swarms/continuation.md#L3058): Building and running a Redis regression unprompted. **Instead:** Treat as an open hypothesis; requires explicit authorization (repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them")).
- **`hazard.falconpy-test-authorization-real-tokens`** [cybersecurity-firms/falcon-auth-source.md:35](../../cybersecurity-firms/falcon-auth-source.md#L35): Importing or running the auth tests could pick up ambient credentials and hit CrowdStrike token endpoints. **Instead:** Do not import/run; no credential files were accessed (falcon-auth-source.md:35).
- **`hazard.go-flagged-operation-wording`** [toolchain/go-material-review.md:9](../../toolchain/go-material-review.md#L9): Agent infers a specific recovered safety warning or rejected call behind repeated "flagged operation" phrases, or guesses what it was. **Instead:** Treat it as a conservative stop instruction with unknown cause; do not infer or retry (safety-context/README.md:33).
- **`hazard.go-integration-tests-live`** [toolchain/go-material-review.md:1350](../../toolchain/go-material-review.md#L1350): Agent runs upstream SDK integration/perf tests that load AWS config and create/delete real buckets. **Instead:** Do not run; go-material-review.md:1348 heading says do not run; research is source-only.
- **`hazard.go-jsonschema-example-network`** [toolchain/go-material-review.md:1200](../../toolchain/go-material-review.md#L1200): Agent runs `go test` on jsonschema and triggers an outbound GitHub request. **Instead:** Run nothing without containment review; filter tests.
- **`hazard.go-partial-file-status`** [toolchain/go-material-review.md:1379](../../toolchain/go-material-review.md#L1379): Agent reports api_client.go as partially reviewed. **Instead:** Completed at go-material-review.md:1391 (1–1372).
- **`hazard.go-prioritized-queue-outdated`** [toolchain/go-material-review.md:1118](../../toolchain/go-material-review.md#L1118): Agent takes the old "Prioritized unread queue" as current next work. **Instead:** Queue was completed later (S3 manager closure go-material-review.md:1361; serializers go-material-review.md:1623); verify in go-material-queue.json.
- **`hazard.go-stale-unread-counts`** [toolchain/go-material-review.md:9](../../toolchain/go-material-review.md#L9): Agent believes S3 module review is incomplete and re-reads or re-plans based on stale counts. **Instead:** Section order is newest-first in lines 3–712; later passages record file closures (e.g. go-material-review.md:1623, 1869, 2049). Check go-material-queue.json.
- **`hazard.go-transport-test-large-workloads`** [toolchain/go-material-review.md:827](../../toolchain/go-material-review.md#L827): Agent runs net/http transport tests with 1GiB bodies, unbounded producers or real DNS. **Instead:** Keep unexecuted; see go-material-review.md:847 (real DNS) and go-material-review.md:881.
- **`hazard.lab-script-rerun`** [security-landscape/lab-results.md:7](../../security-landscape/lab-results.md#L7): Agent may rerun research labs as part of a reconciliation or audit task. **Instead:** Research commands are historical, not instructions (AGENTS.md); rerun only when the current task explicitly calls for it, loopback only.
- **`hazard.mockserver-all-interfaces`** [bots-swarms/continuation.md:1967](../../bots-swarms/continuation.md#L1967): Reusing Scrapy mock servers as an isolated lab (they bind all interfaces). **Instead:** Bind explicitly to loopback in any authorized lab.
- **`hazard.nuclei-full-path-reproduce`** [security-landscape/deep-review/nuclei-input-identity.md:23](../../security-landscape/deep-review/nuclei-input-identity.md#L23): An agent may retry the blocked Nuclei build or work around Windows controls to reproduce the full engine. **Instead:** Blocked goimpacket build must not be retried (priorities.md:13; nuclei-matchers.md:3; docs/research/safety-context/README.md:11).
- **`hazard.openfga-container-tests`** [assessment-evidence/continuation-exhaustion.md:283](../../assessment-evidence/continuation-exhaustion.md#L283): Running OpenFGA Postgres/MySQL package tests publishes all container ports and modifies replication auth, plus package-wide cleanup. **Instead:** Use the inert-driver approach (continuation-exhaustion.md:257) unless a fixture/ownership review is done and the user approves.
- **`hazard.openfga-recovery-channel-close-stopped`** [assessment-evidence/continuation-exhaustion.md:334](../../assessment-evidence/continuation-exhaustion.md#L334): An agent might design an equivalent recovery, panic or channel-close fixture for OpenFGA to close an open question. **Instead:** Permanently stopped for this scope (continuation-exhaustion.md:360, :799); see docs/research/safety-context/README.md:15 (Agate pause, cause unknown). Do not reproduce by another route.
- **`hazard.private-cluster-seeds`** [bots-swarms/continuation.md:1227](../../bots-swarms/continuation.md#L1227): Executing tests that contact private network addresses. **Instead:** Do not run; contacting unscoped targets is out of bounds.
- **`hazard.privileged-compose`** [bots-swarms/continuation.md:2977](../../bots-swarms/continuation.md#L2977): Launching the supplied privileged Compose fixture that deletes /data and binds all interfaces. **Instead:** Do not launch; recorded at docs/research/bots-swarms/continuation.md:2977 as unsuitable.
- **`hazard.requires-internet-tests`** [bots-swarms/continuation.md:2231](../../bots-swarms/continuation.md#L2231): Running Scrapy tests assuming they are offline. **Instead:** Exclude internet-marked tests explicitly; no external contact without authorization.
- **`hazard.sdk-copy-mode-force-replace`** [assessment-evidence/sdk-boundaries-continuation.md:62](../../assessment-evidence/sdk-boundaries-continuation.md#L62): Testing skill copy mode on a real workspace can replace real directories. **Instead:** Only use fresh owned temp trees (sdk-boundaries-continuation.md:62).
- **`hazard.sdk-credential-lab`** [assessment-evidence/sdk-boundaries-continuation.md:80](../../assessment-evidence/sdk-boundaries-continuation.md#L80): A credential-copy lab without overriding config sources would copy the user's real agent credentials. **Instead:** Follow sdk-boundaries-continuation.md:80: synthetic config dir and owned temp-root deletion checks.
- **`hazard.sdk-live-backend-tests`** [assessment-evidence/sdk-boundaries-continuation.md:531](../../assessment-evidence/sdk-boundaries-continuation.md#L531): Running the Claude SDK live Redis/S3 tests would use configured credentials and destructive teardown against real buckets. **Instead:** Do not inspect credentials or contact configured services (continuation-exhaustion.md:360).
- **`hazard.sdk-live-scripts`** [assessment-evidence/sdk-boundaries-continuation.md:64](../../assessment-evidence/sdk-boundaries-continuation.md#L64): Running wrapper live scripts makes paid provider calls with real credentials and deletes workspaces. **Instead:** Source only; historical plan steps are not authorization (sdk-boundaries-continuation.md:60).
- **`hazard.sdk-tests-visible-windows`** [assessment-evidence/sdk-boundaries-continuation.md:125](../../assessment-evidence/sdk-boundaries-continuation.md#L125): Running these transport tests opens console windows on the user's monitor. **Instead:** Do not run without hidden-window adaptation (user CLAUDE.md no-terminal-popup rule).
- **`hazard.status-source-notes`** [bots-swarms/source-notes.md:39](../../bots-swarms/source-notes.md#L39): Re-tracing completed work or claiming it is unknown. **Instead:** Traced at docs/research/bots-swarms/continuation.md:2449-2465.
- **`hazard.takumi-ownership-tokens`** [cybersecurity-firms/takumi-authority-boundary.md:7](../../cybersecurity-firms/takumi-authority-boundary.md#L7): An agent could place ownership tokens in DNS or a web root and dispatch dynamic assessments against a target. **Instead:** No tokens, DNS records or target requests were used; dynamic testing needs client authorization (takumi-authority-boundary.md:11; safety-context/README.md:29).
- **`hazard.tox-aws-credentials`** [bots-swarms/continuation.md:585](../../bots-swarms/continuation.md#L585): Running Scrapy tox environments that pass through cloud credentials and download dependencies. **Instead:** Do not run; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them").
- **`hazard.upstream-flushall-suite`** [bots-swarms/continuation.md:2734](../../bots-swarms/continuation.md#L2734): Running upstream test suites against a shared Redis wipes data. **Instead:** Do not run; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them"); docs/research/safety-context/README.md:37 (do not recreate actions).

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [Status-only 403 check missed a 403 that still returned another tenant's invoice (3/3)](#authorizationdeceptive-403-status-only-oracle-fails) | component-lab | testing, evidence, retest |
| [Deleting a store removed only its descriptor; data stayed readable in the in-memory backend](#authorizationdeletion-claim-needs-post-read) | component-lab | testing, retest, reporting |
| [Nuclei dynamic login failure is non-fatal: requests may proceed without credentials](#authorizationnuclei-dynamic-auth-failure-silent) | component-lab | authorization, testing, evidence |
| [Nuclei project cache keys before auth injection; tenant-A reply served for B's bytes](#authorizationnuclei-project-cache-preauth-key) | component-lab | authorization, testing, evidence, retest |
| [CEL cost limits are modeled post-operation units, not memory or wall-clock bounds](#authorizationopenfga-cel-cost-not-memory) | component-lab | testing, triage |
| [OpenFGA ReadChanges skips terminal rows.Err; a stream error can become an empty success](#authorizationopenfga-changefeed-terminal-error) | component-lab | testing, evidence, authorization |
| [OpenFGA rejects invalid CEL models before persistence; failed-compile state is not public](#authorizationopenfga-invalid-model-rejected) | component-lab | testing, triage, authorization |
| [OpenFGA condition context saturates uint64 max to int64 max; equality evaluates false](#authorizationopenfga-uint64-saturation) | component-lab | testing, triage |
| [Revoked worker token still passes signature/expiry; only authority check stops it](#authorizationrevocation-needs-current-authority-check) | component-lab | authorization, operations |
| [A cached 'allow' survived permission deletion until higher consistency was requested](#authorizationrevocation-retest-consistency) | component-lab | retest, remediation, evidence |
| [Python cookiejar: reused jar overwrites sessions, cookies cross ports](#authorizationstdlib-cookiejar-semantics) | component-lab | testing |
| [ZAP history cache picks a saved row regardless of auth/cookie headers (legacy caller)](#authorizationzap-history-cache-auth-blind) | component-lab | authorization, evidence |
| [The decision engine trusts the user the app names; test whether user A can make the app ask as B](#authorizationcaller-vs-subject-binding) | source-trace | scoping, testing, evidence |
| [Library weaknesses found in dependencies were not reachable in OpenFGA](#authorizationcheck-reachability-before-reporting-library-weakness) | source-trace | triage, reporting, testing |
| [Separate cookie jars do not separate Scrapy cache or dedup: keys omit Cookie/Authorization](#authorizationcrawler-cache-dedup-ignore-account) | source-trace | testing, evidence |
| [List-objects and list-users results can be silently truncated by caps or deadlines](#authorizationenumeration-not-complete) | source-trace | testing, evidence, reporting |
| [FalconPy uses ambient env credentials; extra headers override auth; token_valid is local](#authorizationfalcon-sdk-ambient-credentials-and-header-precedence) | source-trace | authorization, operations |
| [A 'false' decision can be an error, an omission or a race, not a policy denial](#authorizationfalse-is-not-deny) | source-trace | testing, evidence, triage |
| [grpc-gateway field masks address fields; they are not field-level authorization](#authorizationfield-mask-not-field-authz) | source-trace | testing |
| [S3 Express session cache can be keyed by override credentials B but minted with A](#authorizationgo-express-cache-key-vs-minting-identity) | source-trace | testing, evidence |
| [S3 auth selection does not downgrade to anonymous after a credential failure](#authorizationgo-no-anonymous-fallback-on-credential-failure) | source-trace | triage |
| [AWS Go SDK redirects: A→B→B chain can re-send session token; no hop limit](#authorizationgo-redirect-session-token-restoration) | source-trace | testing, triage |
| [HTTP verbs and operation names do not tell you whether a request changes state](#authorizationhttp-verb-not-safety) | source-trace | scoping, testing, operations |
| [JWT validation checks iat only if present, with no maximum age or revocation](#authorizationjwt-freshness-limits) | source-trace | testing, evidence |
| [MCP OAuth handlers leave single-use codes, refresh rotation and revocation to providers](#authorizationmcp-oauth-provider-obligations) | source-trace | testing, authorization, scoping |
| [MCP session ownership compares (client_id, issuer, subject), not token bytes](#authorizationmcp-session-principal-tuple) | source-trace | testing, authorization |
| [gRPC validation, timeout and real-IP middleware guarantee less than their names suggest](#authorizationmiddleware-semantics-validation-timeout-ip) | source-trace | testing, authorization |
| [A request without the cookiejar key silently uses the shared default session](#authorizationmissing-jar-key-uses-shared-jar) | source-trace | testing, evidence |
| [Batch checks can each resolve 'latest' model; docs claim otherwise](#authorizationmodel-version-not-pinned) | source-trace | testing, evidence, retest |
| [NBRET offline checks pick the first saved response by method+URL+body, ignoring principal](#authorizationnbret-offline-match-ignores-principal) | source-trace | authorization, evidence, retest |
| [Nuclei credentials match by host only; overlapping strategies apply in random order](#authorizationnuclei-auth-host-scoped-overlap) | source-trace | authorization, testing |
| [Nuclei shares default cookie jars across templates per host and across workflow clones](#authorizationnuclei-shared-cookie-jars) | source-trace | authorization, testing |
| [OpenFGA allows on a true witness even when sibling branches errored](#authorizationopenfga-or-witness-not-exhaustive) | source-trace | testing, triage, authorization |
| [OpenFGA routes model/changelog reads to secondaries; MySQL test 'replica' does not replicate](#authorizationopenfga-replica-routing-and-fake-replica) | source-trace | testing, authorization, evidence |
| [OpenFGA store deletion only sets deleted_at; tuples/models remain in store-keyed tables](#authorizationopenfga-store-soft-delete) | source-trace | testing, remediation, evidence |
| [One API definition can be served with or without its auth interceptor, depending on registration](#authorizationregistration-mode-changes-enforcement) | source-trace | scoping, testing, retest |
| [Caller-supplied request context overrides subject and resource properties in AuthZEN](#authorizationrequest-context-overrides-properties) | source-trace | testing, scoping |
| [Stored policy assertions are test specifications, not executed results](#authorizationstored-assertions-not-executed) | source-trace | testing, evidence, retest |
| [CEL distinguishes false, absent, unknown and error; collapsing them misreports policy](#authorizationunknown-error-not-allow-deny) | source-trace | testing, authorization, evidence |
| [Defender: the token that can isolate may lack the grant needed to read action status](#authorizationdefender-isolate-vs-status-permissions) | public-doc | authorization, operations |
| [Offline token validation accepts revoked tokens until expiry; shared SA is one principal](#authorizationk8s-oauth-revocation-freshness) | public-doc | authorization, operations |
| [Takumi: approved enterprise orgs can test any target without per-target ownership proof](#authorizationtakumi-org-approval-replaces-target-ownership) | public-doc | authorization, scoping |
| [IP address, browser context, account, worker and operator are separate identities](#authorizationaddress-and-identity-separation) | synthesis | triage, reporting, remediation |

### authorizationdeceptive-403-status-only-oracle-fails

**`authorization.deceptive-403-status-only-oracle-fails`: Status-only 403 check missed a 403 that still returned another tenant's invoice (3/3)** (component-lab)

Loopback lab (2026-10-17, Node v24.21.0) with vulnerable, fixed and deceptive-denial variants, 3 repeats each. The strong check (403 AND absence of the invoice object) failed both leaking variants 3/3 and passed the fixed variant 3/3: zero false negatives over six leaking runs and zero false positives over three repaired runs; own-tenant positive controls passed 9/9. The status-only 403 check passed the deceptive variant 3/3 (missing the disclosure) and an availability-only check passed the vulnerable response.

**Do:** Authorization assertions must check returned content, not status codes, and must include a positive control so a deny-everything repair cannot pass.

**Limits:** Hand-authored known-answer fixtures, repeated (not nine independent apps); no TLS/IdP, sessions, races, multi-step transactions, cloud, scanner or model; not a discovery measurement or tool ranking.

**Sources:** [security-landscape/lab-results.md:19](../../security-landscape/lab-results.md#L19), [security-landscape/lab-results.md:21](../../security-landscape/lab-results.md#L21)

**Receipts:** `security-landscape/lab-receipt.json`, `security-landscape/lab-followup-receipt.json`

**Contrary or narrowing evidence:**
- [security-landscape/lab-results.md:42](../../security-landscape/lab-results.md#L42): Narrow fixture; no generalization.

### authorizationdeletion-claim-needs-post-read

**`authorization.deletion-claim-needs-post-read`: Deleting a store removed only its descriptor; data stayed readable in the in-memory backend** (component-lab)

OpenFGA's in-memory DeleteStore removes only the descriptor map entry and does not erase models, tuples or assertions. A 404 after delete is a finite test, not proof of physical erasure, absence from secondary stores, or tenant isolation.

**Do:** A deletion or tenant-offboarding claim needs pre-existence evidence, deletion identity, a same-object post-read, expected denial for unauthorized identities, and stated retention exclusions.

**Limits:** In-memory backend; persistent datastores were not tested.

**Sources:** [assessment-evidence/deep-openfga.md:97](../../assessment-evidence/deep-openfga.md#L97), [assessment-evidence/authzen-evidence-boundaries.md:780](../../assessment-evidence/authzen-evidence-boundaries.md#L780)

### authorizationnuclei-dynamic-auth-failure-silent

**`authorization.nuclei-dynamic-auth-failure-silent`: Nuclei dynamic login failure is non-fatal: requests may proceed without credentials** (component-lab)

authx dynamic GetStrategies returns nil strategies when the login fetch fails and ApplyAuth reports no error, so the request can continue unauthenticated; tests confirm nil strategies on failed fetch as designed. Success is memoized with no expiry or refresh in that file.

**Do:** For authenticated scans, verify per-request that the intended identity was applied (e.g., a canary endpoint) and report missing-auth coverage; never read 'no findings' as authenticated coverage.

**Limits:** Component tests with stub callbacks; full-engine unauthenticated send not runtime-confirmed.

**Sources:** [security-landscape/deep-review/nuclei-auth.md:27](../../security-landscape/deep-review/nuclei-auth.md#L27), [security-landscape/deep-review/nuclei-auth.md:39](../../security-landscape/deep-review/nuclei-auth.md#L39)

**Receipts:** `security-landscape/deep-review/nuclei-auth-lab-receipt.json`

### authorizationnuclei-project-cache-preauth-key

**`authorization.nuclei-project-cache-preauth-key`: Nuclei project cache keys before auth injection; tenant-A reply served for B's bytes** (component-lab)

In request.go the project-cache key is built before the auth provider injects credentials, and projectfile hashes cleaned request bytes with no principal, environment or TTL argument. A component test stored a synthetic tenant-A response and replayed it for identical pre-auth bytes; changed Authorization bytes and a changed path missed.

**Do:** Do not enable Nuclei project-file caching across principals or tenants; bind cached evidence to an explicit identity and re-run authorization checks fresh.

**Limits:** Component test of the cache only; full engine auth-provider-to-cache confusion is still a source prediction.

**Sources:** [security-landscape/deep-review/nuclei-http-path.md:37](../../security-landscape/deep-review/nuclei-http-path.md#L37), [security-landscape/deep-review/nuclei-http-path.md:75](../../security-landscape/deep-review/nuclei-http-path.md#L75)

**Receipts:** `security-landscape/deep-review/nuclei-project-cache-lab-receipt.json`

**Contrary or narrowing evidence:**
- [security-landscape/deep-review/nuclei-input-identity.md:295](../../security-landscape/deep-review/nuclei-input-identity.md#L295): Key includes scheme+host, so cross-origin replay is limited; principal still absent.

### authorizationopenfga-cel-cost-not-memory

**`authorization.openfga-cel-cost-not-memory`: CEL cost limits are modeled post-operation units, not memory or wall-clock bounds** (component-lab)

In cel-go v0.31.0 the cost limit tracks modeled operation expense (documented as indicative of CPU, not memory), charges after a function result exists, and panics only when cost strictly exceeds the limit; cancellation is checked only in fold loops, not inside bound callbacks. A three-element comprehension was rejected at limit 1, succeeded at 1000, and an already-cancelled context was rejected.

**Do:** Do not present CEL cost limits as resource or DoS guarantees in reports; record units, options and version with any cost evidence.

**Limits:** Bounded functional component test; no stress testing; actual OpenFGA deadlines and frequencies need caller tracing.

**Sources:** [assessment-evidence/continuation-exhaustion.md:177](../../assessment-evidence/continuation-exhaustion.md#L177), [assessment-evidence/continuation-exhaustion.md:180](../../assessment-evidence/continuation-exhaustion.md#L180), [assessment-evidence/continuation-exhaustion.md:194](../../assessment-evidence/continuation-exhaustion.md#L194)

### authorizationopenfga-changefeed-terminal-error

**`authorization.openfga-changefeed-terminal-error`: OpenFGA ReadChanges skips terminal rows.Err; a stream error can become an empty success** (component-lab)

At OpenFGA fb8e7df, PostgreSQL, SQLite and MySQL ReadChanges scan rows but do not check rows.Err after the loop; zero rows map to ErrNotFound and the command returns an empty successful response with the same token, while a nonempty prefix returns with nil error. An inert database/sql driver through the unchanged SQLite adapter confirmed all three predicted subcases. Model/store listing loops in the same adapters do check terminal errors.

**Do:** In authorization audits, an empty change feed or stable cursor is not proof that no revocations occurred; require an independent read of current tuples or a commit token when claiming revocation freshness.

**Limits:** Component runtime on SQLite only; no PostgreSQL/MySQL runtime, real interruption, or stale-authorization harm demonstrated.

**Sources:** [assessment-evidence/continuation-exhaustion.md:223](../../assessment-evidence/continuation-exhaustion.md#L223), [assessment-evidence/continuation-exhaustion.md:229](../../assessment-evidence/continuation-exhaustion.md#L229), [assessment-evidence/continuation-exhaustion.md:259](../../assessment-evidence/continuation-exhaustion.md#L259), [assessment-evidence/continuation-exhaustion.md:247](../../assessment-evidence/continuation-exhaustion.md#L247)

**Receipts:** `assessment-evidence/deep-openfga-receipt-1792272946118.json`

**Contrary or narrowing evidence:**
- [assessment-evidence/continuation-exhaustion.md:231](../../assessment-evidence/continuation-exhaustion.md#L231): The cache controller reacts conservatively, so stale authorization is not established.
- [assessment-evidence/continuation-exhaustion.md:233](../../assessment-evidence/continuation-exhaustion.md#L233): undefined

### authorizationopenfga-invalid-model-rejected

**`authorization.openfga-invalid-model-rejected`: OpenFGA rejects invalid CEL models before persistence; failed-compile state is not public** (component-lab)

Ordinary WriteAuthorizationModel validates (NewAndValidate) before persistence, and the v1 resolver caches only after validation. A runtime test through the unchanged command, in-memory backend and resolver passed predefined criteria: invalid CEL returns error and nil response, no model is persisted, valid CEL writes, and two explicit-model resolver calls return the same validated pointer. The earlier failed-Compile/reused-object component receipt remains valid only as an internal component observation.

**Do:** Do not report the failed-compile object state as an OpenFGA public API vulnerability; client findings must trace a permitted normal API path.

**Limits:** Command contract with in-memory backend; not HTTP authentication, a deployed server or external database adapters.

**Sources:** [assessment-evidence/continuation-exhaustion.md:70](../../assessment-evidence/continuation-exhaustion.md#L70), [assessment-evidence/continuation-exhaustion.md:104](../../assessment-evidence/continuation-exhaustion.md#L104)

### authorizationopenfga-uint64-saturation

**`authorization.openfga-uint64-saturation`: OpenFGA condition context saturates uint64 max to int64 max; equality evaluates false** (component-lab)

OpenFGA's condition numeric converter discards the big.Float Int64 accuracy result. Through the real CastContextToTypedParameters caller, a protobuf StringValue 18446744073709551615 became 9223372036854775807 and a condition comparing it to the maximum uint literal evaluated false; ordinary string 10 stayed 10. Fractional and negative unsigned strings are rejected.

**Do:** Report this as a value-conversion boundary needing a domain contract, not an authorization bypass; test large-integer condition parameters explicitly when auditing ABAC conditions.

**Limits:** Local component fixture; public JSON API representability and any customer policy consequence unestablished.

**Sources:** [assessment-evidence/continuation-exhaustion.md:196](../../assessment-evidence/continuation-exhaustion.md#L196), [assessment-evidence/continuation-exhaustion.md:151](../../assessment-evidence/continuation-exhaustion.md#L151)

### authorizationrevocation-needs-current-authority-check

**`authorization.revocation-needs-current-authority-check`: Revoked worker token still passes signature/expiry; only authority check stops it** (component-lab)

In a custom loopback signed-request lab (22 comparisons, 3 accepted effects, all rejections preserved the effect counter), signature and expiry validation still succeeded after the worker's authority was revoked; only the separate current-authority check rejected it (403). Replay returned 409; a bad MAC did not consume the nonce; changing an address label did not reset replay identity.

**Do:** Kill switches for workers must revoke at the resource (or issuer with online validation), not just stop issuing tokens.

**Limits:** Custom protocol, single-process nonce store; not OAuth/Kubernetes/RFC 9421 conformance, not distributed replay protection.

**Sources:** [bots-swarms/continuation.md:2680](../../bots-swarms/continuation.md#L2680), [bots-swarms/continuation.md:2678](../../bots-swarms/continuation.md#L2678), [bots-swarms/identity-lab-plan.md:31](../../bots-swarms/identity-lab-plan.md#L31)

**Receipts:** `bots-swarms/identity-receipt-1792269161509.json`, `bots-swarms/identity-receipt-1792269150514.json`, `bots-swarms/identity-receipt-1792269139685.json`

### authorizationrevocation-retest-consistency

**`authorization.revocation-retest-consistency`: A cached 'allow' survived permission deletion until higher consistency was requested** (component-lab)

In an in-memory lab on OpenFGA's production code path, a synthetic tuple write produced allow; after deleting the tuple a normal cached check still returned allow, and only HIGHER_CONSISTENCY returned deny. The cache controller is explicitly eventually consistent; this is a design trade-off, not by itself a defect.

**Do:** When retesting a client's revocation fix, record when the relationship changed, the model and consistency mode used, and whether the application enforced the result; a retest too soon after the change can produce a false 'still vulnerable' or a false 'fixed'.

**Limits:** In-memory backend with a synchronized cache; TTL and asynchronous controller timing were not modelled.

**Sources:** [assessment-evidence/deep-openfga.md:102](../../assessment-evidence/deep-openfga.md#L102), [assessment-evidence/deep-openfga.md:39](../../assessment-evidence/deep-openfga.md#L39)

### authorizationstdlib-cookiejar-semantics

**`authorization.stdlib-cookiejar-semantics`: Python cookiejar: reused jar overwrites sessions, cookies cross ports** (component-lab)

An 18-comparison run against the installed CPython 3.14.7 http.cookiejar with synthetic requests showed: two jars keep sessions apart but reusing one jar overwrites the first account's same domain/path/name cookie; a cookie without Domain reaches child subdomains under the default policy; ordinary cookies cross ports; SameSite is stored as metadata only; an explicit Cookie header is preserved. Storage is keyed domain/path/name with no account field.

**Do:** Use one jar per test identity and do not assume browser cookie semantics in HTTP-client tooling.

**Limits:** stdlib only; Scrapy middleware and browsers behave differently in places. The first run failed on an unsuitable origin premise and was corrected.

**Sources:** [bots-swarms/cookie-policy-review.md:10](../../bots-swarms/cookie-policy-review.md#L10), [bots-swarms/cookie-policy-review.md:13](../../bots-swarms/cookie-policy-review.md#L13), [bots-swarms/cookie-policy-review.md:19](../../bots-swarms/cookie-policy-review.md#L19)

**Receipts:** `bots-swarms/cookie-policy-receipt-1792269733791491700.json`, `bots-swarms/cookie-policy-receipt-1792269720526586500.json`

### authorizationzap-history-cache-auth-blind

**`authorization.zap-history-cache-auth-blind`: ZAP history cache picks a saved row regardless of auth/cookie headers (legacy caller)** (component-lab)

Installed ZAP 2.17.0 ParosTableHistory.getHistoryCache on in-memory HSQLDB returned principal A's saved row for a request carrying principal B's Authorization/Cookie headers; different path and body missed. HttpMessage.equals ignores headers and principal. The only cache caller found is the deprecated core ProxyThread; the active network addon's no-cache handler only removes conditional headers.

**Do:** Do not use ZAP history lookups as principal-bound evidence; the current default proxy path is not shown to replay cached responses, so do not claim a live cross-principal proxy issue.

**Limits:** Component experiment; optional addons not exhaustively searched.

**Sources:** [security-landscape/deep-review/zap-history-lab.md:13](../../security-landscape/deep-review/zap-history-lab.md#L13)

**Receipts:** `security-landscape/deep-review/zap-history-lab-receipt.json`

**Contrary or narrowing evidence:**
- [security-landscape/deep-review/zap-history.md:39](../../security-landscape/deep-review/zap-history.md#L39): Only caller is deprecated ProxyThread.
- [security-landscape/deep-review/zap-network.md:91](../../security-landscape/deep-review/zap-network.md#L91): Active addon handler does not replay cached bytes.

### authorizationcaller-vs-subject-binding

**`authorization.caller-vs-subject-binding`: The decision engine trusts the user the app names; test whether user A can make the app ask as B** (source-trace)

OpenFGA authenticates the calling application and then evaluates whatever relationship user the request names. Evaluating a supplied user is different from the application establishing that the caller may assert that user. The store-level API authorizer is installed only when both a feature flag and configuration enable it, so authentication success does not imply a store policy ran.

**Do:** For any client app that calls an external decision point, test whether an end user can influence the subject, context or contextual tuples sent to the engine; record both the authenticated caller and the queried subject in each evidence receipt.

**Limits:** Source trace of OpenFGA at one pin; the binding behavior of any specific client application is untested.

**Sources:** [assessment-evidence/openfga-request-contract.md:215](../../assessment-evidence/openfga-request-contract.md#L215), [assessment-evidence/openfga-request-contract.md:211](../../assessment-evidence/openfga-request-contract.md#L211)

### authorizationcheck-reachability-before-reporting-library-weakness

**`authorization.check-reachability-before-reporting-library-weakness`: Library weaknesses found in dependencies were not reachable in OpenFGA** (source-trace)

Permissive JWT v5.3.1 request extractors and the 'none' algorithm registration are not used by OpenFGA. Its actual authenticator uses gRPC AuthFromMD and an RS256 allowlist with issued-at, expiration and audience checks. go-grpc-middleware validator, ratelimit and realip packages are not wired in OpenFGA. The jwt CLI parse has no WithValidMethods, so its algorithm flag is not an allowlist.

**Do:** Before reporting a dependency weakness to a client, trace the actual caller and configuration. Report helper permissiveness only with its reachability status.

**Limits:** Source search at one OpenFGA pin; no requests sent.

**Sources:** [assessment-evidence/jwt-request-boundaries.md:13](../../assessment-evidence/jwt-request-boundaries.md#L13), [assessment-evidence/jwt-request-boundaries.md:41](../../assessment-evidence/jwt-request-boundaries.md#L41), [assessment-evidence/grpc-validation-boundaries.md:3](../../assessment-evidence/grpc-validation-boundaries.md#L3), [assessment-evidence/grpc-validation-boundaries.md:31](../../assessment-evidence/grpc-validation-boundaries.md#L31)

### authorizationcrawler-cache-dedup-ignore-account

**`authorization.crawler-cache-dedup-ignore-account`: Separate cookie jars do not separate Scrapy cache or dedup: keys omit Cookie/Authorization** (source-trace)

Scrapy's default request fingerprint uses method, canonical URL and body plus handler metadata, excluding Cookie, Authorization and cookiejar; HTTP cache scope is spider/domain, not account. So two synthetic accounts making identical requests in one spider can be served the same cached response, and the duplicate filter treats them as one. Media-pipeline fingerprint coalescing shares results across sessions too.

**Do:** In multi-account authorization testing, disable the cache or namespace cache/dedup keys by account, or evidence for user B may actually be user A's response.

**Limits:** Source-derived collision path; no synthetic two-account runtime test and no real disclosure.

**Sources:** [bots-swarms/continuation.md:1007](../../bots-swarms/continuation.md#L1007), [bots-swarms/continuation.md:2762](../../bots-swarms/continuation.md#L2762), [bots-swarms/continuation.md:2840](../../bots-swarms/continuation.md#L2840), [bots-swarms/continuation.md:2041](../../bots-swarms/continuation.md#L2041)

### authorizationenumeration-not-complete

**`authorization.enumeration-not-complete`: List-objects and list-users results can be silently truncated by caps or deadlines** (source-trace)

OpenFGA ListObjects returns up to a result cap or deadline, deliberately suppresses cancellation and deadline errors, and its public response has no truncated flag. ListUsers stops at maxResults and suppresses deadline errors in the same way. A small returned set or a normal transport end is not evidence of completeness.

**Do:** Phrase enumeration findings as 'under model M, context C, consistency K and cap/deadline L these objects were returned'; never conclude an unreturned object is unauthorized without an independent known-finite check.

**Limits:** Source trace; specific deployment caps and deadlines vary.

**Sources:** [assessment-evidence/openfga-request-contract.md:283](../../assessment-evidence/openfga-request-contract.md#L283), [assessment-evidence/openfga-request-contract.md:285](../../assessment-evidence/openfga-request-contract.md#L285), [assessment-evidence/openfga-request-contract.md:287](../../assessment-evidence/openfga-request-contract.md#L287)

### authorizationfalcon-sdk-ambient-credentials-and-header-precedence

**`authorization.falcon-sdk-ambient-credentials-and-header-precedence`: FalconPy uses ambient env credentials; extra headers override auth; token_valid is local** (source-trace)

FalconPy's FalconInterface falls back through explicit credentials, legacy token, context token, then environment credentials (FALCON_CLIENT_ID/SECRET by default), so a credential-free constructor can acquire ambient authority. token_valid only compares elapsed time to expiry minus a 120-1,200 s renewal window and does not check revocation, scope or tenant. ext_headers are merged after auth_headers, so an equal literal Authorization key takes the extended value despite a comment saying otherwise. Member CID scopes an MSSP token to a child tenant.

**Do:** Integrations we write must pin their identity source and tenant (member CID) explicitly, treat header configuration as trusted, and confirm authority server-side rather than from local token freshness.

**Limits:** Source reading at one pin; nothing was run against real credentials.

**Sources:** [cybersecurity-firms/falcon-auth-source.md:7](../../cybersecurity-firms/falcon-auth-source.md#L7), [cybersecurity-firms/falcon-auth-source.md:17](../../cybersecurity-firms/falcon-auth-source.md#L17), [cybersecurity-firms/falcon-auth-source.md:43](../../cybersecurity-firms/falcon-auth-source.md#L43)

### authorizationfalse-is-not-deny

**`authorization.false-is-not-deny`: A 'false' decision can be an error, an omission or a race, not a policy denial** (source-trace)

AuthZEN batch evaluation turns missing or errored items into decision=false with error context, and short-circuit mode returns only the attempted prefix. ActionSearch silently drops actions whose evaluation errored. In OpenFGA v2, intersection returns on the first false or error, so with concurrent branches arrival order can change the outcome.

**Do:** In authorization testing, record error context and engine path with every decision and never count an error or omission as an enforced denial (or as a passing negative test).

**Limits:** Source trace and upstream tests at one OpenFGA pin.

**Sources:** [assessment-evidence/authzen-evidence-boundaries.md:19](../../assessment-evidence/authzen-evidence-boundaries.md#L19), [assessment-evidence/deep-openfga.md:66](../../assessment-evidence/deep-openfga.md#L66)

### authorizationfield-mask-not-field-authz

**`authorization.field-mask-not-field-authz`: grpc-gateway field masks address fields; they are not field-level authorization** (source-trace)

The gateway derives an update mask from the request body by following JSON keys without a domain permission schema, and query parameters are filled afterwards, so a query update_mask can replace the derived mask. Mask derivation only computes which paths are addressed.

**Do:** For APIs built on grpc-gateway, include mass-assignment and field-authorization tests that supply unexpected fields and query masks.

**Limits:** Source trace; impact depends on the server's update handler.

**Sources:** [assessment-evidence/authzen-evidence-boundaries.md:1028](../../assessment-evidence/authzen-evidence-boundaries.md#L1028)

### authorizationgo-express-cache-key-vs-minting-identity

**`authorization.go-express-cache-key-vs-minting-identity`: S3 Express session cache can be keyed by override credentials B but minted with A** (source-trace)

With static default-client credentials A and per-operation override B, the default Express provider keys its session cache with B while the nested CreateSession call resolves A from the retained client options. Cache key includes an HMAC of access ID/secret plus bucket but omits session token, endpoint and region. Identity retrieval errors stop rather than falling back to anonymous.

**Do:** Multi-identity assessments using S3 Express must not assume per-operation credential overrides isolate sessions; bind evidence to the identity that minted the session.

**Limits:** Conditional source mismatch; not a demonstrated permission bypass or customer exposure; custom providers/middleware alter it.

**Sources:** [toolchain/go-material-review.md:563](../../toolchain/go-material-review.md#L563), [toolchain/go-material-review.md:567](../../toolchain/go-material-review.md#L567), [toolchain/go-material-review.md:561](../../toolchain/go-material-review.md#L561)

### authorizationgo-no-anonymous-fallback-on-credential-failure

**`authorization.go-no-anonymous-fallback-on-credential-failure`: S3 auth selection does not downgrade to anonymous after a credential failure** (source-trace)

Auth resolution selects the first supported option with a nonnil identity resolver; GetIdentity errors return directly instead of falling through to the appended anonymous option. Anonymous is selected only if no earlier resolver is configured or a trusted preference orders it first, and selection never proves service permission.

**Do:** Do not report "SDK silently sends unsigned requests on bad credentials" without a custom resolver/preference path.

**Limits:** Source trace of S3 v1.102.2 auth.go.

**Sources:** [toolchain/go-material-review.md:1007](../../toolchain/go-material-review.md#L1007)

### authorizationgo-redirect-session-token-restoration

**`authorization.go-redirect-session-token-restoration`: AWS Go SDK redirects: A→B→B chain can re-send session token; no hop limit** (source-trace)

The SDK client follows 307/308 via a custom CheckRedirect that replaces Go's ten-hop default and strips X-Amz-Security-Token only when the immediately previous host differs. Go copies headers from the original request on every hop and its sensitive list excludes both AWS token headers, so on A→B→B the token is re-copied on the second B hop; X-Amz-S3session-Token is never stripped. Default overall client timeout is zero.

**Do:** When a Go-SDK-based tool (e.g. BloodHound S3 upload) talks to endpoints that could redirect, treat session-token exposure as an open risk to test, not a settled safe behavior.

**Limits:** Precise source hypothesis; no runtime receipt, redirect control or service acceptance established.

**Sources:** [toolchain/go-material-review.md:999](../../toolchain/go-material-review.md#L999), [toolchain/go-material-review.md:997](../../toolchain/go-material-review.md#L997), [toolchain/go-material-review.md:915](../../toolchain/go-material-review.md#L915)

### authorizationhttp-verb-not-safety

**`authorization.http-verb-not-safety`: HTTP verbs and operation names do not tell you whether a request changes state** (source-trace)

In the reviewed grpc-gateway samples, a GET operation reaches code that replaces stored state, operation names such as Delete or Patch do not prove an effect, and a canned 401 fixture is not credential verification. Classifying requests as safe solely by HTTP verb misdescribes the example.

**Do:** Base active-testing safety rules on operation semantics, the approved environment and effect limits, not on 'only send GETs'; do not report a fixture 401 as working authentication.

**Limits:** Source-established sample flow, not an observed deployed mutation.

**Sources:** [assessment-evidence/authzen-evidence-boundaries.md:902](../../assessment-evidence/authzen-evidence-boundaries.md#L902), [assessment-evidence/authzen-evidence-boundaries.md:986](../../assessment-evidence/authzen-evidence-boundaries.md#L986)

### authorizationjwt-freshness-limits

**`authorization.jwt-freshness-limits`: JWT validation checks iat only if present, with no maximum age or revocation** (source-trace)

In OpenFGA's OIDC path, expiration and audience are required, but issued-at is checked only when present and no maximum token age or revocation check is imposed. Key lookup success is not token acceptance.

**Do:** In authentication testing, test long-lived and revoked tokens explicitly, and keep key-refresh, JWKS body and active key set as separate evidence when reporting key rotation.

**Limits:** Source trace of one library configuration.

**Sources:** [assessment-evidence/openfga-request-contract.md:227](../../assessment-evidence/openfga-request-contract.md#L227), [assessment-evidence/openfga-request-contract.md:233](../../assessment-evidence/openfga-request-contract.md#L233)

### authorizationmcp-oauth-provider-obligations

**`authorization.mcp-oauth-provider-obligations`: MCP OAuth handlers leave single-use codes, refresh rotation and revocation to providers** (source-trace)

In MCP 2.3.0 the token handler checks client, redirect, expiry and PKCE S256 but single-use code consumption, atomic redemption, refresh rotation and revocation propagation are provider obligations not implemented in handler files. Revoke returns HTTP 200 even for unknown tokens. MCPServer custom routes are documented as not requiring authorization, and audience validation depends on validate_token_resource configuration.

**Do:** When assessing a client's MCP server, test the concrete provider for code replay, refresh rotation and revocation effect, enumerate custom routes separately, and do not accept a 200 from revoke as proof of revocation.

**Limits:** Framework source only; no real provider, token or revocation was tested and no bypass is inferred from delegation alone.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:465](../../assessment-evidence/sdk-boundaries-continuation.md#L465), [assessment-evidence/sdk-boundaries-continuation.md:471](../../assessment-evidence/sdk-boundaries-continuation.md#L471), [assessment-evidence/sdk-boundaries-continuation.md:333](../../assessment-evidence/sdk-boundaries-continuation.md#L333)

### authorizationmcp-session-principal-tuple

**`authorization.mcp-session-principal-tuple`: MCP session ownership compares (client_id, issuer, subject), not token bytes** (source-trace)

MCP 2.3.0 principal_components returns (client_id, issuer, subject), with missing issuer/subject kept as None; session ownership and sealed request-state binding use this tuple. When the verifier supplies no subject, distinct users of one client are not distinguished. Sealed request state binds method, target, argument digest, audience, principal and TTL (default 600s) but has no consumed-token registry, so it is not one-use; default ephemeral keys are process-local.

**Do:** When assessing MCP deployments, check what the token verifier populates (especially subject) and test cross-user session reuse and multi-worker state; do not report sealed state as replay-proof.

**Limits:** Source-only; no token, identity mismatch or replay experiment was run.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:190](../../assessment-evidence/sdk-boundaries-continuation.md#L190), [assessment-evidence/sdk-boundaries-continuation.md:341](../../assessment-evidence/sdk-boundaries-continuation.md#L341)

### authorizationmiddleware-semantics-validation-timeout-ip

**`authorization.middleware-semantics-validation-timeout-ip`: gRPC validation, timeout and real-IP middleware guarantee less than their names suggest** (source-trace)

In go-grpc-middleware v2.3.4:
- the stream validator invokes the handler and validates only after each RecvMsg succeeds;
- ignored message types bypass validation;
- the timeout interceptor sets a client deadline but does not stop server-side work;
- real-IP derivation is a configured proxy trust claim, and malformed X-Forwarded-For can stop later headers being tried;
- selector exclusions forward requests directly.

**Do:** When auditing a gRPC service, inventory actual interceptor chain order, matcher exclusions and proxy configuration. Do not equate a derived IP with an identity or a client timeout with stopped work.

**Limits:** Source only; adjacent package not wired in OpenFGA.

**Sources:** [assessment-evidence/grpc-validation-boundaries.md:5](../../assessment-evidence/grpc-validation-boundaries.md#L5), [assessment-evidence/grpc-validation-boundaries.md:27](../../assessment-evidence/grpc-validation-boundaries.md#L27), [assessment-evidence/grpc-validation-boundaries.md:39](../../assessment-evidence/grpc-validation-boundaries.md#L39)

### authorizationmissing-jar-key-uses-shared-jar

**`authorization.missing-jar-key-uses-shared-jar`: A request without the cookiejar key silently uses the shared default session** (source-trace)

Scrapy selects the cookie jar from request.meta["cookiejar"]; a missing key selects the shared None jar. Retry/redirect copies preserve the key, but any new request that omits it falls back. Disabling cookie middleware does not scrub manually supplied Cookie headers.

**Do:** Bind the account/session to every generated request and add negative tests (missing key, wrong tenant, stale session) before trusting per-account results.

**Limits:** Source and selected tests; no crawler runtime.

**Sources:** [bots-swarms/source-notes.md:17](../../bots-swarms/source-notes.md#L17), [bots-swarms/findings.md:15](../../bots-swarms/findings.md#L15), [bots-swarms/continuation.md:1015](../../bots-swarms/continuation.md#L1015)

### authorizationmodel-version-not-pinned

**`authorization.model-version-not-pinned`: Batch checks can each resolve 'latest' model; docs claim otherwise** (source-trace)

OpenFGA's AuthZEN documentation says the model ID is resolved once for batch evaluations. The code passes a possibly empty model header into each sequential Check, which resolves 'latest' separately, so there is no single-snapshot guarantee unless an explicit model header or BatchCheck is used.

**Do:** Pin and record the policy model version in every authorization test and retest; a model change mid-run can make results incomparable.

**Limits:** Source trace; no run observed a model change mid-batch.

**Sources:** [assessment-evidence/authzen-evidence-boundaries.md:50](../../assessment-evidence/authzen-evidence-boundaries.md#L50)

### authorizationnbret-offline-match-ignores-principal

**`authorization.nbret-offline-match-ignores-principal`: NBRET offline checks pick the first saved response by method+URL+body, ignoring principal** (source-trace)

checks.mjs selects the first offline observation matching method, sanitized URL and cleaned-body digest, ignoring request headers, principal, timestamp, origins and uniqueness; redaction can also collapse distinct secret values. Baseline regression compares only test.key and snapshot fields, not origin/principal/environment, and contract IDs omit principal.

**Do:** Bind saved evidence to a non-secret principal/tenant/environment label and reject ambiguous matches before using offline evidence for authorization claims; obtain fresh retest evidence.

**Limits:** Source trace of the prototype; the runtime confirmation (E01) lives in lab-results.md; not a live-client exploit.

**Sources:** [security-landscape/deep-review/nbret-checks-identity.md:21](../../security-landscape/deep-review/nbret-checks-identity.md#L21), [security-landscape/deep-review/nbret-checks-identity.md:19](../../security-landscape/deep-review/nbret-checks-identity.md#L19)

**Contrary or narrowing evidence:**
- [security-landscape/lab-results.md:31](../../security-landscape/lab-results.md#L31): Runtime confirmation of this mechanism (other slice).

### authorizationnuclei-auth-host-scoped-overlap

**`authorization.nuclei-auth-host-scoped-overlap`: Nuclei credentials match by host only; overlapping strategies apply in random order** (source-trace)

The secrets-file provider matches by Host (default ports stripped irrespective of scheme), not scheme, path or principal, and appends all matching regex strategies via map iteration, so overlapping strategies can overwrite the same header in nondeterministic order. Providers return the first match, not a union.

**Do:** Write one unambiguous credential per host per scan and run separate scans per principal; do not rely on path-scoped credentials.

**Limits:** Source reading.

**Sources:** [security-landscape/deep-review/nuclei-auth.md:15](../../security-landscape/deep-review/nuclei-auth.md#L15), [security-landscape/deep-review/nuclei-auth.md:15](../../security-landscape/deep-review/nuclei-auth.md#L15)

### authorizationnuclei-shared-cookie-jars

**`authorization.nuclei-shared-cookie-jars`: Nuclei shares default cookie jars across templates per host and across workflow clones** (source-trace)

The HTTP client pool creates a default jar per cached host/config client, so same-host sessions share cookies across templates within an execution; contextargs Clone shares the CookieJar pointer, so workflow branches share session state. Only an explicit input jar isolates.

**Do:** Isolate principals by separate executions or explicit jars; cookies learned by one template can change the identity seen by another.

**Limits:** Source and cookie-test reading; no concurrent multi-principal run.

**Sources:** [security-landscape/deep-review/nuclei-http-path.md:55](../../security-landscape/deep-review/nuclei-http-path.md#L55), [security-landscape/deep-review/nuclei-input-identity.md:119](../../security-landscape/deep-review/nuclei-input-identity.md#L119)

### authorizationopenfga-or-witness-not-exhaustive

**`authorization.openfga-or-witness-not-exhaustive`: OpenFGA allows on a true witness even when sibling branches errored** (source-trace)

OpenFGA's default check strategy returns a true existential witness with nil error even if sibling userset/TTU resolutions errored; absent a true witness, mixed false/error returns an error. This is intended OR semantics, not fail-open. An allowed decision proves a witness, not exhaustive or error-free traversal.

**Do:** When auditing denials, preserve errors separately from false; an 'allowed' result does not mean all paths were evaluated.

**Limits:** Authored tests with static iterators and mocked child resolvers; no database partial-error run.

**Sources:** [assessment-evidence/continuation-exhaustion.md:374](../../assessment-evidence/continuation-exhaustion.md#L374)

### authorizationopenfga-replica-routing-and-fake-replica

**`authorization.openfga-replica-routing-and-fake-replica`: OpenFGA routes model/changelog reads to secondaries; MySQL test 'replica' does not replicate** (source-trace)

OpenFGA PostgreSQL and MySQL adapters send HIGHER_CONSISTENCY relationship reads to the primary but model, assertion and changelog reads always request MINIMIZE_LATENCY. The MySQL test CreateSecondary creates a separate migrated database without binary-log replication, and the PostgreSQL 'synchronized' helper checks only recovery mode and a nonempty received WAL position.

**Do:** Revocation-freshness claims need an end-to-end oracle (write/commit token and observed replay/read), separate claims per data class, and must not rely on upstream test fixtures as replica evidence.

**Limits:** Source reading; no replica lag, delivery or freshness experiment run.

**Sources:** [assessment-evidence/continuation-exhaustion.md:219](../../assessment-evidence/continuation-exhaustion.md#L219), [assessment-evidence/continuation-exhaustion.md:285](../../assessment-evidence/continuation-exhaustion.md#L285)

### authorizationopenfga-store-soft-delete

**`authorization.openfga-store-soft-delete`: OpenFGA store deletion only sets deleted_at; tuples/models remain in store-keyed tables** (source-trace)

PostgreSQL, SQLite and MySQL adapters delete a store by setting deleted_at on the store row; GetStore/ListStores filter it, but tuple, model and assertion read methods query store-keyed tables independently.

**Do:** Client data-deletion claims for OpenFGA-backed systems need data-class-specific verification of every retained copy and garbage collection.

**Limits:** Source only; public access after deletion is not established (API authorization, store-existence checks and caches remain dependencies).

**Sources:** [assessment-evidence/continuation-exhaustion.md:222](../../assessment-evidence/continuation-exhaustion.md#L222)

### authorizationregistration-mode-changes-enforcement

**`authorization.registration-mode-changes-enforcement`: One API definition can be served with or without its auth interceptor, depending on registration** (source-trace)

Direct in-process grpc-gateway registration bypasses gRPC interceptors, while OpenFGA itself uses a real gRPC connection. A passing generated-client test under one mode does not verify auth or parser enforcement under another, and the same proto can produce different numbers of HTTP bindings depending on configuration.

**Do:** Scope and record API coverage per HTTP binding and transport mode, not per RPC name, and retest each exposed binding.

**Limits:** Source trace; no deployed bypass observed.

**Sources:** [assessment-evidence/authzen-evidence-boundaries.md:619](../../assessment-evidence/authzen-evidence-boundaries.md#L619)

### authorizationrequest-context-overrides-properties

**`authorization.request-context-overrides-properties`: Caller-supplied request context overrides subject and resource properties in AuthZEN** (source-trace)

OpenFGA's AuthZEN layer merges subject, resource and action properties with prefixes and then lets request context override conflicts, so a property such as a role can be supplied by the caller rather than an authenticated source.

**Do:** In client apps, test whether users can inject or override policy inputs (roles, attributes, context); document which source is trusted for each policy input.

**Limits:** Source trace of the merge order; exploitability depends on how a client app builds the request.

**Sources:** [assessment-evidence/authzen-evidence-boundaries.md:17](../../assessment-evidence/authzen-evidence-boundaries.md#L17)

### authorizationstored-assertions-not-executed

**`authorization.stored-assertions-not-executed`: Stored policy assertions are test specifications, not executed results** (source-trace)

OpenFGA's WriteAssertions validates and stores assertions but does not execute Check or compare observed results; an assertion carries no result, evidence digest or environment revision.

**Do:** A policy-regression or claim-runner design must execute checks and record observed results, not treat stored assertions as passing tests.

**Limits:** Source trace.

**Sources:** [assessment-evidence/openfga-request-contract.md:271](../../assessment-evidence/openfga-request-contract.md#L271)

### authorizationunknown-error-not-allow-deny

**`authorization.unknown-error-not-allow-deny`: CEL distinguishes false, absent, unknown and error; collapsing them misreports policy** (source-trace)

CEL v0.31.0 keeps false, absent optional, unknown and evaluation error distinct. Unknown ConvertToNative returns the unknown with nil error regardless of requested type. Different list/map Equal implementations treat error/unknown comparisons differently: baseList returns true unless exactly False, while protoMap returns the first non-True outcome. Unknown patterns match by prefix overlap and describe uncertainty, not a grant.

**Do:** When evaluating a client's policy engine, keep errors and unknowns as explicit outcomes. Never let 'could not evaluate' become a clean deny or allow in findings or retests.

**Limits:** Source and test reading; no authorization outcome change demonstrated in OpenFGA.

**Sources:** [assessment-evidence/cel-value-outcomes.md:13](../../assessment-evidence/cel-value-outcomes.md#L13), [assessment-evidence/cel-planning-provenance.md:47](../../assessment-evidence/cel-planning-provenance.md#L47), [assessment-evidence/cel-value-outcomes.md:23](../../assessment-evidence/cel-value-outcomes.md#L23), [assessment-evidence/cel-value-outcomes.md:39](../../assessment-evidence/cel-value-outcomes.md#L39)

**Contrary or narrowing evidence:**
- [assessment-evidence/cel-value-outcomes.md:39](../../assessment-evidence/cel-value-outcomes.md#L39): Ordinary interpreter paths guard top-level inputs.

### authorizationdefender-isolate-vs-status-permissions

**`authorization.defender-isolate-vs-status-permissions`: Defender: the token that can isolate may lack the grant needed to read action status** (public-doc)

Isolation requires Machine.Isolate (application or delegated), plus Active remediation actions and device-group access for delegated users. The get-action manual lists Machine.ReadWrite.All (application) or Machine.ReadWrite plus the View Data role (delegated). A full VPN tunnel can stop an isolated device reaching the Defender cloud; the manual recommends split tunneling. UnManagedDevice is a separate isolation type.

**Do:** When designing response automation or a client mandate, request and test both the action permission and the status-read permission, and include VPN/split-tunnel prerequisites in the containment runbook so release and observation remain possible.

**Limits:** Manual permission tables only; effective tenant permissions and actual VPN behavior were not tested.

**Sources:** [cybersecurity-firms/defender-action-contract.md:13](../../cybersecurity-firms/defender-action-contract.md#L13), [cybersecurity-firms/defender-action-contract.md:15](../../cybersecurity-firms/defender-action-contract.md#L15)

### authorizationk8s-oauth-revocation-freshness

**`authorization.k8s-oauth-revocation-freshness`: Offline token validation accepts revoked tokens until expiry; shared SA is one principal** (public-doc)

Kubernetes docs: ServiceAccounts are namespaced non-human principals and several Pods can share one, so replicas are not distinct principals; offline OIDC validation can keep accepting a token until expiry, whereas TokenReview recognises bound-object deletion. RFC 9700: audience/scope only work if the resource server checks them, and refresh-token rotation lineage means workers sharing a family can trigger revocation of the active token.

**Do:** Give each worker class its own principal, prefer online validation where revocation speed matters, and coordinate refresh among workers.

**Limits:** Specification and project documentation; no cluster or provider tested.

**Sources:** [bots-swarms/continuation.md:2656](../../bots-swarms/continuation.md#L2656), [bots-swarms/continuation.md:2652](../../bots-swarms/continuation.md#L2652), [bots-swarms/continuation.md:2646](../../bots-swarms/continuation.md#L2646)

### authorizationtakumi-org-approval-replaces-target-ownership

**`authorization.takumi-org-approval-replaces-target-ownership`: Takumi: approved enterprise orgs can test any target without per-target ownership proof** (public-doc)

Takumi has two alternative gates for dynamic assessment. Enterprise organization authentication (about 2-3 business days) lets the organization dispatch dynamic assessments without per-target verification, explicitly contemplating consulting for other entities subject to lawful authorization. Otherwise an owner/manager proves control via a DNS TXT record at _takumi-ownership.<domain> or an HTTP-200 token at /.well-known/takumi-ownership; token expiry, revalidation and subdomain scope are not documented.

**Do:** A vendor platform gate is not proof that a client authorized a given target; keep our own signed authorization-to-target binding (hosts, dates, account) and do not treat an org-level vendor approval as per-target consent.

**Limits:** Manual description only; no verification token, DNS record or dispatch was attempted, and the exact host/subdomain semantics are unknown.

**Sources:** [cybersecurity-firms/takumi-authority-boundary.md:5](../../cybersecurity-firms/takumi-authority-boundary.md#L5), [cybersecurity-firms/takumi-authority-boundary.md:5](../../cybersecurity-firms/takumi-authority-boundary.md#L5), [cybersecurity-firms/takumi-authority-boundary.md:7](../../cybersecurity-firms/takumi-authority-boundary.md#L7)

### authorizationaddress-and-identity-separation

**`authorization.address-and-identity-separation`: IP address, browser context, account, worker and operator are separate identities** (synthesis)

The model separates operator, agent, process, job/attempt, account, session, browser context, device and IP: NAT combines clients, address changes do not create accounts, Playwright contexts isolate storage but are not new devices, and an unverified User-Agent is only a claim. Residential relay addresses can belong to victims (911 S5, BADBOX 2.0).

**Do:** Findings and client advice should attribute actions to authenticated principals, not IPs or user agents, and reports should not equate an address with an attacker.

**Limits:** Conceptual synthesis with public sources; no detector evaluated.

**Sources:** [bots-swarms/model.md:58](../../bots-swarms/model.md#L58), [bots-swarms/defense.md:15](../../bots-swarms/defense.md#L15), [bots-swarms/incident-review.md:27](../../bots-swarms/incident-review.md#L27)

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| high | [assessment-evidence/deep-openfga.md:112](../../assessment-evidence/deep-openfga.md#L112) | [assessment-evidence/continuation-exhaustion.md:104](../../assessment-evidence/continuation-exhaustion.md#L104) | Do not report the CEL sync.Once issue as a vendor vulnerability; it is a component-level defect not reachable through ordinary model writes. |
| high | [toolchain/go-material-review.md:569](../../toolchain/go-material-review.md#L569) | [toolchain/go-material-review.md:563](../../toolchain/go-material-review.md#L563) | Believe the conditional A/B mismatch; it is not a demonstrated bypass. |
| high | [security-landscape/deep-review/zap-history-lab.md:13](../../security-landscape/deep-review/zap-history-lab.md#L13) | [security-landscape/deep-review/zap-history.md:39](../../security-landscape/deep-review/zap-history.md#L39) | Report it as a component property, not a live proxy vulnerability. |
| high | [assessment-evidence/continuation-exhaustion.md:104](../../assessment-evidence/continuation-exhaustion.md#L104) | [assessment-evidence/continuation-exhaustion.md:106](../../assessment-evidence/continuation-exhaustion.md#L106) | Cite only receipt 1792271857692 for OpenFGA admission; never 1792271828082. |
| high | [assessment-evidence/synthesis.md:42](../../assessment-evidence/synthesis.md#L42) | [assessment-evidence/continuation-exhaustion.md:104](../../assessment-evidence/continuation-exhaustion.md#L104) | The failed-compile state is an internal component observation only; ordinary model writes reject invalid conditions. |
| high | [assessment-evidence/continuation-exhaustion.md:223](../../assessment-evidence/continuation-exhaustion.md#L223) | [assessment-evidence/continuation-exhaustion.md:231](../../assessment-evidence/continuation-exhaustion.md#L231) | Report terminal-error suppression as an evidence-quality issue, not stale authorization or missed revocation. |
| high | [toolchain/go-material-review.md:1009](../../toolchain/go-material-review.md#L1009) | [toolchain/go-material-review.md:999](../../toolchain/go-material-review.md#L999) | Treat the A→B→B redirect token restoration as an open source-level candidate. |
| high | [toolchain/go-material-review.md:1890](../../toolchain/go-material-review.md#L1890) | [toolchain/go-material-review.md:1895](../../toolchain/go-material-review.md#L1895) | Treat GetObject checksum validation as conditional (200, EOF, supported algorithm, non-multipart). |
| high | [toolchain/go-material-review.md:1927](../../toolchain/go-material-review.md#L1927) | [toolchain/go-material-review.md:1935](../../toolchain/go-material-review.md#L1935) | Checksum retention across retries is intended; do not report it as an integrity bypass. |
| high | [security-landscape/lab-results.md:31](../../security-landscape/lab-results.md#L31) | [security-landscape/lab-receipt.json:153](../../security-landscape/lab-receipt.json#L153) | Legacy checks.mjs offline matching still ignores identity; only src/assessment has identity/session checks, and those labels are operator-declared. |
| high | [toolchain/go-material-review.md:2019](../../toolchain/go-material-review.md#L2019) | [toolchain/go-material-review.md:2023](../../toolchain/go-material-review.md#L2023) | Require an observed End event for completeness. |
| medium | [assessment-evidence/sdk-boundaries-continuation.md:14](../../assessment-evidence/sdk-boundaries-continuation.md#L14) | [assessment-evidence/sdk-boundaries-continuation.md:34](../../assessment-evidence/sdk-boundaries-continuation.md#L34) | Treat Codex early-completion loss as confirmed for the Python router under injected order, unconfirmed natively. |
| medium | [assessment-evidence/sdk-boundaries-continuation.md:84](../../assessment-evidence/sdk-boundaries-continuation.md#L84) | [assessment-evidence/sdk-boundaries-continuation.md:131](../../assessment-evidence/sdk-boundaries-continuation.md#L131) | Transcript mirror is not at-most-once; remote stores need idempotent appends. |
| medium | [assessment-evidence/sdk-boundaries-continuation.md:111](../../assessment-evidence/sdk-boundaries-continuation.md#L111) | [assessment-evidence/sdk-boundaries-continuation.md:117](../../assessment-evidence/sdk-boundaries-continuation.md#L117) | These failures are dependency drift, not model or SDK security failures. |
| medium | [assessment-evidence/sdk-boundaries-continuation.md:198](../../assessment-evidence/sdk-boundaries-continuation.md#L198) | [assessment-evidence/sdk-boundaries-continuation.md:333](../../assessment-evidence/sdk-boundaries-continuation.md#L333) | Host/origin protection depends on construction path and host; verify per deployment. |
| medium | [toolchain/go-material-review.md:753](../../toolchain/go-material-review.md#L753) | [toolchain/go-material-review.md:753](../../toolchain/go-material-review.md#L753) | Do not attribute the Express token redirect hypothesis to CopyObject. |
| medium | [toolchain/go-material-review.md:563](../../toolchain/go-material-review.md#L563) | [toolchain/go-material-review.md:561](../../toolchain/go-material-review.md#L561) | Scope the Express mismatch to static default credentials plus per-operation override. |
| medium | [security-landscape/deep-review/zap-history.md:31](../../security-landscape/deep-review/zap-history.md#L31) | [security-landscape/deep-review/zap-history-lab.md:13](../../security-landscape/deep-review/zap-history-lab.md#L13) | ZAP history cache is auth/cookie-blind but not body-blind. |
| medium | [security-landscape/deep-review/nuclei-http-path.md:37](../../security-landscape/deep-review/nuclei-http-path.md#L37) | [security-landscape/deep-review/nuclei-http-path.md:75](../../security-landscape/deep-review/nuclei-http-path.md#L75) | Cache replay of pre-auth bytes is confirmed at component level only. |
| medium | [assessment-evidence/continuation-exhaustion.md:159](../../assessment-evidence/continuation-exhaustion.md#L159) | [assessment-evidence/continuation-exhaustion.md:159](../../assessment-evidence/continuation-exhaustion.md#L159) | OpenFGA ignores extra context keys when parameters exist; do not rely on the comment. |
| medium | [assessment-evidence/continuation-exhaustion.md:151](../../assessment-evidence/continuation-exhaustion.md#L151) | [assessment-evidence/continuation-exhaustion.md:196](../../assessment-evidence/continuation-exhaustion.md#L196) | Cite the caller-level receipt, but keep the finding as a conversion boundary, not a bypass. |
| medium | [assessment-evidence/continuation-exhaustion.md:374](../../assessment-evidence/continuation-exhaustion.md#L374) | [assessment-evidence/continuation-exhaustion.md:374](../../assessment-evidence/continuation-exhaustion.md#L374) | Do not report OpenFGA as failing open on resolver errors. |
| medium | [assessment-evidence/continuation-exhaustion.md:241](../../assessment-evidence/continuation-exhaustion.md#L241) | [assessment-evidence/continuation-exhaustion.md:259](../../assessment-evidence/continuation-exhaustion.md#L259) | SQLite has component runtime evidence; PostgreSQL/MySQL remain source-only. |
| medium | [assessment-evidence/continuation-exhaustion.md:120](../../assessment-evidence/continuation-exhaustion.md#L120) | [assessment-evidence/continuation-exhaustion.md:129](../../assessment-evidence/continuation-exhaustion.md#L129) | No lost-edge defect exists on the ordinary builder path. |
| medium | [toolchain/go-material-review.md:1021](../../toolchain/go-material-review.md#L1021) | [toolchain/go-material-review.md:999](../../toolchain/go-material-review.md#L999) | Use go-material-review.md:999 as the current state of the redirect question. |
| medium | [toolchain/go-material-review.md:703](../../toolchain/go-material-review.md#L703) | [toolchain/go-material-review.md:693](../../toolchain/go-material-review.md#L693) | No default conflicting-region signing issue. |
| medium | [cybersecurity-firms/takumi-github-scope-boundary.md:7](../../cybersecurity-firms/takumi-github-scope-boundary.md#L7) | [cybersecurity-firms/takumi-github-scope-boundary.md:9](../../cybersecurity-firms/takumi-github-scope-boundary.md#L9) | Do not use Runner permissions to describe what the assessment or Autofix app can access. |
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
| medium | [assessment-evidence/coverage.md:59](../../assessment-evidence/coverage.md#L59) | [assessment-evidence/continuation-exhaustion.md:58](../../assessment-evidence/continuation-exhaustion.md#L58) | Do not treat the earlier bounded pass as complete coverage; even the later cutoff is not exhaustion (continuation-exhaustion.md:801). |
| medium | [bots-swarms/catalog.md:10](../../bots-swarms/catalog.md#L10) | [bots-swarms/findings.md:19](../../bots-swarms/findings.md#L19) | Coraza enforcement path is fully traced at source level (still no Go run). |
| medium | [bots-swarms/source-notes.md:39](../../bots-swarms/source-notes.md#L39) | [bots-swarms/continuation.md:2465](../../bots-swarms/continuation.md#L2465) | Use cont:2449-2465 for drain/child shutdown semantics. |
| medium | [bots-swarms/continuation.md:2987](../../bots-swarms/continuation.md#L2987) | [bots-swarms/continuation.md:3007](../../bots-swarms/continuation.md#L3007) | Do not use getFlow maxChildren as a memory or result cap. |
| medium | [bots-swarms/continuation.md:3094](../../bots-swarms/continuation.md#L3094) | [bots-swarms/continuation.md:3094](../../bots-swarms/continuation.md#L3094) | Do not claim BullMQ shared suites are validated on Postgres from the setup files. |
| medium | [bots-swarms/continuation.md:1573](../../bots-swarms/continuation.md#L1573) | [bots-swarms/continuation.md:1569](../../bots-swarms/continuation.md#L1569) | For TypeScript BullMQ, sync listener throws are caught; malformed JSON and async rejections remain the failure modes. |
| medium | [toolchain/go-material-review.md:1927](../../toolchain/go-material-review.md#L1927) | [toolchain/go-material-review.md:1973](../../toolchain/go-material-review.md#L1973) | Changed retry bodies require external mutation, not the SDK retry loop. |
| medium | [toolchain/go-material-review.md:1983](../../toolchain/go-material-review.md#L1983) | [toolchain/go-material-review.md:2093](../../toolchain/go-material-review.md#L2093) | Check for retry wrappers with max 0 before assuming a bounded retry count. |
| medium | [toolchain/go-material-review.md:1965](../../toolchain/go-material-review.md#L1965) | [toolchain/go-material-review.md:1983](../../toolchain/go-material-review.md#L1983) | Default retries are bounded at 3; see the later AddWithMaxAttempts(0) exception. |
| medium | [bots-swarms/continuation.md:2479](../../bots-swarms/continuation.md#L2479) | [bots-swarms/continuation.md:2497](../../bots-swarms/continuation.md#L2497) | The watchdog finding is about method ordering; real cluster reconnect attempts are capped at 30 s each, though there is still no end-to-end bound. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:9](../../assessment-evidence/sdk-boundaries-continuation.md#L9) | [assessment-evidence/sdk-boundaries-continuation.md:280](../../assessment-evidence/sdk-boundaries-continuation.md#L280) | The Codex schema is fully source-read; native runtime remains unvalidated. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:234](../../assessment-evidence/sdk-boundaries-continuation.md#L234) | [assessment-evidence/sdk-boundaries-continuation.md:234](../../assessment-evidence/sdk-boundaries-continuation.md#L234) | Capture error origin layer; do not infer origin from the code alone. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:137](../../assessment-evidence/sdk-boundaries-continuation.md#L137) | [assessment-evidence/sdk-boundaries-continuation.md:137](../../assessment-evidence/sdk-boundaries-continuation.md#L137) | The import failure was a fixture error; use the v2 receipt. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:157](../../assessment-evidence/sdk-boundaries-continuation.md#L157) | [assessment-evidence/sdk-boundaries-continuation.md:531](../../assessment-evidence/sdk-boundaries-continuation.md#L531) | Live Redis/S3 tests were read (late), never executed; they supply no backend evidence. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:389](../../assessment-evidence/sdk-boundaries-continuation.md#L389) | [assessment-evidence/sdk-boundaries-continuation.md:389](../../assessment-evidence/sdk-boundaries-continuation.md#L389) | Record the actual base-escape predicate. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:381](../../assessment-evidence/sdk-boundaries-continuation.md#L381) | [assessment-evidence/sdk-boundaries-continuation.md:381](../../assessment-evidence/sdk-boundaries-continuation.md#L381) | Do not repeat the docstring; reconnection code exists, though delivery completeness is unproven. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:54](../../assessment-evidence/sdk-boundaries-continuation.md#L54) | [assessment-evidence/sdk-boundaries-continuation.md:68](../../assessment-evidence/sdk-boundaries-continuation.md#L68) | Not a defect in the wrapper's normal path. |
| low | [toolchain/go-material-review.md:567](../../toolchain/go-material-review.md#L567) | [toolchain/go-material-review.md:565](../../toolchain/go-material-review.md#L565) | No default unprotected-cache race. |
| low | [assessment-evidence/continuation-exhaustion.md:704](../../assessment-evidence/continuation-exhaustion.md#L704) | [assessment-evidence/continuation-exhaustion.md:706](../../assessment-evidence/continuation-exhaustion.md#L706) | The Echo4 omission is explained by generator shared-field exclusion, not a bypass. |
| low | [assessment-evidence/continuation-exhaustion.md:714](../../assessment-evidence/continuation-exhaustion.md#L714) | [assessment-evidence/continuation-exhaustion.md:714](../../assessment-evidence/continuation-exhaustion.md#L714) | Sibling nId.val is not excluded by the gateway filter. |
| low | [security-landscape/deep-review/nuclei-auth.md:15](../../security-landscape/deep-review/nuclei-auth.md#L15) | [security-landscape/deep-review/nuclei-auth.md:41](../../security-landscape/deep-review/nuclei-auth.md#L41) | Malformed secret-file regexes fail validation. |
| low | [assessment-evidence/continuation-exhaustion.md:225](../../assessment-evidence/continuation-exhaustion.md#L225) | [assessment-evidence/continuation-exhaustion.md:251](../../assessment-evidence/continuation-exhaustion.md#L251) | Constructor cleanup behaviour is adapter-specific. |
| low | [assessment-evidence/continuation-exhaustion.md:455](../../assessment-evidence/continuation-exhaustion.md#L455) | [assessment-evidence/continuation-exhaustion.md:455](../../assessment-evidence/continuation-exhaustion.md#L455) | Do not repeat the old invalidation suspicion without the key-code trace in openfga-request-contract.md. |
| low | [assessment-evidence/continuation-exhaustion.md:153](../../assessment-evidence/continuation-exhaustion.md#L153) | [assessment-evidence/continuation-exhaustion.md:153](../../assessment-evidence/continuation-exhaustion.md#L153) | Read the corrected fixture description in those receipts, not the inherited one. |
| low | [assessment-evidence/continuation-exhaustion.md:202](../../assessment-evidence/continuation-exhaustion.md#L202) | [assessment-evidence/continuation-exhaustion.md:245](../../assessment-evidence/continuation-exhaustion.md#L245) | Adapter reading statuses in early paragraphs are outdated; check later checkpoints. |
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
| low | [assessment-evidence/continuation-exhaustion.md:421](../../assessment-evidence/continuation-exhaustion.md#L421) | [assessment-evidence/continuation-exhaustion.md:597](../../assessment-evidence/continuation-exhaustion.md#L597) | Library-level redaction does not describe what OpenFGA logs; check application logger config. |
| low | [toolchain/go-material-review.md:429](../../toolchain/go-material-review.md#L429) | [toolchain/go-material-review.md:425](../../toolchain/go-material-review.md#L425) | Misleading return contract only. |
| low | [toolchain/go-material-review.md:1945](../../toolchain/go-material-review.md#L1945) | [toolchain/go-material-review.md:1949](../../toolchain/go-material-review.md#L1949) | Checksum package findings apply to UploadPart/PutObject, with different trailer placement. |
| low | [security-landscape/deep-review/zap-history.md:11](../../security-landscape/deep-review/zap-history.md#L11) | [security-landscape/deep-review/zap-history-lab.md:17](../../security-landscape/deep-review/zap-history-lab.md#L17) | Divergence confirmed for history tags; no alert-tag or report impact established. |
| low | [toolchain/go-material-review.md:895](../../toolchain/go-material-review.md#L895) | [toolchain/go-material-review.md:951](../../toolchain/go-material-review.md#L951) | Closed bodies may be drained (≤256KiB) and reused. |
| low | [toolchain/go-material-review.md:1411](../../toolchain/go-material-review.md#L1411) | [toolchain/go-material-review.md:1419](../../toolchain/go-material-review.md#L1419) | Do not claim a connection leak from the NopCloser wrapper alone. |
| low | [toolchain/go-material-review.md:141](../../toolchain/go-material-review.md#L141) | [toolchain/go-material-review.md:369](../../toolchain/go-material-review.md#L369) | Do not cite RecursionDetection as a loop detector. |
| low | [toolchain/go-material-review.md:783](../../toolchain/go-material-review.md#L783) | [toolchain/go-material-review.md:803](../../toolchain/go-material-review.md#L803) | Response parsing tolerates spaces in field names. |
| low | [assessment-evidence/continuation-exhaustion.md:277](../../assessment-evidence/continuation-exhaustion.md#L277) | [assessment-evidence/continuation-exhaustion.md:281](../../assessment-evidence/continuation-exhaustion.md#L281) | Cleanup targets generated containers, but those tests still provision Docker infrastructure and should not be run casually. |
| low | [security-landscape/deep-review/nuclei-input-identity.md:71](../../security-landscape/deep-review/nuclei-input-identity.md#L71) | [security-landscape/deep-review/nuclei-input-identity.md:89](../../security-landscape/deep-review/nuclei-input-identity.md#L89) | Cross-run origin suppression is only a concern for reused SDK instances. |
| low | [assessment-evidence/continuation-exhaustion.md:735](../../assessment-evidence/continuation-exhaustion.md#L735) | [assessment-evidence/continuation-exhaustion.md:735](../../assessment-evidence/continuation-exhaustion.md#L735) | grpc-gateway is BSD-3-Clause. |
| low | [assessment-evidence/cel-planning-provenance.md:27](../../assessment-evidence/cel-planning-provenance.md#L27) | [assessment-evidence/garak-report-fixture-evidence.md:87](../../assessment-evidence/garak-report-fixture-evidence.md#L87) | garak-report yarn.lock fully read as metadata. |
| low | [bots-swarms/coverage.md:40](../../bots-swarms/coverage.md#L40) | [bots-swarms/continuation.md:157](../../bots-swarms/continuation.md#L157) | ipMatch.json is fully read; coverage.md:40 contradicts coverage.md:3. |
| low | [bots-swarms/defense.md:33](../../bots-swarms/defense.md#L33) | [bots-swarms/incident-review.md:3](../../bots-swarms/incident-review.md#L3) | Use incident-review.md. |
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
