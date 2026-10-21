# Testing, Analyze and repair diagnosis

NBRET now supports data collection, static structure and runtime coverage, evidence-backed diagnosis, HTTP assertions, UI scenarios, regression comparison and managed ZAP scans. COPY is disabled by default. Run only the stages needed; analyzing saved evidence does not open a browser or send requests.

## Fast HTTP/JSON testing

Save a private check configuration:

```json
{
  "origins": ["https://your-authorized-site.example"],
  "maxMs": 60000,
  "cases": [{
    "name": "catalog contract",
    "url": "https://your-authorized-site.example/catalog.json",
    "expect": {
      "status": 200,
      "headers": {"content-type": {"includes": "json"}},
      "json": [{"path": "/items", "type": "array", "minLength": 1}]
    }
  }]
}
```

```sh
npm run check -- --config checks.json --out runs/baseline
npm run check -- --config checks.json --baseline runs/baseline/check-results.json --out runs/repeat
```

Results: `CHECKS.md`, `check-results.json`, `junit.xml`, and paired request/response evidence. Failed assertions and incomplete evidence return a nonzero CLI exit. A response that was not collected does not become a passing check.

Supported assertions: status or status array; header matchers; JSON RFC6901 pointers with `exists`, `type`, `equals`, `includes`, `minLength`, `maxLength`, `min`, `max`; and `maxDurationMs` for observed probe duration. Unknown matchers are rejected. Redacted values cannot satisfy value assertions.

Baseline comparisons report added/removed cases and status, content-type, schema and body-hash changes. By default, status and schema changes fail regression policy; ordinary value changes remain visible without failing. Configure `failOnChanges` to change this. `ignoreJsonPaths` excludes known volatile fields before comparison. Large collections use bounded, sampled value-shape comparisons; this is not an exhaustive JSON Schema validator.

`--probe-file runs/earlier/probe/probe.json` evaluates existing probe evidence offline. It checks the earlier observation and clearly labels that source. Request matching includes the JSON body, so different POST inputs are not confused. Writes require explicit `allowWrites: true`; redirects are never followed. Transport supports gzip, deflate, Brotli and Zstd when the Node runtime supports it, with separate wire/decoded-byte and wall-clock budgets. `progress.json` updates after each case. Error codes distinguish deadlines, byte limits, decompression, DNS, TLS and connection failures.

## Capture and deep analysis

```sh
npm run capture -- --url https://your-authorized-site.example/ --out runs/site --include-script-sources --include-coverage
npm run analyze -- --run runs/site --out runs/site-analysis
```

On Kotaro's Windows PC, the capture CLI chooses the existing computeruse harness when available. `--browser isolated` is available for standalone fixtures. COPY runs only with explicit `--copy` and is unavailable in harness mode.

Analyze outputs:

| File | Purpose |
| --- | --- |
| `ANALYSIS.md`, `analysis.json` | Probable app role, observed datasets, API/auth behavior, loading and evidence coverage, with confidence and provenance. |
| `LOGIC.md`, `structure.json` | Static modules/imports, function definitions, direct lexical calls, branch sites, event callbacks, DOM/storage/network operations, workflows and observed initiator links. |
| `FIXES.md`, `diagnosis.json` | Prioritized observed failures, scanner findings, optimization/accessibility candidates and collection gaps; every issue includes a proposed fix and verification step. |
| `suggested-checks.json` | Draft read-only status/JSON checks derived from observed successful resources. |

Static analysis uses the parser already shipped in pinned REA 6.4.0. Captured code is never evaluated. Unknown dynamic behavior, reassigned calls and ambiguous bindings remain unresolved. The server framework and implementation remain unknown unless supplied evidence establishes them.

`includeCoverage` records V8 precise function/block execution counts. They describe the recorded scenario, not a percentage of the entire application's functionality. Profiling adds overhead, so its navigation timings are not controlled performance benchmarks. Source and traversal budgets are reported; partial parses/truncated graphs remain partial.

