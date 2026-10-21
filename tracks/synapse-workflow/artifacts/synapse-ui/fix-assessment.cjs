const fs=require('fs'),p=__dirname+'/assessment.js';
let s=fs.readFileSync(p,'utf8');
s=s.replace('Issue 0${(issue??0)+1}<span>','${issue===null?\'Assessment\':\'Issue 0\'+(issue+1)}<span>');
fs.writeFileSync(p,s);
