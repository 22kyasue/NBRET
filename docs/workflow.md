# Investigation and reconstruction workflow

All commands run from the NBRET worktree. Captures and media stay under ignored `runs/`. These commands do not install proxy products or change system trust stores. Browser actions execute against the supplied site; use authorized targets and actions. Client Shopify stays audit-only unless Kotaro explicitly approves the specific mutation and scope.

## Choose the smallest useful capture

```sh
npm run capture -- --url http://127.0.0.1:3000 --out runs/reference --scenario search-empty --profile behavior --actions actions.json
```

| Profile | Passes | Visual checkpoints |
| --- | --- | --- |
| network | Network/action/initiator evidence | None |
| behavior | Network plus current DOM/style/text and screenshot | Final state after settling/checks |
| full | Network, REA, same-state COPY/visual and independent target recording | Every action |

`--visual-checkpoints all` overrides the profile's checkpoint policy. `--no-rea` and `--no-copy` disable those passes. Without a profile, legacy behavior remains REA + COPY with visual capture off; `--visual` explicitly adds it. Raw visual text/screenshots are unredacted local evidence, including when selected by a profile.

Profiles are preserved by default. Explicit `--discard-profile` (or a scenario's `"retainProfile": false`) removes only that run's newly generated browser profile after confirmed browser close, with a resolved-path check. This can save most of a small run's disk footprint, but removes its cookies/cache and potential session-reuse evidence. Captured network/visual artifacts remain. Failed close or unsafe paths preserve the directory and report the limitation; unrelated/shared profiles are never candidates.

Use repeatable `--origin https://api.example.test` for authorized separate API bodies. Use `--include-stream-payloads` only when structured WebSocket/SSE payloads are needed: JSON keys are redacted, binary/unstructured frames remain omitted. The top page target is observed; workers and cross-process frames are still a gap.

## Analyze before recapturing

```sh
npm run analyze -- --run runs/reference
npm run assess -- --run runs/reference
npm run investigate -- --run runs/reference
npm run contracts -- --run runs/reference
```

`analyze` caches assessment, endpoint inventory and a Postman collection by summary/evidence bytes, analyzer source hashes and Node version. It verifies cached payload integrity and atomically publishes complete cache files. Changed evidence or analyzer code creates a new result. Cache hits never represent a new live observation. This initial cache does not cache captures or deduplicate asset storage across runs.

`assess` prints coverage gaps and omission reasons without writes. `investigate` writes standalone exports to a fresh `investigation/` directory and refuses overwrite. None of these launches a browser or replays a request.

`contracts` reads saved JSON input/output examples and prints observed shapes with sample counts, redacted-field uncertainty and missing-body counts. It never infers required fields or a complete backend schema. It is a separate offline pass, not currently part of the cached analysis bundle.

## Run explicit scenarios

```json
{
  "schemaVersion": 1,
  "scenarios": [
    {
      "id": "sum-default",
      "url": "http://127.0.0.1:3000/",
      "profile": "behavior",
      "actions": [{"type":"click","selector":"#calculate"}],
      "expectations": [{"selector":"#result","text":"25"}]
    }
  ]
}
```

```sh
npm run scenarios -- --file scenarios.json --out runs/batch
```

Scenarios run serially in separate fresh profiles. Each successful network capture yields assessment and API exports from the same evidence; the batch checkpoints after every scenario. Expected text, visibility and counts have bounded waits. Reports persist check types and pass/fail, not expected or actual text. A failed expectation does not relabel successful traffic recording as a transport failure, but fails the scenario. This is not an exhaustive crawler or a login-session manager.

## Controlled local experiments

A scenario may declare synthetic JSON responses:

```json
"responses": [
  {"path":"/sum","method":"POST","status":503,"delayMs":300,"json":{"error":"temporarily unavailable"}}
]
```

Overrides require a literal `127.0.0.1` or `[::1]` target and a network/behavior profile. They are context-local, labeled experimental, bounded, and never change the fixture server. REA, COPY and proxy cannot be combined with these overrides, preventing accidental comparison of altered and direct passes. Override bodies are not copied into summaries. Browser routing disables its HTTP cache, so these experiments are unsuitable for cache-behavior conclusions.

Replay one captured request against an explicit local test server:

```sh
npm run replay:local -- --run runs/reference --request REQUEST_ID --target http://127.0.0.1:3000 --allow-writes
```

Local writes require explicit `--allow-writes`; GET/HEAD/OPTIONS do not. Redirects are never followed. Only Accept and Content-Type headers transfer; credentials/cookies are omitted. Redacted or incomplete inputs are rejected. Responses have a 10-second timeout and 1 MiB limit, with structured key redaction. This is not an authenticated browser replay and does not permit external replay destinations.

## Compare reference and rebuild

```sh
npm run compare -- --before runs/reference --after runs/rebuild
npm run compare -- --before runs/reference --after runs/rebuild --pixels
```

Compare matching scenarios and environments. Network examples pair by action, method, normalized page URL and occurrence; external API origins remain exact. Response and input hashes compare saved redacted content. Visual inventories compare text, styles and geometry with one-pixel default tolerance. Pixel decoding is opt-in, bounded and separate from semantic changes. DOM index alignment, dynamic content, omitted bodies and varying environments limit conclusions. Motion trajectories, headers and stream payloads are not yet compared. No differences is not proof of equivalence.

## Reproducible checks

```sh
npm test
npm run benchmark
npm run benchmark:app
npm run benchmark:profiles
npm run verify:proxy
npm run verify:proxy:tls
```

The benchmark intentionally changes a local rebuild's result and layout and requires detection of response, text and geometry changes. Proxy checks verify local HTTP forwarding and HTTPS CONNECT, including strict certificate failure and explicit TLS opt-in success. TLS checks use the existing OpenSSL executable (override with `NBRET_OPENSSL`) and generate a one-day fixture certificate under ignored runs. For Burp, supply `-- --proxy http://127.0.0.1:8080` with interception off and independently inspect its history. This was verified through MCP for HTTP and HTTPS fixtures; proxy-CA trust remains unverified.

`benchmark:app` runs six fresh-profile cases against a local app: unauthenticated access, login, pagination/SPA routing, empty results, server failure and cookie persistence across reload. It checks UI expectations, observed 401/503 responses, password redaction, and writes per-scenario contracts from existing artifacts.

`benchmark:profiles` runs the same calculation with network, behavior and full profiles, plus a behavior run with explicit profile discard, verifying the required result each time and recording observed phase times and grouped artifact sizes. It is a single-sample local measurement, not a universal speed comparison. Summary accounting is bounded to 10,000 entries, skips symlinks, counts logical file bytes and excludes final summary/report writes. Truncation is explicit. Installed Playwright/REA versions and browser/Node versions are recorded.

Target discovery records additional workers/pages/iframe targets without claiming to instrument them. Assessment reports discovered unobserved targets and top-document-only frame snapshots. Discovery samples at snapshot time and may miss short-lived targets.

## Burp startup and validation

The prior startup blocker was resolved using Dune's Java Access Bridge/tree/action fix. Reload the harness with reconnect after code changes, inspect owned dialogs, invoke Leave to preserve old temporary files, then invoke Next and Start Burp. Use Java tree actions rather than posted clicks. A replacement main window may need to be taken back to AI territory. The verified temporary project has MCP responding, HTTP/HTTPS history correlation and a local changed-input send. Interception was restored to its original enabled state after verification; disable it before a new capture. No trust stores or saved defaults were reset. PortSwigger documents that `--use-defaults` overwrites saved settings. [Official command-line documentation](https://portswigger.net/burp/documentation/desktop/troubleshooting/launch-from-command-line).

## Extended capture controls

`--copy-mode same-state` extracts the interacted top document and used CSS without another navigation. The full profile selects this mode and `--targets`; legacy `--copy-mode separate` retains broad COPY sweeps. Same-state extraction does not fetch every asset or sweep every viewport.

`--session-out sessions/owned.json` exports scoped cookies/localStorage. `--session-in sessions/owned.json` restores them into a fresh context; COPY must be same-state or disabled. Omit import to reset. Files contain raw credentials; IndexedDB/sessionStorage are excluded.

`--viewport 390x844 --reduced-motion reduce` controls responsive capture. `--motion motion.json` accepts `{ "selectors": [".box"], "frames": 5, "intervalMs": 50, "mode": "observe", "afterAction": 1 }`. Deterministic `seek` is restricted to loopback fixtures and temporarily controls Web Animations timing; arbitrary JS/canvas animation is outside coverage.

`--asset-store .asset-cache` reuses captured bytes by SHA256 after integrity checks. It does not skip fresh network observation. Cache entries and run assets can share hard links: treat both as immutable. Manual edits can damage both; later reuse rejects integrity failures.

`npm run contracts -- --run runs/a --run runs/b` merges observed shapes without inferring required fields. Comparison `--origins origins.json` accepts explicit `{ "before": { "https://api.example.com": "@api" }, "after": { "http://127.0.0.1:3001": "@api" } }` mappings.

`npm run review -- --run runs/reference --out runs/reference-review` creates a new artifact-class/hash inventory, exports no captured contents, excludes symlinks and refuses overwrites. Review paths before sharing. Classification is not proof of redaction.

## Practical tool selection

The three-sample local benchmark measured median network1.40s, behavior1.42s and full3.07s. Start with network for request questions; choose behavior for DOM/visual effects; choose full for CSS, scripts and worker/frame provenance. Reuse offline exports/contracts/comparisons before recapturing. Add Burp only for an unresolved traffic experiment; its HTTP/HTTPS loopback receipts are verified. ZAP and mitmproxy now have independent local HTTP fixture receipts; HTTPS/browser trust coverage remains distinct. Trusted CA setup remains separate from explicit TLS bypass.

Run `npm run benchmark:profiles -- --samples 3` to measure this machine again (1..10 samples per profile). All samples verify the same required calculation but collect different additional evidence.

## Additional proxy verification and scoped CA trust

`npm run setup:proxies` explicitly downloads pinned official ZAP2.17.0 portable bytes (published SHA256 required) and installs mitmproxy12.2.3 in a local venv under ignored runs/tooling. It changes neither PATH nor trust stores. Python3.12 and a Java17+ runtime are required; this PC uses its existing Python and Burp runtime. `NBRET_PYTHON` overrides setup Python.

`npm run verify:proxies` starts owned loopback-only tool processes, uses a new fixture/profile, matches calculation25 in each product history and stops only those processes. ZAP runs silent/safe with minimal network plus mandatory callhome addons, avoiding unsolicited requests and scanner/callback extensions. No active scan or spider is invoked. Receipts contain versions, endpoint and local result; raw process logs/configs stay private.

`npm run verify:proxy:ca` requires existing Burp8080 with interception temporarily disabled by its owner, restores no settings itself, and verifies strict Node CONNECT/TLS trust with the exported public CA. Caller must restore interception. This does not configure or prove Chromium trust. No certificate store is modified and UAC is unnecessary for this diagnostic. For routine HTTPS capture through a proxy, prefer `npm run capture -- --proxy http://127.0.0.1:8080 --trust-ca proxy-ca.pem` (verified with `npm run verify:proxy:audit -- --ca proxy-ca.pem`): certificate errors are accepted during capture, then every HTTPS origin's chain is verified against that CA and matched to the browser-reported certificate, and the run is marked failed otherwise. It changes no trust store and needs no prompts, but it detects a wrong CA after the fact rather than preventing the traffic. In-browser enforcement is checked separately by `node scripts/verify-browser-ca.mjs --temporary-user-trust --ca <public-CA.pem>`, which needs explicit per-run approval: Windows shows add and delete prompts that the human confirms, and the script removes only a certificate it added.

`npm run advise -- --need http --need dom --benchmark runs/profile-benchmark-1791964592598/profile-benchmark.json` recommends a profile without executing it. Unsupported evidence yields no selection; measurements cannot justify missing required coverage.

`npm run benchmark:public` performs four GET-only MDN JavaScript page observations at desktop/mobile viewports, verifies the heading, and compares repeat captures. Live content varies: behavior changes and evidence availability changes are separate, and neither is automatically a regression.
