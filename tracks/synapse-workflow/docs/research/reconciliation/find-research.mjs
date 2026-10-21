#!/usr/bin/env node
// Local, read-only retrieval over the research register and studies.
//   node docs/research/reconciliation/find-research.mjs "question"        ranked findings, corrections, hazards, passages
//   node docs/research/reconciliation/find-research.mjs --json "question" same, machine-readable
//   node docs/research/reconciliation/find-research.mjs --show <id>       one finding, correction or hazard in full
//   node docs/research/reconciliation/find-research.mjs --check           validate register, quotes and guide links
//   node docs/research/reconciliation/find-research.mjs --eval [file]     retrieval recall on a question set
// Never imports or executes research artifacts and never contacts a target.
import fs from 'node:fs';
import path from 'node:path';
import { here, repoRoot, researchRoot, buildIndex, search, loadRegister, locateQuote, fileLines, DOMAINS, STRENGTHS, STAGES, CORRECTION_KINDS, RISKS } from './lib.mjs';

const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };
const option = name => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };

if (flag('--check')) process.exitCode = check() ? 0 : 1;
else if (flag('--eval')) evaluate(args[0] || path.join(here, 'eval', 'heldout-questions.json'), Number(option('--k') || 5));
else if (args[0] === '--show') show(args[1]);
else {
  const json = flag('--json');
  const query = args.join(' ').trim();
  if (!query) { console.log(fs.readFileSync(fileURLToPathSelf(), 'utf8').split('\n').slice(1, 8).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); process.exit(0); }
  const result = search(buildIndex(), query);
  if (!result) { console.error('Use specific service, tool or evidence terms.'); process.exit(1); }
  if (json) console.log(JSON.stringify({ query, ...result }, null, 2));
  else printResult(query, result);
}

function fileURLToPathSelf() { return path.join(here, 'find-research.mjs'); }

function printResult(query, r) {
  const out = [];
  out.push(`Query: ${query}`, '');
  if (r.hazards.length) {
    out.push('HAZARDS (read before acting)');
    for (const h of r.hazards) out.push(`  ! ${h.id}  ${h.path}:${h.line}`, `    ${h.hazard}`, `    -> ${h.guidance}`);
    out.push('');
  }
  out.push('FINDINGS (register cards; verify against sources before client claims)');
  if (!r.findings.length) out.push('  (none matched; read the passages and try synonyms)');
  for (const f of r.findings) {
    out.push(`  ${f.id}  [${f.strength}]`, `    ${f.title}`, `    Claim: ${f.claim}`, `    Do: ${f.implication}`, `    Limits: ${f.limits}`);
    out.push(`    Sources: ${f.sources.map(s => `${s.path}:${s.line}`).join(', ')}`);
    if (f.contrary?.length) out.push(`    Contrary: ${f.contrary.map(c => `${c.path}:${c.line} (${c.note})`).join('; ')}`);
  }
  if (r.corrections.length) {
    out.push('', 'CORRECTIONS (earlier passage -> what to believe now)');
    for (const c of r.corrections) out.push(`  ${c.id} [${c.kind}, ${c.risk}]  ${c.earlier.path}:${c.earlier.line} -> ${c.later.path}:${c.later.line}`, `    ${c.guidance}`);
  }
  out.push('', 'PASSAGES (studies; at most two per file)');
  for (const p of r.passages) {
    out.push(`  ${p.path}:${p.lines[0]}-${p.lines[1]}  ${p.heading ? `§ ${p.heading}` : ''}`, `    ${p.excerpt}`);
    for (const c of p.corrections) out.push(`    ^ superseded in part [${c.risk}] ${c.id}: ${c.guidance} (see ${c.later})`);
    for (const h of p.hazards) out.push(`    ^ HAZARD ${h.id}: ${h.guidance}`);
  }
  out.push('', 'Next: open the cited lines, read the surrounding section and any correction, then state evidence strength and limits in your answer.');
  console.log(out.join('\n'));
}

function show(id) {
  const reg = loadRegister();
  const item = [...reg.findings, ...reg.corrections, ...reg.hazards].find(x => x.id === id);
  if (!item) { console.error(`No register entry ${id}`); process.exitCode = 1; return; }
  console.log(JSON.stringify(item, null, 2));
}

