import { parseArgs } from 'node:util';
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { runCapture } from './run.mjs';
const { values } = parseArgs({ options: {
  url: { type: 'string' }, out: { type: 'string' }, actions: { type: 'string' },
  'no-rea': { type: 'boolean' }, 'no-copy': { type: 'boolean' }, 'include-script-sources': { type: 'boolean' }, help: { type: 'boolean' },
} });
if (values.help || !values.url) {
  console.log('NBRET — Network Based Reverse Engineering Tool\nUsage: npm run capture -- --url URL --out runs/new-run [--actions actions.json] [--include-script-sources] [--no-rea] [--no-copy]\nCreates a fresh headless browser; output must not exist. Script-source option stores raw JS. Only operate pages/actions you are authorized to inspect.');
  process.exit(values.help ? 0 : 1);
}
const outDir = resolve(values.out || `runs/${Date.now()}`);
await mkdir(dirname(outDir), { recursive: true });
const actions = values.actions ? JSON.parse(await readFile(values.actions, 'utf8')) : [];
const result = await runCapture({ url: values.url, outDir, actions, rea: !values['no-rea'], copy: !values['no-copy'], includeScriptSources: !!values['include-script-sources'] });
console.log(JSON.stringify(result, null, 2));
if (result.errors.length) process.exitCode = 1;
