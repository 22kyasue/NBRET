# Nuclei upload buffering contract lab

Plan recorded before execution, 2026-10-17. Pin a151a1d54fad0d5ef71f01662b0bb3955a98c7c5, internal/pdcp/writer.go.

Question: does every newline-delimited synthetic record survive the buffer threshold branch? Success criteria: exact-limit control retains both records; crossing-limit and oversized cases account for each record; failed flush preserves old buffered bytes.

Extract unchanged autoCommit/uploadChunk lines126–209 with exact4MiB constant. In-memory upload/logger/structure stand-ins; finite io.Pipe strings and EOF join. No HTTP, credentials, external calls or scanner. Standard-library Go module, networking off. This is buffering evidence only, not cloud acceptance/full writer construction/Close/customer data loss.

Setup: initial PowerShell node-e file creation lost quoted strings and failed before creating fixture or running tests. No assertions; corrected by direct Node filesystem API.

First actual fixture run1792271920702 failed compilation: missing standard-library io import in generated harness; zero tests. Original source unchanged. Receipt preserved in runs directory.

## Result

Corrected repeats1792271933714 and1792271935188: four fixture tests pass, 930/924ms. Product preservation criterion fails in crossing/oversized cases: exactly4MiB control uploads both lines; crossing B is counted but absent from in-memory recorded uploads (A and C retained); a single oversized line produces an empty upload and no retained record; a failed boundary flush retains/retries A but still drops B. Fixed source functions and fixture hashes match across repeats. Logs include timestamps so whole-log hashes differ; no identical-log claim. Latest [receipt](nuclei-upload-buffer-lab-receipt.json); original failure and both successful receipts in named ignored run directories.

This establishes deterministic local buffering behavior with inert upload stand-ins. It does not establish cloud acceptance, real customer frequency/impact, cancellation drain, network retry behavior or full executable quality. No external upload/credentials used, no dependency downloads, production fix or public disclosure performed. A credible regression would require byte-for-byte accounting across boundary success/failure and oversized record policy, with explicit acknowledged/dropped counts.
