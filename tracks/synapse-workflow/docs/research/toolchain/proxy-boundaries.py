import hashlib
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / '.tools/toolchain/mitmproxy'))
from mitmproxy import connection, options
from mitmproxy.addons.proxyserver import Proxyserver
from mitmproxy.addons.script import load_script
from mitmproxy.proxy import context, events
from mitmproxy.proxy.layers.http._http1 import Http1Server

opts = options.Options()
Proxyserver().load(opts)
opts.body_size_limit = '32'
ctx = context.Context(connection.Client(peername=('127.0.0.1', 10001), sockname=('127.0.0.1', 10002), state=connection.ConnectionState.OPEN), opts)
parser = Http1Server(ctx)
assert list(parser.handle_event(events.Start())) == []
prefix = b'GET http://127.0.0.1/ HTTP/1.1\r\nHost: 127.0.0.1\r\nX-Fixture: '
header = prefix + b'a' * (128 * 1024)
assert list(parser.handle_event(events.DataReceived(ctx.client, header))) == []
buffered = len(parser.buf)
assert buffered == len(header)
commands = list(parser.handle_event(events.DataReceived(ctx.client, b'\r\n\r\n')))
event_names = [type(command.event).__name__ for command in commands]
assert event_names == ['RequestHeaders', 'RequestEndOfMessage']
assert len(commands[0].event.request.headers['X-Fixture']) == 128 * 1024

directory = ROOT / '.tools/toolchain/noop-addon'
directory.mkdir(exist_ok=True)
fixture = directory / 'fixture.py'
fixture.write_text('fixture_value = 23\n', encoding='utf8')
before = list(sys.path)
try:
    loaded = load_script(str(fixture))
    assert loaded.fixture_value == 23
    after = list(sys.path)
    restored_by_loader = before == after
    inserted_path_persisted = after[0] == str(directory)
    assert not restored_by_loader and inserted_path_persisted
finally:
    sys.path[:] = before
assert sys.path == before
print(json.dumps({'oraclesPassed': True,'http1HeaderProbe':{'bodySizeLimit':32,'payloadBytes':128*1024,'incompleteBufferedBytes':buffered,'eventsAfterTerminator':event_names,'scope':'Http1Server parser, no socket or whole-process resource exhaustion test'},'scriptImportProbe':{'restoredByLoader':restored_by_loader,'insertedPathPersisted':inserted_path_persisted,'restoredByHarness':sys.path==before,'fixtureSha256':hashlib.sha256(fixture.read_bytes()).hexdigest()},'cleanup':'No sockets/listeners started; child sys.path restored; no-op artifact retained'},indent=2))
