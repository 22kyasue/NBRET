"""Synthetic artifact transformations; no native garak import or browser."""
import ast
import json
import sys
import types
from pathlib import Path
from unittest.mock import patch

ROOT = Path('C:/Users/kotar/.codex/research/garak/garak')

def extract(file, name, scope):
    tree = ast.parse((ROOT / file).read_text(encoding='utf-8'))
    node = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == name)
    exec(compile(ast.Module(body=[node], type_ignores=[]), str(ROOT / file), 'exec'), scope)
    return scope[name]

def test_start_run_serializes_synthetic_nested_api_key(tmp_path):
    config = types.ModuleType('synthetic_config')
    config.system = types.SimpleNamespace(lite=False)
    config.transient = types.SimpleNamespace(starttime_iso='synthetic', reportfile=None, data_dir=tmp_path)
    config.run = types.SimpleNamespace()
    config.plugins = types.SimpleNamespace(generators={'synthetic': {'api_key': 'SYNTHETIC-NOT-A-CREDENTIAL'}})
    config.reporting = types.SimpleNamespace(report_dir=str(tmp_path), report_prefix='synthetic')
    config.version = 'synthetic'
    package = types.ModuleType('garak')
    package._config = config
    f = extract('command.py', 'start_run', {'json': json})
    with patch.dict(sys.modules, {'garak': package}):
        try:
            f()
        finally:
            if config.transient.reportfile:
                config.transient.reportfile.close()
    rows = [json.loads(x) for x in Path(config.transient.report_filename).read_text(encoding='utf-8').splitlines()]
    assert rows[0]['plugins.generators']['synthetic']['api_key'] == 'SYNTHETIC-NOT-A-CREDENTIAL'
    assert rows[1]['entry_type'] == 'init'

def test_build_html_does_not_escape_html_script_end_delimiter(tmp_path):
    ui = tmp_path / 'ui'
    ui.mkdir()
    (ui / 'index.html').write_text('<script>const data=__GARAK_INSERT_HERE__;</script>', encoding='utf-8')
    import os
    f = extract('analyze/report_digest.py', 'build_html', {'_config': None, 'os': os, 'sys': sys, 'json': json, '__file__': str(tmp_path / 'report_digest.py')})
    benign_marker = '</script><p>synthetic-marker</p>'
    output = f({'synthetic': benign_marker})
    assert benign_marker in output
    assert output.count('</script>') == 2
    # Bytes only. Never open or evaluate this synthetic HTML.
