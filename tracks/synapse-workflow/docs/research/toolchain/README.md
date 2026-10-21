# The assessment toolchain, beyond Burp and VPNs

Opened 2026-10-17. Owner: Linden. **Active investigation; this is a checkpoint, not a completed source audit.** No external target was scanned and no PC networking was changed.

An assessment is a chain of questions: what is authorized, what can this vantage point reach, what does the system expose, what can each identity do, what evidence supports a weakness, and did the fix restore the intended property? Tools answer different pieces. A VPN supplies a network path; Burp exposes application exchanges; neither supplies the complete assessment.

For a concise technical entry point, read [the evidence-oriented synthesis](read-first.md), then the detailed map and linked source studies below.

Read [the workflow and category map](map.md), [connectivity and trust boundaries](connectivity.md), [implementation annotations](source-notes.md), and [the continuation ledger](continuation.md). `snapshots.json` records exact source commits and retrieval times; `queue.json` inventories source files with unread/partial/complete ranges and SHA-256. Downloaded and inventoried do not mean reviewed. `source.mjs` prints bounded numbered ranges and records reading only when explicitly marked after inspection.

Deep slices: [proxy request/extension/response/save flow](proxy-flow.md), [discovery and packet evidence](discovery-packets.md), [identity collection and ingestion](identity-flow.md), and [dated releases/editions/licenses](catalog.md). Controlled receipts include [42 upstream proxy cases](proxy-lab-receipt.json), [real loopback proxy/extension/save round trip](proxy-loopback-receipt.json), and [mocked identity ingestion tests](identity-lab-receipt.json). These validate different boundaries; none is an enterprise assessment.

[Findings and testable hypotheses](findings.md) connect the evidence to practical interpretation. [Ledger verification](verification.json) checks source bytes, read-credit intervals and local document links; it is not a security certification. Upstream source sets include an explicitly labeled stable-candidate SharpHound common library and the actual dawgs dependency used by the Go unit run.

Evidence vocabulary: **documented** is a primary maintainer/vendor statement; **source-established** is behavior in inspected code at its pin; **inference** connects facts with assumptions; **lab-validated** requires an exact retained run and predefined oracle. No live enterprise environment or proprietary Burp implementation has been inspected.

Additional depth: [LDAP transport and lifetime](identity-ldap.md) and [offline packet dependency annotations](packet-dependencies.md). The proxy study now includes HTTP model, layer/listener, framing dependency and saved-state migration reading. These extend the investigation without erasing its remaining queue.

[Discovery inputs, exclusion and DNS](discovery-targets.md) traces three complete files before the connect engine, including DNS fallback, selected-address scope and assumed-up versus observed-up states.

[Nsock proxy integration](nsock-proxies.md) traces its URI parser, chain/event state and HTTP CONNECT/SOCKS4 backends, including local resolver and credential-support boundaries.

[Graph analysis and membership](identity-analysis.md) traces analysis status, membership traversal and the actual dawgs dependency, with nine additional offline upstream fixture tests passing.

[Classic pcap parser/writer](pcap-format.md) follows the complete format file, including heuristic variant recognition, generated interface metadata and lossy export boundaries.

[Display-filter VM and record dispatch](packet-filter-vm.md) traces decoded field occurrences, comparison semantics and the concrete record-to-dissector handoff.

[Impacket RPC protocol client](impacket-rpc.md) adds a pinned release, full client/transport/helper reading and the boundary between advertised endpoints, authentication and actual authorized capability.

[Discovery completion and timing](discovery-timing.md) traces retries, closed timeout sockets, default no-response states and the engine's orchestration loop.

[Reporting, import and retest](reporting-retest.md) follows the Nmap-to-DefectDojo projection and reimport status boundary, with edition-specific documentation and the resolved pinned BSD license.

[Cloud posture and policy heuristics](cloud-posture.md) adds Prowler collection/check/extension/fixer boundaries and seven exact-body synthetic observations, with no cloud access.

[Validation framework lifecycle](validation-framework.md) traces Metasploit check admission, execution/job/session outcomes and exceptional cleanup boundaries through four complete source/test files, without running a module.

Complementary work: [Tomo's NBRET/ZAP/Nuclei traces](../security-landscape/deep-review/README.md) and [Agate's agent/executor evidence studies](../assessment-evidence/README.md). Their limitations and receipts remain attached to their findings.
