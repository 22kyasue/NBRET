/** Inert intake and narrowing-only local scope. No target contact or authority grant. */
export function inertJson(value,depth=0,budget={nodes:0}) {
  if(++budget.nodes>10000||depth>24)throw new Error('Input structure exceeds budget');
  if(value===null||typeof value==='boolean'||typeof value==='string'&&value.length<=12000||typeof value==='number'&&Number.isFinite(value)&&!Object.is(value,-0))return value;
  if(!value||typeof value!=='object'||(Array.isArray(value)?Object.getPrototypeOf(value)!==Array.prototype:![Object.prototype,null].includes(Object.getPrototypeOf(value))))throw new Error('Bounded plain JSON required');
  const keys=Reflect.ownKeys(value),result=Array.isArray(value)?[]:{};
  if(Array.isArray(value)&&Object.keys(value).length!==value.length)throw new Error('Dense arrays required');
  for(const key of keys){if(Array.isArray(value)&&key==='length')continue;const descriptor=Object.getOwnPropertyDescriptor(value,key);
    if(typeof key!=='string'||['__proto__','constructor','prototype'].includes(key)||!descriptor.enumerable||!Object.hasOwn(descriptor,'value')||Array.isArray(value)&&(!/^(0|[1-9][0-9]*)$/.test(key)||Number(key)>=value.length))throw new Error('Inert JSON data fields required');
    result[key]=inertJson(descriptor.value,depth+1,budget);
  }return result;
}
export function exactFields(value,allowed){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!allowed.includes(key)))throw new Error('Unexpected fields');}
function lines(value,name){if(!Array.isArray(value)||value.length>40||value.some(v=>typeof v!=='string'||!v.trim()||v.length>2000))throw new Error(`Bounded ${name} text list required`);return value;}
export function normaliseScope(input={}) {
  const value=inertJson(input);exactFields(value,['tracks','permitTransitions','maxActions','progress']);
  const {tracks='both',permitTransitions=true,maxActions=52,progress={}}=value;
  if(!['anonymous','accounts','both'].includes(tracks)||typeof permitTransitions!=='boolean'||!Number.isInteger(maxActions)||maxActions<1||maxActions>52)throw new Error('Local scope may only narrow supported tracks and the 52-action ceiling');
  exactFields(progress,['windowSize','windows','minUseful']);
  const policy={windowSize:progress.windowSize??6,windows:progress.windows??2,minUseful:progress.minUseful??1};
  if(!Number.isInteger(policy.windowSize)||policy.windowSize<2||policy.windowSize>50||!Number.isInteger(policy.windows)||policy.windows<1||policy.windows>10||!Number.isInteger(policy.minUseful)||policy.minUseful<1||policy.minUseful>policy.windowSize)throw new Error('Invalid progress policy');
  const enabledActors=tracks==='anonymous'?['anonymous']:tracks==='accounts'?['alice','bob','carol','dana']:['anonymous','alice','bob','carol','dana'];
  return{tracks,permitTransitions,maxActions,enabledActors,progress:policy,executionBoundary:'owned-synthetic-app-only'};
}
export function createIntake(input) {
  const value=inertJson(input);exactFields(value,['url','context','businessRules','requestedMode','scope']);
  if(typeof value.url!=='string'||value.url.length>2048)throw new Error('Application URL required');
  let url;try{url=new URL(value.url);}catch{throw new Error('Valid HTTP application URL required');}
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash)throw new Error('Use an HTTP URL without credentials, query secrets or fragment');
  const context=lines(value.context??[],'context'),businessRules=lines(value.businessRules??[],'business rules');
  const requestedMode=value.requestedMode??'guided';if(!['guided','blind-requested'].includes(requestedMode))throw new Error('Unknown evaluation mode');
  return{schemaVersion:1,kind:'synapse-intake',requestedUrl:url.href,context,businessRules,requestedMode,scope:normaliseScope(value.scope??{}),
    executionAuthority:'none; this intake is metadata and cannot authorize target contact',
    admission:{liveTarget:'pending explicit authorized scope and executor admission',blindEvaluation:requestedMode==='blind-requested'?'pending protected answer custody and verified access separation':'not requested'},
    ownerQuestions:['Confirm the business question and intended workflow rules.','Provide approved identities/roles and data/effect limits; never put credentials in this intake.','Record authority, budget, stop contact and evidence handling before any live target activity.'],
    limitations:['URL-only intake works without inventing business policy.','No network request, source upload, provider call or permission change follows from this record.','Owned local practice execution uses its own separately fixed boundary, not the requested external URL.']};
}
