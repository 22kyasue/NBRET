// Freeze a finite file inventory; never grants source-reading credit.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const dir=path.resolve('docs/research/assessment-evidence');
const prov=JSON.parse(fs.readFileSync(path.join(dir,'deep-provenance.json')));
const read=JSON.parse(fs.readFileSync(path.join(dir,'deep-reading-queue.json')));
const code=/\.(py|go|ps1|psm1|psd1|js|mjs|cjs|ts|tsx|html|css|sql|sh|bash|bat|cmd|jinja|j2)$/i;
const text=/\.(md|rst|toml|yaml|yml|json|ini|cfg|conf|txt|mod|sum|lock)$/i;
const special=/(^|\/)(LICENSE[^/]*|COPYING[^/]*|Dockerfile[^/]*|Makefile|MANIFEST.in|requirements[^/]*|\.gitignore)$/i;
const repos=[];
for(const r of prov.repositories){
 const tracked=execFileSync('git',['-C',r.root,'ls-files'],{windowsHide:true,encoding:'utf8',maxBuffer:64*1024*1024}).trim().split('\n');
 const files=[];
 for(const p of tracked){
  const full=path.join(r.root,p),bytes=fs.readFileSync(full);
  let classification=code.test(p)?'implementation-or-test':text.test(p)||special.test(p)?'documentation-config-or-data':'nontext-or-other';
  let disposition='queued',reason=null;
  if(/(^|\/)(runs|logs|results|dataframes)\//.test(p)){disposition='excluded-generated-run-artifact';reason='Historical generated runs are not implementation/tests/config/docs; separate public results may be consulted as evidence, not credited as source code.';}
  else if(classification==='nontext-or-other'){disposition='cataloged-nontext';reason='Not implicitly read or executed; inspect if a traced caller makes this artifact material.';}
  const prior=read.files.find(f=>f.project===r.project&&f.path===p&&f.commit===r.commit);
  files.push({path:p,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),lines:bytes.toString('utf8').split('\n').length-(bytes.at(-1)===10?1:0),classification,disposition,reason,readingStatus:prior?.status||'unread',rangeLedger:prior?'deep-reading-queue.json':null});
 }
 repos.push({project:r.project,root:r.root,commit:r.commit,files});
}
const result={at:new Date().toISOString(),task:'24a86df3-40b3-41bb-9b56-3ca16a18760b',scope:'Pinned six-repository implementation/test/config/documentation inventory, plus exact material dependencies discovered by caller traces. Historical generated runs and nontext assets are cataloged without source credit. No exhaustion claimed while relevant accessible queued files remain.',priority:['Close partial source files','OpenFGA failed-condition validation/reuse and iterator callers','OpenFGA language graph/CEL/custom types/v1 type system/database adapters','PentestGPT/UnifiedAgent recovery/truncation/resumption, SDK events, monitor HTTP/UI/secret flow','garak provider retries/probes/scoring and AgentDojo task-oracle/runtime closure','Atomic executor enforcement/logging/config dependencies','Remaining tests/config/docs and material dependency closure'],repositories:repos};
fs.writeFileSync(path.join(dir,'exhaustion-inventory.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(repos.map(r=>({project:r.project,tracked:r.files.length,queued:r.files.filter(f=>f.disposition==='queued').length,previouslyComplete:r.files.filter(f=>f.readingStatus.startsWith('complete')).length})),null,2));
