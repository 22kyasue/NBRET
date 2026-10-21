# Reporting state experiment

Predeclared 2026-10-17. Feed `runAnalysis` a minimal coherent synthetic capture with no recorded capture/explore/probe gaps and a failed scanner artifact. No network or captured-code execution. Reproduction success: analysis retains scanner.status=failed but reports no-recorded-gaps; Markdown scanner line and rendered HTML omit SCAN_FAILED. Record complete input/output hashes, runtime and assertions. This does not establish that every real failed scan produces the same report or that a report's caveats claim security assurance.
