import { readFileSync, writeFileSync, mkdirSync, openSync, closeSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root='C:/Users/kotar/.codex/research/nuclei',out=resolve(`runs/nuclei-composition-research-${Date.now()}`);mkdirSync(out);
const source=`package templates
import (
 "context"
 "encoding/json"
 "fmt"
 "testing"
 "github.com/projectdiscovery/nuclei/v3/pkg/model/types/severity"
 "github.com/projectdiscovery/nuclei/v3/pkg/operators"
 "github.com/projectdiscovery/nuclei/v3/pkg/operators/extractors"
 "github.com/projectdiscovery/nuclei/v3/pkg/operators/matchers"
)
type researchLLM struct{}
func (researchLLM) Complete(context.Context,string,bool)(string,error){return \x60{"verdict":"yes","confidence":0.9,"evidence":"synthetic unsupported quote"}\x60,nil}
func TestResearchCriticalORNeedsNoDeterministicHit(t *testing.T){
 word:=&matchers.Matcher{Type:matchers.MatcherTypeHolder{MatcherType:matchers.WordsMatcher},Words:[]string{"NOT-IN-CORPUS"}}
 llm:=&matchers.Matcher{Type:matchers.MatcherTypeHolder{MatcherType:matchers.LLMMatcher},Prompt:"q"}
 tpl:=tmplWithMatchers(severity.Critical,word,llm)
 if err:=tpl.validateLLMSoleMatcher();err!=nil{t.Fatal(err)}
 ops:=tpl.RequestsHTTP[0].Operators
 if err:=ops.Compile();err!=nil{t.Fatal(err)}
 llm.SetLLMClient(researchLLM{})
 data:=map[string]interface{}{"body":"safe synthetic body"}
 callback:=func(d map[string]interface{},m *matchers.Matcher)(bool,[]string){
  if m.GetType()==matchers.LLMMatcher{return m.MatchLLM(d["body"].(string),nil,nil)}
  return m.MatchWords(d["body"].(string),d)
 }
 result,ok:=ops.Execute(data,callback,func(map[string]interface{},*extractors.Extractor)map[string]struct{}{return nil},false)
 if !ok||result==nil||!result.Matched{t.Fatalf("unexpected result: %v %v",ok,result)}
 t.Log("sole guard accepted critical OR; deterministic predicate false; stub LLM alone established Matched")
}
func TestResearchJSONProtocolQueueOrderVaries(t *testing.T){
 const input=\x60{"id":"research-json-order","info":{"name":"Synthetic order","author":"research","severity":"info"},"dns":[{"name":"{{FQDN}}","type":"A"}],"http":[{"method":"GET","path":["{{BaseURL}}"]}]}\x60
 orders:=map[string]int{}
 for i:=0;i<256;i++{var tpl Template;if err:=json.Unmarshal([]byte(input),&tpl);err!=nil{t.Fatal(err)};if len(tpl.RequestsQueue)!=2{t.Fatalf("queue length %d",len(tpl.RequestsQueue))};orders[fmt.Sprint(tpl.RequestsQueue[0].Type(),"/",tpl.RequestsQueue[1].Type())]++}
 t.Logf("orders: %v",orders)
 if len(orders)<2{t.Fatal("predicted order variation not reproduced")}
}
func TestResearchNegativeDSLErrorBecomesMatch(t *testing.T){
 m:=&matchers.Matcher{Type:matchers.MatcherTypeHolder{MatcherType:matchers.DSLMatcher},Negative:true,DSL:[]string{"missing_variable == true"}}
 if err:=m.CompileMatchers();err!=nil{t.Fatal(err)}
 raw:=m.MatchDSL(map[string]interface{}{})
 if raw||!m.Result(raw){t.Fatalf("unexpected raw=%v wrapped=%v",raw,m.Result(raw))}
}
var _ *operators.Operators
`;
const extra=join(out,'research_composition_test.go');writeFileSync(extra,source);
const overlay=join(out,'overlay.json');writeFileSync(overlay,JSON.stringify({Replace:{[join(root,'pkg/templates/research_composition_test.go')]:extra}},null,2));
const sdk=resolve('.tools/security-research-go/sdk/go/bin/go.exe'),args=['test','-overlay',overlay,'./pkg/templates','-run','^(TestCache|TestCloneTemplate|TestSoleLLM|TestResearch)','-count=1','-json'];
const env={...process.env,GOTOOLCHAIN:'local',CGO_ENABLED:'0',GOPATH:resolve('.tools/security-research-go/module-cache'),GOCACHE:resolve('.tools/security-research-go/cache'),GOPROXY:'https://proxy.golang.org',GOSUMDB:'sum.golang.org'};
const log=join(out,'test.jsonl'),err=join(out,'stderr.txt'),fd=openSync(log,'w'),efd=openSync(err,'w'),started=performance.now();
const result=spawnSync(sdk,args,{cwd:root,env,windowsHide:true,stdio:['ignore',fd,efd],timeout:600000});closeSync(fd);closeSync(efd);
const sourceSha256={};for(const p of ['pkg/templates/templates.go','pkg/templates/llm_validate.go','pkg/templates/llm_validate_test.go','pkg/templates/cache_test.go','pkg/templates/clone_test.go','pkg/operators/operators.go','pkg/operators/matchers/match.go','go.mod','go.sum'])sourceSha256[p]=createHash('sha256').update(readFileSync(join(root,p))).digest('hex');
const events=readFileSync(log,'utf8').split('\n').filter(Boolean).map(l=>{try{return JSON.parse(l)}catch{return {raw:l}}});
const receipt={at:new Date().toISOString(),out,scope:'Production parser/guard/operator/matcher with synthetic inputs and stub model only; no protocol execution',command:{executable:sdk,args,cwd:root},exit:result.status,error:result.error?.message,signal:result.signal,elapsedMs:performance.now()-started,sourceSha256,overlaySha256:createHash('sha256').update(source).digest('hex'),logSha256:createHash('sha256').update(readFileSync(log)).digest('hex'),tests:events.filter(e=>e.Test&&['pass','fail','skip'].includes(e.Action)).map(e=>({test:e.Test,action:e.Action,elapsed:e.Elapsed})),researchOutput:events.filter(e=>e.Test?.startsWith('TestResearch')&&e.Output).map(e=>({test:e.Test,output:e.Output}))};
writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2));writeFileSync('docs/research/security-landscape/deep-review/nuclei-composition-lab-receipt.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify({out,exit:receipt.exit,error:receipt.error,tests:receipt.tests.length,elapsedMs:receipt.elapsedMs,stderrTail:readFileSync(err,'utf8').slice(-1600)}));
