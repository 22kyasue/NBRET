import { startFixture } from '../test/fixture.mjs';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import assert from 'node:assert/strict';
const dir=resolve(`runs/rea-scenario-${Date.now()}`);
await mkdir(dir,{recursive:true});
const fixture=await startFixture();
try {
  const input={browser:{mode:'launch',executable_path:chromium.executablePath(),headless:true},start_url:{url:fixture.url},actions:[
    {step_id:'calculate',action:'click',locator:{kind:'css',selector:'#calculate'},timeout_ms:10000},
    {step_id:'settle',action:'wait_for_timeout',duration_ms:500}],capture:{network:{request_body:true,response_body:true}}};
  await writeFile(`${dir}/input.json`,JSON.stringify(input));
  const {stdout}=await promisify(execFile)(process.execPath,['node_modules/rea-agents/scripts/rea.mjs','capture-browser-scenario',`${dir}/input.json`,'--format','json'],{timeout:60000,maxBuffer:16*1024*1024,windowsHide:true});
  const data=JSON.parse(stdout);
  await writeFile(`${dir}/result.json`,JSON.stringify(data,null,2));
  assert.equal(data.operation,'capture_browser_scenario');
  const events=data.normalized_result.events.items;
  const request=events.find(e=>e.kind==='request' && e.method==='POST' && e.url?.url.endsWith('/sum'));
  assert.ok(request);
  const contents=events.filter(e=>e.kind==='network-content' && e.transaction_id===request.transaction_id);
  const decode=phase=>JSON.parse(Buffer.from(contents.find(e=>e.phase===phase && e.body.state==='captured').body.content,'base64').toString());
  assert.deepEqual(decode('request'),{a:20,b:5});
  assert.deepEqual(decode('response'),{result:25});
  const summary={reaVersion:'6.4.0',operation:data.operation,request:decode('request'),response:decode('response'),pairedTransactionId:request.transaction_id,rawBodyCaptureVerified:true,completeness:data.normalized_result.completeness};
  await writeFile('docs/evaluation/rea-scenario-20261012.json',JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify({dir,...summary},null,2));
}finally{await fixture.close();}
