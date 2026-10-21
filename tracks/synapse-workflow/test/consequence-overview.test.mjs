import test from 'node:test';
import assert from 'node:assert/strict';
import {consequenceOverview} from '../src/investigation/consequence-overview.mjs';
import {renderCaseSections,renderExecutiveReport} from '../src/practice/workflow-report.mjs';

const hash='a'.repeat(64);
function record(id='one',level='high'){
  return {id,title:'Selected case <script>',impactType:'exposure',substatus:'awaiting-owner-verification',gates:[{eventId:'gate',passed:true}],reviews:[{eventId:'review',gateEventId:'gate',verdict:'supported'}],ownerVerifications:[],retests:[],
    consequence:{stale:false,document:{capability:'Read selected record',whyPossible:'Declared boundary explanation <img>',severity:{level,rationale:'Declared business effect'},extent:{demonstrated:{description:'One selected sample',evidenceIds:['obs']},wider:{description:'Other records may share the boundary',evidenceIds:[],assumptions:['Untested common implementation']}},accessEffort:{level:'low',rationale:'Supplied access'},repair:{immediate:'Check selected boundary',broaderRule:'Preserve object ownership',legitimateFlowEffects:'Own records must stay usable',acceptanceChecks:['Original and related denial; legitimate positive control'],effort:{level:'high',rationale:'Declared engineering estimate'}},sequence:[{id:'step',explanation:'Observe selected record',evidenceIds:['obs'],screenshots:[{artifactId:'png-'+hash,sha256:hash,caption:'Declared screenshot'}],expected:'Own only',current:'Selected observation',proposedRepaired:'Proposed outcome, not demonstrated'}],nextInvestigation:{extendDemonstratedPath:'Check supported related paths within scope',resolveFixUncertainty:'Check legitimate behavior after repair'}}}};
}
function state(cases=[record()]){return{caseSummary:{verifiedFindings:[],issuesNeedingOwnerAction:cases,unconfirmedLeads:[]},purpose:'Local test',scope:{tracks:'both'},stopped:true,ownerRequests:[],coverage:{completeObservations:1,incompleteObservations:0},limitations:[],id:'run',revision:1};}
test('consequence overview retains categories, unknowns, assumptions and does not fabricate score or proof',()=>{
  const s=state([record('known'),record('unknown','unknown')]);s.caseSummary.unconfirmedLeads.push(record('rejected','critical'));s.caseSummary.unconfirmedLeads[0].gates=[{eventId:'rejected-gate',passed:false}];
  const original=structuredClone(s),v=consequenceOverview(s);
  assert.deepEqual(s,original);assert.deepEqual(v.entries.map(e=>e.caseId),['known','unknown','rejected']);
  assert.equal(v.entries[0].extent.widerSupport,'unsupported; assumptions only');assert.equal(v.entries[1].priority.tier,'needs-priority-context');assert.equal(v.entries[2].category,'unconfirmedLeads');assert.equal(v.entries[2].priority.tier,'unconfirmed-triage');assert.equal(v.entries[0].priority.repairEffort.level,'high');
  assert.equal(v.entries[0].nextInvestigation.focus,'establish-effect-before-extending-path');assert.equal(v.entries[0].screenshots[0].href,null);assert.ok(!Object.hasOwn(v.entries[0].priority,'score'));assert.deepEqual(s.caseSummary.verifiedFindings,[]);
});
test('advisory sorting uses severity then referenced reach then access; repair estimate never hides damage',()=>{
  const a=record('a'),b=record('b');b.consequence.document.extent.wider.evidenceIds=['wider'];
  const c=record('c','critical');c.consequence.document.accessEffort.level='high';
  const v=consequenceOverview(state([a,b,c]));assert.deepEqual(v.entries.map(e=>e.caseId),['c','b','a']);assert.equal(v.groups.length,1);assert.deepEqual(v.groups[0].caseIds,['c','b','a']);
  a.consequence.stale=true;assert.equal(consequenceOverview(state([a])).entries[0].priority.tier,'needs-documentation');
});
test('screenshots resolve only exact registered digest and sequence evidence; exports retain relative links',()=>{
  const s=state(),pointer=s.caseSummary.issuesNeedingOwnerAction[0].consequence.document.sequence[0].screenshots[0];
  s.screenshotArtifacts=[{...pointer,evidenceId:'different'}];assert.equal(consequenceOverview(s).entries[0].screenshots[0].href,null);
  s.screenshotArtifacts[0].evidenceId='obs';s.screenshotArtifacts[0].sha256='b'.repeat(64);assert.equal(consequenceOverview(s).entries[0].screenshots[0].href,null);
  s.screenshotArtifacts[0].sha256=hash;assert.equal(consequenceOverview(s).entries[0].screenshots[0].href,'/artifacts/png-'+hash);
  const html=renderExecutiveReport(s);assert.ok(html.includes('/artifacts/png-'+hash));assert.ok(html.includes('Proposed repaired outcome — not a retest'));assert.ok(html.includes('Actual retained retest: Not recorded'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<img>'));
  assert.ok(renderCaseSections(s,true,{exported:true}).includes('screenshots/png-'+hash+'.png'));
});
