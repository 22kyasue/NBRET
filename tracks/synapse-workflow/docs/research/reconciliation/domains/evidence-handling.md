# Evidence capture, attribution, integrity and confidentiality

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 49 findings, 137 related corrections, 32 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.anti-blocking-advice`** [bots-swarms/continuation.md:1035](../../bots-swarms/continuation.md#L1035): Adopting evasion/IP-rotation advice for client crawling. **Instead:** Identify crawlers and use negotiated quotas; docs/research/bots-swarms/model.md:60 (study, not operational evasion).
- **`hazard.ce-gateway-continuation-priorities`** [assessment-evidence/continuation-exhaustion.md:801](../../assessment-evidence/continuation-exhaustion.md#L801): An agent could resume the 8,622-line Swagger and binary-asset reading as if it were the active task. **Instead:** Only if Kotaro requests it; the review ended at a user-approved cutoff (continuation-exhaustion.md:799).
- **`hazard.ce-outdated-next-queue-model-write`** [assessment-evidence/continuation-exhaustion.md:94](../../assessment-evidence/continuation-exhaustion.md#L94): An agent may rerun an already completed admission fixture as a 'next step'. **Instead:** Already done and passed (continuation-exhaustion.md:104); do not rerun for volume (continuation-exhaustion.md:147).
- **`hazard.continuation-next-step`** [bots-swarms/continuation.md:2463](../../bots-swarms/continuation.md#L2463): Outdated next-step instruction; the work is done. **Instead:** Reading is closed per docs/research/bots-swarms/scope-closure.md:30.
- **`hazard.control-path-real-daemon-needed`** [security-landscape/deep-review/zap-control-path.md:78](../../security-landscape/deep-review/zap-control-path.md#L78): An agent may run new real-daemon interruption experiments. **Instead:** Existing receipts cover it (zap-directory-rule.md:23-33); new scanner runs are outside the current stop (docs/research/safety-context/README.md:14).
- **`hazard.drain-regression-fixture`** [bots-swarms/continuation.md:3058](../../bots-swarms/continuation.md#L3058): Building and running a Redis regression unprompted. **Instead:** Treat as an open hypothesis; requires explicit authorization (repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them")).
- **`hazard.falconpy-tests-call-live-services`** [cybersecurity-firms/falcon-host-action-source.md:15](../../cybersecurity-firms/falcon-host-action-source.md#L15): Running FalconPy host tests could authenticate and perform hide/unhide actions on a real tenant. **Instead:** Do not execute these tests; they were read only (falcon-host-action-source.md:15; safety-context/README.md:29).
- **`hazard.flagged-operation-cause`** [security-landscape/deep-review/zap-reports.md:81](../../security-landscape/deep-review/zap-reports.md#L81): An agent may infer which specific operation was flagged from nearby source comments, or treat 'flagged operation' as a known classification. **Instead:** The cause is unknown; 'flagged operation' wording overstated the evidence (docs/research/safety-context/README.md:33). Keep the stop, do not reconstruct it.
- **`hazard.flagged-wording-overclaim`** [assessment-evidence/cel-async-boundaries.md:27](../../assessment-evidence/cel-async-boundaries.md#L27): An agent may report a confirmed policy violation or invent the stop's cause from this repeated wording. **Instead:** Cause unknown; no rejected call was recovered (docs/research/safety-context/README.md:33).
- **`hazard.garak-init-network`** [assessment-evidence/deep-garak.md:27](../../assessment-evidence/deep-garak.md#L27): An agent may initialize garak assuming it is local-only, generating provider traffic and cost. **Instead:** Treat scanner construction as network activity requiring authorization (docs/research/reconciliation/README.md:5).
- **`hazard.go-flagged-operation-wording`** [toolchain/go-material-review.md:9](../../toolchain/go-material-review.md#L9): Agent infers a specific recovered safety warning or rejected call behind repeated "flagged operation" phrases, or guesses what it was. **Instead:** Treat it as a conservative stop instruction with unknown cause; do not infer or retry (safety-context/README.md:33).
- **`hazard.go-integration-tests-live`** [toolchain/go-material-review.md:1350](../../toolchain/go-material-review.md#L1350): Agent runs upstream SDK integration/perf tests that load AWS config and create/delete real buckets. **Instead:** Do not run; go-material-review.md:1348 heading says do not run; research is source-only.
- **`hazard.go-jsonschema-example-network`** [toolchain/go-material-review.md:1200](../../toolchain/go-material-review.md#L1200): Agent runs `go test` on jsonschema and triggers an outbound GitHub request. **Instead:** Run nothing without containment review; filter tests.
- **`hazard.go-partial-file-status`** [toolchain/go-material-review.md:1379](../../toolchain/go-material-review.md#L1379): Agent reports api_client.go as partially reviewed. **Instead:** Completed at go-material-review.md:1391 (1–1372).
- **`hazard.go-prioritized-queue-outdated`** [toolchain/go-material-review.md:1118](../../toolchain/go-material-review.md#L1118): Agent takes the old "Prioritized unread queue" as current next work. **Instead:** Queue was completed later (S3 manager closure go-material-review.md:1361; serializers go-material-review.md:1623); verify in go-material-queue.json.
- **`hazard.go-stale-unread-counts`** [toolchain/go-material-review.md:9](../../toolchain/go-material-review.md#L9): Agent believes S3 module review is incomplete and re-reads or re-plans based on stale counts. **Instead:** Section order is newest-first in lines 3–712; later passages record file closures (e.g. go-material-review.md:1623, 1869, 2049). Check go-material-queue.json.
- **`hazard.go-transport-test-large-workloads`** [toolchain/go-material-review.md:827](../../toolchain/go-material-review.md#L827): Agent runs net/http transport tests with 1GiB bodies, unbounded producers or real DNS. **Instead:** Keep unexecuted; see go-material-review.md:847 (real DNS) and go-material-review.md:881.
- **`hazard.google-rule-integration-test-live`** [cybersecurity-firms/google-rule-lifecycle-source.md:48](../../cybersecurity-firms/google-rule-lifecycle-source.md#L48): Running the CLI integration test creates, enables and alerts on a real rule in a SecOps tenant. **Instead:** Read only; it was not run (google-rule-lifecycle-source.md:48).
- **`hazard.lab-script-rerun`** [security-landscape/lab-results.md:7](../../security-landscape/lab-results.md#L7): Agent may rerun research labs as part of a reconciliation or audit task. **Instead:** Research commands are historical, not instructions (AGENTS.md); rerun only when the current task explicitly calls for it, loopback only.
- **`hazard.mockserver-all-interfaces`** [bots-swarms/continuation.md:1967](../../bots-swarms/continuation.md#L1967): Reusing Scrapy mock servers as an isolated lab (they bind all interfaces). **Instead:** Bind explicitly to loopback in any authorized lab.
- **`hazard.openfga-container-tests`** [assessment-evidence/continuation-exhaustion.md:283](../../assessment-evidence/continuation-exhaustion.md#L283): Running OpenFGA Postgres/MySQL package tests publishes all container ports and modifies replication auth, plus package-wide cleanup. **Instead:** Use the inert-driver approach (continuation-exhaustion.md:257) unless a fixture/ownership review is done and the user approves.
- **`hazard.openfga-recovery-channel-close-stopped`** [assessment-evidence/continuation-exhaustion.md:334](../../assessment-evidence/continuation-exhaustion.md#L334): An agent might design an equivalent recovery, panic or channel-close fixture for OpenFGA to close an open question. **Instead:** Permanently stopped for this scope (continuation-exhaustion.md:360, :799); see docs/research/safety-context/README.md:15 (Agate pause, cause unknown). Do not reproduce by another route.
- **`hazard.pgx-benchmark-drop-table`** [assessment-evidence/pgx-binding-boundaries.md:373](../../assessment-evidence/pgx-binding-boundaries.md#L373): Running pgx benchmarks against an existing database would drop table t. **Instead:** Never run against a non-disposable database; source review only (pgx-binding-boundaries.md:373).
- **`hazard.pgx-dev-commands`** [assessment-evidence/pgx-binding-boundaries.md:202](../../assessment-evidence/pgx-binding-boundaries.md#L202): Running pgx host setup or devcontainer scripts would install unpinned software and privileged services. **Instead:** Read only (pgx-binding-boundaries.md:190, :202); no installs without approval.
- **`hazard.private-cluster-seeds`** [bots-swarms/continuation.md:1227](../../bots-swarms/continuation.md#L1227): Executing tests that contact private network addresses. **Instead:** Do not run; contacting unscoped targets is out of bounds.
- **`hazard.privileged-compose`** [bots-swarms/continuation.md:2977](../../bots-swarms/continuation.md#L2977): Launching the supplied privileged Compose fixture that deletes /data and binds all interfaces. **Instead:** Do not launch; recorded at docs/research/bots-swarms/continuation.md:2977 as unsuitable.
- **`hazard.rea-ready-integration`** [2026-10-16-rea-and-security-workflows.md:230](../../2026-10-16-rea-and-security-workflows.md#L230): Agent may start pilots (installing promptfoo/garak/CALDERA/Atomic) as if approved. **Instead:** The handoff authorizes no target testing or integration (2026-10-16-rea-and-security-workflows.md:276).
- **`hazard.requires-internet-tests`** [bots-swarms/continuation.md:2231](../../bots-swarms/continuation.md#L2231): Running Scrapy tests assuming they are offline. **Instead:** Exclude internet-marked tests explicitly; no external contact without authorization.
- **`hazard.takumi-connect-repo`** [cybersecurity-firms/gmo-flatt-security.md:35](../../cybersecurity-firms/gmo-flatt-security.md#L35): An agent evaluating Takumi could upload NBRET or client code or install the write-enabled GitHub App. **Instead:** Do not upload code or install apps without explicit approval (gmo-flatt-security.md:35; takumi-github-scope-boundary.md:11).
- **`hazard.tox-aws-credentials`** [bots-swarms/continuation.md:585](../../bots-swarms/continuation.md#L585): Running Scrapy tox environments that pass through cloud credentials and download dependencies. **Instead:** Do not run; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them").
- **`hazard.upstream-flushall-suite`** [bots-swarms/continuation.md:2734](../../bots-swarms/continuation.md#L2734): Running upstream test suites against a shared Redis wipes data. **Instead:** Do not run; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them"); docs/research/safety-context/README.md:37 (do not recreate actions).
- **`hazard.zap-control-path-stale-unread`** [security-landscape/deep-review/zap-control-path.md:104](../../security-landscape/deep-review/zap-control-path.md#L104): An agent may believe ActiveScan/Session/AlertAPI sources are unread and restart reading or labs, or distrust the complete annotations above it. **Instead:** Files are recorded complete earlier in the same file (zap-control-path.md:43-104) and in file-queue.json; use those annotations.

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [An HTTP 200 fetch can be a challenge interstitial, not the requested source document](#evidence-handlinghttp-200-not-requested-document) | integrated-lab | evidence |
| [ZAP context removal or scan stop is not worker quiescence or data erasure](#evidence-handlingzap-cleanup-not-erasure) | integrated-lab | operations, evidence |
| [Agent monitor stores prompts and command output by default with no per-user access control](#evidence-handlingagent-monitor-retains-secrets) | component-lab | evidence, operations |
| [NBRET offline checks pick saved evidence by method/URL/body, ignoring identity (E01)](#evidence-handlinge01-offline-identity-ambiguity) | component-lab | evidence, retest |
| [garak setup serialization keeps nested api_key values in the report and HTML](#evidence-handlinggarak-report-keeps-api-key) | component-lab | evidence, reporting |
| [HAR export/import changes evidence: GET bodies vanish, port 8443 becomes 443, errors become status 0](#evidence-handlinghar-roundtrip-lossy) | component-lab | evidence, reporting, retest |
| [NBRET capture: failed finalization leaves no evidence file, yet a retried finish resolves](#evidence-handlingnbret-capture-finalization-gap) | component-lab | evidence |
| [NBRET links initiators to changed script bytes; the coverage path rejects the mismatch](#evidence-handlingnbret-source-identity-inconsistent) | component-lab | evidence, triage |
| [Nuclei cloud upload buffer drops the record that crosses the 4 MiB limit](#evidence-handlingnuclei-upload-drops-boundary-record) | component-lab | evidence, reporting |
| [ZAP rejects oversized message bodies at storage (default 16 MiB) instead of truncating](#evidence-handlingzap-history-size-limit) | component-lab | evidence |
| [ZAP SARIF export masks only Authorization; cookies, API keys, query and bodies survive](#evidence-handlingzap-sarif-keeps-secrets) | component-lab | reporting, evidence |
| [Authorization engine logs can contain users, objects and request context](#evidence-handlingauthz-logs-carry-sensitive-data) | source-trace | evidence, reporting, operations |
| [Concurrent pool results omit errored tasks and do not pair errors with tasks](#evidence-handlingconcurrent-results-not-task-ledger) | source-trace | evidence, operations |
| [DB codecs collapse NULL vs zero and change time/decimal meaning](#evidence-handlingdb-representation-loss) | source-trace | evidence, reporting |
| [Human-readable renderings lose precision and type; they are not canonical evidence](#evidence-handlingdisplay-strings-not-evidence) | source-trace | evidence, reporting |
| [An empty state diff can mean excluded, unreadable or budget-cut, not 'unchanged'](#evidence-handlingempty-diff-not-unchanged) | source-trace | evidence, retest, ai-evaluation |
| [pgx examples print expected output and return on CockroachDB, so green != executed](#evidence-handlingexpected-output-substitution) | source-trace | evidence, testing, ai-evaluation |
| [Separate observed behavior, source facts, derived links, hypotheses, missing evidence](#evidence-handlingfinding-record-separation) | source-trace | evidence, reporting |
| [Retaining the first request checksum across retries is intended consistency behavior](#evidence-handlinggo-checksum-retry-retains-first-by-design) | source-trace | evidence, triage |
| [Go HTTP dumps and parsed headers are approximations, not byte-faithful wire captures](#evidence-handlinggo-http-dump-not-wire-capture) | source-trace | evidence, reporting |
| [S3 GetObject checksum validation: only on HTTP 200, at EOF, six algorithms, last header wins](#evidence-handlinggo-s3-checksum-validation-is-narrow) | source-trace | evidence, retest |
| [S3 Select stream end without an End event can look like success](#evidence-handlinggo-select-eventstream-completion) | source-trace | evidence |
| [A caller-supplied checksum header skips SDK computation and is reported as computed](#evidence-handlinggo-supplied-checksum-bypasses-computation) | source-trace | evidence |
| [Upstream test names and labels routinely overstate what the assertions check](#evidence-handlinggo-test-names-not-coverage) | source-trace | evidence, ai-evaluation |
| [OpenFGA's Zap logger samples and has no delivery acknowledgement](#evidence-handlinglogger-sampling-no-delivery-ack) | source-trace | evidence, operations |
| [Crawler/queue diagnostics put cookies, credentials and full items in logs and traces](#evidence-handlinglogs-and-debug-expose-credentials) | source-trace | evidence, operations |
| [Test and benchmark names misstate what they exercise](#evidence-handlingmisnamed-benchmarks-and-tests) | source-trace | evidence, ai-evaluation, testing |
| [NBRET capture redaction is key-name heuristic and origins limit retention, not traffic](#evidence-handlingnbret-capture-redaction-egress) | source-trace | evidence, scoping |
| [Nuclei output redacts only 4 fields; trace, error and debug sinks are unredacted](#evidence-handlingnuclei-redaction-four-fields) | source-trace | evidence, reporting |
| [OpenFGA unary logging serializes raw requests before authentication](#evidence-handlingopenfga-logs-raw-requests-pre-auth) | source-trace | evidence, testing |
| [Passing upstream tests often do not reach the assertion they are named for](#evidence-handlingpassing-tests-not-assertions-reached) | source-trace | testing, retest, evidence |
| [pcapng files can carry decryption secrets; name records lose their origin; exit 0 is not full processing](#evidence-handlingpcap-carries-secrets-and-mixed-names) | source-trace | evidence, reporting, operations |
| [Local partial encoding state does not mean a partial query was executed](#evidence-handlingpreprocessing-vs-submission) | source-trace | evidence, testing |
| [Proxy captures keep credentials unredacted and the interception CA key is stored unencrypted](#evidence-handlingproxy-captures-unredacted-ca-key-plain) | source-trace | evidence, reporting, operations |
| [A line-regex regression policy is useful but cannot prove a defect class is gone](#evidence-handlingregression-policy-bounded) | source-trace | remediation, retest |
| [Partially evaluated or optimized policies embed known values and change expression IDs](#evidence-handlingresiduals-and-folding-embed-known-facts) | source-trace | evidence, retest |
| [Crawl "finished" and exit code 0 do not mean all outputs were stored or all fetches worked](#evidence-handlingrun-completion-not-delivery) | source-trace | evidence, reporting |
| [Security SDK/connector paths silently return one page or accepted-not-done as success](#evidence-handlingsdk-paths-return-partial-results-silently) | source-trace | evidence, operations, reporting |
| [pgx query traces log original SQL before rewrite; truncation is not redaction](#evidence-handlingtrace-logs-original-not-submitted) | source-trace | evidence, operations |
| [Transaction completion needs an independent state read; counts and savepoints mislead](#evidence-handlingtransaction-state-oracle) | source-trace | retest, evidence, remediation |
| [Many upstream tests assert less than their titles (skipped subtests, catch-only checks)](#evidence-handlingupstream-test-oracles-weak) | source-trace | testing, evidence |
| [Assertions only inside rows.Next pass vacuously when zero rows return](#evidence-handlingvacuous-row-loop-oracles) | source-trace | evidence, testing, retest |
| [ZAP alerts can exist in memory after DB failure; alert lists carry no completeness flag](#evidence-handlingzap-alert-persistence-partial) | source-trace | evidence, reporting, triage |
| [ZAP API writes failed API keys and nonces into warning logs](#evidence-handlingzap-api-logs-submitted-secrets) | source-trace | operations, evidence |
| [Production Zap logging samples by message, so request logs can be dropped](#evidence-handlingzap-production-sampling-drops-logs) | source-trace | evidence, operations |
| [Project changelogs index remediation classes but are not unbiased defect counts](#evidence-handlingchangelog-not-defect-count) | public-doc | triage, scoping |
| [MDR records: BT keeps raw telemetry/incident logs 7 days; Cisco tickets 1 year](#evidence-handlingmdr-record-retention-short) | public-doc | evidence, operations, scoping |
| [Takumi keeps test credentials in settings and may show them unmasked in progress messages](#evidence-handlingtakumi-credentials-unmasked-retention) | public-doc | scoping, evidence, operations |
| [Engagement memory must show better verified outcomes with no cross-tenant disclosure](#evidence-handlingmemory-needs-tenant-eval) | synthesis | evidence, ai-evaluation, operations |

### evidence-handlinghttp-200-not-requested-document

**`evidence-handling.http-200-not-requested-document`: An HTTP 200 fetch can be a challenge interstitial, not the requested source document** (integrated-lab)

The DOJ 911 S5 archive request returned HTTP 200 with a challenge interstitial; four FBI article archive requests returned 403. These bytes are recorded but are not article evidence.

**Do:** Verify content, not status codes, when archiving sources or capturing client evidence.

**Limits:** Single source-collection observation.

**Sources:** [bots-swarms/findings.md:22](../../bots-swarms/findings.md#L22), [bots-swarms/incident-review.md:3](../../bots-swarms/incident-review.md#L3)

**Receipts:** `bots-swarms/sources.json`, `bots-swarms/incident-sources.json`

### evidence-handlingzap-cleanup-not-erasure

**`evidence-handling.zap-cleanup-not-erasure`: ZAP context removal or scan stop is not worker quiescence or data erasure** (integrated-lab)

Session.deleteContext removes the context, catches DatabaseException and does not stop or join the ActiveScan, which keeps its Target/Context references; in the real-daemon run the in-flight rule still finished and raised an alert after context removal. Network addon destroy shuts down executors without awaiting termination.

**Do:** Treat client data deletion and scan termination as separate verified steps (owned daemon shutdown, file removal checks), not as implied by API success.

**Limits:** Source plus one runtime scenario; secure erasure untested.

**Sources:** [security-landscape/deep-review/zap-control-path.md:84](../../security-landscape/deep-review/zap-control-path.md#L84), [security-landscape/deep-review/zap-directory-rule.md:27](../../security-landscape/deep-review/zap-directory-rule.md#L27)

**Receipts:** `security-landscape/deep-review/real-zap-stop-receipt.json`

### evidence-handlingagent-monitor-retains-secrets

**`evidence-handling.agent-monitor-retains-secrets`: Agent monitor stores prompts and command output by default with no per-user access control** (component-lab)

UnifiedAgent's SQLite monitor omits reasoning and raw payloads by default but retains prompt, metadata and command/tool output. An executed contract showed synthetic secrets surviving SQLite to the ASGI JSON API with no auth headers. Web routes have no per-user or per-run authorization; loopback binding is CLI-only. On Windows the chmod 0600 test failed with 0666 observed. That is not DACL enforcement, though actual cross-user access was not measured.

**Do:** Treat agent telemetry as client-confidential evidence. Apply explicit redaction, access control and retention before running agents on engagements, and test with canaries end to end.

**Limits:** Synthetic data, in-process ASGI only. No remote exposure or real credential leak was shown.

**Sources:** [assessment-evidence/deep-monitor.md:24](../../assessment-evidence/deep-monitor.md#L24), [assessment-evidence/monitor-web-continuation.md:24](../../assessment-evidence/monitor-web-continuation.md#L24), [assessment-evidence/monitor-web-continuation.md:25](../../assessment-evidence/monitor-web-continuation.md#L25)

**Receipts:** `assessment-evidence/deep-monitor-receipt-r2.json`, `assessment-evidence/monitor-web-receipt-1792273602329.json`, `assessment-evidence/monitor-web-receipt-1792273621508.json`, `assessment-evidence/monitor-web-receipt-1792273583421.json`

**Contrary or narrowing evidence:**
- [assessment-evidence/monitor-web-continuation.md:15](../../assessment-evidence/monitor-web-continuation.md#L15): The UI renders target content as text, a positive XSS control.

### evidence-handlinge01-offline-identity-ambiguity

**`evidence-handling.e01-offline-identity-ambiguity`: NBRET offline checks pick saved evidence by method/URL/body, ignoring identity (E01)** (component-lab)

In fixed mode, a fresh tenant-B request for invoice A correctly passes the denial check, but offline reassessment of the earlier tenant-A response at the same URL with tenant-B headers fails, because checks.mjs lines 82-83 select saved evidence by method, sanitized URL and cleaned body without comparing headers/identity. The receipt records fresh passed, offline failed, saved identity A, requested B, zero offline requests. As of the 2026-10-18 audit, src/checks.mjs is byte-identical to the receipt's hashed version (sha256 301dca70...), so the legacy path still behaves this way; the separate src/assessment toolkit adds identity checks on a different path.

**Do:** Offline regression evidence must be bound to a non-secret principal/tenant/role/session label and ambiguous matches rejected; do not rely on the legacy checks.mjs offline path for identity-specific claims. A raw header comparison is not the fix because real credentials are redacted.

**Limits:** Evidence-selection ambiguity in a synthetic fixture, not a live cross-tenant exploit; does not invalidate all offline checks.

**Sources:** [security-landscape/lab-results.md:31](../../security-landscape/lab-results.md#L31), [security-landscape/lab-results.md:33](../../security-landscape/lab-results.md#L33), [security-landscape/implementation-reviews.md:75](../../security-landscape/implementation-reviews.md#L75)

**Receipts:** `security-landscape/lab-followup-receipt.json`

**Contrary or narrowing evidence:**
- [security-landscape/lab-followup-plan.md:5](../../security-landscape/lab-followup-plan.md#L5): Not a live vulnerability.

### evidence-handlinggarak-report-keeps-api-key

**`evidence-handling.garak-report-keeps-api-key`: garak setup serialization keeps nested api_key values in the report and HTML** (component-lab)

garak's command serializes effective config and plugin dictionaries into the report setup row with no redaction. An executed AST fixture showed a nested synthetic api_key surviving setup serialization, and build_html retaining a script-ending delimiter inside embedded JSON. The UI SetupSection displays plugins.generators JSON without redaction.

**Do:** Scrub or allow-list LLM scanner report artifacts before sharing them with clients or storing them centrally.

**Limits:** Synthetic key and inert template only; no real exploit or disclosure shown.

**Sources:** [assessment-evidence/deep-garak.md:107](../../assessment-evidence/deep-garak.md#L107)

**Receipts:** `assessment-evidence/garak-artifact-boundary-receipt-1792275942824.json`

### evidence-handlinghar-roundtrip-lossy

**`evidence-handling.har-roundtrip-lossy`: HAR export/import changes evidence: GET bodies vanish, port 8443 becomes 443, errors become status 0** (component-lab)

A predeclared HAR round-trip lab with native flow objects showed GET content disappearing, the reconstructed server port becoming 443 while the request kept 8443, and an exported error becoming no error plus response status 0. HAR export also has no atomic write or memory budget.

**Do:** Keep the native capture as the evidence of record; treat HAR as a lossy convenience format and never use it as the sole basis for a finding or retest.

**Limits:** Validates the selected adapter transformations at one version without network requests.

**Sources:** [toolchain/proxy-flow.md:143](../../toolchain/proxy-flow.md#L143)

**Receipts:** `toolchain/har-roundtrip-receipt.json`

### evidence-handlingnbret-capture-finalization-gap

**`evidence-handling.nbret-capture-finalization-gap`: NBRET capture: failed finalization leaves no evidence file, yet a retried finish resolves** (component-lab)

Running actual startCapture with a stub CDP session whose detach throws once: the first finish rejected, the second resolved with detach still attempted once, and evidence.json and finishedAt were absent. evidence.json is written directly without atomic replacement or signature.

**Do:** Distinguish recorder completion, successful persistence and cleanup; verify the evidence file exists and hashes before treating a capture as complete.

**Limits:** Controlled injected failure; real CDP failure rates unknown.

**Sources:** [security-landscape/deep-review/nbret-capture.md:35](../../security-landscape/deep-review/nbret-capture.md#L35), [security-landscape/deep-review/nbret-capture.md:15](../../security-landscape/deep-review/nbret-capture.md#L15)

**Receipts:** `security-landscape/deep-review/capture-finalization-lab-receipt.json`

### evidence-handlingnbret-source-identity-inconsistent

**`evidence-handling.nbret-source-identity-inconsistent`: NBRET links initiators to changed script bytes; the coverage path rejects the mismatch** (component-lab)

With deliberately changed saved script bytes and an old SHA, actual buildStructure indexed the new bytes and linked a historical initiator at the same URL/position to newHandler, while the V8 coverage path rejected the mismatched hash; a matching-hash control was accepted.

**Do:** Check source hash agreement on every correlation path before attributing a request to code; keep exact executed-source provenance.

**Limits:** Synthetic local artifact mismatch; not observed tampering.

**Sources:** [security-landscape/deep-review/nbret-discovery.md:49](../../security-landscape/deep-review/nbret-discovery.md#L49)

**Receipts:** `security-landscape/deep-review/structure-identity-lab-receipt.json`

### evidence-handlingnuclei-upload-drops-boundary-record

**`evidence-handling.nuclei-upload-drops-boundary-record`: Nuclei cloud upload buffer drops the record that crosses the 4 MiB limit** (component-lab)

Extracted unchanged autoCommit/uploadChunk logic with inert stand-ins: an exactly-4 MiB control uploaded both lines, but a record crossing the limit was counted yet absent from uploads, a single oversized line produced an empty upload, and a failed boundary flush retried the old buffer but still dropped the crossing record. Repeated twice.

**Do:** Do not rely on Nuclei's cloud upload as the evidence of record; keep local raw output and reconcile counts.

**Limits:** Buffering logic only; cloud acceptance and real impact not tested.

**Sources:** [security-landscape/deep-review/nuclei-upload-buffer-lab.md:15](../../security-landscape/deep-review/nuclei-upload-buffer-lab.md#L15)

**Receipts:** `security-landscape/deep-review/nuclei-upload-buffer-lab-receipt.json`

### evidence-handlingzap-history-size-limit

**`evidence-handling.zap-history-size-limit`: ZAP rejects oversized message bodies at storage (default 16 MiB) instead of truncating** (component-lab)

Installed ParosTableHistory with a memory HSQLDB fixture round-tripped exact-limit bodies and rejected oversize request/response bodies with DatabaseException, leaving the row count unchanged. Default limits are 16,777,216 bytes. A missing body on reload becomes an empty string rather than an error.

**Do:** Large responses may be absent from ZAP evidence; an empty body in history is not proof the original was empty.

**Limits:** Component test with tiny limits; higher alert/report path handling not shown.

**Sources:** [security-landscape/deep-review/zap-history-lab.md:7](../../security-landscape/deep-review/zap-history-lab.md#L7), [security-landscape/deep-review/zap-history.md:11](../../security-landscape/deep-review/zap-history.md#L11)

**Receipts:** `security-landscape/deep-review/zap-history-lab-receipt.json`

### evidence-handlingzap-sarif-keeps-secrets

**`evidence-handling.zap-sarif-keeps-secrets`: ZAP SARIF export masks only Authorization; cookies, API keys, query and bodies survive** (component-lab)

Installed reports 0.43.0 SarifResult builder and the pinned SARIF JSON template were run on a synthetic exchange: Authorization was masked while Cookie, a custom API-key header, URL query, request body, response cookie/body and attack remained. Two repeated serializations produced identical 6,190-byte artifacts that parsed as JSON with those fields preserved. SarifHeaderCredentialHider replaces Authorization only.

**Do:** Before sending SARIF (or any ZAP export) to a client or third party, apply your own redaction for cookies, session tokens, API keys, query/body secrets and response Set-Cookie, and treat the raw export as sensitive evidence.

**Limits:** Synthetic fixture, selected template, mixed installed/source provenance; not an observed customer leak or schema validation.

**Sources:** [security-landscape/deep-review/zap-sarif-lab.md:3](../../security-landscape/deep-review/zap-sarif-lab.md#L3), [security-landscape/deep-review/zap-sarif-lab.md:13](../../security-landscape/deep-review/zap-sarif-lab.md#L13), [security-landscape/deep-review/zap-reports.md:75](../../security-landscape/deep-review/zap-reports.md#L75)

**Receipts:** `security-landscape/deep-review/zap-sarif-lab-receipt.json`, `security-landscape/deep-review/zap-sarif-render-lab-receipt.json`

### evidence-handlingauthz-logs-carry-sensitive-data

**`evidence-handling.authz-logs-carry-sensitive-data`: Authorization engine logs can contain users, objects and request context** (source-trace)

OpenFGA's optional shadow v2 check logs can include user, object, context and contextual tuples, so observability has confidentiality implications for both clients and our own evidence pipeline.

**Do:** Treat policy-engine logs as sensitive client data in collection, retention and reporting; flag unredacted decision logging as a finding where relevant.

**Limits:** Source trace of one optional feature.

**Sources:** [assessment-evidence/deep-openfga.md:13](../../assessment-evidence/deep-openfga.md#L13)

### evidence-handlingconcurrent-results-not-task-ledger

**`evidence-handling.concurrent-results-not-task-ledger`: Concurrent pool results omit errored tasks and do not pair errors with tasks** (source-trace)

conc v0.3.0 result pools exclude a result whose callback errored unless WithCollectErrored is set. Results come in completion order, and the combined error is not paired with tasks. First registered error is not chronological first fault. Context cancellation does not stop callbacks that ignore context. CEL async and timeout wrappers likewise provide cooperative cancellation only.

**Do:** Scanners and collectors built on such pools need one record per scheduled task (identity, terminal status, result, error). A result count cannot prove coverage, and cancellation does not prove work stopped.

**Limits:** OpenFGA does not use the result pools; this is a dependency contract.

**Sources:** [assessment-evidence/conc-pool-boundaries.md:7](../../assessment-evidence/conc-pool-boundaries.md#L7), [assessment-evidence/cel-async-boundaries.md:9](../../assessment-evidence/cel-async-boundaries.md#L9)

### evidence-handlingdb-representation-loss

**`evidence-handling.db-representation-loss`: DB codecs collapse NULL vs zero and change time/decimal meaning** (source-trace)

pgx zeronull types intentionally map zero/empty to NULL and back, and positive tests expect that loss. timestamp encoding discards time-zone identity (wall clock) while timestamptz stores an instant; Numeric Float64Value has no exactness roundtrip; hstore decoding overwrites duplicate keys and encoders iterate maps without canonical order.

**Do:** An evidence store must keep 'observed empty', 'observed zero' and 'not observed' distinct with status fields, store instants with zone, keep exact decimals and avoid map serialization as signature input.

**Limits:** Source-established codec contracts; no customer use of these types established.

**Sources:** [assessment-evidence/pgx-binding-boundaries.md:158](../../assessment-evidence/pgx-binding-boundaries.md#L158), [assessment-evidence/pgx-binding-boundaries.md:238](../../assessment-evidence/pgx-binding-boundaries.md#L238)

### evidence-handlingdisplay-strings-not-evidence

**`evidence-handling.display-strings-not-evidence`: Human-readable renderings lose precision and type; they are not canonical evidence** (source-trace)

Several renderers lose type or precision:
- CEL legacy formatting shows nested doubles at six decimals, so [0.000000002] displays as [0.000000];
- V2 formatting renders strings and bytes unquoted and sorts by formatted text;
- Format is documented as human-only and unstable;
- Zap JSON retains duplicate keys, while map-based consumers keep one value;
- DeepDiff JSON export can project objects to their properties.

**Do:** Store raw typed evidence plus hashes, and generate displays from it. Never hash, deduplicate or dispute findings using display strings.

**Limits:** Source-established behaviours; no specific evidence corruption observed.

**Sources:** [assessment-evidence/cel-time-and-format.md:23](../../assessment-evidence/cel-time-and-format.md#L23), [assessment-evidence/cel-authoring-evidence.md:222](../../assessment-evidence/cel-authoring-evidence.md#L222), [assessment-evidence/grpc-logging-evidence.md:79](../../assessment-evidence/grpc-logging-evidence.md#L79)

### evidence-handlingempty-diff-not-unchanged

**`evidence-handling.empty-diff-not-unchanged`: An empty state diff can mean excluded, unreadable or budget-cut, not 'unchanged'** (source-trace)

DeepDiff 8.6.1 (beneath AgentDojo's state oracle) returns an empty diff when changed or deleted fields are excluded, when include-paths select a nonexistent branch, and at max_diffs=1 despite real differences. Slot attributes whose getters raise are silently omitted rather than reported unprocessed. Object extraction can execute property getters.

**Do:** Any 'no change' or 'state preserved' claim built on a generic comparator must record its extraction schema, exclusions, normalization and limit/completeness status separately from the boolean result.

**Limits:** Source and authored-test reading. No incorrect AgentDojo verdict was demonstrated, and AgentDojo's partial does not set max_diffs.

**Sources:** [assessment-evidence/deep-deepdiff.md:121](../../assessment-evidence/deep-deepdiff.md#L121), [assessment-evidence/deep-deepdiff.md:217](../../assessment-evidence/deep-deepdiff.md#L217), [assessment-evidence/framework.md:49](../../assessment-evidence/framework.md#L49)

**Contrary or narrowing evidence:**
- [assessment-evidence/deep-deepdiff.md:33](../../assessment-evidence/deep-deepdiff.md#L33): Default calls are not capped.

### evidence-handlingexpected-output-substitution

**`evidence-handling.expected-output-substitution`: pgx examples print expected output and return on CockroachDB, so green != executed** (source-trace)

At pgx v5.11.0, ExampleRowToStructByPos, ExampleRowToStructByName, the lax variant, example_custom_type, example_child_records and the final Query example deliberately print their expected output and return when running against CockroachDB, because Go examples cannot skip. A passing output example in that environment does not establish the illustrated query or capability executed; ordinary tests use explicit skips instead.

**Do:** Test and benchmark receipts must record which branch ran (executed, skipped, expected-output substitution); a passing output comparison alone cannot support a capability claim.

**Limits:** Source reading only; no tests run; not a criticism of every pgx test.

**Sources:** [assessment-evidence/pgx-binding-boundaries.md:27](../../assessment-evidence/pgx-binding-boundaries.md#L27), [assessment-evidence/pgx-binding-boundaries.md:325](../../assessment-evidence/pgx-binding-boundaries.md#L325)

### evidence-handlingfinding-record-separation

**`evidence-handling.finding-record-separation`: Separate observed behavior, source facts, derived links, hypotheses, missing evidence** (source-trace)

REA's evidence schema records artifact identity, provider/version, operation/parameters, normalized/raw results, confidence, authority, environment, limitations and source locations. The NBRET lesson: a finding should separate observed behavior, static source facts, derived relationships, hypotheses and missing evidence; a shared action ID or nearby timestamp is association not causation; a client-side gate is not server-side authorization; evidence hashes detect inconsistency but do not establish trusted origin, truth or chain of custody.

**Do:** Structure findings with these labeled layers and never present a hash or correlation as proof of origin or cause.

**Limits:** Upstream source design reading; REA real-provider behavior unverified.

**Sources:** [2026-10-16-rea-and-security-workflows.md:42](../../2026-10-16-rea-and-security-workflows.md#L42), [2026-10-16-rea-and-security-workflows.md:44](../../2026-10-16-rea-and-security-workflows.md#L44)

### evidence-handlinggo-checksum-retry-retains-first-by-design

**`evidence-handling.go-checksum-retry-retains-first-by-design`: Retaining the first request checksum across retries is intended consistency behavior** (source-trace)

The checksum compute middleware caches header/trailer checksums across attempts, and upstream mock tests replace "hello world" with "world hello" on retry yet expect the original CRC32. CHANGELOG v1.9.0 describes caching the first checksum as enabling consistency checks across attempts, so a verifier can reject changed bytes. The real core retry loop shares and reseeks the same stream and does not replace bytes; external mutation remains possible.

**Do:** Do not report checksum retention on retry as an integrity bypass. Distinguish supplied checksum headers, computed checksums, transmitted bytes and server validation before asserting impact.

**Limits:** Release-note intent plus source; neither service acceptance nor rejection of mismatched bytes is established.

**Sources:** [toolchain/go-material-review.md:1927](../../toolchain/go-material-review.md#L1927), [toolchain/go-material-review.md:1935](../../toolchain/go-material-review.md#L1935), [toolchain/go-material-review.md:1973](../../toolchain/go-material-review.md#L1973)

**Contrary or narrowing evidence:**
- [toolchain/go-material-review.md:1913](../../toolchain/go-material-review.md#L1913): Supplied checksum headers are trusted and reported as computed metadata.

### evidence-handlinggo-http-dump-not-wire-capture

**`evidence-handling.go-http-dump-not-wire-capture`: Go HTTP dumps and parsed headers are approximations, not byte-faithful wire captures** (source-trace)

DumpRequest loses original header order/case and renders HTTP/2 as HTTP/1.x; body dumping reads the whole body into memory with no cap and replaces the stream. A dump of a parsed request with Content-Length 3 shows only three bytes. Transport gzip decoding removes Content-Encoding and Content-Length. textproto folds/normalizes headers; Header.Write drops invalid names and replaces CR/LF. SDK request/body logging has no redaction or size bound.

**Do:** Keep raw captured bytes (with hashes) separately from dumps or decoded views when evidence fidelity matters, and redact before logging.

**Limits:** Source review of Go 1.27.2 and Smithy; no dumps executed.

**Sources:** [toolchain/go-material-review.md:991](../../toolchain/go-material-review.md#L991), [toolchain/go-material-review.md:987](../../toolchain/go-material-review.md#L987), [toolchain/go-material-review.md:951](../../toolchain/go-material-review.md#L951), [toolchain/go-material-review.md:1073](../../toolchain/go-material-review.md#L1073)

### evidence-handlinggo-s3-checksum-validation-is-narrow

**`evidence-handling.go-s3-checksum-validation-is-narrow`: S3 GetObject checksum validation: only on HTTP 200, at EOF, six algorithms, last header wins** (source-trace)

In pinned checksum v1.9.18, response validation runs only when enabled and only for HTTP 200 (a 206 ranged read skips it), and is skipped when the expected checksum contains "-" (multipart); GetObject sets IgnoreMultipartValidation: true. Only CRC32C, CRC32, SHA1, SHA256, CRC64NVME and SHA512 are validated; MD5 and XXHASH variants modeled by S3 are not. If several checksum headers are present the last present algorithm wins, and the comparison uses strings.EqualFold on Base64. Validation happens only when a Read returns EOF; Close forwards to the body without draining or validating.

**Do:** Never record an S3 download as integrity-verified because the call succeeded, a checksum header was present, or the body was closed. An evidence pipeline must read to EOF, confirm status 200, non-multipart object and a supported algorithm, or compute its own hash.

**Limits:** Source trace of pinned SDK modules only; no runtime test, and the case-insensitive Base64 comparison is an unresolved candidate, not a demonstrated bypass.

**Sources:** [toolchain/go-material-review.md:1891](../../toolchain/go-material-review.md#L1891), [toolchain/go-material-review.md:1891](../../toolchain/go-material-review.md#L1891), [toolchain/go-material-review.md:1893](../../toolchain/go-material-review.md#L1893), [toolchain/go-material-review.md:1892](../../toolchain/go-material-review.md#L1892), [toolchain/go-material-review.md:1882](../../toolchain/go-material-review.md#L1882)

**Contrary or narrowing evidence:**
- [toolchain/go-material-review.md:1901](../../toolchain/go-material-review.md#L1901): Upstream tests confirm the EOF contract but do not cover partial reads, Close-before-EOF, 206 or case-only Base64 changes.

### evidence-handlinggo-select-eventstream-completion

**`evidence-handling.go-select-eventstream-completion`: S3 Select stream end without an End event can look like success** (source-trace)

The default eventstream reader returns nil on decoder EOF without requiring an End event, so channel closure with Err nil does not prove the modeled End was observed. Eventstream frames have CRC checks but no maximum frame size (cap removed in v1.6.9), and ValidateLens rejects only Length==0, leaving a malformed-length underflow candidate.

**Do:** Require an observed End event before treating streamed query output as complete.

**Limits:** Source trace; Select is unavailable to new customers per pinned docs.

**Sources:** [toolchain/go-material-review.md:2023](../../toolchain/go-material-review.md#L2023), [toolchain/go-material-review.md:2075](../../toolchain/go-material-review.md#L2075)

**Receipts:** `toolchain/eventstream-binary-inspection.json`

### evidence-handlinggo-supplied-checksum-bypasses-computation

**`evidence-handling.go-supplied-checksum-bypasses-computation`: A caller-supplied checksum header skips SDK computation and is reported as computed** (source-trace)

If any request header already carries the checksum prefix, the compute middleware skips hashing without validating the value or algorithm; tests accept an arbitrary EMOJI algorithm/value and show it in computed metadata. Checksum v1.9.10 deliberately allows unknown precalculated algorithms.

**Do:** Checksum metadata from the SDK is not proof the client hashed the bytes; record whether a checksum was supplied or computed.

**Limits:** Source and unrun test reading; service handling of such headers is not established.

**Sources:** [toolchain/go-material-review.md:1925](../../toolchain/go-material-review.md#L1925), [toolchain/go-material-review.md:297](../../toolchain/go-material-review.md#L297)

### evidence-handlinggo-test-names-not-coverage

**`evidence-handling.go-test-names-not-coverage`: Upstream test names and labels routinely overstate what the assertions check** (source-trace)

Across the pinned modules: TestChain has an unconditional break so only its first generated chain case runs; a fixture named corrupted_headers actually corrupts payload bytes; validate_parts_test.go tests downloader range mismatch; error checks often run only inside err != nil; snapshot checks pass when the baseline file is missing.

**Do:** When using third-party tests as evidence of tool behavior, read the assertions, not names or pass status.

**Limits:** Source reading; tests were not executed.

**Sources:** [toolchain/go-material-review.md:1268](../../toolchain/go-material-review.md#L1268), [toolchain/go-material-review.md:2083](../../toolchain/go-material-review.md#L2083), [toolchain/go-material-review.md:533](../../toolchain/go-material-review.md#L533), [toolchain/go-material-review.md:1308](../../toolchain/go-material-review.md#L1308)

**Receipts:** `toolchain/eventstream-binary-inspection.json`

### evidence-handlinglogger-sampling-no-delivery-ack

**`evidence-handling.logger-sampling-no-delivery-ack`: OpenFGA's Zap logger samples and has no delivery acknowledgement** (source-trace)

OpenFGA constructs Zap v1.28.0 with 100:100 sampling, and completion fields do not distinguish sampler buckets; CheckedEntry.Write returns no error and the after-hook is not successful-delivery acknowledgement. gRPC logging middleware forwards opt-in payloads without cloning or redaction.

**Do:** Do not treat application logs as complete evidence of every request when assessing detection or reconstructing incidents; record sampling configuration.

**Limits:** Source only; no logger, sink or traffic was run.

**Sources:** [assessment-evidence/continuation-exhaustion.md:513](../../assessment-evidence/continuation-exhaustion.md#L513)

### evidence-handlinglogs-and-debug-expose-credentials

**`evidence-handling.logs-and-debug-expose-credentials`: Crawler/queue diagnostics put cookies, credentials and full items in logs and traces** (source-trace)

COOKIES_DEBUG logs raw cookie values; request_to_curl output embeds credentials and is not shell-safe; export errors log full item repr; BullMQ trace attributes include serialized options, results and failure reasons; FTP proxy errors can include credential-bearing URLs.

**Do:** Disable debug cookie logging and redact logs/traces before retaining them as engagement evidence or sharing with clients.

**Limits:** Source/test reading; no real secrets used.

**Sources:** [bots-swarms/continuation.md:2575](../../bots-swarms/continuation.md#L2575), [bots-swarms/continuation.md:2125](../../bots-swarms/continuation.md#L2125), [bots-swarms/continuation.md:849](../../bots-swarms/continuation.md#L849)

### evidence-handlingmisnamed-benchmarks-and-tests

**`evidence-handling.misnamed-benchmarks-and-tests`: Test and benchmark names misstate what they exercise** (source-trace)

In pgx, BenchmarkSelectRowsSimpleAppendRowsRowToStructByName actually calls RowToStructByPos; the 'source end error' COPY test uses an Err that always errors rather than one gated on exhaustion; ScanNull uses a non-null row type and selects no NULLs; TestIntervalTextEncode passes DateOID. Integration benchmarks check only ForEachRow errors, never decoded values or cardinality.

**Do:** Attribute measurements and test coverage by the actual code path called, not by name; vendor benchmark claims need the workload source checked.

**Limits:** Source findings; no benchmark run or speed comparison made.

**Sources:** [assessment-evidence/pgx-binding-boundaries.md:375](../../assessment-evidence/pgx-binding-boundaries.md#L375), [assessment-evidence/pgx-binding-boundaries.md:41](../../assessment-evidence/pgx-binding-boundaries.md#L41)

### evidence-handlingnbret-capture-redaction-egress

**`evidence-handling.nbret-capture-redaction-egress`: NBRET capture redaction is key-name heuristic and origins limit retention, not traffic** (source-trace)

capture.mjs redacts secret-named keys and URL credentials/query, but arbitrary secret strings under neutral keys, labels, paths and fragments can remain; hashes bind sanitized content, not original bytes or principal. Configured origins constrain what is retained, not browser egress; no route interception blocks network traffic. Opted-in script source is explicitly unredacted.

**Do:** Treat captures as potentially secret-bearing and enforce browser egress separately when scope matters.

**Limits:** Source reading.

**Sources:** [security-landscape/deep-review/nbret-capture.md:7](../../security-landscape/deep-review/nbret-capture.md#L7), [security-landscape/deep-review/nbret-capture.md:7](../../security-landscape/deep-review/nbret-capture.md#L7)

### evidence-handlingnuclei-redaction-four-fields

**`evidence-handling.nuclei-redaction-four-fields`: Nuclei output redacts only 4 fields; trace, error and debug sinks are unredacted** (source-trace)

Nuclei's standard writer applies keyed regex redaction (Authorization, Proxy-Authorization, Cookie, Set-Cookie, X-Api-Key plus configured keys) only to Request, Response, CURLCommand and Matched. Host/URL/Path, extracted results, metadata, interaction and LLM fields are not sanitized, and trace/error records and debug storage bypass redaction. Replay dumps retain auth headers by design.

**Do:** Treat Nuclei debug/trace/error outputs and extracted values as secret-bearing; add your own redaction stage before artifacts leave the assessor environment.

**Limits:** Source reading; no bypass or over-redaction cases tested.

**Sources:** [security-landscape/deep-review/nuclei-output.md:11](../../security-landscape/deep-review/nuclei-output.md#L11), [security-landscape/deep-review/nuclei-output.md:13](../../security-landscape/deep-review/nuclei-output.md#L13)

### evidence-handlingopenfga-logs-raw-requests-pre-auth

**`evidence-handling.openfga-logs-raw-requests-pre-auth`: OpenFGA unary logging serializes raw requests before authentication** (source-trace)

OpenFGA's own logging reporter attempts protobuf JSON serialization of every received request and successful response, appending raw_request/raw_response with EmitUnpopulated, with no per-field redaction. Server wiring places unary logging before validation and authentication, so invalid or unauthenticated unary request bodies reach it. The stream chain differs. CEL compilation errors also reach public error responses.

**Do:** When auditing a client's authorization service, check what request bodies end up in logs before authentication, and who can read those logs.

**Limits:** Source trace at one OpenFGA pin. No logs were collected and no auth bypass is claimed.

**Sources:** [assessment-evidence/grpc-logging-evidence.md:43](../../assessment-evidence/grpc-logging-evidence.md#L43), [assessment-evidence/grpc-logging-evidence.md:47](../../assessment-evidence/grpc-logging-evidence.md#L47)

**Contrary or narrowing evidence:**
- [assessment-evidence/grpc-logging-evidence.md:47](../../assessment-evidence/grpc-logging-evidence.md#L47): Logging is pre-auth but access is not.

### evidence-handlingpassing-tests-not-assertions-reached

**`evidence-handling.passing-tests-not-assertions-reached`: Passing upstream tests often do not reach the assertion they are named for** (source-trace)

Multiple pinned suites contain tests that pass without checking their stated property:
- a garak encoding test whose parameter list is always empty;
- garak buff tests that are vacuously true on empty input;
- a DeepDiff group whose final expected-state assertion is commented out;
- JWT CI that pipes go test through '|| true';
- garak README claiming 100% coverage while vite.config sets 85% with exclusions;
- a chart test exercising mock-authored clamping.

**Do:** When using upstream tests or CI as evidence of a tool's capability (or a client's fix), record discovered/selected/executed/asserted counts and use a deliberate failing control. A green badge is not proof.

**Limits:** Source reading of tests; none executed. These are local oracle gaps, not proof the code under test is wrong.

**Sources:** [assessment-evidence/deep-garak.md:53](../../assessment-evidence/deep-garak.md#L53), [assessment-evidence/deep-deepdiff.md:167](../../assessment-evidence/deep-deepdiff.md#L167), [assessment-evidence/jwt-request-boundaries.md:54](../../assessment-evidence/jwt-request-boundaries.md#L54), [assessment-evidence/deep-garak.md:208](../../assessment-evidence/deep-garak.md#L208)

**Receipts:** `assessment-evidence/garak-encoding-oracle-receipt-1792275333580.json`

**Contrary or narrowing evidence:**
- [assessment-evidence/deep-garak.md:192](../../assessment-evidence/deep-garak.md#L192): Some tests are strong; credit concrete predicates.

### evidence-handlingpcap-carries-secrets-and-mixed-names

**`evidence-handling.pcap-carries-secrets-and-mixed-names`: pcapng files can carry decryption secrets; name records lose their origin; exit 0 is not full processing** (source-trace)

A pcapng artifact can carry embedded decryption-secret blocks, so sharing a capture does not imply secrets were excluded. Name records are merged from DNS packets, hosts files, external resolution and manual mappings without per-entry origin. Converting to classic pcap drops comments and options. TShark exit 0 does not establish exhaustive processing, offline processing can still do DNS lookups, and the same bytes decode differently under different profiles.

**Do:** Strip secrets before sharing captures, record the decoding profile and version with any packet-based finding, and disable name resolution for offline analysis.

**Limits:** Source reading; no secret-bearing artifact was opened.

**Sources:** [toolchain/pcap-format.md:40](../../toolchain/pcap-format.md#L40), [toolchain/pcap-format.md:34](../../toolchain/pcap-format.md#L34), [toolchain/packet-dependencies.md:11](../../toolchain/packet-dependencies.md#L11), [toolchain/discovery-packets.md:68](../../toolchain/discovery-packets.md#L68)

### evidence-handlingpreprocessing-vs-submission

**`evidence-handling.preprocessing-vs-submission`: Local partial encoding state does not mean a partial query was executed** (source-trace)

pgx ExtendedQueryBuilder can leave earlier encoded values in public slices after a later Build failure, but Conn.execParams, execPrepared, execSQLParams and Query return on Build error before calling pgconn. Callback-based collectors (ForEachRow, AppendRows) do not roll back earlier callback effects when a later error occurs.

**Do:** Record attempted preprocessing, submission, target effect and cleanup as separate states; neither a local partial buffer nor a local error proves the target-side effect.

**Limits:** Source trace; no SQL or encoder executed; OpenFGA does not use NamedArgs/collection helpers.

**Sources:** [assessment-evidence/pgx-binding-boundaries.md:9](../../assessment-evidence/pgx-binding-boundaries.md#L9), [assessment-evidence/pgx-binding-boundaries.md:29](../../assessment-evidence/pgx-binding-boundaries.md#L29)

### evidence-handlingproxy-captures-unredacted-ca-key-plain

**`evidence-handling.proxy-captures-unredacted-ca-key-plain`: Proxy captures keep credentials unredacted and the interception CA key is stored unencrypted** (source-trace)

Neither mitmproxy's save path nor its dispatch code redacts credentials by default, so saved flows and HAR files carry tokens and cookies. The interception CA's private key is written as unencrypted PEM and PKCS12 with ordinary writes; Windows ACL protection is not established.

**Do:** Use synthetic test accounts where possible, treat captures and the CA key as secrets under an approved handling and retention policy, and redact before anything reaches a client deliverable.

**Limits:** Source reading; no secret-bearing artifacts were created or opened.

**Sources:** [toolchain/proxy-flow.md:55](../../toolchain/proxy-flow.md#L55), [toolchain/proxy-tls.md:13](../../toolchain/proxy-tls.md#L13)

### evidence-handlingregression-policy-bounded

**`evidence-handling.regression-policy-bounded`: A line-regex regression policy is useful but cannot prove a defect class is gone** (source-trace)

pgx raw_binary_read_test scans immediate production files for literal binary.BigEndian/LittleEndian Uint16/32/64 calls and fails if found. It is line-regex matching that excludes subdirectories/tests and cannot detect unchecked direct slice indexing such as the ltree scanners.

**Do:** Turn findings into automated recurrence guards for clients, but report their defined search space and limits rather than claiming the class is eliminated.

**Limits:** Policy test read, not run.

**Sources:** [assessment-evidence/pgx-binding-boundaries.md:248](../../assessment-evidence/pgx-binding-boundaries.md#L248)

### evidence-handlingresiduals-and-folding-embed-known-facts

**`evidence-handling.residuals-and-folding-embed-known-facts`: Partially evaluated or optimized policies embed known values and change expression IDs** (source-trace)

CEL residualization and constant folding copy known input values into literals, can cache known function results, reparse under the current environment and renumber expression IDs. ResidualAst docs say residual IDs do not correlate with originals. Prune mutates the backing macro-call map rather than deep-snapshotting it. Tests check structure, not semantic equivalence.

**Do:** Treat residual or optimized policies as conditional on dated input facts. They may contain confidential facts, so store them with original expression, state snapshot and expiry, not as reusable shareable memory.

**Limits:** Source reading; no equivalence experiment run.

**Sources:** [assessment-evidence/cel-authoring-evidence.md:158](../../assessment-evidence/cel-authoring-evidence.md#L158), [assessment-evidence/cel-planning-provenance.md:55](../../assessment-evidence/cel-planning-provenance.md#L55)

### evidence-handlingrun-completion-not-delivery

**`evidence-handling.run-completion-not-delivery`: Crawl "finished" and exit code 0 do not mean all outputs were stored or all fetches worked** (source-trace)

Scrapy feed tests permit finish_reason=finished when every feed target already exists and nothing was stored; crawls without errbacks silently drop 404s; generators keep already-yielded items after errors; CLI exit status is nonzero only for bootstrap failure or error finish reasons. Media items complete with empty attachments after failures.

**Do:** Check per-output success counters and target-side evidence before telling a client a crawl or export covered everything.

**Limits:** Upstream tests read, not run.

**Sources:** [bots-swarms/continuation.md:2065](../../bots-swarms/continuation.md#L2065), [bots-swarms/continuation.md:1831](../../bots-swarms/continuation.md#L1831), [bots-swarms/continuation.md:1959](../../bots-swarms/continuation.md#L1959)

### evidence-handlingsdk-paths-return-partial-results-silently

**`evidence-handling.sdk-paths-return-partial-results-silently`: Security SDK/connector paths silently return one page or accepted-not-done as success** (source-trace)

The FortiSOAR Sentinel connector's Get Incident List makes one GET with no pagination loop. Google secops-wrapper natural-language search returns only fetched events and its count is the returned list length; as_list drops the more-data flag. Trend's MCP endpoint list does not exhaust pagination and its request helper treats any 2xx, including 202 and 207, as success. Google investigation trigger returns IN_PROGRESS, and rule replay yields compilation/rule errors as records rather than exceptions. The FalconPy quarantine sample contains all hostname matches and prints contained on 202.

**Do:** Any adapter we build or reuse must record pagination completeness, distinguish accepted/queued/completed/partial states, and check yielded error records before reporting a search, inventory or action as complete.

**Limits:** Source reading at pinned commits; no code or tests were executed and remote behavior may add protections.

**Sources:** [cybersecurity-firms/fortinet-sentinel-source.md:9](../../cybersecurity-firms/fortinet-sentinel-source.md#L9), [cybersecurity-firms/google-natural-language-search-source.md:26](../../cybersecurity-firms/google-natural-language-search-source.md#L26), [cybersecurity-firms/trend-mcp-source.md:16](../../cybersecurity-firms/trend-mcp-source.md#L16), [cybersecurity-firms/google-rule-lifecycle-source.md:32](../../cybersecurity-firms/google-rule-lifecycle-source.md#L32), [cybersecurity-firms/falcon-host-action-source.md:7](../../cybersecurity-firms/falcon-host-action-source.md#L7)

### evidence-handlingtrace-logs-original-not-submitted

**`evidence-handling.trace-logs-original-not-submitted`: pgx query traces log original SQL before rewrite; truncation is not redaction** (source-trace)

pgx TraceLog records the original SQL/args from query start, before option rewriting that can fail before send, so a trace with sql/args is not a record of server-submitted SQL. Query end fires on rows.Close, so the interval includes result consumption. Argument logging shortens values around 64 bytes; short secrets remain intact and SQL is unshortened. Two TraceLog instances share context keys in multitracer.

**Do:** Evidence logs must separate intended, transformed/submitted and completed actions, state the end-event trigger, and have an explicit sanitization and retention contract.

**Limits:** Source only; no logging, secret disclosure or timing measured; OpenFGA does not use tracelog.

**Sources:** [assessment-evidence/pgx-binding-boundaries.md:83](../../assessment-evidence/pgx-binding-boundaries.md#L83), [assessment-evidence/pgx-binding-boundaries.md:81](../../assessment-evidence/pgx-binding-boundaries.md#L81), [assessment-evidence/pgx-binding-boundaries.md:91](../../assessment-evidence/pgx-binding-boundaries.md#L91)

**Contrary or narrowing evidence:**
- [assessment-evidence/pgx-binding-boundaries.md:358](../../assessment-evidence/pgx-binding-boundaries.md#L358): Selective omission exists for error text, not general sanitization.

### evidence-handlingtransaction-state-oracle

**`evidence-handling.transaction-state-oracle`: Transaction completion needs an independent state read; counts and savepoints mislead** (source-trace)

pgx nested Commit releases a savepoint, not a durable commit; Begin context installs no auto-rollback on later cancellation; BeginFunc returns the application error even if rollback failed. Tests that independently query counts are positive controls but count is not row identity, and callback effects are not rolled back.

**Do:** Retest and remediation verification must check target state directly (exact identity where count is insufficient), not trust callback return, handle closed or rollback command success.

**Limits:** Source/authored tests only; no cancellation or backend-death fixture run.

**Sources:** [assessment-evidence/pgx-binding-boundaries.md:105](../../assessment-evidence/pgx-binding-boundaries.md#L105), [assessment-evidence/pgx-binding-boundaries.md:101](../../assessment-evidence/pgx-binding-boundaries.md#L101)

### evidence-handlingupstream-test-oracles-weak

**`evidence-handling.upstream-test-oracles-weak`: Many upstream tests assert less than their titles (skipped subtests, catch-only checks)** (source-trace)

Coraza TestOperators skips every JSON fixture because it checks a constant string against the notImplemented list; Coraza's scanner Dockerfile catches any cheap-test failure and just warns; many limiter tests assert only inside catch, so unexpected success passes; BullMQ cancellation tests accept either outcome.

**Do:** When choosing or validating a tool for client work, read what tests actually assert; a green suite or test name is not evidence of a property.

**Limits:** Source-only test-oracle review.

**Sources:** [bots-swarms/continuation.md:2706](../../bots-swarms/continuation.md#L2706), [bots-swarms/continuation.md:1057](../../bots-swarms/continuation.md#L1057), [bots-swarms/continuation.md:1293](../../bots-swarms/continuation.md#L1293)

### evidence-handlingvacuous-row-loop-oracles

**`evidence-handling.vacuous-row-loop-oracles`: Assertions only inside rows.Next pass vacuously when zero rows return** (source-trace)

Several pgx authored tests (generic record DecodeValue, XML/range/multirange DecodeValue, batch ledger reads, prepared queries) assert values only inside a rows.Next loop with no expected row count, so an empty successful result would skip all value checks. A native batch rollback example ignores the final Scan error, so a failed read leaves the zero-initialized count satisfying 'expect 0'. Neighbouring tests (pipeline, query, stdlib rollback) do check exact cardinality and Scan errors.

**Do:** When validating our own or a vendor's checks, read the assertion: require cardinality and terminal-error checks, and ensure a failed read cannot satisfy a 'no rows' expectation.

**Limits:** Identifies oracle gaps in authored source; no runtime empty-result outcome demonstrated.

**Sources:** [assessment-evidence/pgx-binding-boundaries.md:73](../../assessment-evidence/pgx-binding-boundaries.md#L73), [assessment-evidence/pgx-binding-boundaries.md:356](../../assessment-evidence/pgx-binding-boundaries.md#L356)

**Contrary or narrowing evidence:**
- [assessment-evidence/pgx-binding-boundaries.md:391](../../assessment-evidence/pgx-binding-boundaries.md#L391): Stdlib transaction test checks Scan error and exact counts.
- [assessment-evidence/pgx-binding-boundaries.md:330](../../assessment-evidence/pgx-binding-boundaries.md#L330): undefined

### evidence-handlingzap-alert-persistence-partial

**`evidence-handling.zap-alert-persistence-partial`: ZAP alerts can exist in memory after DB failure; alert lists carry no completeness flag** (source-trace)

ExtensionAlert logs most DB/history exceptions and still proceeds to the in-memory event handler; getAllAlerts logs exceptions and returns a possibly partial list without a completeness flag. Alerts can be added manually through the API with MANUAL source, and systemic-limit suppression happens after DB persistence and affects the tree consumed by modern reports.

**Do:** Reconcile alert counts across API, DB and report; treat an alert's existence or confidence as tool output requiring validation, not proof.

**Limits:** Source reading; no reproduced data loss.

**Sources:** [security-landscape/deep-review/zap-alert-persistence.md:7](../../security-landscape/deep-review/zap-alert-persistence.md#L7), [security-landscape/deep-review/zap-alert-persistence.md:13](../../security-landscape/deep-review/zap-alert-persistence.md#L13), [security-landscape/deep-review/zap-control-path.md:100](../../security-landscape/deep-review/zap-control-path.md#L100), [security-landscape/deep-review/zap-reports.md:13](../../security-landscape/deep-review/zap-reports.md#L13)

### evidence-handlingzap-api-logs-submitted-secrets

**`evidence-handling.zap-api-logs-submitted-secrets`: ZAP API writes failed API keys and nonces into warning logs** (source-trace)

In ZAP core API.java key/nonce validation, failed key and nonce values are interpolated into warning logs, so operational logs can contain submitted sensitive values even when reports redact them. Separately, single-use nonce lookup and removal are not one atomic operation.

**Do:** Protect and rotate ZAP logs as secret-bearing; do not ship daemon logs as evidence without scrubbing.

**Limits:** Source reading only; no credential was logged in research.

**Sources:** [security-landscape/deep-review/zap-network.md:107](../../security-landscape/deep-review/zap-network.md#L107)

### evidence-handlingzap-production-sampling-drops-logs

**`evidence-handling.zap-production-sampling-drops-logs`: Production Zap logging samples by message, so request logs can be dropped** (source-trace)

OpenFGA uses Zap NewProductionConfig with Sampling{Initial:100, Thereafter:100} per second, keyed by level and message only. All ordinary completions share message grpc_req_complete at Info, so distinct requests can be sampled out. CheckedEntry.Write returns no error and the after-hook runs even when writes failed. Info/Error do not Sync.

**Do:** Do not treat absence of a log event as absence of a request during incident response or retest. Record logger sampling and delivery config in the evidence receipt.

**Limits:** Source trace; real request rates and actual missing records were not observed.

**Sources:** [assessment-evidence/grpc-logging-evidence.md:61](../../assessment-evidence/grpc-logging-evidence.md#L61), [assessment-evidence/grpc-logging-evidence.md:65](../../assessment-evidence/grpc-logging-evidence.md#L65)

### evidence-handlingchangelog-not-defect-count

**`evidence-handling.changelog-not-defect-count`: Project changelogs index remediation classes but are not unbiased defect counts** (public-doc)

pgx's CHANGELOG records repeated remediation classes (decoder bounds, buffer ownership, scanner precedence, cache freshness, cancellation, partial-result errors), useful as hypothesis provenance. It also says malformed connection-string redaction is best effort, and an older 'all typed nils are NULL' statement is contradicted by current custom nil-Valuer tests.

**Do:** Use vendor changelogs to generate test hypotheses, not to score security quality or prove a class eliminated; keep statements version-scoped.

**Limits:** Maintainer documentation; no prior version reproduced.

**Sources:** [assessment-evidence/pgx-binding-boundaries.md:438](../../assessment-evidence/pgx-binding-boundaries.md#L438), [assessment-evidence/pgx-binding-boundaries.md:440](../../assessment-evidence/pgx-binding-boundaries.md#L440)

### evidence-handlingmdr-record-retention-short

**`evidence-handling.mdr-record-retention-short`: MDR records: BT keeps raw telemetry/incident logs 7 days; Cisco tickets 1 year** (public-doc)

BT's October 2024 Managed Falcon XDR schedule sets standard raw telemetry and incident-log retention at seven days, with longer raw retention optional and separate from six-month service-request visibility. Cisco MDR (2022) and XDR Premier (2024) retain incident tickets one year, separate from product log policies, and third-party sharing needs customer authorization. Falcon master terms reference purchased retention periods without a uniform day count.

**Do:** Engagement and incident-response plans must confirm how long raw telemetry is kept by each provider before relying on it for investigation or retest evidence.

**Limits:** Dated public schedules; signed orders and DPAs were not read.

**Sources:** [cybersecurity-firms/bt-falcon-service-schedule.md:9](../../cybersecurity-firms/bt-falcon-service-schedule.md#L9), [cybersecurity-firms/cisco-mdr-service-description.md:9](../../cybersecurity-firms/cisco-mdr-service-description.md#L9), [cybersecurity-firms/falcon-public-terms-boundary.md:9](../../cybersecurity-firms/falcon-public-terms-boundary.md#L9)

### evidence-handlingtakumi-credentials-unmasked-retention

**`evidence-handling.takumi-credentials-unmasked-retention`: Takumi keeps test credentials in settings and may show them unmasked in progress messages** (public-doc)

Takumi persists supplied test-account credentials for execution and reuse, and the manual says they may appear unmasked in assessment progress messages. Uploaded source is retained 30 days (extended by reuse) with optional immediate deletion; report PDF links expire after 15 minutes and issued PDFs are deleted after 30 days. Owner, manager and user roles can all view assessment settings/results; only owner/manager can delete.

**Do:** Supply only dedicated, low-privilege, rotatable assessment accounts to AI assessment tools, restrict who holds viewer roles, and plan credential rotation after each engagement; record source-retention and deletion choices in the engagement record.

**Limits:** A disclosed handling boundary from the manual, not an experimentally observed leak; role visibility in a real tenant was not inspected.

**Sources:** [cybersecurity-firms/gmo-flatt-security.md:29](../../cybersecurity-firms/gmo-flatt-security.md#L29), [cybersecurity-firms/gmo-flatt-security.md:29](../../cybersecurity-firms/gmo-flatt-security.md#L29), [cybersecurity-firms/gmo-flatt-security.md:27](../../cybersecurity-firms/gmo-flatt-security.md#L27)

### evidence-handlingmemory-needs-tenant-eval

**`evidence-handling.memory-needs-tenant-eval`: Engagement memory must show better verified outcomes with no cross-tenant disclosure** (synthesis)

No memory benefit has been measured. PentestGPT's memory schema carries run IDs, not user/tenant ACLs or encryption keys. Prompt projection keeps bounded recent slices, not learning. The proposed evaluation uses two synthetic tenants with overlapping asset names and canaries, held-out tasks with/without memory, and revocation and deletion tests.

**Do:** Do not add cross-engagement AI memory without enforcing tenant filters in code before context assembly, with deletion reaching caches, indexes and embeddings, and a held-out evaluation.

**Limits:** The experiment has not run.

**Sources:** [assessment-evidence/infrastructure-and-memory.md:35](../../assessment-evidence/infrastructure-and-memory.md#L35), [assessment-evidence/deep-pentestgpt.md:41](../../assessment-evidence/deep-pentestgpt.md#L41), [assessment-evidence/overview.md:43](../../assessment-evidence/overview.md#L43)

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
| high | [cybersecurity-firms/falcon-host-action-source.md:7](../../cybersecurity-firms/falcon-host-action-source.md#L7) | [cybersecurity-firms/falcon-host-action-source.md:7](../../cybersecurity-firms/falcon-host-action-source.md#L7) | Never copy the sample's success message into reports; confirm host state via the device status contract. |
| high | [toolchain/go-material-review.md:2019](../../toolchain/go-material-review.md#L2019) | [toolchain/go-material-review.md:2023](../../toolchain/go-material-review.md#L2023) | Require an observed End event for completeness. |
| high | [security-landscape/deep-review/zap-reports.md:29](../../security-landscape/deep-review/zap-reports.md#L29) | [security-landscape/deep-review/zap-reports.md:43](../../security-landscape/deep-review/zap-reports.md#L43) | SARIF artifacts preserve cookies/API keys/bodies; only Authorization is masked. |
| high | [cybersecurity-firms/takumi-domestic-inference-announcement.md:5](../../cybersecurity-firms/takumi-domestic-inference-announcement.md#L5) | [cybersecurity-firms/gmo-flatt-security.md:61](../../cybersecurity-firms/gmo-flatt-security.md#L61) | Assume overseas inference for Takumi unless a signed domestic-inference arrangement is in place and active. |
| high | [security-landscape/deep-review/zap-reports.md:11](../../security-landscape/deep-review/zap-reports.md#L11) | [security-landscape/deep-review/zap-context.md:17](../../security-landscape/deep-review/zap-context.md#L17) | Context exclusions do not remove alerts from ZAP reports. |
| high | [security-landscape/deep-review/zap-network.md:45](../../security-landscape/deep-review/zap-network.md#L45) | [security-landscape/deep-review/zap-network-tests.md:11](../../security-landscape/deep-review/zap-network-tests.md#L11) | ZAP intentionally retries mutating methods on IO failure. |
| high | [security-landscape/deep-review/nbret-scanner.md:41](../../security-landscape/deep-review/nbret-scanner.md#L41) | [security-landscape/deep-review/zap-directory-rule.md:17](../../security-landscape/deep-review/zap-directory-rule.md#L17) | Out-of-path request and alert retention are runtime-observed on a real daemon. |
| high | [security-landscape/deep-review/nbret-scanner.md:49](../../security-landscape/deep-review/nbret-scanner.md#L49) | [security-landscape/deep-review/zap-directory-rule.md:25](../../security-landscape/deep-review/zap-directory-rule.md#L25) | Treat stop-as-completed as runtime-confirmed for this scenario; nbret-scanner.md SC-05 was never back-annotated. |
| medium | [assessment-evidence/deep-lab-plan.md:26](../../assessment-evidence/deep-lab-plan.md#L26) | [assessment-evidence/deep-monitor.md:28](../../assessment-evidence/deep-monitor.md#L28) | The _owner_alive helper did not terminate the child; cite only the narrower console-signal portability concern. |
| medium | [toolchain/go-material-review.md:753](../../toolchain/go-material-review.md#L753) | [toolchain/go-material-review.md:753](../../toolchain/go-material-review.md#L753) | Do not attribute the Express token redirect hypothesis to CopyObject. |
| medium | [toolchain/go-material-review.md:563](../../toolchain/go-material-review.md#L563) | [toolchain/go-material-review.md:561](../../toolchain/go-material-review.md#L561) | Scope the Express mismatch to static default credentials plus per-operation override. |
| medium | [security-landscape/deep-review/zap-history.md:31](../../security-landscape/deep-review/zap-history.md#L31) | [security-landscape/deep-review/zap-history-lab.md:13](../../security-landscape/deep-review/zap-history-lab.md#L13) | ZAP history cache is auth/cookie-blind but not body-blind. |
| medium | [assessment-evidence/continuation-exhaustion.md:159](../../assessment-evidence/continuation-exhaustion.md#L159) | [assessment-evidence/continuation-exhaustion.md:159](../../assessment-evidence/continuation-exhaustion.md#L159) | OpenFGA ignores extra context keys when parameters exist; do not rely on the comment. |
| medium | [assessment-evidence/continuation-exhaustion.md:151](../../assessment-evidence/continuation-exhaustion.md#L151) | [assessment-evidence/continuation-exhaustion.md:196](../../assessment-evidence/continuation-exhaustion.md#L196) | Cite the caller-level receipt, but keep the finding as a conversion boundary, not a bypass. |
| medium | [assessment-evidence/continuation-exhaustion.md:374](../../assessment-evidence/continuation-exhaustion.md#L374) | [assessment-evidence/continuation-exhaustion.md:374](../../assessment-evidence/continuation-exhaustion.md#L374) | Do not report OpenFGA as failing open on resolver errors. |
| medium | [assessment-evidence/continuation-exhaustion.md:241](../../assessment-evidence/continuation-exhaustion.md#L241) | [assessment-evidence/continuation-exhaustion.md:259](../../assessment-evidence/continuation-exhaustion.md#L259) | SQLite has component runtime evidence; PostgreSQL/MySQL remain source-only. |
| medium | [assessment-evidence/continuation-exhaustion.md:120](../../assessment-evidence/continuation-exhaustion.md#L120) | [assessment-evidence/continuation-exhaustion.md:129](../../assessment-evidence/continuation-exhaustion.md#L129) | No lost-edge defect exists on the ordinary builder path. |
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
| medium | [security-landscape/deep-review/nbret-capture.md:15](../../security-landscape/deep-review/nbret-capture.md#L15) | [security-landscape/deep-review/nbret-capture.md:35](../../security-landscape/deep-review/nbret-capture.md#L35) | Finalization gap is component-confirmed; real CDP failure frequency unknown. |
| medium | [assessment-evidence/deep-deepdiff.md:33](../../assessment-evidence/deep-deepdiff.md#L33) | [assessment-evidence/deep-deepdiff.md:123](../../assessment-evidence/deep-deepdiff.md#L123) | An empty DeepDiff can hide unreadable slot fields; require an independent state schema/completeness check. |
| medium | [security-landscape/deep-review/nbret-discovery.md:41](../../security-landscape/deep-review/nbret-discovery.md#L41) | [security-landscape/deep-review/nbret-discovery.md:49](../../security-landscape/deep-review/nbret-discovery.md#L49) | Initiator path inconsistency is component-confirmed. |
| medium | [security-landscape/deep-review/zap-alert-persistence.md:37](../../security-landscape/deep-review/zap-alert-persistence.md#L37) | [security-landscape/deep-review/zap-alert-persistence.md:65](../../security-landscape/deep-review/zap-alert-persistence.md#L65) | Do not attribute the alert-update mismatch to default ZAP or NBRET. |
| medium | [toolchain/go-material-review.md:1083](../../toolchain/go-material-review.md#L1083) | [toolchain/go-material-review.md:979](../../toolchain/go-material-review.md#L979) | Length mismatches error at transport but may have partial remote effect. |
| medium | [toolchain/go-material-review.md:1467](../../toolchain/go-material-review.md#L1467) | [toolchain/go-material-review.md:961](../../toolchain/go-material-review.md#L961) | No header injection claim via standard transport; custom RoundTrippers differ. |
| medium | [security-landscape/deep-review/zap-reports.md:356](../../security-landscape/deep-review/zap-reports.md#L356) | [security-landscape/deep-review/zap-reports.md:382](../../security-landscape/deep-review/zap-reports.md#L382) | Assume the exit override persists across plans in one process. |
| medium | [security-landscape/deep-review/zap-reports.md:13](../../security-landscape/deep-review/zap-reports.md#L13) | [security-landscape/deep-review/zap-report-filter-lab.md:7](../../security-landscape/deep-review/zap-report-filter-lab.md#L7) | Fail-open confirmed under injection; target-triggerability unknown. |
| medium | [assessment-evidence/deep-garak.md:73](../../assessment-evidence/deep-garak.md#L73) | [assessment-evidence/deep-garak.md:91](../../assessment-evidence/deep-garak.md#L91) | Live-plugin tag dependence applies to Report.get_evaluations/AVID export, not the modern digest. |
| medium | [assessment-evidence/framework.md:30](../../assessment-evidence/framework.md#L30) | [assessment-evidence/deep-garak.md:178](../../assessment-evidence/deep-garak.md#L178) | Describe garak evaluation counts as output-per-detector judgments, not prompt counts. |
| medium | [security-landscape/deep-review/nuclei-output.md:19](../../security-landscape/deep-review/nuclei-output.md#L19) | [security-landscape/deep-review/nuclei-output-lab.md:5](../../security-landscape/deep-review/nuclei-output-lab.md#L5) | Sink order and fail-fast are component-confirmed. |
| medium | [assessment-evidence/cel-async-boundaries.md:27](../../assessment-evidence/cel-async-boundaries.md#L27) | [safety-context/README.md:33](../../safety-context/README.md#L33) | Keep the OpenFGA recovery reproduction stopped, but do not claim a specific policy flag or cause. |
| medium | [security-landscape/deep-review/zap-control-path.md:78](../../security-landscape/deep-review/zap-control-path.md#L78) | [security-landscape/deep-review/zap-control-path.md:108](../../security-landscape/deep-review/zap-control-path.md#L108) | Interruption timing is runtime-observed; specific engine exception paths remain source-only. |
| medium | [security-landscape/deep-review/zap-network.md:200](../../security-landscape/deep-review/zap-network.md#L200) | [security-landscape/deep-review/zap-network.md:204](../../security-landscape/deep-review/zap-network.md#L204) | Filter failures do not bypass node scope; scope gaps come from crafted destinations instead. |
| medium | [security-landscape/deep-review/zap-control-path.md:54](../../security-landscape/deep-review/zap-control-path.md#L54) | [security-landscape/deep-review/zap-control-path.md:92](../../security-landscape/deep-review/zap-control-path.md#L92) | Do not claim ZAP strips auth headers from all scanner requests. |
| medium | [security-landscape/deep-review/zap-history.md:97](../../security-landscape/deep-review/zap-history.md#L97) | [security-landscape/deep-review/zap-history.md:121](../../security-landscape/deep-review/zap-history.md#L121) | Defect is component-confirmed but reachability is limited; no scan impact shown. |
| medium | [review-findings.json:151](../../review-findings.json#L151) | [2026-10-16-rea-and-security-workflows.md:232](../../2026-10-16-rea-and-security-workflows.md#L232) | Follow the Markdown order: existing NBRET checks before any new scanner. |
| medium | [assessment-evidence/coverage.md:59](../../assessment-evidence/coverage.md#L59) | [assessment-evidence/continuation-exhaustion.md:58](../../assessment-evidence/continuation-exhaustion.md#L58) | Do not treat the earlier bounded pass as complete coverage; even the later cutoff is not exhaustion (continuation-exhaustion.md:801). |
| medium | [2026-10-16-rea-and-security-workflows.md:40](../../2026-10-16-rea-and-security-workflows.md#L40) | [2026-10-16-rea-and-security-workflows.md:9](../../2026-10-16-rea-and-security-workflows.md#L9) | Verify each REA feature in 6.4.0 before relying on it. |
| medium | [bots-swarms/catalog.md:10](../../bots-swarms/catalog.md#L10) | [bots-swarms/findings.md:19](../../bots-swarms/findings.md#L19) | Coraza enforcement path is fully traced at source level (still no Go run). |
| medium | [bots-swarms/source-notes.md:39](../../bots-swarms/source-notes.md#L39) | [bots-swarms/continuation.md:2465](../../bots-swarms/continuation.md#L2465) | Use cont:2449-2465 for drain/child shutdown semantics. |
| medium | [bots-swarms/continuation.md:2987](../../bots-swarms/continuation.md#L2987) | [bots-swarms/continuation.md:3007](../../bots-swarms/continuation.md#L3007) | Do not use getFlow maxChildren as a memory or result cap. |
| medium | [bots-swarms/continuation.md:3094](../../bots-swarms/continuation.md#L3094) | [bots-swarms/continuation.md:3094](../../bots-swarms/continuation.md#L3094) | Do not claim BullMQ shared suites are validated on Postgres from the setup files. |
| medium | [bots-swarms/continuation.md:1573](../../bots-swarms/continuation.md#L1573) | [bots-swarms/continuation.md:1569](../../bots-swarms/continuation.md#L1569) | For TypeScript BullMQ, sync listener throws are caught; malformed JSON and async rejections remain the failure modes. |
| medium | [toolchain/go-material-review.md:1927](../../toolchain/go-material-review.md#L1927) | [toolchain/go-material-review.md:1973](../../toolchain/go-material-review.md#L1973) | Changed retry bodies require external mutation, not the SDK retry loop. |
| medium | [toolchain/go-material-review.md:1983](../../toolchain/go-material-review.md#L1983) | [toolchain/go-material-review.md:2093](../../toolchain/go-material-review.md#L2093) | Check for retry wrappers with max 0 before assuming a bounded retry count. |
| medium | [toolchain/go-material-review.md:1965](../../toolchain/go-material-review.md#L1965) | [toolchain/go-material-review.md:1983](../../toolchain/go-material-review.md#L1983) | Default retries are bounded at 3; see the later AddWithMaxAttempts(0) exception. |
| medium | [bots-swarms/continuation.md:2479](../../bots-swarms/continuation.md#L2479) | [bots-swarms/continuation.md:2497](../../bots-swarms/continuation.md#L2497) | The watchdog finding is about method ordering; real cluster reconnect attempts are capped at 30 s each, though there is still no end-to-end bound. |
| low | [assessment-evidence/deep-pentestgpt.md:13](../../assessment-evidence/deep-pentestgpt.md#L13) | [assessment-evidence/monitor-web-continuation.md:17](../../assessment-evidence/monitor-web-continuation.md#L17) | The zero-cost conflation is in trial aggregation, not the monitor UI. |
| low | [2026-10-16-rea-and-security-workflows.md:178](../../2026-10-16-rea-and-security-workflows.md#L178) | [security-landscape/implementation-reviews.md:95](../../security-landscape/implementation-reviews.md#L95) | Use implementation-reviews.md for garak evaluator behavior. |
| low | [toolchain/go-material-review.md:567](../../toolchain/go-material-review.md#L567) | [toolchain/go-material-review.md:565](../../toolchain/go-material-review.md#L565) | No default unprotected-cache race. |
| low | [assessment-evidence/continuation-exhaustion.md:704](../../assessment-evidence/continuation-exhaustion.md#L704) | [assessment-evidence/continuation-exhaustion.md:706](../../assessment-evidence/continuation-exhaustion.md#L706) | The Echo4 omission is explained by generator shared-field exclusion, not a bypass. |
| low | [assessment-evidence/continuation-exhaustion.md:714](../../assessment-evidence/continuation-exhaustion.md#L714) | [assessment-evidence/continuation-exhaustion.md:714](../../assessment-evidence/continuation-exhaustion.md#L714) | Sibling nId.val is not excluded by the gateway filter. |
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
| low | [cybersecurity-firms/falcon-host-action-source.md:17](../../cybersecurity-firms/falcon-host-action-source.md#L17) | [cybersecurity-firms/falcon-host-action-source.md:29](../../cybersecurity-firms/falcon-host-action-source.md#L29) | Result formatting is read; third-party transport remains unread. |
| low | [toolchain/go-material-review.md:475](../../toolchain/go-material-review.md#L475) | [toolchain/go-material-review.md:445](../../toolchain/go-material-review.md#L445) | Weakness limited to the shared document helper. |
| low | [toolchain/go-material-review.md:1146](../../toolchain/go-material-review.md#L1146) | [toolchain/go-material-review.md:1146](../../toolchain/go-material-review.md#L1146) | No jsonschema duplicate bypass from hash collisions. |
| low | [assessment-evidence/pgx-binding-boundaries.md:3](../../assessment-evidence/pgx-binding-boundaries.md#L3) | [assessment-evidence/pgx-binding-boundaries.md:47](../../assessment-evidence/pgx-binding-boundaries.md#L47) | Use 5e583fa7aabfa88b796292f849fc9d7d75ac159d as the pgx v5.11.0 pin. |
| low | [assessment-evidence/pgx-binding-boundaries.md:217](../../assessment-evidence/pgx-binding-boundaries.md#L217) | [assessment-evidence/pgx-binding-boundaries.md:219](../../assessment-evidence/pgx-binding-boundaries.md#L219) | pgx interval-to-duration conversion has no overflow check and uses a fixed 30-day month. |
| low | [assessment-evidence/pgx-binding-boundaries.md:384](../../assessment-evidence/pgx-binding-boundaries.md#L384) | [assessment-evidence/pgx-binding-boundaries.md:384](../../assessment-evidence/pgx-binding-boundaries.md#L384) | Inspect actual conversion, not metadata suggestions, when judging decimal precision. |
| low | [assessment-evidence/pgx-binding-boundaries.md:73](../../assessment-evidence/pgx-binding-boundaries.md#L73) | [assessment-evidence/pgx-binding-boundaries.md:330](../../assessment-evidence/pgx-binding-boundaries.md#L330) | Cite specific weak oracles, not a blanket claim that pgx tests lack cardinality checks. |
| low | [assessment-evidence/pgx-binding-boundaries.md:160](../../assessment-evidence/pgx-binding-boundaries.md#L160) | [assessment-evidence/pgx-binding-boundaries.md:174](../../assessment-evidence/pgx-binding-boundaries.md#L174) | The template import mismatch is not a broken generation pipeline. |
| low | [assessment-evidence/pgx-binding-boundaries.md:315](../../assessment-evidence/pgx-binding-boundaries.md#L315) | [assessment-evidence/pgx-binding-boundaries.md:318](../../assessment-evidence/pgx-binding-boundaries.md#L318) | tsvector has a default registered codec in pgx; there is no negative registration finding. |
| low | [assessment-evidence/pgx-binding-boundaries.md:440](../../assessment-evidence/pgx-binding-boundaries.md#L440) | [assessment-evidence/pgx-binding-boundaries.md:433](../../assessment-evidence/pgx-binding-boundaries.md#L433) | Typed nil handling depends on the Valuer; do not assume NULL. |
| low | [assessment-evidence/continuation-exhaustion.md:421](../../assessment-evidence/continuation-exhaustion.md#L421) | [assessment-evidence/continuation-exhaustion.md:597](../../assessment-evidence/continuation-exhaustion.md#L597) | Library-level redaction does not describe what OpenFGA logs; check application logger config. |
| low | [toolchain/go-material-review.md:429](../../toolchain/go-material-review.md#L429) | [toolchain/go-material-review.md:425](../../toolchain/go-material-review.md#L425) | Misleading return contract only. |
| low | [toolchain/go-material-review.md:1945](../../toolchain/go-material-review.md#L1945) | [toolchain/go-material-review.md:1949](../../toolchain/go-material-review.md#L1949) | Checksum package findings apply to UploadPart/PutObject, with different trailer placement. |
| low | [security-landscape/deep-review/zap-history.md:11](../../security-landscape/deep-review/zap-history.md#L11) | [security-landscape/deep-review/zap-history-lab.md:17](../../security-landscape/deep-review/zap-history-lab.md#L17) | Divergence confirmed for history tags; no alert-tag or report impact established. |
| low | [security-landscape/deep-review/zap-alert-persistence.md:65](../../security-landscape/deep-review/zap-alert-persistence.md#L65) | [security-landscape/deep-review/zap-history.md:59](../../security-landscape/deep-review/zap-history.md#L59) | Model.java is fully read. |
| low | [assessment-evidence/grpc-logging-evidence.md:165](../../assessment-evidence/grpc-logging-evidence.md#L165) | [assessment-evidence/grpc-logging-evidence.md:185](../../assessment-evidence/grpc-logging-evidence.md#L185) | Only two global_test assertions are vacuous; fatal exit is tested elsewhere. |
| low | [toolchain/go-material-review.md:895](../../toolchain/go-material-review.md#L895) | [toolchain/go-material-review.md:951](../../toolchain/go-material-review.md#L951) | Closed bodies may be drained (≤256KiB) and reused. |
| low | [toolchain/go-material-review.md:1411](../../toolchain/go-material-review.md#L1411) | [toolchain/go-material-review.md:1419](../../toolchain/go-material-review.md#L1419) | Do not claim a connection leak from the NopCloser wrapper alone. |
| low | [toolchain/go-material-review.md:141](../../toolchain/go-material-review.md#L141) | [toolchain/go-material-review.md:369](../../toolchain/go-material-review.md#L369) | Do not cite RecursionDetection as a loop detector. |
| low | [toolchain/go-material-review.md:783](../../toolchain/go-material-review.md#L783) | [toolchain/go-material-review.md:803](../../toolchain/go-material-review.md#L803) | Response parsing tolerates spaces in field names. |
| low | [assessment-evidence/continuation-exhaustion.md:277](../../assessment-evidence/continuation-exhaustion.md#L277) | [assessment-evidence/continuation-exhaustion.md:281](../../assessment-evidence/continuation-exhaustion.md#L281) | Cleanup targets generated containers, but those tests still provision Docker infrastructure and should not be run casually. |
| low | [assessment-evidence/deep-garak.md:97](../../assessment-evidence/deep-garak.md#L97) | [assessment-evidence/deep-garak.md:202](../../assessment-evidence/deep-garak.md#L202) | The stale-first-digest risk applies to append/rebuild paths other than rebuild_cis. |
| low | [security-landscape/deep-review/zap-reports.md:329](../../security-landscape/deep-review/zap-reports.md#L329) | [security-landscape/deep-review/zap-reports.md:342](../../security-landscape/deep-review/zap-reports.md#L342) | Template snapshots are read; runtime policy still separate. |
| low | [security-landscape/deep-review/zap-control-path.md:100](../../security-landscape/deep-review/zap-control-path.md#L100) | [security-landscape/deep-review/zap-control-path.md:98](../../security-landscape/deep-review/zap-control-path.md#L98) | Core alerts uses AlertAPI; the pagination duplicate is still an unverified prediction. |
| low | [security-landscape/deep-review/zap-network.md:127](../../security-landscape/deep-review/zap-network.md#L127) | [security-landscape/deep-review/zap-network.md:129](../../security-landscape/deep-review/zap-network.md#L129) | ZAP H2 has resource guards; total body cap remains unestablished. |
| low | [cybersecurity-firms/gmo-flatt-security.md:49](../../cybersecurity-firms/gmo-flatt-security.md#L49) | [cybersecurity-firms/takumi-github-scope-boundary.md:11](../../cybersecurity-firms/takumi-github-scope-boundary.md#L11) | Treat the App manifest as unknown, not merely queued. |
| low | [assessment-evidence/continuation-exhaustion.md:735](../../assessment-evidence/continuation-exhaustion.md#L735) | [assessment-evidence/continuation-exhaustion.md:735](../../assessment-evidence/continuation-exhaustion.md#L735) | grpc-gateway is BSD-3-Clause. |
| low | [assessment-evidence/cel-planning-provenance.md:27](../../assessment-evidence/cel-planning-provenance.md#L27) | [assessment-evidence/garak-report-fixture-evidence.md:87](../../assessment-evidence/garak-report-fixture-evidence.md#L87) | garak-report yarn.lock fully read as metadata. |
| low | [bots-swarms/coverage.md:40](../../bots-swarms/coverage.md#L40) | [bots-swarms/continuation.md:157](../../bots-swarms/continuation.md#L157) | ipMatch.json is fully read; coverage.md:40 contradicts coverage.md:3. |
| low | [assessment-evidence/deep-deepdiff.md:181](../../assessment-evidence/deep-deepdiff.md#L181) | [assessment-evidence/deep-agentdojo.md:277](../../assessment-evidence/deep-agentdojo.md#L277) | Superseded; lock fully read. |
| low | [bots-swarms/defense.md:33](../../bots-swarms/defense.md#L33) | [bots-swarms/incident-review.md:3](../../bots-swarms/incident-review.md#L3) | Use incident-review.md. |
| low | [assessment-evidence/sources.md:30](../../assessment-evidence/sources.md#L30) | [assessment-evidence/deep-deepdiff.md:131](../../assessment-evidence/deep-deepdiff.md#L131) | orderly-set 5.5.0 text inventory is fully read (no runtime). |
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
