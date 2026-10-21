// Advisory presentation only. Evidence references and declared labels are not
// independently admitted effects, coverage denominators or execution authority.
const categories = ['verifiedFindings','issuesNeedingOwnerAction','unconfirmedLeads'];
const labels = {exposure:'Information exposure','unauthorized-action':'Unauthorized business actions',disruption:'Business disruption',reach:'Wider access',availability:'Service availability',resource:'Resource consumption',other:'Other consequences'};
const severity = {critical:4,high:3,moderate:2,low:1};
const access = {low:3,moderate:2,high:1};
export const PRIORITY_POLICY = 'consequence-advisory-v1';
export function consequenceOverview(state) {
  const entries = categories.flatMap(category => (state.caseSummary?.[category]||[]).map(c => {
    const projected=c.consequence, document=projected?.document;
    const stale=Boolean(projected?.stale), gate=c.gates?.at(-1);
    const review=c.reviews?.filter(r=>r.gateEventId===gate?.eventId).at(-1);
    const owner=c.ownerVerifications?.filter(v=>v.gateEventId===gate?.eventId&&v.reviewEventId===review?.eventId).at(-1);
    const current=Boolean(document&&!stale);
    const widerReferenced=current&&document.extent.wider.evidenceIds.length>0;
    const tier=!current?'needs-documentation':category==='unconfirmedLeads'?'unconfirmed-triage':document.severity.level==='unknown'||document.accessEffort.level==='unknown'?'needs-priority-context':'owner-action-triage';
    const screenshots=(document?.sequence||[]).flatMap(step=>step.screenshots.map(pointer=>{
      const registered=(state.screenshotArtifacts||[]).find(a=>a.artifactId===pointer.artifactId&&a.sha256===pointer.sha256&&step.evidenceIds.includes(a.evidenceId));
      return {...pointer,stepId:step.id,status:registered?'retained-bytes; provenance and redaction declared':'unresolved-pointer',href:registered?`/artifacts/${registered.artifactId}`:null};
    }));
    return {caseId:c.id,title:c.title,category,impactType:c.impactType,consequenceGroup:labels[c.impactType]||labels.other,
      capability:document?.capability||null,whyPossible:document?.whyPossible||null,
      documentation:!document?'missing':stale?'stale':'declared-current',
      severity:document?.severity||{level:'unknown',rationale:'Not documented'},
      extent:document?{...document.extent,widerSupport:widerReferenced?'referenced-declaration':'unsupported; assumptions only'}:null,
      accessEffort:document?.accessEffort||{level:'unknown',rationale:'Not documented'},
      repair:document?.repair||null,sequence:document?.sequence||[],screenshots,
      priority:{policy:PRIORITY_POLICY,tier,damageLevel:current?document.severity.level:'unknown',widerReachReferenced:widerReferenced,accessEffortLevel:current?document.accessEffort.level:'unknown',repairEffort:document?.repair.effort||{level:'unknown',rationale:'Not documented'},basis:'Declared severity, evidence-referenced wider reach, then lower declared access effort. Unknown context is separate; repair effort is shown alongside. No numerical risk or coverage score.'},
      nextInvestigation:document?{...document.nextInvestigation,focus:!current?'refresh-stale-interpretation':owner?.result==='reproduced'&&gate?.passed&&review?.verdict==='supported'?'extend-owner-declared-path-and-check-repair-uncertainty':'establish-effect-before-extending-path',authority:'Advisory only; owner declarations are not independent proof and no execution permission is granted'}:null,
      retest:{proposedOutcome:'Proposal only; see sequence.proposedRepaired',actual:c.retests?.at(-1)||null},
      interpretation:'Declared consequence interpretation; independent effect not established'};
  }));
  const tiers={'owner-action-triage':0,'needs-priority-context':1,'unconfirmed-triage':2,'needs-documentation':3};
  entries.sort((a,b)=>tiers[a.priority.tier]-tiers[b.priority.tier]||
    (a.priority.tier==='owner-action-triage'?(severity[b.priority.damageLevel]-severity[a.priority.damageLevel]||Number(b.priority.widerReachReferenced)-Number(a.priority.widerReachReferenced)||access[b.priority.accessEffortLevel]-access[a.priority.accessEffortLevel]):0)||a.caseId.localeCompare(b.caseId,'en'));
  return {schemaVersion:1,policy:PRIORITY_POLICY,authority:'Advisory presentation; no executor input',entries,
    groups:Object.entries(labels).map(([impactType,label])=>({impactType,label,caseIds:entries.filter(e=>e.impactType===impactType).map(e=>e.caseId)})).filter(g=>g.caseIds.length),
    limitations:['Reference presence is not proof that a narrative follows from the evidence.','A demonstrated sample does not establish wider population size.','Screenshot hashes bind retained bytes, not authenticity or successful redaction.','Priority is provisional policy, not a validated business-loss model.']};
}
