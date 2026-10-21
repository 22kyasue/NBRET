# Follow-up plan: offline identity matching

2026-10-17, after the first receipt and before this follow-up executes. Source observation: `checks.mjs:82–83` matches method, sanitized URL and cleaned body, without headers. Hypothesis: a saved request under synthetic tenant A can be selected when the offline specification supplies tenant B headers.

Experiment: in fixed mode, request invoice A as tenant B and require 403 plus absence of invoice. Compare the fresh result with an offline evaluation using the earlier fixed-mode tenant-A observation at the identical URL. Expected finding: fresh test passes, offline evaluation fails because it reads A's captured 200 response. Do not label this as a live authorization vulnerability. The defect under investigation is ambiguity in reassessing identity-specific evidence; whether arbitrary real authentication headers have identical behavior remains a separate question.

Keep the first plan and receipt unchanged. Record the mismatch separately from live-oracle false-positive/negative counts. Strong live checks must continue to identify all known variants. This follow-up is a local research observation, not a production code fix.
