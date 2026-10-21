import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const own=path.resolve('docs/research/assessment-evidence');
const mod=path.resolve('.tools/security-research-go/module-cache/pkg/mod');
const modules={jwt:['github.com/golang-jwt/jwt/v5','v5.3.1'],gateway:['github.com/grpc-ecosystem/grpc-gateway/v2','v2.30.0'],grpcvalidator:['github.com/grpc-ecosystem/go-grpc-middleware/v2','v2.3.4'],api:['github.com/openfga/api/proto','v0.0.0-20260319214821-f153694bfc20'],language:['github.com/openfga/language/pkg/go','v0.3.2'],cel:['github.com/google/cel-go','v0.31.0'],pgx:['github.com/jackc/pgx/v5','v5.11.0'],conc:['github.com/sourcegraph/conc','v0.3.0']};
const [key,file,start,end]=process.argv.slice(2);
if(key==='keyfunc')modules.keyfunc=['github.com/MicahParks/keyfunc/v2','v2.1.0'];
if(key==='retryablehttp')modules.retryablehttp=['github.com/hashicorp/go-retryablehttp','v0.7.8'];
if(key==='cleanhttp')modules.cleanhttp=['github.com/hashicorp/go-cleanhttp','v0.5.2'];
if(key==='antlr')modules.antlr=['github.com/antlr4-go/antlr/v4','v4.13.1'];
if(key==='xexp')modules.xexp=['golang.org/x/exp','v0.0.0-20260908205506-85c1c2202aba'];
if(key==='backoff')modules.backoff=['github.com/cenkalti/backoff/v4','v4.3.0'];
if(key==='puddle')modules.puddle=['github.com/jackc/puddle/v2','v2.2.2'];
if(key==='xsync')modules.xsync=['golang.org/x/sync','v0.23.0'];
if(key==='pgpass')modules.pgpass=['github.com/jackc/pgpassfile','v1.0.0'];
if(key==='pgservice')modules.pgservice=['github.com/jackc/pgservicefile','v0.0.0-20240606120523-5a60cdf6a761'];
if(key==='zap')modules.zap=['go.uber.org/zap','v1.28.0'];
if(!modules[key])throw Error('Unknown pinned dependency');
const [name,version]=modules[key],escapedName=name.replace(/[A-Z]/g,c=>'!'+c.toLowerCase()),root=path.join(mod,`${escapedName}@${version}`);
const ledgerPath=path.join(own,'dependency-reading-queue.json');
const ledger=fs.existsSync(ledgerPath)?JSON.parse(fs.readFileSync(ledgerPath)):{};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
if(!ledger[key]){
 const info=JSON.parse(fs.readFileSync(path.join(mod,'cache/download',escapedName,'@v',version+'.info')));
 const entries=[];
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else{const bytes=fs.readFileSync(full);entries.push({path:path.relative(root,full).replaceAll('\\','/'),sha256:hash(bytes),lines:bytes.toString().split('\n').length-(bytes.at(-1)===10?1:0),ranges:[],status:'unread',runtime:'not executed'});}}}
 walk(root);ledger[key]={name,version,origin:info,root,licenseSha256:hash(fs.readFileSync(path.join(root,'LICENSE'))),files:entries};
}
if(file){
 const entry=ledger[key].files.find(e=>e.path===file);if(!entry)throw Error('Unknown file');
 const bytes=fs.readFileSync(path.join(root,file));if(hash(bytes)!==entry.sha256)throw Error('Changed source');
 const a=Number(start),b=Math.min(Number(end),entry.lines);if(a<1||b<a||b-a>159)throw Error('Invalid bounded range');
 console.log(`${name}@${version} ${file} [${a}-${b}/${entry.lines}]\n`+bytes.toString().split('\n').slice(a-1,b).map((line,i)=>`${a+i}: ${line}`).join('\n'));
 entry.ranges.push([a,b]);const covered=new Set();for(const [x,y]of entry.ranges)for(let i=x;i<=y;i++)covered.add(i);entry.status=covered.size===entry.lines?'complete':'partial';
}else console.log(JSON.stringify(ledger[key].files.map(({path,lines,status})=>({path,lines,status}))));
fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
