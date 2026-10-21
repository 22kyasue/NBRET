# Scanners: ZAP, Nuclei and the NBRET adapter

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 23 findings, 24 related corrections, 7 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.control-path-real-daemon-needed`** [security-landscape/deep-review/zap-control-path.md:78](../../security-landscape/deep-review/zap-control-path.md#L78): An agent may run new real-daemon interruption experiments. **Instead:** Existing receipts cover it (zap-directory-rule.md:23-33); new scanner runs are outside the current stop (docs/research/safety-context/README.md:14).
- **`hazard.flagged-operation-cause`** [security-landscape/deep-review/zap-reports.md:81](../../security-landscape/deep-review/zap-reports.md#L81): An agent may infer which specific operation was flagged from nearby source comments, or treat 'flagged operation' as a known classification. **Instead:** The cause is unknown; 'flagged operation' wording overstated the evidence (docs/research/safety-context/README.md:33). Keep the stop, do not reconstruct it.
- **`hazard.lab-script-rerun`** [security-landscape/lab-results.md:7](../../security-landscape/lab-results.md#L7): Agent may rerun research labs as part of a reconciliation or audit task. **Instead:** Research commands are historical, not instructions (AGENTS.md); rerun only when the current task explicitly calls for it, loopback only.
- **`hazard.nbret-scanner-next-daemon-fixture`** [security-landscape/deep-review/nbret-scanner.md:41](../../security-landscape/deep-review/nbret-scanner.md#L41): An agent may launch new ZAP daemon/scanner experiments as the 'next step'. **Instead:** Done already (zap-directory-rule.md:17); scanner capability/reachability work stopped (docs/research/safety-context/README.md:14; zap-reports.md:81). Do not start new scanner runs without Kotaro's explicit instruction.
- **`hazard.nuclei-full-path-reproduce`** [security-landscape/deep-review/nuclei-input-identity.md:23](../../security-landscape/deep-review/nuclei-input-identity.md#L23): An agent may retry the blocked Nuclei build or work around Windows controls to reproduce the full engine. **Instead:** Blocked goimpacket build must not be retried (priorities.md:13; nuclei-matchers.md:3; docs/research/safety-context/README.md:11).
- **`hazard.nuclei-public-target-tests`** [security-landscape/deep-review/nuclei-execution.md:51](../../security-landscape/deep-review/nuclei-execution.md#L51): An agent may run upstream Nuclei/Fastdialer/SDK test suites that contact public DNS/HTTP targets. **Instead:** Do not run upstream suites that contact public targets (nuclei-execution.md:51; nuclei-native-network.md:31; AGENTS.md: research plans are not instructions to execute).
- **`hazard.zap-control-path-stale-unread`** [security-landscape/deep-review/zap-control-path.md:104](../../security-landscape/deep-review/zap-control-path.md#L104): An agent may believe ActiveScan/Session/AlertAPI sources are unread and restart reading or labs, or distrust the complete annotations above it. **Instead:** Files are recorded complete earlier in the same file (zap-control-path.md:43-104) and in file-queue.json; use those annotations.

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [NBRET's ZAP adapter keeps 7 alert fields, filters by origin, and drops evidence links](#scannersnbret-adapter-drops-alert-evidence) | integrated-lab | evidence, reporting, triage, retest |
| [ZAP does not enforce exact-path scope: a /allowed context also requested /allowed/](#scannerszap-path-scope-not-enforced) | integrated-lab | scoping, authorization, testing |
| [After stop, NBRET reported ZAP completed while a rule still ran; its alert came later](#scannerszap-stop-completed-before-quiescence) | integrated-lab | testing, evidence, reporting, retest |
| [NBRET adapter: lost API responses leave unstoppable scans/contexts; global passive queue](#scannersnbret-adapter-uncertain-mutations) | component-lab | testing, operations |
| [Nuclei's optional HTTP response cache keys auth headers, but its 256MiB cap is sampled](#scannersnuclei-http-cache-auth-keyed-soft-cap) | component-lab | operations, authorization |
| [Nuclei input normalization merges URLs that respond differently (slash, tracking params)](#scannersnuclei-normalization-collapses-distinct-urls) | component-lab | discovery, testing, reporting |
| [ZAP low-memory structure: node is its own parent and lookups miss query-bearing nodes](#scannerszap-lowmemory-structure-defects) | component-lab | testing, operations |
| [NBRET probe path: exact-origin URL scope, no redirect following, no retries, not a sandbox](#scannersnbret-http-path-boundaries) | source-trace | scoping, testing, evidence |
| [NBRET scope and action gates are origin/name heuristics, not side-effect guarantees](#scannersnbret-safety-gates-heuristic) | source-trace | scoping, authorization, testing |
| [Nuclei return values overstate success: nil on errors, matched=true on failed output](#scannersnuclei-completion-signals-unreliable) | source-trace | testing, evidence, reporting |
| [Nuclei network policy is a denylist; same-scheme redirects can reach other hosts](#scannersnuclei-network-policy-is-denylist) | source-trace | scoping, authorization, testing |
| [Nuclei OpenAPI/Swagger ingestion keeps spec servers and generates state-changing requests](#scannersnuclei-openapi-ingestion-scope) | source-trace | scoping, discovery, testing |
| [Nuclei replay proxy resends matched requests, including state-changing ones, with auth](#scannersnuclei-replay-resends-requests) | source-trace | testing, evidence |
| [Nuclei templates are code: imports read before signature check, Flow JS has no deadline](#scannersnuclei-template-code-trust) | source-trace | testing, operations |
| [Synapse CE basic pattern SAST has explicit caps; optional taint/reachability are separate](#scannerssynapse-ce-basic-sast-pattern-and-coverage-limits) | source-trace | testing, reporting, ai-evaluation |
| [Synapse CE chained execution uses a labelled no-host rehearsal executor](#scannerssynapse-ce-chain-executor-is-simulation) | source-trace | testing, reporting, ai-evaluation |
| [Several ZAP upstream tests do not check what their names claim](#scannersupstream-test-names-overstate) | source-trace | testing, operations |
| [ZAP attack mode checks scope when queuing, not again before scanning](#scannerszap-attack-mode-scope-not-rechecked) | source-trace | scoping, testing |
| [Omitting a ZAP policy name does not give a reproducible rule set](#scannerszap-policy-provenance) | source-trace | testing, retest, evidence |
| [ZAP's HTTP client treats every request as idempotent; tests expect POST/DELETE retried 5x](#scannerszap-retries-mutating-requests) | source-trace | testing, scoping, operations |
| [A ZAP alert is the rule's own signature judgment; no independent validation occurs](#scannerszap-rule-alert-is-signature) | source-trace | triage, testing, reporting |
| [ZAP's HTTP send path has no initial-destination authorization check](#scannerszap-sender-no-destination-check) | source-trace | scoping, authorization, testing |
| [ZAP reports progress 100 and state FINISHED for a stopped scan](#scannerszap-stopped-scan-reports-100) | source-trace | testing, evidence, reporting |

### scannersnbret-adapter-drops-alert-evidence

**`scanners.nbret-adapter-drops-alert-evidence`: NBRET's ZAP adapter keeps 7 alert fields, filters by origin, and drops evidence links** (integrated-lab)

zap.mjs retrieves up to 1,000 alert summaries per origin, filters exact origins only and projects seven identifying/severity fields; URL-path scope, scan ID, message ID, alert ID, parameter, evidence and request/response are dropped. The simulated-API lab kept a same-origin /outside alert for an /allowed scope, and the real daemon run showed upstream evidence, messageId and sourceMessageId discarded.

**Do:** Retain native alert IDs, message IDs, evidence and the exact request/response for every reported finding, and filter by the engagement's real scope, so findings can be verified and retested.

**Limits:** Adapter projection behavior; does not show the real scanner attacked out-of-scope hosts.

**Sources:** [security-landscape/deep-review/nbret-scanner.md:25](../../security-landscape/deep-review/nbret-scanner.md#L25), [security-landscape/deep-review/nbret-scanner.md:41](../../security-landscape/deep-review/nbret-scanner.md#L41), [security-landscape/deep-review/zap-directory-rule.md:19](../../security-landscape/deep-review/zap-directory-rule.md#L19)

**Receipts:** `security-landscape/deep-review/scanner-adapter-lab-receipt.json`, `security-landscape/deep-review/real-zap-lab-receipt.json`

### scannerszap-path-scope-not-enforced

**`scanners.zap-path-scope-not-enforced`: ZAP does not enforce exact-path scope: a /allowed context also requested /allowed/** (integrated-lab)

On a real ZAP 2.17.0 daemon (ascanrules 78, only directory-browsing rule 0 enabled) with an NBRET context for /allowed (scopeMode=urls, recurse=false), the rule removed the query, appended a slash and requested /allowed/. The candidate node is scope-checked before scheduling, but the rule-crafted initial URI is not; only redirects are validated. Both repeated normal runs did the same, and NBRET kept the /allowed/ alert because its own filter is origin-only.

**Do:** Do not rely on ZAP context/URL scope as an authorization boundary for a client engagement: enforce scope outside the scanner (egress allowlist/proxy) and record what was actually requested. Treat any path-level scope promise to a client as unenforced unless externally verified.

**Limits:** One rule, owned loopback fixture, four runs total; not a measured rate across rules or a third-party scope escape.

**Sources:** [security-landscape/deep-review/zap-directory-rule.md:17](../../security-landscape/deep-review/zap-directory-rule.md#L17), [security-landscape/deep-review/zap-directory-rule.md:19](../../security-landscape/deep-review/zap-directory-rule.md#L19), [security-landscape/deep-review/zap-directory-rule.md:33](../../security-landscape/deep-review/zap-directory-rule.md#L33)

**Receipts:** `security-landscape/deep-review/real-zap-lab-receipt.json`, `security-landscape/deep-review/real-zap-repeats.json`, `security-landscape/deep-review/receipts/normal-1.json`

**Contrary or narrowing evidence:**
- [security-landscape/deep-review/zap-network.md:204](../../security-landscape/deep-review/zap-network.md#L204): Candidate-node scope is enforced; the gap is the rule-crafted destination, not node selection.

### scannerszap-stop-completed-before-quiescence

**`scanners.zap-stop-completed-before-quiescence`: After stop, NBRET reported ZAP completed while a rule still ran; its alert came later** (integrated-lab)

In two real-daemon interruption runs, the known scan was stopped while the rewritten /allowed/ response was delayed 2500 ms. ActiveScan status returned 100, NBRET wrote completed with errors=[] and contextRemoved=true and returned while the fixture response was still pending; at return the scans view showed FINISHED with reqCount 0/alertCount 0 and rule progress 99%. About 3 s later the scan showed 1 request/1 alert and the directory alert (messageId 4) existed upstream, absent from NBRET's report.

**Do:** Do not treat status 100, FINISHED, a completed adapter status or context removal as quiescence. Before issuing a client report, wait for and verify worker quiescence (per-rule state, request counts) and re-collect alerts, or label the result as interrupted.

**Limits:** Two stop runs, one rule, owned loopback; does not prove all rules continue after stop or that new requests start after stop.

**Sources:** [security-landscape/deep-review/zap-directory-rule.md:25](../../security-landscape/deep-review/zap-directory-rule.md#L25), [security-landscape/deep-review/zap-directory-rule.md:27](../../security-landscape/deep-review/zap-directory-rule.md#L27), [security-landscape/deep-review/zap-directory-rule.md:33](../../security-landscape/deep-review/zap-directory-rule.md#L33)

**Receipts:** `security-landscape/deep-review/real-zap-stop-receipt.json`, `security-landscape/deep-review/receipts/stop-1.json`, `security-landscape/deep-review/real-zap-repeats.json`

**Contrary or narrowing evidence:**
- [security-landscape/deep-review/zap-directory-rule.md:27](../../security-landscape/deep-review/zap-directory-rule.md#L27): Scope of the result is one rule and timing case.

### scannersnbret-adapter-uncertain-mutations

**`scanners.nbret-adapter-uncertain-mutations`: NBRET adapter: lost API responses leave unstoppable scans/contexts; global passive queue** (component-lab)

In the simulated-API lab, a scan started server-side whose response was lost left no scan ID, so the adapter removed the context but never stopped the scan; a context created but whose response was lost was never removed although its generated name was known. A permanently nonempty passive queue timed the run out after about one second with no owned active scan, because the queue count has no context or scan identity.

**Do:** Use owned daemons per engagement, reconcile by known names after lost responses, and treat shared-daemon passive-queue waits as unreliable completion signals.

**Limits:** Simulated API transport; real daemon state after response loss untested.

**Sources:** [security-landscape/deep-review/nbret-scanner.md:43](../../security-landscape/deep-review/nbret-scanner.md#L43), [security-landscape/deep-review/nbret-scanner.md:45](../../security-landscape/deep-review/nbret-scanner.md#L45), [security-landscape/deep-review/nbret-scanner.md:47](../../security-landscape/deep-review/nbret-scanner.md#L47)

**Receipts:** `security-landscape/deep-review/scanner-adapter-lab-receipt.json`

### scannersnuclei-http-cache-auth-keyed-soft-cap

**`scanners.nuclei-http-cache-auth-keyed-soft-cap`: Nuclei's optional HTTP response cache keys auth headers, but its 256MiB cap is sampled** (component-lab)

The optional RFC-style HTTP cache (only when EnableHTTPCache) keys Authorization, Cookie, Accept*, Origin with Vary separation and skips server errors. Its budget is checked only on the first and every 32nd write; an extracted-function lab saw 2 rejections and 31 admissions over 33 checks with a 100-byte file against a 50-byte cap, and memory fallback admitted an oversized record.

**Do:** Not every Nuclei cache is identity-blind; still budget disk/memory externally if enabling it.

**Limits:** Decision functions only; no exhaustion test.

**Sources:** [security-landscape/deep-review/nuclei-output.md:41](../../security-landscape/deep-review/nuclei-output.md#L41), [security-landscape/deep-review/nuclei-http-cache-budget-lab.md:9](../../security-landscape/deep-review/nuclei-http-cache-budget-lab.md#L9)

**Receipts:** `security-landscape/deep-review/nuclei-http-cache-budget-lab-receipt.json`

### scannersnuclei-normalization-collapses-distinct-urls

**`scanners.nuclei-normalization-collapses-distinct-urls`: Nuclei input normalization merges URLs that respond differently (slash, tracking params)** (component-lab)

Upstream normalize/fingerprint tests plus two owned-loopback overlays: /private and /private/ (403 vs 200) and utm_source=A/B (different bodies) collapsed to one key, while id=A/B stayed distinct. Twenty top-level tests passed. The optional structural cap samples same-shape endpoints.

**Do:** Disable normalization or capping when coverage matters, and never report deduplicated or same-shape counts as all endpoints assessed.

**Limits:** One run with synthetic servers; not a measured miss rate.

**Sources:** [security-landscape/deep-review/nuclei-normalization-lab.md:5](../../security-landscape/deep-review/nuclei-normalization-lab.md#L5), [security-landscape/deep-review/nuclei-input-identity.md:31](../../security-landscape/deep-review/nuclei-input-identity.md#L31)

**Receipts:** `security-landscape/deep-review/nuclei-normalization-lab-receipt.json`

### scannerszap-lowmemory-structure-defects

**`scanners.zap-lowmemory-structure-defects`: ZAP low-memory structure: node is its own parent and lookups miss query-bearing nodes** (component-lab)

With installed classes and a fresh in-memory table, StructuralTableNode.getParent returned a node with the same structureId and child count returned 2 siblings for a leaf; a query-bearing inserted host was saved with a duplicated parameter summary and the public lookup returned null, while a parameter-free control was found. Both were repeated.

**Do:** If running ZAP in low-memory mode, validate traversal/coverage on a known fixture; HostProcess related-sibling selection uses getParent.

**Limits:** Isolated component runs; scanner/report impact unproven; context-only low-memory scans are rejected.

**Sources:** [security-landscape/deep-review/zap-structure-lab.md:7](../../security-landscape/deep-review/zap-structure-lab.md#L7), [security-landscape/deep-review/zap-structure-name-lab.md:7](../../security-landscape/deep-review/zap-structure-name-lab.md#L7)

**Receipts:** `security-landscape/deep-review/zap-structure-lab-receipt.json`, `security-landscape/deep-review/zap-structure-name-lab-receipt.json`

**Contrary or narrowing evidence:**
- [security-landscape/deep-review/zap-history.md:121](../../security-landscape/deep-review/zap-history.md#L121): Limits which scans can reach the defective wrapper.

### scannersnbret-http-path-boundaries

**`scanners.nbret-http-path-boundaries`: NBRET probe path: exact-origin URL scope, no redirect following, no retries, not a sandbox** (source-trace)

Complete reads of scope.mjs, http.mjs, probe.mjs, assertions.mjs and checks.mjs: scope requires exact scheme/host/port origins (no implicit subdomains) but is URL selection, not DNS/IP egress enforcement; http.mjs has no allowlist of its own (callers must enforce scope), no redirect loop and no retry; probe records redirect scope without following; missing/redacted structured bodies yield unavailable not pass; contract grouping omits query and identity; the evidence hash is over cleaned body content, not raw bytes. Lab: redirect destination received zero requests; write-without-opt-in and out-of-origin cases rejected before sending.

**Do:** Treat NBRET scope as a request-selection gate; add network egress controls for anything beyond loopback. A GET still may have server-side effects. Hashes do not prove origin.

**Limits:** Source reads at working-tree hashes plus loopback lab; DNS rebinding and IP transitions untested.

**Sources:** [security-landscape/implementation-reviews.md:19](../../security-landscape/implementation-reviews.md#L19), [security-landscape/implementation-reviews.md:27](../../security-landscape/implementation-reviews.md#L27), [security-landscape/implementation-reviews.md:45](../../security-landscape/implementation-reviews.md#L45), [security-landscape/lab-results.md:25](../../security-landscape/lab-results.md#L25)

**Receipts:** `security-landscape/lab-followup-receipt.json`, `security-landscape/test-receipt.json`

**Contrary or narrowing evidence:**
- [security-landscape/implementation-reviews.md:45](../../security-landscape/implementation-reviews.md#L45): Redaction is key-name based and incomplete.

### scannersnbret-safety-gates-heuristic

**`scanners.nbret-safety-gates-heuristic`: NBRET scope and action gates are origin/name heuristics, not side-effect guarantees** (source-trace)

NBRET scope is explicit credential-free URL origin only (no DNS/IP pinning, principal or path scope); the probe write gate is a method gate, not proof a GET has no side effects; interaction and discovery deny-words are heuristics. The ZAP setup verifies download bytes but the runtime does not rehash the installed JAR/addons.

**Do:** Obtain explicit authorization for every action class and verify scope at the network layer; do not present NBRET's gates as safety guarantees to clients.

**Limits:** Source reading of the prototype.

**Sources:** [security-landscape/deep-review/nbret-checks-identity.md:7](../../security-landscape/deep-review/nbret-checks-identity.md#L7), [security-landscape/deep-review/nbret-checks-identity.md:11](../../security-landscape/deep-review/nbret-checks-identity.md#L11), [security-landscape/deep-review/nbret-scanner.md:11](../../security-landscape/deep-review/nbret-scanner.md#L11)

### scannersnuclei-completion-signals-unreliable

**`scanners.nuclei-completion-signals-unreliable`: Nuclei return values overstate success: nil on errors, matched=true on failed output** (source-trace)

Generic and multiprotocol executors log protocol errors and return nil; the writer sets matched=true for any iterated result even when output fails or honeypot suppression applies; Flow progress counts skipped branches as processed; the self-contained branch sets match=true with zero results; executors set Completed even after cancellation. A connection reset during raw sending is converted to a synthetic empty 400 treated as sent.

**Do:** Collect Nuclei's error stream, scan context and per-target results; do not use return codes, match booleans or progress as coverage or success.

**Limits:** Source reading; no full-engine run in research.

**Sources:** [security-landscape/deep-review/nuclei-execution.md:13](../../security-landscape/deep-review/nuclei-execution.md#L13), [security-landscape/deep-review/nuclei-execution.md:29](../../security-landscape/deep-review/nuclei-execution.md#L29), [security-landscape/deep-review/nuclei-input-identity.md:57](../../security-landscape/deep-review/nuclei-input-identity.md#L57), [security-landscape/deep-review/nuclei-input-identity.md:193](../../security-landscape/deep-review/nuclei-input-identity.md#L193)

### scannersnuclei-network-policy-is-denylist

**`scanners.nuclei-network-policy-is-denylist`: Nuclei network policy is a denylist; same-scheme redirects can reach other hosts** (source-trace)

Nuclei protocolstate configures NetworkPolicy as a denylist (optional private-range denial), not an engagement allowlist. Same-scheme redirect mode permits other hosts and ports; IsOriginScoped is a request-equivalence classification; the headless policy check returns allowed when the execution registry is missing. The client deliberately accepts untrusted certificates and TLS 1.0.

**Do:** Constrain Nuclei with an external egress allowlist and disable cross-host redirects for scoped engagements; a successful TLS connection is not certificate validation.

**Limits:** Source reading; no scope escape demonstrated.

**Sources:** [security-landscape/deep-review/nuclei-http-path.md:65](../../security-landscape/deep-review/nuclei-http-path.md#L65), [security-landscape/deep-review/nuclei-http-path.md:57](../../security-landscape/deep-review/nuclei-http-path.md#L57), [security-landscape/deep-review/nuclei-http-path.md:113](../../security-landscape/deep-review/nuclei-http-path.md#L113), [security-landscape/deep-review/nuclei-http-path.md:57](../../security-landscape/deep-review/nuclei-http-path.md#L57)

### scannersnuclei-openapi-ingestion-scope

**`scanners.nuclei-openapi-ingestion-scope`: Nuclei OpenAPI/Swagger ingestion keeps spec servers and generates state-changing requests** (source-trace)

The OpenAPI downloader only injects the download origin when the spec has no servers; existing servers are preserved and not constrained, and Swagger keeps existing host/schemes. The generator walks every operation including state-changing methods and has auth-composition quirks (only the first matching scheme per requirement).

**Do:** Review spec server URLs against scope before scanning and filter destructive operations; generated inventories are not read-only traffic.

**Limits:** Source reading; no generated requests sent.

**Sources:** [security-landscape/deep-review/nuclei-input-identity.md:155](../../security-landscape/deep-review/nuclei-input-identity.md#L155), [security-landscape/deep-review/nuclei-input-identity.md:167](../../security-landscape/deep-review/nuclei-input-identity.md#L167)

### scannersnuclei-replay-resends-requests

**`scanners.nuclei-replay-resends-requests`: Nuclei replay proxy resends matched requests, including state-changing ones, with auth** (source-trace)

When ReplayProxy is configured, Nuclei replays a matched request once through a separate stdlib transport (no custom dialer/scope wrapper installed there), discards the response and keeps dumped auth headers. This is extra network activity, not validation, and can repeat state-changing methods.

**Do:** Leave replay off for client work unless the duplicate traffic and credential exposure to the proxy are explicitly authorized.

**Limits:** Source reading; not run.

**Sources:** [security-landscape/deep-review/nuclei-output.md:65](../../security-landscape/deep-review/nuclei-output.md#L65)

### scannersnuclei-template-code-trust

**`scanners.nuclei-template-code-trust`: Nuclei templates are code: imports read before signature check, Flow JS has no deadline** (source-trace)

Template compilation reads imported files before signature verification, executes verified JS init during compilation, and Flow JS runs without a visible runtime interrupt/deadline. Removing Goja eval is not a sandbox, and ytt evaluation runs in-process.

**Do:** Only run reviewed or signed templates from controlled sources, and run the scanner in an isolated, resource-limited environment.

**Limits:** Source reading; no malicious template executed.

**Sources:** [security-landscape/deep-review/nuclei-template-path.md:29](../../security-landscape/deep-review/nuclei-template-path.md#L29), [security-landscape/deep-review/nuclei-execution.md:43](../../security-landscape/deep-review/nuclei-execution.md#L43), [security-landscape/deep-review/nuclei-http-path.md:113](../../security-landscape/deep-review/nuclei-http-path.md#L113)

**Receipts:** `security-landscape/deep-review/nuclei-render-lab-receipt.json`

**Contrary or narrowing evidence:**
- [security-landscape/deep-review/nuclei-http-path.md:107](../../security-landscape/deep-review/nuclei-http-path.md#L107): Render tests (15 passing) show runtime data is not re-evaluated as template code.

### scannerssynapse-ce-basic-sast-pattern-and-coverage-limits

**`scanners.synapse-ce-basic-sast-pattern-and-coverage-limits`: Synapse CE basic pattern SAST has explicit caps; optional taint/reachability are separate** (source-trace)

The basic SAST analyzer is a bounded pattern scanner, with a 500-finding aggregate cap, 50 per file, a 1 MiB ordinary-file cap and skipped long/minified/generated/dependency content; it is not the separate call-graph or taint engine.

**Do:** Retain engine/configuration and skipped/truncated coverage; do not call basic pattern output a full semantic audit.

**Limits:** Pinned source/documentation reading; precision, throughput and optional analyzer correctness not evaluated.

**Sources:** [security-landscape/art-external-platforms-20261020.md:23](../../security-landscape/art-external-platforms-20261020.md#L23)

### scannerssynapse-ce-chain-executor-is-simulation

**`scanners.synapse-ce-chain-executor-is-simulation`: Synapse CE chained execution uses a labelled no-host rehearsal executor** (source-trace)

The inspected exploitation SimulationExecutor performs no host action and returns a labelled simulated success; its verifier confirms rehearsal completion, not a real exploit. The source deliberately provides no real host executor in that module.

**Do:** Separate rehearsal workflow acceptance from real execution and effect evidence; evaluate scanner modules on their own merits.

**Limits:** Pinned source reading only; not every network or optional response lane is simulated. No project code executed.

**Sources:** [security-landscape/art-external-platforms-20261020.md:15](../../security-landscape/art-external-platforms-20261020.md#L15)

### scannersupstream-test-names-overstate

**`scanners.upstream-test-names-overstate`: Several ZAP upstream tests do not check what their names claim** (source-trace)

Examples found by reading: an H2 body assertion compares the expected string with itself; listener tests create successor listeners but never register them; SarifBigContentShrinker parameterized cases ignore their limit and expected values; a JSON-plus test checks instance 0 twice; an 'invalid port' test passes no parameter.

**Do:** When relying on a tool's tests as quality evidence, read the assertions; test existence or names are not coverage.

**Limits:** Test-oracle defects, not demonstrated implementation bugs.

**Sources:** [security-landscape/deep-review/zap-network.md:135](../../security-landscape/deep-review/zap-network.md#L135), [security-landscape/deep-review/zap-reports.md:53](../../security-landscape/deep-review/zap-reports.md#L53), [security-landscape/deep-review/zap-network.md:164](../../security-landscape/deep-review/zap-network.md#L164)

### scannerszap-attack-mode-scope-not-rechecked

**`scanners.zap-attack-mode-scope-not-rechecked`: ZAP attack mode checks scope when queuing, not again before scanning** (source-trace)

AttackModeScanner enqueues in-scope nodes on discovery events, but workers do not recheck current scope or mode before starting each queued node; stop clears the queue without joining scanner threads. Attack mode is an explicit setting, not triggered by proxying alone.

**Do:** Avoid attack mode for scoped client work, or verify scope changes take effect before continuing.

**Limits:** Source reading; mode never enabled.

**Sources:** [security-landscape/deep-review/zap-network.md:174](../../security-landscape/deep-review/zap-network.md#L174)

### scannerszap-policy-provenance

**`scanners.zap-policy-provenance`: Omitting a ZAP policy name does not give a reproducible rule set** (source-trace)

PolicyManager falls back through configured, localized default, first available and new policy; NBRET passes no policy name, auth method or user. Installed addon filenames matched official tags, but tag matching is candidate provenance, not a reproducible build.

**Do:** Record the effective policy, enabled rules, thresholds/strengths and addon versions/hashes with every scan so retests are comparable.

**Limits:** Source reading.

**Sources:** [security-landscape/deep-review/zap-control-path.md:37](../../security-landscape/deep-review/zap-control-path.md#L37), [security-landscape/deep-review/zap-control-path.md:88](../../security-landscape/deep-review/zap-control-path.md#L88)

### scannerszap-retries-mutating-requests

**`scanners.zap-retries-mutating-requests`: ZAP's HTTP client treats every request as idempotent; tests expect POST/DELETE retried 5x** (source-trace)

The network addon's HttpSenderContextApache overrides handleAsIdempotent to return true for every request, so POST/PATCH/DELETE may be resent after eligible IO failures; the upstream HttpSenderImplUnitTest expects five received requests for every parameterized method including POST/PATCH/DELETE. Separately, BaseHttpSender re-authenticates and sends once more when the auth predicate says unauthenticated.

**Do:** When scanning production or stateful client systems, assume state-changing requests can be duplicated; agree on non-production targets or disable retries, and account for duplicates in rate limits and side-effect cleanup.

**Limits:** Source and unexecuted test reading; Apache exception filtering not reviewed; no wire retry observed in research.

**Sources:** [security-landscape/deep-review/zap-network.md:45](../../security-landscape/deep-review/zap-network.md#L45), [security-landscape/deep-review/zap-network-tests.md:11](../../security-landscape/deep-review/zap-network-tests.md#L11), [security-landscape/deep-review/zap-network.md:14](../../security-landscape/deep-review/zap-network.md#L14)

### scannerszap-rule-alert-is-signature

**`scanners.zap-rule-alert-is-signature`: A ZAP alert is the rule's own signature judgment; no independent validation occurs** (source-trace)

The directory-browsing rule raises medium/low-confidence alerts from body text signatures (e.g., 'Parent Directory') after a 2xx response and silently ignores IOExceptions; HostProcess trusts rule-created Alert objects and Alert.Builder never verifies evidence. 'Confirmed' confidence is a data label.

**Do:** Every scanner alert needs analyst validation of impact before it becomes a client finding.

**Limits:** One rule traced in full; others not.

**Sources:** [security-landscape/deep-review/zap-directory-rule.md:9](../../security-landscape/deep-review/zap-directory-rule.md#L9), [security-landscape/deep-review/zap-control-path.md:62](../../security-landscape/deep-review/zap-control-path.md#L62)

### scannerszap-sender-no-destination-check

**`scanners.zap-sender-no-destination-check`: ZAP's HTTP send path has no initial-destination authorization check** (source-trace)

Source trace of ZAP core 2.17.0 AbstractPlugin and the network addon 0.25.0 BaseHttpSender/HttpSenderApache finds no predicate that checks a rule's first request destination against scope; scope is checked on candidate nodes and on redirect hops. Each rule decides what it sends.

**Do:** Scope compliance must be provided by network isolation or an intercepting allowlist, not by scanner configuration alone; scope evidence in deliverables should come from observed traffic.

**Limits:** Source reading only; lower layers and every installed rule were not exhaustively traced.

**Sources:** [security-landscape/deep-review/zap-network.md:41](../../security-landscape/deep-review/zap-network.md#L41), [security-landscape/deep-review/zap-control-path.md:90](../../security-landscape/deep-review/zap-control-path.md#L90)

### scannerszap-stopped-scan-reports-100

**`scanners.zap-stopped-scan-reports-100`: ZAP reports progress 100 and state FINISHED for a stopped scan** (source-trace)

ZAP ActiveScanAPI returns numeric status 100 when a scan isStopped, and ActiveScan maps any started stopped scan to FINISHED; Scanner emits COMPLETED from the same finally path even after caught engine exceptions. NBRET's numeric-only polling loop cannot tell interruption from full execution (adapter lab: completed after 11 API calls, no per-rule progress requested).

**Do:** Collect per-rule progress (pending/running/completed/skipped with reasons), request counts, stop history and engine errors; never derive 'scan complete' from the status number.

**Limits:** Source trace plus an in-memory adapter simulation; real interruption behavior is covered by the separate real-daemon finding.

**Sources:** [security-landscape/deep-review/nbret-scanner.md:49](../../security-landscape/deep-review/nbret-scanner.md#L49), [security-landscape/deep-review/zap-control-path.md:45](../../security-landscape/deep-review/zap-control-path.md#L45), [security-landscape/deep-review/zap-control-path.md:47](../../security-landscape/deep-review/zap-control-path.md#L47)

**Receipts:** `security-landscape/deep-review/terminal-state-lab-receipt.json`

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| high | [security-landscape/lab-results.md:31](../../security-landscape/lab-results.md#L31) | [security-landscape/lab-receipt.json:153](../../security-landscape/lab-receipt.json#L153) | Legacy checks.mjs offline matching still ignores identity; only src/assessment has identity/session checks, and those labels are operator-declared. |
| high | [security-landscape/deep-review/zap-reports.md:29](../../security-landscape/deep-review/zap-reports.md#L29) | [security-landscape/deep-review/zap-reports.md:43](../../security-landscape/deep-review/zap-reports.md#L43) | SARIF artifacts preserve cookies/API keys/bodies; only Authorization is masked. |
| high | [security-landscape/deep-review/zap-reports.md:11](../../security-landscape/deep-review/zap-reports.md#L11) | [security-landscape/deep-review/zap-context.md:17](../../security-landscape/deep-review/zap-context.md#L17) | Context exclusions do not remove alerts from ZAP reports. |
| high | [security-landscape/deep-review/zap-network.md:45](../../security-landscape/deep-review/zap-network.md#L45) | [security-landscape/deep-review/zap-network-tests.md:11](../../security-landscape/deep-review/zap-network-tests.md#L11) | ZAP intentionally retries mutating methods on IO failure. |
| high | [security-landscape/deep-review/nbret-scanner.md:41](../../security-landscape/deep-review/nbret-scanner.md#L41) | [security-landscape/deep-review/zap-directory-rule.md:17](../../security-landscape/deep-review/zap-directory-rule.md#L17) | Out-of-path request and alert retention are runtime-observed on a real daemon. |
| high | [security-landscape/deep-review/nbret-scanner.md:49](../../security-landscape/deep-review/nbret-scanner.md#L49) | [security-landscape/deep-review/zap-directory-rule.md:25](../../security-landscape/deep-review/zap-directory-rule.md#L25) | Treat stop-as-completed as runtime-confirmed for this scenario; nbret-scanner.md SC-05 was never back-annotated. |
| medium | [security-landscape/deep-review/nuclei-http-path.md:37](../../security-landscape/deep-review/nuclei-http-path.md#L37) | [security-landscape/deep-review/nuclei-http-path.md:75](../../security-landscape/deep-review/nuclei-http-path.md#L75) | Cache replay of pre-auth bytes is confirmed at component level only. |
| medium | [security-landscape/deep-review/zap-reports.md:356](../../security-landscape/deep-review/zap-reports.md#L356) | [security-landscape/deep-review/zap-reports.md:382](../../security-landscape/deep-review/zap-reports.md#L382) | Assume the exit override persists across plans in one process. |
| medium | [security-landscape/deep-review/zap-reports.md:13](../../security-landscape/deep-review/zap-reports.md#L13) | [security-landscape/deep-review/zap-report-filter-lab.md:7](../../security-landscape/deep-review/zap-report-filter-lab.md#L7) | Fail-open confirmed under injection; target-triggerability unknown. |
| medium | [security-landscape/deep-review/nuclei-output.md:19](../../security-landscape/deep-review/nuclei-output.md#L19) | [security-landscape/deep-review/nuclei-output-lab.md:5](../../security-landscape/deep-review/nuclei-output-lab.md#L5) | Sink order and fail-fast are component-confirmed. |
| medium | [security-landscape/deep-review/nbret-scanner.md:56](../../security-landscape/deep-review/nbret-scanner.md#L56) | [security-landscape/deep-review/nbret-scanner.md:54](../../security-landscape/deep-review/nbret-scanner.md#L54) | The reporting gap is runtime-confirmed with synthetic inputs. |
| medium | [security-landscape/deep-review/zap-control-path.md:78](../../security-landscape/deep-review/zap-control-path.md#L78) | [security-landscape/deep-review/zap-control-path.md:108](../../security-landscape/deep-review/zap-control-path.md#L108) | Interruption timing is runtime-observed; specific engine exception paths remain source-only. |
| medium | [security-landscape/coverage.md:52](../../security-landscape/coverage.md#L52) | [security-landscape/coverage.md:76](../../security-landscape/coverage.md#L76) | Use the latest checkpoint and deep-review files for current reading state. |
| medium | [security-landscape/deep-review/zap-network.md:200](../../security-landscape/deep-review/zap-network.md#L200) | [security-landscape/deep-review/zap-network.md:204](../../security-landscape/deep-review/zap-network.md#L204) | Filter failures do not bypass node scope; scope gaps come from crafted destinations instead. |
| medium | [security-landscape/deep-review/zap-control-path.md:54](../../security-landscape/deep-review/zap-control-path.md#L54) | [security-landscape/deep-review/zap-control-path.md:92](../../security-landscape/deep-review/zap-control-path.md#L92) | Do not claim ZAP strips auth headers from all scanner requests. |
| medium | [security-landscape/deep-review/zap-history.md:97](../../security-landscape/deep-review/zap-history.md#L97) | [security-landscape/deep-review/zap-history.md:121](../../security-landscape/deep-review/zap-history.md#L121) | Defect is component-confirmed but reachability is limited; no scan impact shown. |
| medium | [security-landscape/deep-review/nuclei-native-network.md:7](../../security-landscape/deep-review/nuclei-native-network.md#L7) | [security-landscape/deep-review/nuclei-native-network.md:27](../../security-landscape/deep-review/nuclei-native-network.md#L27) | Scheme/port concerns are library-API only, not Nuclei dialer behavior. |
| medium | [review-findings.json:151](../../review-findings.json#L151) | [2026-10-16-rea-and-security-workflows.md:232](../../2026-10-16-rea-and-security-workflows.md#L232) | Follow the Markdown order: existing NBRET checks before any new scanner. |
| low | [2026-10-16-rea-and-security-workflows.md:178](../../2026-10-16-rea-and-security-workflows.md#L178) | [security-landscape/implementation-reviews.md:95](../../security-landscape/implementation-reviews.md#L95) | Use implementation-reviews.md for garak evaluator behavior. |
| low | [security-landscape/deep-review/zap-reports.md:329](../../security-landscape/deep-review/zap-reports.md#L329) | [security-landscape/deep-review/zap-reports.md:342](../../security-landscape/deep-review/zap-reports.md#L342) | Template snapshots are read; runtime policy still separate. |
| low | [security-landscape/deep-review/zap-control-path.md:100](../../security-landscape/deep-review/zap-control-path.md#L100) | [security-landscape/deep-review/zap-control-path.md:98](../../security-landscape/deep-review/zap-control-path.md#L98) | Core alerts uses AlertAPI; the pagination duplicate is still an unverified prediction. |
| low | [security-landscape/deep-review/zap-network.md:127](../../security-landscape/deep-review/zap-network.md#L127) | [security-landscape/deep-review/zap-network.md:129](../../security-landscape/deep-review/zap-network.md#L129) | ZAP H2 has resource guards; total body cap remains unestablished. |
| low | [security-landscape/deep-review/nuclei-input-identity.md:71](../../security-landscape/deep-review/nuclei-input-identity.md#L71) | [security-landscape/deep-review/nuclei-input-identity.md:89](../../security-landscape/deep-review/nuclei-input-identity.md#L89) | Cross-run origin suppression is only a concern for reused SDK instances. |
| low | [security-landscape/deep-review/nuclei-template-path.md:7](../../security-landscape/deep-review/nuclei-template-path.md#L7) | [security-landscape/deep-review/nuclei-template-path.md:13](../../security-landscape/deep-review/nuclei-template-path.md#L13) | Template cache checks mtime, not content. |
