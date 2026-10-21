// Bounded source reader and provenance queue. Records emitted ranges, not comprehension.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const dir = dirname(fileURLToPath(import.meta.url));
const queuePath = resolve(dir, 'deep-reading-queue.json');
const roots = { pentestgpt: 'C:/Users/kotar/.codex/research/pentestgpt-20261017', garak: 'C:/Users/kotar/.codex/research/garak',
  unified: 'C:/Users/kotar/.codex/research/unified-agent-acff8ee',
  openfga: 'C:/Users/kotar/.codex/research/openfga-20261017',
  invokeatomic: 'C:/Users/kotar/.codex/research/invoke-atomic-20261017', agentdojo: 'C:/Users/kotar/.codex/research/agentdojo-20261017' };
let queue = existsSync(queuePath) ? JSON.parse(readFileSync(queuePath)) : { updated: '', meaning: 'complete means all file lines emitted in bounded output; inherited reads retain reviewer provenance; no runtime conclusion implied', files: [] };
const [op, project, path, a, b] = process.argv.slice(2);
if (!roots[project]) throw Error('Unknown project');
const root = roots[project];
if (op === 'inventory') {
  const commit = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { windowsHide: true, encoding: 'utf8' }).trim();
  const scope = project === 'agentdojo' ? ['--','src','tests','examples','docs','.github','.devcontainer','util_scripts','pyproject.toml','uv.lock','LICENSE','README.md','CONTRIBUTING.md','CLAUDE.md','CITATION.bib','mkdocs.yml','.pre-commit-config.yaml','.python-version','.gitignore'] : [];
  const paths = execFileSync('git', ['-C', root, 'ls-files', ...scope], { windowsHide: true, encoding: 'utf8', maxBuffer: 16*1024*1024 }).trim().split('\n');
  const prior = JSON.parse(readFileSync(resolve(dir, '../security-landscape/source-reads.json')));
  for (const p of paths.filter(p => new RegExp(path).test(p))) {
    if (queue.files.some(f => f.project === project && f.path === p)) continue;
    const bytes = readFileSync(resolve(root, p)), lines = bytes.toString('utf8').split('\n'); if (lines.at(-1) === '') lines.pop();
    const inherited = prior.find(f => f.commit === commit && f.path === p);
    queue.files.push({ project, path: p, commit, sha256: createHash('sha256').update(bytes).digest('hex'), lines: lines.length,
      ranges: [], inherited: inherited ? { reviewer: 'Tomo', ranges: inherited.readRanges, record: '../security-landscape/source-reads.json' } : null,
      status: inherited?.coverage.startsWith('complete') ? 'complete-inherited' : inherited ? 'partial-inherited' : 'unread', runtime: 'not executed' });
  }
  console.log(JSON.stringify(queue.files.filter(f => f.project === project && new RegExp(path).test(f.path)).map(({path,lines,status})=>({path,lines,status}))));
} else if (op === 'read') {
  const f = queue.files.find(f => f.project === project && f.path === path); if (!f) throw Error('Inventory file first');
  const bytes = readFileSync(resolve(root, path)); if (createHash('sha256').update(bytes).digest('hex') !== f.sha256) throw Error('Source changed');
  const lines = bytes.toString('utf8').split('\n'), start = Number(a), end = Math.min(Number(b), f.lines);
  if (start < 1 || end < start || end - start > 159) throw Error('Use at most 160 lines');
  console.log(`${project} ${f.commit} ${path} [${start}-${end}/${f.lines}]\n` + lines.slice(start-1,end).map((l,i)=>`${start+i}: ${l}`).join('\n'));
  f.ranges.push([start,end]); const covered = new Set();
  for (const [x,y] of [...f.ranges,...(f.inherited?.ranges||[])]) for(let n=x;n<=y;n++)covered.add(n);
  f.status = covered.size >= f.lines ? 'complete' : 'partial'; f.lastRead = new Date().toISOString();
} else throw Error('Use inventory or read');
queue.updated = new Date().toISOString(); writeFileSync(queuePath, JSON.stringify(queue,null,2)+'\n');
