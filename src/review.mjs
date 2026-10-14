import { readdir, readFile, lstat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

export function artifactClass(path) {
  if (/(^|\/)(profile|browser-profile|sessions?)(\/|$)/i.test(path)) return 'session-sensitive';
  if (/\.(png|jpg|jpeg|webp)$/i.test(path)) return 'visual-sensitive';
  if (/\.(html|css|js|mjs)$/i.test(path)) return 'raw-source';
  if (/\.(json|jsonl)$/i.test(path)) return 'structured-review-required';
  return 'other-review-required';
}

// High-confidence credential shapes. Findings report where and what kind, never the matched value.
const SECRET_PATTERNS = [
  ['private-key', /-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/g],
  ['jwt', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g],
  ['aws-access-key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b/g],
  ['slack-token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/g],
  ['stripe-key', /\b[sr]k_(?:live|test)_[A-Za-z0-9]{16,}/g],
  ['google-api-key', /\bAIza[0-9A-Za-z_-]{35}\b/g],
  ['llm-api-key', /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{32,}/g],
  ['bearer-token', /\bBearer\s+(?!\[REDACTED\])[A-Za-z0-9._~+/-]{20,}=*/g],
  ['url-credentials', /\b[a-z][a-z0-9+.-]*:\/\/[^/\s:@"']+:[^/\s@"']+@/gi],
  ['credential-assignment', /["']?(?:password|passwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret)["']?\s*[:=]\s*["'](?!\[REDACTED\])[^"'\s]{8,}["']/gi],
];
const SCANNABLE = /\.(json|jsonl|html|css|js|mjs|txt|md|har|log|xml|csv)$/i;

export function scanText(text) {
  const findings = new Map(), lineStarts = [0];
  for (let i = text.indexOf('\n'); i !== -1; i = text.indexOf('\n', i + 1)) lineStarts.push(i + 1);
  const lineOf = index => { let lo = 0, hi = lineStarts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStarts[mid] <= index) lo = mid; else hi = mid - 1; } return lo + 1; };
  for (const [kind, pattern] of SECRET_PATTERNS) for (const match of text.matchAll(pattern)) {
    const entry = findings.get(kind) || { kind, count: 0, lines: [] };
    entry.count++; const line = lineOf(match.index);
    if (entry.lines.length < 20 && !entry.lines.includes(line)) entry.lines.push(line);
    findings.set(kind, entry);
  }
  return [...findings.values()];
}

// Inventory only: even structured/redacted artifacts can contain private URLs or values.
// Default output contains hashes and relative paths, never captured contents.
export async function reviewArtifacts(runDir, outDir) {
  const root = resolve(runDir), out = resolve(outDir);
  if (out === root || !relative(root, out).startsWith('..')) throw new Error('Review output must be outside the capture');
  const files = [], queue = [''], secrets = [];
  let entries = 0;
  while (queue.length) {
    const dir = queue.shift();
    for (const entry of await readdir(join(root, dir), { withFileTypes: true })) {
      if (++entries > 10000) throw new Error('Review inventory exceeds 10000 entries');
      const path = join(dir, entry.name).replaceAll('\\', '/');
      if (entry.isSymbolicLink()) { files.push({ path, class: 'symlink-excluded' }); continue; }
      if (entry.isDirectory()) { queue.push(path); continue; }
      if (!entry.isFile()) continue;
      const info = await lstat(join(root, path));
      if (info.size > 32 * 1024 * 1024) { files.push({ path, class: artifactClass(path), bytes: info.size, hashOmitted: 'size-limit' }); continue; }
      const bytes = await readFile(join(root, path)), cls = artifactClass(path);
      files.push({ path, class: cls, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
      // Profiles and sessions are sensitive as a whole; scan the text artifacts people might share.
      if (cls !== 'session-sensitive' && SCANNABLE.test(path)) for (const finding of scanText(bytes.toString('utf8'))) secrets.push({ path, ...finding });
    }
  }
  const manifest = { schemaVersion: 2, source: 'local capture inventory', files, secretScan: { findings: secrets, patterns: SECRET_PATTERNS.map(([kind]) => kind) },
    limitations: ['No captured file contents exported; secret findings give kind, file and line only.', 'Paths can reveal private identifiers; review this manifest before sharing.', 'The secret scan matches known high-confidence credential shapes only; no findings is not clearance. Profiles and session files are not scanned because they are sensitive as a whole.', 'Raw markup, scripts, images, profiles and structured records require human review before export.'] };
  await mkdir(out, { recursive: false });
  await writeFile(join(out, 'artifact-review.json'), JSON.stringify(manifest, null, 2), { flag: 'wx' });
  return { out, files: files.length, contentsExported: 0, secretFindings: secrets.reduce((n, f) => n + f.count, 0), secretFiles: new Set(secrets.map(f => f.path)).size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { run: { type: 'string' }, out: { type: 'string' } } });
  if (!values.run || !values.out) throw new Error('Usage: npm run review -- --run runs/capture --out runs/review-new');
  console.log(JSON.stringify(await reviewArtifacts(values.run, values.out), null, 2));
}
