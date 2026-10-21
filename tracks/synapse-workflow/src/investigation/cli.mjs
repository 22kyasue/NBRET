import { open, lstat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createJournal, readJournal, appendEvent } from './journal.mjs';
import { initialState, replay, applyEvent, summarize } from './records.mjs';
import { renderInvestigation } from './report.mjs';
import { outputDirectory } from './output-path.mjs';
import { inspectAssessmentDirectory } from './assessment-import.mjs';

// Inert record management only: no imports of target executors or model providers.
const LIMIT = 1024 * 1024;
async function readInput(filename) {
  const path = resolve(filename), info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink() || info.size > LIMIT) throw new Error('Input must be a regular JSON file of at most 1 MiB');
  const handle = await open(path, 'r');
  try {
    const buffer = Buffer.alloc(LIMIT + 1);
    let size = 0;
    while (size < buffer.length) {
      const { bytesRead } = await handle.read(buffer, size, buffer.length - size, null);
      if (!bytesRead) break;
      size += bytesRead;
    }
    if (size > LIMIT) throw new Error('Input exceeds 1 MiB');
    return JSON.parse(buffer.subarray(0, size).toString('utf8'));
  } finally { await handle.close(); }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const allowed = { init: ['--manifest','--out'], append: ['--run','--event','--revision','--head'],
    status: ['--run'], report: ['--run','--out'], 'inspect-assessment':['--source','--out'] };
  if (!allowed[command]) throw new Error('Commands: init, append, status, report, inspect-assessment. Offline records only; see docs/synapse/offline-foundation.md');
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!allowed[command].includes(args[i]) || typeof args[i + 1] !== 'string' || args[i + 1].startsWith('--') || Object.hasOwn(options, args[i])) throw new Error('Use each supported --option value once');
    options[args[i]] = args[i + 1];
  }
  for (const name of allowed[command]) if (!Object.hasOwn(options, name)) throw new Error(`Missing ${name}`);
  if(command==='inspect-assessment'){
    const source=resolve(options['--source']);
    const inspection=await inspectAssessmentDirectory(source);
    const out=await outputDirectory(options['--out'],[source]);
    await mkdir(out,{recursive:false});
    await writeFile(join(out,'inspection.json'),JSON.stringify(inspection,null,2)+'\n',{flag:'wx'});
    console.log(JSON.stringify({command,status:inspection.status,counts:inspection.counts,offlineOnly:true}));
    return;
  }
  let snapshot;
  if (command === 'init') {
    const manifest = await readInput(options['--manifest']);
    initialState(manifest);
    snapshot = await createJournal(await outputDirectory(options['--out']), manifest);
  } else if (command === 'append') {
    if (!/^(0|[1-9][0-9]*)$/.test(options['--revision']) || !Number.isSafeInteger(Number(options['--revision']))) throw new Error('Invalid expected revision');
    const event = await readInput(options['--event']);
    snapshot = await appendEvent(resolve(options['--run']), event, {
      expectedRevision: Number(options['--revision']), expectedHead: options['--head'],
      validate: (current, proposed) => { applyEvent(replay(current.manifest, current.events), proposed); },
    });
  } else snapshot = await readJournal(resolve(options['--run']));
  const summary = summarize(replay(snapshot.manifest, snapshot.events));
  if (command === 'report') {
    const out = await outputDirectory(options['--out'],[resolve(options['--run'])]), result = renderInvestigation(snapshot);
    // An interrupted export can leave a partial new directory. It is never a commit or the journal.
    await mkdir(out, { recursive: false });
    await writeFile(join(out, 'REPORT.md'), result.markdown, { flag: 'wx' });
    await writeFile(join(out, 'projection.json'), JSON.stringify(result.projection, null, 2) + '\n', { flag: 'wx' });
    await writeFile(join(out, 'records.json'), JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx' });
  }
  console.log(JSON.stringify({ command, id: snapshot.manifest.id, revision: snapshot.revision, head: snapshot.head,
    counts: Object.fromEntries(['reviewSupported','needsAction','unconfirmed','rejected','pendingRequests'].map(k => [k, (summary[k] || []).length])),
    stopped: summary.stopped, offlineOnly: true }));
}
main().catch(error => {
  // Journal errors are controlled constant messages; parse errors can contain input secrets.
  const detail = ['NBRET_JOURNAL','NBRET_IMPORT'].includes(error.code) ? ` ${error.message}` : '';
  console.error(`Investigation command failed.${detail} Input, journal integrity, revision or lifecycle validation failed; inspect the local records. A failed append may already have committed: reopen and compare the head before retrying. No target action was performed.`);
  process.exitCode = 2;
});
