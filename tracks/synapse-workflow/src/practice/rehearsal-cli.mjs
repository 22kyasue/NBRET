import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { runPracticeRehearsal } from './rehearsal.mjs';

try {
  const args=process.argv.slice(2);
  if(args.length && (args.length!==2 || args[0]!=='--out')) throw new Error('Usage: npm run synapse:rehearse -- [--out NEW_DIRECTORY]');
  await mkdir('runs',{recursive:true});
  const result=await runPracticeRehearsal({outDir:args[1] || join('runs',`practice-${randomUUID()}`)});
  console.log(`${result.receipt.counts.passed}/${result.receipt.plannedCases} checks passed; owned fixture closed.\nReport: ${result.htmlPath}`);
  if(result.receipt.status!=='checks-passed') process.exitCode=1;
} catch(error) { console.error(error.message); process.exitCode=1; }
