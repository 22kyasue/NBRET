import {validateConsequence} from '../investigation/consequence.mjs';
import {consequenceOverview} from '../investigation/consequence-overview.mjs';

// Pure projection of an already admitted workbench snapshot. This is neither an
// evidence authenticator nor a redactor for secrets embedded in narrative text
// or normalized business response values. No I/O, clock, model or target action.
const CATEGORIES=['verifiedFindings','issuesNeedingOwnerAction','unconfirmedLeads'];
const MISSING='Not supplied';
function fail(){throw new Error('Reader model requires bounded inert snapshot data');}
function object(value){
  if(!value||typeof value!=='object'||![Object.prototype,null].includes(Object.getPrototypeOf(value)))fail();
  return value;
}
function field(value,key){
  if(value===undefined||value===null)return undefined;
  object(value);
  const descriptor=Object.getOwnPropertyDescriptor(value,key);
  if(!descriptor)return undefined;
  if(!descriptor.enumerable||!Object.hasOwn(descriptor,'value'))fail();
  return descriptor.value;
}
function copy(value,depth=0,budget={nodes:0}){
  if(++budget.nodes>200000||depth>35)fail();
  if(value===null||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value))return value;
  if(typeof value==='string'){if(value.length>12000)fail();return value;}
  if(Array.isArray(value)){
    if(Object.getPrototypeOf(value)!==Array.prototype||value.length>2000||Reflect.ownKeys(value).length!==value.length+1)fail();
    return Array.from({length:value.length},(_,i)=>{
      const d=Object.getOwnPropertyDescriptor(value,String(i));
      if(!d?.enumerable||!Object.hasOwn(d,'value'))fail();
      return copy(d.value,depth+1,budget);
    });
  }
  object(value);const result={};
  for(const key of Reflect.ownKeys(value)){
    if(typeof key!=='string'||['__proto__','constructor','prototype'].includes(key))fail();
    result[key]=copy(field(value,key),depth+1,budget);
  }
  return result;
}
function pick(value,keys){
  if(value===undefined||value===null)return null;
  object(value);const result={};
  for(const key of keys){const v=field(value,key);if(v!==undefined)result[key]=copy(v);}
  return result;
}
function array(value,max=1000){
  if(value===undefined||value===null)return [];
  if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype||value.length>max||Reflect.ownKeys(value).length!==value.length+1)fail();
  return Array.from({length:value.length},(_,i)=>{
    const d=Object.getOwnPropertyDescriptor(value,String(i));
    if(!d?.enumerable||!Object.hasOwn(d,'value'))fail();return d.value;
  });
}
function supplied(value){return typeof value==='string'&&value.trim()?copy(value):MISSING;}
function url(value){
  if(typeof value!=='string'||value.length>2048)return MISSING;
  try{
    const parsed=new URL(value);
    if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password||parsed.search||parsed.hash)return MISSING;
    return value;
  }catch{return MISSING;}
}
const identity=value=>pick(value,['principal','tenant','role']);
const environment=value=>pick(value,['id','sourceHash']);
function observation(value,depth=0){
  if(depth>3)fail();
  const result=pick(value,['id','outcome','errorCode','actionReached']);
  if(!result)fail();
  for(const [key,keys] of [
    ['action',['kind','actor','objectId','transition']],
    ['identity',['principal','tenant','role']],
    ['environment',['id','sourceHash']],
    ['request',['actor','method','path']],
    ['response',['status','representation','bodyBytes','bodySha256','value']],
    ['transport',['complete','elapsedMs']],
    ['sourceImport',['id','head','authority']]
  ]){
    const v=field(value,key);if(v!==undefined)result[key]=pick(v,keys);
  }
  const setup=field(value,'setupReceipts');
  if(setup!==undefined)result.setupReceipts=array(setup,8).map(v=>observation(v,depth+1));
  return result;
}
function receipt(value){
  const result=pick(value,['id']);if(!result)fail();
  result.action=pick(field(value,'action'),['kind','actor','objectId','transition']);
  result.identity=identity(field(value,'identity'));
  result.environment=environment(field(value,'environment'));
  if(field(value,'observation')!==undefined)result.observation=observation(field(value,'observation'));
  return result;
}
function history(record){
  return {
    gates:array(field(record,'gates'),400).map(g=>{
      const result=pick(g,['eventId','passed','reasons','evidenceIds']);
      result.receipts=array(field(g,'receipts'),60).map(receipt);return result;
    }),
    reviews:array(field(record,'reviews'),400).map(v=>pick(v,['caseId','eventId','gateEventId','reviewerId','verdict','evidenceIds','objections','notes','authority'])),
    ownerVerifications:array(field(record,'ownerVerifications'),400).map(v=>({
      ...pick(v,['caseId','eventId','gateEventId','reviewEventId','result','evidenceIds','notes','authority']),environment:environment(field(v,'environment'))
    })),
    retestPlans:array(field(record,'retestPlans'),400).map(v=>({
      ...pick(v,['caseId','eventId','sourceHash','originalEvidenceIds','relatedEvidenceIds','legitimateControlIds']),receipts:array(field(v,'receipts'),90).map(receipt)
    })),
    retests:array(field(record,'retests'),400).map(v=>({
      ...pick(v,['caseId','eventId','planEventId','evidenceIds','notes','status','reasons','repairConclusion']),environment:environment(field(v,'environment'))
    }))
  };
}
function caseRecord(record){
  const result=pick(record,['id','title','substatus','interpretation','impactType','observed','expected','demonstratedConsequence','potentialConsequences','uncertainties','suggestedRepair','manualVerification','basisEvidenceIds']);
  if(!result||typeof result.id!=='string'||!result.id.trim())fail();
  for(const name of ['readerBriefing','readerBriefingJa']){
    const briefing=field(record,name);
    if(briefing){result[name]={};for(const key of ['title','risk','evidence','fix']){const value=field(briefing,key);if(typeof value==='string'&&value.trim())result[name][key]=copy(value);}}
  }
  result.identity=identity(field(record,'identity'));
  result.environment=pick(field(record,'environment'),['sourceHash']);
  Object.assign(result,history(record));
  const projected=field(record,'consequence');
  if(projected&&field(projected,'document'))result.consequence={
    document:validateConsequence(field(projected,'document')),stale:field(projected,'stale')!==false
  };
  return result;
}
function registeredArtifacts(state){
  return array(field(state,'screenshotArtifacts'),20).map(v=>pick(v,['artifactId','sha256','mediaType','bytes','evidenceId','caption'])).filter(v=>
    v&&typeof v.sha256==='string'&&/^[a-f0-9]{64}$/.test(v.sha256)&&v.artifactId===`png-${v.sha256}`&&v.mediaType==='image/png'&&Number.isSafeInteger(v.bytes)&&v.bytes>=57&&v.bytes<=4*1024*1024&&typeof v.evidenceId==='string'
  );
}

