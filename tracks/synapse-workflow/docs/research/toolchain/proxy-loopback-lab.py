import asyncio
import hashlib
import ipaddress
import json
import pathlib
import socket
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / '.tools/toolchain/loopback'
OUT.mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(ROOT / '.tools/toolchain/mitmproxy'))

real_connect = socket.socket.connect
real_connect_ex = socket.socket.connect_ex
real_getaddrinfo = socket.getaddrinfo

def allowed(address):
    try:
        return ipaddress.ip_address(address[0]).is_loopback
    except (ValueError, TypeError):
        return False

def guarded_connect(sock, address):
    if not allowed(address):
        raise AssertionError('Non-loopback socket blocked')
    return real_connect(sock, address)

def guarded_connect_ex(sock, address):
    if not allowed(address):
        raise AssertionError('Non-loopback socket blocked')
    return real_connect_ex(sock, address)

def guarded_resolve(host, *args, **kwargs):
    if not allowed((host, 0)):
        raise AssertionError('Non-loopback name resolution blocked')
    return real_getaddrinfo(host, *args, **kwargs)

socket.socket.connect = guarded_connect
socket.socket.connect_ex = guarded_connect_ex
socket.getaddrinfo = guarded_resolve

from mitmproxy import http, io, options
from mitmproxy.tools.dump import DumpMaster

async def main():
    hits, hooks, clients = [], [], {}
    master = None
    run_task = None
    proxy_port = None

    async def origin(reader, writer):
        try:
            raw = await asyncio.wait_for(reader.readuntil(b'\r\n\r\n'), 3)
            hits.append(raw.decode('ascii'))
            body = b'owned-origin'
            writer.write(b'HTTP/1.1 200 OK\r\nContent-Length: ' + str(len(body)).encode() + b'\r\nConnection: close\r\n\r\n' + body)
            await writer.drain()
        finally:
            writer.close()
            await writer.wait_closed()

    server = await asyncio.start_server(origin, '127.0.0.1', 0)
    origin_port = server.sockets[0].getsockname()[1]

    class Fixture:
        def server_connect(self, data):
            if data.server.address != ('127.0.0.1', origin_port):
                data.server.error = 'Fixture scope rejected destination'

        def request(self, flow):
            hooks.append(['request', flow.request.path])
            assert flow.request.host == '127.0.0.1' and flow.request.port == origin_port
            flow.request.headers['X-Fixture'] = 'extension-request'
            if flow.request.path == '/synthetic':
                flow.response = http.Response.make(202, b'addon-synthetic')
            elif flow.request.path == '/raise':
                raise RuntimeError('Deliberate synthetic addon exception')
            elif flow.request.path == '/kill':
                flow.kill()

        def response(self, flow):
            hooks.append(['response', flow.request.path])
            flow.response.content += b'|extension-response'

        def error(self, flow):
            hooks.append(['error', flow.request.path, flow.error.msg])

    async def exchange(path):
        reader, writer = await asyncio.open_connection('127.0.0.1', proxy_port)
        try:
            writer.write(f'GET http://127.0.0.1:{origin_port}{path} HTTP/1.1\r\nHost: 127.0.0.1:{origin_port}\r\nConnection: close\r\n\r\n'.encode())
            await writer.drain()
            return (await asyncio.wait_for(reader.read(), 4)).decode('ascii')
        finally:
            writer.close()
            await writer.wait_closed()

    async def closed(port):
        try:
            _, writer = await asyncio.wait_for(asyncio.open_connection('127.0.0.1', port), 1)
        except (ConnectionRefusedError, OSError):
            return True
        else:
            writer.close()
            await writer.wait_closed()
            return False

    try:
        opts = options.Options(listen_host='127.0.0.1', listen_port=0, confdir=str(OUT / 'conf'), mode=['regular'])
        master = DumpMaster(opts, with_termlog=False, with_dumper=False)
        save = master.addons.get('save')
        master.addons.remove(save)
        master.addons.add(Fixture(), save)
        master.options.update(connection_strategy='lazy', save_stream_file=str(OUT / 'flows.mitm'), block_global=True, block_private=False)
        run_task = asyncio.create_task(master.run())
        for _ in range(100):
            addresses = master.addons.get('proxyserver').listen_addrs()
            if addresses:
                proxy_port = addresses[0][1]
                break
            if run_task.done():
                await run_task
                raise AssertionError('Proxy exited before listening')
            await asyncio.sleep(0.02)
        assert proxy_port
        for path in ['/normal', '/synthetic', '/raise', '/kill']:
            clients[path] = await exchange(path)
        assert len(hits) == 2 and 'GET /normal ' in hits[0] and 'GET /raise ' in hits[1]
        assert all('X-Fixture: extension-request'.lower() in h.lower() for h in hits)
        assert '200 OK' in clients['/normal'] and clients['/normal'].endswith('owned-origin|extension-response')
        assert '202' in clients['/synthetic'] and clients['/synthetic'].endswith('addon-synthetic|extension-response')
        assert '200 OK' in clients['/raise'] and clients['/raise'].endswith('owned-origin|extension-response')
        assert not clients['/kill']
    finally:
        if master:
            await master.addons.get('proxyserver').servers.update([])
            master.shutdown()
        if run_task:
            await asyncio.wait_for(run_task, 5)
        server.close()
        await server.wait_closed()

    assert await closed(origin_port)
    assert await closed(proxy_port)
    with (OUT / 'flows.mitm').open('rb') as file:
        saved = list(io.FlowReader(file).stream())
    saved_summary = [{'path':f.request.path,'requestHeader':f.request.headers.get('X-Fixture'),'status':f.response.status_code if f.response else None,'body':f.response.content.decode() if f.response else None,'error':f.error.msg if f.error else None} for f in saved]
    by_path = {f['path']:f for f in saved_summary}
    assert set(by_path) == {'/normal','/synthetic','/raise','/kill'}
    assert by_path['/normal']['body'] == 'owned-origin|extension-response'
    assert by_path['/synthetic']['status'] == 202
    assert by_path['/raise']['status'] == 200
    assert by_path['/kill']['error']
    return {'oraclesPassed':True,'originPort':origin_port,'proxyPort':proxy_port,'originHits':hits,'clientResults':clients,'hooks':hooks,'saved':saved_summary,'flowSha256':hashlib.sha256((OUT/'flows.mitm').read_bytes()).hexdigest(),'cleanup':{'originPortClosed':True,'proxyPortClosed':True},'addonOrder':[type(a).__name__ for a in master.addons.chain]}

if __name__ == '__main__':
    result = asyncio.run(asyncio.wait_for(main(), 25))
    print(json.dumps(result, indent=2))
