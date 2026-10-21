import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/toolchain');
const root=path.resolve('.tools/toolchain/venv/Lib/site-packages/hpack');
const q=JSON.parse(await fs.readFile(path.join(home,'proxy-dependency-queue.json')));
const texts={};const hashes={};
for(const f of ['huffman_constants.py','huffman_table.py']){
 const b=await fs.readFile(path.join(root,f));const sha=createHash('sha256').update(b).digest('hex');
 if(sha!==q.entries.find(e=>e.dependency==='hpack'&&e.path===`hpack/${f}`).sha256)throw Error('Pinned bytes changed');
 texts[f]=b.toString('utf8');hashes[f]=sha;
}
function array(name){
 const body=texts['huffman_constants.py'].match(new RegExp(`${name} = \\[([\\s\\S]*?)\\]`))?.[1];
 if(body===undefined||body.replace(/0x[0-9a-f]+|\d+|[\s,]/gi,'')!=='')throw Error('Unexpected literal array');
 return body.match(/0x[0-9a-f]+|\d+/gi).map(Number);
}
const codes=array('REQUEST_CODES'),lengths=array('REQUEST_CODES_LENGTH');
if(codes.length!==257||lengths.length!==257)throw Error('Unexpected code cardinality');
const trie={};
for(let symbol=0;symbol<codes.length;symbol++){
 const bits=codes[symbol].toString(2).padStart(lengths[symbol],'0');
 if(bits.length!==lengths[symbol]||lengths[symbol]<1)throw Error('Invalid width');
 let node=trie;for(const bit of bits){if(node.symbol!==undefined)throw Error('Non-prefix-free codes');node=node[bit]??=( {} );}
 if(node.symbol!==undefined||node[0]||node[1])throw Error('Duplicate/prefix code');node.symbol=symbol;
}
const body=texts['huffman_table.py'].split('HUFFMAN_TABLE = [')[1]?.split(']')[0];
if(body===undefined)throw Error('Missing transition table');
const flags={HUFFMAN_COMPLETE:1,HUFFMAN_EMIT_SYMBOL:2,HUFFMAN_FAIL:4};
const table=[];
for(const line of body.split('\n')){
 const clean=line.trim();if(!clean||clean.startsWith('#'))continue;
 const m=clean.match(/^\((\d+), ([A-Z_| 0-9]+), (\d+)\),$/);if(!m)throw Error('Unexpected transition literal');
 let flag=0;for(const term of m[2].split('|').map(x=>x.trim())){if(term==='0')continue;if(!(term in flags))throw Error('Unknown flag');flag|=flags[term];}
 table.push([Number(m[1]),flag,Number(m[3])]);
}
if(table.length!==4096)throw Error('Unexpected transition cardinality');
function derive(prefix,nibble){
 let node=trie;for(const b of prefix)node=node[b];let next=prefix,emitted=null;
 for(const bit of nibble.toString(2).padStart(4,'0')){
  node=node[bit];next+=bit;if(!node)throw Error('Missing trie edge');
  if(node.symbol!==undefined){if(node.symbol===256)return {fail:true};if(emitted!==null)throw Error('Multiple symbols in nibble');emitted=node.symbol;node=trie;next='';}
 }
 return {fail:false,next,emitted,complete:next===''||(/^1{1,7}$/).test(next)};
}
function check(entries){
 const prefixes=new Map([[0,'']]),pending=[0];let compared=0;
 while(pending.length){const state=pending.shift();for(let nibble=0;nibble<16;nibble++){
  const [target,flag,output]=entries[state*16+nibble],d=derive(prefixes.get(state),nibble);compared++;
  if(d.fail){if(flag!==4)throw Error(`Expected failure ${state}/${nibble}`);continue;}
  const expected=(d.complete?1:0)|(d.emitted!==null?2:0);
  if(flag!==expected||(d.emitted!==null&&output!==d.emitted))throw Error(`Flags/symbol mismatch ${state}/${nibble}`);
  if(target<0||target>=256)throw Error('Invalid target');
  if(prefixes.has(target)){if(prefixes.get(target)!==d.next)throw Error(`State mismatch ${state}/${nibble}`);}
  else{prefixes.set(target,d.next);pending.push(target);}
 }}
 if(prefixes.size!==256||compared!==4096)throw Error('Unreachable/uncompared transitions');
 return {states:prefixes.size,transitions:compared};
}
const result=check(table);const mutated=table.map(x=>[...x]);mutated[0][0]=1;
let controlError;try{check(mutated);}catch(e){controlError=e.message;}
if(!controlError)throw Error('Negative control unexpectedly passed');
const receipt={at:new Date().toISOString(),command:'node docs/research/toolchain/hpack-table-oracle.mjs',node:process.version,inputHashes:hashes,oracle:'Four-bit trie derivation from separately parsed local codewords; no upstream module imports',codes:codes.length,...result,negativeControl:{mutation:'root nibble0 target changed to state1',rejected:true,error:controlError},pass:true,cleanup:'No listeners, sockets, package state, key material or temporary files created; one exclusive receipt retained',limitations:['Internal consistency with local constants, not independent RFC codeword verification','No upstream decoder execution, arbitrary traffic, performance test or application impact claim']};
await fs.writeFile(path.join(home,'hpack-table-receipt.json'),JSON.stringify(receipt,null,2),{flag:'wx'});
console.log(JSON.stringify(receipt,null,2));
