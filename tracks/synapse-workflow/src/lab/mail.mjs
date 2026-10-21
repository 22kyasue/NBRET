// Owned local SMTP sink. No DNS, relay, external provider, filesystem or subprocess use.
import http from 'node:http';
import net from 'node:net';
import {randomBytes, randomUUID, timingSafeEqual} from 'node:crypto';

export const MAIL_LIMITS = Object.freeze({connections:8,messages:32,messageBytes:8192,sessionBytes:16384,commands:32,httpRequests:500,timeoutMs:3000});
export function isLabEmail(value) {
  return typeof value==='string' && value.length<=120 && /^[a-z0-9][a-z0-9._+-]{0,63}@[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?)*\.test$/.test(value);
}
export function validPort(port) {return Number.isInteger(port)&&port>=0&&port<=65535;}
export function secretEqual(value,expected) {
  return typeof value==='string' && value.length<=256 && Buffer.byteLength(value)===Buffer.byteLength(expected) && timingSafeEqual(Buffer.from(value),Buffer.from(expected));
}
export function ownConnections(server,limit=MAIL_LIMITS.connections) {
  server.maxConnections=limit;
  const sockets=new Set();
  server.on('connection',socket=>{sockets.add(socket);const deadline=setTimeout(()=>socket.destroy(),MAIL_LIMITS.timeoutMs);deadline.unref();socket.once('close',()=>{clearTimeout(deadline);sockets.delete(socket);});socket.on('error',()=>{});socket.setTimeout(MAIL_LIMITS.timeoutMs,()=>socket.destroy());if(sockets.size>limit)socket.destroy();});
  return sockets;
}
export async function listenLoopback(server,port=0) {
  if(!validPort(port))throw new Error('Invalid local port');
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>{server.off('error',reject);resolve();});});
  return server.address().port;
}
export async function closeOwnedServer(server,sockets) {
  const settled=[...sockets].map(socket=>new Promise(resolve=>{if(socket.destroyed&&!sockets.has(socket))return resolve();socket.once('close',resolve);socket.destroy();}));
  if(server.listening)settled.push(new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve())));
  await Promise.all(settled);
}

