"""Only complete selected function ASTs; no garak import/plugins/provider."""
import ast
import sqlite3
import re
from pathlib import Path
from typing import IO, List

SOURCE = Path('C:/Users/kotar/.codex/research/garak/garak/analyze/report_digest.py')

def functions():
    wanted = {'_resolve_plugin_info', '_init_populate_result_db', '_get_probe_group_summaries', '_get_detectors_info', '_extract_to_probespec'}
    tree = ast.parse(SOURCE.read_text(encoding='utf-8'))
    nodes = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in wanted]
    assert len(nodes) == len(wanted)
    scope = {'sqlite3': sqlite3, 'List': List, 'IO': IO, 're': re}
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(SOURCE), 'exec'), scope)
    return scope

def test_empty_explicit_selection_display_falls_back_to_wildcard():
    f = functions()['_extract_to_probespec']
    assert f({'transient.active_probes': []}) == 'probes.*'
    assert f({'transient.active_probes': ['probes.synthetic.One']}) == 'synthetic.One'

def test_taxonomy_group_same_class_names_merge_in_summary_query():
    f = functions()
    cache = {'probes': {f'probes.{m}.Same': {'tags': ['synthetic:shared']} for m in ('first', 'second')}}
    evals = [{'probe': f'{m}.Same', 'detector': f'{m}.Check', 'passed': p, 'total_evaluated': 10} for m,p in [('first',2),('second',8)]]
    conn, cursor = f['_init_populate_result_db'](evals, 'synthetic', cache)
    try:
        assert cursor.execute('select count(*) from results').fetchone()[0] == 2
        summaries = f['_get_probe_group_summaries'](cursor, 'shared')
        assert len(summaries) == 1
        assert summaries[0][1:] == ('Same', 0.2)
        detectors = f['_get_detectors_info'](cursor, 'shared', 'Same')
        assert {x['detector'] for x in detectors} == {'first.Check', 'second.Check'}
    finally:
        conn.close()

def test_distinct_class_names_remain_separate():
    f = functions()
    cache = {'probes': {f'probes.{m}.{c}': {'tags': ['synthetic:shared']} for m,c in [('first','One'),('second','Two')]}}
    evals = [{'probe': f'{m}.{c}', 'detector': 'synthetic.Check', 'passed': 5, 'total_evaluated': 10} for m,c in [('first','One'),('second','Two')]]
    conn, cursor = f['_init_populate_result_db'](evals, 'synthetic', cache)
    try:
        assert len(f['_get_probe_group_summaries'](cursor, 'shared')) == 2
    finally:
        conn.close()
