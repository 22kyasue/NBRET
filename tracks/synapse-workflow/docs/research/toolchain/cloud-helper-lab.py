import ast
import hashlib
import json
from pathlib import Path
import socket
import sys
from types import SimpleNamespace
from datetime import datetime, timezone

base = Path(__file__).resolve().parent
root = base.parents[2]
queue = json.loads((base / 'queue.json').read_text(encoding='utf-8'))
snapshots = json.loads((base / 'snapshots.json').read_text(encoding='utf-8'))
pin = next(x for x in snapshots if x['name'] == 'prowler')
sources = {}
def load(relative):
    data = (Path(pin['root']) / relative).read_bytes()
    expected = next(x for x in queue if x['repo'] == 'prowler' and x['path'] == relative)
    digest = hashlib.sha256(data).hexdigest()
    assert digest == expected['sha256']
    sources[relative] = digest
    return ast.parse(data, filename=relative)

def forbidden(*args, **kwargs):
    raise AssertionError('Network or unselected dependency forbidden')
socket.socket = forbidden
socket.getaddrinfo = forbidden
namespace = {'check_invalid_not_actions': forbidden}
policy_file = 'prowler/providers/aws/services/iam/lib/policy.py'
tree = load(policy_file)
selected = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in {'process_actions', 'check_admin_access'}]
assert len(selected) == 2
exec(compile(ast.Module(body=selected, type_ignores=[]), policy_file, 'exec'), namespace)

allow = {'Effect': 'Allow', 'Action': '*', 'Resource': '*'}
cases = [
    ('allow', {'Statement': allow}, True),
    ('allow_and_deny', {'Statement': [allow, {'Effect': 'Deny', 'Action': '*', 'Resource': '*'}]}, True),
    ('conditional_allow', {'Statement': {**allow, 'Condition': {'Bool': {'aws:MultiFactorAuthPresent': 'true'}}}}, True),
    ('specific_action', {'Statement': {'Effect': 'Allow', 'Action': 's3:GetObject', 'Resource': '*'}}, False),
    ('empty', {}, None),
    ('missing', None, None),
]
observations = []
for name, value, expected in cases:
    actual = namespace['check_admin_access'](value)
    observations.append({'case': name, 'actual': actual, 'expected': expected, 'pass': actual is expected})

class CheckStandIn:
    def metadata(self):
        return {}
class ReportStandIn:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)
namespace.update(Check=CheckStandIn, Check_Report_AWS=ReportStandIn,
    iam_client=SimpleNamespace(region='synthetic-region', policies={'synthetic': SimpleNamespace(attached=True, type='AWS', name='synthetic-policy', document=None)}))
check_file = 'prowler/providers/aws/services/iam/iam_aws_attached_policy_no_administrative_privileges/iam_aws_attached_policy_no_administrative_privileges.py'
tree = load(check_file)
classes = [n for n in tree.body if isinstance(n, ast.ClassDef)]
assert len(classes) == 1
exec(compile(ast.Module(body=classes, type_ignores=[]), check_file, 'exec'), namespace)
reports = namespace[classes[0].name]().execute()
observations.append({'case': 'missing_document_check_body', 'count': len(reports), 'status': reports[0].status if reports else None, 'pass': len(reports) == 1 and reports[0].status == 'PASS'})
receipt = {'at': datetime.now(timezone.utc).isoformat(), 'python': sys.version, 'pin': pin['commit'], 'sourcesSha256': sources,
    'fixtureSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), 'observations': observations,
    'oraclePassed': all(x['pass'] for x in observations),
    'boundary': 'Exact unchanged AST function/class bodies; report/provider stand-ins; not normal package import, SDK collection, actual report model or final scan output',
    'cleanup': 'No service, credential discovery, cloud/network call or global state change; child exits; source and receipt retained'}
with (base / 'cloud-helper-receipt.json').open('x', encoding='utf-8') as f:
    json.dump(receipt, f, indent=2)
print(json.dumps({'oraclePassed': receipt['oraclePassed'], 'observations': observations}, indent=2))
sys.exit(0 if receipt['oraclePassed'] else 1)
