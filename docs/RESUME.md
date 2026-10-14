# NBRET handoff — 2026-10-14

Kotaro explicitly paused for sleep. Resume in `C:/Users/kotar/githubprojects/NBRET-api-investigation`, branch `feat/api-investigation`; do not work in main. Changes are saved locally, uncommitted and unpushed. Main's unrelated untracked work remains untouched.

## Verified state

- 42 tests pass; 72 JavaScript module syntax checks, Python addon syntax and git diff whitespace checks pass.
- Same-state extraction, independent worker/service-worker/OOPIF network evidence, scoped session reuse/reset, structured stream and motion comparisons, mobile/reduced motion, observed API contracts, asset reuse and artifact review inventory are implemented.
- Burp HTTP/HTTPS fixture and changed-input MCP experiments were independently verified. Burp temporary project remains on the AI desktop; interception restored enabled.
- Strict process-scoped Burp CA trust passes: default trust rejects, explicitly supplied CA verifies chain/hostname and result25. No Windows trust stores changed.
- Isolated mitmproxy12.2.3 and portable ZAP2.17.0 independently match local result25 and same-state COPY. Owned temporary proxy processes were stopped. Final ZAP setup uses only network and mandatory callhome addons, silent/safe mode.
- Requirement-aware offline profile advisor and four read-only MDN desktop/mobile captures verified. Comparison now separates missing-body evidence differences from observed behavior differences.

## Receipts and documentation

- `docs/workflow.md`, `docs/gaps.json`, `docs/verification-api-investigation.md`.
- `runs/proxy-products-1791965800515/receipt.json` and each product's history.json.
- `runs/proxy-ca-1791965439989/receipt.json` and burp-history.json.
- `runs/public-benchmark-1791965591029/receipt.json` and recomparison.json.
- `runs/profile-benchmark-1791964592598/profile-benchmark.json`: three samples per profile; medians network1.40s, behavior1.42s, full3.07s. Profiles collect different evidence.

## Browser CA step (done 2026-10-14)

Kotaro approved the temporary Current User trust test, and Beck (Claude) ran it. Burp was restarted with a temporary project. Its CA matched the exported proxy-ca.pem, and interception was already off, so no Burp settings changed. Kotaro confirmed both Windows prompts (add and delete). Chromium through Burp with strict TLS read result25 with no errors. The certificate was removed and confirmed absent from CurrentUser and LocalMachine Root. Receipt: `runs/browser-ca-1792001170618/receipt.json`. Burp's temporary project is still open on the AI desktop.

Next: commit the branch when Kotaro asks; otherwise pick from `docs/gaps.json`.

## Remaining limits

Broader authenticated real-app coverage needs owned representative targets/scenarios. Binary stream protocols, arbitrary canvas/JS animation recovery, child-frame DOM and short-lived lifecycle coverage remain limited. No production scans, Shopify writes, deployments, commits or pushes were performed.

Use the existing computeruse_desk harness for desktop/browser control; preserve unrelated sessions. Client Shopify remains audit-only without specific mutation approval.
