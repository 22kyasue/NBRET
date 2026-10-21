# HTTP cache budget decision lab

Planned 2026-10-17 before execution. Success criterion for a strict budget: once a synthetic owned cache directory already exceeds a 50-byte budget, every subsequent admission check must reject; memory fallback must also reject an incoming record exceeding that budget if the same cap is intended to apply. Controls: below-budget directory admits, first above-budget sample rejects.

Extract unchanged overBudget and dirSize functions (173–202) from pinned Nuclei pkg/protocols/http/httpcache/httpcache.go (a151a1d54fad0d5ef71f01662b0bb3955a98c7c5, SHA-256 5be76e94a7fccbe86383aed0022404ce2c876a338a4b040ecf1b6575d59978b8). Minimal struct fields match the implementation; owned t.TempDir files contain synthetic bytes. No full cache/LevelDB/transport code, listeners, HTTP, credentials, dependency downloads or exhaustion. No cleanup of existing data. Tests assert observed branch decisions, so a passing counterexample test means the strict product criterion failed. Record exact source/extract/fixture hashes, Go version, timings and logs; repeat once.

## Results

Two runs completed with Go 1.27.2 Windows amd64, module networking off, 984ms and 910ms. All three counterexample/control tests passed each time. A 100-byte synthetic file against a 50-byte cap caused 2 rejections and 31 admissions across 33 consecutive checks. Empty-directory memory mode admitted an incoming 100-byte record against the same 50-byte cap. Below-budget control admitted normally. Thus the planned strict-cap success criterion failed; the sampled policy works as the implementation describes.

This validates only the exact decision functions with a minimal struct and synthetic owned filesystem. It does not measure actual LevelDB growth, memory consumption, complete transport behavior or a customer incident. No network calls or dependency downloads; no runtime costs charged. Whole logs differ in timestamps; semantic outcomes agree. Source extraction SHA-256 3ee4147dcfd514b97ddc2208ea910446bec2c4bc3e83d2d4a98b638a67b8f415; fixture SHA-256 683ef83200a08aa1d5e8b5811b59e0fedbdda99aaaf9fb16d7e81e7e5cf4b030.

[Both run receipts](nuclei-http-cache-budget-lab-receipt.json). Reproduce: `node scripts/research-nuclei-http-cache-budget-lab.mjs` from NBRET; generated receipts/logs are retained in separate runs directories. Latest receipt output is overwritten by reproduction, previous run directories remain.
