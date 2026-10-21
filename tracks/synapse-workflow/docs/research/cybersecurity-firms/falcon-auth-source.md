# FalconPy authentication: token freshness is not action authority

Read **2026-10-17**. Same pinned revision as the [host-action trace](falcon-host-action-source.md): CrowdStrike/falconpy `06a5df86bc68e492db339dccacdff4a9b9ad61ec`. No authentication, environment-variable lookup or API request was performed by this research; the following describes source behavior.

## Identity selection

The complete [FalconInterface](https://github.com/CrowdStrike/falconpy/blob/06a5df86bc68e492db339dccacdff4a9b9ad61ec/src/falconpy/_auth_object/_falcon_interface.py) constructor reviews explicit client credentials, then supplied legacy token, context token, then environment credentials when earlier mechanisms are unavailable. Context lookup accepts an object with an access_token attribute. Environment credential names default to FALCON_CLIENT_ID / FALCON_CLIENT_SECRET but can be configured. This flexibility means an application must deliberately select its identity source; an apparently credential-free constructor can still acquire ambient authority in a deployed environment. This was not tested against this PC's environment.

Credential format validation checks that client_id/client_secret exist and are strings. It is not server validation of their values or scopes. Member CID can scope an MSSP token to a member organization; child login/logout changes that credential field and authenticates. Customer/service-provider tenant selection therefore has operational significance.

## Token creation, renewal and revocation

[Auth utility payloads](https://github.com/CrowdStrike/falconpy/blob/06a5df86bc68e492db339dccacdff4a9b9ad61ec/src/falconpy/_util/_auth.py) construct client-ID/secret form data for /oauth2/token and basic-credential authorization plus token form data for /oauth2/revoke, using the [endpoint metadata](https://github.com/CrowdStrike/falconpy/blob/06a5df86bc68e492db339dccacdff4a9b9ad61ec/src/falconpy/_endpoint/_oauth2.py).

A stateful login accepts 201, saves access_token/expires_in in a BearerToken and applies region autodiscovery. Failed token generation clears/replaces token state and preserves the first reported failure message when available. Logout submits revocation and clears local token state when stateful. Local clearing does not by itself prove server revocation succeeded.

The [BearerToken](https://github.com/CrowdStrike/falconpy/blob/06a5df86bc68e492db339dccacdff4a9b9ad61ec/src/falconpy/_auth_object/_bearer_token.py) records generation time and expiration duration. Renewal defaults to a 120-second window; constants clamp it between 120 and 1,200 seconds. The token_stale calculation compares elapsed time with expiration minus renewal window. token_valid is simply its inverse. It does not introspect server-side revocation, API scope, tenant authority or endpoint-action permission.

Reading auth_headers can call login when the token is stale and credentials are available. Legacy/context tokens are not refreshable without credentials; the constructor assumes a recently generated 1,799-second lifetime for them. This assumed local freshness is not proof of actual issue time. These are library semantics, not a recommendation to reuse unknown-age tokens.

## Connection and audit boundaries

[InterfaceConfiguration](https://github.com/CrowdStrike/falconpy/blob/06a5df86bc68e492db339dccacdff4a9b9ad61ec/src/falconpy/_auth_object/_interface_config.py) holds base URL, TLS verification, proxy, timeout, user-agent and an optional requests session. TLS verification defaults true; timeout defaults None here. Supplying/owning a session does not establish a retry/deadline policy from this class alone.

Debug logging is optional. The fully read logging facility defaults sanitization on with a 100-record limit, but callers can configure it. The helper masks named token/credential fields at the top level or in body, plus Authorization, rather than recursively identifying arbitrary secrets. It also limits displayed resource records. This is bounded field masking, not a guarantee that every sensitive field is suppressed. Local debug logs also do not substitute for the provider's action audit or a customer's approval record.

## Test reading and remaining scope

The complete [authentication test file](https://github.com/CrowdStrike/falconpy/blob/06a5df86bc68e492db339dccacdff4a9b9ad61ec/tests/test_authentications.py) mixes live credential/service calls with mocked and pure property tests. Module setup calls shared authorization initialization. Several helpers accept 200/401/403/429, and one test computes a result then asserts True without checking it. These paths cannot establish universal authentication correctness merely because a suite reports success. Other tests meaningfully assert environment selection, member CID, invalid input, configuration properties and mocked child-token handling. None were executed.

Read fully: interface, bearer token, credential payload utility, interface configuration, abstract auth base, constants, OAuth endpoint metadata, request-validator/meta containers and authentication tests. The OAuth2 subclass, logging facility and complete utility helpers are now also read. OAuth2 authenticated checks local token freshness; logout reports success only for status 200. Region autodiscovery uses the response region header and falls back to the configured region. Base-URL normalization accepts a supplied full URL rather than enforcing a hostname allowlist. Shared test authorization, several result/enum classes and third-party requests/session behavior remain unread. Those remain explicit partial boundaries rather than a “complete SDK audit.”

## Shared test initialization and enumerators

At the same pinned commit, tests/test_authorization.py is now read completely. It loads environment credentials or tests/test.config and calls real token endpoints; test_authentications.py invokes serviceAuth during module initialization. These are not universally isolated offline tests, and no import or test was run here. Some helper assertions are weak: serviceRevoke treats any positive HTTP status as success, so that assertion alone cannot establish successful revocation. Other explicit status checks and mocks remain separately meaningful. No credential values/configuration files were accessed.

The complete BaseURL enum lists US1/US2/US3, EU1 and two government regions, with AUTO mapped initially to US1. It is a convenience mapping, not an exhaustive custom-URL allowlist or Japanese data-residency promise. TokenFailReason supplies two generic strings for metadata/static-analysis hygiene; it does not classify every server authentication failure. tests/__init__.py retrieval returned unsupported/400; the pinned tree identifies a zero-byte blob, so no executable initializer content is inferred.

## Shared-interface and header precedence boundary

Both service base-class files are now fully read. They share an authentication object/session across clients; changing shared base URL or TLS verification affects the shared interface. Per-service proxy, timeout and user-agent overrides use truthiness when selected, so an empty override can fall back to shared configuration. Context exit calls logout on that shared auth object; this is token handling, not reversal of endpoint changes.

A source/comment discrepancy matters for integrators: a constructor comment says extended headers do not override authorization, but the headers property merges auth_headers first and ext_headers second. An equal literal key therefore takes the extended value by Python dictionary semantics. The selected request transport passes those headers onward and only replaces/adds SDK/user-agent headers. This is caller-controlled SDK configuration, not evidence of an attacker-controlled path or server authorization bypass. Case-insensitive HTTP normalization is a third-party boundary; no request or credential experiment was performed. Treat headers as trusted configuration and verify final request construction in the actual integration.
