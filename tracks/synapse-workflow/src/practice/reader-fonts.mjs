import {readFileSync} from 'node:fs';

const data=name=>readFileSync(new URL(`./fonts/${name}`,import.meta.url)).toString('base64');
const face=(family,file,weight)=>`@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${data(file)}) format('woff2')}`;
export const READER_FONT_CSS=[
  face('Inter','Inter-400.woff2','400'),face('Inter','Inter-500.woff2','500'),face('Inter','Inter-600.woff2','600'),
  face('Noto Sans JP','NotoSansJP-400-700.woff2','400 700')
].join('\n');
export const READER_FONT_LICENSES=['Inter-OFL.txt','NotoSansJP-OFL.txt'].map(name=>({name,text:readFileSync(new URL(`./fonts/${name}`,import.meta.url),'utf8')}));
