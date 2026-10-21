import {readFileSync,writeFileSync,mkdirSync,openSync,closeSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root='C:/Users/kotar/.codex/research/nuclei',out=resolve(`runs/nuclei-output-composition-${Date.now()}`);mkdirSync(out);
mkdirSync(join(out,'pkg/utils/json'),{recursive:true});
const files=['pkg/output/multi_writer.go','pkg/output/format_json.go'];
for(const f of files)writeFileSync(join(out,f.split('/').at(-1)),readFileSync(join(root,f)));
writeFileSync(join(out,'go.mod'),'module github.com/projectdiscovery/nuclei/v3\n\ngo 1.27.1\n\nrequire github.com/logrusorgru/aurora/v4 v4.0.0\n');
writeFileSync(join(out,'pkg/utils/json/json.go'),'package json\nimport "encoding/json"\nfunc Marshal(v interface{})([]byte,error){return json.Marshal(v)}\n');
writeFileSync(join(out,'standins.go'),`package output
import "github.com/logrusorgru/aurora/v4"
type ResultEvent struct { Request string; Response string }
type InternalWrappedEvent struct{}
type StandardWriter struct { jsonReqResp bool }
type Writer interface {Close();Colorizer()*aurora.Aurora;Write(*ResultEvent)error;WriteFailure(*InternalWrappedEvent)error;Request(string,string,string,error);WriteStoreDebugData(string,string,string,string);RequestStatsLog(string,string);ResultCount()int}
`);
writeFileSync(join(out,'composition_test.go'),`package output
import("testing";"errors";"github.com/logrusorgru/aurora/v4")
type sink struct{ format *StandardWriter;seen string;calls int;err error;count int }
func(s *sink)Write(e *ResultEvent)error{s.calls++;if s.format!=nil{if _,err:=s.format.formatJSON(e);err!=nil{return err}};s.seen=e.Request;return s.err}
func(s *sink)Close(){};func(s *sink)Colorizer()*aurora.Aurora{return nil};func(s *sink)WriteFailure(*InternalWrappedEvent)error{return nil};func(s *sink)Request(string,string,string,error){};func(s *sink)WriteStoreDebugData(string,string,string,string){};func(s *sink)RequestStatsLog(string,string){};func(s *sink)ResultCount()int{return s.count}
func TestOmitFirstMutatesSecondSink(t *testing.T){a:=&sink{format:&StandardWriter{jsonReqResp:false}};b:=&sink{};e:=&ResultEvent{Request:"synthetic request",Response:"synthetic response"};if err:=NewMultiWriter(a,b).Write(e);err!=nil{t.Fatal(err)};if b.calls!=1||b.seen!=""||e.Response!=""{t.Fatal("raw fields not cleared before second sink")}}
func TestReversedOrderControl(t *testing.T){a:=&sink{};b:=&sink{format:&StandardWriter{jsonReqResp:false}};if err:=NewMultiWriter(a,b).Write(&ResultEvent{Request:"synthetic request"});err!=nil{t.Fatal(err)};if a.seen!="synthetic request"||b.seen!=""{t.Fatal("unexpected reverse-order fields")}}
func TestFirstErrorStopsLaterSink(t *testing.T){want:=errors.New("synthetic output failure");a:=&sink{err:want};b:=&sink{};if err:=NewMultiWriter(a,b).Write(&ResultEvent{});!errors.Is(err,want){t.Fatal(err)};if a.calls!=1||b.calls!=0{t.Fatal("unexpected delivery")}}
func TestFirstPositiveCount(t *testing.T){if got:=NewMultiWriter(&sink{count:0},&sink{count:2},&sink{count:5}).ResultCount();got!=2{t.Fatal(got)}}
`);
const sdk=resolve('.tools/security-research-go/sdk/go/bin/go.exe'),args=['test','-mod=mod','-count=1','-json','.'];
const env={...process.env,GOTOOLCHAIN:'local',CGO_ENABLED:'0',GOPATH:resolve('.tools/security-research-go/module-cache'),GOCACHE:resolve('.tools/security-research-go/cache'),GOPROXY:'off',GOSUMDB:'off'};
const fd=openSync(join(out,'test.jsonl'),'w'),efd=openSync(join(out,'stderr.txt'),'w'),start=performance.now();
const r=spawnSync(sdk,args,{cwd:out,env,windowsHide:true,stdio:['ignore',fd,efd],timeout:60000});closeSync(fd);closeSync(efd);
const hash=b=>createHash('sha256').update(b).digest('hex'),log=readFileSync(join(out,'test.jsonl'),'utf8');
const events=log.split('\n').filter(Boolean).map(s=>{try{return JSON.parse(s)}catch{return{raw:s}}});
const receipt={at:new Date().toISOString(),out,scope:'Unchanged two source files in standalone module; reduced interfaces/events/synthetic sinks and standard-library JSON shim. Not full output package or target execution.',exit:r.status,error:r.error?.message,elapsedMs:performance.now()-start,command:{executable:sdk,args,cwd:out},moduleNetwork:{GOPROXY:'off',GOSUMDB:'off'},tests:events.filter(e=>e.Test&&['pass','fail','skip'].includes(e.Action)).map(e=>({test:e.Test,action:e.Action})),sourceSha256:Object.fromEntries(files.map(f=>[f,hash(readFileSync(join(root,f)))])),fixtureSha256:hash(readFileSync(join(out,'composition_test.go'))),logSha256:hash(log),stderrSha256:hash(readFileSync(join(out,'stderr.txt')))};
writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2));writeFileSync('docs/research/security-landscape/deep-review/nuclei-output-lab-receipt.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify({...receipt,stderrTail:readFileSync(join(out,'stderr.txt'),'utf8').slice(-1000)}));
