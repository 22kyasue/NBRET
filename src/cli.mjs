import { parseArgs } from 'node:util';
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { runCapture } from './run.mjs';
import { captureProfile } from './profiles.mjs';
const { values } = parseArgs({ options: {
  url: { type: 'string' }, out: { type: 'string' }, actions: { type: 'string' },
  proxy: { type: 'string' }, 'proxy-insecure': { type: 'boolean' },
  origin: { type: 'string', multiple: true }, scenario: { type: 'string' },
  visual: { type: 'boolean' },
  profile: { type: 'string' },
  'visual-checkpoints': { type: 'string' },
  'include-stream-payloads': { type: 'boolean' },
  'discard-profile': { type: 'boolean' },
  'copy-mode': { type: 'string' },
  'session-in': { type: 'string' }, 'session-out': { type: 'string' },
  targets: { type: 'boolean' },
  viewport: { type: 'string' }, 'reduced-motion': { type: 'string' }, motion: { type: 'string' },
  'asset-store': { type: 'string' },
  'no-rea': { type: 'boolean' }, 'no-copy': { type: 'boolean' }, 'include-script-sources': { type: 'boolean' }, help: { type: 'boolean' },
} });
if (values.help || !values.url) {
  console.log('NBRET — Network Based Reverse Engineering Tool\nUsage: npm run capture -- --url URL --out runs/new-run [--actions actions.json] [--scenario ID] [--visual] [--visual-checkpoints all|final] [--profile network|behavior|full] [--discard-profile] [--include-stream-payloads] [--origin ORIGIN ...] [--include-script-sources] [--proxy URL] [--proxy-insecure] [--copy-mode same-state|separate] [--targets] [--session-in FILE] [--session-out FILE] [--viewport WIDTHxHEIGHT] [--reduced-motion reduce|no-preference] [--motion FILE] [--asset-store DIR] [--no-rea] [--no-copy]\n--visual saves unredacted same-state screenshots and visible text locally. Creates a fresh headless browser; output must not exist. Proxy applies to Network, REA and same-state COPY; separate COPY remains direct, so use --copy-mode same-state or --no-copy for proxy-only traffic. Script-source option stores raw JS. Only operate pages/actions you are authorized to inspect.');
  process.exit(values.help ? 0 : 1);
}
const outDir = resolve(values.out || `runs/${Date.now()}`);
await mkdir(dirname(outDir), { recursive: true });
const actions = values.actions ? JSON.parse(await readFile(values.actions, 'utf8')) : [];
const selected = values.profile ? captureProfile(values.profile) : { rea: true, copy: true, visual: false };
const motion = values.motion ? JSON.parse(await readFile(values.motion, 'utf8')) : undefined;
if (values.viewport && !/^\d+x\d+$/.test(values.viewport)) throw new Error('Viewport must be WIDTHxHEIGHT');
const viewport = values.viewport ? Object.fromEntries(['width', 'height'].map((key, i) => [key, Number(values.viewport.split('x')[i])])) : undefined;
const result = await runCapture({ url: values.url, outDir, actions, rea: !values['no-rea'] && selected.rea, copy: !values['no-copy'] && selected.copy, includeScriptSources: !!values['include-script-sources'], proxy: values.proxy, proxyInsecure: !!values['proxy-insecure'], origins: values.origin, scenarioId: values.scenario, visual: !!values.visual || selected.visual, visualCheckpoints: values['visual-checkpoints'] || selected.visualCheckpoints, includeStreamPayloads: !!values['include-stream-payloads'], retainProfile: !values['discard-profile'], copyMode: values['copy-mode'] || selected.copyMode, sessionIn: values['session-in'], sessionOut: values['session-out'], captureTargets: !!values.targets || !!selected.captureTargets, viewport, motion, reducedMotion: values['reduced-motion'], assetStore: values['asset-store'] });
console.log(JSON.stringify(result, null, 2));
if (result.errors.length) process.exitCode = 1;
