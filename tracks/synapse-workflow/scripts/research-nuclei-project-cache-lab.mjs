import { readFileSync, writeFileSync, mkdirSync, openSync, closeSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root='C:/Users/kotar/.codex/research/nuclei';
const out=resolve(`runs/nuclei-project-cache-research-${Date.now()}`);mkdirSync(out);
const source=`package projectfile
import("testing";"net/http";"io";"strings")
func TestResearchPreAuthCacheReuse(t *testing.T){
 p,err:=New(&Options{Path:t.TempDir(),Cleanup:true});if err!=nil{t.Fatal(err)};defer p.Close()
 key:=[]byte("GET /synthetic HTTP/1.1\\r\\nHost: fixture.invalid\\r\\n\\r\\n")
 resp:=&http.Response{ProtoMajor:1,ProtoMinor:1,StatusCode:200,Status:"200 OK",Header:http.Header{"X-Synthetic-Principal":[]string{"tenant-A"}}}
 if err:=p.Set(key,resp,[]byte("synthetic tenant-A body"));err!=nil{t.Fatal(err)}
 got,err:=p.Get(key);if err!=nil{t.Fatal(err)};defer got.Body.Close();body,_:=io.ReadAll(got.Body)
 if string(body)!="synthetic tenant-A body"||got.Header.Get("X-Synthetic-Principal")!="tenant-A"{t.Fatalf("unexpected replay: %v %s",got,body)}
 t.Log("identical pre-auth bytes replay stored tenant-A response; no principal argument exists")
 for _,changed:=range []string{strings.Replace(string(key),"\\r\\n\\r\\n","\\r\\nAuthorization: Bearer SYNTHETIC-B\\r\\n\\r\\n",1),strings.Replace(string(key),"/synthetic","/other",1)}{
  if _,err:=p.Get([]byte(changed));err!=ErrNotFound{t.Fatalf("expected miss for changed bytes: %v",err)}
 }
}
`;
const extra=join(out,'research_cache_test.go');writeFileSync(extra,source);
const overlay=join(out,'overlay.json');writeFileSync(overlay,JSON.stringify({Replace:{[join(root,'pkg/projectfile/research_cache_test.go')]:extra}},null,2));
const sdk=resolve('.tools/security-research-go/sdk/go/bin/go.exe');
const args=['test','-overlay',overlay,'./pkg/projectfile','-run','^TestResearch','-count=1','-json'];
const env={...process.env,GOTOOLCHAIN:'local',CGO_ENABLED:'0',GOPATH:resolve('.tools/security-research-go/module-cache'),GOCACHE:resolve('.tools/security-research-go/cache'),GOPROXY:'https://proxy.golang.org',GOSUMDB:'sum.golang.org'};
const log=join(out,'test.jsonl'),err=join(out,'stderr.txt'),fd=openSync(log,'w'),efd=openSync(err,'w'),started=performance.now();
const result=spawnSync(sdk,args,{cwd:root,env,windowsHide:true,stdio:['ignore',fd,efd],timeout:600000});closeSync(fd);closeSync(efd);
const hash=b=>createHash('sha256').update(b).digest('hex');
const sourceSha256=Object.fromEntries(['pkg/projectfile/project.go','pkg/projectfile/httputil.go','go.mod','go.sum'].map(p=>[p,hash(readFileSync(join(root,p)))]));
const events=readFileSync(log,'utf8').split('\n').filter(Boolean).map(line=>{try{return JSON.parse(line)}catch{return{raw:line}}});
const receipt={at:new Date().toISOString(),out,scope:'Synthetic project-cache component only; no HTTP engine or target/model calls',command:{executable:sdk,args,cwd:root},exit:result.status,error:result.error?.message,elapsedMs:performance.now()-started,sourceSha256,overlaySha256:hash(source),logSha256:hash(readFileSync(log)),stderrSha256:hash(readFileSync(err)),tests:events.filter(e=>e.Test&&['pass','fail','skip'].includes(e.Action)).map(e=>({test:e.Test,action:e.Action})),output:events.filter(e=>e.Output).map(e=>e.Output).join('')};
writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2));writeFileSync('docs/research/security-landscape/deep-review/nuclei-project-cache-lab-receipt.json',JSON.stringify(receipt,null,2));
console.log(JSON.stringify({out,exit:receipt.exit,tests:receipt.tests,elapsedMs:receipt.elapsedMs,stderrTail:readFileSync(err,'utf8').slice(-1000)}));
