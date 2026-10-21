import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';

// Public-source retrieval only. Does not execute downloaded content.
const repos = ['juice-shop/juice-shop', 'WebGoat/WebGoat', 'Orange-Cyberdefense/GOAD',
  'DefectDojo/django-DefectDojo', 'pwndoc/pwndoc', 'trailofbits/publications'];
const out = resolve(`runs/security-repository-catalog-${Date.now()}`);
await mkdir(out, { recursive: false });
async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'NBRET-public-source-research', accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${r.status}: ${url}`);
  return r.json();
}
const records = [];
for (const repo of repos) {
  const meta = await get(`https://api.github.com/repos/${repo}`);
  const commit = await get(`https://api.github.com/repos/${repo}/commits/${meta.default_branch}`);
  const readme = await get(`https://api.github.com/repos/${repo}/readme?ref=${commit.sha}`);
  const text = Buffer.from(readme.content, 'base64').toString('utf8');
  await writeFile(join(out, repo.replace('/', '--') + '-README.txt'), text);
  records.push({ repo, url: meta.html_url, commit: commit.sha, commitDate: commit.commit.committer.date,
    commitMessage: commit.commit.message.split('\n')[0], license: meta.license?.spdx_id || 'NOASSERTION',
    licenseEvidence: 'GitHub repository metadata, not dependency license clearance', archived: meta.archived,
    accessedAt: new Date().toISOString(), readmePath: readme.path,
    readmeSha256: createHash('sha256').update(text).digest('hex'),
    coverage: 'Metadata and pinned README downloaded; no implementation reviewed or runtime executed',
    localReadme: join(out, repo.replace('/', '--') + '-README.txt') });
}
await writeFile(join(out, 'catalog.json'), JSON.stringify(records, null, 2));
console.log(JSON.stringify({ out, records }, null, 2));
