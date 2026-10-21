# Natural-language search: generated query, executed search and incomplete results

Source-only review on October 17, 2026, using the existing [google/secops-wrapper pin](https://github.com/google/secops-wrapper/tree/ca553eb7dc940bd113704c737db04324f25c2ed1). This is an assistant-driven search path, separate from chat and the Triage and Investigation agent. No source module, tests, generated query, network request or retry was executed.

## Selected chain read completely

- [nl_search.py](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/src/secops/chronicle/nl_search.py): translation, orchestration, error handling and retry.
- [search.py](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/src/secops/chronicle/search.py): actual search request and result shaping.
- Complete [natural-language tests](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/tests/chronicle/test_nl_search.py) and [search tests](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/tests/chronicle/test_search.py).
- client.py public delegates at 949–994, 3252–3265 and 3343–3376; previously read request, auth and error helpers remain shared dependencies.

A user supplies natural-language text and a time interval. The translation helper POSTs text to :translateUdmQuery. A returned message causes APIError; otherwise it returns the query field or an empty string. The combined function immediately passes that query to the client's search method. No local human approval or nonempty-query check appears between translation and search in this path. Standalone translation is available for callers wanting to review first.

The search helper GETs :udmSearch in v1alpha with query, time interval and result limit. It makes one helper request, not a completion-polling loop. case_insensitive and max_attempts are retained but explicitly unused in this implementation, despite higher-level docstrings describing their effect. Defaults and compatible parameter names must not be treated as implemented controls.

## Retry and time boundaries

The combined function catches APIError and retries when its message contains 429 or RESOURCE_EXHAUSTED. It redoes translation **and** search, not just the failed stage. Initial attempt plus ten retries uses sleeps of 5, 10, …, 2560 seconds: 5115 seconds (85 minutes 15 seconds), calculated from the code, excluding request time and lower-level retries. This is not an observed latency or service promise.

The separate search request has a default 30-second timeout; translation does not pass a timeout to the shared helper. The combined public method does not expose the search timeout. Therefore max_attempts does not provide an end-to-end time budget here. Existing auth-level HTTP retry behavior is another layer.

Both times are formatted with strftime and a literal Z without UTC conversion in this helper. Non-UTC aware or naive datetime values can consequently be labelled as UTC without normalization. The tests supply UTC datetimes; they do not cover this mismatch. Correct server interpretation and any caller normalization remain outside these files.

## What the returned count means

Dictionary output includes returned events, their local list length and a more-data flag. The length is **not the total number of matching events in the estate**. The helper does not fetch further pages. as_list output drops the more-data flag. Missing events/moreDataAvailable fields default to an empty list/False; that shape alone is not proof of an exhaustive search or clean environment.

The source supports a concrete before/after: instead of manually writing a search expression, an analyst can ask in plain language and automatically retrieve matching records. Generated syntax, search completeness and correct interpretation still require review. The wrapper does not disclose the translation model, retrieval/grounding internals, evaluation dataset, price, data retention or separate action-approval mandate.

## Test evidence

Mocks check translation payload and query forwarding; a message-bearing 200 response raises; translation failure prevents search. Retry tests model one failure then success and eleven persistent failures, checking sleep/call counts without waiting. Search tests check request parameters, result shaping, missing fields, list output and timeout forwarding. They do not evaluate query semantics against real telemetry, every retry delay, non-UTC input or complete result retrieval. No test run is claimed.

## Rule compilation is a different validation step

At the same pin, rule_validation.py and tests/chronicle/test_rule_validation.py are read completely, plus client.py 3233–3250. This helper strips leading/trailing backticks and whitespace from supplied rule text, POSTs ruleText to v1alpha :verifyRuleText, and returns a local ValidationResult. A successful response becomes success=True; otherwise only the first compilation diagnostic/message/position is retained, with a generic unknown error when no diagnostics exist. It does not deploy a rule, run it against an event corpus, or establish false-positive/false-negative rates. Text cleanup is character stripping, not full Markdown code-fence parsing.

Mock tests assert method/path/version and inspect cleaned text, success, one diagnostic with/without position, no diagnostic and propagated APIError. They do not compile a real rule, cover multiple diagnostic ordering/severity, prove query effectiveness, or demonstrate safe rule deployment. The natural-language search path above does not call this rule validator; search-query translation and YARA-L rule compilation must not be conflated. No API/compiler/test execution occurred.
