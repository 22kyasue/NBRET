import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const entries=[
 ['fbi-residential-2026','https://www.fbi.gov/investigate/cyber/alerts/2026/evading-residential-proxy-networks-protecting-your-devices-from-becoming-a-tool-for-criminals'],
 ['fbi-badbox-2025','https://www.fbi.gov/investigate/cyber/alerts/2025/home-internet-connected-devices-facilitate-criminal-activity'],
 ['fbi-qakbot-2023','https://www.fbi.gov/news/stories/fbi-partners-dismantle-qakbot-infrastructure-in-multinational-cyber-takedown'],
 ['fbi-911-removal','https://www.fbi.gov/investigate/cyber/how-to-identify-and-remove-vpn-applications-that-contain-911-s5-backdoors'],
];
const result=await Promise.all(entries.map(async([id,url])=>{
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
  const bytes=Buffer.from(await response.arrayBuffer());
  const localFile=path.resolve('.tools/bots-swarms/primary-sources/'+id+'.html');
  await fs.writeFile(localFile,bytes,{flag:'wx'});
  return {id,url,finalUrl:response.url,status:response.status,at:new Date().toISOString(),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),localFile,contentState:'Fetched bytes only; web-extracted main article reviewed separately. Not executable content.'};
}));
await fs.writeFile('docs/research/bots-swarms/incident-sources.json',JSON.stringify(result,null,2),{flag:'wx'});
console.log(result.map(({id,status,bytes,sha256})=>({id,status,bytes,sha256})));
