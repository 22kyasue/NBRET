import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync,execFileSync} from 'node:child_process';
const own=path.resolve('docs/research/assessment-evidence');
const root='C:/Users/kotar/.codex/research/openfga-20261017';
const exe=path.resolve('.tools/security-research-go/sdk/go/bin/go.exe');
const out=path.resolve('C:/Users/kotar/.codex/research/assessment-evidence-receipts',`graph-contracts-${Date.now()}`);
fs.mkdirSync(out,{recursive:true});
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const env={...process.env,GOTOOLCHAIN:'local',CGO_ENABLED:'0',GOPATH:path.resolve('.tools/security-research-go/module-cache'),GOCACHE:'C:/Users/kotar/.codex/research/assessment-evidence-receipts/openfga-1792267376264/build-cache'};
// Predefined criteria: unchanged upstream selected tests pass their own assertions.
// No race-detector claim: the configured build has CGO disabled.
const args=['test','-p','2','github.com/openfga/language/pkg/go/graph','./internal/condition/types','-run','^(TestConcurrentUsersetWeights|TestUsersetWeightDirect|TestUsersetWeightRecursivePath|TestUsersetWeightTupleCyclePath|TestUsersetWeightDependsOnRecursive|TestPrimitives|TestDecodeParameterType|TestIPaddressCELBinaryBinding)$','-count=1','-json'];
const started=Date.now();const stdout=fs.openSync(path.join(out,'stdout.jsonl'),'w'),stderr=fs.openSync(path.join(out,'stderr.txt'),'w');
const r=spawnSync(exe,args,{cwd:root,env,windowsHide:true,timeout:300000,stdio:['ignore',stdout,stderr]});fs.closeSync(stdout);fs.closeSync(stderr);
const events=fs.readFileSync(path.join(out,'stdout.jsonl'),'utf8').split('\n').filter(Boolean).map(x=>{try{return JSON.parse(x)}catch{return null}});
const dependency=JSON.parse(fs.readFileSync(path.join(own,'dependency-reading-queue.json'))).language;
const receipt={at:new Date().toISOString(),scope:'unchanged upstream graph/userset memoization and condition conversion tests; synthetic data; no server or network target',criteria:'selected tests pass their upstream assertions; no correctness claim beyond tested inputs; helper concurrency test does not exercise full concurrent graph traversal',command:{exe,args,cwd:root},toolchain:execFileSync(exe,['version'],{windowsHide:true,encoding:'utf8'}).trim(),environment:{GOTOOLCHAIN:env.GOTOOLCHAIN,CGO_ENABLED:env.CGO_ENABLED,GOPATH:env.GOPATH,GOCACHE:env.GOCACHE},exitCode:r.status,signal:r.signal,error:r.error?.message,elapsedMs:Date.now()-started,out,tests:events.filter(x=>x?.Test&&['pass','fail','skip'].includes(x.Action)),sourceSha256:Object.fromEntries(dependency.files.filter(x=>/^graph\//.test(x.path)).map(x=>[x.path,x.sha256])),conditionSourceSha256:Object.fromEntries(fs.readdirSync(path.join(root,'internal/condition/types')).map(p=>[p,hash(path.join(root,'internal/condition/types',p))])),dependencyOrigin:dependency.origin,runnerSha256:hash(path.join(own,'run-graph-contracts.mjs')),stdoutSha256:hash(path.join(out,'stdout.jsonl')),stderrSha256:hash(path.join(out,'stderr.txt')),intervention:'researcher selected test names and local build environment; production/test source unchanged',cost:'local CPU only; any build dependency downloads retained in stderr; no provider usage'};
const file=path.join(own,`graph-contracts-receipt-${started}.json`);fs.writeFileSync(file,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({file,exitCode:r.status,topTests:receipt.tests.filter(t=>!t.Test.includes('/')),stderr:fs.readFileSync(path.join(out,'stderr.txt'),'utf8').slice(-4000)},null,2));
