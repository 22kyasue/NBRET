import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Reading aid only. Emitting a range never earns reading credit until a separate
// acknowledge operation records the reader's substantive note.
const root = path.resolve('docs/research');
const here = path.join(root, 'reconciliation');
const manifestPath = path.join(here, 'corpus.json');
const ledgerPath = path.join(here, 'reading-ledger.json');
const sha = v => crypto.createHash('sha256').update(v).digest('hex');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? e.name === 'reconciliation' ? [] : walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const relative = file => path.relative(root, file).replaceAll('\\', '/');
const priority = f => f.startsWith('security-landscape/') && !f.includes('deep-review/') ? 0
  : f.startsWith('cybersecurity-firms/') ? 1
    : f.startsWith('assessment-evidence/') && ['overview.md','framework.md','incidents.md','executable-claims.md','infrastructure-and-memory.md','implementations.md','synthesis.md'].includes(path.basename(f)) ? 2
      : f.startsWith('toolchain/') && !['go-material-review.md','continuation.md'].includes(path.basename(f)) ? 3
        : f.endsWith('.md') ? 4 : 5;
const [op, ...args] = process.argv.slice(2);
fs.mkdirSync(here, { recursive: true });
if (op === 'init') {
  if (fs.existsSync(manifestPath)) throw new Error('Existing manifest must be preserved');
  const files = walk(root).sort().map(file => {
    const raw = fs.readFileSync(file), content = raw.toString('utf8');
    return { file: relative(file), bytes: raw.length, characters: content.length, lines: content.split('\n').length, sha256: sha(raw), priority: priority(relative(file)) };
  });
  fs.writeFileSync(manifestPath, JSON.stringify({ createdAt: new Date().toISOString(), root, files }, null, 2));
  fs.writeFileSync(ledgerPath, JSON.stringify({ schemaVersion: 1, reader: 'Pine', acknowledged: [], pending: null }, null, 2));
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath)), ledger = JSON.parse(fs.readFileSync(ledgerPath));
  if (op === 'batch') {
    if (ledger.pending) throw new Error('A pending range must be read and acknowledged first');
    let remaining = Number(args[0] || 30000);
    if (!Number.isSafeInteger(remaining) || remaining < 1000 || remaining > 60000) throw new Error('Invalid chunk size');
    const ordered = [...manifest.files].sort((a, b) => Number(!a.file.endsWith('.md')) - Number(!b.file.endsWith('.md')) || a.priority - b.priority || a.file.localeCompare(b.file));
    const ranges = [], outputs = [];
    for (const selected of ordered) {
      const start = Math.max(0, ...ledger.acknowledged.filter(a => a.file === selected.file).map(a => a.end));
      if (start >= selected.characters) continue;
      const raw = fs.readFileSync(path.join(root, selected.file));
      if (sha(raw) !== selected.sha256) throw new Error(`Corpus changed: ${selected.file}`);
      const content = raw.toString('utf8'), end = Math.min(content.length, start + remaining);
      const range = { file: selected.file, sha256: selected.sha256, start, end, startLine: content.slice(0, start).split('\n').length, endLine: content.slice(0, end).split('\n').length };
      ranges.push(range); outputs.push(JSON.stringify(range) + '\n' + content.slice(start, end));
      remaining -= end - start;
      if (!remaining) break;
    }
    ledger.pending = { id: crypto.randomUUID(), ranges, emittedAt: new Date().toISOString() };
    fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
    console.log(`BATCH ${ledger.pending.id}\n` + outputs.join('\nEND FILE RANGE\n') + `\nEND BATCH ${ledger.pending.id}`);
  } else if (op === 'next') {
    if (ledger.pending) throw new Error('A pending range must be read and acknowledged first');
    const size = Number(args[0] || 25000);
    if (!Number.isSafeInteger(size) || size < 1000 || size > 60000) throw new Error('Invalid chunk size');
    const ordered = [...manifest.files].sort((a, b) => Number(!a.file.endsWith('.md')) - Number(!b.file.endsWith('.md')) || a.priority - b.priority || a.file.localeCompare(b.file));
    const selected = ordered.find(f => Math.max(0, ...ledger.acknowledged.filter(a => a.file === f.file).map(a => a.end)) < f.characters);
    if (!selected) { console.log('Every snapshotted character acknowledged. Check changed/new files before closure.'); process.exit(0); }
    const raw = fs.readFileSync(path.join(root, selected.file));
    if (sha(raw) !== selected.sha256) throw new Error(`Corpus changed: ${selected.file}`);
    const content = raw.toString('utf8'), start = Math.max(0, ...ledger.acknowledged.filter(a => a.file === selected.file).map(a => a.end));
    const end = Math.min(content.length, start + size), startLine = content.slice(0, start).split('\n').length;
    const endLine = content.slice(0, end).split('\n').length;
    ledger.pending = { id: crypto.randomUUID(), file: selected.file, sha256: selected.sha256, start, end, startLine, endLine, emittedAt: new Date().toISOString() };
    fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
    console.log(JSON.stringify(ledger.pending));
    console.log(content.slice(start, end));
    console.log(`END RANGE ${ledger.pending.id}`);
  } else if (op === 'ack') {
    if (!ledger.pending || args[0] !== ledger.pending.id || !args[1]?.trim()) throw new Error('Pending ID and substantive note required');
    for (const range of ledger.pending.ranges || [ledger.pending]) ledger.acknowledged.push({ ...range, batchId: ledger.pending.id, acknowledgedAt: new Date().toISOString(), note: args[1] });
    ledger.pending = null;
    fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
    console.log('Recorded reading note; no runtime or external-source validation implied.');
  } else if (op === 'discard') {
    if (!ledger.pending || !args[0]) throw new Error('Reason required');
    (ledger.discardedEmissions ??= []).push({ ...ledger.pending, reason: args[0], discardedAt: new Date().toISOString() });
    ledger.pending = null;
    fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
    console.log('Emission discarded without any reading credit.');
  } else if (op === 'status') {
    const seen = manifest.files.map(f => ({ ...f, readCharacters: Math.max(0, ...ledger.acknowledged.filter(a => a.file === f.file).map(a => a.end)) }));
    const groups = {};
    for (const f of seen) { const ext = path.extname(f.file); const g = groups[ext] ??= { files: 0, complete: 0, characters: 0, readCharacters: 0 }; g.files++; g.complete += Number(f.readCharacters === f.characters); g.characters += f.characters; g.readCharacters += f.readCharacters; }
    console.log(JSON.stringify({ groups, pending: ledger.pending, totalAcknowledgedRanges: ledger.acknowledged.length }, null, 2));
  } else throw new Error('Use init, next, ack, status');
}
