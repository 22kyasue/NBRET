# Local validation plan — 2026-10-17

Defined before execution. Scope: two HTTP servers bound only to `127.0.0.1`, synthetic invoices and fixture identities, no browsers, external requests, model calls, credentials, or scanner payloads. Use existing NBRET `runChecks` and `runProbe`; do not modify them.

Question: Does evidence-backed assertion design distinguish unauthorized disclosure from a healthy response and a superficially correct denial?

Known answers: `vulnerable` returns another tenant's synthetic invoice with 200; `fixed` returns 403 without an invoice; `deceptive` returns 403 but still includes that invoice. An own-tenant positive control must remain readable. Repeat each variant three times. A strong check requires both denial status and absence of the invoice field. A status-only denial check is expected to miss `deceptive`; a simple availability check is expected to pass the vulnerable response. These are deliberately weak baselines, not claims about a commercial scanner.

Success: strong checks fail both leaking variants and pass all fixed variants; positive controls pass; missing structured evidence remains incomplete; redirects never contact the second server; write and out-of-origin cases reject before request; offline reassessment sends no requests. Record run directories, request counts, assertion results, environment, source hashes, elapsed times, repeat consistency, and cleanup.

Failure: accepting either leaking variant as secure, failing own-tenant controls, external/redirect request execution, missing evidence reported as pass, or offline evaluation causing network activity. A passing lab establishes only these known-answer properties. It does not establish automatic vulnerability discovery, comprehensive authorization testing, or performance in a customer environment.
