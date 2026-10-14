import { readFile, writeFile, mkdir, link, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import { assessRun } from './assess.mjs';
import { exportInvestigation } from './investigation.mjs';
import { readEvidence } from './evidence.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');

export async function analyzeRun(dir) {
  const root = resolve(dir);
  const [summaryRaw, ...sources] = await Promise.all([
    readFile(join(root, 'summary.json'), 'utf8'),
    ...['analyze.mjs', 'assess.mjs', 'investigation.mjs', 'evidence.mjs'].map(f => readFile(fileURLToPath(new URL(f, import.meta.url)), 'utf8')),
  ]);
  const summary = JSON.parse(summaryRaw);
  const { raw: evidenceRaw, evidence, missing } = await readEvidence(root, summary);
  const provenance = { summarySha256: hash(summaryRaw), evidenceSha256: hash(evidenceRaw), evidenceMissing: missing, analyzerSha256: hash(JSON.stringify(sources)), node: process.version };
  const key = hash(JSON.stringify(provenance)), folder = join(root, 'analysis'), out = join(folder, `${key}.json`);
  const cached = async () => {
    const result = JSON.parse(await readFile(out, 'utf8'));
    if (result.key !== key || result.payloadSha256 !== hash(JSON.stringify(result.report))) throw new Error('Derived analysis cache failed integrity validation; original capture remains untouched');
    return { cache: 'hit', key, out, report: result.report };
  };
  try { return await cached(); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const exported = await exportInvestigation(evidence);
  const report = { schemaVersion: 1, provenance, assessment: assessRun(summary, evidence), inventory: exported.inventory, collection: exported.collection,
    policy: 'Derived from immutable input bytes; cache is not a fresh observation. No browser, network or request replay.' };
  const result = { key, payloadSha256: hash(JSON.stringify(report)), report };
  await mkdir(folder, { recursive: true });
  const temporary = join(folder, `${key}-${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, JSON.stringify(result, null, 2), { flag: 'wx' });
    // Hard-link a complete file atomically without overwriting a concurrent result.
    try { await link(temporary, out); }
    catch (error) { if (error.code !== 'EEXIST') throw error; return await cached(); }
  } finally { await unlink(temporary).catch(() => {}); }
  return { cache: 'miss', key, out, report };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { run: { type: 'string' }, help: { type: 'boolean' } } });
  if (values.help || !values.run) {
    console.log('Usage: npm run analyze -- --run runs/capture\nOffline assessment and API export, cached by source evidence and analyzer hashes.');
    process.exitCode = values.help ? 0 : 1;
  } else {
    const result = await analyzeRun(values.run);
    console.log(JSON.stringify({ cache: result.cache, key: result.key, out: result.out, requests: result.report.collection.item.length, gaps: result.report.assessment.gaps }, null, 2));
  }
}
