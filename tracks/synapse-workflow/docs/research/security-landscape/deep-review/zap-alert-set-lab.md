# Installed AlertSet projection lab

Plan before execution,2026-10-17. Use installed ZAP2.17.0 AlertSet and Alert classes, headless source-launch Java fixture. Synthetic alert IDs/risks only; no ZAP daemon, targets, scanner, network, database, credentials or production writes.

Success criterion: after clearing collection, highest-risk getter should be null; after replacing one high alert with lower-risk same-ID alert, highest-risk object should belong to current set and reflect replacement. Controls: distinct-ID risk ordering and removing current maximum must recompute correctly; standalone SiteNode exclusion should clear inclusion. Tests assert observed counterexample behavior separately, so passing counterexample checks means semantic criterion fails. Read source/tests before executing. Pin core commit8a1bff313f4d183dba5aa154ecbe89ad751c9153; reviewed AlertSet SHA-256 a8bce00b8bb8b066381975342a91b05c72c6bf741a288e0791ec7c74dc037db4. Record installed jar, exact Java command/version, fixture/log hashes, timings and repeated outcomes. Does not establish report corruption or real scope violations.

## Results

Two runs each completed nine checks,742ms and696ms, installed core jar SHA-256015dda4709b5ef79736086bb41e8e2a4e95b04cf6625f14d6bcc02b197c99c0c. Stdout bytes identical SHA-25653c99129967f0eb30f1e37eb81e98f97b20498193751800947d59765cb5ceede. [Both receipts and Java version](zap-alert-set-lab-receipt.json).

Confirmed: after clear, size0/isEmpty true but highest getter returns old alert; after replacement with same ID, current map contains the new low alert but highest getter returns old high object. Distinct-ID ordering and removal recomputation controls pass. Scope projection control confirms exclusion clears inclusion; subsequent inclusion setter can make both flags true. Thus the planned consistency criteria fail. These are actual installed-class object outcomes, not a simulated collection.

No actual report, persisted finding, UI screen or active scanner was exercised. SiteNode.deleteAllAlerts resets its own highest cache, which is positive compensation; whole-product impact must be traced per caller. Stored alerts were not deleted or changed. No cloud/model cost. Reproduce `node scripts/research-zap-alert-set-lab.mjs`; previous runs/logs retained separately.
