import { mkdir,writeFile } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import assert from 'node:assert/strict';
import { runCapture } from '../src/run.mjs';
import { captureProfile } from '../src/profiles.mjs';
import { loadRun,compareRuns } from '../src/compare.mjs';

// Four explicit GET-only documentation observations; no searches, forms or replay.
const url='https://developer.mozilla.org/en-US/docs/Web/JavaScript';
const root=resolve(`runs/public-benchmark-${Date.now()}`);await mkdir(root);
const samples=[];
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  for(const repeat of [1,2]){
    const out=join(root,`${viewport.width}-${repeat}`);
    const summary=await runCapture({url,outDir:out,...captureProfile('behavior'),viewport,retainProfile:false,scenarioId:`mdn-${viewport.width}`,actions:[],expectations:[{selector:'h1',text:'JavaScript'}]});
    assert.equal(summary.errors.length,0,JSON.stringify(summary.errors));
    samples.push({out,viewport,repeat,elapsedMs:summary.metrics.elapsedBeforeReportsMs,requests:summary.counts.requests});
  }
}
const repeatComparisons=[];
for(const width of [1440,390]){
  const result=compareRuns(await loadRun(join(root,`${width}-1`)),await loadRun(join(root,`${width}-2`)));
  repeatComparisons.push({width,changes:result.changes,evidenceChanges:result.evidenceChanges,warnings:result.warnings});
}
const receipt={root,url,samples,repeatComparisons,limitations:['Read-only public documentation sample, not broad authenticated real-app coverage.','Live-page repeat differences can reflect dynamic content or timing; differences are retained, not automatically classified as regressions.']};
await writeFile(join(root,'receipt.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify({root,samples,repeatChanges:repeatComparisons.map(x=>({width:x.width,changes:x.changes.length}))},null,2));