function check() {
  const problems = [], warnings = [];
  const reg = loadRegister();
  const ids = new Set();
  const isPath = p => typeof p === 'string' && p.startsWith('docs/research/');
  const quoteCheck = (where, ref) => {
    if (!isPath(ref.path)) return problems.push(`${where}: path must start with docs/research/ (${ref.path})`);
    const r = locateQuote(ref.path, ref.line, ref.quote || '');
    if (!r.ok) problems.push(`${where}: ${ref.path}:${ref.line} ${r.reason}`);
  };
  for (const f of reg.findings) {
    const w = `finding ${f.id}`;
    if (ids.has(f.id)) problems.push(`${w}: duplicate id`); ids.add(f.id);
    for (const k of ['title', 'claim', 'implication', 'limits']) if (!f[k] || f[k].length < 10) problems.push(`${w}: missing ${k}`);
    if (!DOMAINS[f.domain]) problems.push(`${w}: unknown domain ${f.domain}`);
    if (!STRENGTHS.includes(f.strength)) problems.push(`${w}: unknown strength ${f.strength}`);
    for (const s of f.stages || []) if (!STAGES.includes(s)) problems.push(`${w}: unknown stage ${s}`);
    if (!f.sources?.length) problems.push(`${w}: no sources`);
    f.sources?.forEach((s, i) => quoteCheck(`${w} source ${i}`, s));
    f.contrary?.forEach((s, i) => quoteCheck(`${w} contrary ${i}`, s));
    for (const r of f.receipts || []) if (!fs.existsSync(path.join(repoRoot, r))) problems.push(`${w}: missing receipt ${r}`);
    if ((f.questions || []).length < 2) warnings.push(`${w}: fewer than two questions`);
  }
  for (const c of reg.corrections) {
    const w = `correction ${c.id}`;
    if (ids.has(c.id)) problems.push(`${w}: duplicate id`); ids.add(c.id);
    if (!CORRECTION_KINDS.includes(c.kind)) problems.push(`${w}: unknown kind ${c.kind}`);
    if (!RISKS.includes(c.risk)) problems.push(`${w}: unknown risk ${c.risk}`);
    quoteCheck(`${w} earlier`, c.earlier); quoteCheck(`${w} later`, c.later);
    if (!c.guidance) problems.push(`${w}: missing guidance`);
  }
  for (const h of reg.hazards) {
    const w = `hazard ${h.id}`;
    if (ids.has(h.id)) problems.push(`${w}: duplicate id`); ids.add(h.id);
    quoteCheck(w, h);
    if (!h.guidance) problems.push(`${w}: missing guidance`);
  }
  // Guide and generated digests: every relative link and every [[id]] must resolve.
  const docs = [path.join(here, 'USE-RESEARCH.md'), path.join(here, 'README.md'), ...fs.readdirSync(path.join(here, 'domains')).map(f => path.join(here, 'domains', f))];
  for (const doc of docs) {
    const text = fs.readFileSync(doc, 'utf8');
    for (const m of text.matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) {
      if (/^https?:/.test(m[1])) continue;
      const target = path.resolve(path.dirname(doc), decodeURIComponent(m[1]));
      if (!fs.existsSync(target)) problems.push(`${path.relative(repoRoot, doc)}: broken link ${m[1]}`);
    }
    for (const m of text.matchAll(/`((?:[a-z-]+|corr|hazard)\.[a-z0-9.-]+)`/g)) {
      if (m[1].includes('.') && !ids.has(m[1]) && !/\.(md|json|mjs)$/.test(m[1])) problems.push(`${path.relative(repoRoot, doc)}: unknown register id ${m[1]}`);
    }
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(here, 'corpus.json'), 'utf8'));
  for (const f of manifest.files) if (f.file.endsWith('.md') && !fileLines(`docs/research/${f.file}`)) problems.push(`snapshot file missing: ${f.file}`);
  const counts = { findings: reg.findings.length, corrections: reg.corrections.length, hazards: reg.hazards.length };
  console.log(JSON.stringify({ scope: 'Register schema, exact source quotes (line ±2), receipts, guide links and snapshot availability. Not a check that conclusions are correct.', counts, problems, warnings: warnings.length ? warnings : undefined }, null, 2));
  return problems.length === 0;
}

// Gold evidence counts as retrieved when a returned passage overlaps its line range (±10),
// or a returned finding/correction cites a line inside it (±10).
function evaluate(file, k) {
  const set = JSON.parse(fs.readFileSync(file, 'utf8'));
  const index = buildIndex();
  const rows = [];
  for (const q of set.questions) {
    const r = search(index, q.question, { cards: k, passages: k }) || { findings: [], corrections: [], passages: [] };
    const near = (g, p, line) => p === g.path && line >= g.lines[0] - 10 && line <= g.lines[1] + 10;
    const hitPassage = r.passages.findIndex(p => q.gold.some(g => p.path === g.path && p.lines[0] <= g.lines[1] + 10 && p.lines[1] >= g.lines[0] - 10));
    const hitCard = r.findings.findIndex(f => [...f.sources, ...(f.contrary || [])].some(s => q.gold.some(g => near(g, s.path, s.line))));
    const hitCorr = r.corrections.findIndex(c => q.gold.some(g => near(g, c.later.path, c.later.line) || near(g, c.earlier.path, c.earlier.line)));
    const fileHit = [...r.passages.map(p => p.path), ...r.findings.flatMap(f => f.sources.map(s => s.path))].some(p => q.gold.some(g => g.path === p));
    rows.push({ id: q.id, category: q.category, passage: hitPassage >= 0, card: hitCard >= 0, correction: hitCorr >= 0, any: hitPassage >= 0 || hitCard >= 0 || hitCorr >= 0, file: fileHit });
  }
  const rate = key => +(rows.filter(r => r[key]).length / rows.length).toFixed(3);
  const byCat = {};
  for (const r of rows) { const c = (byCat[r.category] ||= { n: 0, any: 0 }); c.n++; if (r.any) c.any++; }
  console.log(JSON.stringify({ file: path.relative(repoRoot, file).replaceAll('\\', '/'), k, questions: rows.length, recall: { passageOrCard: rate('any'), passage: rate('passage'), card: rate('card'), fileLevel: rate('file') }, byCategory: byCat, misses: rows.filter(r => !r.any).map(r => r.id) }, null, 2));
}
