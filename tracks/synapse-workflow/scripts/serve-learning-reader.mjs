import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../docs/research');
const port = Number(process.env.NBRET_READER_PORT || 43189);
http.createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = path.resolve(root, '.' + (pathname === '/' ? '/learning/index.html' : pathname));
    if (target !== root && !target.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    const type = {'.html':'text/html; charset=utf-8','.md':'text/plain; charset=utf-8','.json':'application/json','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'}[path.extname(target)] || 'application/octet-stream';
    const data = fs.readFileSync(target);
    res.writeHead(200, {'Content-Type':type,'Cache-Control':'no-store'});
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Research reader: http://127.0.0.1:${port}/`));
