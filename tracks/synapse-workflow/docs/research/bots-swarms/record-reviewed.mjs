// Record only the explicit full ranges supplied after their bounded review.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const base='docs/research/bots-swarms/';
const args=process.argv.slice(2);
if(args.length%3)throw Error('repo file end triples required');
const ranges=[];for(let i=0;i<args.length;i+=3)ranges.push([args[i],args[i+1],1,Number(args[i+2])]);
for(const r of ranges)execFileSync(process.execPath,[base+'source.mjs','mark',...r.map(String)],{windowsHide:true,stdio:'pipe'});
const p=base+'continuation-record.mjs';fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('];\nfor(const r of ranges)',ranges.map(r=>' '+JSON.stringify(r)+',').join('\n')+'\n];\nfor(const r of ranges)'));
const q=JSON.parse(fs.readFileSync(base+'queue.json','utf8')),counts=['complete','partial','unread'].map(s=>q.filter(e=>e.status===s).length);
const c=base+'coverage.md';fs.writeFileSync(c,fs.readFileSync(c,'utf8').replace(/records\d+ complete,\d+ partial and\d+ unread/,`records${counts[0]} complete,${counts[1]} partial and${counts[2]} unread`));
console.log(counts);
