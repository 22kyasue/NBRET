# Reading the assessment toolchain

Start with the **question being answered**, then choose a tool and retain its evidence boundary.

| Question | Tool role | What a result supports | What still needs an oracle |
| --- | --- | --- | --- |
| What environment can reproduce the assessment? | OS distribution, selected packages, disposable lab | Exact binaries/configuration and reset state | Isolation, reproducible dependency resolution and scope |
| Which approved assets are reachable from this vantage? | Nmap, protocol clients | Configured probe outcomes/reasons and advertised services | Full coverage, identity, actual package version or vulnerability |
| What happened on the wire? | Wireshark/TShark | Captured bytes and configured decoding/filter projection | Missing/dropped/encrypted traffic, provenance and interpretation |
| What did this application identity request and receive? | Burp, mitmproxy, browser DevTools/API client | Observed or deliberately modified request/response | Intended authorization property and control comparison |
| What permissions/paths does the collected identity model imply? | SharpHound/BloodHound, cloud policy tools | Collected relationships and query/model deductions | Current effective capability, collection completeness and edge preconditions |
| Does a particular hypothesis hold in the owned fixture? | Manual regression, validation framework, harness/fuzzer | Exact predefined comparison or crash/behavior | Real-world impact, reproducibility/minimization and cleanup |
| Did the fix restore the property? | Recollection/retest plus evidence workflow | Controlled before/after result under matching identity/scope | Whether “not reported” merely reflects filters/failure/drift |

A VPN changes a path and trust relationships. An access VPN, commercial privacy service, mesh overlay, SOCKS/HTTP proxy, SSH tunnel and jump host solve different problems; none establishes permission or anonymity. [Connectivity study](connectivity.md) covers routes, DNS, split tunneling, encryption, identity, egress and observability without altering this PC.

## What the implementation review changed

**Proxy observations are mutable.** Ordinary addon exceptions can leave traffic forwarding; explicit kill is a different action. The real loopback fixture demonstrates mutation, synthetic response, exception/pass-through and kill, then rereads saved native flows. Streaming and save-hook order affect retained bodies. [Proxy trace](proxy-flow.md).

**Discovery states encode policy and uncertainty.** “Up” can be an operator assumption; no-response ports can use scan defaults; retries/timeouts affect interpretation. Service names/confidence can come from tables or matching. Application proxy configuration covers selected subsystems, while direct scan sockets and resolver fallback need separate accounting. [Targets](discovery-targets.md), [timing](discovery-timing.md), [transport proxies](nsock-proxies.md).

The deeper [DNS flow](dns-flow.md) shows why a custom DNS list or TCP proxy does not establish where every lookup went: this implementation sends UDP queries and can defer selected cases to the operating system resolver. The [Nsock lifecycle](nsock-flow.md) follows all five I/O engine source files and distinguishes bytes accepted for writing, partial reads reported as success, callback lifetime, TLS encryption and certificate identity. [Raw scan evidence](target-scan-flow.md) connects target names, attempted transmissions, capture filters, packet matching and retained response bytes. These are source findings; the native concerns described there were not exercised.

**Packet exports are transformations.** Format recognition can be heuristic; interface metadata may be generated; classic pcap can omit comments/options and reduce timestamp precision. Display filtering acts on decoded fields with occurrence semantics and can follow dissection. Useful output can coexist with input errors. [Pcap](pcap-format.md), [filter VM](packet-filter-vm.md).

**An identity graph is a temporal evidence model.** LDAP failure/partial paging, wildcard package resolution, ingestion timestamps and batch persistence matter. Ingestion and analysis are separate stages. A controlled dawgs traversal cancelled after root returned nil aggregate with cancelled context and incomplete work; that is a helper boundary, not demonstrated application misreporting. [Collection](identity-ldap.md), [ingestion](identity-flow.md), [analysis/receipts](identity-analysis.md).

**Cloud posture does not equal effective authorization.** The selected Prowler helper is a broad-policy heuristic; exact-body fixtures show its condition/denial and missing-document behavior. No cloud account/provider ran. Collection/failed-check/report propagation remains necessary before asserting final scan impact. [Cloud study](cloud-posture.md).

**Framework completion is not effect or cleanup.** Metasploit check statuses can permit execution without identical evidence strength; job/session/cleanup callbacks have distinct order and meanings. Source only, no module/payload/handler execution. [Lifecycle study](validation-framework.md).

**Reporting can merge and close observations.** The selected DefectDojo parser projects open ports and groups by numeric port; reimport computes lifecycle state from matching/disappearance. Closed-by-reimport is not a verified repair. [Reporting/retest](reporting-retest.md).

## Evidence retained and limits

The dated [catalog](catalog.md) distinguishes editions, metadata, source pins, runtime versions and license boundaries. Burp internals remain proprietary/inaccessible; only official docs/public extension examples were reviewed. [Map/glossary](map.md) covers the wider categories, including fuzzing, source/dependency/container/IaC and mobile tools, and contains synthetic engagement narratives. Those categories do not inherit source-review credit from a catalog entry.

Controlled evidence includes 42 selected proxy sans-I/O cases; a four-path real loopback proxy/save fixture; bounded header/import-state probes; eight mocked graphify subcases; nine upstream traversal/collector tests; four synthetic traversal boundary subcases; and seven exact-body cloud-helper observations. These are different experiments and must not be summed into a claim of security coverage. Original setup/build failures are retained. Plans, exact commands/versions, hashes, output, cleanup and limitations accompany receipts.

The durable [queue](queue.json) labels inventoried files unread/partial/complete with contiguous ranges; [verification](verification.json) checks hashes/ranges/links/script syntax, not comprehension or tool security. Complete files do not mean complete repositories or all protocol paths. [Continuation ledger](continuation.md) names remaining dependencies, alternate protocols, runtime gaps and category expansion. [Reader integration guide](reader-guide.md) supplies a topic hierarchy, finite milestones and evidence labels for Rowan's learning reader. No third-party target was scanned, real credentials used, global tool installed, networking/CA trust changed or production write made.
