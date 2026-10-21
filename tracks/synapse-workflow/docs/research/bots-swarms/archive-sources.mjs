import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const items=[
 ['robots','https://www.rfc-editor.org/rfc/rfc9309.txt'],
 ['signatures','https://www.rfc-editor.org/rfc/rfc9421.txt'],
 ['shared-addresses','https://www.rfc-editor.org/rfc/rfc6269.txt'],
 ['ipv6-temporary','https://www.rfc-editor.org/rfc/rfc8981.txt'],
 ['oauth-security','https://www.rfc-editor.org/rfc/rfc9700.txt'],
 ['kubernetes-jobs','https://kubernetes.io/docs/concepts/workloads/controllers/job/'],
 ['kubernetes-leases','https://kubernetes.io/docs/concepts/architecture/leases/'],
 ['kubernetes-service-accounts','https://kubernetes.io/docs/concepts/security/service-accounts/'],
 ['browser-contexts','https://playwright.dev/docs/browser-contexts'],
 ['qakbot-victims','https://www.justice.gov/usao-cdca/divisions/national-security-division/qakbot-resources'],
 ['911-s5','https://www.justice.gov/archives/opa/pr/911-s5-botnet-dismantled-and-its-administrator-arrested-coordinated-international-operation']
];
const root=path.resolve('.tools/bots-swarms/primary-sources');await fs.mkdir(root,{recursive:true});
const records=await Promise.all(items.map(async([id,url])=>{const at=new Date().toISOString();try{const r=await fetch(url,{signal:AbortSignal.timeout(25000)});const b=Buffer.from(await r.arrayBuffer()),file=path.join(root,`${id}.${id.startsWith('kubernetes')||['browser-contexts','qakbot-victims','911-s5'].includes(id)?'html':'txt'}`);if(r.ok)await fs.writeFile(file,b,{flag:'wx'});return {id,url,finalUrl:r.url,status:r.status,at,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),localFile:r.ok?file:null,reading:'selected web excerpts inspected; archive is not complete reading',kind:id==='911-s5'||id==='qakbot-victims'?'Primary government incident statement; allegations/outcomes attributed':'Primary specification or project documentation'};}catch(e){return {id,url,at,error:e.message,reading:'no archive reading credit'};}}));
for(const r of records){if(r.localFile){const body=await fs.readFile(r.localFile,'utf8');r.contentState=/triggerInterstitialChallenge|apology_objects\/interstitial/.test(body)?'challenge page; requested document not archived':'saved bytes; semantic review status separate';}}
await fs.writeFile('docs/research/bots-swarms/sources.json',JSON.stringify(records,null,2),{flag:'wx'});console.log(records.map(({id,status,error,bytes})=>({id,status,error,bytes})));
