import assert from 'node:assert/strict';
import { startLab } from './order-access-lab.mjs';
const lab = await startLab();
const checks = [];
const mode = value=>fetch(lab.origin+'/api/mode',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:value})});
const order = async (actor,id)=>{const r=await fetch(lab.origin+'/api/orders/'+id,{headers:{'X-Lab-User':actor}});return {status:r.status,body:await r.json()};};
try {
  let r=await order('Alice','2');
  assert.equal(r.status,200);assert.equal(r.body.order.owner,'Bob');checks.push('Vulnerable mode discloses Bob’s order to Alice.');
  await mode('deceptive');r=await order('Alice','2');
  assert.equal(r.status,403);assert.equal(r.body.order.address,'12 Example Lane');checks.push('Refusal status can coexist with leaked private content.');
  await mode('fixed');r=await order('Alice','2');
  assert.equal(r.status,403);assert.equal(r.body.order,undefined);checks.push('Repaired cross-account request returns no order.');
  r=await order('Bob','2');assert.equal(r.status,200);assert.equal(r.body.order.owner,'Bob');checks.push('Positive control: owner’s normal access still works.');
  await order('Alice','2');await order('Alice','2');
  const events=await(await fetch(lab.origin+'/api/events')).json();
  assert.ok(events.events.some(e=>e.decision==='denied'&&e.privateDataReturned));checks.push('Event record retains the distinction between refusal label and private data returned.');
  const alerts=await(await fetch(lab.origin+'/api/alerts')).json();assert.ok(alerts.alerts.some(a=>a.actor==='Alice'&&a.count>=3));checks.push('The explicit teaching rule produces an alert from repeated denied requests.');
  console.log(JSON.stringify({passed:true,at:new Date().toISOString(),runtime:process.version,checks,scope:'Six checks of a fictional loopback fixture. No external targets or proprietary implementations tested.'},null,2));
} finally { await lab.close(); }
