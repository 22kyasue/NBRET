import http from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';

const users = {
  alice: { id: 'alice', principal: 'alice', name: 'Alice Morgan', tenant: 'north', organization: 'Northline Studio', role: 'member' },
  bob: { id: 'bob', principal: 'bob', name: 'Bob Chen', tenant: 'south', organization: 'Southbank Works', role: 'member' },
  carol: { id: 'carol', principal: 'carol', name: 'Carol Reed', tenant: 'north', organization: 'Northline Studio', role: 'approver' },
  dana: { id: 'dana', principal: 'dana', name: 'Dana Park', tenant: 'south', organization: 'Southbank Works', role: 'approver' },
};
const freshOrders = () => ['north', 'south'].flatMap((tenant, index) => [
  { id: `WO-${index ? 'S201' : 'N101'}`, tenant, title: 'Refresh meeting room signage', category: 'Workplace', state: 'draft', priority: 'Normal', owner: index ? 'bob' : 'alice', description: 'Prepare the fictional studio wayfinding update. Review the scope, then submit for approval.', budget: 480 },
  { id: `WO-${index ? 'S202' : 'N102'}`, tenant, title: 'Quarterly equipment service', category: 'Maintenance', state: 'submitted', priority: 'High', owner: index ? 'bob' : 'alice', description: 'Routine maintenance for the demo team’s shared equipment. Ready for an approver to review.', budget: 1250 },
  { id: `WO-${index ? 'S203' : 'N103'}`, tenant, title: 'Welcome kit replenishment', category: 'Supplies', state: 'approved', priority: 'Normal', owner: index ? 'bob' : 'alice', description: 'A completed example of the ordinary approval flow. All information is synthetic.', budget: 320 },
]);
const secret = () => randomBytes(32).toString('base64url');
const equal = (a, b) => typeof a === 'string' && typeof b === 'string' && Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const cookie = (name, value, age = 3600) => `${name}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}`;
function cookies(req) {
  const result = Object.create(null);
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('='); if (i > 0) { const key = part.slice(0, i).trim(); if (Object.hasOwn(result, key)) return {}; result[key] = part.slice(i + 1).trim(); }
  }
  return result;
}
async function body(req) {
  if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw Object.assign(new Error('JSON required'), { status: 415 });
  if (req.headers['content-encoding'] && req.headers['content-encoding'] !== 'identity') throw Object.assign(new Error('Unsupported encoding'), { status: 415 });
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > 2048) throw Object.assign(new Error('Body too large'), { status: 413 }); chunks.push(chunk); }
  let value; try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Object.assign(new Error('JSON object required'), { status: 400 });
  return value;
}

