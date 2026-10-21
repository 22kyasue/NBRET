# Nsock proxy integration: exact capability boundaries

Nmap pin `f06480daed9a9b2cdce61904222cc87788afdf84`. This source slice complements [connectivity](connectivity.md) and [discovery input/DNS](discovery-targets.md); it is not an operational proxy setup guide. No proxy, network route, tunnel or scan was started. The three files below were read in full.

`nsock/src/nsock_proxy.c` 1–450:

* 4–49 carries a **GPL v2 with an OpenSSL linking exception** notice for this library file. This differs from the root Nmap NPSL notice. Root license metadata alone does not describe every bundled component.
* 62–170 registers HTTP CONNECT and SOCKS4 backends only, parses comma-separated chains, frees partially created chains on failure, rejects empty or replacement pool chains and initializes per-connection state. Presence of a generic “SOCKS” category does not imply SOCKS5, UDP association or authentication support here.
* 172–235 frees URI parts and percent-decodes hosts. 237–294 parses authority, IPv6 brackets and port bounds, **rejecting userinfo containing @**. The format comment at 74–75 contains user:pass syntax, but the implementation explicitly rejects it. Read code and backend behavior before claiming credential support.
* 296–389 lowercases scheme, parses authority/path, matches a registered backend and frees temporary URI state. A recognized scheme creates an in-process backend object, not proof a remote proxy accepted a tunnel.
* 391–426 temporarily rewrites event type for the original caller and maps failed proxy stages to PROXYERROR, then dispatches success events to the current backend. Failure status and stage matter; do not reinterpret a failed proxy handshake as evidence that the ultimate target port is closed.
* 428–447 resolves the **proxy hostname locally through getaddrinfo**, restricted to TCP. DNS path/privacy is separate from where application data eventually exits. OS resolver behavior is not reviewed here. The sockaddr assignment/length combination needs an owned IPv6 fixture before assuming full IPv6 address preservation.

`nsock/src/proxy_http.c` 1–209:

* 66–104 locally resolves proxy address, assigns default port 8080 and releases node state.
* 106–137 selects the next proxy or final numeric destination and sends CONNECT with remaining event time, then reads a line. No proxy credential header or TLS-to-proxy setup appears in this backend. End-to-end application TLS and transport to the proxy remain distinct.
* 139–164 accepts a response using length plus substring “200 OK”, with a source TODO for string checking; this is not a full HTTP status/header parser. It marks tunnel established and moves to the next chain node or forwards the original event. A successful backend state is not cryptographic server identity or proof of authorization.
* 166–207 dispatches states and maps backend errors into PROXYERROR. Actual partial-read buffering, full-header consumption and timeout/event cleanup live in nsock dependencies, not this file. No malformed-response fixture ran; parser weakness and interoperability effects remain hypotheses.

`nsock/src/proxy_socks4.c` 1–242:

* 67–137 defines the packed request and creates IPv4-only proxy nodes with default 1080. The request uses SOCKS4 CONNECT, numeric IPv4 destination and an empty user ID; it is not SOCKS4a hostname forwarding or SOCKS5 negotiation.
* 139–170 chooses next/final destination, writes the request and waits for eight reply bytes under the remaining event budget.
* 173–198 accepts exactly eight bytes with status byte 90, then advances/forwards. It does not validate every reply field here. 200–240 dispatches states and reports errors. No encryption is provided by this protocol backend itself; a separately secured network path must be evidenced separately.

The important integration question is **which caller attaches which chain to which pool**, not “is a proxy configured somewhere?” Reviewed service scanning attaches one; the parallel DNS wrapper also passes one to its resolver. Direct connect-scan OS sockets are separate. System DNS fallback and proxy hostname resolution can follow another path. Retain destination/source vantage, subsystem, selected resolver/backend, timeout and observed egress evidence before making privacy or coverage claims. A VPN/overlay does not change authorization, and proxy acceptance does not attest target identity.

Next dependencies: nsock connect selection, IOD/event lifecycle, read buffering, timeout cancellation and the massdns resolver's actual proxy/fallback behavior. No whole-engine or cross-platform IPv6 correctness claim is made.
