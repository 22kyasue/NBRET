import {open,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export async function readLocalJsonRecord(path,maxBytes=16384){
  if(typeof path!=='string'||!path||!Number.isInteger(maxBytes)||maxBytes<1||maxBytes>1024*1024)throw new Error('Bounded local JSON path required');
  const info=await lstat(path);if(!info.isFile()||info.isSymbolicLink()||info.size>maxBytes)throw new Error('Input must be a bounded regular JSON file');
  const file=await open(path,'r');try{
    const actual=await file.stat();if(!actual.isFile()||actual.size>maxBytes||actual.ino!==info.ino||actual.dev!==info.dev)throw new Error('Input changed during opening');
    const bytes=Buffer.alloc(maxBytes+1);let size=0;while(size<bytes.length){const part=await file.read(bytes,size,bytes.length-size,null);if(!part.bytesRead)break;size+=part.bytesRead;}
    if(size>maxBytes)throw new Error('Input exceeds byte budget');const raw=bytes.subarray(0,size),text=raw.toString('utf8');if(!Buffer.from(text,'utf8').equals(raw))throw new Error('Input is not valid UTF-8');
    try{return{value:JSON.parse(text),sha256:createHash('sha256').update(raw).digest('hex')};}catch{throw new Error('Input is not valid JSON');}
  }finally{await file.close();}
}
export async function readLocalJson(path,maxBytes=16384){return(await readLocalJsonRecord(path,maxBytes)).value;}
