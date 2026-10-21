# Scanner adapter validation plan

Defined 2026-10-17 before execution. Test the real `runScan` adapter against a deterministic in-memory ZAP API transport. No daemon, target HTTP request, model, credential, or third-party system is involved. This validates adapter state/attribution logic only; subsequent ZAP source/runtime work is required to establish real-daemon semantics.

1. Supply URL scope `/allowed`, then return one alert for `/allowed`, one for `/outside` on the same origin, and one different-origin alert. Hypothesis: the adapter retains both same-origin alerts and discards the foreign origin. Check which proof fields survive projection.
2. Simulate scan creation succeeding server-side, followed by loss of its API response. Hypothesis: no owned scan ID is retained and no stop request occurs, although context removal is attempted. This is an uncertain-operation state, not proof a real daemon remains active.
3. Simulate context creation succeeding followed by response loss. Hypothesis: context cleanup is gated on a received context ID, so no remove request occurs even though the generated context name is known.
4. Return a nonempty passive queue throughout a 1-second deadline with no owned active scan. Hypothesis: a shared/global queue can time out this run. Confirm no global stop/shutdown is attempted.

Preserve API-call order, returned result, fixture-side state, adapter/source hashes, elapsed time, and explicit simulation labels. Do not change production code or interpret expected reproduced gaps as actual ZAP vulnerabilities.
