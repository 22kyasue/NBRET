import { readdir, lstat } from 'node:fs/promises';
import { join } from 'node:path';

export async function measureArtifacts(root, { maxEntries = 10000 } = {}) {
  if (!Number.isInteger(maxEntries) || maxEntries < 1) throw new Error('Artifact accounting requires a positive entry limit');
  const groups = {}, stack = [{ path: root, group: null }];
  let entries = 0, skippedSymlinks = 0, truncated = false;
  while (stack.length && !truncated) {
    const current = stack.pop();
    for (const item of await readdir(current.path, { withFileTypes: true })) {
      if (++entries > maxEntries) { truncated = true; break; }
      if (item.isSymbolicLink()) { skippedSymlinks++; continue; }
      const group = current.group || ({ network: 'network', visual: 'visual', copy: 'copy', 'browser-profile': 'profile', 'rea.json': 'rea', 'links.json': 'links' }[item.name] || 'other');
      const path = join(current.path, item.name);
      if (item.isDirectory()) stack.push({ path, group });
      else if (item.isFile()) {
        const stat = await lstat(path);
        if (!stat.isFile()) continue;
        groups[group] ||= { files: 0, bytes: 0 };
        groups[group].files++; groups[group].bytes += stat.size;
      }
    }
  }
  return { groups, files: Object.values(groups).reduce((n, g) => n + g.files, 0), bytes: Object.values(groups).reduce((n, g) => n + g.bytes, 0), entriesExamined: Math.min(entries, maxEntries), skippedSymlinks, truncated,
    scope: 'Logical file sizes at accounting time; final summary/report writes excluded. Symlinks not followed; hard-linked files count per path.' };
}
