# Source trace: initiating and reading a Google SecOps investigation

Pinned [google/secops-wrapper @ ca553eb7dc940bd113704c737db04324f25c2ed1](https://github.com/google/secops-wrapper/tree/ca553eb7dc940bd113704c737db04324f25c2ed1), accessed 2026-10-17. Source-only; no credentials, live API requests, model calls or tests executed. The repo README explicitly places the project in maintenance mode. These are public client wrappers, not the agent's closed investigation implementation.

## End-to-end selected call sequence

| Source / contiguous range | Operation and evidence implication |
| --- | --- |
| [client.py](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/src/secops/chronicle/client.py), 382–574 | BaseUrl selects region/version; client constructs project/location/instance identity, initializes a SOAR service object, uses an injected session or creates auth, then exposes that session. Constructor dependencies/imports outside the read range remain separate unread boundaries. |
| Same file, 2051–2152 | Public methods delegate association/get/list/trigger calls without adding a completion monitor or approval step. |
| [investigations.py](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/src/secops/chronicle/investigations.py), 1–203 | Association validates detection-type strings/enums and removes None options; get extracts resource ID; list delegates pagination; trigger POSTs an alert ID to investigations:trigger, v1alpha. Docstring ID/association limits are not enforced by these wrappers. Response is returned, not awaited until final verdict. |
| [format_utils.py](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/src/secops/chronicle/utils/format_utils.py), 1–104 | Resource names beginning projects/ are reduced to the last path component; other strings remain. None filtering is shallow. Therefore a passed full resource path does not independently establish target-instance selection; the configured client instance is authoritative. |
| [request_utils.py](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/src/secops/chronicle/utils/request_utils.py), 1–441 | Build URL from client region/version/instance, merge client metadata headers, issue session request and parse JSON. Exact expected status defaults to 200; mismatches and non-JSON success throw APIError. Body-preview truncation is not redaction. Investigation callers do not supply a timeout. Adjacent bytes helper is also read but is not the investigation path. |
| Same file, 80–216 | Providing page_size or page_token selects one-page mode; neither selects auto-pagination with size 1000. Results aggregate until no token. as_list drops metadata; dictionary output preserves first-page metadata and removes next token. No token-cycle guard/overall page budget is visible. |
| [auth.py](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/src/secops/auth.py), 1–278 | Accept provided credentials, service-account info/file or ambient default credentials; optional impersonation; construct AuthorizedSession. Configure retries by default, including POST/PATCH, for selected transient statuses with five retries and backoff. This is a configured capability, not an observed duplicate investigation or authorization bypass. |
| [models.py](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/src/secops/chronicle/models.py), 15–76 and 1062–1065 | DetectionType string values and API version enums used by this path. Other models are downloaded/unread. |
| [exceptions.py](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/src/secops/exceptions.py), complete | AuthenticationError and APIError are distinct subclasses of base SDK error. They do not carry a verified workflow-state envelope. |

## Tests read, not executed

The complete [investigation test file](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/tests/chronicle/test_investigations.py), 1–578, mocks authentication/session requests. It checks association options, enum conversion, error handling, URL/body fields, metadata and list behavior. The trigger success fixture explicitly returns STATUS_IN_PROGRESS and unspecified verdict. Passing that test would establish request/response plumbing, not a successful investigation.

The complete [request-helper tests](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/tests/chronicle/utils/test_request_utils.py), 1–921, cover JSON/status/error wrapping, pagination shapes, token handling, header/URL conventions, bytes and truncation. These use mocks and cannot validate remote rate limits, model correctness, identity authorization or eventual completion.

Complete [format-helper tests](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/tests/chronicle/utils/test_format_utils.py) and [auth tests](https://github.com/google/secops-wrapper/blob/ca553eb7dc940bd113704c737db04324f25c2ed1/tests/test_auth.py) were read. Some auth tests require real default/service-account credentials and are explicitly integration-marked; none were run. The fake bearer-token case verifies a credential object acceptance path, not token validity or authorization.

## Dependency and evidence boundary

pyproject version 0.44.1 requires Python >=3.10 and lower-bounded google-auth, google-auth-httplib2 and google-api-python-client. Auth also imports requests/urllib3 through the environment. No exact installed/locked versions were resolved, so retry/refresh behavior inside those dependencies remains unread. No software was installed to resolve that gap.

The workflow's public client boundary is traced through network submission and parsed result. Closed service deduplication/idempotency, actual IAM enforcement, agent execution, stored results and audit persistence are unavailable from these files. A trigger response, final verdict, approved response action and recovered customer system must remain distinct states.

The SOAR package initializer is read completely and service.py lines 1–90 are read. SOARService construction stores the parent client; it does not submit a request in that constructor. Imported integration modules remain unread, so this is not a complete import-side-effect review. Auth/retry tests are already covered above. File hashes and precise read states are in source-reads.json.
