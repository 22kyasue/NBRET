import http from 'node:http';
import {open,lstat} from 'node:fs/promises';
import {readWorkbench,teachingBrief} from './workbench.mjs';

async function commandFile(path){
  const info=await lstat(path);if(!info.isFile()||info.isSymbolicLink()||info.size>16384)throw new Error('Command file must be bounded regular JSON');
  const file=await open(path,'r');try{const bytes=Buffer.alloc(16385),{bytesRead}=await file.read(bytes,0,bytes.length,0),raw=bytes.subarray(0,bytesRead);if(bytesRead>16384||!Buffer.from(raw.toString('utf8')).equals(raw))throw new Error('Command file exceeds size or encoding limits');try{return JSON.parse(raw.toString('utf8'));}catch{throw new Error('Command file is not valid JSON');}}finally{await file.close();}
}
function origin(value){let url;try{url=new URL(value);}catch{throw new Error('Use the printed loopback workbench URL');}if(url.protocol!=='http:'||url.hostname!=='127.0.0.1'||!url.port||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('Only the exact local workbench origin is supported');return url.origin;}
function request(base,path,method='GET',body,nonce){return new Promise((ok,fail)=>{
  const data=body===undefined?null:JSON.stringify(body);if(data&&Buffer.byteLength(data)>16384)return fail(new Error('Command exceeds budget'));
  let timer;const req=http.request(base+path,{method,agent:false,headers:method==='POST'?{origin:base,'content-type':'application/json','x-workbench-nonce':nonce,'content-length':Buffer.byteLength(data)}:{}},res=>{
    const chunks=[];let size=0;res.on('data',chunk=>{size+=chunk.length;if(size>8*1024*1024)req.destroy(new Error('State exceeds client response budget'));else chunks.push(chunk);});res.on('error',fail);res.on('end',()=>{clearTimeout(timer);let value;try{value=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return fail(new Error('Invalid workbench response'));}res.statusCode>=200&&res.statusCode<300?ok(value):fail(new Error(value.error||'Workbench command rejected'));});
  });timer=setTimeout(()=>req.destroy(new Error('Workbench request deadline')),15000);req.on('error',error=>{clearTimeout(timer);fail(error);});req.end(data);
});}
try{
  const args=process.argv.slice(2),options={},commands=[];
  for(let i=0;i<args.length;i++){if(args[i].startsWith('--')){const key=args[i];if(!['--endpoint','--file','--records'].includes(key)||!args[i+1]||options[key])throw new Error('Unknown or duplicate session option');options[key]=args[++i];}else commands.push(args[i]);}
  if(commands.length!==1)throw new Error('Usage: npm run synapse:session -- --endpoint URL state|brief|step|case|request|effort|evaluate|iteration|rejection-audit|attach-evidence|review|steer|continue|stop|export [--file COMMAND.json]');
  const command=commands[0];let result;
  if(options['--records']){if(options['--endpoint']||options['--file']||!['state','brief'].includes(command))throw new Error('Saved records support only state or brief; use workbench --resume for annotations');const record=await readWorkbench(options['--records']);result=command==='brief'?teachingBrief(record):record;}
  else{
    const base=origin(options['--endpoint']),state=await request(base,'/api/state');if(state.apiKind!=='synapse-local-workbench'||typeof state.nonce!=='string')throw new Error('Endpoint is not a compatible Synapse workbench');
    if(command==='state')result=state;
    else if(command==='brief')result={purpose:state.purpose,scope:state.scope,teaching:state.teaching,cases:state.caseSummary,proofProgress:state.proofProgress,consequenceOverview:state.consequenceOverview,ownerRequests:state.ownerRequests,progress:state.progress};
    else{const paths=new Set(['step','case','proof','request','effort','evaluate','iteration','rejection-audit','attach-evidence','screenshot','review','steer','continue','stop','export','note']);if(!paths.has(command))throw new Error('Unknown session command');const body=options['--file']?await commandFile(options['--file']):{};if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('Command object required');result=await request(base,'/api/'+command,'POST',{...body,expectedRevision:body.expectedRevision??state.revision},state.nonce);}
  }
  if(result&&typeof result==='object')delete result.nonce;
  console.log(JSON.stringify(result,null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
