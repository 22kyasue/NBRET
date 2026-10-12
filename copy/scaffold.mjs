// /copy stage 5 — create the own-code rebuild folder.
//   node <skill>/scripts/scaffold.mjs --out references/<slug>-mirror-<date>/rebuild --url <source page>
//        [--from <extract dir>] [--title "<title>"] [--port 8890] [--lang ja]
// Creates: parts/{body.html,style.css,app.js}, assemble.mjs (parts -> index.html), serve.mjs (static,
// Range for video), .gitignore (assets/), README.md skeleton, tools/. With --from, body.html is seeded
// from body-1440.html and style.css from used-all.css so the build starts from the reference's own
// markup and rules instead of a blank file.
import { mkdir, writeFile, readFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { arg } from './_lib.mjs';

const OUT = arg('--out'); const URL_ = arg('--url', '');
if (!OUT) { console.error('--out required'); process.exit(2); }
const FROM = arg('--from', ''); const TITLE = arg('--title', 'Rebuild'); const PORT = arg('--port', '8890'); const LANG = arg('--lang', 'ja');
const date = new Date().toLocaleDateString('sv-SE');
const rel = relative(process.cwd(), OUT).replace(/\\/g, '/');
await mkdir(join(OUT, 'parts'), { recursive: true });
await mkdir(join(OUT, 'tools'), { recursive: true });
await mkdir(join(OUT, 'assets'), { recursive: true });

const w = async (f, s) => { if (existsSync(join(OUT, f))) { console.log('keep', f); return; } await writeFile(join(OUT, f), s); console.log('write', f); };

let body = `<!-- markup goes here: reference body, cleaned of runtime state classes, assets repointed to assets/ -->\n`;
let css = `/* the reference's used rules (extract.mjs used-all.css), then our own additions at the bottom */\n`;
if (FROM) {
  if (existsSync(join(FROM, 'body-1440.html'))) body = await readFile(join(FROM, 'body-1440.html'), 'utf8');
  if (existsSync(join(FROM, 'used-all.css'))) css = await readFile(join(FROM, 'used-all.css'), 'utf8');
  for (const f of ['dom-1440.json', 'dom-390.json', 'summary.json']) if (existsSync(join(FROM, f))) await copyFile(join(FROM, f), join(OUT, 'tools', f));
}
await w('parts/body.html', body);
await w('parts/style.css', css);
await w('parts/app.js', `// Behaviour, written by hand from the reference's scripts (extract.mjs scripts-<w>.txt, prettified).\n// No framework, no library: scroll engine, reveals, sliders, drawers, loaders all live here.\n'use strict';\n`);
await w('assemble.mjs', `// Assemble the single-file rebuild: parts/body.html + parts/style.css + parts/app.js, with parts/*.svg
// inlined at <!--@svg:name--> markers.   node ${rel}/assemble.mjs
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const parts = join(here, 'parts');
const read = f => readFile(join(parts, f), 'utf8');
const svgs = {};
for (const f of (await readdir(parts)).filter(f => f.endsWith('.svg'))) svgs[f.slice(0, -4)] = await read(f);
let body = await read('body.html');
body = body.replace(/<!--@svg:([a-z0-9-]+)-->/g, (m, name) => svgs[name] || m);
const css = await read('style.css');
const js = await read('app.js');

const html = \`<!doctype html>
<html lang="${LANG}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${TITLE.replace(/"/g, '&quot;')}</title>
<!-- Own-code 1:1 rebuild of ${URL_ || '<source>'} (${date}) for local study. Photography, copy and webfonts belong to the site owner — local only, never deploy. -->
<style>
\${css}
</style>
</head>
<body>
\${body}
<script>
\${js}
</script>
</body>
</html>
\`;
await writeFile(join(here, 'index.html'), html);
console.log('index.html', html.length, 'bytes');
`);
await w('serve.mjs', `// Tiny static server for the rebuild (no deps).   node ${rel}/serve.mjs --port ${PORT}
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--port', ${PORT}));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.json': 'application/json', '.txt': 'text/plain' };

createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/' || !extname(path)) path = '/index.html';
  const file = join(here, path);
  let st; try { st = statSync(file); } catch { res.writeHead(404); res.end('not found'); return; }
  const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
  const range = req.headers.range;
  if (range && /^(video|audio)\\//.test(type)) {
    const [s, e] = range.replace('bytes=', '').split('-'); const start = +s; const end = e ? +e : st.size - 1;
    res.writeHead(206, { 'content-type': type, 'content-range': \`bytes \${start}-\${end}/\${st.size}\`, 'accept-ranges': 'bytes', 'content-length': end - start + 1 });
    createReadStream(file, { start, end }).pipe(res); return;
  }
  res.writeHead(200, { 'content-type': type, 'content-length': st.size, 'accept-ranges': 'bytes', 'cache-control': 'no-cache' });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(\`rebuild on http://localhost:\${PORT}/\`));
`);
await w('.gitignore', `assets/\n`);
await w('README.md', `# ${TITLE} — local study mirror + own-code 1:1 rebuild

Offline copy of <${URL_ || 'SOURCE URL'}> crawled ${date} with \`scripts/mirror/mirror.mjs\` (STACK, N routes, SIZE, VIDEOS).
The payload (\`files/\`, \`manifest.json\`, \`videos/\`, \`rebuild/assets/\`) is gitignored; this README, \`pages.json\`
and the rebuild source are tracked.

**Why:** (who asked, what for, what will be swapped later)

## The rebuild (\`rebuild/\`)

\`rebuild/index.html\` is a single vanilla file (inline CSS + JS, no framework, no library) that reproduces
the page: (list every component — header/menus/drawers, loader, hero, sliders, pinned sections, reveals,
footer — and every motion: engine, easing, durations, triggers).

\`\`\`powershell
# from homepage/
node ${rel}/assemble.mjs      # parts/* -> index.html
node ${rel}/serve.mjs --port ${PORT}
# -> http://localhost:${PORT}/
\`\`\`

Source lives in \`rebuild/parts/\` (\`body.html\`, \`style.css\`, \`app.js\`, SVGs); \`index.html\` is the assembled
output. Assets come from \`assets.mjs\` (map in \`assets/map.json\`) and are gitignored — re-run before serving
on another machine.

### How the extraction was done (the reusable part)

- **CSS** —
- **Markup** —
- **Fonts** —
- **Behaviour** —
- **Media** —

### Verified ${date}

Against the live page with \`geo.mjs\` (both widths), \`states.mjs\` (menus, drawers, hovers) and \`motion.mjs\`:
document height (REF vs NEW at 1440×900, at 390×844), landmarks within N px, console errors N. Known residue:

## The mirror

\`\`\`powershell
node scripts/mirror/mirror.mjs --start ${URL_ || '<url>'} --out references/<slug>-mirror-${date} --prefix / --max-pages 150
node scripts/mirror/serve.mjs --dir references/<slug>-mirror-${date} --port <port> --origin <origin> --start /
node scripts/mirror/verify.mjs --url http://localhost:<port>/ --shot .scratch/screenshots/<slug>-mirror-home.png
\`\`\`

Verified: \`external requests: []\`, console errors N, notes on --block / --text-replace / --keep-routes.

## What the page does (read for the build)

- Grounds:
- Type:
- Layout:
- Motion:

Local learning copy of someone else's work. **Never publish or deploy any part of this folder.** The client
deliverable is rebuilt in own code with the client's assets.
`);
console.log(`scaffold -> ${rel}  (next: node ${rel}/assemble.mjs; node ${rel}/serve.mjs --port ${PORT})`);
