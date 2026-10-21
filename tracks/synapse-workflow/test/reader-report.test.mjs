import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import http from 'node:http';
import {renderAssessmentReport,READER_SCRIPT_HASH} from '../src/practice/reader-report.mjs';
import {startWorkbenchServer} from '../src/practice/workbench-server.mjs';

function embedded(html){return JSON.parse(html.match(/<script id="assessment-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);}
test('reader snapshot preserves text and script boundaries while omitting operator secrets',()=>{
  const marker='</script><script>globalThis.READER_ATTACK=true</script>&<>\u2028';
  const state={id:'reader-test',revision:1,target:{origin:'http://127.0.0.1:1234',sourceHash:'a'.repeat(64)},scope:{tracks:'both',enabledActors:['anonymous'],executionBoundary:'owned-synthetic-app-only'},limitations:[marker],observations:[],caseSummary:{verifiedFindings:[],issuesNeedingOwnerAction:[],unconfirmedLeads:[]},ownerRequests:[],nonce:'PRIVATE_NONCE',outDir:'PRIVATE_LOCAL_PATH'};
  const html=renderAssessmentReport(state),data=embedded(html);
  assert.doesNotMatch(html,/<script>globalThis\.READER_ATTACK/);
  assert.ok(!html.includes('PRIVATE_NONCE'));assert.ok(!html.includes('PRIVATE_LOCAL_PATH'));
  assert.ok(JSON.stringify(data).includes(marker));
  const script=html.match(/<script>([\s\S]*)<\/script>/)[1];
  assert.equal(READER_SCRIPT_HASH,`'sha256-${createHash('sha256').update(script).digest('base64')}'`);
  assert.ok(html.includes(READER_SCRIPT_HASH));
  assert.doesNotMatch(script,/\bfetch\s*\(|XMLHttpRequest|\/api\/|sendBeacon/);
});

test('Japanese presentation translations are safely embedded without altering original evidence',()=>{
  const raw='original raw response </script>',translated='日本語の説明 </script><script>unsafe()</script>';
  const state={id:'locale-test',target:{origin:'https://example.invalid'},observations:[{id:'o1',response:{value:raw}}],caseSummary:{verifiedFindings:[],issuesNeedingOwnerAction:[],unconfirmedLeads:[]}};
  const html=renderAssessmentReport(state,{translations:{ja:{'English explanation':translated}}});
  const locale=JSON.parse(html.match(/<script id="reader-translations" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(locale.ja['English explanation'],translated);assert.equal(locale.ja['Supporting evidence'],'根拠となる証拠');
  assert.equal(embedded(html).observations[0].response.value,raw);assert.ok(!html.includes('<script>unsafe()'));
  assert.throws(()=>renderAssessmentReport(state,{translations:{ja:{bad:{html:'unsafe'}}}}),/Invalid reader translation/);
});

test('opening and exporting reader report from stopped records performs no target traffic',async t=>{
  const root=await mkdtemp(join(tmpdir(),'nbret-reader-')),first=await startWorkbenchServer({outDir:join(root,'session')});
  let resumed;
  t.after(async()=>{await resumed?.close();await first.close();assert.equal(dirname(root),resolve(tmpdir()));await rm(root,{recursive:true,force:true});});
  await first.session.stop('Reader test stopped record');await first.close();
  const original=http.request;let targetRequests=0;
  t.mock.method(http,'request',function(...args){targetRequests++;return original.apply(this,args);});
  resumed=await startWorkbenchServer({resumeFrom:join(root,'session')});
  const before=resumed.session.state(),response=await fetch(resumed.url+'/assessment'),html=await response.text();
  assert.equal(response.status,200);assert.match(response.headers.get('content-security-policy'),/script-src 'self' 'sha256-/);
  assert.doesNotMatch(response.headers.get('content-security-policy'),/script-src[^;]*unsafe-inline/);
  assert.ok(response.headers.get('content-security-policy').includes("img-src 'self'"));
  assert.equal(embedded(html).id,before.id);assert.equal(embedded(html).issues.length,0);
  assert.equal(targetRequests,0);assert.equal(resumed.session.state().revision,before.revision);
  const paths=await resumed.session.exportReport();
  assert.ok(paths.jsonPath&&paths.htmlPath&&paths.executivePath&&paths.readerPath);
  const exported=await readFile(paths.readerPath,'utf8');assert.equal(embedded(exported).id,before.id);
  assert.ok(!exported.includes('PRIVATE_NONCE'));assert.equal(targetRequests,0);
  for(const route of ['/','/report','/executive'])assert.equal((await fetch(resumed.url+route)).status,200);
});
