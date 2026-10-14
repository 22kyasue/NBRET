import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { captureProfile } from './profiles.mjs';

const capabilities = { network: ['http'], behavior: ['http','dom','pixels'], full: ['http','dom','pixels','css','scripts','targets'] };
export function adviseCapture(requirements, benchmark) {
  if (!Array.isArray(requirements) || !requirements.length || requirements.length > 20 || requirements.some(x=>typeof x!=='string')) throw new Error('Provide 1..20 evidence requirements');
  const known = [...new Set(Object.values(capabilities).flat())];
  const unsupported = requirements.filter(x=>!known.includes(x));
  if (unsupported.length) return { selected: null, unsupported, reason: 'No profile meets all requested evidence; do not silently reduce coverage.' };
  const eligible = Object.entries(capabilities).filter(([,caps])=>requirements.every(r=>caps.includes(r))).map(([name])=>name);
  const measured = benchmark?.verified === true ? benchmark.aggregates?.filter(a=>eligible.includes(a.profile) && a.samples >= 3 && Number.isFinite(a.medianMs) && a.medianMs > 0) : [];
  const costs = measured?.length === eligible.length ? measured : [];
  const selected = costs.length ? [...costs].sort((a,b)=>a.medianMs-b.medianMs)[0].profile : eligible[0];
  return { selected, options: captureProfile(selected), requirements: [...new Set(requirements)], eligible, basis: costs.length ? 'Measured median among profiles meeting all evidence requirements.' : 'Smallest declared profile; comparable repeated measurements unavailable.', costs, limitations: ['Advice only; no capture or tool launch performed.', 'Fixture costs are not general site performance predictions.', 'Proxy experiments require a separate explicit question and endpoint.'] };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { need:{type:'string',multiple:true}, benchmark:{type:'string'} } });
  console.log(JSON.stringify(adviseCapture(values.need,values.benchmark?JSON.parse(await readFile(values.benchmark,'utf8')):undefined),null,2));
}
