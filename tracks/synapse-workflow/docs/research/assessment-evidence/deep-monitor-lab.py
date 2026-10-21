"""Synthetic monitor data and one new owned child only; never existing run PIDs."""
import ast
import hashlib
import ipaddress
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
from types import SimpleNamespace as NS

root=Path('C:/Users/kotar/.codex/research/unified-agent-acff8ee')
sys.path.insert(0,str(root))
from unified_agent.monitoring import SQLiteRunMonitor
from unified_agent.events import CommandRun,Reasoning,RawEvent
monitor=SQLiteRunMonitor(':memory:')
recorder=monitor.start_run(run_id='synthetic-a',backend='fake',workspace='.',prompt='SYNTHETIC-PROMPT')
recorder.record(Reasoning('SYNTHETIC-REASONING'))
recorder.record(RawEvent('fake','synthetic',{'secret':'SYNTHETIC-RAW'}))
recorder.record(CommandRun(command='NOT-EXECUTED',exit_code=0,output='SYNTHETIC-COMMAND-SECRET'))
events=monitor.list_events('synthetic-a')
assert events[0].payload=={'content_omitted':True}
assert events[1].payload['data_omitted'] is True
assert events[2].payload['output']=='SYNTHETIC-COMMAND-SECRET'
assert monitor.get_run('synthetic-a').prompt=='SYNTHETIC-PROMPT'
assert monitor.list_events('synthetic-other')==[]
recorder.finish(status='succeeded')
try:
 recorder.record(Reasoning('late'))
 raise AssertionError('record after finish accepted')
except RuntimeError:pass
monitor.close()
tree=ast.parse((root/'unified_agent/monitor_web.py').read_text(encoding='utf-8'))
nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ['_owner_alive','validate_bind_host']]
module=ast.Module(body=[ast.ImportFrom(module='__future__',names=[ast.alias(name='annotations')],level=0),*nodes],type_ignores=[])
env={'os':os,'socket':socket,'ipaddress':ipaddress}
exec(compile(ast.fix_missing_locations(module),str(root/'unified_agent/monitor_web.py'),'exec'),env)
assert env['validate_bind_host']('127.0.0.1')=='127.0.0.1'
try:
 env['validate_bind_host']('0.0.0.0')
 raise AssertionError('nonloopback accepted')
except ValueError:pass
child_result={'executed':False}
if os.name=='nt':
 # READY synchronizes startup without ever querying arbitrary existing PIDs.
 child=subprocess.Popen([sys._base_executable,'-u','-c','import time; print("READY",flush=True); time.sleep(30)'],
   stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,creationflags=subprocess.CREATE_NO_WINDOW)
 try:
  assert child.stdout.readline().strip()=='READY'
  assert child.poll() is None
  result=env['_owner_alive'](NS(status='running',owner_host=socket.gethostname(),owner_pid=child.pid))
  try:
   code=child.wait(timeout=2)
  except subprocess.TimeoutExpired:
   code=None
  child_result={'executed':True,'ownedChildPid':child.pid,'childExecutable':sys._base_executable,'aliveBefore':True,'helperReturned':result,'exitAfter':code,'terminatedWithinTwoSeconds':code is not None}
 finally:
  if child.poll() is None:child.terminate();child.wait(timeout=5)
  child.stdout.close();child.stderr.close()
receipt={'python':sys.version,'platform':sys.platform,'scope':'Actual in-memory SQLite monitor; AST-only web helpers; one newly spawned hidden child; no web service/SDK/real run DB',
 'reasoningAndRawOmitted':True,'commandSecretRetained':True,'promptRetainedByDefault':True,
 'otherRunReturnsNoEvents':True,'recordAfterFinishRejected':True,'nonloopbackRejected':True,
 'windowsOwnerCheck':child_result,'networkCalls':0,'modelCalls':0,
 'scriptSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
 'sources':{p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in ['unified_agent/monitoring.py','unified_agent/monitor_web.py','unified_agent/events.py']}}
Path(sys.argv[1]).write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
print(json.dumps(receipt,indent=2))
