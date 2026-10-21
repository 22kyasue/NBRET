import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { buildVisuals } from './build-learning-visuals.mjs';
const root = path.resolve(import.meta.dirname, '..');
const research = path.join(root, 'docs/research');
const dir = path.join(research, 'learning');
const tracks = ['security-landscape', 'toolchain', 'bots-swarms', 'assessment-evidence', 'cybersecurity-firms'];
const docs = [];
function walk(base) {
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    const file = path.join(base, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.md')) {
      const text = fs.readFileSync(file, 'utf8');
      docs.push({ path: path.relative(research, file).replaceAll('\\', '/'), title: text.match(/^#\s+(.+)$/m)?.[1] || entry.name, text, sha256: crypto.createHash('sha256').update(text).digest('hex') });
    }
  }
}
for (const track of tracks) if (fs.existsSync(path.join(research, track))) walk(path.join(research, track));
for (const entry of fs.readdirSync(research, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.md')) {
    const text = fs.readFileSync(path.join(research, entry.name), 'utf8');
    docs.push({ path: entry.name, title: text.match(/^#\s+(.+)$/m)?.[1] || entry.name, text, sha256: crypto.createHash('sha256').update(text).digest('hex') });
  }
}
docs.sort((a, b) => a.path.localeCompare(b.path));
const learning = JSON.parse(fs.readFileSync(path.join(dir, 'topics.json'), 'utf8'));
const beginner = JSON.parse(fs.readFileSync(path.join(dir, 'beginner.json'), 'utf8'));
const visuals = buildVisuals(dir, beginner);
learning.topics = learning.topics.map(t => ({...t, technicalTitle:t.title, ...beginner[t.id], ask:`Explain lesson ${t.id} with the fictional online shop example. Assume I am new to this. Use short sentences, explain any new term, and ask me one simple question to check what I understood.`}));
const overview = JSON.parse(fs.readFileSync(path.join(dir, 'overview.json'), 'utf8'));
const publication = JSON.parse(fs.readFileSync(path.join(dir, 'publication.json'), 'utf8'));
publication.labSource = fs.readFileSync(path.join(dir, 'labs/order-access-lab.mjs'), 'utf8');
publication.serviceExercise = fs.readFileSync(path.join(dir, 'labs/SERVICE-EXERCISE.md'), 'utf8');
publication.blueprints = JSON.parse(fs.readFileSync(path.join(dir, 'blueprints.json'), 'utf8'));
for (const chapter of publication.chapters) {
  chapter.text = fs.readFileSync(path.join(dir, 'chapters', chapter.guide), 'utf8');
  for (const source of [...chapter.studies, ...chapter.deeper]) if (!docs.some(d => d.path === source)) throw new Error(`Missing chapter study: ${source}`);
}
for (const company of publication.companies) {
  for (const source of [company.profile,...company.sections.flatMap(s=>s.docs)]) if (!docs.some(d=>d.path==='cybersecurity-firms/'+source)) throw new Error(`Missing company study: ${source}`);
}
for (const track of overview.tracks) for (const source of track.sources) {
  if (!docs.some(d => d.path === source)) throw new Error(`Missing overview document: ${source}`);
}
const missing = learning.topics.flatMap(t => t.sources.filter(s => !docs.some(d => d.path === s)).map(s => `${t.id}: ${s}`));
if (missing.length) throw new Error(`Missing canonical topic documents:\n${missing.join('\n')}`);
const payload = { ...learning, overview, visuals, publication, generated: new Date().toISOString(), docs };
const serialized = JSON.stringify(payload).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
const template = fs.readFileSync(path.join(dir, 'reader.template.html'), 'utf8')
  .replace('/* READER_VISUAL_STYLES */', () => fs.readFileSync(path.join(dir, 'reader-visuals.css'), 'utf8'))
  .replace('/* READER_VISUAL_CODE */', () => fs.readFileSync(path.join(dir, 'reader-visuals.js'), 'utf8'))
  .replace('/* READER_PUBLICATION_STYLES */', () => fs.readFileSync(path.join(dir, 'reader-publication.css'), 'utf8'))
  .replace('/* READER_PUBLICATION_CODE */', () => fs.readFileSync(path.join(dir, 'reader-publication.js'), 'utf8'));
if (template.split('<!-- RESEARCH_DATA -->').length !== 2) throw new Error('Expected one data marker');
const html = template.replace('<!-- RESEARCH_DATA -->', () => `<script id="research-data" type="application/json">${serialized}</script>`);
fs.writeFileSync(path.join(dir, 'index.html'), html);
const receipt = { generated: payload.generated, topics: learning.topics.length, documents: docs.length, htmlBytes: Buffer.byteLength(html), htmlSha256: crypto.createHash('sha256').update(html).digest('hex'), scope: 'A dated Markdown snapshot. Topic synthesis is editorial; document hashes establish byte identity, not semantic correctness.', documentsManifest: docs.map(({ path, sha256 }) => ({ path, sha256 })) };
fs.writeFileSync(path.join(dir, 'build-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ topics: receipt.topics, documents: receipt.documents, bytes: receipt.htmlBytes, output: path.join(dir, 'index.html') }));
