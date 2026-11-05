import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {projects} from './content.mjs';
const root=path.resolve(import.meta.dirname,'../../..');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const local=[];
const receipt=JSON.parse(fs.readFileSync(path.join(root,'tracks/synapse-workflow/docs/research/assessment-evidence/deep-agent-receipt.json')));
for(const [p,expected] of Object.entries(receipt.sources)){try{const actual=sha(fs.readFileSync(p));local.push({path:p,expected,actual,match:actual===expected});}catch(e){local.push({path:p,error:e.code});}}
const initialRepos=[
['GreyDGL/PentestGPT','e8b1bb77d1ac00329675cec3b060aba971ec1ac8'],
['jiwoochris/artex-global','fdfb7a17b7da5e2de716c0e98475ec77a41c64c6'],
['bugbasesecurity/pentest-copilot','cd512edd037a32ddb1df3caf2672915bd555daec'],
['KeygraphHQ/shannon','4bd88c12a9096d0b78ceb2828729d12dca70fa60'],
['BitterSecurity/Decepticon','b2d1080d605249f8ed48cfd87a95563eb3397fb1'],
['ipa-lab/hackingBuddyGPT','799f57e9d439ff80da506714fcf6c5124b342cd6'],
['JoasASantos/NeuroSploit','92e8959f4ea17bddaa0436505edcddf98f7d6b16'],
['cloudflare/security-audit-skill','c1c8a8c1471069fb0e188eeaff69b8e8db6564a8'],
['karpathy/autoresearch','228791fb499afffb54b46200aca536f79142f117'],
['Hack-with-Github/Awesome-Hacking','b2bb13aa69b4f568a1bab0cbb17b7a00a350dc36']];
const repos=[...new Map([...initialRepos,...projects.filter(p=>p.repo&&p.pin).map(p=>[p.repo,p.pin])].map(p=>[p[0],p])).values()];
const headers={'User-Agent':'NBRET-Delta-readonly-research','Accept':'application/vnd.github+json'};
async function get(url){const r=await fetch(url,{headers,signal:AbortSignal.timeout(18000)});if(!r.ok)throw new Error(`${r.status} ${url}`);return r.json();}
const upstream=[];
for(let i=0;i<repos.length;i+=3){await Promise.all(repos.slice(i,i+3).map(async([repo,pin])=>{const url='https://api.github.com/repos/'+repo;try{const meta=await get(url);const head=await get(url+'/commits/'+meta.default_branch);let compare=null;if(head.sha!==pin){const c=await get(url+'/compare/'+pin+'...'+head.sha);compare={status:c.status,aheadBy:c.ahead_by,behindBy:c.behind_by,totalCommits:c.total_commits,changedFiles:c.files?.map(f=>f.filename),filesMayBeCapped:true};}upstream.push({repo,pin,checkedAt:new Date().toISOString(),url:meta.html_url,defaultBranch:meta.default_branch,archived:meta.archived,head:head.sha,headCommitDate:head.commit.committer.date,sameAsReviewedPin:head.sha===pin,compare,limit:'Metadata/compare only; changed source was not automatically re-audited. No runtime claim.'});}catch(e){upstream.push({repo,pin,error:e.message,checkedAt:new Date().toISOString()});}}));}
const checks={at:new Date().toISOString(),localReceiptSourceHashes:local,upstream,method:'Read-only filesystem SHA-256 and unauthenticated official GitHub metadata/compare API. No upstream imports, tests, models, scans or runtime changes.'};
fs.writeFileSync(path.join(import.meta.dirname,'source-verification.json'),JSON.stringify(checks,null,2));
console.log(JSON.stringify({localHashes:local.map(x=>({path:x.path.split(/[/\\]/).pop(),match:x.match,error:x.error})),upstream:upstream.map(x=>({repo:x.repo,same:x.sameAsReviewedPin,head:x.head,ahead:x.compare?.aheadBy,error:x.error}))},null,2));