// Read descriptors before values: checkpoint input must be inert ordinary data.
function dataFields(value, allowed) {
  if (!value || typeof value !== 'object' || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new Error('Invalid practice configuration');
  const keys = Reflect.ownKeys(value), result = {};
  if (keys.length > allowed.length) throw new Error('Invalid practice configuration');
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!allowed.includes(key) || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) throw new Error('Invalid practice configuration');
    result[key] = descriptor.value;
  }
  return result;
}
function restoreOrders(value) {
  const expected = freshOrders();
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype || Reflect.ownKeys(value).length !== 7 || Object.getOwnPropertyDescriptor(value, 'length').value !== 6) throw new Error('Invalid practice orders');
  const seen = new Set();
  const restored = expected.map((_, index) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) throw new Error('Invalid practice orders');
    const fields = Object.keys(expected[0]), record = dataFields(descriptor.value, fields);
    if (Object.keys(record).length !== fields.length) throw new Error('Invalid practice orders');
    const original = expected.find(order => order.id === record.id);
    if (!original || seen.has(record.id) || !['draft', 'submitted', 'approved'].includes(record.state)) throw new Error('Invalid practice orders');
    seen.add(record.id);
    for (const field of fields) if (field !== 'state' && record[field] !== original[field]) throw new Error('Invalid practice orders');
    return { ...original, state: record.state };
  });
  return restored;
}
export async function startPracticeApp(options = {}) {
  if (arguments.length > 1) throw new Error('Invalid practice configuration');
  const config = dataFields(options, ['port', 'initialOrders']);
  const port = Object.hasOwn(config, 'port') ? config.port : 0;
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid loopback port');
  const orders = Object.hasOwn(config, 'initialOrders') ? restoreOrders(config.initialOrders) : freshOrders();
  const tokens = { alice: secret(), bob: secret() }, sessions = new Map(), requestLog = [];
  for (const id of ['alice', 'bob']) sessions.set(tokens[id], { id, expires: Infinity });
  const nonce = secret(); let url;
  const server = http.createServer({ maxHeaderSize: 8192, requestTimeout: 5000, headersTimeout: 5000 }, async (req, res) => {
    res.setHeader('cache-control', 'no-store'); res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('referrer-policy', 'no-referrer'); res.setHeader('x-frame-options', 'DENY');
    res.setHeader('content-security-policy', `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`);
    const json = (status, value) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(value)); };
    try {
      if (req.headers.host !== new URL(url).host) return json(421, { error: 'Loopback host required' });
      if (!req.url || req.url.length > 256 || !req.url.startsWith('/') || req.url.startsWith('//') || req.url.includes('?') || req.url.includes('#')) return json(400, { error: 'Invalid route' });
      if (!['GET', 'POST'].includes(req.method)) { res.setHeader('allow', 'GET, POST'); return json(405, { error: 'Method not allowed' }); }
      const c = cookies(req), authorization = req.headers.authorization;
      const bearer = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
      const session = sessions.get(authorization ? bearer : c.practice_session);
      const profile = session && session.expires > Date.now() ? users[session.id] : null;
      if (requestLog.length < 10000) requestLog.push({ method: req.method, path: req.url, actorId: profile?.id || null });
      if (req.method === 'POST') {
        if (req.headers.origin !== url || ['cross-site', 'same-site'].includes(req.headers['sec-fetch-site'])) return json(403, { error: 'Same-origin request required' });
        if (!(bearer && profile) && (!/^[A-Za-z0-9_-]{43}$/.test(c.practice_csrf || '') || !equal(c.practice_csrf, req.headers['x-csrf-token']))) return json(403, { error: 'CSRF token required' });
      }
      if (req.method === 'GET' && req.url === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(html(nonce)); }
      if (req.method === 'GET' && req.url === '/api/csrf') { const csrf = secret(); res.setHeader('set-cookie', cookie('practice_csrf', csrf)); return json(200, { csrf }); }
      if (req.method === 'POST' && req.url === '/api/session') {
        const input = await body(req);
        if (Object.keys(input).length !== 1 || typeof input.user !== 'string' || !Object.hasOwn(users, input.user)) return json(400, { error: 'Choose a fictional demo user' });
        for (const [token, value] of sessions) if (value.expires !== Infinity && value.expires <= Date.now()) sessions.delete(token);
        if (sessions.size >= 256) return json(429, { error: 'Demo session limit reached; restart the app' });
        if (c.practice_session && sessions.get(c.practice_session)?.expires !== Infinity) sessions.delete(c.practice_session);
        const token = secret(); sessions.set(token, { id: input.user, expires: Date.now() + 3600000 });
        res.setHeader('set-cookie', cookie('practice_session', token)); return json(200, { profile: users[input.user] });
      }
      if (req.method === 'POST' && req.url === '/api/logout') { const input = await body(req); if (Object.keys(input).length) return json(400, { error: 'Empty object required' }); if (c.practice_session && sessions.get(c.practice_session)?.expires !== Infinity) sessions.delete(c.practice_session); res.setHeader('set-cookie', cookie('practice_session', '', 0)); return json(200, { signedOut: true }); }
      if (req.url.startsWith('/api/')) {
        if (!profile) return json(401, { error: 'Authentication required' });
        if (req.method === 'GET' && req.url === '/api/me') return json(200, { profile });
        if (req.method === 'GET' && req.url === '/api/work-orders') return json(200, { orders: orders.filter(o => o.tenant === profile.tenant) });
        const match = /^\/api\/work-orders\/(WO-[NS][0-9]{3})(?:\/(submit|approve))?$/.exec(req.url);
        if (match) {
          const order = orders.find(o => o.id === match[1] && o.tenant === profile.tenant);
          if (!order) return json(404, { error: 'Work order not found' });
          if (req.method === 'GET' && !match[2]) return json(200, { order });
          if (req.method === 'POST' && match[2]) {
            const input = await body(req); if (Object.keys(input).length) return json(400, { error: 'Empty object required' });
            const submit = match[2] === 'submit';
            if (submit ? profile.role !== 'member' || order.owner !== profile.id : profile.role !== 'approver') return json(403, { error: 'Role does not permit this action' });
            if (order.state !== (submit ? 'draft' : 'submitted')) return json(409, { error: 'Work order is not in the required state' });
            order.state = submit ? 'submitted' : 'approved'; return json(200, { order });
          }
        }
      }
      return json(404, { error: 'Route not found' });
    } catch (error) { if (!res.headersSent) json(error.status || 400, { error: error.status ? error.message : 'Request could not be processed' }); else res.end(); }
  });
  server.maxConnections = 64; server.keepAliveTimeout = 1000; server.timeout = 5000;
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  url = `http://127.0.0.1:${server.address().port}`;
  let closed;
  return { url, tokens: { ...tokens }, requestLog, snapshotOrders: () => orders.map(order => ({ ...order })), isListening: () => server.listening, identities: Object.fromEntries(['alice', 'bob'].map(id => [id, { principal: id, tenant: users[id].tenant, role: users[id].role }])),
    close: () => closed ||= new Promise((resolve, reject) => { server.close(error => { sessions.clear(); error ? reject(error) : resolve(); }); server.closeAllConnections(); }) };
}

