"""Offline ordinary HAR representation oracle; no request is sent."""
import hashlib
import json
from pathlib import Path
import socket
import sys
from datetime import datetime, timezone
import importlib.metadata

base = Path(__file__).resolve().parent
root = base.parents[2]
pins = json.loads((base / 'snapshots.json').read_text())
pin = next(x for x in pins if x['name'] == 'mitmproxy')
queue = json.loads((base / 'queue.json').read_text())
source_hashes = {}
for relative in ['mitmproxy/addons/savehar.py', 'mitmproxy/io/har.py', 'mitmproxy/coretypes/serializable.py', 'mitmproxy/connection.py']:
    digest = hashlib.sha256((Path(pin['root']) / relative).read_bytes()).hexdigest()
    assert digest == next(x for x in queue if x['repo'] == 'mitmproxy' and x['path'] == relative)['sha256']
    source_hashes[relative] = digest
network_attempts = []
def forbidden(*args, **kwargs):
    network_attempts.append('forbidden operation')
    raise AssertionError('No network operation in HAR serialization lab')
socket.socket.connect = forbidden
socket.socket.connect_ex = forbidden
socket.create_connection = forbidden
socket.getaddrinfo = forbidden
sys.path.insert(0, pin['root'])
from mitmproxy import connection, flow, http
from mitmproxy.addons.savehar import SaveHar
from mitmproxy.io.har import request_to_flow

def sample(method='GET', body=b''):
    client = connection.Client(peername=('127.0.0.1', 10000), sockname=('127.0.0.1', 20000))
    server = connection.Server(address=('example.test', 8443), peername=('127.0.0.1', 8443))
    f = http.HTTPFlow(client, server)
    f.request = http.Request.make(method, 'https://example.test:8443/path', body)
    f.request.timestamp_start = 1000
    f.request.timestamp_end = 1001
    f.response = http.Response.make(200, b'ordinary response')
    f.response.timestamp_start = 1002
    f.response.timestamp_end = 1003
    return f

observations = []
def observe(name, actual, expected):
    observations.append({'case': name, 'actual': actual, 'expected': expected, 'pass': actual == expected})
def roundtrip(f):
    entry = SaveHar().make_har([f])['log']['entries'][0]
    return entry, request_to_flow(entry)

entry, restored = roundtrip(sample(body=b'ordinary GET body'))
observe('get_body_omitted', {'postData': 'postData' in entry['request'], 'restored_body': restored.request.content.decode()}, {'postData': False, 'restored_body': ''})
observe('connection_port_reconstructed', {'request_port': restored.request.port, 'server_port': restored.server_conn.address[1]}, {'request_port': 8443, 'server_port': 443})
f = sample(); f.response = None; f.error = flow.Error('synthetic capture error')
entry, restored = roundtrip(f)
observe('error_representation_changes', {'export_error': entry['response'].get('_error'), 'restored_error': restored.error, 'restored_status': restored.response.status_code}, {'export_error': 'synthetic capture error', 'restored_error': None, 'restored_status': 0})
f = sample(); f.response.headers['content-encoding'] = 'gzip'; f.response.content = b'ordinary compressed content'
raw_before = f.response.raw_content
entry, restored = roundtrip(f)
observe('compression_decoded', {'text': restored.response.content.decode(), 'content_encoding': restored.response.headers.get('content-encoding'), 'same_raw_bytes': restored.response.raw_content == raw_before}, {'text': 'ordinary compressed content', 'content_encoding': None, 'same_raw_bytes': False})
f = sample(); f.request.headers['x-evidence-marker'] = 'SYNTHETIC-ONLY-NOT-A-SECRET'
entry, restored = roundtrip(f)
observe('no_automatic_marker_redaction', any(h['name'] == 'x-evidence-marker' and h['value'] == 'SYNTHETIC-ONLY-NOT-A-SECRET' for h in entry['request']['headers']), True)
entry, restored = roundtrip(sample('POST', b'ordinary POST body'))
observe('post_control', restored.request.content.decode(), 'ordinary POST body')
observe('network_attempts', len(network_attempts), 0)
receipt = {'at': datetime.now(timezone.utc).isoformat(), 'python': sys.version, 'mitmproxyDistributionVersion': importlib.metadata.version('mitmproxy'), 'pin': pin['commit'], 'sourceHashes': source_hashes, 'fixtureSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), 'planSha256': hashlib.sha256((base / 'har-roundtrip-plan.md').read_bytes()).hexdigest(), 'observations': observations, 'oraclePassed': all(x['pass'] for x in observations), 'cleanup': 'Metadata objects only; subprocess exit releases memory; no listener or global configuration created.', 'limitations': ['Selected native HAR adapter only; no request/replay/browser capture', 'Synthetic source metadata is not proof of real network events', 'No claim about other HAR producers or all persistence paths']}
with (base / 'har-roundtrip-receipt.json').open('x', encoding='utf-8') as out:
    json.dump(receipt, out, indent=2)
print(json.dumps({'oraclePassed': receipt['oraclePassed'], 'observations': observations}, indent=2))
sys.exit(0 if receipt['oraclePassed'] else 1)
