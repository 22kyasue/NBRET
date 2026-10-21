# Testing and Analyze verification — 2026-10-14

This expansion adds compressed-response recovery, repeatable HTTP/JSON assertions, schema/status/body baseline comparison, JSON/Markdown/JUnit outputs, bounded UI scenarios, V8 precise coverage, static JavaScript/workflow analysis, evidence-backed repair diagnosis and managed ZAP lifecycle. COPY defaults to disabled.

Validation targets are local fixtures and Kotaro's explicitly requested `https://tobirastudio.com/home`.

## Real target evidence

- Recovered `catalog.json` in `runs/tobira-catalog-recovered-20261014/probe.json`: 3,704,928 decoded bytes from 715,302 Zstd bytes; the data includes 4,282 sites and 85 catalog categories. The earlier archive's missing-catalog record remains preserved.
- Bounded active scan: `runs/tobira-active-20261014/scan/scan.json`; ZAP 2.17.0, one completed scan, five alert summaries, context removed. No spidering or recursive scan. The analyzer omits the informational “Modern Web Application” alert from repair candidates.
- Live HTTP test baseline: `runs/tobira-checks-baseline-20261014/check-results.json`; five cases passed (home, catalog, component index, category dataset and anonymous account rejection).
- Repeat comparison: `runs/tobira-checks-repeat-20261014/check-results.json`; five passed, no recorded baseline changes. Each run took about 3–4 seconds in this session; this is operational evidence, not a general speed guarantee.
- Deep observation: `runs/tobira-deep-20261014/capture/summary.json`; next-item and search-open actions observed, 390 requests, 266 script records, five snapshots, no collector drops. V8 reported 4,936 function entries with 972 executed, 6,428 ranges and no range drops. DOM snapshots were not truncated in this run. Five requests remained pending.
- TOBIRA UI scenario: `runs/tobira-ui-assertions-20261014/scenario.json`; search opens and the named search field can be filled. Input `Apple` is visible in the recorded field. The case checks opening/presence; full result-ranking correctness remains untested.

## Local integration and failure detection

`npm run demo:testing` creates a disposable HTTP fixture and operates it through the existing computeruse harness. It asserts the load-button result, search input result and field value; captures precise function coverage; parses the sources and correlates request initiators; creates a passing HTTP baseline; deliberately changes an array into a string; and asserts that both the JSON assertion and schema regression fail. The receipt is emitted only after these assertions pass.

An offline CLI check against the deliberately broken fixture returned exit code 1, verifying CI failure behavior without sending additional requests. Managed scanner smoke validation passed against a local fixture and verified that its owned context was removed and owned daemon was stopped.

The regression suite covers decompression and decoded/wire limits, truncated streams, redaction, scoped requests, wall-clock deadlines, collector limits, precise coverage, UI inventory limits/readiness, static parsing without execution, lexical calls/workflows, expectation validation, offline POST matching, baseline change detection and diagnosis classification. No current validation establishes complete application branch coverage, full role authorization, every viewport, or absence of exploitable issues.

Final full regression: **19 tests passed, 0 failed**. Latest local testing demo receipt: `runs/testing-demo-1792009032629/VERIFIED.json` (three UI assertions passed; deliberate JSON-contract regression detected). `git diff --check` passed. Live tool defaults use the existing harness on this Windows PC; fixture regression tests explicitly select isolated browsers when testing the legacy capture/REA/COPY integration.

Final consolidated analysis, logic workflows and prioritized repair/testing diagnosis: `runs/tobira-final-analysis-20261014/ANALYSIS.md`, `LOGIC.md`, `FIXES.md` and companion JSON files. Every interpretation retains source evidence and confidence; static possibilities and recorded function executions remain distinct.

The full four-tier fixture pipeline with automatic Analyze also passed: `runs/tiers-demo-1792009364665/VERIFIED.json`. Its demo now asserts that analysis succeeds and the overall pipeline is completed, rather than accepting only the individual capture/probe/scan statuses.
