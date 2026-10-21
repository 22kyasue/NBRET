// Disposable guided fixture. The optional gap affects authenticated order reads only.
import http from 'node:http';
import {readFileSync} from 'node:fs';
import {createHash,randomBytes,randomUUID,scryptSync,timingSafeEqual} from 'node:crypto';
import {startLabMailbox,isLabEmail,validPort,ownConnections,listenLoopback,closeOwnedServer} from './mail.mjs';

export const TARGET_LIMITS=Object.freeze({users:16,orders:64,sessions:32,requests:500,bodyBytes:4096,passwordMin:10,passwordMax:128,descriptionMax:256});
const SOURCE_DIGEST=createHash('sha256').update(readFileSync(new URL('./target.mjs',import.meta.url))).update(readFileSync(new URL('./mail.mjs',import.meta.url))).digest('hex');
function passwordHash(password,salt){return scryptSync(password,salt,32,{N:4096,r:8,p:1,maxmem:16*1024*1024});}
function publicUser(user){return {id:user.id,email:user.email};}
const publicOrder=order=>({...order});
function exactObject(value,keys){return value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(k=>Object.hasOwn(value,k));}

export async function startLabTarget({mode='secure',port=0,mailPort=0}={}) {
  if(!['secure','ownership-gap'].includes(mode)||!validPort(port)||!validPort(mailPort))throw new Error('Invalid lab configuration');
  const generation=randomUUID();
  const buildId=createHash('sha256').update(JSON.stringify({source:SOURCE_DIGEST,mode,limits:TARGET_LIMITS,protocol:1})).digest('hex');
  const mail=await startLabMailbox({port:mailPort,buildId,generation});
  const users=new Map(),verifications=new Map(),sessions=new Map(),orders=new Map();
  let origin,closed=false,closing,requests=0,activeHandlers=0;
  const pending=new Set();
  const server=http.createServer((req,res)=>{
    const run=(async()=>{
      activeHandlers++;
      const finish=(status,value,type='application/json; charset=utf-8')=>{if(res.destroyed)return;res.writeHead(status,{'content-type':type,'cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; base-uri 'none'; frame-ancestors 'none'",'x-lab-build-id':buildId,'x-lab-generation':generation});res.end(type.startsWith('application/json')?JSON.stringify(value):value);};
      try{
        if(closed)return finish(503,{error:'closed'});
        if(++requests>TARGET_LIMITS.requests)return finish(429,{error:'request limit'});
        if(req.headers.host!==new URL(origin).host||req.url.length>2048||!req.url.startsWith('/')||req.url.startsWith('//')||req.headers.origin&&req.headers.origin!==origin)return finish(400,{error:'invalid request'});
        const url=new URL(req.url,origin);
        if(req.method==='GET'&&['/','/signup','/login','/app'].includes(url.pathname))return finish(200,`<!doctype html><html lang="en"><meta charset="utf-8"><title>Local practice orders</title><h1>Local practice orders</h1><p>Disposable local guided application. Create and view your own orders. An order belongs to its creator.</p><nav><a href="/signup">Sign up</a> <a href="/login">Log in</a> <a href="/app">Orders</a> <a href="/api-docs">API guide</a></nav></html>`,'text/html; charset=utf-8');
        if(req.method==='GET'&&url.pathname==='/api-docs')return finish(200,{localOnly:true,registration:{method:'POST',path:'/api/register',json:{email:'name@lab.test',password:'10 to 128 characters'},note:'Use a dedicated .test identity. Read delivered verification email in the dedicated local mailbox and open its verification URL.'},login:{method:'POST',path:'/api/login',json:{email:'your identity',password:'your password'},note:'Returns token only after verification. Use Authorization: Bearer TOKEN.'},me:{method:'GET',path:'/api/me'},orders:{create:{method:'POST',path:'/api/orders',json:{description:'up to 256 characters'}},list:{method:'GET',path:'/api/orders'},read:{method:'GET',path:'/api/orders/:id'},rule:'Only the creator may read an order.'}});
        if(req.method==='GET'&&url.pathname==='/verify'){
          const tokens=url.searchParams.getAll('token');
          if(tokens.length!==1||[...url.searchParams.keys()].some(k=>k!=='token')||!/^[a-f0-9]{64}$/.test(tokens[0]))return finish(400,{error:'invalid verification'});
          const user=users.get(verifications.get(tokens[0]));
          if(!user||!user.mailDelivered)return finish(400,{error:'invalid verification'});
          user.verified=true;verifications.delete(tokens[0]);return finish(200,{verified:true});
        }
        const needsBody=req.method==='POST'&&['/api/register','/api/login','/api/orders'].includes(url.pathname);
        let body;
        if(needsBody){
          if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type']??'')||req.headers['content-encoding'])return finish(415,{error:'JSON required'});
          let bytes=0;const chunks=[];
          for await(const chunk of req){bytes+=chunk.length;if(bytes>TARGET_LIMITS.bodyBytes){finish(413,{error:'body limit'});req.destroy();return;}chunks.push(chunk);}
          try{body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)));}catch{return finish(400,{error:'invalid JSON'});}
          if(closed)return finish(503,{error:'closed'});
        }
        if(req.method==='POST'&&['/api/register','/api/login'].includes(url.pathname)){
          if(!exactObject(body,['email','password'])||!isLabEmail(body.email)||typeof body.password!=='string'||body.password.length<TARGET_LIMITS.passwordMin||body.password.length>TARGET_LIMITS.passwordMax)return finish(400,{error:'valid local identity and password required'});
          if(url.pathname==='/api/register'){
            if(users.has(body.email))return finish(409,{error:'identity unavailable'});
            if(users.size>=TARGET_LIMITS.users)return finish(429,{error:'account limit'});
            const user={id:randomUUID(),email:body.email,salt:randomBytes(16).toString('hex'),verified:false,mailDelivered:false};
            user.hash=passwordHash(body.password,user.salt);users.set(user.email,user);
            const token=randomBytes(32).toString('hex');verifications.set(token,user.email);
            try{await mail.deliver({to:user.email,subject:'Verify your local practice account',text:`Local-only verification for ${user.email}\n${origin}/verify?token=${token}\nThis is a disposable local mailbox, not an external provider.`});if(closed)throw new Error('closed');user.mailDelivered=true;}
            catch{verifications.delete(token);users.delete(user.email);return finish(503,{error:'local delivery unavailable'});}
            return finish(201,{registered:true,verificationRequired:true});
          }
          const user=users.get(body.email);
          // Always perform one bounded hash, including unknown identities.
          const candidate=passwordHash(body.password,user?.salt??'local-dummy-salt');
          if(!user||!timingSafeEqual(candidate,user.hash)||!user.verified)return finish(401,{error:'login denied'});
          if(sessions.size>=TARGET_LIMITS.sessions)return finish(429,{error:'session limit'});
          const token=randomBytes(32).toString('hex');sessions.set(token,user.email);return finish(200,{token,user:publicUser(user)});
        }
        if(url.pathname==='/api/me'||url.pathname==='/api/orders'||url.pathname.startsWith('/api/orders/')){
          const match=/^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization??'');
          const user=match?users.get(sessions.get(match[1])):null;
          if(!user?.verified)return finish(401,{error:'authentication required'});
          if(url.search)return finish(400,{error:'unexpected query'});
          if(req.method==='GET'&&url.pathname==='/api/me')return finish(200,{user:publicUser(user)});
          if(req.method==='POST'&&url.pathname==='/api/orders'){
            if(!exactObject(body,['description'])||typeof body.description!=='string'||!body.description.trim()||body.description.length>TARGET_LIMITS.descriptionMax)return finish(400,{error:'bounded description required'});
            if(orders.size>=TARGET_LIMITS.orders)return finish(429,{error:'order limit'});
            const order={id:randomUUID(),ownerId:user.id,description:body.description};orders.set(order.id,order);return finish(201,{order:publicOrder(order)});
          }
          if(req.method==='GET'&&url.pathname==='/api/orders')return finish(200,{orders:[...orders.values()].filter(o=>o.ownerId===user.id).map(publicOrder)});
          const id=/^\/api\/orders\/([a-f0-9-]{36})$/.exec(url.pathname)?.[1],order=orders.get(id);
          if(req.method==='GET'&&order){if(mode==='secure'&&order.ownerId!==user.id)return finish(403,{error:'access denied'});return finish(200,{order:publicOrder(order)});}
        }
        finish(404,{error:'not found'});
      }catch{if(!res.headersSent&&!res.destroyed)finish(400,{error:'request unavailable'});else res.destroy();}
      finally{activeHandlers--;}
    })();pending.add(run);run.finally(()=>pending.delete(run));
  });
  server.requestTimeout=3000;server.headersTimeout=3000;server.keepAliveTimeout=1000;server.maxRequestsPerSocket=32;
  const sockets=ownConnections(server);
  try{const actualPort=await listenLoopback(server,port);origin=`http://127.0.0.1:${actualPort}`;}
  catch(error){await Promise.all([closeOwnedServer(server,sockets),mail.close()]);throw error;}
  return {origin,inboxOrigin:mail.origin,smtpPort:mail.smtpPort,mailboxToken:mail.token,buildId,generation,mode,
    inspect:()=>({buildId,generation,mode,localOnly:true,closed,stopped:closed&&!server.listening&&sockets.size===0&&activeHandlers===0,listening:server.listening,activeConnections:sockets.size,activeHandlers,requests,http:{listening:server.listening,activeConnections:sockets.size,activeHandlers,stopped:closed&&!server.listening&&sockets.size===0&&activeHandlers===0},users:[...users.values()].map(u=>({...publicUser(u),verified:u.verified,mailDelivered:u.mailDelivered})),orders:[...orders.values()].map(publicOrder),mail:mail.inspect()}),
    close:()=>closing??=(async()=>{closed=true;await Promise.all([closeOwnedServer(server,sockets),mail.close()]);await Promise.allSettled([...pending]);sessions.clear();verifications.clear();for(const user of users.values()){user.hash.fill(0);user.salt='';}return {closed:true,activeConnections:sockets.size,activeHandlers,listening:server.listening,mail:mail.inspect()};})()
  };
}
