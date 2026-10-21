import { lstat, open, realpath } from 'node:fs/promises';
import { resolve, dirname, basename, join, relative, isAbsolute } from 'node:path';

const within = (root, target) => {
  const rel=relative(root,target);
  return rel==='' || rel!=='..'&&!rel.startsWith('..'+(process.platform==='win32'?'\\':'/'))&&!isAbsolute(rel);
};

/** Prevent new output folders poisoning any enclosing journal, including via junctions.
 * Cooperative local filesystem only; concurrent hostile parent replacement is out of scope. */
export async function outputDirectory(destination, forbiddenRoots=[]) {
  const requested=resolve(destination),parent=await realpath(dirname(requested));
  const canonical=join(parent,basename(requested));
  for(const root of forbiddenRoots)if(within(await realpath(root),canonical))throw new Error('Output must be outside source directories');
  for(let ancestor=parent;;ancestor=dirname(ancestor)){
    const filename=join(ancestor,'manifest.json');let info;
    try{info=await lstat(filename);}catch(error){if(error.code!=='ENOENT')throw error;}
    if(info){
      if(!info.isFile()||info.isSymbolicLink()||info.size>1024*1024)throw new Error('Cannot establish safe output ancestry');
      const file=await open(filename,'r');
      try{
        const bytes=Buffer.alloc(1024*1024+1);let size=0;
        while(size<bytes.length){const part=await file.read(bytes,size,bytes.length-size,null);if(!part.bytesRead)break;size+=part.bytesRead;}
        if(size>1024*1024)throw new Error('Output ancestry manifest exceeds budget');
        let data;try{data=JSON.parse(bytes.subarray(0,size).toString('utf8'));}catch{throw new Error('Cannot establish output ancestry from malformed manifest');}
        if(data?.schemaVersion===1&&data.manifest&&typeof data.manifest==='object'&&/^[a-f0-9]{64}$/.test(data.hash||''))throw new Error('Output cannot be nested inside a journal');
      }finally{await file.close();}
    }
    if(dirname(ancestor)===ancestor)break;
  }
  return canonical;
}
