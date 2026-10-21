import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const dir = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(dir), checked = [], errors = [];
for (const name of files) {
  if (name.endsWith('.json')) { JSON.parse(readFileSync(resolve(dir, name), 'utf8')); checked.push(name); }
  if (name.endsWith('.md')) {
    const text = readFileSync(resolve(dir, name), 'utf8');
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      const link = match[1]; if (/^(https?:|#)/.test(link)) continue;
      const target = resolve(dir, link.split('#')[0]);
      if (!existsSync(target)) errors.push({ file: name, link });
    }
    checked.push(name);
  }
}
assert.deepEqual(errors, []);
const receipt = JSON.parse(readFileSync(resolve(dir, 'lab-receipt-20261017.json')));
const hash = createHash('sha256').update(readFileSync(resolve(dir, 'lab.mjs'))).digest('hex');
assert.equal(hash, receipt.sourceHash);
assert.equal(receipt.results.filter(r => r.mode === 'class' && r.passed).length, 6);
assert.equal(receipt.externalCalls, 0);
const result = { at: new Date().toISOString(), command: 'node docs/research/assessment-evidence/verify.mjs',
  node: process.version, exitCode: 0, checks: ['JSON parsing', 'relative Markdown links', 'lab source/receipt hash', 'six class cases passed', 'no external lab calls'],
  filesChecked: checked, limitations: 'Does not validate remote URL availability, prose truth, source security or universality of the claim' };
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(result));
