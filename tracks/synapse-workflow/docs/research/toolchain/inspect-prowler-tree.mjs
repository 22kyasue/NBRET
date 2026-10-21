import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const c=JSON.parse(await fs.readFile('docs/research/toolchain/catalog.json')),row=c.find(x=>x.project==='prowler-cloud/prowler');
const root=path.resolve('.tools/toolchain/prowler'),out=path.join(root,'tree-receipt.json');
try{await fs.access(out);throw Error('Receipt exists.');}catch(e){if(e.code!=='ENOENT')throw e;}
const url='https://api.github.com/repos/'+row.project+'/git/trees/'+row.catalogPin.commit+'?recursive=1',r=await fetch(url,{headers:{'User-Agent':'NBRET-public-source-research'}});
if(!r.ok)throw Error('Tree '+r.status);const b=Buffer.from(await r.arrayBuffer()),j=JSON.parse(b);if(j.truncated)throw Error('Truncated tree');
await fs.mkdir(root,{recursive:true});await fs.writeFile(out,b,{flag:'wx'});await fs.writeFile(path.join(root,'tree-provenance.json'),JSON.stringify({url,commit:row.catalogPin.commit,ref:row.catalogPin.ref,retrievedAt:new Date().toISOString(),sha256:createHash('sha256').update(b).digest('hex'),basis:'File-name tree only, no source reading'},null,2),{flag:'wx'});
console.log(j.tree.filter(x=>x.type==='blob'&&(/^(prowler\/__main__.py|prowler\/prowler.py|prowler\/lib\/check\/[^/]+\.py|prowler\/providers\/aws\/aws_provider.py|prowler\/providers\/aws\/services\/iam\/iam_password_policy_.*\/.*\.py|tests\/lib\/check\/.*\.py|LICENSE|pyproject.toml)$/.test(x.path))).map(x=>x.path));
