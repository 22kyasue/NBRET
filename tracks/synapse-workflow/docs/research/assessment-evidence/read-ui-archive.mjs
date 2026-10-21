// Inspect the pinned local UI tarball through tar stdout; never install or execute members.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const dir=path.resolve('docs/research/assessment-evidence');
const archive='C:/Users/kotar/.codex/research/garak/garak-report/src/assets/kui-foundations-react-external-0.504.1.tgz';
const expected='e66593e0142d8abd40bad08588d7d59527d2e69f12eaef46db3cb1e2b431971a';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
if(hash(fs.readFileSync(archive))!==expected)throw Error('Changed archive');
const qp=path.join(dir,'ui-archive-reading-queue.json');
let q;
if(fs.existsSync(qp))q=JSON.parse(fs.readFileSync(qp));else{
const members=execFileSync('tar',['-tzf',archive],{encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024}).trim().split(/\r?\n/);
if(members.some(p=>p.startsWith('/')||p.split('/').includes('..')))throw Error('Unexpected member path');
q={archive,sha256:expected,package:'@kui/foundations-react-external',version:'0.504.1',license:'No license-named member found in prior archive inventory; not rights clearance',meaning:'Names inventoried; source ranges only credited after emitted, not runtime evidence',files:members.map(p=>({path:p,status:'unread',ranges:[],runtime:'not executed'}))};}
const [member,start,end]=process.argv.slice(2);
if(!member)console.log(JSON.stringify(q.files.filter(f=>/package\/src\/(ThemeProvider|Text|Tabs|StatusMessage|Anchor)\//.test(f.path))));else{
const e=q.files.find(f=>f.path===member);if(!e)throw Error('Unknown member');
const b=execFileSync('tar',['-xOzf',archive,member],{windowsHide:true,maxBuffer:8*1024*1024});const sha=hash(b);if(e.sha256&&e.sha256!==sha)throw Error('Changed member');e.sha256=sha;e.bytes=b.length;
const lines=b.toString('utf8').split('\n');if(lines.at(-1)==='')lines.pop();e.lines=lines.length;
const a=Number(start),z=Math.min(Number(end),e.lines);if(a<1||z<a||z-a>159)throw Error('Invalid bounded range');
console.log(member+' ['+a+'-'+z+'/'+e.lines+'] sha256='+sha+'\n'+lines.slice(a-1,z).map((l,i)=>(a+i)+': '+l).join('\n'));
e.ranges.push([a,z]);const seen=new Set();for(const[x,y]of e.ranges)for(let i=x;i<=y;i++)seen.add(i);e.status=seen.size===e.lines?'complete':'partial';}
q.updated=new Date().toISOString();fs.writeFileSync(qp,JSON.stringify(q,null,2)+'\n');
