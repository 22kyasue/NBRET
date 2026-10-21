import {createHash} from 'node:crypto';
// Narrow collected-evidence oracle, not an origin authenticator or scope grant.
// Research: framework.md:79-91; deep-pentestgpt.md:56-65.
function inert(value, depth=0, budget={n:0}) {
  if (++budget.n>100000 || depth>30) throw new Error('Proof input budget exceeded');
  if(value===null || typeof value==='boolean' || typeof value==='number'&&Number.isFinite(value))return;
  if(typeof value==='string'){if(value.length>65536)throw new Error('Proof text budget exceeded');return;}
  if(!value || typeof value!=='object' || !(Array.isArray(value)?Object.getPrototypeOf(value)===Array.prototype:[Object.prototype,null].includes(Object.getPrototypeOf(value))))throw new Error('Proof requires inert JSON');
  const keys=Reflect.ownKeys(value);
  for(const key of keys){
    if(Array.isArray(value)&&key==='length')continue;
    const d=Object.getOwnPropertyDescriptor(value,key);
    if(typeof key!=='string'||!d.enumerable||!Object.hasOwn(d,'value')||['__proto__','constructor','prototype'].includes(key)||Array.isArray(value)&&(!/^(0|[1-9][0-9]*)$/.test(key)||Number(key)>=value.length))throw new Error('Proof requires inert JSON');
    inert(d.value,depth+1,budget);
  }
  if(Array.isArray(value)&&keys.length!==value.length+1)throw new Error('Proof requires dense arrays');
}
function exact(v,keys){if(!v||Array.isArray(v)||typeof v!=='object'||Object.keys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(v,k)))throw new Error('Invalid proof fields');}
const text=v=>typeof v==='string'&&v.trim().length>0&&v.length<=2000;
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(object(v))return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v);}

