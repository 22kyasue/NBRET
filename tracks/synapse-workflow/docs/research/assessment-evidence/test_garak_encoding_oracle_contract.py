import ast
from pathlib import Path

ROOT = Path('C:/Users/kotar/.codex/research/garak')


def test_actual_trigger_exclusion_expression_produces_no_cases():
    source = ROOT / 'tests/probes/test_probes_encoding.py'
    tree = ast.parse(source.read_text(encoding='utf-8'))
    function = next(n for n in tree.body if isinstance(n, ast.FunctionDef)
                    and n.name == 'test_encoding_triggers_not_in_prompts')
    expression = function.decorator_list[0].args[1]
    assert isinstance(expression, ast.ListComp)
    excluded = ['probes.encoding.InjectMime', 'probes.encoding.InjectQP']
    names = ['probes.encoding.InjectBase64', *excluded]
    actual = eval(compile(ast.Expression(expression), str(source), 'eval'),
                  {'ENCODING_PROBES': names, 'CLEAR_TRIGGER_PROBES': excluded})
    assert actual == []
    # Intended membership exclusion is a contrary control, not an upstream fix.
    assert [name for name in names if name not in excluded] == ['probes.encoding.InjectBase64']


def test_actual_ngram_match_counts_fragments_without_semantic_or_order_oracle():
    source = ROOT / 'garak/resources/matching.py'
    tree = ast.parse(source.read_text(encoding='utf-8'))
    fn = next(n for n in tree.body if isinstance(n, ast.FunctionDef)
              and n.name == 'ngram_contained_match')
    namespace = {}
    exec(compile(ast.Module(body=[fn], type_ignores=[]), str(source), 'exec'), namespace)
    match = namespace['ngram_contained_match']
    assert match('abcdefgh', 'efgh / defg / cdef / bcde / abcd') == 1.0
    assert match('abc', 'abc') == 0.0
    assert match('abcdefgh', 'unrelated') == 0.0
