import { createServer } from 'node:http';

export async function startAppFixture() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://fixture');
    const authorized = /(?:^|;\s*)fixture-auth=yes(?:;|$)/.test(req.headers.cookie || '');
    const json = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
    if (url.pathname === '/api/login' && req.method === 'POST') {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const data = JSON.parse(Buffer.concat(chunks).toString());
      if (data.username !== 'demo' || data.password !== 'fixture-password') { json(401, { error: 'Sign in' }); return; }
      res.setHeader('Set-Cookie', 'fixture-auth=yes; HttpOnly; SameSite=Lax; Path=/');
      json(200, { user: 'demo' }); return;
    }
    if (url.pathname.startsWith('/api/')) {
      if (!authorized) { json(401, { error: 'Sign in' }); return; }
      if (url.pathname === '/api/session') { json(200, { user: 'demo' }); return; }
      if (url.pathname === '/api/fail') { json(503, { error: 'Try again' }); return; }
      if (url.pathname === '/api/empty') { json(200, { items: [] }); return; }
      if (url.pathname === '/api/items') { json(200, { items: url.searchParams.get('page') === '2' ? ['Gamma'] : ['Alpha', 'Beta'] }); return; }
      json(404, { error: 'Not found' }); return;
    }
    if (!['/', '/items'].includes(url.pathname)) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', 'text/html');
    res.end(`<!doctype html><style>body{font:20px sans-serif;padding:24px}</style>
      <input id="username"><input id="password" type="password"><button id="login">Sign in</button>
      <button id="load">Load</button><button id="next">Next</button><button id="empty">Empty</button><button id="fail">Fail</button><button id="reload">Reload</button>
      <p id="user"></p><p id="error" hidden></p><p id="empty-state" hidden>No items</p><p id="route"></p><ul id="items"></ul>
      <script>
      const q=s=>document.querySelector(s);
      async function load(path='/api/items?page=1'){
        const response=await fetch(path),data=await response.json();
        q('#error').hidden=response.ok;q('#error').textContent=data.error||'';
        q('#items').replaceChildren(...(data.items||[]).map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
        q('#empty-state').hidden=!response.ok||(data.items||[]).length!==0;
        if(response.ok)localStorage.setItem('lastList',JSON.stringify(data.items));
      }
      q('#login').onclick=async()=>{const response=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:q('#username').value,password:q('#password').value})});const data=await response.json();if(response.ok){q('#user').textContent='Welcome '+data.user;await load()}else{q('#error').textContent=data.error;q('#error').hidden=false}};
      q('#load').onclick=()=>load();
      q('#next').onclick=()=>{history.pushState({},'', '/items?page=2');q('#route').textContent=location.pathname+location.search;load('/api/items?page=2')};
      q('#empty').onclick=()=>load('/api/empty');q('#fail').onclick=()=>load('/api/fail');q('#reload').onclick=()=>location.reload();
      fetch('/api/session').then(r=>r.json()).then(data=>{if(data.user){q('#user').textContent='Welcome '+data.user;load('/api/items?page='+(new URLSearchParams(location.search).get('page')||'1'))}});
      </script>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${server.address().port}/`, close: () => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); } };
}

export function appScenarios(url) {
  const login = [
    { type: 'fill', selector: '#username', value: 'demo' },
    { type: 'fill', selector: '#password', value: 'fixture-password' },
    { type: 'click', selector: '#login' },
  ];
  const scenario = (id, actions, expectations) => ({ id, url, profile: 'behavior', actions, expectations });
  return { schemaVersion: 1, scenarios: [
    scenario('unauthenticated', [{ type: 'click', selector: '#load' }], [{ selector: '#error', text: 'Sign in', visible: true }]),
    scenario('login', login, [{ selector: '#user', text: 'Welcome demo' }, { selector: '#items li', count: 2 }]),
    scenario('pagination-spa', [...login, { type: 'click', selector: '#next' }], [{ selector: '#items li', text: 'Gamma' }, { selector: '#route', text: '/items?page=2' }]),
    scenario('empty', [...login, { type: 'click', selector: '#empty' }], [{ selector: '#items li', count: 0 }, { selector: '#empty-state', visible: true }]),
    scenario('server-failure', [...login, { type: 'click', selector: '#fail' }], [{ selector: '#error', text: 'Try again', visible: true }]),
    scenario('reload-persistence', [...login, { type: 'click', selector: '#reload' }], [{ selector: '#user', text: 'Welcome demo' }, { selector: '#items li', count: 2 }]),
  ] };
}
