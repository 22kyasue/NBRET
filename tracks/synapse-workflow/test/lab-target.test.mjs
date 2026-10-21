import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import {once} from 'node:events';
import {startLabTarget,TARGET_LIMITS} from '../src/lab/target.mjs';
import {startLabMailbox,sendLocalMail,MAIL_LIMITS,isLabEmail} from '../src/lab/mail.mjs';

// Only the fresh fixture's literal loopback origins are used. No providers/install/subprocesses.
function request(origin,path,{method='GET',body,token,headers={}}={}){
  const url=new URL(path,origin);
  assert.equal(url.hostname,'127.0.0.1');
  const payload=body===undefined?undefined:JSON.stringify(body);
  return new Promise((resolve,reject)=>{
    const req=http.request(url,{method,agent:false,headers:{...(payload===undefined?{}:{'content-type':'application/json','content-length':Buffer.byteLength(payload)}),...(token?{authorization:`Bearer ${token}`} :{}),...headers}},res=>{
      const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('error',reject);res.on('end',()=>{const text=Buffer.concat(chunks).toString();let value;try{value=JSON.parse(text);}catch{value=text;}resolve({status:res.statusCode,headers:res.headers,value,text});});
    });req.setTimeout(2000,()=>req.destroy(new Error('test request timeout')));req.on('error',reject);req.end(payload);
  });
}
async function identity(lab,email){
  const password='disposable-password-123';
  const registered=await request(lab.origin,'/api/register',{method:'POST',body:{email,password}});
  assert.equal(registered.status,201);
  assert.deepEqual(registered.value,{registered:true,verificationRequired:true});
  const before=await request(lab.origin,'/api/login',{method:'POST',body:{email,password}});assert.equal(before.status,401);
  const mailbox=await request(lab.inboxOrigin,`/messages?recipient=${encodeURIComponent(email)}`,{token:lab.mailboxToken});
  assert.equal(mailbox.status,200);assert.equal(mailbox.value.messages.length,1);
  const message=mailbox.value.messages[0];
  assert.equal(message.to,email);assert.equal(message.buildId,lab.buildId);assert.equal(message.generation,lab.generation);
  assert.match(message.headers.received,/from local-lab\.test \(\[127\.0\.0\.1\]\) by local-lab\.test with ESMTP id /);
  const verify=new URL(message.text.match(/http:\/\/127\.0\.0\.1:\d+\/verify\?token=[a-f0-9]{64}/)[0]);
  assert.equal(verify.origin,lab.origin);
  assert.equal((await request(lab.origin,verify.pathname+verify.search)).status,200);
  assert.equal((await request(lab.origin,verify.pathname+verify.search)).status,400,'verification is single-use');
  const login=await request(lab.origin,'/api/login',{method:'POST',body:{email,password}});assert.equal(login.status,200);
  const me=await request(lab.origin,'/api/me',{token:login.value.token});assert.deepEqual(me.value,{user:login.value.user});
  return login.value;
}

for(const mode of ['secure','ownership-gap'])test(`${mode}: actual delivered verification and matched order controls`,async()=>{
  const lab=await startLabTarget({mode,port:0,mailPort:0});
  try{
    const home=await request(lab.origin,'/');assert.equal(home.status,200);assert.match(home.text,/href="\/signup"/);assert.match(home.text,/href="\/api-docs"/);
    assert.equal(home.headers['x-lab-build-id'],lab.buildId);assert.equal(home.headers['x-lab-generation'],lab.generation);
    const guide=await request(lab.origin,'/api-docs');assert.equal(guide.value.registration.path,'/api/register');
    assert.equal((await request(lab.inboxOrigin,'/messages?recipient=a@lab.test')).status,401);
    assert.equal((await request(lab.inboxOrigin,'/messages?recipient=a@lab.test',{token:'wrong'})).status,401);
    const a=await identity(lab,'alice@lab.test'),b=await identity(lab,'bob@lab.test');
    const created=await request(lab.origin,'/api/orders',{method:'POST',token:a.token,body:{description:'Synthetic order alpha'}});
    assert.equal(created.status,201);assert.equal(created.value.order.ownerId,a.user.id);assert.equal(typeof created.value.order.id,'string');
    const path=`/api/orders/${created.value.order.id}`;
    const owner=await request(lab.origin,path,{token:a.token});assert.deepEqual(owner.value,created.value);
    const anonymous=await request(lab.origin,path);assert.equal(anonymous.status,401);assert.deepEqual(anonymous.value,{error:'authentication required'});
    const foreign=await request(lab.origin,path,{token:b.token});
    if(mode==='secure'){assert.equal(foreign.status,403);assert.deepEqual(foreign.value,{error:'access denied'});assert(!foreign.text.includes('Synthetic order alpha'));}
    else{assert.equal(foreign.status,200);assert.deepEqual(foreign.value,created.value);}
    assert.deepEqual((await request(lab.origin,'/api/orders',{token:b.token})).value,{orders:[]},'gap does not change collection scoping');
    assert.deepEqual((await request(lab.origin,'/api/orders',{token:a.token})).value,{orders:[created.value.order]});
    assert.equal((await request(lab.origin,path,{method:'POST',token:b.token,body:{description:'tamper'}})).status,404);
    assert.equal(lab.inspect().orders[0].description,'Synthetic order alpha');
    assert.equal(lab.inspect().mail.accepted,2);assert.equal(lab.inspect().mail.localOnly,true);
    const inspected=JSON.stringify(lab.inspect());assert(!inspected.includes(a.token));assert(!inspected.includes('disposable-password'));assert(!inspected.includes('salt'));
    for(const hidden of ['/inspect','/source','/key','/api/inspect'])assert.equal((await request(lab.origin,hidden)).status,404);
  }finally{
    const result=await lab.close();assert.equal(result.closed,true);assert.equal(result.listening,false);assert.equal(result.activeConnections,0);assert.equal(result.activeHandlers,0);assert.equal(result.mail.activeConnections,0);assert.equal(result.mail.listening,false);
  }
});

