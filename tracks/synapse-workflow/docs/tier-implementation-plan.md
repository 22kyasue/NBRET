# NBRET tier implementation plan

Owner: Rue. Requested by Kotaro on 2026-10-14; taking over Beck's work.

The initial repository contained network recording, COPY extraction and REA inspection, but no Explore, probing or scanner modules. Existing evaluation artifacts remain intact. The four tiers below follow Beck's board scope; his detailed handoff has not arrived, so this document records the implemented scope explicitly.

| Tier | Deliverable | Acceptance evidence |
| --- | --- | --- |
| 1 — Capture | Preserve existing capture; explicit API-origin allowlist; distinguish temporal association from causality; expose coverage gaps. | Existing capture/REA/COPY tests plus exact-origin scope tests. |
| 2 — Explore | Bounded discovery of pages and UI states with recorded transitions, skipped controls, budgets, and capture evidence. | Controlled local multi-page fixture; cycles deduplicated, external links rejected, destructive controls skipped. |
| 3 — Probe | Explicit request cases derived from observed contracts; bounded execution, redirect checks, paired responses and comparison. | Local API fixture with changed inputs, failures, redirect escapes and resource limits. |
| 4 — Scan | Scoped ZAP adapter with isolated context, bounded execution, status/alerts, and cancellation of owned scans. Active scanning requires a specific enabled scope. | Adapter tests plus real ZAP execution against a disposable loopback fixture, if ZAP is available. No third-party scanning during development. |

Execution order: shared scope validation → capture compatibility → Explore → Probe → ZAP → CLI and documentation → full regression and local tier evidence.

All output directories must be new. Runs remain ignored by Git. Budgets, failures and missing tools are reported explicitly. Browser operations on this PC use the existing computeruse harness; unrelated browser sessions and scanner instances are preserved. Client Shopify remains audit-only without specific approval for a mutation. Production deployment and X actions retain their existing confirmation boundaries.

## Implemented

- Tier 1: repeatable origin allowlist in CLI, missing-scope counts, explicit temporal observation labels. Existing REA/COPY and source-hash behavior preserved.
- Tier 2: harness browser bridge, bounded breadth-first exploration, exact-label click/hover branches, state fingerprints, transition graph, skipped-link and coverage reporting, own-tab cleanup.
- Tier 3: bounded HTTP transport, explicit cases, write-method opt-in, redacted JSON pairs, status expectations, shape/body comparisons, no redirect following.
- Tier 4: verified portable ZAP setup, loopback API adapter, isolated context, explicit URL seeds, nonrecursive active scan option, bounded polling, alert summaries and own-scan cancellation.
- Combined and per-tier CLI commands, portable local demo and usage documentation.
- Follow-up: offline capture-to-probe contract inventory, bounded unexecuted numeric variations, per-endpoint probe baselines, and a combined human-readable report.
- Follow-up validation: 11/11 regression tests and real combined demo passed; 8 probe proposals derived from two captured API input/output pairs. Evidence: `runs/tiers-demo-1792005294399/VERIFIED.json`.

## Validation

Real all-tier fixture run: `runs/tiers-demo-1792004449707/VERIFIED.json`.

- Capture/REA/COPY succeeded: 3 requests and 1 script.
- Explore visited 2 pages and captured 4 states; its owned tab closed successfully.
- Probe varied inputs and asserted outputs 25 and 10.
- ZAP 2.17.0 completed 1 active scan and returned 3 alert summaries; its context was removed.
- Full original-plus-new regression suite: 10 tests passed, 0 failed. Repeated real all-tier demo passed after fixing a ZAP history-insertion race; details in `docs/tier-verification.md`.

Known limits: Explore reads the harness's bounded DOM/text inventory and reports truncation; it does not automatically submit forms or prove full application coverage. Browser redirects/subresources can leave the origin scope. Scan results from a shared ZAP instance may include earlier findings. Reconstruction accuracy, server-source recovery and production-target coverage are not claimed.
