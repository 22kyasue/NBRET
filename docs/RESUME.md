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

## 2026-10-14 session (Beck, Claude)

Kotaro approved the temporary Current User CA test. It passed and the certificate was removed (`runs/browser-ca-1792001170618/receipt.json`). All work is committed on `feat/api-investigation`, not pushed. 53 tests pass.

Improvements, each with tests and a gaps.json update:
- G01/G03: same-state COPY extracts child frames (same-process and out-of-process, nested), frame-attributed CSS, and a full-page screenshot.
- G04: session export/import carries sessionStorage and IndexedDB.
- G05: opted-in binary/unstructured stream messages keep a SHA-256 digest, size and sniffed format, so runs compare message by message without storing raw bytes.
- G06: same-state COPY saves canvas pixels, the drawing context and an animated/static signal.
- G07: contracts report nested field presence (a.b, a[].c) per response status.
- G03: target lifecycle is recorded; short-lived worker bodies are kept by holding responses at the page session; commands to ended targets fail fast.
- G10: review scans text artifacts for credential shapes (kind/file/line only). Zero findings on 3,253 existing artifacts.
- G02: `--trust-ca` audits each HTTPS origin chain against a proxy CA with no OS trust change. Verified live through Burp (`runs/proxy-audit-1792002996241/receipt.json`); a wrong CA is flagged. Chrome's SPKI allow-list flag only matches leaf keys, so it cannot scope trust to a CA.
- Real-site check: full-profile MDN capture (`runs/mdn-full-1792003047`) succeeded with no errors.

Burp's temporary project is still open on the AI desktop with interception off. Next: G08 needs Kotaro's own representative targets.

## Remaining limits

Broader authenticated real-app coverage needs owned representative targets/scenarios. Binary stream protocols, arbitrary canvas/JS animation recovery, child-frame DOM and short-lived lifecycle coverage remain limited. No production scans, Shopify writes, deployments, commits or pushes were performed.

Use the existing computeruse_desk harness for desktop/browser control; preserve unrelated sessions. Client Shopify remains audit-only without specific mutation approval.
