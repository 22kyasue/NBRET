# Nuclei credential selection and injection

Pin a151a1d54fad0d5ef71f01662b0bb3955a98c7c5, accessed2026-10-17. Source only; no discovered or real credentials read/used. [Provider directory](https://github.com/projectdiscovery/nuclei/tree/a151a1d54fad0d5ef71f01662b0bb3955a98c7c5/pkg/authprovider).

## interface.go1–60 complete

1–38 defines lookup by address/URL, dynamic template paths and prefetch;40–60 constructs file providers in configured order and fails on invalid file before returning Multi. There is no principal/environment token returned with strategies to bind output/cache; higher layers would need to supply identity separately.

## multi.go1–68 complete

1–20 groups ordered providers;22–50 returns first matching provider's strategies, not union across all providers. Addr requires nonempty slice whereas URL/X stops on nonnil slice, so custom providers returning empty nonnil differ.52–68 combines dynamic template paths and prefetches sequentially, first error stops. File order is operationally meaningful; no current-user verification occurs here.

## file.go1–195 complete

1–54 loads authx file, rejects empty/missing dynamic callback, validates secrets/dynamic config and initializes indexes.56–125 builds exact domain and compiled regex maps, strips default ports80/443 irrespective of scheme; invalid regex is silently skipped at this point (validation dependency may reject earlier). Regex keys are compiled pointers, so separately compiled equal pattern strings do not combine under same map key.127–160 normalizes default port, case-insensitively matches exact entries and appends **all** matching regex strategies using map iteration. Overlapping strategies can apply in nondeterministic order; impact depends on each strategy's overwrite semantics. URL lookup uses Host only, **not scheme/path or principal**, so credential author must understand domain-level scope. Not an engagement/network allowlist.

162–195 lists dynamic templates and prefetches domain/regex dynamic strategies, potentially encountering shared dynamic object several times; dedup/caching is authx responsibility. HTTP build_request.ApplyAuth applies each returned strategy after project key creation (normal path). The full binding from dynamic secret acquisition, strategy state and cache into reporting remains open. No credential values are saved in this research.

## Injection implementations complete

authx/strategy.go1–46 delegates dynamic strategies; normal Apply skips nil strategy, retryable ApplyOnRR assumes nonnil. basic_auth.go1–32 and bearer_auth.go1–32 set Authorization, overwriting prior values. headers_auth.go1–48 assigns exact header key and marks Cookie names owned. Consequently overlapping matching strategies can overwrite same credential header in lookup order; no current-principal validation here. cookies_auth.go1–67 appends plain-request cookies; retryable path removes first existing same-name cookie per configured cookie, rebuilds header and appends new explicit cookies. Duplicate preexisting same-name values can remain. query_auth.go1–43 appends auth query values rather than replacing; existing duplicate query semantics depend on server. cookie_context.go1–45 publishes fresh set of explicit auth cookie names, retains earlier ownership only when still present, used by client pool to protect explicit auth over jar replacement. These methods have no network calls or redaction/reporting themselves.

## authx/dynamic.go1–289 complete

1–50 holds mutable secret pointers/extracted values/callback and shared fetchState pointer with Once/error/owner.52–83 collects domains and unmarshals.85–110 Validate resets fetch state (must not run concurrently) and validates templates/variables/secrets.112–197 callback requires extracted values and mutates secret headers/cookies/query/basic/token by replacement, then parses raw cookies; no transactional clone/rollback across fields, so callback/application error can leave partial in-memory mutation, although GetStrategies suppresses use after error.

199–222 GetStrategies avoids same-goroutine recursive fetch, runs Fetch(false), returns nil on failure, otherwise returns generated strategies. Failure is **nonfatal** here: request caller receives no error from ApplyAuth and may continue without intended credentials. That is source-level coverage/identity concern, not a demonstrated authentication bypass.224–252 Fetch requires prior validation, uses Once across value copies, memoizes success/error and permits same-owner reentry to avoid deadlock. No expiry, invalidation or bounded retry in this file except revalidation reset; callback may have its own behavior.254–289 exposes error and derives goroutine ID from runtime.Stack string for reentry detection; malformed/future format returns0 and can undermine that guard. Tests/callback implementation remain queued.

## authx/file.go1–273 complete

## Dynamic and ownership tests, complete files

dynamic_test.go1–130 exercises JSON inline/list/invalid/empty structures;132–227 concurrent waiters and once-only callback.229–299 tests recursive Fetch/GetStrategies avoids deadlock and unresolved login credentials are not applied, then populated credentials are applied afterward.301–400 validates required config, bad secret and reset state.402–562 replacement covers headers/keys/cookies/query/basic/token/static preservation and malformed raw cookie.564–666 covers missing validation/callback, successful inline/list mutation, callback error and absent extracts.668–747 explicitly expects nil strategies after failed fetch and populated strategy after success.749–829 error accessor/domain dedup. Tests use stub callbacks/constructed HTTP requests, not login templates/server credentials. No test establishes expiring-token refresh or reporting of missing authenticated coverage.

cookie_context_test.go1–43 asserts fresh ownership sets survive clone/header replacement without mutating earlier request context, ignores cookie-name fragments inside quoted payload. Component behavior is narrower than whole-client cookie isolation or principal correctness.

## Runtime checkpoint

[Predeclared plan](nuclei-auth-lab-plan.md), [receipt](nuclei-auth-lab-receipt.json):13 top-level tests pass,57 pass events including44 subcases,16.17s with module networking off. Confirms tested once/concurrency/reentry handling and request-local cookie ownership; also confirms nil strategies on failed fetch as designed. No actual login template, expiry/refresh cycle, HTTP engine send, credential file/decryption, target/model/OOB calls or race detector. The possibility of continuing unauthenticated remains a cross-file source concern, not an engine runtime result.

1–68 defines five auth types, file metadata, static/dynamic lists and mutable Secret with host/regex/header/cookie/query/basic/token fields.70–150 maps strategy and validates auth type, nonempty domain selection, regex compilation and required credential fields. This resolves prior uncertainty: malformed regex is rejected during construction, before init's silent-skip fallback.153–207 validates KV/cookies and parses raw Set-Cookie first segment; split on every '=' requires exactly two parts, so values containing '=' can fail. Raw cookie parse error embeds raw value in error; whether outer logs redact must be traced.209–235 loads SOPS encrypted file, falls back to plain os.ReadFile **only** on MetadataNotFound; other decryption errors fail. No explicit max-file byte limit here.237–273 extracts dynamic template paths and JSON/YAML unmarshals; no unknown-field strict mode shown. SOPS/provider dependencies and dynamic execution callback remain unread; no secret files were loaded by this review.