For the configuration-based Analyze command, `runDir` can point to a full run or capture folder. `supplementalProbeFiles` can add recovered datasets, and `scanFile` can add a separate scan. Originals are preserved. The analyzer distinguishes inferred app purpose from directly observed responses and separates NBRET collection gaps from website defects.

Diagnosis rules cover observed 5xx responses and missing assets, CSP-blocked resources, repeated auth checks, script fan-out, slow instrumented loads, DOM accessibility heuristics and scanner findings. Optimization thresholds are prompts to measure; they are not production SLAs or a site quality score. No suggested fix is applied to the site automatically.

## Named UI scenarios

```json
{
  "url": "https://your-authorized-site.example/",
  "includeScriptSources": true,
  "steps": [
    {"type": "click", "name": "Open search", "expect": {"textIncludes": "Search"}},
    {"type": "fill", "name": "Search query", "tag": "input", "value": "example", "expect": {"textIncludes": "Results"}}
  ]
}
```

```sh
npm run scenario -- --config scenario.json --out runs/scenario
```

Scenarios use exact observed control names, with optional `tag` to disambiguate. Click, hover and text-field fill are supported. Explicit expectations can check `textIncludes`, `elementName`, `urlIncludes` or `fieldValueEquals` for the named text field. Expectations poll for up to 3 seconds by default; per-step `timeoutMs` can set a 0–10 second budget. Password fields, frames and destructive-looking controls are excluded. Missing/ambiguous controls and failed assertions are reported. Text input values are not copied into the scenario summary. The scenario emits `SCENARIO.md`, `scenario.json`, network evidence and precise execution coverage.

Readiness and settling are bounded. DOM inventories paginate; SPA route fragments are retained with secret-like fragments redacted. Snapshot node caps, pending requests, long-lived media and missing bodies remain visible.

## Managed passive and active scans

Install the portable scanner once:

```sh
npm run setup:zap
```

Then save a scan configuration:

```json
{
  "origins": ["https://your-authorized-site.example"],
  "urls": ["https://your-authorized-site.example/"],
  "active": false,
  "scopeMode": "urls",
  "maxMs": 120000
}
```

```sh
npm run scan -- --config scan.json --out runs/scan
```

With no explicit `endpoint`, NBRET starts a dedicated ZAP daemon, uses a random loopback port/key and terminates only its own process afterward. Java 17+ is required; `NBRET_JAVA` selects its executable. Runtime credentials, CA material and logs remain in ignored `.tools/scan-runtime/`, outside exported run evidence. An explicit endpoint uses an already-running loopback instance without changing global settings or shutting it down.

Set `active: true` only for the specifically authorized target/scope. Default URL scope restricts the context to seeded paths and query variations. Origin scope is an explicit wider option. Spidering and recursive scanning remain disabled. Attack rules may generate variants such as alternate HTTP/HTTPS requests; scanner findings still require review. Time limits stop owned active scans and preserve their progress. Active security testing adds vulnerability evidence; it does not recover server source or prove full application logic.

Client Shopify remains audit-only without Kotaro's specific mutation approval. Production fixes and deployments retain their standing approval requirements.

## Verified development loop

```sh
npm test
npm run demo:testing
```

The testing demo operates a disposable local fixture through the existing harness, verifies click/fill UI assertions and precise coverage, analyzes its code, creates a passing HTTP baseline, deliberately breaks the JSON contract, and asserts that the regression is detected. It emits a receipt only after those checks pass. No third-party writes or production deployment are part of that demo.
# Readable HTML analysis

Every analysis now includes `REPORT.html`, a standalone report you can open directly in a browser. It contains an overview, observed versus inferred architecture, expandable frontend workflows, fixes with verification steps, data inventory and coverage limits. It uses no external scripts, fonts or tracking. Raw JSON remains available beside it.

