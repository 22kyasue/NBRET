# Cookie-policy runtime oracle, before execution

Run only the observed installed CPython3.14.7 with -I -S and standard library. Verify http.cookiejar source SHA against cookie-policy-source.json before tests. Construct urllib Request objects and synthetic Set-Cookie responses for reserved *.example.test names; never call urlopen, a resolver, socket, browser, external endpoint or real account. No package installation, persistent cookie file, credential or global setting.

Predefined expectations:

- Two independent jars at one host keep synthetic account-a/account-b values distinct.
- Reusing a jar for the second account overwrites the first same domain/path/name tuple.
- Default Netscape policy sends a no-Domain cookie to a child subdomain; DomainStrictNonDomain prevents that child emission while preserving exact-host emission. This is a runtime-specific counterexample, not browser behavior.
- Secure cookies are emitted to HTTPS and withheld from HTTP.
- A cookie without a port attribute crosses ports on the same host.
- A cookie with Path=/app is emitted at /app/x and withheld at /application.
- A foreign Domain Set-Cookie is rejected on extraction.
- Max-Age=0 removes a matching cookie.
- An already supplied Cookie request header is preserved rather than replaced by jar filtering.
- SameSite=Strict is retained as nonstandard metadata but does not itself prevent a synthetic third-party/unverifiable request under default Netscape policy; enabling strict_ns_unverifiable separately withholds it. This is not a SameSite browser conformance fixture.
- Clearing session cookies empties a session-only jar; direct set_cookie versus extraction distinctions remain source evidence, not an unplanned assertion.

Record each exact comparison, Python version, command, script/dependency hashes and success/failure in an exclusive timestamp receipt. No background jobs/listeners/timers. Results establish this library's behavior on synthetic objects; Scrapy middleware, real browser contexts, JavaScript HttpOnly enforcement, physical-device identity and server-side authorization remain distinct.
