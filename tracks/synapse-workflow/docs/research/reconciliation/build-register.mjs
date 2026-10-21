#!/usr/bin/env node
// Regenerates the human-readable domain digests from register/*.json.
//   node docs/research/reconciliation/build-register.mjs
// The JSON register is the source of truth; never edit domains/*.md by hand.
import fs from 'node:fs';
import path from 'node:path';
import { here, loadRegister, DOMAINS, STRENGTHS } from './lib.mjs';

const reg = loadRegister();
const outDir = path.join(here, 'domains');
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) if (f.endsWith('.md')) fs.rmSync(path.join(outDir, f));

const link = (p, line) => `[${p.replace(/^docs\/research\//, '')}:${line}](../../${p.replace(/^docs\/research\//, '')}#L${line})`;
const strengthOrder = s => STRENGTHS.indexOf(s);
const byDomain = d => reg.findings.filter(f => f.domain === d).sort((a, b) => strengthOrder(a.strength) - strengthOrder(b.strength) || a.id.localeCompare(b.id));
const pathsOf = d => new Set(byDomain(d).flatMap(f => f.sources.map(s => s.path)));

const summary = [];
for (const [domain, label] of Object.entries(DOMAINS)) {
  const findings = byDomain(domain);
  if (!findings.length) continue;
  const paths = pathsOf(domain);
  const corrections = reg.corrections.filter(c => paths.has(c.earlier.path) || paths.has(c.later.path) || c.id.startsWith(`corr.${domain}.`));
  const hazards = reg.hazards.filter(h => paths.has(h.path));
  const lines = [
    `# ${label}`, '',
    `Generated from \`register/*.json\` by \`build-register.mjs\`; do not edit by hand. ${findings.length} findings, ${corrections.length} related corrections, ${hazards.length} hazards.`, '',
    'Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.', '',
  ];
  if (hazards.length) {
    lines.push('## Hazards', '');
    for (const h of hazards) lines.push(`- **\`${h.id}\`** ${link(h.path, h.line)}: ${h.hazard} **Instead:** ${h.guidance}`);
    lines.push('');
  }
  lines.push('## Findings', '', '| Finding | Strength | Stages |', '| --- | --- | --- |');
  for (const f of findings) lines.push(`| [${f.title.replaceAll('|', '\\|')}](#${f.id.replace(/[^a-z0-9-]/g, '')}) | ${f.strength} | ${(f.stages || []).join(', ')} |`);
  lines.push('');
  for (const f of findings) {
    lines.push(`### ${f.id.replace(/[^a-z0-9-]/g, '')}`, '', `**\`${f.id}\`: ${f.title}** (${f.strength})`, '');
    lines.push(f.claim, '', `**Do:** ${f.implication}`, '', `**Limits:** ${f.limits}`, '');
    lines.push(`**Sources:** ${f.sources.map(s => link(s.path, s.line)).join(', ')}`);
    if (f.receipts?.length) lines.push('', `**Receipts:** ${f.receipts.map(r => `\`${r.replace(/^docs\/research\//, '')}\``).join(', ')}`);
    if (f.contrary?.length) lines.push('', '**Contrary or narrowing evidence:**', ...f.contrary.map(c => `- ${link(c.path, c.line)}: ${c.note}`));
    lines.push('');
  }
  if (corrections.length) {
    lines.push('## Corrections', '', 'An earlier passage that a later one narrows or supersedes. Believe the later passage.', '', '| Risk | Earlier | Later | What to believe now |', '| --- | --- | --- | --- |');
    for (const c of corrections.sort((a, b) => ['high', 'medium', 'low'].indexOf(a.risk) - ['high', 'medium', 'low'].indexOf(b.risk)))
      lines.push(`| ${c.risk} | ${link(c.earlier.path, c.earlier.line)} | ${link(c.later.path, c.later.line)} | ${c.guidance.replaceAll('|', '\\|')} |`);
    lines.push('');
  }
  fs.writeFileSync(path.join(outDir, `${domain}.md`), lines.join('\n'));
  summary.push({ domain, findings: findings.length, corrections: corrections.length, hazards: hazards.length });
}
console.log(JSON.stringify({ wrote: path.relative(process.cwd(), outDir), domains: summary }, null, 2));
