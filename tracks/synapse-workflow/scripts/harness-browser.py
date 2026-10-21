"""JSON-lines bridge to Kotaro's existing computeruse browser API; no browser launch here."""
import contextlib
import json
import os
from pathlib import Path
import sys

root = Path(os.environ.get('NBRET_COMPUTERUSE_ROOT', r'C:/Users/kotar/githubprojects/computeruse'))
sys.path.insert(0, str(root))
from harness.browser import Browser
from harness import chrome

browser = Browser()
for line in sys.stdin:
    try:
        request = json.loads(line)
        if request.get('op') == 'connection':
            port = chrome.debug_port()
            if not port:
                raise ConnectionError('No verified harness browser')
            result = {'endpoint': f'http://127.0.0.1:{port}'}
            print(json.dumps({'result': result}), flush=True)
            continue
        if request.get('op') not in ('new_tab', 'read', 'find', 'navigate', 'close_tab', 'hover', 'click', 'fill', 'scroll'):
            raise ValueError('Unsupported exploration operation')
        with contextlib.redirect_stdout(sys.stderr):
            result = browser.run(**request)
        print(json.dumps({'result': result}, ensure_ascii=True), flush=True)
    except Exception as error:
        # Raw harness errors can contain URLs, inputs or account information.
        print(json.dumps({'error': type(error).__name__}), flush=True)
