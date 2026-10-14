# NBRET development strategy

Develop website reconstruction and web/API investigation together. Both consume the same recorded scenarios; each produces different conclusions from the evidence. Priority is trustworthy coverage and less repeated work.

## Current capability register

| Capability | Status and evidence | Gap |
| --- | --- | --- |
| Network/action/initiator capture | Integrated; separate-origin allowlist test | One page target and bounded bodies |
| REA | Integrated; source-hash integration test | After-action observation window; transient states may be missed |
| COPY | Integrated; extraction integration test | Separate fresh contexts; state/auth and proxy differ |
| Proxy connection | Local HTTP/HTTPS plus Burp history correlation and MCP local request verified | Trusted Burp CA verified once via temporary Current User root (removed); COPY direct |
| API exports | Offline exports, content-addressed cache and observed JSON contracts | Complete schema and authenticated replay missing |
| Local experiments | Loopback replay and delayed response-substitution tests | Not external replay or authenticated browser equivalence |
| Scenario runner | Serial profiles, expected-result checks, checkpointed reports | No exhaustive state exploration/session manager |
| Coverage assessment | Offline assess command | Reports observed gaps only; no site-completeness claim |
| Rebuild comparison | Local broken-rebuild benchmark detects behavior/layout defects | Complex-app benchmark corpus still needed |
| Same-state visual evidence | Opt-in --visual; API/visible-result integration test | Bounded top-document inventory; not full COPY or motion reconstruction |
| Offline scenario comparison | Network/DOM/geometry plus optional pixel comparison | Header, stream and motion-trajectory comparison missing |
| Streaming capture | WebSocket/SSE fixture verifies opt-in JSON redaction | Binary payloads omitted; workers/cross-process frames incomplete |
| ZAP/mitmproxy adapters | Not implemented or verified | Add when a specific experiment requires them |

## Implementation order and completion criteria

1. **Coverage and efficiency baseline.** Assess existing runs offline. Record phase duration, artifact bytes, tool versions and failures. Define scenario IDs and expected observations. Complete when reports identify omission reasons and repeated-work costs without launching browsers.
2. **Shared sessions and evidence.** Support explicit authorized API origins and attach extraction to the intended state through the computeruse harness. Preserve action/request/script/screenshot IDs, timings, configuration and state identity. Complete when an interaction's visual and network observations refer to the same state; retain separate-state runs with explicit labels.
3. **One verified proxy adapter.** Finish Burp HTTP/HTTPS checks with local fixtures and interception off; preserve history/request associations. Complete when a changed test input and its output can be matched across NBRET and proxy receipts. Installed is not integrated; a configured proxy is not verified routing.
4. **Controlled experiments.** Add a local scenario runner and explicit replay/response substitution for test environments. Cover loading, failure, empty results, pagination and persistence. Complete when results are reproducible and each claim links to its observations. Client Shopify stays audit-only unless the exact mutation and scope are approved.
5. **Reconstruction comparison.** Run matching scenarios against reference and rebuild. Compare request shapes, outputs, transitions, DOM geometry and motion. Complete when failures are explainable by scenario, with evidence; avoid a single opaque fidelity score.
6. **Broaden coverage and adapters.** Add worker/frame targets, WebSocket/SSE handling and protocol-specific evidence as representative fixtures expose gaps. Evaluate ZAP/mitmproxy against those needs; do not duplicate proxy functionality without measured benefit.

## Efficient execution policy

- Read and derive offline first. Export, assess, group endpoints and compare hashes before recapturing.
- Run network-only for API questions; add REA for unresolved script questions, COPY for appearance/assets, proxy experiments for unresolved traffic behavior.
- Cache immutable artifacts by content hash. Cache derived reports by input hashes plus tool/configuration version. Never treat cached outputs as a fresh live observation.
- Reuse sessions only with explicit ownership and suitable state. Do not mix accounts or change another session's browser/proxy settings.
- Narrow scenarios before increasing capture budgets. Use bounded concurrency for independent offline work; serialize shared-browser/stateful experiments.
- Measure wall time, stored bytes, failed phases, unresolved observations and scenarios compared. Optimize verified outcomes per unit of work.
- A tool adapter should declare inputs, outputs, version, scope, state requirements, side effects, cost limits and a verification fixture.

## Benchmark fixtures to build

Verified fixtures now cover interactive forms, separate-origin API, local replay, delayed failure substitution, WebSocket/SSE and an intentionally broken rebuild. `benchmark:app` additionally verifies login, pagination, SPA navigation, empty results, server failure and cookie persistence across reload. Independent workers, service workers and cross-process frame network recording, session reuse/reset, and responsive-motion fixtures now pass. Extend with complex real apps; these controlled fixtures do not establish general coverage.

Track each gap with an ID, affected scenario, evidence, proposed fix, priority and acceptance check. Unknown server internals remain unknown; behavioral reconstruction does not recover private source.

## Available now

See [the executable workflow](workflow.md) for capture profiles, scenario manifests, expected-result checks, local replay/response experiments, content-addressed analysis caching and benchmark commands. Burp startup and MCP now work with the fixed Java harness; HTTP/HTTPS fixture captures were matched in Burp history and local changed-input MCP sending verified. No production systems were used for these experiments.

Use `--visual` to record viewport screenshots and a bounded DOM/style/text inventory after navigation and every action in the network capture page. Files share run and action IDs and never navigate or intentionally scroll the page. This is a same-state complement to COPY, not a replacement for its broader asset/CSS extraction. Text and screenshots are raw local evidence and may contain sensitive page content. DOM and pixels are captured sequentially, so moving content can differ between observations.

`npm run compare -- --before runs/reference --after runs/rebuild` compares saved request-body and response hashes, statuses, failures, visible text, styles and geometry. Add `--pixels` for screenshot differences. Primary page origins normalize to `@page`; external API origins remain exact unless explicitly mapped with --origins. JSON object-key order is ignored and geometry has a default one-pixel tolerance. Changes and uncertainty warnings are separate; no changes is not proof of equivalence. Comparison runs entirely offline and prints JSON without overwriting captures.

Capture accepts `--scenario api-read` and repeatable `--origin https://api.example.test` flags. Additional origins are explicit HTTP(S) origins only; they expand network evidence scope, not REA or COPY configuration. Summary, network evidence and links share a unique run ID and scenario ID. Scenario IDs are labels, not proof of equivalent state or inputs. Summary metrics record phase timing, saved network asset bytes, bounded grouped logical artifact sizes and installed tool versions. Network-session time includes REA/visual work; phases must not be summed. Final report writes are outside artifact accounting. Explicit `--discard-profile` removes only the generated profile after confirmed close and resolved-path validation.

`npm run assess -- --run runs/<capture>` reads existing summary and network evidence and prints observed gaps and reuse suggestions. It performs no network requests, tool launches or writes. `npm run verify:proxy` validates the local HTTP capture/export path; `npm run verify:proxy:tls` checks local HTTPS CONNECT and certificate opt-in. Both accept an existing `--proxy`; independently match external proxy history as done in the recorded Burp receipts.
