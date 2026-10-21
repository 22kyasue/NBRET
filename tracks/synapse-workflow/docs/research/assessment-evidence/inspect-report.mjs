// Read-only local PDF inspection; preserves downloaded source outside repository.
import { spawnSync } from 'node:child_process';
const code = `
from pypdf import PdfReader
import sys
r=PdfReader(sys.argv[1])
print('PAGES',len(r.pages))
for i,p in enumerate(r.pages):
    if i<4 or i==13 or i==len(r.pages)-1:
        print('PAGE',i+1,'\\n',p.extract_text())
try:
    import fitz
    d=fitz.open(sys.argv[1])
    d[0].get_pixmap().save(sys.argv[1]+'.png')
    print('RENDERED',sys.argv[1]+'.png')
except ImportError:
    print('Rendering unavailable; text evidence only')
`;
const r = spawnSync('python', ['-c', code,
  'C:/Users/kotar/.codex/research/assessment-evidence-receipts/obsidian-sync.pdf'],
  { windowsHide: true, encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
console.log(r.stdout); console.error(r.stderr); process.exitCode = r.status;
