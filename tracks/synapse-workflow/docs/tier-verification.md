# Four-tier verification — 2026-10-14

Implemented and tested on Kotaro's PC with Node 24.21.0, existing computeruse AI Chrome, REA 6.4.0 and ZAP 2.17.0. All test targets are controlled local fixtures.

`node --test test/*.test.mjs` covers collector redaction and resource limits, real REA/COPY integration and source hashes, capture failure handling, exact-origin scope, paired probe variations, response size limits, redirect escapes, cyclic discovery, destructive-link skips, depth limits, wall-clock request timeouts, ZAP context scoping and cancellation of an owned scan after API failure.

Full regression result: 10 tests passed, 0 failed. A repeat real demo exposed ZAP's asynchronous URL-history insertion; the adapter now waits for the seeded URL to be visible before starting a scan.

`node scripts/demo-tiers.mjs` runs all four real adapters in sequence. It asserts Capture/REA/COPY success, two explored pages, four UI states, successful owned-tab cleanup, probe outputs 25/10, completion of a real ZAP active scan, and removal of its context. It writes a `VERIFIED.json` receipt only after those assertions pass. The demo owns and shuts down its loopback fixture and ZAP daemon.

Initial verified run: `runs/tiers-demo-1792004449707/VERIFIED.json`. Full evidence is in its `evidence/` subdirectory and remains ignored by Git. The ZAP release download is recorded in `.tools/zap-receipt.json`, with SHA-256 `94c8f767b1c2e94f0db66b3ae56514d5e3f5a728ee1b6c798e0c8fe2d61fbff0` and 286,652,857 verified bytes.

Repeat verified run after the ZAP history-wait fix: `runs/tiers-demo-1792004759758/VERIFIED.json` (2 pages, 4 states, outputs 25/10, ZAP 2.17.0, 1 completed active scan, 3 alerts).

Follow-up verification: 11 tests passed, 0 failed, after adding offline contract planning and endpoint-specific probe comparisons. The planner test covers redacted credentials, path escapes, sample limits and a 4,096-byte total output limit. The standalone `plan` CLI succeeded without sending requests. Real combined run `runs/tiers-demo-1792005294399/VERIFIED.json` captured two POST input/output pairs, generated 8 unexecuted probe proposals, and passed all four tiers. Its human-readable report is `evidence/REPORT.md`.

The local fixture produces three ZAP alert summaries. This verifies scanner integration and evidence handling; it is not a security assessment of a production target. No third-party scan or production deployment was performed.
