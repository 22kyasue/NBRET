import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = path.resolve(import.meta.dirname, '../../..');
const research = path.join(root, 'tracks/synapse-workflow/docs/research');
const slash = s => s.replaceAll('\\','/');
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk(research).map(p=>{const bytes=fs.readFileSync(p);const text=/\.(md|json|mjs|py|go|txt|html|css|js)$/.test(p)?bytes.toString('utf8'):null;return {path:slash(path.relative(root,p)),bytes:bytes.length,sha256:hash(bytes),type:path.extname(p).slice(1),category:slash(path.relative(research,p)).split('/')[0],lines:text?.split('\n').length,title:text?.match(/^#\s+(.+)$/m)?.[1],...(p.endsWith('.md')?{headings:[...text.matchAll(/^#{1,3}\s+(.+)$/gm)].map(x=>x[1])}:{})};});
const categories={};for(const f of files){const c=categories[f.category]??={files:0,markdown:0,bytes:0};c.files++;c.markdown+=f.type==='md'?1:0;c.bytes+=f.bytes;}
const registers={};for(const n of ['findings','corrections','hazards'])registers[n]=JSON.parse(fs.readFileSync(path.join(research,'reconciliation/register',n+'.json'),'utf8'))[n];
const inventory={createdAt:new Date().toISOString(),scope:'All files under tracks/synapse-workflow/docs/research; inventory is not a fresh full semantic re-review. No runs, benchmark keys or credentials imported.',categories,files,registerCounts:Object.fromEntries(Object.entries(registers).map(([k,v])=>[k,v.length]))};
fs.writeFileSync(path.join(import.meta.dirname,'inventory.json'),JSON.stringify(inventory,null,2));
console.log(JSON.stringify({files:files.length,markdown:files.filter(f=>f.type==='md').length,categories,registerCounts:inventory.registerCounts},null,2));
if(process.argv[2]==='headings')for(const f of files.filter(f=>f.type==='md'&&!f.path.includes('/reconciliation/')))console.log(`${f.path}\t${f.lines} lines\t${f.headings?.filter(h=>!/^\d{4}-/.test(h)).slice(0,16).join(' | ')}`);
