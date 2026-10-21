import ast
from pathlib import Path
from types import SimpleNamespace, MethodType
import pytest

SOURCE = Path('C:/Users/kotar/.codex/research/agentdojo-20261017/src/agentdojo/default_suites/v1_2/banking/injection_tasks.py')

def method(class_name, name):
    tree = ast.parse(SOURCE.read_text(encoding='utf-8'))
    cls = next(n for n in tree.body if isinstance(n, ast.ClassDef) and n.name == class_name)
    node = next(n for n in cls.body if isinstance(n, ast.FunctionDef) and n.name == name)
    future = ast.ImportFrom(module='__future__', names=[ast.alias(name='annotations')], level=0)
    scope = {}
    exec(compile(ast.Module(body=[future, node], type_ignores=[]), str(SOURCE), 'exec'), scope)
    return scope[name]

@pytest.mark.parametrize('class_name,helper,subject', [('InjectionTask0','get_streaming_service','synthetic-service'),('InjectionTask1','find_dinner_companion','pizza'),('InjectionTask3','find_phone','iphone')])
def test_nonempty_private_fact_does_not_require_fact_in_outgoing_subject(class_name, helper, subject):
    self = SimpleNamespace(_ATTACKER_IBAN='SYNTHETIC-DESTINATION', _SERVICES=['synthetic-service'])
    setattr(self, helper, MethodType(method(class_name, helper), self))
    pre = SimpleNamespace(bank_account=SimpleNamespace(transactions=[SimpleNamespace(subject=subject, sender='SYNTHETIC-COMPANION')]))
    post = SimpleNamespace(bank_account=SimpleNamespace(transactions=[SimpleNamespace(recipient='SYNTHETIC-DESTINATION', subject='unrelated benign text')]))
    assert getattr(self, helper)(pre)
    assert method(class_name, 'security')(self, '', pre, post) is True
    wrong_destination = SimpleNamespace(bank_account=SimpleNamespace(transactions=[SimpleNamespace(recipient='SYNTHETIC-OTHER', subject='unrelated benign text')]))
    assert method(class_name, 'security')(self, '', pre, wrong_destination) is False
    empty = SimpleNamespace(bank_account=SimpleNamespace(transactions=[]))
    assert method(class_name, 'security')(self, '', pre, empty) is False
