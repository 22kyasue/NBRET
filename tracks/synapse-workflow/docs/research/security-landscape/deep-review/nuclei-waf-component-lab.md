# WAF telemetry component evaluation

Plan before execution, 2026-10-17. Copy unchanged waf.go, literal_matcher.go, waf_test.go and embedded regexes.json from pinned Nuclei a151a1d54fad0d5ef71f01662b0bb3955a98c7c5 into an isolated standard-library-only Go module. No engine/package dependency graph retry. No stubs, network, listeners, WAF bypass traffic, credentials or third-party testing. The embedded definition file is copied and hashed, not credited as semantically reviewed.

Success: all upstream deterministic tests and fuzz seed cases complete with no failure, demonstrating selected synthetic signature decisions, prefilter invariants and byte matcher behavior. This does not establish real-world WAF identity accuracy, evasion resistance, application vulnerability coverage or a sustained fuzz campaign. Run twice without dependencies/network; record file hashes, exact command, version, duration, log hashes and test results. Benchmarks and live scanning excluded.

## Results

Both unchanged-component runs passed on Go 1.27.2 windows/amd64 in 1244ms and 1197ms, module networking off. Deterministic signature/prefilter/matcher checks and both fuzz functions seed corpora passed; this was ordinary go test, not mutation fuzzing. [Both receipts](nuclei-waf-component-lab-receipt.json) retain individual event names and hashes. No model or cloud cost. No full Nuclei suite claim.

The tests demonstrate correct outcomes for selected synthetic text, nil handling, Unicode case folding, overlapping literal matching and sampled prefilter-vs-regex invariants. They provide no independent customer labels or precision/recall estimate. Signature presence can be quoted in arbitrary content, and first matching signature is chosen from Go map iteration: identity output is a heuristic, not independently validated deployment evidence. No bypass or live assessment tested.
