# NBRET testing and Analyze expansion

Requested by Kotaro on 2026-10-14. COPY remains disabled for validation. Target: repeatable tests and a deep, evidence-backed explanation of a site's observed structure and logic.

1. Reliable transport: decode gzip/deflate/Brotli/Zstd with wire/decoded-byte and wall-clock limits; report explicit failure codes. Recover TOBIRA's missing catalog with the fixed transport.
2. Browser evidence quality: preserve SPA routes, check readiness and drainage, report truncation and collector gaps. Keep the computeruse harness and owned-window cleanup.
3. Repeatable testing: configured status/header/JSON assertions, explicit unsupported/missing evidence outcomes, regression baselines, Markdown/JSON/JUnit results, and quick probe-only operation.
4. Analyze: inventory datasets and API/auth behavior, identify probable app roles with confidence, summarize loading/coverage, and derive suggested checks. Analysis runs offline against existing evidence.
5. Deep structure: parse captured JavaScript as data using the pinned REA parser; map modules/imports, functions, conditions, call sites, DOM/event/storage operations and endpoint references; correlate them to observed requests. Static possibilities and observed runtime events remain distinct. No captured JavaScript is executed.
6. Active scan: user explicitly requested a bounded TOBIRA /home active scan. Use a dedicated ZAP daemon, explicit URL path scope, no recursive crawl, and stop only the owned scan at the time limit. Preserve scan progress and findings even on timeout. Security probing does not establish server-source recovery or full application logic.

Validation: targeted transport/analysis/assertion/regression tests, full existing regression, a deliberately failing fixture, offline TOBIRA analysis, recovered catalog, and bounded real active-scan evidence.

Implemented: all six stages, plus prioritized repair diagnosis, named click/fill/hover scenarios, DOM accessibility heuristics, navigation timing, SPA route preservation and automatically managed ZAP daemons. Source parsing reuses the pinned REA parser. COPY is now opt-in throughout the capture workflow.

Live evidence: recovered catalog has 4,282 sites; active /home scan completed with 5 alert summaries; 5 HTTP checks passed twice with no baseline changes; TOBIRA's search UI scenario passed; the deep recording captured 4,936 V8 function entries including 972 executed entries, with no range drops. Local testing demo verifies click/fill assertions, runtime coverage, analysis and detection of a deliberately broken JSON contract. Final verification is recorded in `testing-verification.md`.
