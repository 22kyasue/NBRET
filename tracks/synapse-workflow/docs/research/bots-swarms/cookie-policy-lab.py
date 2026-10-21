"""Synthetic in-memory http.cookiejar test; no URL is opened."""
import datetime
import hashlib
import http.cookiejar as cj
import json
from email.message import Message
from pathlib import Path
import sys
import time
from urllib.request import Request

home = Path('docs/research/bots-swarms')
manifest = json.loads((home / 'cookie-policy-source.json').read_text())
dependency_hash = hashlib.sha256(Path(cj.__file__).read_bytes()).hexdigest()
if dependency_hash != manifest['sha256']:
    raise RuntimeError('Installed cookie policy changed; no tests run')
checks = []
def expect(name, actual, expected):
    checks.append({'name': name, 'actual': actual, 'expected': expected, 'pass': actual == expected})
    if actual != expected:
        raise AssertionError(name)

class Response:
    def __init__(self, *cookies):
        self.headers = Message()
        for cookie in cookies:
            self.headers.add_header('Set-Cookie', cookie)
    def info(self):
        return self.headers

def store(jar, value, url='https://accounts.example.test/login'):
    jar.extract_cookies(Response(value), Request(url))

def header(jar, url='https://accounts.example.test/', **opts):
    req = Request(url, **opts)
    jar.add_cookie_header(req)
    return req.get_header('Cookie')

error = None
try:
    a, b = cj.CookieJar(), cj.CookieJar()
    store(a, 'sid=account-a; Path=/')
    store(b, 'sid=account-b; Path=/')
    expect('jar a independent identity', header(a), 'sid=account-a')
    expect('jar b independent identity', header(b), 'sid=account-b')
    store(a, 'sid=account-b; Path=/')
    expect('reused jar overwrites account tuple', header(a), 'sid=account-b')
    expect('default no-Domain cookie reaches child', header(a, 'https://child.accounts.example.test/'), 'sid=account-b')
    strict = cj.CookieJar(cj.DefaultCookiePolicy(strict_ns_domain=cj.DefaultCookiePolicy.DomainStrictNonDomain))
    store(strict, 'sid=strict; Path=/')
    expect('strict non-domain exact host', header(strict), 'sid=strict')
    expect('strict non-domain withholds child', header(strict, 'https://child.accounts.example.test/'), None)
    secure = cj.CookieJar()
    store(secure, 'sid=secure; Secure; Path=/')
    expect('secure https', header(secure), 'sid=secure')
    expect('secure withheld from http', header(secure, 'http://accounts.example.test/'), None)
    expect('ordinary cookie crosses port', header(a, 'https://accounts.example.test:8443/'), 'sid=account-b')
    paths = cj.CookieJar()
    store(paths, 'sid=path; Path=/app')
    expect('path child allowed', header(paths, 'https://accounts.example.test/app/x'), 'sid=path')
    expect('path string-prefix collision withheld', header(paths, 'https://accounts.example.test/application'), None)
    foreign = cj.CookieJar()
    store(foreign, 'sid=foreign; Domain=foreign.example.test; Path=/')
    expect('foreign Domain rejected', len(foreign), 0)
    store(b, 'sid=gone; Max-Age=0; Path=/')
    expect('max-age zero deletes tuple', header(b), None)
    expect('explicit cookie header preserved', header(secure, 'http://accounts.example.test/', headers={'Cookie': 'manual=synthetic'}), 'manual=synthetic')
    same = cj.CookieJar()
    store(same, 'sid=same; SameSite=Strict; Path=/')
    expect('SameSite metadata retained', next(iter(same)).get_nonstandard_attr('SameSite'), 'Strict')
    expect('SameSite metadata not default third-party gate', header(same, unverifiable=True, origin_req_host='outside.example.invalid'), 'sid=same')
    strict_third = cj.CookieJar(cj.DefaultCookiePolicy(strict_ns_unverifiable=True))
    store(strict_third, 'sid=same; SameSite=Strict; Path=/')
    expect('separate third-party policy withholds', header(strict_third, unverifiable=True, origin_req_host='outside.example.invalid'), None)
    same.clear_session_cookies()
    expect('session cleanup empties jar', len(same), 0)
except Exception as exc:
    error = {'type': type(exc).__name__, 'message': str(exc)}
finally:
    receipt = {
        'at': datetime.datetime.now(datetime.UTC).isoformat(),
        'python': sys.version,
        'command': r'C:\Python314\python.exe -I -S docs/research/bots-swarms/cookie-policy-lab.py',
        'scriptSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'dependencySha256': dependency_hash,
        'checks': checks,
        'error': error,
        'success': error is None,
        'networkRequests': 0,
        'persistentCookieFiles': 0,
        'limits': 'Actual stdlib policy on synthetic objects; no Scrapy/browser/server authorization/device identity claim.',
    }
    receipt_path = home / ('cookie-policy-receipt-' + str(time.time_ns()) + '.json')
    with receipt_path.open('x', encoding='utf-8') as f:
        json.dump(receipt, f, indent=2)
    print(json.dumps({'receipt': str(receipt_path), 'checks': len(checks), 'success': receipt['success']}))
if error:
    raise SystemExit(1)