test('build binds mode/source configuration; startup generations and data are fresh',async()=>{
  const a=await startLabTarget(),b=await startLabTarget(),c=await startLabTarget({mode:'ownership-gap'});
  try{assert.match(a.buildId,/^[a-f0-9]{64}$/);assert.equal(a.buildId,b.buildId);assert.notEqual(a.buildId,c.buildId);assert.notEqual(a.generation,b.generation);assert.notEqual(a.mailboxToken,b.mailboxToken);assert.deepEqual(b.inspect().users,[]);assert.deepEqual(b.inspect().orders,[]);}
  finally{await Promise.all([a.close(),b.close(),c.close()]);}
});

test('input, mail authentication, recipient and account bounds fail without secret reflection',async()=>{
  const lab=await startLabTarget();
  try{
    for(const email of ['real@example.com','Alice@lab.test','a@lab.test\r\nBcc: other@lab.test','bad','a@localhost']){
      const response=await request(lab.origin,'/api/register',{method:'POST',body:{email,password:'test-password-123'}});assert.equal(response.status,400);assert(!response.text.includes(email));
    }
    assert.equal(lab.inspect().mail.accepted,0);
    assert.equal((await request(lab.origin,'/api/register',{method:'POST',body:{email:'x@lab.test',password:'test-password-123',role:'admin'}})).status,400);
    assert.equal((await request(lab.origin,'/api/register',{method:'POST',body:{email:'x@lab.test',password:'x'}})).status,400);
    assert.equal((await request(lab.origin,'/api/register',{method:'POST',body:{email:'x@lab.test',password:'test-password-123'},headers:{'content-type':'text/plain'}})).status,415);
    assert.equal((await request(lab.origin,'/',{headers:{host:'external.example'}})).status,400);
    assert.equal((await request(lab.origin,'/',{headers:{origin:'https://external.example'}})).status,400);
    assert.equal((await request(lab.inboxOrigin,'/messages?recipient=x@example.com',{token:lab.mailboxToken})).status,400);
    assert.equal((await request(lab.inboxOrigin,'/messages?recipient=x@lab.test&recipient=y@lab.test',{token:lab.mailboxToken})).status,400);
    assert.equal((await request(lab.inboxOrigin,'/inspect',{token:lab.mailboxToken})).status,404);
    for(let i=0;i<TARGET_LIMITS.users;i++)assert.equal((await request(lab.origin,'/api/register',{method:'POST',body:{email:`user${i}@lab.test`,password:'test-password-123'}})).status,201);
    assert.equal((await request(lab.origin,'/api/register',{method:'POST',body:{email:'overflow@lab.test',password:'test-password-123'}})).status,429);
    assert.equal(lab.inspect().mail.accepted,TARGET_LIMITS.users);
    assert.equal((await request(lab.origin,'/api/register',{method:'POST',body:{email:'user0@lab.test',password:'test-password-123'}})).status,409);
  }finally{await lab.close();}
});

test('actual SMTP sink stores Received header, enforces cap and rejects external recipients before connect',async()=>{
  const box=await startLabMailbox({buildId:'build-test',generation:'generation-test'});
  try{
    assert.equal(isLabEmail('name@example.test'),true);
    await assert.rejects(sendLocalMail({port:box.smtpPort,token:box.token,to:'someone@example.com',subject:'test',text:'local'}),/Invalid local message/);
    await assert.rejects(sendLocalMail({port:box.smtpPort,token:box.token,to:'someone@lab.test',subject:'bad\r\nHeader: bad',text:'local'}),/Invalid local message/);
    for(let i=0;i<MAIL_LIMITS.messages;i++)await box.deliver({to:'x@lab.test',subject:'Local SMTP fixture',text:`message ${i}\n.leading dot`});
    assert.equal(box.inspect().accepted,MAIL_LIMITS.messages);
    const response=await request(box.origin,'/messages?recipient=x@lab.test',{token:box.token});assert.equal(response.value.messages.length,MAIL_LIMITS.messages);assert.equal(response.value.messages[0].text,'message 0\r\n.leading dot');
    await assert.rejects(box.deliver({to:'x@lab.test',subject:'Overflow',text:'too many'}),/Local SMTP delivery failed/);
    assert.equal(box.inspect().messageCount,MAIL_LIMITS.messages);
  }finally{const closed=await box.close();assert.equal(closed.activeConnections,0);assert.equal(closed.listening,false);}
});

