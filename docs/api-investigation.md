# API investigation workflow

This branch adds offline request exports and optional proxy routing to NBRET. It does not recover server source, scan targets, or replay requests automatically.

## Capture through Burp, ZAP, or mitmproxy

Start your proxy locally, then run:

```sh
npm run capture -- --url https://your-authorized-site.example/ --out runs/proxied --proxy http://127.0.0.1:8080 --no-copy
```

Use a certificate trusted by the capture browser. For an isolated test profile, `--proxy-insecure` explicitly disables HTTPS certificate verification for that capture context only. It requires `--proxy`. Proxy credentials in URLs are rejected. Nothing changes the system certificate store.

Use `--scenario search-empty` to label a repeatable scenario. Add `--origin https://api.example.test` for each authorized separate API origin whose request/response bodies should be recorded. The starting page origin is always included; scope is never expanded automatically. These flags do not change COPY or REA's own scope. Run IDs link summary, network evidence, endpoint inventory and script links; scenario labels alone do not prove captures used equivalent inputs or state.

Begin with interception off in Burp: NBRET has finite navigation/action timeouts, so holding a request can cause capture failure. Use Burp HTTP history and Repeater to investigate after recording. NBRET's network recorder and REA observe the proxied page. COPY runs in separate browsers with direct connections; use `--no-copy` when all capture traffic must pass through the proxy.

## Export an existing capture

```sh
npm run investigate -- --run runs/proxied
```

No browser or network connection is used. The command creates a new `investigation/` directory and refuses to overwrite it:

- `postman.collection.json`: import into Postman to examine and manually replay recorded requests.
- `endpoints.json`: observations grouped by method, origin, and path, including response statuses, query keys, action IDs, cache/service-worker hits, and unavailable body counts.

Exports include only in-scope requests. They inherit capture redaction; authorization and cookie headers and transport-specific headers are excluded. Bodies that were omitted during capture cannot be recreated. Review all data before sharing, replace redacted fields locally as needed, and review each request before sending. Replaying POST/PUT/DELETE or other state-changing requests may repeat real actions. Client Shopify remains read-only unless Kotaro approves the specific mutation and scope.

## Repeatable local verification

```sh
npm run verify:proxy
```

Starts a local fixture and a forwarding proxy restricted to that fixture. Checks that the calculation POST traverses the proxy, its input and output are captured, and the exported collection preserves the request body. Artifacts and `proxy-check.json` are kept under ignored `runs/proxy-check-<timestamp>/`. COPY and REA are disabled to isolate network capture. Servers and the isolated browser close after the check.

To check an already running Burp listener with interception off:

```sh
npm run verify:proxy -- --proxy http://127.0.0.1:8080
```

For an external proxy, inspect its HTTP history for the fixture URL printed in the receipt; the script verifies capture and export but cannot independently assert what the external proxy recorded. This HTTP fixture does not verify HTTPS certificate handling.

The local forwarding-proxy check passed on 2026-10-13: four requests traversed the proxy, including `POST /sum` with input `{a:20,b:5}` and output `{result:25}`. `npm run verify:proxy:tls` verifies local HTTPS CONNECT; add `-- --proxy http://127.0.0.1:8080` for an existing Burp listener. Burp HTTP and HTTPS routing were subsequently verified against its MCP HTTP history, and a changed-input local MCP request returned 10 for 7+3. HTTPS used explicit TLS opt-in; installing/trusting a Burp CA remains unverified. Receipts are listed in verification-api-investigation.md.

## Working loop

1. Capture representative page interactions with NBRET.
2. Inspect endpoint inventory for missing states or failed responses.
3. In a local app or authorized test environment, use Burp Repeater or a Postman collection to compare one input change at a time.
4. Record findings and implement the observed behavior locally.
5. Use existing COPY comparison tools to verify appearance and interactions.

See [workflow.md](workflow.md) for bounded loopback replay, context-local response substitution, scenarios and offline comparison. General external replay is not implemented. Same-state COPY now shares the capture proxy; legacy separate COPY remains direct. Burp, ZAP, mitmproxy, and Postman are not installed by these commands.
