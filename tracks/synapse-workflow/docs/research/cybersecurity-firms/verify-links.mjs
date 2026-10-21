import fs from 'node:fs';
import path from 'node:path';
const dir='docs/research/cybersecurity-firms';
const slug=s=>s.toLowerCase().replace(/<[^>]+>/g,'').replace(/[^\p{L}\p{N}_\-\s]/gu,'').trim().replace(/\s/g,'-');
const problems=[];
for(const file of fs.readdirSync(dir).filter(n=>n.endsWith('.md'))){
 const text=fs.readFileSync(path.join(dir,file),'utf8');
 for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  const target=m[1];if(/^https?:/.test(target))continue;
  const [rel,frag]=target.split('#'),dest=rel?path.resolve(dir,rel):path.resolve(dir,file);
  if(!fs.existsSync(dest)){problems.push({file,target,reason:'missing file'});continue;}
  if(frag&&dest.endsWith('.md')){
   const headings=fs.readFileSync(dest,'utf8').split('\n').filter(l=>/^#{1,6} /.test(l)).map(l=>slug(l.replace(/^#{1,6} /,'')));
   if(!headings.includes(decodeURIComponent(frag)))problems.push({file,target,reason:'unmatched heading fragment'});
  }
 }
}
console.log(JSON.stringify({kind:'relative Markdown file and heading checks',problems},null,2));
if(problems.length)process.exitCode=1;
