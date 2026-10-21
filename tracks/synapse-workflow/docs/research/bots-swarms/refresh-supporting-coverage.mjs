import fs from 'node:fs/promises';
const home='docs/research/bots-swarms/';
const q=JSON.parse(await fs.readFile(home+'supporting-queue.json'));
const counts={complete:0,partial:0,unread:0};
for(const e of q.entries){if(!(e.status in counts))throw Error('Unknown status');counts[e.status]++;}
let text=await fs.readFile(home+'coverage.md','utf8');
if(!/Supporting queue:[^\n]*? See supporting-queue\.json;/.test(text))throw Error('Missing count anchor');
text=text.replace(/separate supporting queue \(\d+ unread\)/g,`separate supporting queue (${counts.unread} unread)`);
text=text.replace(/Supporting queue:[^\n]*? See supporting-queue\.json;/,`Supporting queue: ${q.entries.length} separate config/docs/declaration/data files; ${counts.complete} complete, ${counts.partial} partial, ${counts.unread} unread. See supporting-queue.json;`);
await fs.writeFile(home+'coverage.md',text);
console.log({entries:q.entries.length,...counts});
