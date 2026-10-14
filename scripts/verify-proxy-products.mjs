import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, readdir, open } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
import { startFixture } from '../test/fixture.mjs';
import { runCapture } from '../src/run.mjs';

const root = resolve(`runs/proxy-products-${Date.now()}`), tooling = resolve('runs/tooling');
await mkdir(root);
const exec = promisify(execFile);
const reservePort = async () => { const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r)); const port = server.address().port; await new Promise(r => server.close(r)); return port; };
const wait = ms => new Promise(r => setTimeout(r, ms));
const fixture = await startFixture();
const receipts = [];
try {
  for (const product of ['mitmproxy', 'zap']) {
    const dir = join(root, product); await mkdir(dir);
    const port = await reservePort(), proxy = `http://127.0.0.1:${port}`;
    const log = await open(join(dir, 'process.log'), 'wx'), key = randomBytes(24).toString('hex');
    let child;
    try {
      if (product === 'mitmproxy') {
        child = spawn(join(tooling, 'mitm-venv/Scripts/mitmdump.exe'), ['--listen-host','127.0.0.1','--listen-port',String(port),'--set',`confdir=${join(dir,'config')}`,'--set','block_global=true','-s',resolve('scripts/mitm-receipt.py')],
          { windowsHide: true, stdio: ['ignore', log.fd, log.fd], env: { ...process.env, NBRET_MITM_RECEIPT: join(dir, 'flows.jsonl') } });
      } else {
        const unpacked = join(tooling, 'zap-minimal');
        await mkdir(unpacked, { recursive: true });
        await exec('C:/Users/kotar/AppData/Local/Programs/Python/Python312/python.exe',['-c',
          'import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); [z.extract(n,sys.argv[2]) for n in z.namelist() if "/plugin/" not in n or n.endswith("/") or any("/"+a+"-" in n for a in ["network","callhome"])]',join(tooling,'ZAP_2.17.0_Crossplatform.zip'),unpacked],{windowsHide:true});
        const home = join(unpacked, (await readdir(unpacked)).find(x=>x.startsWith('ZAP_')));
        const jar = (await readdir(home)).find(x=>/^zap-.*\.jar$/.test(x));
        child = spawn('C:/Users/kotar/AppData/Local/Programs/BurpSuite/jre/bin/java.exe', ['-Xmx512m','-jar',join(home,jar),'-daemon','-silent','-host','127.0.0.1','-port',String(port),'-dir',join(dir,'config'),'-config',`api.key=${key}`,'-config','autoupdate.checkOnStart=false','-config','autoupdate.downloadNewRelease=false'],{windowsHide:true,cwd:home,stdio:['ignore',log.fd,log.fd]});
      }
      child.on('error', () => {});
      let ready = false;
      for (let attempt = 0; attempt < 90; attempt++) {
        if (child.exitCode !== null) throw new Error(`${product} exited before readiness; see local process log`);
        try {
          if (product === 'zap') ready = (await fetch(`${proxy}/JSON/core/view/version/?apikey=${key}`, { signal: AbortSignal.timeout(1000) })).ok;
          else { const net = await import('node:net'); ready = await new Promise(r=>{const s=net.connect(port,'127.0.0.1',()=>{s.destroy();r(true);});s.on('error',()=>r(false));s.setTimeout(1000,()=>{s.destroy();r(false);});}); }
        } catch {}
        if (ready) break; await wait(500);
      }
      if (!ready) throw new Error(`${product} readiness timed out`);
      if (product === 'zap') {
        const mode = await (await fetch(`${proxy}/JSON/core/action/setMode/?mode=safe&apikey=${key}`)).json();
        assert.equal(mode.Result, 'OK');
      }
      const capture = await runCapture({ url: fixture.url, proxy, outDir: join(dir,'capture'), rea:false, copy:true, copyMode:'same-state', retainProfile:false, actions:[{type:'click',selector:'#calculate'}],expectations:[{selector:'#result',text:'25'}] });
      assert.equal(capture.errors.length,0,JSON.stringify(capture.errors));
      let independent;
      if (product === 'mitmproxy') {
        independent=(await readFile(join(dir,'flows.jsonl'),'utf8')).trim().split('\n').map(JSON.parse);
        assert.ok(independent.some(x=>x.path==='/sum'&&x.result===25&&x.status===200));
      } else {
        const response = await fetch(`${proxy}/JSON/core/view/messages/?baseurl=${encodeURIComponent(fixture.url)}&start=0&count=100&apikey=${key}`);
        const history = await response.json();
        assert.ok(history.messages?.some(x=>x.requestHeader.includes('POST ')&&JSON.parse(x.responseBody).result===25));
        independent=history.messages.map(x=>({requestLine:x.requestHeader.split('\r\n')[0],statusLine:x.responseHeader.split('\r\n')[0],...(x.requestHeader.startsWith('POST ')?{result:JSON.parse(x.responseBody).result}:{})}));
      }
      const version = product==='mitmproxy' ? (await exec(join(tooling,'mitm-venv/Scripts/mitmdump.exe'),['--version'],{windowsHide:true})).stdout.trim() : (await (await fetch(`${proxy}/JSON/core/view/version/?apikey=${key}`)).json()).version;
      await writeFile(join(dir,'history.json'),JSON.stringify(independent,null,2));
      receipts.push({product,version,proxy,result:25,sameStateCopy:capture.copy,independentlyMatched:true});
    } finally {
      if (child && child.exitCode===null) { child.kill(); await Promise.race([new Promise(r=>child.once('exit',r)),wait(5000)]); }
      await log.close();
    }
  }
  await writeFile(join(root,'receipt.json'),JSON.stringify({root,receipts,scope:'Owned temporary processes and loopback fixture only; no scans or system trust changes.'},null,2));
  console.log(JSON.stringify({root,receipts},null,2));
} finally { await fixture.close(); }
