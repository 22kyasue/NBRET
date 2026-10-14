# API investigation build validation

Initial validation on this PC on 2026-10-13 local time in the isolated `feat/api-investigation` worktree. These are local controlled-fixture results, not claims of complete third-party-site coverage.

- Initial suite: **26 tests pass** (superseded by39 below). All source/script/test module syntax checks pass; `git diff --check` passes.
- Local HTTP proxy: page/script/favicon/calculation requests traverse the forwarding proxy; captured input `{a:20,b:5}` produces `{result:25}` and exports preserve the request.
- HTTPS CONNECT: untrusted fixture certificate fails under strict verification; explicit TLS opt-in succeeds and captures `{result:25}`. No trust stores changed. Receipt: `runs/proxy-tls-1791957152982/proxy-tls-check.json`.
- Reconstruction benchmark: intentionally changed API result and layout produce response/text/geometry and pixel differences. Receipt: `runs/benchmark-1791957841691/benchmark.json`.
- App corpus: all six scenarios pass—unauthenticated access, login, pagination/SPA navigation, empty result, server failure and persistence across reload. Recorded passwords are redacted; 401/503 cases are observed. Receipt: `runs/app-benchmark-1791958261003/app-benchmark.json`.
- Local experiments: changed replay inputs produce 25 and 10; redirects are not followed, external replay targets and implicit writes are rejected. Delayed 503 substitution is labeled experimental and leaves the fixture server's real response unchanged.
- Streaming: WebSocket/SSE JSON payloads require explicit opt-in and token keys are redacted. Worker/child-frame discovery identifies gaps without claiming independent instrumentation.
- Offline analysis cache: concurrent creation, reuse, source-evidence change invalidation, missing evidence from failed captures and damaged-result rejection are checked.

## Initial observed tool cost

One local sample per configuration, all verifying the same required calculation. This is not a general performance guarantee. Logical artifact sizes exclude final report writes.

| Configuration | Elapsed before reports | Artifact bytes | Visual states |
| --- | ---: | ---: | ---: |
| network | 1,524.5 ms | 8,890,509 | 0 |
| behavior | 1,540.0 ms | 9,954,877 | 1 |
| full | 14,261.0 ms | 10,304,798 | 2 |
| behavior, explicit profile discard | 1,579.1 ms | 43,626 | 1 |

Receipt: `runs/profile-benchmark-1791958734727/profile-benchmark.json`. The discard case removes only its generated profile after confirmed browser close and resolved-path validation. Default retention stays on.

## Open limitations

The original Burp startup blocker was resolved on retry after reloading Dune's fixed Java harness. HTTP fixture input20+5/output25 matched Burp history (`runs/proxy-check-1791960888320/burp-history.json`). HTTPS result25 matched Burp history with explicit TLS opt-in (`runs/proxy-tls-1791960952320/burp-history.json`); strict verification failed, and no trust stores changed. A local Burp MCP request changed input to7+3 and returned10 (`runs/proxy-check-1791960888320/burp-replay.json`). Interception was restored to its original enabled state. The temporary project remains on the AI desktop for review.

Additional product-specific proxy adapters remain unverified; trusted Burp CA setup was verified on 2026-10-14 (see below). The extended build below adds same-state COPY, independent worker/frame instrumentation, owned session reuse, stream/motion comparison and cross-run asset reuse; current limitations are tracked in `gaps.json`. No production scans, external replay, store mutations, commits, pushes or deployments were performed.

## Full buildout local validation (2026-10-14)

The extended suite passed 38 tests before the final asset-capture integration check, which also passed. New acceptance fixtures cover same-state COPY, session reuse/reset, workers/service workers/cross-process frames, ordered streams, motion timing/path defects, mobile/reduced motion, multi-run contract shapes, asset reuse and export review. Final suite count is recorded below after rerun.

Repeated profile benchmark: `runs/profile-benchmark-1791964592598/profile-benchmark.json`, three fresh captures per profile.

| Profile | Median ms | Range ms | Mean logical bytes |
| --- | ---: | ---: | ---: |
| network | 1398.7 | 1387.2–1416.0 | 8890251 |
| behavior | 1420.6 | 1398.9–1441.7 | 9255731 |
| full | 3073.7 | 3063.6–3123.6 | 10270858 |
| behavior-discarded-profile | 1410.9 | 1409.6–1421.8 | 43748 |

Every sample independently verified result25. Profiles intentionally capture different evidence. New full uses the current interacted viewport; legacy separate COPY included extra viewport/scroll/hover sweeps, so comparison with its earlier14.26s is not equal coverage. Profile removal preserves captured observations but deletes that run’s browser cache/session.

Final verification: **39 tests pass**, zero failures/skips. All 63 source/script/test/COPY module syntax checks pass. `git diff --check` passes. Changes remain uncommitted and unpushed on `feat/api-investigation`. COPY inventory was refactored into a shared function; upstream provenance records were not rewritten.

## Remaining-gap continuation

- Burp process-scoped CA verification: runs/proxy-ca-1791965439989/receipt.json. Default Node trust rejects; supplied public CA verifies the hostname/chain and result25. Chromium trust remains separate.
- Mitmproxy12.2.3 and ZAP2.17.0: runs/proxy-products-1791965800515/receipt.json, independent history.json per product. Both match25 and same-state COPY. Initial ZAP default-addon startup timed out during addon updates; silent minimal startup succeeded. An intermediate minimal package needed the mandatory callhome addon; final package contains network+callhome only.
- Public MDN JavaScript page: runs/public-benchmark-1791965591029/receipt.json. Four read-only desktop/mobile captures passed heading checks (2.72–2.78s). Offline recomparison separates18 desktop/11 mobile evidence-availability differences from15/11 remaining observed differences. Those remaining changes include dynamic requests/DOM IDs and are not automatically defects.
- Scope-preserving tool advice and strict CA chain/hostname checks pass. Extended suite:42 tests pass.
- Official setup references: https://docs.mitmproxy.org/stable/overview/installation/ ; https://www.zaproxy.org/download/ ; https://www.zaproxy.org/docs/desktop/cmdline/ ; https://portswigger.net/burp/documentation/desktop/external-browser-config/certificate .

Final continuation checks:42 tests passed, 72 JS module syntax checks passed, and diff whitespace checks passed. Python addon syntax parsed without generating bytecode. Browser Current User CA test was later run with Kotaro's explicit approval (below).

Browser CA continuation (2026-10-14): Burp was restarted with a temporary project; its live CA (`http://burp/cert`) matched the exported proxy-ca.pem SHA-256. Interception was already off in the fresh session, so no Burp setting was changed. `scripts/verify-browser-ca.mjs` added the CA to Windows Current User Root only (Kotaro confirmed the Windows add and delete prompts personally), Chromium through Burp8080 with ignoreHTTPSErrors=false clicked the localhost fixture and read result25 with no errors, and the certificate was removed. Afterwards `Test-Path` reported the thumbprint absent from both CurrentUser and LocalMachine Root. Receipt: runs/browser-ca-1792001170618/receipt.json. The computeruse harness gate refuses AI clicks on trust-store prompts; the human must confirm them.
