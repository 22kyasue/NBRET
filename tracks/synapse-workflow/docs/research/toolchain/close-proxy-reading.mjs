import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const base='docs/research/toolchain/';
const annotations=`
## Model, listener, framing dependency and saved-state closure

Additional inspected ranges at the same pinned mitmproxy commit:

* 'proxy/layer.py' 1–341 complete: a blocking command pauses its own layer until the matching completion event; other events enter a deque. This is not a global HTTP/2 connection lock. NextLayer accumulates events until an addon selects a protocol. Neither queue has an explicit byte budget in this file; deployment resource behavior requires surrounding layers.
* 'proxy/mode_servers.py' 211–547 completes the file (1–210 previously read). Client registration has a context-managed lifetime; regular mode selects HTTPProxy. Asyncio server startup binds listeners; stop closes them but deliberately omits wait_closed due to the cited CPython issue. WireGuard/local/TUN implementations are distinct paths; none ran in these labs. The WireGuard configuration path writes private key material and prints a client configuration, so these outputs belong in restricted evidence storage. This is source-established capability, not evidence of a generated key on this PC.
* 'http.py' 1–1296 complete. 1–245: byte-oriented ordered headers and message state; folded header lookup differs from get_all and original tuples. 246–513: None means missing content, unlike an empty body; setting content handles content encoding and adjusts Content-Length when Transfer-Encoding is absent, while assigning raw_content does not. 516–840: URL/host/authority mutation; pretty_host can use an untrusted Host header and is not the actual destination identity. 842–1011: mutable query/cookie/form views, with decode/re-encode normalization and multipart parse fallback. 1013–1207: response construction and heuristic replay date/cookie refresh. 1210–1296: HTTPFlow state and copy preserve request/response/error distinctions. A protocol response and a later flow error can coexist.
* 'flow.py' 1–289 complete: state carries version/type/IDs/connections/error/metadata/timestamps; from_state rebuilds a known subclass, and copied flows are not live. kill sets the explicit killed error and resumes interception; its own TODO excludes some in-transit behavior. Created time is distinct from request observation time. An evidence importer must preserve both.
* 'io/tnetstring.py' 1–262 complete: typed length-prefixed scalars/containers, not pickle evaluation. The length prefix permits up to twelve digits and load reads the declared payload; this is not a practical evidence-file byte budget. Nested containers recurse. Format validation does not substitute for file/depth/resource limits at the import boundary. No large-load test was performed.
* 'io/compat.py' 1–529 complete: 17–278 migrates historical framing, connection fields and IDs; module dictionaries deduplicate legacy connections. 281–339 reconstructs old WebSocket handshakes and can synthesize a dummy missing request marked duplicated. 342–433 supplies missing/default timestamps, proxy mode and protocol fields across later formats. 436–529 normalizes old Unicode forms and iterates known converters, rejecting unknown versions. Migrated values may be inferred defaults, not original observations; preserve original bytes and migration/tool version. Legacy global-cache lifetime remains a separate resource question. HAR parsing and generic serialization dependencies are still outside this closure.

Installed runtime dependency snapshot 'h11==0.16.0' is an explicitly labeled wheel/RECORD artifact, not a fabricated VCS pin. 'h11/_receivebuffer.py' 1–154 complete: bytearray storage and incremental search offsets, accepting LF/CRLF line endings, with no local total-size cap. 'h11/_readers.py' 1–251 complete: 43–119 header/request/status parsing; 122–142 fixed-length body accounting and incomplete-EOF error; 148–209 chunk framing, strict chunk footer, discarded extensions, trailer handling and incomplete-body error; 213–251 EOF-delimited reads and dispatch. mitmproxy's reviewed HTTP/1 layer uses these body readers directly. A limit belonging to h11.Connection cannot be assumed to guard this separate caller. These annotations explain the finite parser probe; they are not a whole-process denial-of-service claim.

The selected regular HTTP/1 path now connects CLI/options → listener/layer events → parser/framing → mutable HTTP model → ordered extension hooks → upstream/client transport → native save → migration/from_state. The real loopback receipt tests four paths through that chain. TLS trust/handshake, HTTP/2/3, HAR import, arbitrary extension side effects and all malformed-input combinations remain separate, explicitly unreviewed flows.
`;
if(fs.readFileSync(base+'proxy-flow.md','utf8').includes('## Model, listener, framing dependency')) throw Error('checkpoint already appended');
fs.appendFileSync(base+'proxy-flow.md',annotations);
for(const [repo,path,start,end] of [
 ['mitmproxy','mitmproxy/proxy/layer.py',1,341],
 ['mitmproxy','mitmproxy/proxy/mode_servers.py',211,547],
 ['mitmproxy','mitmproxy/flow.py',1,289],
 ['mitmproxy','mitmproxy/io/tnetstring.py',1,262],
 ['mitmproxy','mitmproxy/http.py',1,1296],
 ['mitmproxy','mitmproxy/io/compat.py',1,529],
 ['h11','h11/_receivebuffer.py',1,154],
 ['h11','h11/_readers.py',1,251],
]) execFileSync(process.execPath,[base+'source.mjs','mark',repo,path,String(start),String(end)],{windowsHide:true,stdio:'pipe'});
console.log('Appended inspected proxy closure and credited eight inspected files/ranges.');