export function readerModel(state,options={}){
  const exported=field(options,'exported')??false;
  object(state);if(typeof exported!=='boolean')fail();
  const summary=field(state,'caseSummary'),caseSummary={};
  for(const category of CATEGORIES)caseSummary[category]=array(field(summary,category),50).map(caseRecord);
  const cases=CATEGORIES.flatMap(category=>caseSummary[category]);
  if(cases.length>50||new Set(cases.map(c=>c.id)).size!==cases.length)fail();
  const overview=consequenceOverview({caseSummary,screenshotArtifacts:registeredArtifacts(state)});
  const issues=CATEGORIES.flatMap(category=>caseSummary[category].map(c=>{
    const consequence=c.consequence?copy(overview.entries.find(e=>e.caseId===c.id)):null;
    if(exported&&consequence)for(const image of consequence.screenshots)if(image.href)image.href=`screenshots/${image.artifactId}.png`;
    return {caseId:c.id,title:supplied(c.title),category,status:supplied(c.substatus),interpretation:supplied(c.interpretation),
      ...Object.fromEntries(['observed','expected','demonstratedConsequence','potentialConsequences','uncertainties','suggestedRepair','manualVerification'].map(k=>[k,supplied(c[k])])),
      proof:(()=>{const p=array(field(state,'proofProgress'),50).find(p=>field(p,'caseId')===c.id);return p?{...pick(p,['status','nextAction']),result:pick(field(p,'result'),['kind','status','reasons','evidenceIds','missingRequirements','limitations'])}:null;})(),
      readerBriefing:c.readerBriefing||null,readerBriefingJa:c.readerBriefingJa||null,identity:c.identity,environment:c.environment,basisEvidenceIds:c.basisEvidenceIds||[],consequence,
      history:Object.fromEntries(['gates','reviews','ownerVerifications','retestPlans','retests'].map(k=>[k,c[k]]))};
  }));
  const target=field(state,'target'),scope=field(state,'scope'),intake=field(state,'intake'),subject=field(state,'subject');
  const enabled=array(field(scope,'enabledActors'),20);
  const actors=array(field(target,'actors'),20).map(a=>pick(a,['id','tenant','role']));
  const observations=array(field(state,'observations')).map(o=>observation(o));
  const ids=observations.map(o=>o.id).filter(id=>id!==undefined);
  if(new Set(ids).size!==ids.length)fail();
  const result={schemaVersion:1,id:supplied(field(state,'id')),revision:field(state,'revision')??null,
    subject:{company:supplied(field(subject,'company')),application:supplied(field(subject,'application')),
      website:url(field(target,'origin')),requestedWebsite:url(field(intake,'requestedUrl')),
      environment:supplied(field(scope,'executionBoundary')),date:supplied(field(subject,'date')??field(state,'createdAt')),sourceHash:supplied(field(target,'sourceHash'))},
    scope:{tracks:supplied(field(scope,'tracks')),accounts:actors.filter(a=>a&&enabled.includes(a.id)),
      context:copy(array(field(intake,'context'),40)),businessRules:copy(array(field(intake,'businessRules'),40)),
      limitations:copy(array(field(state,'limitations'),100)),stopReason:supplied(field(state,'stopReason')??field(state,'frontierStopReason'))},
    observations,issues,ownerRequests:array(field(state,'ownerRequests'),200).map(v=>({
      ...pick(v,['id','question','reason','evidenceIds','status']),
      resolutions:array(field(v,'resolutions'),400).map(r=>pick(r,['requestId','resolution','resolverId','authority']))
    }))};
  if(result.revision!==null&&(!Number.isSafeInteger(result.revision)||result.revision<0))fail();
  if(Buffer.byteLength(JSON.stringify(result))>16*1024*1024)fail();
  return result;
}
