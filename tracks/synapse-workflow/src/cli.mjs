import { parseArgs } from 'node:util';
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { runCapture, defaultCaptureBrowser } from './run.mjs';
const { values } = parseArgs({ options: {
  url: { type: 'string' }, out: { type: 'string' }, actions: { type: 'string' },
  origin: { type: 'string', multiple: true },
  browser: { type: 'string' }, copy: { type: 'boolean' }, 'include-coverage': { type: 'boolean' },
  'no-rea': { type: 'boolean' }, 'no-copy': { type: 'boolean' }, 'include-script-sources': { type: 'boolean' }, help: { type: 'boolean' },
} });
if (values.help || !values.url) {
  console.log('NBRET — Network Based Reverse Engineering Tool\nUsage: npm run capture -- --url URL --out runs/new-run [--browser harness|isolated] [--actions actions.json] [--origin https://api.example.com] [--include-script-sources] [--include-coverage] [--no-rea] [--copy]\nCOPY is disabled by default. Harness uses the existing computeruse browser; isolated uses a fresh headless profile. Output must not exist. Repeat --origin for additional API bodies. Source saving stores raw JS. Precise coverage adds profiling overhead.');
  process.exit(values.help ? 0 : 1);
}
const outDir = resolve(values.out || `runs/${Date.now()}`);
await mkdir(dirname(outDir), { recursive: true });
const actions = values.actions ? JSON.parse(await readFile(values.actions, 'utf8')) : [];
const result = await runCapture({ url: values.url, outDir, actions, browser: values.browser || defaultCaptureBrowser(),
  origins: values.origin || [], rea: !values['no-rea'], copy: !!values.copy && !values['no-copy'],
  includeScriptSources: !!values['include-script-sources'], includeCoverage: !!values['include-coverage'] });
console.log(JSON.stringify(result, null, 2));
if (result.errors.length) process.exitCode = 1;
