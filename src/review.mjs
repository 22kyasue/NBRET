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

// Inventory only: even structured/redacted artifacts can contain private URLs or values.
// Default output contains hashes and relative paths, never captured contents.
export async function reviewArtifacts(runDir, outDir) {
  const root = resolve(runDir), out = resolve(outDir);
  if (out === root || !relative(root, out).startsWith('..')) throw new Error('Review output must be outside the capture');
  const files = [], queue = [''];
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
      const bytes = await readFile(join(root, path));
      files.push({ path, class: artifactClass(path), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    }
  }
  const manifest = { schemaVersion: 1, source: 'local capture inventory', files, limitations: ['No captured file contents exported.', 'Paths can reveal private identifiers; review this manifest before sharing.', 'Classification is not secret detection or clearance.', 'Raw markup, scripts, images, profiles and structured records require human review before export.'] };
  await mkdir(out, { recursive: false });
  await writeFile(join(out, 'artifact-review.json'), JSON.stringify(manifest, null, 2), { flag: 'wx' });
  return { out, files: files.length, contentsExported: 0 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { run: { type: 'string' }, out: { type: 'string' } } });
  if (!values.run || !values.out) throw new Error('Usage: npm run review -- --run runs/capture --out runs/review-new');
  console.log(JSON.stringify(await reviewArtifacts(values.run, values.out), null, 2));
}
