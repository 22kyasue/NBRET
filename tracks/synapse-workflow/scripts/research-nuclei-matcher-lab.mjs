import { readFileSync, writeFileSync, mkdirSync, openSync, closeSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = 'C:/Users/kotar/.codex/research/nuclei';
const out = resolve(`runs/nuclei-matcher-research-${Date.now()}`); mkdirSync(out);
const source = `package matchers
import "testing"
func TestResearchEvidenceNeedNotOccurInCorpus(t *testing.T) {
 m:=llmMatcher("is this vulnerable?")
 m.SetLLMClient(&stubLLM{answer: \x60{"verdict":"yes","confidence":0.99,"evidence":"NONEXISTENT SYNTHETIC QUOTE"}\x60})
 matched,snippets:=m.MatchLLM("safe synthetic content",nil,nil)
 if !matched || len(snippets)!=1 || snippets[0]!="NONEXISTENT SYNTHETIC QUOTE" { t.Fatalf("unexpected: %v %v",matched,snippets) }
}
func TestResearchExpectOutsideOptionsCanMatch(t *testing.T) {
 m:=llmMatcher("classify")
 m.Expect="outside"; m.Options=[]string{"yes","no"}
 m.SetLLMClient(&stubLLM{answer: \x60{"verdict":"outside","confidence":0.9}\x60})
 matched,_:=m.MatchLLM("fixture",nil,nil)
 if !matched { t.Fatal("expected source-predicted acceptance") }
}
func TestResearchWrongVerdictRetainsInvalidConfidenceAudit(t *testing.T) {
 m:=llmMatcher("classify")
 m.SetLLMClient(&stubLLM{answer: \x60{"verdict":"no","confidence":99}\x60})
 matched,_,audit:=m.MatchLLMWithAudit("fixture",nil,nil)
 if matched || audit==nil || audit.Confidence!=99 { t.Fatalf("unexpected: %v %v",matched,audit) }
}
`;
const extra=join(out,'research_boundaries_test.go');writeFileSync(extra,source);
const virtual=join(root,'pkg/operators/matchers/research_boundaries_test.go');
const overlay=join(out,'overlay.json');writeFileSync(overlay,JSON.stringify({Replace:{[virtual]:extra}},null,2));
const sdk=resolve('.tools/security-research-go/sdk/go/bin/go.exe');
const args=['test','-overlay',overlay,'./pkg/operators/matchers','-run','^(TestMatchLLM|TestValidateLLM|TestLLMAudit|TestResearch)','-count=1','-json'];
const env={...process.env,GOTOOLCHAIN:'local',CGO_ENABLED:'0',GOPATH:resolve('.tools/security-research-go/module-cache'),GOCACHE:resolve('.tools/security-research-go/cache'),GOPROXY:'https://proxy.golang.org',GOSUMDB:'sum.golang.org'};
const log=join(out,'test.jsonl'),err=join(out,'stderr.txt'),fd=openSync(log,'w'),efd=openSync(err,'w'),started=performance.now();
const result=spawnSync(sdk,args,{cwd:root,env,windowsHide:true,stdio:['ignore',fd,efd],timeout:600000});closeSync(fd);closeSync(efd);
const sourceSha256={};
for(const p of ['pkg/operators/matchers/match_llm.go','pkg/operators/matchers/match_llm_test.go','pkg/operators/matchers/validate.go','pkg/operators/matchers/llm_audit.go','go.mod','go.sum'])sourceSha256[p]=createHash('sha256').update(readFileSync(join(root,p))).digest('hex');
const receipt={at:new Date().toISOString(),out,scope:'Production matcher methods with stub clients; no provider/target testing',command:{executable:sdk,args,cwd:root},environment:Object.fromEntries(['GOTOOLCHAIN','CGO_ENABLED','GOPATH','GOCACHE','GOPROXY','GOSUMDB'].map(k=>[k,env[k]])),exit:result.status,error:result.error?.message,signal:result.signal,elapsedMs:performance.now()-started,sourceSha256,overlaySha256:createHash('sha256').update(source).digest('hex'),logSha256:createHash('sha256').update(readFileSync(log)).digest('hex'),stderrSha256:createHash('sha256').update(readFileSync(err)).digest('hex')};
const events=readFileSync(log,'utf8').split('\n').filter(Boolean).map(line=>{try{return JSON.parse(line)}catch{return {raw:line}}});
receipt.tests=events.filter(e=>e.Test&&['pass','fail','skip'].includes(e.Action)).map(e=>({test:e.Test,action:e.Action,elapsed:e.Elapsed}));
writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2));writeFileSync('docs/research/security-landscape/deep-review/nuclei-matcher-lab-receipt.json',JSON.stringify(receipt,null,2));
console.log(JSON.stringify({out,exit:receipt.exit,error:receipt.error,tests:receipt.tests.length,elapsedMs:receipt.elapsedMs,stderrTail:readFileSync(err,'utf8').slice(-2000)}));
