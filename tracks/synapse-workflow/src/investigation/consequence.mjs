// Declared interpretation only. Claim-record/retest guidance:
// assessment-evidence/framework.md:34-49; executable-claims.md:9.
// No I/O, image loading, effect oracle, risk score or permission grant.
function copy(value,depth=0,budget={nodes:0}) {
  if(++budget.nodes>10000||depth>20)throw new Error('Consequence structure budget exceeded');
  if(value===null||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value))return value;
  if(typeof value==='string'){if(value.length>2000)throw new Error('Consequence text budget exceeded');return value;}
  if(!value||typeof value!=='object'||!(Array.isArray(value)?Object.getPrototypeOf(value)===Array.prototype:[Object.prototype,null].includes(Object.getPrototypeOf(value))))throw new Error('Consequence requires plain JSON');
  const result=Array.isArray(value)?[]:{};
  for(const key of Reflect.ownKeys(value)){
    if(Array.isArray(value)&&key==='length')continue;
    const d=Object.getOwnPropertyDescriptor(value,key);
    if(typeof key!=='string'||['__proto__','constructor','prototype'].includes(key)||!d.enumerable||!Object.hasOwn(d,'value')||Array.isArray(value)&&(!/^(0|[1-9][0-9]*)$/.test(key)||Number(key)>=value.length))throw new Error('Consequence requires inert JSON fields');
    result[key]=copy(d.value,depth+1,budget);
  }
  if(Array.isArray(value)&&Object.keys(value).length!==value.length)throw new Error('Consequence requires dense arrays');
  return result;
}
function exact(value,keys){if(!value||Array.isArray(value)||typeof value!=='object'||Object.keys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(value,k)))throw new Error('Consequence missing or unknown fields');}
function text(value){if(typeof value!=='string'||!value.trim()||value.length>2000)throw new Error('Consequence requires bounded nonempty text');}
function list(value,max,empty=false){if(!Array.isArray(value)||value.length>max||!empty&&!value.length)throw new Error('Consequence list budget or completeness failure');}
function texts(value,max,empty=false){list(value,max,empty);value.forEach(text);}
function refs(value,empty=false){texts(value,30,empty);if(new Set(value).size!==value.length)throw new Error('Duplicate consequence evidence reference');}
function estimate(value,severity=false){exact(value,['level','rationale']);if(!(severity?['unknown','low','moderate','high','critical']:['unknown','low','moderate','high']).includes(value.level))throw new Error('Invalid declared consequence estimate');text(value.rationale);}

/** Structural validation; admission of evidence belongs to applyCaseEvent. */
export function validateConsequence(payload){
  const p=copy(payload);
  if(Buffer.byteLength(JSON.stringify(p))>128*1024)throw new Error('Consequence byte budget exceeded');
  exact(p,['caseId','capability','whyPossible','severity','extent','accessEffort','repair','sequence','nextInvestigation']);
  for(const k of ['caseId','capability','whyPossible'])text(p[k]);estimate(p.severity,true);estimate(p.accessEffort);
  exact(p.extent,['demonstrated','wider']);exact(p.extent.demonstrated,['description','evidenceIds']);text(p.extent.demonstrated.description);refs(p.extent.demonstrated.evidenceIds);
  exact(p.extent.wider,['description','evidenceIds','assumptions']);text(p.extent.wider.description);refs(p.extent.wider.evidenceIds,true);texts(p.extent.wider.assumptions,20);
  exact(p.repair,['immediate','broaderRule','legitimateFlowEffects','acceptanceChecks','effort']);
  for(const k of ['immediate','broaderRule','legitimateFlowEffects'])text(p.repair[k]);texts(p.repair.acceptanceChecks,20);estimate(p.repair.effort);
  list(p.sequence,20);const ids=new Set();
  for(const step of p.sequence){
    exact(step,['id','explanation','evidenceIds','screenshots','expected','current','proposedRepaired']);
    for(const k of ['id','explanation','expected','current','proposedRepaired'])text(step[k]);
    if(ids.has(step.id))throw new Error('Duplicate consequence sequence ID');ids.add(step.id);refs(step.evidenceIds);list(step.screenshots,10,true);
    for(const shot of step.screenshots){exact(shot,['artifactId','sha256','caption']);if(typeof shot.artifactId!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(shot.artifactId)||typeof shot.sha256!=='string'||!/^[a-f0-9]{64}$/.test(shot.sha256))throw new Error('Opaque artifact ID and lowercase SHA-256 required');text(shot.caption);}
  }
  exact(p.nextInvestigation,['extendDemonstratedPath','resolveFixUncertainty']);Object.values(p.nextInvestigation).forEach(text);
  return p;
}

/** Project a reducer-owned case, not arbitrary imported state. Never a verdict. */
export function projectConsequence(caseRecord){
  const latest=caseRecord.consequenceHistory?.at(-1);if(!latest)return null;
  const gate=caseRecord.gates.at(-1),review=caseRecord.reviews.filter(r=>r.gateEventId===gate?.eventId).at(-1);
  return {
    ...copy(latest),stale:latest.gateEventId!==(gate?.eventId??null)||latest.reviewEventId!==(review?.eventId??null),
    interpretation:'Declared interpretation; independent consequence and estimates unverified',
    reviewAuthority:'Gate and review bindings provide context only; this document is not independently reviewed',
    widerSupport:latest.document.extent.wider.evidenceIds.length?'cited-observations-only':'unsupported',
    screenshotsAuthority:'Unverified artifact pointers; no image bytes loaded or authenticated',
    repairStatus:'Proposed behavior only; no repaired build or effect established'
  };
}
