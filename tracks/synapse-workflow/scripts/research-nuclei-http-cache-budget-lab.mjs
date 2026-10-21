import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const source=readFileSync('C:/Users/kotar/.codex/research/nuclei/pkg/protocols/http/httpcache/httpcache.go');
const extracted=source.toString().split('\n').slice(172,202).join('\n');
const out=resolve('runs/nuclei-http-cache-budget-'+Date.now());mkdirSync(out);
writeFileSync(join(out,'go.mod'),'module research.invalid/cachebudget\n\ngo 1.27.1\n');
writeFileSync(join(out,'budget.go'),'package cachebudget\nimport("io/fs";"path/filepath";"sync/atomic")\ntype statusFilterCache struct{dir string;maxBytes int64;setCount atomic.Uint32}\n'+extracted);
const fixture=`package cachebudget
import("os";"path/filepath";"testing")
func TestBelowBudgetControl(t *testing.T){d:=t.TempDir();if err:=os.WriteFile(filepath.Join(d,"synthetic"),[]byte("A"),0600);err!=nil{t.Fatal(err)};c:=&statusFilterCache{dir:d,maxBytes:50};if c.overBudget(1){t.Fatal("below-budget rejected")}}
func TestFullDirectoryOnlySampled(t *testing.T){d:=t.TempDir();if err:=os.WriteFile(filepath.Join(d,"synthetic"),make([]byte,100),0600);err!=nil{t.Fatal(err)};c:=&statusFilterCache{dir:d,maxBytes:50};var rejected,allowed int;for i:=0;i<33;i++{if c.overBudget(1){rejected++}else{allowed++}};t.Logf("rejected=%d allowed=%d",rejected,allowed);if rejected!=2||allowed!=31{t.Fatal("unexpected sample behavior")}}
func TestMemoryFallbackNoBudget(t *testing.T){c:=&statusFilterCache{maxBytes:50};if c.overBudget(100){t.Fatal("unexpected memory budget")}}
`;writeFileSync(join(out,'budget_test.go'),fixture);
const sdk=resolve('.tools/security-research-go/sdk/go/bin/go.exe');const args=['test','-count=1','-json','.'];const env={...process.env,GOTOOLCHAIN:'local',CGO_ENABLED:'0',GOPATH:resolve('.tools/security-research-go/module-cache'),GOCACHE:resolve('.tools/security-research-go/cache'),GOPROXY:'off',GOSUMDB:'off'};
const start=performance.now();const r=spawnSync(sdk,args,{cwd:out,env,windowsHide:true,encoding:'utf8',timeout:15000});writeFileSync(join(out,'test.jsonl'),r.stdout||'');writeFileSync(join(out,'stderr.txt'),r.stderr||'');const hash=x=>createHash('sha256').update(x).digest('hex');const receipt={at:new Date().toISOString(),out,exit:r.status,error:r.error?.message,elapsedMs:performance.now()-start,scope:'Exact budget decision functions; minimal structure; synthetic local filesystem only',source:{commit:'a151a1d54fad0d5ef71f01662b0bb3955a98c7c5',path:'pkg/protocols/http/httpcache/httpcache.go',range:[173,202],sha256:hash(source),extractedSha256:hash(extracted)},fixtureSha256:hash(fixture),implementationSha256:hash(readFileSync(join(out,'budget.go'))),command:{executable:sdk,args,cwd:out},version:spawnSync(sdk,['version'],{windowsHide:true,encoding:'utf8'}).stdout.trim(),moduleNetwork:{GOPROXY:'off',GOSUMDB:'off'},tests:(r.stdout||'').split('\n').filter(Boolean).map(x=>JSON.parse(x)).filter(x=>x.Test&&['pass','fail','skip'].includes(x.Action)).map(x=>({test:x.Test,action:x.Action})),stdoutSha256:hash(r.stdout||''),stderrSha256:hash(r.stderr||'')};writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2));writeFileSync('docs/research/security-landscape/deep-review/nuclei-http-cache-budget-lab-receipt.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));
