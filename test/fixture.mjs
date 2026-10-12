import { createServer } from 'node:http';
export async function startFixture() {
  const server = createServer(async (req, res) => {
    if (req.url === '/app.js') {
      res.setHeader('Content-Type', 'text/javascript');
      res.end(`document.querySelector('#calculate').onclick = async () => {
        const a = Number(document.querySelector('#a').value);
        const b = Number(document.querySelector('#b').value);
        const response = await fetch('/sum', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({a,b})});
        const data = await response.json();
        document.querySelector('#result').textContent = String(data.result);
        localStorage.setItem('lastResult',String(data.result));
        const cache = await caches.open('demo-results');
        await cache.put('/last-result', new Response(JSON.stringify(data)));
      };`); return;
    }
    if (req.url === '/sum' && req.method === 'POST') {
      const chunks = []; for await (const c of req) chunks.push(c);
      const { a, b } = JSON.parse(Buffer.concat(chunks).toString());
      res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ result: a + b })); return;
    }
    if (req.url !== '/') { res.writeHead(404); res.end('Not Found'); return; }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>NBRET fixture</title><style>body{font:20px sans-serif;padding:24px}input{width:100px}output{display:block;margin-top:20px}</style><main><h1>NBRET 通信デモ</h1><input id="a" value="20" aria-label="A"><input id="b" value="5" aria-label="B"><button id="calculate">計算</button><output id="result">未実行</output></main><script src="/app.js"></script></html>');
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { url: `http://127.0.0.1:${server.address().port}/`, close: () => new Promise(resolve => server.close(resolve)) };
}
