// Baseline for comparison: the original (Pine) lexical search, reproduced verbatim in its ranking logic,
// scored on the same question sets with the same gold-overlap rule as find-research.mjs --eval.
//   node docs/research/reconciliation/eval/baseline-pine-search.mjs <questions.json> [k]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const recon = path.dirname(here);
const root = path.dirname(recon);
const repo = path.resolve(root, '../..');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.md') ? [path.join(dir, e.name)] : []);
const rel = f => path.relative(repo, f).replaceAll('\\', '/');
const stop = new Set(['what','which','does','this','that','with','from','have','should','could','would','about','into','they','them','your','need','how','the','and','for','can','our','are']);
const files = walk(root).filter(f => !f.startsWith(recon + path.sep)).map(f => ({ file: rel(f), lines: fs.readFileSync(f, 'utf8').split(/\r?\n/) }));

function search(query, k) {
  const terms = [...new Set(query.toLowerCase().match(/[\p{L}\p{N}_-]+/gu) || [])].filter(t => (t.length > 2 || t === 'ai') && !stop.has(t));
  const results = [];
  for (const { file, lines } of files) {
    const hits = [];
    for (let i = 0; i < lines.length; i++) {
      const lower = lines[i].toLowerCase();
      const matched = terms.filter(t => lower.includes(t));
      if (matched.length) hits.push({ line: i + 1, matched: matched.length });
    }
    if (!hits.length) continue;
    const coverage = terms.filter(t => hits.some(h => lines[h.line - 1].toLowerCase().includes(t))).length;
    hits.sort((a, b) => b.matched - a.matched || a.line - b.line);
    results.push({ file, score: coverage * 10 + hits[0].matched * 5 + Math.min(hits.length, 5), passages: hits.slice(0, 2) });
  }
  results.sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));
  return results.slice(0, k);
}

const set = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const k = Number(process.argv[3] || 5);
let passage = 0, file = 0;
const misses = [];
for (const q of set.questions) {
  const r = search(q.question, k);
  const p = r.some(x => x.passages.some(h => q.gold.some(g => g.path === x.file && h.line >= g.lines[0] - 10 && h.line <= g.lines[1] + 10)));
  const f = r.some(x => q.gold.some(g => g.path === x.file));
  if (p) passage++; else misses.push(q.id);
  if (f) file++;
}
const n = set.questions.length;
console.log(JSON.stringify({ baseline: 'original lexical search (decision notes excluded: they carry no line-level sources)', file: process.argv[2], k, questions: n, recall: { passage: +(passage / n).toFixed(3), fileLevel: +(file / n).toFixed(3) }, misses }, null, 2));
