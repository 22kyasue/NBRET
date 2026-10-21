# One concrete ZAP rule: directory browsing

Installed active-rules addon 78, matching source commit `8b171e1c8704d2996b75d4bc119cbf9495d9aa12`. [Pinned implementation](https://github.com/zaproxy/zap-extensions/blob/8b171e1c8704d2996b75d4bc119cbf9495d9aa12/addOns/ascanrules/src/main/java/org/zaproxy/zap/extension/ascanrules/DirectoryBrowsingScanRule.java); git access 2026-10-17. Archive hashes in addon-artifacts.json; exact file hashes/ranges in file-queue.json. Build equivalence unproven.

## Complete implementation 1–202

1–49 contains legacy license and AbstractAppPlugin/CommonActiveScanRuleInfo dependencies. 51–81 defines policy/classification tags and regex signatures. 83–111 provides rule ID 0 and localized metadata. **113–122 removes query and appends slash to the cloned request URI.** 124–166 sends it, accepts isPage200, then matches body signatures: IIS Parent Directory or Apache/Tomcat Directory Listing at medium confidence; general Parent directory or Directory plus IMG= at low confidence. IOException is silently caught. A positive creates and raises the alert with that message. 168–202 supplies builder, example, medium risk, tags and CWE548/WASC48.

This is signature detection, not proof that sensitive files exist or can be retrieved. Text patterns are evidence for a listing hypothesis. It does not enumerate files or independently validate impact. Technology selection affects some signatures. Confidence is a rule-assigned label. The example-alert object is documentation, not observed target evidence.

## Complete unit test 1–118, read not executed

1–46 imports harness and constructs rule; 48–78 verifies taxonomy/policy mappings; 80–95 verifies example metadata; 97–118 serves a canned directory HTML response and expects one alert with Parent Directory evidence. No negative signature examples, rewritten-path scope enforcement or IOException completeness assertion appears in this file. Inherited test harness remains a queued dependency.

## Real owned-loopback evaluation

[Predeclared plan](real-zap-lab-plan.md), [receipt](real-zap-lab-receipt.json), ignored original run `runs/real-zap-research-1792266641246/receipt.json`. Actual ZAP2.17.0, installed addon78, fresh owned daemon/default policy with only rule0 enabled. Fixture traffic was GET /allowed followed by GET /allowed/. NBRET context was configured for /allowed, scopeMode=urls, recurse=false. Adapter completed and kept the /allowed/ alert because local alert filtering is origin-only. This confirms **configured exact-path scope does not constrain this rule's initial rewritten destination**. Both fixture paths were deliberately authorized; no third-party request or exploitation.

Upstream alert included Parent Directory evidence, method GET, sourceMessageId1, messageId4, id0, attack and tags. NBRET kept name/risk/confidence/URL/classification and discarded these evidence links. Source chain: candidate scoped before scheduling → rule rewrites URI → generic send validates redirects but not this initial URI → origin-based summary filter. This is one controlled run, not consistency or general scope-quality measurement. The synthetic body deliberately contains the signature; no actual sensitive directory or disclosure was present.

Runtime13.19s including startup/cleanup; zero models. Fixture closed and API unreachable after owned stop; this observes those resources, not guaranteed erasure of daemon files or all worker lifecycle states.

## Real interruption case: late evidence after completed report

Predeclared addition in the same plan; [independent receipt](real-zap-stop-receipt.json), original `runs/real-zap-research-stop-1792266693823/receipt.json`. Delayed /allowed/ response 2500ms. Actual known scan0 stop returned OK at 19:51:44.985Z. Status API returned100; NBRET wrote completed, errors=[], contextRemoved=true and returned at19:51:45.656Z while fixture response remained pending until19:51:47.487Z. At return, scans view state FINISHED but progress0/reqCount0/alertCount0; rule-progress view still99%. After waiting3s, scan counts became1request/1alert and the directory alert with messageId4 existed upstream. NBRET's earlier report lacked it.

This demonstrates a controlled race between stop-as-terminal interpretation and ongoing work/evidence. Context removal did not prevent that in-flight rule from finishing and raising an alert. It does not prove all rules continue after stop or that new requests necessarily start after stop. Numeric status100 and FINISHED are insufficient completion/quiescence receipts in this environment. The later alert is heuristic synthetic-signature detection, not independently validated sensitive-data disclosure.

Runtime14.88s including startup/wait/cleanup; owned API closed and fixture closed. One interruption run, no consistency percentage. Simulated terminal-state receipt remains separate; this real-daemon receipt upgrades this particular scenario to runtime evidence without retroactively validating other simulated failures.

## Repeated controlled observations

[Repeat ledger](real-zap-repeats.json) preserves hashes and separate [receipt files](receipts/normal-1.json). Two normal runs both requested rewritten path and captured the rule alert. Two interrupted runs both returned completed while fixture response pending, omitted the early directory alert and observed it later. Cleanup checks passed in all four. This is a small repeated timing experiment, not an estimated population success rate. Baseline timestamps above refer to receipts/stop-1.json; latest convenience receipt paths now contain the second run. Source script evolved before interruption/repeats; each receipt retains its actual source hashes.
