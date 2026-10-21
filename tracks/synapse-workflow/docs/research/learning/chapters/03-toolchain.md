# Inside the technical toolchain

An assessor uses several tools because no single view contains the entire system. A browser explains the user interaction; a proxy explains an application exchange; a packet trace explains traffic at a capture point; identity data explains relationships; a scanner applies selected tests; and a reporting platform organizes conclusions. Each tool makes something visible and leaves something out.

## Follow one request through the stack

The browser creates an HTTP request containing a method, destination, path, headers and possibly a body. A cookie or token can associate it with an account. TLS can encrypt the connection. DNS helps resolve names to addresses. Transport and network routing carry the data to a destination, possibly through gateways, proxies or tunnels.

The application server interprets that request using its own code and state. A response has a status, headers and content. Browser code may transform the content before displaying it. Inspecting only the screen, only the status or only a network address answers different questions.

To investigate Alice reading Bob's order, retain the account label, request and returned order contents together. To explain why a connection failed, add name resolution, routing and transport observations. To determine the intended access rule, add application and business context. The extra tools are useful because the question crosses these layers.

## Proxies and packets

An intercepting proxy sits in the selected application's message path. Burp and mitmproxy can expose requests and responses for inspection and controlled modification. Intercepting encrypted traffic requires an intentionally configured trust/instrumentation setup; not every application or protocol necessarily travels through it.

The mitmproxy source and loopback studies below trace request handling, extensions, synthetic responses, errors and saved flows. They show why a saved exchange must be understood as a representation. An extension can modify traffic; streaming can affect what body is retained; save hooks can change the record. The observation process can itself influence what happened.

A packet viewer such as Wireshark works from captured traffic. It decodes bytes into protocol fields. Some fields are inferred or generated from context. Capture filters discard traffic before retention; display filters select from what was retained. Encryption, packet loss, truncation, interface placement and clock differences constrain interpretation. A packet trace can be extremely precise about observed bytes while remaining incomplete about application intent.

## Discovery and identity graphs

Nmap investigates reachability and service behavior from a particular location. Port states and service hypotheses depend on probes, defaults, timing and responses. A system assumed to be up is different from one observed replying. A name associated with a port is different from active version identification. A fingerprint is a clue about software, not a demonstrated exploit.

SharpHound and BloodHound provide a different view: accounts, groups, computers, sessions and permission relationships. Collection, ingestion and graph analysis are separate stages. A graph can suggest a path from one identity to a valuable resource, but its edges have dates, prerequisites and collection limits. Some relationships change more quickly than others. Missing collection is not evidence that the relationship does not exist.

## Network paths do not replace identity checks

An access VPN can provide approved connectivity; an HTTP or SOCKS proxy carries selected application traffic; an SSH tunnel forwards a defined flow. Which system resolves DNS and which traffic takes which route depends on the setup. The source studies trace paths where a configured proxy did not imply that every subsystem used it.

From a security-testing perspective, keep route, account and permission separate. Two accounts can share an egress address. One account can use several addresses. Encryption protects a defined connection; it does not establish who may perform a business operation.

## Reproduce, build, deliver

**Reproduce the concept:** use the local order lab, inspect its browser requests and compare them with the saved JSON observations. Read the same event as a browser interaction, an HTTP exchange and a report entry. Identify which information is present in each view.

**Build the tool:** use adapters that retain original artifact IDs and bytes alongside normalized fields. Record whether bodies were omitted, whether the exchange was modified, which account label was supplied and when the observation occurred. Keep import errors and partial collection visible.

**Deliver the service:** document collection configuration and gaps in the assessment record. A customer needs to know which applications, identities, network locations and sources were actually observed. The detailed studies below expose the mechanics behind that statement, including source-reading and runtime boundaries.
