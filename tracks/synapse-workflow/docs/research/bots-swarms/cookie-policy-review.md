# Cookie jars separate stored sessions, not devices or authority

The installed CPython3.14.7 interpreter reported tags/v3.14.7:823f032. Its complete2123-line http.cookiejar module was read in bounded outputs and copied to ignored local research storage. Exact source path, SHA and contiguous reading credit are in [cookie-policy-source.json](cookie-policy-source.json), separately from the unchanged1511-file five-project queue. This is the observed installed dependency, not a claim that remote tagged bytes were independently verified.

The [predefined lab](cookie-policy-lab-plan.md) and [script](cookie-policy-lab.py) use actual stdlib extraction/policy/header code with synthetic Request/Response objects. No URL is opened and no resolver, socket, browser or persistent cookie file is used. The successful [18-comparison receipt](cookie-policy-receipt-1792269733791491700.json) records the interpreter and dependency/script hashes.

| Boundary | Observed fixture behavior | Meaning for owned workers |
| --- | --- | --- |
| Jar object | Two jars preserve different synthetic sessions at one host | Assign and retain the correct jar/context with the workload |
| Reused jar | Same domain/path/name tuple is overwritten by the second account | Shared mutable session state can switch attribution |
| No Domain attribute | Default Netscape policy emits to a child subdomain; strict non-domain policy withholds it | Do not assume modern browser host-only semantics in every HTTP library |
| Secure | HTTPS emits; HTTP withholds jar-generated secure cookie | This transport condition is not tenant authorization |
| Port | Ordinary cookie reaches another port on the same host | Separate ports do not necessarily isolate sessions |
| Path | /app/x receives /app cookie; /application does not | Path routing works in this case, but does not define account permission |
| SameSite | Stored as metadata; default legacy third-party policy still emits | A browser-specific security attribute is not automatically implemented by an HTTP client |
| Expiry/cleanup | Max-Age=0 deletes the tuple; clearing session cookies empties the fixture jar | Clearing local state does not revoke server authority or copies elsewhere |
| Explicit request header | stdlib preserves an existing Cookie header | Inspect caller/middleware behavior as well as jar policy |

Source closure: DefaultCookiePolicy885–909 chooses Netscape on, RFC2965 off, liberal domain and non-strict Netscape unverifiable handling. return_ok1097–1187 checks version/verifiability/secure/expiry/port/domain; strict host equality is conditional1171–1177. Path checks1215–1226 precede per-cookie return checks. Cookie normalization1390–1485 stores unrecognized attributes in rest; SameSite has no dedicated enforcement path in this file. Extraction1681–1691 invokes set_ok; direct set_cookie1668–1679 deliberately bypasses admission policy. Jar storage is keyed domain/path/name, with no account, tenant or worker field.

The first [failed receipt](cookie-policy-receipt-1792269720526586500.json) is preserved. Its strict third-party comparison failed because other.example.test and accounts.example.test share the legacy reach of .example.test. Correcting the synthetic origin to outside.example.invalid made the oracle test an actual third party under this library's rule. The earlier SameSite emission comparison also used that unsuitable origin, so only the corrected receipt establishes the intended third-party contrast. Expected outcomes were not weakened.

Scrapy qualification: the pinned wrapper explicitly constructs DefaultCookiePolicy, but its optimized domain candidate selection, wrapped request fields and middleware remain additional behavior. Cookie middleware deletes an existing Cookie header before adding jar state when merging is enabled (process_request80–87); our stdlib existing-header comparison must not be generalized to that full path. Scrapy's public-domain check also adds a separate admission constraint. Full Scrapy runtime was not executed. Its wrapper replaces the stdlib RLock with a dummy lock, so the stdlib's locking is not proof of concurrent wrapper safety.

File-format review additionally shows that Mozilla/Netscape serialization loses version/port and other metadata, while LWP stores different fields; loading uses direct set_cookie rather than server-response admission checks. No user profile or saved cookie file was opened. Restoring a session file needs its own identity/permission/provenance controls; the lab provides no persistence or cross-browser migration guarantee.

Browser contexts, fingerprint/device identity, OAuth grants, server-side authorization and operator identity remain separate. These fixtures are not a method to create third-party accounts, spoof devices or bypass browser controls.
