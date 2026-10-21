# AgenticBlue: customer separation and a bounded speed claim

Accessed October 17, 2026. NRI's developer-authored [August 14, 2026 implementation article](https://www.nri-secure.co.jp/blog/agentic-soc), main text read completely, adds:

1. Customer procedures load only when relevant. Early-close branches skip detailed analysis/severity stages.
2. MCP retrieves SIEM results; local scripts aggregate/filter before selected facts reach the model. Unknown patterns use newly constructed queries.
3. Before tool execution, a deterministic hook compares the SIEM destination with the customer currently investigated; mismatches stop. It also describes blocking destructive commands, unauthorized external destinations and unexpected writes.
4. After execution, structured records capture tool inputs/results and interpretation; a separate model reviewer checks judgment quality.

This is a described implementation, **not inspected source or tested isolation**. Fail-closed behavior across retries, identity binding, script correctness and reviewer error rates remain unverified.

Its greater-than-30% processing-time reduction is an internal before/after comparison for representative alert types after three context optimizations. Sample size, distribution, absolute latency and accuracy metrics are undisclosed; it is not a universal analyst productivity measurement.

The current [service FAQ](https://www.nri-secure.co.jp/service/mss/secureprotecht) additionally says logs/investigation data stay within an isolated execution environment and are not used for external model training. This does not disclose its physical region, model supplier or retention period. It expressly positions AI efficiency as a secondary effect rather than a promise of lower prices, and disclaims guaranteed detection/judgment accuracy.
