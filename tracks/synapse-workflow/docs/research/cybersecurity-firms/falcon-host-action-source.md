# FalconPy: a containment request is not completed containment

Read **2026-10-17**, source-only. CrowdStrike/falconpy pin `06a5df86bc68e492db339dccacdff4a9b9ad61ec`. This is a public client library and example, not Falcon's closed endpoint sensor or CrowdStrike's managed-service runbook.

## Selected workflow

The [quarantine example](https://github.com/CrowdStrike/falconpy/blob/06a5df86bc68e492db339dccacdff4a9b9ad61ec/samples/hosts/quarantine_hosts_new.py) reads client credentials from a file, creates a Hosts client and queries a hostname with limit ten. On an HTTP 200 result with returned resources, it sends **all returned device IDs** to perform_action, choosing contain or lift_containment. The sample does not require a unique identity match, paginate additional results, ask an operator for confirmation or poll host state. Its 202 branch prints that the host has been contained/released. This wording goes further than the evidence collected by that sample: it sees the action request's response, not subsequent endpoint enforcement.

The [Hosts service](https://github.com/CrowdStrike/falconpy/blob/06a5df86bc68e492db339dccacdff4a9b9ad61ec/src/falconpy/hosts.py) perform_action method selects the PerformActionV2 operation and validates the action against six configured choices. The [operation metadata](https://github.com/CrowdStrike/falconpy/blob/06a5df86bc68e492db339dccacdff4a9b9ad61ec/src/falconpy/_endpoint/_hosts.py) supplies POST routing and query/body contracts. Containment is documented there as limiting communication to CrowdStrike cloud and policy-allowed addresses; it should not be explained as disconnecting every network path.

The decorators, service_request and perform_request helpers in [utility functions](https://github.com/CrowdStrike/falconpy/blob/06a5df86bc68e492db339dccacdff4a9b9ad61ec/src/falconpy/_util/_functions.py) assemble arguments and process the response. The selected [service base](https://github.com/CrowdStrike/falconpy/blob/06a5df86bc68e492db339dccacdff4a9b9ad61ec/src/falconpy/_service_class/_service_class.py) establishes client configuration/authentication-object handling. The selected APIRequest class then carries connection, payload and behavior parameters. These layers do not add the missing operator decision or endpoint-state confirmation to this sample. The [authentication follow-up](falcon-auth-source.md) now traces token/configuration helpers; the closed authorization server remains unavailable.

## Test evidence and limits

The [host test file](https://github.com/CrowdStrike/falconpy/blob/06a5df86bc68e492db339dccacdff4a9b9ad61ec/tests/test_hosts.py) imports authentication setup and includes service calls and hide/unhide actions. It is not an inert fixture-only suite suitable for casual execution on this PC. The action assertions accept response status categories, including 202, and some paths can skip after failure; they do not prove an endpoint enforced containment. **Tests were read, not run.**

The pyproject dependency declaration includes requests and urllib3 without establishing the exact installed dependency graph here. Other base-class methods, result conversion and third-party transport behavior remain partial/unread in the ledger. The sample and selected routing/action chain are meaningfully traced, but this is not a complete repository review.

## Operational interpretation

A buyer supplies appropriately scoped API credentials, identifies the actual device and decides whether it may be disrupted. The SDK transports the configured request. A defensible completion check would use the relevant action/device status contract, distinguish accepted/running/completed/failed, and define escalation and release authority. That is an analytical requirement derived from the selected sample's missing verification, **not a claim that every Falcon console or managed-service workflow lacks verification**. No credentials were opened and no endpoint action was attempted.

Authentication follow-up: [credential/token handling and selected tests](falcon-auth-source.md) now read. Exact remaining dependency boundaries are listed in that follow-up and the source ledger.

Request-object follow-up: APIRequest, RequestConnection, RequestPayloads and RequestBehavior are now fully read. They carry payloads, connection/session and behavior settings; the connection dataclass defaults to TLS verification enabled and timeout unset. Constructor boolean checks and the perform flag control local request behavior, not customer action approval. Service initialization may override these defaults. These objects add neither endpoint polling nor remote rollback. No live transport or response-object implementation was inferred from the dataclasses.

## Response formatting and its test oracle

The entire pinned _result package (ten files) and tests/test_result_object.py are now read. Result preserves the HTTP status and formats metadata/resources/errors or raw/binary bodies; full_return and tupled are presentation forms. They do not poll a host or translate 202 into completed isolation. Body parsing is conditional on truthy status/headers/body (or HEAD mode), so an empty component follows a different path; the caller must inspect the actual returned shape rather than assume all metadata is present.

Result iteration usually delegates to the underlying list through iter(result). Direct next(result) has different position handling: it obtains a fresh iterator and stops when its internal position reaches the length, before returning that final value. The test file explicitly expects StopIteration for a one-item direct-next call; this is not evidence that it yields all items. The later fixed-payload tests compare exact reverse order, indexing, whole-entry membership and substring pruning, but do not establish end-to-end endpoint action completion. Earlier live-data tests often check only truthiness, skip on rate limits and initialize real authentication at module load; even the static classes share that module. No imports or tests were executed. Third-party requests/urllib3 internals remain outside this selected local response-formatting boundary.
