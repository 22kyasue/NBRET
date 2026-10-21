# Running NBRET's four tiers

The four tiers are Capture, Explore, Probe, and Scan. They run independently or through one JSON configuration. Every invocation requires a new output directory. Evidence and portable tools stay in ignored local storage.

For assertions, UI scenarios, deep Analyze/repair reports and automatically managed scans, use the newer [testing guide](testing.md). COPY is now disabled by default; older COPY functionality remains an explicit opt-in.

```sh
npm test
npm run setup:zap
npm run demo:tiers
```

The demo starts a disposable loopback fixture and its own ZAP daemon, runs all four tiers, asserts results, and shuts down its own processes. It uses the existing computeruse browser for Explore. The portable ZAP download is checked against the release's SHA-256 digest and byte count. Java 17 or newer is required; set `NBRET_JAVA` to its executable. This PC's demo defaults to the existing Burp-bundled Java runtime without changing the running Burp instance.

## Combined run

Save this as a private configuration, replacing the example target with an authorized target:

```json
{
  "url": "http://127.0.0.1:3000/",
  "origins": ["http://127.0.0.1:3001"],
  "capture": { "rea": true, "copy": false },
  "explore": {
    "maxPages": 10,
    "maxDepth": 2,
    "maxStates": 30,
    "maxMs": 120000,
    "interactions": [{ "type": "click", "name": "Details" }]
  },
  "probe": {
    "cases": [{ "url": "http://127.0.0.1:3001/status", "expectStatus": 200 }],
    "maxCases": 30,
    "timeoutMs": 10000,
    "maxBytes": 1048576,
    "delayMs": 100
  },
  "scan": {
    "endpoint": "http://127.0.0.1:8090",
    "urls": ["http://127.0.0.1:3000/"],
    "active": false,
    "maxMs": 120000
  }
}
```

```sh
npm run tiers -- --config config.json --out runs/new-tiers-run
```

Individual commands use the corresponding configuration object; Explore additionally needs `url`, and Probe/Scan need `origins`:

```sh
npm run explore -- --config explore.json --out runs/new-explore
npm run probe -- --config probe.json --out runs/new-probe
npm run scan -- --config scan.json --out runs/new-scan
```

For the original capture command, repeat `--origin https://api.example.com` to include specific additional API origins. Action IDs remain for compatibility; `observationIntervalId` and `association: temporal-not-causal` make their interpretation explicit.

## What each tier records

| Tier | Output | Behavior |
| --- | --- | --- |
| Capture | `capture/summary.json`, network evidence, REA, COPY | Existing isolated browser capture, including API-origin allowlisting and missing-coverage counts. |
| Explore | `explore/explore.json`, `state-N.json` | Breadth-first observed-link discovery, DOM/text state fingerprints, transition graph, named click/hover branches, skipped links, coverage limits, and owned-tab cleanup verification. |
| Probe | `probe/probe.json` | Explicit request cases, redacted paired JSON responses, status expectations, shape/body comparisons, byte and time budgets. Redirects are never followed. |
| Scan | `scan/scan.json` | Real ZAP version, context, scan progress and alert summaries. No spider or recursive scan. Incomplete scans are stopped by their own IDs. Only the newly created context is removed. |

The combined `tiers.json` reports every tier, including unconfigured phases and failures. Bounded Explore output is useful partial evidence, not complete site coverage. DOM/text fingerprints do not establish semantic equivalence. COPY still runs in separate fresh contexts, and REA still observes after the capture actions.

The combined run also writes a human-readable `REPORT.md` and an offline `probe-plan.json`. The plan groups captured requests by method and endpoint, links samples to request IDs, records observed input/output shapes, and proposes bounded numeric input variations. These proposals do not send requests, assume expected outputs, or recover redacted credentials. Samples with missing credentials are excluded from proposed replay. The planner enforces contract, sample, individual-body and total-output budgets.

To derive a plan from an earlier capture, save `{"networkDir":"runs/earlier-capture/network"}` in `plan.json`, then run:

```sh
npm run probe:plan -- --config plan.json --out runs/new-probe-plan
```

Select a proposal's `request` object into the explicit Probe `cases` configuration when ready. Probe comparisons group by method, origin and path, so unrelated endpoints do not share a baseline.

## Browser and scanner requirements

Explore uses `C:/Users/kotar/githubprojects/computeruse` and its existing AI browser. The Python bridge calls that repository's `Browser` API, opens a window of its own, and closes only its own tab. Set `NBRET_COMPUTERUSE_ROOT` and `NBRET_COMPUTERUSE_PYTHON` if the harness lives elsewhere. It does not create an independent Playwright browser for exploration. The original Capture tier retains its isolated headless browser behavior.

Explore automatically follows eligible observed links; it never fills or submits forms. Click/hover branches require exact labels in the configuration. Destructive-looking links and labels are skipped. This is a conservative heuristic, not proof that an arbitrary page is read-only. Browser redirects and embedded subresources can still contact other origins; external final pages are not recorded. Use explicitly approved targets and steps. DOM/text captures can contain personal data and must remain private.

Scan connects only to a loopback ZAP API. Supply its key through `NBRET_ZAP_API_KEY`, rather than committing it in a configuration. Use a dedicated ZAP instance for reliable run-specific results: a shared instance may contain older alerts and a passive queue from other activity. The adapter avoids global shutdown, mode changes and scan-policy changes. The demo alone shuts down the daemon it starts.

`active: true` enables attack requests, and `probe.allowWrites: true` enables POST/PUT/PATCH/DELETE cases. Set these only for specifically authorized targets and actions. Development validation uses the local fixture. Client Shopify remains audit-only without Kotaro's specific approval for mutations.

ZAP API source: https://www.zaproxy.org/docs/api/. Portable releases: https://github.com/zaproxy/zaproxy/releases.
