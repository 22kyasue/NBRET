import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readerModel } from './reader-model.mjs';
import {READER_FONT_CSS,READER_FONT_LICENSES} from './reader-fonts.mjs';
import {READER_JA} from './reader-ja.mjs';

const script=readFileSync(new URL('./reader-ui.js',import.meta.url),'utf8');
const style=READER_FONT_CSS+'\n'+readFileSync(new URL('./reader-ui.css',import.meta.url),'utf8');
export const READER_SCRIPT_HASH=`'sha256-${createHash('sha256').update(script).digest('base64')}'`;
const safeJson=value=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
export function renderAssessmentReport(state,options={}){
  const data=readerModel(state,options);
  const translations={ja:{...READER_JA}};
  for(const [source,translated] of Object.entries(options.translations?.ja||{})){
    if(typeof translated!=='string'||source.length>12000||translated.length>12000)throw Error('Invalid reader translation');
    translations.ja[source]=translated;
  }
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${READER_SCRIPT_HASH}; style-src 'unsafe-inline'; font-src data:; img-src 'self' file:; base-uri 'none'; form-action 'none'"><title>Assessment report · Synapse</title><style>${style}</style></head><body><main id="root"></main><dialog id="dialog"></dialog><noscript><p>This interactive report requires JavaScript. The separately retained technical report remains readable without it.</p></noscript><script id="assessment-data" type="application/json">${safeJson(data)}</script><script id="reader-translations" type="application/json">${safeJson(translations)}</script><script id="font-licenses" type="application/json">${safeJson(READER_FONT_LICENSES)}</script><script>${script}</script></body></html>`;
}
