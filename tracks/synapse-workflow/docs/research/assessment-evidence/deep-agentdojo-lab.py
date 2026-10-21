"""Source-level scorer/runtime fixtures, no model or provider SDK invocation."""
import ast
import hashlib
import importlib.util
import json
import logging
from pathlib import Path
import sys
from types import SimpleNamespace as NS
from typing import Annotated

root = Path('C:/Users/kotar/.codex/research/agentdojo-20261017')
def load_function(path, name, env, cls=None):
    tree = ast.parse((root/path).read_text(encoding='utf-8'))
    nodes = tree.body if cls is None else next(x for x in tree.body if isinstance(x,ast.ClassDef) and x.name==cls).body
    fn=next(x for x in nodes if isinstance(x,ast.FunctionDef) and x.name==name)
    module=ast.Module(body=[ast.ImportFrom(module='__future__',names=[ast.alias(name='annotations')],level=0),fn],type_ignores=[])
    exec(compile(ast.fix_missing_locations(module),str(root/path),'exec'),env)
    return env[name]

runtime_path=root/'src/agentdojo/functions_runtime.py'
spec=importlib.util.spec_from_file_location('synthetic_ad_runtime',runtime_path)
runtime=importlib.util.module_from_spec(spec);sys.modules[spec.name]=runtime;spec.loader.exec_module(runtime)
class Counter(runtime.TaskEnvironment):
    value:int=0
class Env(runtime.TaskEnvironment):
    counter:Counter
def increment(counter:Annotated[Counter,runtime.Depends('counter')])->int:
    """Increment a synthetic counter."""
    counter.value+=1
    return counter.value
def outer(n:str)->str:
    """Return a string.

    :param n: A required string.
    """
    return n
rt=runtime.FunctionsRuntime([runtime.make_function(increment),runtime.make_function(outer)])
environment=Env(counter=Counter())
value,error=rt.run_function(environment,'outer',{'n':runtime.FunctionCall(function='increment',args={})})
assert error.startswith('ValidationError:') and environment.counter.value==1

env={}
trace_oracle=load_function(Path('examples/counter_benchmark/suites/counter/user_tasks.py'),'utility_from_traces',env,'UserTask1')
state=NS(counter=NS(counter=10))
traces=lambda n:[NS(function='increment_by',args={'n':n}),NS(function='increment_by',args={'n':-n}),NS(function='get_description',args={})]
intended=trace_oracle(None,'simple counter',state,state,traces(5))
wrong=trace_oracle(None,'simple counter',state,state,traces(0))
wrong_output=trace_oracle(None,'unrelated',state,state,traces(0))
assert intended and wrong and not wrong_output

text_converter=load_function(Path('src/agentdojo/types.py'),'get_text_content_as_str',env)
injectable=load_function(Path('src/agentdojo/task_suite/task_suite.py'),'is_task_injectable',env)
canary='---SYNTHETIC-CANARY---'
visible=[{'role':'tool','content':[{'type':'text','content':canary}]}]
assert injectable(visible,[canary]) is False

class BadRequest(Exception):pass
class ApiError(Exception):pass
class ServerError(Exception):pass
class TraceLogger:
    records=[]
    def __init__(self,**kwargs):self.context=kwargs;self.error=None
    def __enter__(self):return self
    def __exit__(self,*args):return False
    def log_error(self,error):self.error=error
    def set_contextarg(self,key,value):self.context[key]=value;TraceLogger.records.append(dict(self.context))
def fail(*args,**kwargs):raise ServerError('synthetic server failure')
suite=NS(name='synthetic',injection_tasks={'injection_task_0':None},
    get_injection_task_by_id=lambda _:NS(ID='injection_task_0'),run_task_with_pipeline=fail)
env.update({'BadRequestError':BadRequest,'ApiError':ApiError,'ServerError':ServerError,
    'TraceLogger':TraceLogger,'Logger':NS(get=lambda:None),'logging':logging})
run=load_function(Path('src/agentdojo/benchmark.py'),'run_task_with_injection_tasks',env)
utility,security=run(suite,NS(name=None),NS(ID='user_task_0'),
    NS(is_dos_attack=False,name='synthetic',attack=lambda *args:{}),None,False)
assert list(utility.values())==[False] and list(security.values())==[True]

receipt={'python':sys.version,'scope':'Actual functions runtime module plus AST-extracted scorer/orchestration methods; synthetic tools, errors and logger; no model/providers',
    'nestedEffectBeforeOuterValidation':environment.counter.value,'outerError':error,
    'exampleIntendedTracePass':intended,'exampleWrongZeroTracePass':wrong,'wrongOutputRejected':not wrong_output,
    'currentBlockMessageCanaryDetected':injectable(visible,[canary]),
    'serverErrorUtility':list(utility.values()),'serverErrorSecurity':list(security.values()),
    'modelCalls':0,'networkCalls':0,'scriptSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
    'sources':{p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in
      ['src/agentdojo/functions_runtime.py','src/agentdojo/task_suite/task_suite.py','src/agentdojo/benchmark.py',
       'examples/counter_benchmark/suites/counter/user_tasks.py']}}
Path(sys.argv[1]).write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
print(json.dumps(receipt,indent=2))
