# Interception proxies: mitmproxy, TLS, HTTP/2, HAR

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 4 findings, 47 related corrections, 7 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.go-flagged-operation-wording`** [toolchain/go-material-review.md:9](../../toolchain/go-material-review.md#L9): Agent infers a specific recovered safety warning or rejected call behind repeated "flagged operation" phrases, or guesses what it was. **Instead:** Treat it as a conservative stop instruction with unknown cause; do not infer or retry (safety-context/README.md:33).
- **`hazard.go-integration-tests-live`** [toolchain/go-material-review.md:1350](../../toolchain/go-material-review.md#L1350): Agent runs upstream SDK integration/perf tests that load AWS config and create/delete real buckets. **Instead:** Do not run; go-material-review.md:1348 heading says do not run; research is source-only.
- **`hazard.go-jsonschema-example-network`** [toolchain/go-material-review.md:1200](../../toolchain/go-material-review.md#L1200): Agent runs `go test` on jsonschema and triggers an outbound GitHub request. **Instead:** Run nothing without containment review; filter tests.
- **`hazard.go-partial-file-status`** [toolchain/go-material-review.md:1379](../../toolchain/go-material-review.md#L1379): Agent reports api_client.go as partially reviewed. **Instead:** Completed at go-material-review.md:1391 (1–1372).
- **`hazard.go-prioritized-queue-outdated`** [toolchain/go-material-review.md:1118](../../toolchain/go-material-review.md#L1118): Agent takes the old "Prioritized unread queue" as current next work. **Instead:** Queue was completed later (S3 manager closure go-material-review.md:1361; serializers go-material-review.md:1623); verify in go-material-queue.json.
- **`hazard.go-stale-unread-counts`** [toolchain/go-material-review.md:9](../../toolchain/go-material-review.md#L9): Agent believes S3 module review is incomplete and re-reads or re-plans based on stale counts. **Instead:** Section order is newest-first in lines 3–712; later passages record file closures (e.g. go-material-review.md:1623, 1869, 2049). Check go-material-queue.json.
- **`hazard.go-transport-test-large-workloads`** [toolchain/go-material-review.md:827](../../toolchain/go-material-review.md#L827): Agent runs net/http transport tests with 1GiB bodies, unbounded producers or real DNS. **Instead:** Keep unexecuted; see go-material-review.md:847 (real DNS) and go-material-review.md:881.

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [A proxy addon that crashes after modifying a request does not block it](#interception-proxyaddon-crash-forwards-request) | integrated-lab | testing, operations |
| [mitmproxy allow/ignore host lists choose what to intercept; other traffic still flows, unrecorded](#interception-proxyallowlist-not-scope-control) | source-trace | scoping, testing, evidence |
| [Environment proxy settings do not guarantee tool traffic passes through a capture proxy](#interception-proxygo-env-proxy-not-egress-guarantee) | source-trace | scoping, evidence, operations |
| [Go Transport validates outgoing headers; Header.Write and direct Request.Write differ](#interception-proxygo-net-http-header-validation) | source-trace | testing, triage |

### interception-proxyaddon-crash-forwards-request

**`interception-proxy.addon-crash-forwards-request`: A proxy addon that crashes after modifying a request does not block it** (integrated-lab)

A real loopback run showed that an ordinary addon exception after mutation still forwarded the request to the origin. A required enforcement addon cannot treat 'my handler crashed' as 'request blocked'.

**Do:** Any safety or scope logic implemented as a proxy addon must fail closed explicitly, with an independent egress policy behind it.

**Limits:** One HTTP/1 extension order and version was exercised.

**Sources:** [toolchain/findings.md:7](../../toolchain/findings.md#L7)

**Receipts:** `toolchain/proxy-loopback-receipt.json`

### interception-proxyallowlist-not-scope-control

**`interception-proxy.allowlist-not-scope-control`: mitmproxy allow/ignore host lists choose what to intercept; other traffic still flows, unrecorded** (source-trace)

In mitmproxy, a connection that is ignored or not on the allow list becomes a raw TCP/UDP forwarding layer rather than being blocked. The project's own tests expect ignored connections to leave no flow or UI record unless show_ignored_hosts is enabled. The dump filter is a save/display filter, not a destination allowlist.

**Do:** Enforce engagement scope with an independent egress control (firewall or network policy), not with proxy host lists, and enable recording of ignored hosts when evidence completeness matters.

**Limits:** Source and upstream test reading at one pinned version; deployment-specific egress controls were not evaluated.

**Sources:** [toolchain/proxy-http2.md:55](../../toolchain/proxy-http2.md#L55), [toolchain/proxy-http2.md:90](../../toolchain/proxy-http2.md#L90)

### interception-proxygo-env-proxy-not-egress-guarantee

**`interception-proxy.go-env-proxy-not-egress-guarantee`: Environment proxy settings do not guarantee tool traffic passes through a capture proxy** (source-trace)

Go httpproxy (vendored in Go 1.27.2) silently ignores proxy parse errors, applies NO_PROXY best-effort (wildcard bypasses all; CIDR only for literal-IP requests; no DNS resolution), and always bypasses localhost/loopback. The environment proxy function is cached once per process. The AWS SDK default client uses environment-derived proxy selection.

**Do:** If an engagement relies on a capture proxy for evidence or scope, verify egress independently (firewall/egress logs); do not assume env vars route all traffic.

**Limits:** Source-only; no process configuration inspected or traffic sent.

**Sources:** [toolchain/go-material-review.md:937](../../toolchain/go-material-review.md#L937), [toolchain/go-material-review.md:937](../../toolchain/go-material-review.md#L937), [toolchain/go-material-review.md:943](../../toolchain/go-material-review.md#L943), [toolchain/go-material-review.md:1019](../../toolchain/go-material-review.md#L1019)

### interception-proxygo-net-http-header-validation

**`interception-proxy.go-net-http-header-validation`: Go Transport validates outgoing headers; Header.Write and direct Request.Write differ** (source-trace)

Standard HTTP(S) RoundTrip validates every outgoing header/trailer name and value before connecting (CR/LF/NUL rejected) and omits sensitive values from error text. Header.Write instead drops invalid names and replaces CR/LF with spaces; direct Request.Write replaces invalid Host with empty. Inbound parsing deliberately retains field names containing spaces.

**Do:** Header-injection findings against Go clients need the actual transport path; custom RoundTrippers need separate review.

**Limits:** Go 1.27.2 source; no requests sent.

**Sources:** [toolchain/go-material-review.md:961](../../toolchain/go-material-review.md#L961), [toolchain/go-material-review.md:807](../../toolchain/go-material-review.md#L807), [toolchain/go-material-review.md:803](../../toolchain/go-material-review.md#L803)

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| high | [toolchain/go-material-review.md:569](../../toolchain/go-material-review.md#L569) | [toolchain/go-material-review.md:563](../../toolchain/go-material-review.md#L563) | Believe the conditional A/B mismatch; it is not a demonstrated bypass. |
| high | [toolchain/go-material-review.md:1009](../../toolchain/go-material-review.md#L1009) | [toolchain/go-material-review.md:999](../../toolchain/go-material-review.md#L999) | Treat the A→B→B redirect token restoration as an open source-level candidate. |
| high | [toolchain/go-material-review.md:1890](../../toolchain/go-material-review.md#L1890) | [toolchain/go-material-review.md:1895](../../toolchain/go-material-review.md#L1895) | Treat GetObject checksum validation as conditional (200, EOF, supported algorithm, non-multipart). |
| high | [toolchain/go-material-review.md:1927](../../toolchain/go-material-review.md#L1927) | [toolchain/go-material-review.md:1935](../../toolchain/go-material-review.md#L1935) | Checksum retention across retries is intended; do not report it as an integrity bypass. |
| high | [toolchain/go-material-review.md:2019](../../toolchain/go-material-review.md#L2019) | [toolchain/go-material-review.md:2023](../../toolchain/go-material-review.md#L2023) | Require an observed End event for completeness. |
| high | [security-landscape/coverage.md:78](../../security-landscape/coverage.md#L78) | [security-landscape/coverage.md:78](../../security-landscape/coverage.md#L78) | Report only a helper-level divergence, not a live ZAP proxy vulnerability. |
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
| medium | [toolchain/go-material-review.md:1749](../../toolchain/go-material-review.md#L1749) | [toolchain/go-material-review.md:2025](../../toolchain/go-material-review.md#L2025) | Select results are delivered via the eventstream middleware. |
| medium | [toolchain/source-notes.md:21](../../toolchain/source-notes.md#L21) | [toolchain/findings.md:7](../../toolchain/findings.md#L7) | Treat forwarding after an addon exception as lab-confirmed, not open. |
| medium | [toolchain/go-material-review.md:1083](../../toolchain/go-material-review.md#L1083) | [toolchain/go-material-review.md:979](../../toolchain/go-material-review.md#L979) | Length mismatches error at transport but may have partial remote effect. |
| medium | [toolchain/go-material-review.md:1467](../../toolchain/go-material-review.md#L1467) | [toolchain/go-material-review.md:961](../../toolchain/go-material-review.md#L961) | No header injection claim via standard transport; custom RoundTrippers differ. |
| medium | [toolchain/go-material-review.md:1927](../../toolchain/go-material-review.md#L1927) | [toolchain/go-material-review.md:1973](../../toolchain/go-material-review.md#L1973) | Changed retry bodies require external mutation, not the SDK retry loop. |
| medium | [toolchain/go-material-review.md:1983](../../toolchain/go-material-review.md#L1983) | [toolchain/go-material-review.md:2093](../../toolchain/go-material-review.md#L2093) | Check for retry wrappers with max 0 before assuming a bounded retry count. |
| medium | [toolchain/go-material-review.md:1965](../../toolchain/go-material-review.md#L1965) | [toolchain/go-material-review.md:1983](../../toolchain/go-material-review.md#L1983) | Default retries are bounded at 3; see the later AddWithMaxAttempts(0) exception. |
| low | [toolchain/go-material-review.md:567](../../toolchain/go-material-review.md#L567) | [toolchain/go-material-review.md:565](../../toolchain/go-material-review.md#L565) | No default unprotected-cache race. |
| low | [toolchain/go-material-review.md:299](../../toolchain/go-material-review.md#L299) | [toolchain/go-material-review.md:299](../../toolchain/go-material-review.md#L299) | Release note does not close the redirect candidate. |
| low | [toolchain/go-material-review.md:687](../../toolchain/go-material-review.md#L687) | [toolchain/go-material-review.md:683](../../toolchain/go-material-review.md#L683) | No deployment-wide stale V4a cache inference. |
| low | [toolchain/go-material-review.md:1585](../../toolchain/go-material-review.md#L1585) | [toolchain/go-material-review.md:2039](../../toolchain/go-material-review.md#L2039) | SDK does not locally validate completed part lists. |
| low | [toolchain/go-material-review.md:631](../../toolchain/go-material-review.md#L631) | [toolchain/go-material-review.md:627](../../toolchain/go-material-review.md#L627) | Path style only without custom endpoint. |
| low | [toolchain/go-material-review.md:1879](../../toolchain/go-material-review.md#L1879) | [toolchain/go-material-review.md:1879](../../toolchain/go-material-review.md#L1879) | No usable partial output from public GetObject on error. |
| low | [toolchain/go-material-review.md:1356](../../toolchain/go-material-review.md#L1356) | [toolchain/go-material-review.md:1356](../../toolchain/go-material-review.md#L1356) | Interpret multipart checksum by algorithm and checksum type. |
| low | [toolchain/go-material-review.md:1379](../../toolchain/go-material-review.md#L1379) | [toolchain/go-material-review.md:1427](../../toolchain/go-material-review.md#L1427) | Options.Copy is shallow. |
| low | [toolchain/go-material-review.md:451](../../toolchain/go-material-review.md#L451) | [toolchain/go-material-review.md:449](../../toolchain/go-material-review.md#L449) | Reject CBOR infinite-loop and header-sized allocation claims. |
| low | [toolchain/go-material-review.md:1073](../../toolchain/go-material-review.md#L1073) | [toolchain/go-material-review.md:987](../../toolchain/go-material-review.md#L987) | SDK body logging buffers whole bodies. |
| low | [toolchain/go-material-review.md:2055](../../toolchain/go-material-review.md#L2055) | [toolchain/go-material-review.md:2075](../../toolchain/go-material-review.md#L2075) | Report only the malformed-length relationship as an open candidate, not the missing cap. |
| low | [toolchain/go-material-review.md:475](../../toolchain/go-material-review.md#L475) | [toolchain/go-material-review.md:445](../../toolchain/go-material-review.md#L445) | Weakness limited to the shared document helper. |
| low | [toolchain/go-material-review.md:1146](../../toolchain/go-material-review.md#L1146) | [toolchain/go-material-review.md:1146](../../toolchain/go-material-review.md#L1146) | No jsonschema duplicate bypass from hash collisions. |
| low | [toolchain/go-material-review.md:429](../../toolchain/go-material-review.md#L429) | [toolchain/go-material-review.md:425](../../toolchain/go-material-review.md#L425) | Misleading return contract only. |
| low | [toolchain/go-material-review.md:1945](../../toolchain/go-material-review.md#L1945) | [toolchain/go-material-review.md:1949](../../toolchain/go-material-review.md#L1949) | Checksum package findings apply to UploadPart/PutObject, with different trailer placement. |
| low | [toolchain/go-material-review.md:895](../../toolchain/go-material-review.md#L895) | [toolchain/go-material-review.md:951](../../toolchain/go-material-review.md#L951) | Closed bodies may be drained (≤256KiB) and reused. |
| low | [toolchain/proxy-http2.md:17](../../toolchain/proxy-http2.md#L17) | [toolchain/proxy-http2.md:9](../../toolchain/proxy-http2.md#L9) | The HPACK Huffman table was verified in full. |
| low | [toolchain/go-material-review.md:1411](../../toolchain/go-material-review.md#L1411) | [toolchain/go-material-review.md:1419](../../toolchain/go-material-review.md#L1419) | Do not claim a connection leak from the NopCloser wrapper alone. |
| low | [toolchain/go-material-review.md:141](../../toolchain/go-material-review.md#L141) | [toolchain/go-material-review.md:369](../../toolchain/go-material-review.md#L369) | Do not cite RecursionDetection as a loop detector. |
| low | [toolchain/go-material-review.md:783](../../toolchain/go-material-review.md#L783) | [toolchain/go-material-review.md:803](../../toolchain/go-material-review.md#L803) | Response parsing tolerates spaces in field names. |
| low | [toolchain/go-material-review.md:423](../../toolchain/go-material-review.md#L423) | [toolchain/go-material-review.md:415](../../toolchain/go-material-review.md#L415) | Stack steps do not reject duplicate middleware IDs. |
| low | [toolchain/go-material-review.md:1965](../../toolchain/go-material-review.md#L1965) | [toolchain/go-material-review.md:1983](../../toolchain/go-material-review.md#L1983) | No default token leak; record only a quota-accounting boundary. |
| low | [toolchain/go-material-review.md:393](../../toolchain/go-material-review.md#L393) | [toolchain/go-material-review.md:375](../../toolchain/go-material-review.md#L375) | Negative delay not reached through HeadBucket/HeadObject waiters. |
