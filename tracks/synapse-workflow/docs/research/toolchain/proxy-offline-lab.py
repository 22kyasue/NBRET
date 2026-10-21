"""Run selected upstream sans-I/O tests; forbid outbound Python socket use."""
import pathlib
import socket
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
SOURCE = ROOT / '.tools' / 'toolchain' / 'mitmproxy'
sys.path.insert(0, str(SOURCE))

def forbidden(*args, **kwargs):
    raise AssertionError('Outbound socket/DNS operation forbidden in offline lab')

socket.socket.connect = forbidden
socket.socket.connect_ex = forbidden
socket.create_connection = forbidden
socket.getaddrinfo = forbidden

import pytest

names = [
    'test_http_proxy',
    'test_store_streamed_bodies',
    'test_response_streaming',
    'test_request_streaming',
    'test_body_size_limit',
    'test_request_smuggling',
    'test_request_smuggling_whitespace',
    'test_request_smuggling_response',
    'test_request_smuggling_validation_disabled',
    'test_request_smuggling_te_te',
]
base = str(SOURCE / 'test/mitmproxy/proxy/layers/http/test_http.py')
raise SystemExit(pytest.main([
    '-p', 'pytest_timeout', '-p', 'pytest_asyncio.plugin',
    '-o', 'addopts=', '--color=no', '-vv', '--timeout=15',
    '--junitxml=' + str(ROOT / '.tools/toolchain/proxy-offline-junit.xml'),
    *[base + '::' + name for name in names],
]))