function html(nonce) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synapse Practice Workspace</title><style nonce="${nonce}">
  :root{color-scheme:light dark;--bg:#f5f6f8;--panel:#fff;--text:#1a2333;--muted:#647083;--line:#e4e8ee;--accent:#345de3;--soft:#eaf0ff}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,select{font:inherit}button{cursor:pointer}button:disabled{cursor:wait;opacity:.6}button:focus-visible,select:focus-visible{outline:3px solid #7d9aff;outline-offset:3px}button,select{border:1px solid var(--line);border-radius:9px;padding:9px 13px;background:var(--panel);color:var(--text)}.primary{background:var(--accent);border-color:var(--accent);color:white}.shell{max-width:1250px;margin:auto;display:grid;grid-template-columns:210px 1fr;min-height:100vh}aside{padding:32px 24px;border-right:1px solid var(--line);display:flex;flex-direction:column;gap:36px}.brand{font-size:19px;font-weight:750;letter-spacing:-.7px}.mark{display:inline-grid;place-items:center;width:28px;height:28px;background:var(--text);color:var(--panel);border-radius:8px;margin-right:8px}.nav{padding:11px 12px;border-radius:9px;background:var(--soft);color:var(--accent);font-weight:600}.side-note{margin-top:auto;color:var(--muted);font-size:12px}main{padding:28px 40px}.top{display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid var(--line);padding-bottom:24px}.eyebrow{color:var(--muted);font-size:12px}.identity{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.warning{margin:24px 0;padding:12px 16px;background:var(--soft);border:1px solid var(--line);border-radius:10px;color:var(--muted);font-size:12px}.heading{display:flex;justify-content:space-between;align-items:center;margin:30px 0 24px}h1{font-size:32px;line-height:1.2;letter-spacing:-1px;margin:5px 0 8px}p{margin:0;color:var(--muted)}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:26px}.stat{border:1px solid var(--line);border-radius:13px;padding:20px;background:var(--panel)}.stat span{display:block;font-size:12px;color:var(--muted)}.stat strong{display:block;font-size:29px;margin-top:8px;letter-spacing:-1px}.board{border:1px solid var(--line);border-radius:14px;background:var(--panel);overflow:hidden}.board-head{padding:19px 22px;display:flex;justify-content:space-between;border-bottom:1px solid var(--line);font-weight:600}.row{display:grid;grid-template-columns:minmax(180px,1fr) 100px 85px 100px;align-items:center;gap:16px;padding:20px 22px;border-bottom:1px solid var(--line)}.row:last-child{border:0}.order-id{color:var(--muted);font-size:11px;letter-spacing:.4px}.order-title{font-weight:600;margin:3px 0}.order-desc{font-size:12px;color:var(--muted);max-width:480px}.badge{font-size:11px;display:inline-block;width:fit-content;border-radius:6px;padding:4px 8px;background:var(--bg);text-transform:capitalize}.badge.approved{background:#e4f4ea;color:#21653d}.badge.submitted{background:var(--soft);color:var(--accent)}.amount{font-variant-numeric:tabular-nums;color:var(--muted)}.empty{padding:60px 24px;text-align:center}.empty h2{font-size:20px;margin:0 0 10px}.guide{margin-top:22px;color:var(--muted);font-size:12px}.guide strong{color:var(--text)}#message{min-height:24px;margin:12px 0;color:var(--accent)}.theme{padding:7px 10px}html[data-theme=dark]{color-scheme:dark;--bg:#11151d;--panel:#191f2a;--text:#e8ecf4;--muted:#9ca9bd;--line:#2b3443;--accent:#8caaff;--soft:#222e48}@media(prefers-color-scheme:dark){html:not([data-theme=light]){color-scheme:dark;--bg:#11151d;--panel:#191f2a;--text:#e8ecf4;--muted:#9ca9bd;--line:#2b3443;--accent:#8caaff;--soft:#222e48}}@media(max-width:800px){.shell{grid-template-columns:1fr}aside{padding:16px 22px;border-right:0;border-bottom:1px solid var(--line);flex-direction:row;gap:20px;align-items:center}.side-note{display:none}.nav{font-size:12px}main{padding:22px}.top{align-items:flex-start;flex-direction:column}.row{grid-template-columns:1fr 100px}.row .amount{display:none}.row .badge{justify-self:end}.row button{grid-column:2;justify-self:end}.stats{gap:8px}.stat{padding:14px}.heading{margin-top:22px}h1{font-size:28px}.board-head{font-size:12px}}
  </style></head><body><div class="shell"><aside><div class="brand"><span class="mark">S</span>synapse</div><div class="nav">▦ &nbsp; Work orders</div><div class="side-note">LOCAL WORKSPACE<br>Ephemeral synthetic data<br>Restart to reset everything.</div></aside><main><header class="top"><div><strong>Practice workspace</strong><div class="eyebrow" id="organization">Choose a fictional team to begin</div></div><div class="identity"><label for="user" class="eyebrow">Demo user</label><select id="user"><option value="alice">Alice · Northline · Member</option><option value="carol">Carol · Northline · Approver</option><option value="bob">Bob · Southbank · Member</option><option value="dana">Dana · Southbank · Approver</option></select><button id="signIn" class="primary">Sign in</button><button id="signOut" hidden>Sign out</button><button id="theme" class="theme" aria-label="Toggle color theme">◐</button></div></header><div class="warning"><strong>Guided demo · not a blind evaluation.</strong> Fictional accounts, ordinary workflow, no planted vulnerabilities. This workspace demonstrates application behavior, not discovery capability.</div><section class="heading"><div><div class="eyebrow">OPERATIONS / WORK ORDERS</div><h1>Keep good work moving.</h1><p id="subtitle">A small workspace for requests, reviews and approvals.</p></div></section><div class="stats"><div class="stat"><span>Drafts</span><strong id="draftCount">—</strong></div><div class="stat"><span>Awaiting approval</span><strong id="submittedCount">—</strong></div><div class="stat"><span>Approved</span><strong id="approvedCount">—</strong></div></div><div id="message" role="status" aria-live="polite"></div><section class="board"><div class="board-head"><span>Team work orders</span><span id="total" class="eyebrow">Sign in to view</span></div><div id="orders"><div class="empty"><h2>A clear view of your team’s work.</h2><p>Sign in as Alice or Bob to submit a draft.<br>Switch to the same team’s approver to approve it.</p></div></div></section><p class="guide"><strong>Try the normal flow:</strong> Alice → submit draft → Carol → approve. Bob and Dana have a separate fictional organization. All changes disappear when this server restarts.</p></main></div><script nonce="${nonce}">
  let csrf='',profile=null;const $=id=>document.getElementById(id);async function api(path,method='GET',data){const r=await fetch(path,{method,credentials:'same-origin',headers:method==='POST'?{'content-type':'application/json','x-csrf-token':csrf}:{},...(data?{body:JSON.stringify(data)}:{})});const value=await r.json();if(!r.ok)throw new Error(value.error||'Request failed');return value}
  function node(tag,text,cls){const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n}async function load(){try{profile=(await api('/api/me')).profile}catch{profile=null} $('signOut').hidden=!profile;$('signIn').textContent=profile?'Switch user':'Sign in';$('organization').textContent=profile?profile.organization+' / '+profile.name:'Choose a fictional team to begin';if(!profile){$('subtitle').textContent='A small workspace for requests, reviews and approvals.';$('orders').replaceChildren(node('div','Sign in to view fictional team work orders.','empty'));for(const s of ['draft','submitted','approved'])$(s+'Count').textContent='—';$('total').textContent='Sign in to view';return}$('user').value=profile.id;const orders=(await api('/api/work-orders')).orders;$('subtitle').textContent=profile.name+' · '+profile.role+' · '+profile.organization;for(const s of ['draft','submitted','approved'])$(s+'Count').textContent=orders.filter(o=>o.state===s).length;$('total').textContent=orders.length+' records';$('orders').replaceChildren();for(const o of orders){const row=node('div','','row'),info=node('div','');info.append(node('div',o.id+' · '+o.category,'order-id'),node('div',o.title,'order-title'),node('div',o.description,'order-desc'));row.append(info,node('span',o.state,'badge '+o.state),node('span','$'+o.budget.toLocaleString(),'amount'));const action=o.state==='draft'&&profile.role==='member'&&o.owner===profile.id?'submit':o.state==='submitted'&&profile.role==='approver'?'approve':null;if(action){const b=node('button',action==='submit'?'Submit →':'Approve');b.addEventListener('click',()=>busy(b,async()=>{await api('/api/work-orders/'+o.id+'/'+action,'POST',{});await load();$('message').textContent=o.id+(action==='submit'?' submitted for review.':' approved.')}));row.append(b)}else row.append(node('span',o.state==='approved'?'Complete':'View only','eyebrow'));$('orders').append(row)}}
  async function busy(button,fn){button.disabled=true;$('message').textContent='';try{await fn()}catch(e){$('message').textContent=e.message}finally{button.disabled=false}}$('signIn').onclick=()=>busy($('signIn'),async()=>{csrf=(await api('/api/csrf')).csrf;await api('/api/session','POST',{user:$('user').value});await load()});$('signOut').onclick=()=>busy($('signOut'),async()=>{await api('/api/logout','POST',{});await load();$('message').textContent='Signed out.'});$('theme').onclick=()=>{const dark=document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=dark?'light':'dark'};(async()=>{csrf=(await api('/api/csrf')).csrf;await load()})().catch(e=>{$('message').textContent=e.message});
  </script></body></html>`;
}
