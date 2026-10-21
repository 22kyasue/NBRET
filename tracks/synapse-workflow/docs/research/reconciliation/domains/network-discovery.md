# Network discovery: Nmap, DNS, packets, connectivity

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 6 findings, 3 related corrections, 1 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.nuclei-full-path-reproduce`** [security-landscape/deep-review/nuclei-input-identity.md:23](../../security-landscape/deep-review/nuclei-input-identity.md#L23): An agent may retry the blocked Nuclei build or work around Windows controls to reproduce the full engine. **Instead:** Blocked goimpacket build must not be retried (priorities.md:13; nuclei-matchers.md:3; docs/research/safety-context/README.md:11).

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [Fastdialer cache keeps an earlier IP set and skips a revoked validation callback](#network-discoveryfastdialer-cached-target-authority) | component-lab | evidence, scoping, testing |
| ['No endpoints found' after a protocol failure is not a negative finding](#network-discoveryempty-protocol-output-not-negative) | source-trace | discovery, evidence |
| [Nmap proxy chains support HTTP CONNECT and SOCKS4 only: no SOCKS5, no proxy credentials](#network-discoverynmap-proxy-chains-http-socks4-only) | source-trace | scoping, discovery |
| [Nmap 'filtered', 'up' and service names are inferences, not proof](#network-discoverynmap-states-are-inferences) | source-trace | discovery, evidence, reporting |
| [Nmap's proxy setting does not cover connect scans or DNS, and version detection does not verify TLS](#network-discoveryproxy-and-dns-coverage-gaps) | source-trace | scoping, discovery, evidence |
| [Script-discovered targets and multi-address hostnames need their own scope check](#network-discoverytarget-expansion-needs-scope-check) | source-trace | scoping, discovery, evidence |

### network-discoveryfastdialer-cached-target-authority

**`network-discovery.fastdialer-cached-target-authority`: Fastdialer cache keeps an earlier IP set and skips a revoked validation callback** (component-lab)

With pinned Fastdialer 0.5.25 against two owned loopback listeners, a cached network+address wrapper kept the first context IP when a later call supplied a different IP, and skipped the OnValidateTarget callback after it was flipped to reject; fresh dialers honored both. Twelve controls passed in two identical runs with zero DNS queries. Nuclei records event ip from requested CustomIP, not the observed socket destination.

**Do:** Record the actually connected peer address as evidence, and do not assume a policy change mid-scan applies to already-cached connections.

**Limits:** Component scenario; Nuclei state does not install OnValidateTarget; full-engine mislabeling not demonstrated.

**Sources:** [security-landscape/deep-review/nuclei-dialer-cache-lab.md:7](../../security-landscape/deep-review/nuclei-dialer-cache-lab.md#L7), [security-landscape/deep-review/nuclei-input-identity.md:21](../../security-landscape/deep-review/nuclei-input-identity.md#L21)

**Receipts:** `security-landscape/deep-review/nuclei-dialer-cache-lab-receipt.json`

### network-discoveryempty-protocol-output-not-negative

**`network-discovery.empty-protocol-output-not-negative`: 'No endpoints found' after a protocol failure is not a negative finding** (source-trace)

Impacket's rpcdump catches fetch exceptions and can continue with an empty list, printing 'No endpoints found'. Its helper utilities can make SMB, Kerberos and LDAP network calls, so a utility is not necessarily offline.

**Do:** Keep protocol errors with enumeration results and report failed enumeration as unknown, not empty.

**Limits:** Source reading; remote tests were deliberately not run.

**Sources:** [toolchain/impacket-rpc.md:13](../../toolchain/impacket-rpc.md#L13), [toolchain/impacket-rpc.md:30](../../toolchain/impacket-rpc.md#L30)

### network-discoverynmap-proxy-chains-http-socks4-only

**`network-discovery.nmap-proxy-chains-http-socks4-only`: Nmap proxy chains support HTTP CONNECT and SOCKS4 only: no SOCKS5, no proxy credentials** (source-trace)

At the reviewed pin, nsock registers only HTTP CONNECT and SOCKS4 backends; a generic SOCKS category does not imply SOCKS5, UDP association or authentication. Userinfo containing @ is rejected even though a format comment shows user:pass, the HTTP CONNECT backend sends no proxy credential header, and SOCKS4 uses an empty user ID with numeric IPv4 destinations only. The HTTP CONNECT backend accepts a response by substring match on "200 OK".

**Do:** Do not plan an engagement that relies on Nmap reaching targets through an authenticated or SOCKS5 proxy; if a vantage proxy is required, provide it at the network layer and verify the egress path independently.

**Limits:** Source reading of nsock at one pin; Nmap releases may differ and no proxy run was performed.

**Sources:** [toolchain/nsock-proxies.md:8](../../toolchain/nsock-proxies.md#L8), [toolchain/nsock-proxies.md:9](../../toolchain/nsock-proxies.md#L9), [toolchain/nsock-proxies.md:23](../../toolchain/nsock-proxies.md#L23)

### network-discoverynmap-states-are-inferences

**`network-discovery.nmap-states-are-inferences`: Nmap 'filtered', 'up' and service names are inferences, not proof** (source-trace)

A timeout produces 'filtered' and does not establish a closed port or identify the filtering device. With host discovery disabled, 'up' is an operator assumption, not reachability evidence. Service name confidence values 10/8/3 are implementation-assigned scores, not calibrated probabilities, and a table lookup is not service proof. No-response ports take the scan's default state without an explicit record.

**Do:** Report port and host states with their reason codes and discovery settings; do not present filtered as closed or a table-guessed service as identified.

**Limits:** Source reading at one pinned Nmap; no scans were run in the research.

**Sources:** [toolchain/discovery-packets.md:32](../../toolchain/discovery-packets.md#L32), [toolchain/discovery-targets.md:19](../../toolchain/discovery-targets.md#L19), [toolchain/discovery-packets.md:50](../../toolchain/discovery-packets.md#L50)

### network-discoveryproxy-and-dns-coverage-gaps

**`network-discovery.proxy-and-dns-coverage-gaps`: Nmap's proxy setting does not cover connect scans or DNS, and version detection does not verify TLS** (source-trace)

Connect scans use direct OS sockets, not the service scanner's proxy path, so a configured proxy cannot be assumed to cover that traffic. Parallel DNS goes over UDP/53, which the TCP-only proxy redirection does not carry. Version detection sets SSL_VERIFY_NONE, so it is not a certificate-validation oracle.

**Do:** If traffic must leave from an agreed vantage point, enforce it at the network layer and account for DNS separately; check certificate validity with a dedicated tool.

**Limits:** Source reading; actual traffic routing was not measured.

**Sources:** [toolchain/discovery-packets.md:35](../../toolchain/discovery-packets.md#L35), [toolchain/dns-flow.md:11](../../toolchain/dns-flow.md#L11), [toolchain/nsock-flow.md:101](../../toolchain/nsock-flow.md#L101)

### network-discoverytarget-expansion-needs-scope-check

**`network-discovery.target-expansion-needs-scope-check`: Script-discovered targets and multi-address hostnames need their own scope check** (source-trace)

Nmap can consume newly discovered NSE target expressions; those addresses need explicit scope checks before an authorized wrapper admits them. Input, selected, skipped, discovered and observed counts answer different questions. Output flush/close errors are ignored, so a completed summary is not a verified durable artifact.

**Do:** Wrap discovery so every target is checked against the authorized scope list before probing, and record each count type separately in the engagement record.

**Limits:** No script or automatic discovery was exercised.

**Sources:** [toolchain/discovery-targets.md:16](../../toolchain/discovery-targets.md#L16), [toolchain/discovery-packets.md:17](../../toolchain/discovery-packets.md#L17)

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| low | [toolchain/nsock-flow.md:49](../../toolchain/nsock-flow.md#L49) | [toolchain/nsock-flow.md:49](../../toolchain/nsock-flow.md#L49) | Do not presume nsock assertions are removed in release builds. |
| low | [toolchain/discovery-timing.md:13](../../toolchain/discovery-timing.md#L13) | [toolchain/discovery-timing.md:5](../../toolchain/discovery-timing.md#L5) | discovery-timing.md is complete; ignore earlier partial-status lines. |
| low | [security-landscape/deep-review/nuclei-input-identity.md:71](../../security-landscape/deep-review/nuclei-input-identity.md#L71) | [security-landscape/deep-review/nuclei-input-identity.md:89](../../security-landscape/deep-review/nuclei-input-identity.md#L89) | Cross-run origin suppression is only a concern for reused SDK instances. |
