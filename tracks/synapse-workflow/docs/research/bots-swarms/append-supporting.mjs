import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
const home = path.resolve('docs/research/bots-swarms');
const target = path.join(home, 'supporting-queue.json');
const queue = JSON.parse(await fs.readFile(target));
const pins = JSON.parse(await fs.readFile(path.join(home, 'snapshots.json')));
const [repo, ...files] = process.argv.slice(2);
const pin = pins.find(x => x.name === repo);
if (!pin || !files.length) throw Error('Provide pinned repo and exact dependency paths');
for (const file of files) {
  if (queue.entries.some(x => x.repo === repo && x.path === file)) continue;
  const root = path.resolve(pin.root);
  const absolute = path.resolve(root, file);
  if (!absolute.startsWith(root + path.sep)) throw Error('Outside pinned source root');
  const bytes = await fs.readFile(absolute);
  queue.entries.push({repo, path:file, commit:pin.commit,
    sha256:createHash('sha256').update(bytes).digest('hex'), bytes:bytes.length,
    lines:bytes.toString('utf8').split('\n').length, priority:1,
    status:'unread', readRanges:[], reason:'Exact dependency discovered during enforcement/test review'});
}
await fs.writeFile(target, JSON.stringify(queue, null, 2));
console.log({supportingFiles:queue.entries.length});
