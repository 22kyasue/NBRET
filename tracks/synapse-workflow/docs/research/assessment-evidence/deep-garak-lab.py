"""Execute reviewed production scoring methods only, with synthetic text."""
import ast
from collections import defaultdict
from dataclasses import dataclass
import hashlib
import io
import json
import logging
from pathlib import Path
import sys
from types import SimpleNamespace as NS

root = Path('C:/Users/kotar/.codex/research/garak')
def method(path, classname, methodname, env):
    tree = ast.parse((root/path).read_text(encoding='utf-8'))
    cls = next(x for x in tree.body if isinstance(x, ast.ClassDef) and x.name == classname)
    fn = next(x for x in cls.body if isinstance(x, ast.FunctionDef) and x.name == methodname)
    module = ast.Module(body=[ast.ImportFrom(module='__future__', names=[ast.alias(name='annotations')], level=0), fn], type_ignores=[])
    exec(compile(ast.fix_missing_locations(module), str(root/path), 'exec'), env)
    return env[methodname]

@dataclass
class Message:
    text: str | None

config = NS(transient=NS(hitlogfile=io.StringIO(), reportfile=io.StringIO(), run_id='synthetic'),
            plugins=NS(target_type='synthetic', target_name='no-model'), run=NS(generations=1),
            reporting=NS(hit_at_k=None, confidence_interval_method='none', bootstrap_min_sample_size=30),
            system=NS(narrow_output=False))
env = {'defaultdict': defaultdict, 'json': json, 'logging': logging, 'Path': Path, '_config': config}
detect = method(Path('garak/detectors/promptinject.py'), 'AttackRogueString', 'detect', env)
evaluate = method(Path('garak/evaluators/base.py'), 'Evaluator', '_evaluate_one_detector', env)
canary = 'SYNTHETIC-ROGUE-TEXT'
rows = [('safe-quote', f'I refuse to emit {canary} as an instruction.', [canary]),
        ('ordinary', 'A harmless answer.', [canary]), ('missing-output', None, [canary]),
        ('missing-metadata', 'A harmless answer.', [])]
attempts = []; scores = {}
for index, (name, text, triggers) in enumerate(rows):
    attempt = NS(outputs=[None if text is None else Message(text)], notes={'triggers': triggers},
                 intent='synthetic-intent', prompt=Message('Harmless fixture'), goal='Test scoring bookkeeping',
                 uuid=name, seq=index)
    values = detect(NS(case_sensitive=False), attempt)
    attempt.detector_results = {'promptinject.AttackRogueString': values}
    scores[name] = values; attempts.append(attempt)
assert scores == {'safe-quote': [1.0], 'ordinary': [0.0], 'missing-output': [None], 'missing-metadata': []}
evaluator = NS(probename='synthetic-source-method', test=lambda v: v < .5,
               print_results_wide=lambda *args: None, print_results_narrow=lambda *args: None)
record = evaluate(evaluator, attempts, 'promptinject.AttackRogueString')
assert (record['passed'], record['fails'], record['nones'], record['total_processed']) == (1, 1, 1, 3)
result = {'python': sys.version, 'scope': 'AST-extracted production detector/evaluator methods; initialization, provider, translation and harness not executed',
    'scores': scores, 'evaluation': record, 'generatedOutputs': len(attempts),
    'independentUnauthorizedActions': 0, 'modelCalls': 0, 'networkCalls': 0,
    'hitlog': config.transient.hitlogfile.getvalue(), 'evalLog': config.transient.reportfile.getvalue(),
    'scriptSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
    'sources': {p: hashlib.sha256((root/p).read_bytes()).hexdigest() for p in
       ['garak/detectors/promptinject.py', 'garak/evaluators/base.py']}}
Path(sys.argv[1]).write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8')
print(json.dumps(result, indent=2))
