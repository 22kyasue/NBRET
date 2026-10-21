import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const own=path.resolve('docs/research/assessment-evidence');
const root='C:/Users/kotar/.codex/research/unified-agent-acff8ee';
const wrapper='C:/Users/kotar/.codex/research/unified-agent-acff8ee';
const exe='C:/Users/kotar/.codex/research/assessment-evidence-venv/Scripts/python.exe';
const receiptRoot=path.resolve('C:/Users/kotar/.codex/research/assessment-evidence-receipts');
const out=path.join(receiptRoot,`agent-recovery-${Date.now()}`);fs.mkdirSync(out);
const temp=path.resolve(out,'pytest-temp');if(!temp.startsWith(out+path.sep)||fs.existsSync(temp))throw Error('Unexpected pytest temp target');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const env={...process.env,PYTHONPATH:root+';'+"C:/Users/kotar/.codex/research/assessment-evidence-sdk-sources/openai-codex-0.1.0b3-source/openai_codex-0.1.0b3/src",PYTEST_DISABLE_PLUGIN_AUTOLOAD:'1',PYTHONDONTWRITEBYTECODE:'1'};
// Criteria fixed before execution: unchanged two files pass; all operational events
// come from scripted backends or constructed traces, not actual commands/providers.
const args=['-m','pytest','-q','-p','no:cacheprovider','-p','pytest_asyncio.plugin','--basetemp',temp,"C:\\Users\\kotar\\githubprojects\\NBRET\\docs\\research\\assessment-evidence\\test_wrapper_preparation_contract.py",'-s'];
const start=Date.now(),r=spawnSync(exe,args,{cwd:root,env,windowsHide:true,encoding:'utf8',timeout:120000,maxBuffer:2000000});
fs.writeFileSync(path.join(out,'stdout.txt'),r.stdout||'');fs.writeFileSync(path.join(out,'stderr.txt'),r.stderr||'');
const packages=spawnSync(exe,['-m','pip','freeze'],{windowsHide:true,encoding:'utf8'});
const receipt={at:new Date().toISOString(),command:[exe,...args],cwd:root,environment:{PYTHONPATH:env.PYTHONPATH,PYTEST_DISABLE_PLUGIN_AUTOLOAD:env.PYTEST_DISABLE_PLUGIN_AUTOLOAD,PYTHONDONTWRITEBYTECODE:env.PYTHONDONTWRITEBYTECODE},exitCode:r.status,error:r.error?.message,signal:r.signal,elapsedMs:Date.now()-start,out,stdout:r.stdout,stderr:r.stderr,packages:packages.stdout,criteria:'default symlink mode returns Windows1314 before backend; explicit copy mode reaches inert backend; fresh owned temporary trees only',scope:'actual wrapper preparation failure/result capture and explicit copy control; no provider, tool subprocess or existing workspace',sourceSha256:Object.fromEntries(['unified_agent/backends/codex.py','unified_agent/agent.py','unified_agent/task.py','unified_agent/tools.py','tests/test_codex_backend.py','tests/test_agent.py','tests/test_task.py','tests/test_tools.py','tests/fixture_registry.py','pyproject.toml'].map(p=>[p,hash(path.join(root,p))])),fixtureSha256:hash("C:\\Users\\kotar\\githubprojects\\NBRET\\docs\\research\\assessment-evidence\\test_wrapper_preparation_contract.py"),runnerSha256:hash(path.join(own,'run-wrapper-preparation-generated.mjs')),stdoutSha256:hash(path.join(out,'stdout.txt')),stderrSha256:hash(path.join(out,'stderr.txt')),intervention:'researcher selected test files, isolated temp root and source-path imports; production/upstream tests unchanged',cost:'local CPU/storage, no provider calls; no monetary estimate',limits:['source-path imports rather than a fully locked installed environment','scripted events do not prove underlying tools ran or observations are true','finite cases do not prove universal crash consistency or redaction']};
const file=path.join(own,`wrapper-offline-receipt-${start}.json`);fs.writeFileSync(file,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({file,exitCode:r.status,stdout:r.stdout,stderr:r.stderr},null,2));
