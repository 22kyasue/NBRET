import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const own=path.resolve('docs/research/assessment-evidence');
const names={codex:['openai-codex','0.1.0b3','openai_codex-0.1.0b3'],claude:['claude-agent-sdk','0.2.90','claude_agent_sdk-0.2.90'],mcp:['mcp','2.3.0','mcp'],mcp_types:['mcp-types','2.3.0','mcp_types'],deepdiff:['deepdiff','8.6.1','deepdiff-8.6.1'],orderly:['orderly-set','5.5.0','orderly_set-5.5.0']};
const [key,file,start,end]=process.argv.slice(2);if(!names[key])throw Error('Unknown SDK');
const [name,version,folder]=names[key];
const root=key==='orderly'?'C:/Users/kotar/.codex/research/assessment-evidence-sdk-sources/orderly-set-5.5.0/source/orderly_set-5.5.0':key==='deepdiff'?'C:/Users/kotar/.codex/research/assessment-evidence-sdk-sources/deepdiff-8.6.1/source/deepdiff-8.6.1':['mcp','mcp_types'].includes(key)?`C:/Users/kotar/.codex/research/assessment-evidence-venv/Lib/site-packages/${folder}`:path.join('C:/Users/kotar/.codex/research/assessment-evidence-sdk-sources',`${name}-${version}-source`,folder);
const ledgerPath=path.join(own,'sdk-reading-queue.json');
const ledger=fs.existsSync(ledgerPath)?JSON.parse(fs.readFileSync(ledgerPath)):{};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const isBinary=p=>/\.(?:png|ico|pickle|whl|gz|zip|pdf)$/i.test(p);
if(!ledger[key]){
 const entries=[];
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='__pycache__'||e.name.endsWith('.pyc'))continue;const full=path.join(dir,e.name);if(e.isDirectory())walk(full);else{const b=fs.readFileSync(full);entries.push({path:path.relative(root,full).replaceAll('\\','/'),sha256:hash(b),lines:b.toString().split('\n').length-(b.at(-1)===10?1:0),ranges:[],status:'unread',runtime:'not executed'});}}}
 walk(root);ledger[key]={name,version,root,provenance:key==='orderly'?'orderly-source-acquisition-1792280593514.json; exact AgentDojo locked sdist, hash verified, no package import/install':key==='deepdiff'?'deepdiff-source-acquisition-1792280362677.json; exact AgentDojo locked sdist, hash verified, no package import/install':key==='mcp'?'claude-source-dependencies.json; actual isolated-venv resolved wheel, installed METADATA/RECORD provenance to follow':'sdk-source-download-receipt.json; declared lower-bound version, not an installed provider runtime',files:entries};
}
// Binary artifacts retain provenance, but newline counts are not source lines.
for(const entry of ledger[key].files)if(isBinary(entry.path)){
 if(entry.ranges.length)throw Error('Binary entry has reading ranges; audit before reclassification');
 if(entry.lines!==null)entry.legacyDecodedNewlineCount=entry.lines;
 entry.lines=null;entry.status='binary-unreviewed';entry.kind='binary';
}
if(file){
 const entry=ledger[key].files.find(x=>x.path===file);if(!entry)throw Error('Unknown file');
 if(entry.kind==='binary')throw Error('Binary artifact: use an appropriate read-only artifact review, not source line credit');
 const bytes=fs.readFileSync(path.join(root,file));if(hash(bytes)!==entry.sha256)throw Error('Changed source');
 const a=Number(start),b=Math.min(Number(end),entry.lines);if(a<1||b<a||b-a>159)throw Error('Invalid bounded range');
 console.log(`${name}@${version} ${file} [${a}-${b}/${entry.lines}]\n`+bytes.toString().split('\n').slice(a-1,b).map((l,i)=>`${a+i}: ${l}`).join('\n'));
 entry.ranges.push([a,b]);const covered=new Set();for(const [x,y]of entry.ranges)for(let i=x;i<=y;i++)covered.add(i);entry.status=covered.size===entry.lines?'complete':'partial';
}else console.log(JSON.stringify(ledger[key].files.map(({path,lines,status})=>({path,lines,status}))));
fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
