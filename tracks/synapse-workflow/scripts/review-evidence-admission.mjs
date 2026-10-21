import {open,lstat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {parseEvidenceAdmissionJson,reviewEvidenceAdmission} from '../src/investigation/evidence-admission.mjs';

export async function reviewLocalFile(inputPath,outputPath){
  const local=p=>{if(typeof p!=='string'||!p||/^(?:[a-z][a-z0-9+.-]*:\/\/|\\\\|\/\/)/i.test(p))throw Error('Local filesystem path required');return resolve(p);};
  const input=local(inputPath),output=outputPath===undefined?null:local(outputPath);
  if(output===input)throw Error('Output must be a new file');
  const stat=await lstat(input);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>1024*1024)throw Error('Bounded regular local JSON file required');
  const handle=await open(input,'r');let bytes;
  try{const buffer=Buffer.alloc(1024*1024+1);let size=0;while(size<buffer.length){const {bytesRead}=await handle.read(buffer,size,buffer.length-size,size);if(!bytesRead)break;size+=bytesRead;}if(size>1024*1024)throw Error('Input byte budget exceeded');bytes=buffer.subarray(0,size);}finally{await handle.close();}
  const raw=bytes.toString('utf8');if(!Buffer.from(raw,'utf8').equals(bytes))throw Error('UTF-8 JSON required');
  const result=reviewEvidenceAdmission(parseEvidenceAdmissionJson(raw)),json=JSON.stringify(result,null,2)+'\n';
  if(output){const file=await open(output,'wx');try{await file.writeFile(json);}finally{await file.close();}}
  return{result,json};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{
    const args=process.argv.slice(2);
    if(!([1,3].includes(args.length))||args.length===3&&args[1]!=='--out')throw Error('Usage: node scripts/review-evidence-admission.mjs INPUT.json [--out NEW.json]');
    const {result,json}=await reviewLocalFile(args[0],args[2]);if(!args[2])process.stdout.write(json);if(result.status==='record-gaps')process.exitCode=2;
  }catch(error){process.stderr.write(JSON.stringify({error:error.message})+'\n');process.exitCode=1;}
}
