import http from 'node:http';
import { pathToFileURL } from 'node:url';

export async function startLab({ port = 0 } = {}) {
  let mode = 'vulnerable';
  let nextEventId = 1;
  const events = [];
  const orders = {
    '1': { id: '1', owner: 'Alice', item: 'Notebook', address: '10 Example Lane' },
    '2': { id: '2', owner: 'Bob', item: 'Desk lamp', address: '12 Example Lane' },
  };
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const reply = (status, data) => { res.writeHead(status, { 'Content-Type':'application/json', 'Cache-Control':'no-store' }); res.end(JSON.stringify(data)); };
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store' }); res.end(page); return;
    }
    if (req.method === 'POST' && url.pathname === '/api/mode') {
      let body = '';
      for await (const chunk of req) { body += chunk; if (body.length > 1024) { reply(413,{error:'Body too large'}); return; } }
      try {
        const next = JSON.parse(body).mode;
        if (!['vulnerable','deceptive','fixed'].includes(next)) { reply(400,{error:'Unknown lab mode'}); return; }
        mode = next; reply(200,{mode});
      } catch { reply(400,{error:'Invalid JSON'}); }
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/events') { reply(200,{mode,events}); return; }
    if (req.method === 'GET' && url.pathname === '/api/alerts') {
      const alerts = ['Alice','Bob'].flatMap(actor => {
        const matching = events.filter(e => e.actor === actor && e.decision === 'denied' && e.actor !== e.owner);
        return matching.length >= 3 ? [{actor,rule:'three-denied-cross-account-requests',count:matching.length,eventIds:matching.map(e=>e.id)}] : [];
      });
      reply(200,{alerts,ruleLimit:'Teaching threshold over retained events; no time window, production calibration or accuracy claim.'}); return;
    }
    const match = url.pathname.match(/^\/api\/orders\/([12])$/);
    if (req.method === 'GET' && match) {
      const actor = req.headers['x-lab-user'];
      if (!['Alice','Bob'].includes(actor)) { reply(401,{error:'Select a fictional lab account using X-Lab-User.'}); return; }
      const order = orders[match[1]], crossAccount = actor !== order.owner;
      const denied = mode !== 'vulnerable' && crossAccount;
      const leaked = mode === 'deceptive' && crossAccount;
      events.push({id:nextEventId++,at:new Date().toISOString(),actor,orderId:order.id,owner:order.owner,mode,decision:denied?'denied':'allowed',privateDataReturned:!denied||leaked});
      if (events.length > 200) events.shift();
      reply(denied?403:200, denied ? {error:'Access denied',...(leaked?{order}: {})} : {order}); return;
    }
    reply(404,{error:'Not found'});
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  return {origin:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);})};
}

const page = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The order-access learning lab</title><style>body{max-width:1000px;margin:40px auto;padding:0 24px;background:#f5f5f5;color:#2d3142;font:16px/1.7 'Segoe UI',sans-serif}h1{font:42px/1.2 Georgia,serif}section{background:white;border:1px solid #dcdde1;border-radius:8px;padding:24px;margin:24px 0}label{display:block;margin:14px 0}select,button{font:inherit;padding:8px 12px;border:1px solid #dcdde1;border-radius:6px;background:white;color:inherit}button{cursor:pointer}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.7 Consolas,monospace;background:#f5f5f5;padding:18px}small{color:#4f5d75}a{color:#b94c21}.controls{display:flex;gap:20px;flex-wrap:wrap}</style><h1>Can Alice read Bob’s order?</h1><p>This is a deliberately simplified, fictional local application. The account selector simulates identity; it is not a real login.</p><section><h2>Choose what to test</h2><div class="controls"><label>Website behavior <select id="mode"><option value="vulnerable">Vulnerable: missing ownership check</option><option value="deceptive">Deceptive: refusal label with leaked data</option><option value="fixed">Repaired: enforce ownership</option></select></label><label>Signed in as <select id="actor"><option>Alice</option><option>Bob</option></select></label><label>Requested order <select id="order"><option value="1">Alice’s order #1</option><option value="2">Bob’s order #2</option></select></label></div><button id="request">Request the order</button><h3>Actual response</h3><pre id="result" role="status">Choose an account and order, then make a request.</pre><small>Ask: whose private data came back? A refusal status alone does not answer that.</small></section><section><h2>Observe the event-to-alert pipeline</h2><p>In repaired mode, make three requests for another account’s order. Inspect the recorded decisions and the simple alert rule. The rule checks the decision label, which can itself be misleading in deceptive mode.</p><button id="inspect">Read events and alerts</button><pre id="events">No observations loaded.</pre></section><script>
const byId=id=>document.getElementById(id);
byId('request').onclick=async()=>{await fetch('/api/mode',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:byId('mode').value})});const r=await fetch('/api/orders/'+byId('order').value,{headers:{'X-Lab-User':byId('actor').value}});byId('result').textContent='HTTP '+r.status+'\\n'+JSON.stringify(await r.json(),null,2)};
byId('inspect').onclick=async()=>{const events=await(await fetch('/api/events')).json(),alerts=await(await fetch('/api/alerts')).json();byId('events').textContent=JSON.stringify({events,alerts},null,2)};
</script></html>`;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const lab = await startLab();
  console.log(`Order-access teaching lab: ${lab.origin}`);
  const close = async () => { await lab.close(); process.exit(0); };
  process.once('SIGINT',close); process.once('SIGTERM',close);
}