export async function startLabMailbox({port=0,smtpPort=0,buildId,generation}={}) {
  if(!validPort(port)||!validPort(smtpPort)||typeof buildId!=='string'||typeof generation!=='string')throw new Error('Invalid mailbox setup');
  const token=randomBytes(32).toString('hex'),messages=[];
  let origin,closed=false,closing,accepted=0,rejected=0,httpRequests=0;
  const smtp=net.createServer(socket=>{
    if(closed)return socket.destroy();
    let buffer='',bytes=0,commands=0,greeted=false,authenticated=false,sender=null,recipient=null,data=false,lines=[];
    const reply=text=>{if(!socket.destroyed)socket.write(text+'\r\n');};
    reply('220 local-lab.test ESMTP local-only');
    socket.on('data',chunk=>{
      bytes+=chunk.length;
      if(bytes>MAIL_LIMITS.sessionBytes){rejected++;reply('552 Session limit');return socket.end();}
      // SMTP fixture uses ASCII envelopes and content. Reject lossy decoding.
      if([...chunk].some(byte=>byte>127||byte===0)){rejected++;reply('550 ASCII fixture only');return socket.end();}
      buffer+=chunk.toString('ascii');
      while(buffer.includes('\r\n')&&!socket.destroyed){
        const at=buffer.indexOf('\r\n'),line=buffer.slice(0,at);buffer=buffer.slice(at+2);
        if(data){
          if(line!=='.'){lines.push(line.startsWith('..')?line.slice(1):line);continue;}
          data=false;
          const raw=lines.join('\r\n');lines=[];
          const split=raw.indexOf('\r\n\r\n');
          const headers=Object.create(null);
          let invalid=split<0;
          if(!invalid)for(const h of raw.slice(0,split).split('\r\n')){const match=/^([A-Za-z-]+): ([\x20-\x7e]*)$/.exec(h);if(!match||Object.hasOwn(headers,match[1].toLowerCase())){invalid=true;break;}headers[match[1].toLowerCase()]=match[2];}
          if(invalid||Buffer.byteLength(raw)>MAIL_LIMITS.messageBytes||messages.length>=MAIL_LIMITS.messages||headers.to!==recipient||headers.from!==sender||typeof headers.subject!=='string'||headers.subject.length>160){rejected++;reply('552 Message rejected');sender=null;recipient=null;continue;}
          const id=randomUUID(),received=`from local-lab.test ([127.0.0.1]) by local-lab.test with ESMTP id ${id}; ${new Date().toUTCString()}`;
          messages.push({id,to:recipient,subject:headers.subject,text:raw.slice(split+4),headers:{received,from:headers.from,to:headers.to,subject:headers.subject},buildId,generation});
          accepted++;reply('250 Message accepted');sender=null;recipient=null;continue;
        }
        if(++commands>MAIL_LIMITS.commands||line.length>1024){rejected++;reply('421 Command limit');socket.end();break;}
        if(/^EHLO [A-Za-z0-9.-]+$/.test(line)){greeted=true;reply('250 local-lab.test');}
        else if(line.startsWith('AUTH PLAIN ')&&greeted){
          const supplied=line.slice(11),expected=Buffer.from(`\0lab\0${token}`).toString('base64');
          authenticated=secretEqual(supplied,expected);reply(authenticated?'235 Authenticated':'535 Authentication required');
        }else if(line==='QUIT'){reply('221 Bye');socket.end();}
        else if(!authenticated){reply('530 Authentication required');}
        else if(line==='RSET'){sender=null;recipient=null;reply('250 Reset');}
        else if(/^MAIL FROM:<[^>]+>$/.test(line)){const value=line.slice(11,-1);if(value!=='noreply@lab.test'){reply('550 Local sender only');continue;}sender=value;recipient=null;reply('250 Sender accepted');}
        else if(/^RCPT TO:<[^>]+>$/.test(line)&&sender){const value=line.slice(9,-1);if(!isLabEmail(value)||recipient){reply('550 One local .test recipient only');continue;}recipient=value;reply('250 Recipient accepted');}
        else if(line==='DATA'&&sender&&recipient){data=true;reply('354 End with dot');}
        else reply('503 Invalid sequence');
      }
    });
  });
  const smtpSockets=ownConnections(smtp);
  const mailbox=http.createServer((req,res)=>{
    const finish=(status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-lab-build-id':buildId,'x-lab-generation':generation});res.end(JSON.stringify(value));};
    if(closed)return finish(503,{error:'closed'});
    if(++httpRequests>MAIL_LIMITS.httpRequests)return finish(429,{error:'mailbox request limit'});
    if(req.headers.host!==new URL(origin).host||req.url.length>2048||!req.url.startsWith('/')||req.url.startsWith('//')||req.headers.origin&&req.headers.origin!==origin)return finish(400,{error:'invalid request'});
    if(!secretEqual(req.headers.authorization,`Bearer ${token}`))return finish(401,{error:'authentication required'});
    const url=new URL(req.url,origin);
    if(req.method!=='GET'||url.pathname!=='/messages')return finish(404,{error:'not found'});
    if([...url.searchParams.keys()].some(k=>k!=='recipient')||url.searchParams.getAll('recipient').length!==1||!isLabEmail(url.searchParams.get('recipient')))return finish(400,{error:'local recipient required'});
    finish(200,{messages:messages.filter(m=>m.to===url.searchParams.get('recipient'))});
  });
  mailbox.requestTimeout=3000;mailbox.headersTimeout=3000;mailbox.keepAliveTimeout=1000;mailbox.maxRequestsPerSocket=16;
  const httpSockets=ownConnections(mailbox);
  try{
    const actualSmtpPort=await listenLoopback(smtp,smtpPort);
    const actualPort=await listenLoopback(mailbox,port);origin=`http://127.0.0.1:${actualPort}`;
    return {origin,token,smtpPort:actualSmtpPort,
      deliver:message=>{if(closed)throw new Error('Mailbox closed');return sendLocalMail({...message,port:actualSmtpPort,token});},
      inspect:()=>({localOnly:true,buildId,generation,accepted,rejected,httpRequests,messageCount:messages.length,activeConnections:smtpSockets.size+httpSockets.size,closed,stopped:closed&&!smtp.listening&&!mailbox.listening&&smtpSockets.size+httpSockets.size===0,listening:smtp.listening||mailbox.listening,smtp:{listening:smtp.listening,activeConnections:smtpSockets.size,stopped:closed&&!smtp.listening&&smtpSockets.size===0},http:{listening:mailbox.listening,activeConnections:httpSockets.size,stopped:closed&&!mailbox.listening&&httpSockets.size===0}}),
      close:()=>closing??=(async()=>{closed=true;await Promise.all([closeOwnedServer(smtp,smtpSockets),closeOwnedServer(mailbox,httpSockets)]);return {closed:true,activeConnections:smtpSockets.size+httpSockets.size,listening:smtp.listening||mailbox.listening};})()
    };
  }catch(error){closed=true;await Promise.all([closeOwnedServer(smtp,smtpSockets),closeOwnedServer(mailbox,httpSockets)]);throw error;}
}

// The destination is deliberately not configurable: numeric loopback and a validated port.
export async function sendLocalMail({port,token,to,subject,text}) {
  if(!validPort(port)||port===0||typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token)||!isLabEmail(to)||typeof subject!=='string'||subject.length>160||! /^[\x20-\x7e]+$/.test(subject)||typeof text!=='string'||!/^[\x09\x0a\x0d\x20-\x7e]*$/.test(text)||Buffer.byteLength(text)>4096)throw new Error('Invalid local message');
  const payload=`From: noreply@lab.test\r\nTo: ${to}\r\nSubject: ${subject}\r\n\r\n${text.replace(/\r?\n/g,'\r\n').replace(/^\./gm,'..')}`;
  return new Promise((resolve,reject)=>{
    const socket=net.createConnection({host:'127.0.0.1',port});
    let buffer='',step=0,finished=false,total=0;
    const exchanges=[[220,'EHLO local-lab.test'],[250,`AUTH PLAIN ${Buffer.from(`\0lab\0${token}`).toString('base64')}`],[235,'MAIL FROM:<noreply@lab.test>'],[250,`RCPT TO:<${to}>`],[250,'DATA'],[354,payload+'\r\n.'],[250,'QUIT'],[221,null]];
    const fail=()=>{if(!finished){finished=true;socket.destroy();reject(new Error('Local SMTP delivery failed'));}};
    socket.setTimeout(MAIL_LIMITS.timeoutMs,fail);socket.on('error',fail);
    socket.on('data',chunk=>{total+=chunk.length;if(total>4096)return fail();buffer+=chunk.toString('ascii');while(buffer.includes('\r\n')&&!finished){const end=buffer.indexOf('\r\n'),line=buffer.slice(0,end);buffer=buffer.slice(end+2);const expected=exchanges[step++];if(!expected||line.slice(0,3)!==String(expected[0])||line[3]!==' ')return fail();if(expected[1]===null){finished=true;socket.end();}else socket.write(expected[1]+'\r\n');}});
    socket.on('close',()=>{if(finished&&step===exchanges.length)resolve({delivered:true,transport:'local-smtp'});else fail();});
  });
}
