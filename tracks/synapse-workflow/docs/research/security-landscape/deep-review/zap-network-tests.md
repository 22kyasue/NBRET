# Network implementation tests: complete read, not executed

Pinned network addon commit `edad2323431a8dec407d46129fedc74fd30d3ba6`; `HttpSenderImplUnitTest.java` SHA/ranges in file-queue.json. [Original test source](https://github.com/zaproxy/zap-extensions/blob/edad2323431a8dec407d46129fedc74fd30d3ba6/addOns/network/src/test/java/org/zaproxy/addon/network/internal/client/HttpSenderImplUnitTest.java), accessed via git 2026-10-17. All2360lines inspected in contiguous bounded outputs. Java tests not run; fixture network receipts are separate.

| Lines | Assertions and setup |
| --- | --- |
| 1–205 | JUnit/Mockito/Netty imports, local test server, Apache sender wrapper and teardown. |
| 207–275 | Null listener rejection and parameter sources covering DELETE/GET/HEAD/OPTIONS/PATCH/POST/PUT/TRACE/TRACK/XYZ, version strings and status200–599. |
| 277–397 | Throttling hook, DNS/timeout error types, HTTP version/header preservation. |
| 399–553 | Request bodies across methods, host updates/addition, deliberately incorrect Content-Length and header case. |
| 555–604 | IO retry test intentionally closes early requests and expects five received requests for every parameterized method, including POST/PATCH/DELETE. Status-code test expects one request despite Retry-After across200–599. The latter invokes direct sendAndReceive rather than its method parameter. |
| 606–717 | Preserves provided NTLM challenge/credential headers in synthetic exchanges; no real credentials used in this investigation. |
| 719–798 | Response/header/body receipt, empty204, explicitly expects body returned despite declared length420 and much shorter actual body. This supports intentional tolerant partial-body behavior. |
| 800–1004 | Download64MB/empty-body, timing, target-response flag, encoding metadata, redirect final-response overwrite while original request URI remains, connection-close properties. |
| 1006–1120 | Single/multiple chunk removal, updated Content-Length, SSE body omitted with no content length. |
| 1122–1215 | Redirect send variants, listener callbacks, all redirects and optional notification suppression. |
| 1217–1305 | Listener order and continued delivery after callback exceptions. |
| 1307–1453 | Concurrent notifications, recursion suppression, and tests expecting ConcurrentModificationException for adding listeners during iteration. These assertions constrain broad claims that all listener errors are swallowed. |
| 1455–1609 | Host normalization defaults/overrides, duplicate headers, disabling normalization. These are purposeful testing controls rather than browser equivalence. |
| 1611–1671 | Upgraded persistent connection kept/closed based on listener acceptance. |
| 1673–1820 | Local proxy fixture, auth challenge construction, proxy DNS classification, HTTP/HTTPS proxy routing, disabled proxy/auth. |
| 1822–1993 | Proxy auth and removal/retry across methods, realm mismatch, body preservation and synthetic credentials setup. |
| 1995–2162 | Mocked user auth predicate based on synthetic body, server authentication, no-realm auth, preserved invalid headers when removal disabled. This does not validate production identity/session configurations. |
| 2164–2271 | Cookie parsing/serialization, disabled/enabled behavior and repeat formatting with synthetic malformed-cookie corpus. |
| 2273–2360 | Message/assertion/URI/listener helpers and functional interfaces. |

Quality implication: tests intentionally exercise a permissive assessment transport, including unusual methods, bodies, headers and truncated responses. A collector must preserve enough context to distinguish these tests from ordinary browser actions and complete responses. Upstream test existence is intended-behavior evidence; executing these exact tests and transitive harnesses remains separate work. Retry dependency is Apache httpclient5:5.2.1 from version catalog; exact library source and custom client execution chain remain queued.
