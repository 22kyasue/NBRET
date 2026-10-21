import fs from 'node:fs';
const dir='docs/research/cybersecurity-firms/',root='runs/cybersecurity-firms-20261017/source/';
const rr=JSON.parse(fs.readFileSync(dir+'reading-ranges.json','utf8'));
function put(base,p,state,ranges,annotation){rr.files[root+base+'/'+p]={state,ranges,annotation};}
for(const p of ['Packs/CommonPlaybooks/Playbooks/playbook-Isolate_Endpoint_-_Generic_V2.yml','Packs/CommonPlaybooks/Playbooks/playbook-Isolate_Endpoint_-_Generic_V2_README.md','Packs/CommonPlaybooks/Playbooks/playbook-Isolate_Endpoint_-_Generic_V2_6_8.yml','Packs/CrowdStrikeFalcon/Playbooks/playbook-Crowdstrike_Falcon_-_Isolate_Endpoint.yml','Packs/CommonPlaybooks/TestPlaybooks/playbook-Isolate_and_unisolate_endpoint_-_test.yml'])put('pan',p,'complete-file',[],'pan-isolation-source.md');
for(const p of ['connector.py','constant.py','microsoft_api_auth.py','requirements.txt','release_notes.md'])put('fort','microsoft-sentinel/'+p,'complete-file',[],'fortinet-sentinel-source.md');
put('fort','microsoft-sentinel/operations.py','partial',[[1,325]],'fortinet-sentinel-source.md');
put('fort','microsoft-sentinel/info.json','partial',[],'fortinet-sentinel-source.md');
fs.writeFileSync(dir+'reading-ranges.json',JSON.stringify(rr,null,2)+'\n');
const repos=JSON.parse(fs.readFileSync(dir+'repositories.json','utf8'));
const notes={'CrowdStrike/falconpy':'falcon-host-action-source.md','trendmicro/vision-one-mcp-server':'trend-mcp-source.md','google/secops-wrapper':'google-investigations-source.md','demisto/content':'pan-isolation-source.md','splunk/security_content':'splunk-lsass-source.md','Azure/Azure-Sentinel':'sentinel-playbooks-source.md'};
for(const r of repos.repositories){r.reading='selected workflow read; repository partial';r.annotation=notes[r.repo];}
if(!repos.repositories.some(r=>r.repo==='fortinet-fortisoar/connector-microsoft-sentinel'))repos.repositories.push({"repo":"fortinet-fortisoar/connector-microsoft-sentinel","sha":"9606fe875f20bc500bc6bafb1bfa995833523f3b","date":"2026-08-24T04:47:58Z","tree":"786cf03a8940e962c6ac1c463de52da84b5529c4","reading":"selected incident/auth workflow read; repository partial","annotation":"fortinet-sentinel-source.md","runtime":"not executed"});
fs.writeFileSync(dir+'repositories.json',JSON.stringify(repos,null,2)+'\n');
let t=fs.readFileSync(dir+'README.md','utf8').replace('[Sentinel playbooks](sentinel-playbooks-source.md).','[Sentinel playbooks](sentinel-playbooks-source.md), [Cortex isolation](pan-isolation-source.md) and [FortiSOAR incident connector](fortinet-sentinel-source.md).');
fs.writeFileSync(dir+'README.md',t);
let m=fs.readFileSync(dir+'microsoft-phishing-agent.md','utf8').replace('A vendor-authored randomized trial exists in the discovery queue and needs full methodology review before any numerical claim.','The vendor-authored randomized trial has now been read; its [canonical methodology note](microsoft-phishing-trial.md) explains the experimental boundary and limitations.');
fs.writeFileSync(dir+'microsoft-phishing-agent.md',m);
let c=fs.readFileSync(dir+'continuation.md','utf8').replace('Six repos pinned','Seven repos pinned').replace('Palo Alto demisto content | Pin only | Selected connector/playbook and tests','Palo Alto demisto content | Generic versions, CrowdStrike child and selected test read; see pan-isolation-source.md | Integration implementation, other branches and runtime');
c+='\nPAN and Fortinet checkpoint: complete parent/version-specific graph, one CrowdStrike child and referenced generic test read; selected FortiSOAR incident/authentication chain read with UI schema. Canonical traces are pan-isolation-source.md and fortinet-sentinel-source.md. Seven repos pinned; all repository-level reviews remain partial. Next focus: unresolved API action-state contracts and financial/customer-service evidence, then diagram-ready flow records.\n';
fs.writeFileSync(dir+'continuation.md',c);