/** Evaluates only the owned work-order tenant-isolation rule. Never executes. */
export function evaluateProof(plan,context){
  inert(plan);inert(context);
  if(Buffer.byteLength(JSON.stringify([plan,context]))>8*1024*1024)throw new Error('Proof input byte budget exceeded');
  exact(plan,['caseId','claim','kind','attemptId','controlId','actorProfileId','ownerProfileId']);
  if(Object.values(plan).some(v=>!text(v))||plan.kind!=='cross-tenant-object-read')throw new Error('Unsupported proof plan');
  const evidenceIds=[plan.attemptId,plan.controlId,plan.actorProfileId,plan.ownerProfileId];
  if(new Set(evidenceIds).size!==4)throw new Error('Proof needs four distinct evidence references');
  exact(context,['observations','environment']);exact(context.environment,['sourceHash']);
  if(!text(context.environment.sourceHash)||!Array.isArray(context.observations)||context.observations.length>1000)throw new Error('Invalid proof context');
  const ids=context.observations.map(o=>o?.id);
  if(ids.some(id=>!text(id))||new Set(ids).size!==ids.length)throw new Error('Ambiguous proof observation IDs');
  const missingRequirements=[],reasons=[];
  const limitations=['Only the fixed owned work-order tenant-isolation rule is evaluated.', 'Same-app identity consistency, not authenticated independence.', 'Collected structured receipts are not authenticated origin or causal proof; hashes bind bytes only.', 'No verified-finding promotion, execution permission, one-step-away label or wider compromise claim.'];
  function result(status){return {caseId:plan.caseId,kind:plan.kind,status,reasons,evidenceIds:[...evidenceIds],claim:plan.claim,limitations:[...limitations],missingRequirements};}
  const observations=evidenceIds.map(id=>context.observations.find(o=>o.id===id));
  for(let i=0;i<observations.length;i++){
    const o=observations[i],id=evidenceIds[i];
    if(!o){missingRequirements.push(`${id}: observation missing`);continue;}
    if(o.outcome!=='complete'||o.transport?.complete!==true||!Number.isFinite(o.transport.elapsedMs)||o.transport.elapsedMs<0||!object(o.response)||!Number.isInteger(o.response.status)||o.response.status<100||o.response.status>599||!Object.hasOwn(o.response,'value')||!/^[a-f0-9]{64}$/.test(o.response.bodySha256||'')||!Number.isInteger(o.response.bodyBytes)||o.response.bodyBytes<1||o.response.representation!=='json')missingRequirements.push(`${id}: complete JSON transport/body receipt required`);
    try{
      if(typeof o.response?.bodyText!=='string')throw Error('No retained body');
      const bytes=Buffer.from(o.response.bodyText,'utf8');
      if(bytes.length!==o.response.bodyBytes||createHash('sha256').update(bytes).digest('hex')!==o.response.bodySha256||canonical(JSON.parse(o.response.bodyText))!==canonical(o.response.value))throw Error('Body mismatch');
    }catch{missingRequirements.push(`${id}: parsed contents must match retained JSON body, byte count and SHA-256`);}
    if(!text(o.environment?.id)||o.environment?.sourceHash!==context.environment.sourceHash)missingRequirements.push(`${id}: current environment/source binding required`);
    if(!object(o.identity)||!['principal','tenant','role'].every(k=>text(o.identity[k]))||o.action?.actor!==o.identity.principal)missingRequirements.push(`${id}: actor/identity binding required`);
  }
  if(missingRequirements.length){reasons.push('Required evidence is absent, stale or incomplete.');return result('inconclusive');}
  const [attempt,control,actorReceipt,ownerReceipt]=observations;
  if(new Set(observations.map(o=>o.environment.id)).size!==1)missingRequirements.push('Receipts must share one environment instance.');
  function profile(o){
    const p=o.response.value?.profile;
    if(o.action.kind!=='profile'||o.request?.method!=='GET'||o.request?.path!=='/api/me'||o.response.status!==200||!object(p)||!['id','tenant','role'].every(k=>text(p[k]))||p.id!==o.identity.principal||p.tenant!==o.identity.tenant||p.role!==o.identity.role){missingRequirements.push(`${o.id}: successful exact identity profile required`);return null;}
    return p;
  }
  const actor=profile(actorReceipt),owner=profile(ownerReceipt);
  if(actor&&owner){
    if(actor.id===owner.id||actor.tenant===owner.tenant)missingRequirements.push('Distinct principals and distinct tenants required.');
    for(const [o,p]of[[attempt,actor],[control,owner]])if(o.identity.principal!==p.id||o.identity.tenant!==p.tenant||o.identity.role!==p.role)missingRequirements.push(`${o.id}: profile identity does not match read identity`);
  }
  for(const o of[attempt,control])if(o.action.kind!=='order'||o.request?.method!=='GET'||o.request?.path!==`/api/work-orders/${o.action.objectId}`||!/^WO-[NS][0-9]{3}$/.test(o.action.objectId||'')||Object.keys(o.action).some(k=>!['kind','actor','objectId'].includes(k)))missingRequirements.push(`${o.id}: exact owned work-order read required`);
  if(attempt.action.objectId!==control.action.objectId)missingRequirements.push('Attempt and owner control must address the exact same object.');
  const owned=control.response.value?.order;
  if(control.response.status!==200||!object(owned)||owned.id!==control.action.objectId||!owner||owned.tenant!==owner.tenant||owned.owner!==owner.id||!['draft','submitted','approved'].includes(owned.state)||!text(owned.title)||!text(owned.description))missingRequirements.push('Successful owner control with a full exact owned object required.');
  if(missingRequirements.length){reasons.push('Tenant-isolation prerequisites are not established.');return result('inconclusive');}
  const exposed=attempt.response.value?.order;
  if(object(exposed)&&canonical(exposed)===canonical(owned)){
    reasons.push('The actor received the full exact object separately collected through its different-tenant owner control, regardless of response status.');
    return result('demonstrated-in-collected-evidence');
  }
  reasons.push('The attempt did not contain the full exact owner-controlled object; status or quoted text alone cannot establish disclosure.');
  return result('not-demonstrated');
}
