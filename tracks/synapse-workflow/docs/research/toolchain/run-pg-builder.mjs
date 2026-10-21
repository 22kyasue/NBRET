import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile),base=path.resolve('docs/research/toolchain');
const receiptPath=path.join(base,'pg-builder-receipt.json');
try{await fs.access(receiptPath);throw Error('Receipt exists; preserve it before rerun.');}catch(e){if(e.code!=='ENOENT')throw e;}
const pins=JSON.parse(await fs.readFile(path.join(base,'snapshots.json'))),pin=pins.find(x=>x.name==='dawgs');
const q=JSON.parse(await fs.readFile(path.join(base,'queue.json'))),entry=q.find(x=>x.repo==='dawgs'&&x.path==='drivers/pg/batch.go');
const sha=b=>createHash('sha256').update(b).digest('hex');
const raw=await fs.readFile(path.join(pin.root,entry.path));if(sha(raw)!==entry.sha256)throw Error('Source changed');
const lines=raw.toString().split('\n'),method=lines.slice(738,771).join('\n'),fields=lines.slice(719,725).join('\n');
if(!method.startsWith('func (s *relationshipCreateBatchBuilder) Add('))throw Error('Range mismatch');
const fixture=`package fixture
import("context";"strings";"testing";"github.com/specterops/dawgs/graph")
type KindMapper interface{MapKind(context.Context,graph.Kind)(int16,error)}
type mapper struct{}
func(mapper)MapKind(context.Context,graph.Kind)(int16,error){return 1,nil}
type relationshipCreateBatch struct{count int}
func(s *relationshipCreateBatch)Add(uint64,uint64,int16){s.count++}
${fields}
${method}
func fresh()*relationshipCreateBatchBuilder{return &relationshipCreateBatchBuilder{keyToEdgeID:map[string]uint64{},relationshipUpdateBatch:&relationshipCreateBatch{},edgePropertiesIndex:map[uint64]int{}}}
func edge(id,a,b graph.ID,marker string)*graph.Relationship{return graph.NewRelationship(id,a,b,graph.AsProperties(map[string]any{marker:true}),graph.StringKind("R"))}
func add(t *testing.T,b *relationshipCreateBatchBuilder,r *graph.Relationship){t.Helper();if e:=b.Add(context.Background(),mapper{},r);e!=nil{t.Fatal(e)}}
func TestBuilderObservations(t *testing.T){
t.Run("endpoint_key_alias",func(t *testing.T){b:=fresh();add(t,b,edge(0,1,23,"one"));add(t,b,edge(0,12,3,"two"));if b.relationshipUpdateBatch.count!=1{t.Fatal(b.relationshipUpdateBatch.count)};t.Log("distinct endpoint pairs collapse into one row")})
t.Run("zero_id_wrong_property_bag",func(t *testing.T){b:=fresh();add(t,b,edge(0,1,2,"first"));add(t,b,edge(0,3,4,"second"));add(t,b,edge(0,3,4,"duplicate"));if b.relationshipUpdateBatch.count!=2||b.edgePropertiesBatch[0].Get("duplicate").Any()!=true||!b.edgePropertiesBatch[1].Get("duplicate").IsNil(){t.Fatal("unexpected merge destination")};t.Log("duplicate second edge marker merged into first bag")})
t.Run("nonzero_id_index_panic",func(t *testing.T){b:=fresh();add(t,b,edge(99,1,2,"first"));defer func(){if p:=recover();p==nil{t.Error("expected index panic")}else{t.Logf("recovered: %v",p)}}();add(t,b,edge(99,1,2,"duplicate"))})
t.Run("first_zero_id_control",func(t *testing.T){b:=fresh();add(t,b,edge(0,1,2,"first"));add(t,b,edge(0,1,2,"duplicate"));if b.relationshipUpdateBatch.count!=1||b.edgePropertiesBatch[0].Get("duplicate").Any()!=true{t.Fatal("control failed")}})
}
`;
const fixturePath=path.resolve('.tools/toolchain/pg-builder-fixture/builder_test.go');await fs.mkdir(path.dirname(fixturePath),{recursive:true});await fs.writeFile(fixturePath,fixture,{flag:'wx'});
const go=path.resolve('.tools/security-research-go/sdk/go/bin/go.exe'),cwd=path.resolve('.tools/toolchain/BloodHound');
const overrides={GOTOOLCHAIN:'local',GOWORK:'off',GOFLAGS:'-mod=readonly',GOPROXY:'off',GOSUMDB:'off',GOMAXPROCS:'2',GOPATH:path.resolve('.tools/toolchain/go/path'),GOCACHE:path.resolve('.tools/toolchain/go/cache'),GOMODCACHE:path.resolve('.tools/toolchain/go/modules')};
const env={...process.env,...overrides},args=['test','-p=2','-count=1','-timeout=15s','-json',fixturePath,'-run','^TestBuilderObservations$'];let result;const startedAt=new Date().toISOString();
try{result={code:0,...await exec(go,args,{cwd,env,windowsHide:true,timeout:60000,maxBuffer:2*1024*1024})};}catch(e){result={code:e.code,killed:e.killed,error:e.message,stdout:e.stdout||'',stderr:e.stderr||''};}
const events=result.stdout.split(/\r?\n/).filter(x=>x.startsWith('{')).map(x=>JSON.parse(x)),passed=events.filter(x=>x.Action==='pass'&&x.Test).map(x=>x.Test);
const expected=['endpoint_key_alias','zero_id_wrong_property_bag','nonzero_id_index_panic','first_zero_id_control'];
const receipt={startedAt,finishedAt:new Date().toISOString(),sourcePin:pin.commit,sourceSha256:sha(raw),methodRange:[739,771],methodSha256:sha(method),fieldsRange:[720,725],fixturePath,fixtureSha256:sha(fixture),go:(await exec(go,['version'],{env,windowsHide:true})).stdout.trim(),cwd,args,environmentOverrides:overrides,goModSha256:sha(await fs.readFile(path.join(cwd,'go.mod'))),goSumSha256:sha(await fs.readFile(path.join(cwd,'go.sum'))),passed,oraclePassed:result.code===0&&expected.every(x=>passed.includes('TestBuilderObservations/'+x)),...result,stdoutSha256:sha(result.stdout),stderrSha256:sha(result.stderr),cleanup:'In-memory subprocess exited; no database, listener or global configuration created.',limitations:['Exact Add method with stand-in mapper and row accumulator, actual pinned graph types','Not whole pg package or SQL execution','Not an application reachability or customer impact result']};
await fs.writeFile(receiptPath,JSON.stringify(receipt,null,2),{flag:'wx'});console.log(JSON.stringify({code:receipt.code,oraclePassed:receipt.oraclePassed,passed,stderr:receipt.stderr.slice(-1200)}));
