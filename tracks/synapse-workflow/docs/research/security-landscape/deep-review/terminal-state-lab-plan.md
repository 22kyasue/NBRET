# Terminal-state adapter experiment

Defined before execution, 2026-10-17. Execute the real `runScan` adapter against an in-memory transport, with no daemon or network. Supply one active scan whose numeric API status is 100 while simulated hidden server ground truth records an interrupted run with pending rules. Success for reproduction: adapter writes `completed` and requests neither rule progress nor terminal history. This establishes adapter interpretation only; the Java source separately establishes that stopped scans return 100 and FINISHED. It does not establish a real-daemon interruption occurred.

Record calls, ground truth, complete adapter result, Node version, timing and source hashes. A stronger future real-daemon experiment must use an owned loopback synthetic target, stop an identified scan before rule completion, preserve per-rule progress and logs, and distinguish stop request from worker termination. No production change is implied.
