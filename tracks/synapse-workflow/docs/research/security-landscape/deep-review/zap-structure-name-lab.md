# Structural name round trip

Plan before execution2026-10-17: exact installed private insertion helper invoked reflectively with synthetic root-host messages, empty path list and temporary history ID-1. Fresh memory table; no history/body credential collection or network. Success: inserted query-bearing message must be found by public low-memory lookup; plain request is positive control. This bypasses public addPath/history creation and therefore tests helper/lookup composition, not full capture. Preserve failed attempts.

## Results

Initial run1792274836452 exited1 after confirming insertion duplication because fixture used trailing slash with manually empty paths; expected lookup name omitted that slash. Failure preserved, no product conclusion from that control. Corrected host-only URI matches actual empty path representation. Runs1792274849200/1792274850865 exit0 with11 checks each (seven repeat prior hierarchy checks),1081/1045ms. Insertion saves `https://lab.invalid (a) (a)` while public name computes `https://lab.invalid (a)`; public low-memory find returnsnull. Parameter-free host positive control is found. **Round-trip success criterion fails.** Results repeat with identical output hash617d6d84656ec4cb951e69f39adc94cb9460821940244d50fa0a7acb90ddbd68.

This executes real private insertion/public lookup helpers and the default memory table with an injected database seam. Public addPath/history construction, API response, networking and real scan coverage are not executed. Reflection and synthetic historyId-1 are explicit lab limitations. No false-positive/recall estimate or production fix. [Receipts](zap-structure-name-lab-receipt.json). Reproduce with `node scripts/research-zap-structure-name-lab.mjs`.
