import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const base='C:/Users/kotar/.codex/research/assessment-evidence-venv/Lib/site-packages';
const root=path.join(base,'mcp_types');
const metadata=path.join(base,'mcp_types-2.3.0.dist-info');
const own='docs/research/assessment-evidence';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const files={};
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,e.name);if(e.name==='__pycache__')continue;if(e.isDirectory())walk(full);else files[path.relative(base,full).replaceAll('\\','/')]={sha256:hash(full),bytes:fs.statSync(full).size};}}
walk(root);walk(metadata);
const file=path.join(own,'mcp-types-installed-provenance.json');
fs.writeFileSync(file,JSON.stringify({at:new Date().toISOString(),name:'mcp-types',version:'2.3.0',base,root,metadata,license:'MIT, installed METADATA and licenses/LICENSE',upstream:'https://github.com/modelcontextprotocol/python-sdk',basis:'Actual isolated-venv installed source and dist-info hashes; no Git commit inferred from package version.',files},null,2)+'\n',{flag:'wx'});
const qfile=path.join(own,'sdk-reading-queue.json');const q=JSON.parse(fs.readFileSync(qfile));q.mcp_types.provenance='mcp-types-installed-provenance.json; actual isolated-venv resolved dependency, no Git commit inferred';fs.writeFileSync(qfile,JSON.stringify(q,null,2)+'\n');
console.log(file);