test('close destroys owned idle sockets, awaits quiescence, is idempotent and endpoints refuse later connects',async()=>{
  const lab=await startLabTarget();const url=new URL(lab.origin);
  const socket=net.createConnection({host:'127.0.0.1',port:Number(url.port)});await once(socket,'connect');
  socket.write('GET / HTTP/1.1\r\n');
  socket.on('error',()=>{}); // Forced shutdown can reset a partial request on Windows.
  const observedClose=new Promise(resolve=>socket.once('close',resolve));
  const first=lab.close(),second=lab.close();assert.equal(first,second);const result=await first;await observedClose;
  assert.equal(result.activeConnections,0);assert.equal(result.activeHandlers,0);assert.equal(lab.inspect().mail.activeConnections,0);
  await assert.rejects(request(lab.origin,'/'),error=>error.code==='ECONNREFUSED');
  await assert.rejects(request(lab.inboxOrigin,'/messages?recipient=x@lab.test',{token:lab.mailboxToken}),error=>error.code==='ECONNREFUSED');
  assert(Number.isInteger(lab.smtpPort)&&lab.smtpPort>0);
  await assert.rejects(new Promise((resolve,reject)=>{
    const smtp=net.createConnection({host:'127.0.0.1',port:lab.smtpPort});
    smtp.setTimeout(1000,()=>smtp.destroy(new Error('test connect timeout')));
    smtp.once('connect',()=>{smtp.destroy();resolve();});smtp.once('error',reject);
  }),error=>error.code==='ECONNREFUSED');
});

test('invalid configuration creates no service',async()=>{
  for(const options of [{mode:'other'},{port:-1},{mailPort:65536},{port:'0'}])await assert.rejects(startLabTarget(options),/Invalid lab configuration/);
});

test('HTTP body and total-request budgets remain bounded',async()=>{
  const lab=await startLabTarget();
  try{
    // An oversized request may be reset after the 413 is sent; neither path creates state.
    try{const response=await request(lab.origin,'/api/register',{method:'POST',body:{email:'big@lab.test',password:'x'.repeat(TARGET_LIMITS.bodyBytes+1)}});assert.equal(response.status,413);}
    catch(error){assert(['ECONNRESET','EPIPE'].includes(error.code));}
    assert.equal(lab.inspect().users.length,0);assert.equal(lab.inspect().mail.accepted,0);
    for(let i=1;i<TARGET_LIMITS.requests;i++)assert.equal((await request(lab.origin,'/api-docs')).status,200);
    assert.equal((await request(lab.origin,'/api-docs')).status,429);
  }finally{await lab.close();}
});

test('SMTP requires authentication, rejects nonlocal envelopes and stops excess sessions',async()=>{
  const box=await startLabMailbox({buildId:'smtp-control',generation:'smtp-control-run'});
  const sockets=[];
  try{
    const socket=net.createConnection({host:'127.0.0.1',port:box.smtpPort});sockets.push(socket);
    let received='';socket.on('data',chunk=>received+=chunk.toString());socket.on('error',()=>{});await once(socket,'connect');
    socket.write('EHLO fixture.test\r\nMAIL FROM:<noreply@lab.test>\r\nRCPT TO:<x@lab.test>\r\nDATA\r\n');
    await new Promise(resolve=>setTimeout(resolve,25));assert.match(received,/530 Authentication required/);assert.equal(box.inspect().accepted,0);
    socket.write('AUTH PLAIN '+Buffer.from(`\0lab\0${box.token}`).toString('base64')+'\r\nMAIL FROM:<noreply@lab.test>\r\nRCPT TO:<x@example.com>\r\nDATA\r\n');
    await new Promise(resolve=>setTimeout(resolve,25));assert.match(received,/550 One local \.test recipient only/);assert.equal(box.inspect().accepted,0);
    socket.destroy();await new Promise(resolve=>socket.once('close',resolve));
    for(let i=0;i<MAIL_LIMITS.connections;i++){
      const client=net.createConnection({host:'127.0.0.1',port:box.smtpPort});sockets.push(client);client.on('error',()=>{});client.on('data',()=>{});await once(client,'connect');
    }
    const extra=net.createConnection({host:'127.0.0.1',port:box.smtpPort});sockets.push(extra);extra.on('error',()=>{});extra.on('data',()=>{});
    await new Promise(resolve=>extra.once('close',resolve));assert(box.inspect().activeConnections<=MAIL_LIMITS.connections);
  }finally{for(const socket of sockets)socket.destroy();const result=await box.close();assert.equal(result.activeConnections,0);}
});
