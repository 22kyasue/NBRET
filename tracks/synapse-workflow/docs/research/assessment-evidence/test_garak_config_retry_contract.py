import ast
import json
import logging
import platform
import stat
import os
from collections import defaultdict
from pathlib import Path
import pytest

SOURCE = Path('C:/Users/kotar/.codex/research/garak/garak/_config.py')

def loader():
    wanted = {'_nested_dict', '_key_exists', '_combine_into', '_load_config_files'}
    nodes = [n for n in ast.parse(SOURCE.read_text(encoding='utf-8')).body if isinstance(n, ast.FunctionDef) and n.name in wanted]
    assert len(nodes) == len(wanted)
    scope = dict(json=json, logging=logging, platform=platform, stat=stat, os=os, defaultdict=defaultdict, config_files=[], _map_legacy_selection=lambda _: None)
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(SOURCE), 'exec'), scope)
    scope['nested_dict'] = scope['_nested_dict']
    return scope

def test_open_failure_marks_filename_and_same_path_retry_skips(tmp_path):
    scope = loader()
    file = tmp_path / 'synthetic.json'
    with pytest.raises(FileNotFoundError):
        scope['_load_config_files']([str(file)])
    assert scope['config_files'] == [str(file)]
    file.write_text(json.dumps({'run': {'seed': 17}}), encoding='utf-8')
    retried = scope['_load_config_files']([str(file)])
    assert 'run' not in retried

def test_fresh_scope_reads_same_corrected_path(tmp_path):
    file = tmp_path / 'synthetic.json'
    file.write_text(json.dumps({'run': {'seed': 17}}), encoding='utf-8')
    scope = loader()
    result = scope['_load_config_files']([str(file)])
    assert result['run']['seed'] == 17
