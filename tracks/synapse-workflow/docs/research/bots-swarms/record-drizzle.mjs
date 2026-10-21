import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const ranges=[
 ['rate-limiter-flexible','lib/RateLimiterDrizzle.js',1,228],
 ['rate-limiter-flexible','lib/RateLimiterDrizzleNonAtomic.js',1,176],
 ['rate-limiter-flexible','test/RateLimiterDrizzle/Postgres/RateLimiterDrizzlePostgres.test.js',1,428],
 ['rate-limiter-flexible','test/RateLimiterDrizzle/Postgres/RateLimiterDrizzleNonAtomicPostgres.test.js',1,428],
 ['rate-limiter-flexible','test/RateLimiterDrizzle/Postgres/database.js',1,7],
 ['rate-limiter-flexible','test/RateLimiterDrizzle/Postgres/drizzle.config.js',1,11],
 ['rate-limiter-flexible','test/RateLimiterDrizzle/Postgres/schema.js',1,7],
];
for(const r of ranges) execFileSync(process.execPath,['docs/research/bots-swarms/source.mjs','mark',...r.map(String)],{windowsHide:true,stdio:'pipe'});
const base='docs/research/bots-swarms/';
const p=base+'continuation-record.mjs';
fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('];\nfor(const r of ranges)',ranges.map(r=>' '+JSON.stringify(r)+',').join('\n')+'\n];\nfor(const r of ranges)'));
const q=JSON.parse(fs.readFileSync(base+'queue.json','utf8'));
const counts=['complete','partial','unread'].map(s=>q.filter(e=>e.status===s).length);
const c=base+'coverage.md';
fs.writeFileSync(c,fs.readFileSync(c,'utf8').replace(/records\d+ complete,\d+ partial and\d+ unread/,`records${counts[0]} complete,${counts[1]} partial and${counts[2]} unread`));
console.log(counts);
