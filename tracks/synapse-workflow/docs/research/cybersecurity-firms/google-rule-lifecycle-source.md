# Detection rules: write, compile, replay, deploy and alert are separate steps

Source-only review, October 17, 2026. Existing [google/secops-wrapper pin](https://github.com/google/secops-wrapper/tree/ca553eb7dc940bd113704c737db04324f25c2ed1); public wrapper, not the remote detection engine. No rule, request, test, replay, generated code or customer configuration was executed.

## Selected source boundary

Read [rule.py](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/src/secops/chronicle/rule.py) completely, including creation/retrieval/listing, updates/deletion, deployment fields, local regex search and historical testing. Read the complete [rule test file](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/tests/chronicle/test_rule.py), relevant public client delegates, and previously read request/pagination/auth/error helpers.

The [separate rule validator](google-natural-language-search-source.md#rule-compilation-is-a-different-validation-step) submits text for compilation diagnostics. The [chat wrapper](google-gemini-client-source.md) can return proposed code. Neither automatically chains into rule creation/deployment in these reviewed paths.

## What the integration can request

| Step | Local behavior | What that does not establish |
| --- | --- | --- |
| Create | POST supplied rule text to rules, default API v1 | Not a local approval process, corpus test or confirmed continuous execution |
| Read/update | GET a rule; PATCH only text with update mask | Latest-version defaults do not preserve a local rollback snapshot |
| List/find | Shared paginated list; regex filtering of fetched text happens locally | Not a server semantic query or proof of rule effectiveness |
| Historical test | POST rule text/time interval to a legacy test endpoint; normalize returned items | Returned matches lack a labelled denominator for false negatives |
| Enable | PATCH deployment enabled field | Different from enabling alerts |
| Alerting | PATCH deployment alerting field | Does not establish downstream notification/response delivery |
| Other deployment fields | Optional archived/runFrequency fields produce a field mask | Type hints and docstrings do not prove local invariant enforcement |
| Delete | DELETE, optionally force=true | Not a remediation rollback or restoration of prior behavior |

No selected write wrapper asks for human confirmation, runs the compiler/test first, or automatically polls deployment health. That is a boundary of this SDK, not proof that the Google console or managed-service process lacks such controls. Remote IAM and validation remain server responsibilities; caller permission was not tested.

The deployment helper rejects an update with no fields. It includes explicitly supplied False values, so “disable” is not silently omitted. It constructs the mask in a fixed source order. The docstring says archiving must accompany disabled execution and implies alerting is disabled by API semantics; the wrapper itself does not enforce those relationships. The remote contract needs separate evidence before assuming a combination is accepted or safely transformed.

## Historical replay is not a live stream monitor here

run_rule_test validates the numeric result limit between 1 and 10,000. Its generator sends a POST with a default 300-second request timeout through chronicle_request. That shared helper parses the **complete JSON response** before the generator yields items. Despite the “streaming” docstring, this implementation is not incremental HTTP-chunk processing.

Items are mapped to detection, progress, compilation error, rule error or a too-many-detections notice; unrecognized items are yielded as received. Compilation/rule errors can therefore be yielded records rather than raised exceptions. A consumer must inspect item types, not merely finish iteration and report success. A progress value does not prove an effective rule; a truncation notice expressly limits result completeness.

Naive times are assigned UTC, while already-aware times are formatted with a literal Z without converting other offsets. This shares the normalization concern described in the search trace. No start-before-end validation appears locally. These are input-contract observations, not verified server behavior.

## Tests and what remains unknown

Mock tests check creation, text updates, get/delete/force-delete, enable/disable, list aggregation and filtering, empty results and HTTP-error wrapping. The replay test uses a parsed JSON array of progress/detection items; an unused fixture also defines stream chunks. It does not demonstrate actual streaming. Tests cover out-of-range result limits and request exceptions, not real telemetry quality or a security outcome.

The reviewed test file does not establish coverage for every replay error variant, non-UTC inputs, deployment convergence, combined archive/alerting invariants or rollback. Any additional deployment tests are separately recorded when read.

Before/after workflow reconstruction: an analyst reviews proposed rule text, separately compiles it, examines bounded historical matches, decides whether to create/update and enable it, and observes live detection/alert behavior. This is a recommended interpretation of the separate API boundaries, not a claim that the SDK enforces that sequence. Business approval, saved prior versions, staged rollout and recovery ownership remain integration/service questions.

## Additional deployment tests read

The complete tests/chronicle/test_rule_deployment.py now adds exact assertions for enabled-only, multiple fields, archived-only, empty update, HTTP error, disable and alerting wrappers. Its archived-only fixture returns mocked success; it does not resolve the remote invariant question above.

The complete tests/cli/test_rule_deployment_integration.py is an explicitly integration-marked live workflow: subprocess CLI calls create a rule, enable it, list/get deployment and enable alerting, with fixed waits and finally-block deletion. It checks returned enabled/alerting fields, but does not inject an event or verify a generated detection/notification. Cleanup failure is printed, not guaranteed reversal. Credentials/environment fixtures and the CLI implementation are separate unreviewed boundaries. This integration test was read only and was not run. The warning strings inside its source are potential test output, not warnings observed in this research session.
