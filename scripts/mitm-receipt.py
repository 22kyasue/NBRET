"""Local-fixture receipt addon. No payloads, credentials or external flows saved."""
import json
import os
from pathlib import Path
from urllib.parse import urlsplit
from mitmproxy import http

def request(flow: http.HTTPFlow):
    if flow.request.host not in ("127.0.0.1", "localhost", "::1"):
        flow.response = http.Response.make(403, b"NBRET local fixture only")

def response(flow: http.HTTPFlow):
    if flow.request.host not in ("127.0.0.1", "localhost", "::1"):
        return
    result = None
    if urlsplit(flow.request.pretty_url).path == "/sum":
        try:
            result = json.loads(flow.response.get_text()).get("result")
        except (ValueError, TypeError):
            pass
    with Path(os.environ["NBRET_MITM_RECEIPT"]).open("a", encoding="utf-8") as file:
        file.write(json.dumps({"method": flow.request.method, "path": urlsplit(flow.request.pretty_url).path,
                               "status": flow.response.status_code, "result": result}) + "\n")
