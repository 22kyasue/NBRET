# Rejecting and containing unwanted automation

Start with allowed operations and resource budgets. Distinguish a request that is unauthenticated, forbidden, over budget, suspicious, or confirmed abusive. These labels need different responses. Automation can be legitimate, and a human can abuse an API.

| Boundary | Concrete enforcement | Main limit and evaluation |
| --- | --- | --- |
| Client/workload authentication | Validate issuer, audience, expiry and key possession; reject revoked credentials | A valid compromised credential can still be abusive; test rotation and revocation latency |
| Request integrity/replay | Sign covered request components, bind body integrity where required, verify freshness and nonce policy | A signature alone does not prohibit replay or authorize a tenant; [RFC 9421](https://www.rfc-editor.org/rfc/rfc9421.html) defines the mechanism and security considerations |
| Resource authorization | Check operation, object and tenant against trusted principal on every path | Test cross-account reads, writes, caches, offline evidence and background jobs |
| Demand control | Principal/tenant quotas, concurrency caps and service-wide capacity; broad address protections as another layer | Fixed windows, token buckets and concurrent permits solve different problems; test multi-instance scope and reset bursts |
| Risk classification | Combine limited behavioral/session/network evidence, calibrated to outcome | Require labeled cohorts, uncertainty and drift checks; no accuracy claim from a vendor description |
| Challenges | Select proportionate accessible verification with supported automation alternatives | Measure abandonment, accessibility burden and legitimate automation rejection |
| Response | Deny narrowly, revoke credentials, isolate a workload, stop assignment and reconcile effects | Test eventual quiescence rather than stopping at a UI status or cancellation acknowledgement |

An allowlist must bind to a verified principal or authenticated network boundary; an unverified User-Agent string is a claim. Forwarded client addresses require a trusted proxy configuration; arbitrary incoming forwarding headers are not source identity. Keep emergency capacity controls separate from precision classifications. Do not treat cookies, headers, device signals or an address as proof of a person. Browser/device signals can be shared, absent or privacy-restricted.

The Coraza source trace distinguishes request-phase rejection before application dispatch from response-phase rejection after dispatch. The latter can suppress response data while earlier application side effects persist. The BullMQ trace likewise distinguishes cancellation signals, local tracking, queue terminal state and actual processor quiescence. Evaluate the property at the boundary where its effect is enforced; a denied response or a cancelled status alone cannot establish that no operation occurred.

Scraping guidance is separate: [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html) explicitly distinguishes robots rules from access authorization. A crawler honoring robots.txt does not gain protected-resource access, and a disallow entry does not enforce denial.

## Evidence and false positives

The predeclared [local protocol](lab-plan.md) uses the actual pinned memory limiter and a synthetic HTTP resource server. Four independent principals sharing one address produce 2 false rejections out of 4 under address-only quotas. A single over-budget principal with four fixture address labels has 2 missed excess requests out of 2 under that address-only policy. Principal quotas resolve those exact fixtures. These denominators describe intentionally constructed cases, not field prevalence, precision, recall or vendor efficacy. The same principal can still misuse several valid accounts; principal quotas alone do not resolve coordinated abuse.

For a real owned-service study, define the positive class before measuring it: disallowed automation, account takeover, resource overuse and fraud are different labels. Use held-out legitimate cohorts (shared carrier/corporate networks, privacy tools, assistive technology, API partners, slow clients and new accounts) and abuse simulations. Record TP/FP/TN/FN, request/account/session-level denominators, false-positive rate, precision/recall, challenge completion and abandonment, latency, cost, remediation latency and human appeal outcomes. Compare with authentication plus quotas alone. Keep an explicit inconclusive category when ground truth is missing. Avoid collecting invasive fingerprinting merely to improve a proxy metric; minimize retention and audit who can access linkage data.

## Malicious botnet lifecycle, as defender evidence

DOJ's [911 S5 disruption report](https://www.justice.gov/archives/opa/pr/911-s5-botnet-dismantled-and-its-administrator-arrested-coordinated-international-operation) alleges compromised residential Windows computers were sold as proxy access. It illustrates the distinction between the victim endpoint, proxy buyer and operator. An observed residential address can belong to a victim, so attribution by address alone is unsafe. Allegations and enforcement descriptions are not independent measurements of detector accuracy.

The [Qakbot victim resources](https://www.justice.gov/usao-cdca/divisions/national-security-division/qakbot-resources) describe a court-authorized August 2023 operation that redirected control traffic and distributed an uninstall action. This establishes a specific reported disruption, not permission for private researchers to act on infected third-party systems. Removing a control component does not demonstrate that all subsequent payloads, persistence or stolen credentials have been remediated. For an owned incident, isolate affected devices, preserve evidence, revoke exposed authority, remediate/rebuild and validate restored operation through the response team.

These cases show architectural intervention points: compromise prevention, endpoint visibility, control-channel disruption by authorized parties, credential revocation and recovery validation. No malware, botnet infrastructure, live callbacks or third-party traffic was executed in this research. Direct peer-to-peer control topology and additional first-party incident reports remain on the reading queue.
