import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { startCapture } from './capture.mjs';
import { inspectWithRea } from './rea.mjs';
const exec = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const safeFailure = phase => ({ phase, code: 'PHASE_FAILED', message: `${phase} failed; raw browser/child-process errors omitted because they may contain input values or credentials.` });

export async function runCapture({ url, outDir, actions = [], rea = true, copy = true, includeScriptSources = false }) {
  const target = new URL(url);
  if (!['http:', 'https:'].includes(target.protocol)) throw new Error('HTTP(S) URL required');
  if (!Array.isArray(actions) || actions.length > 100) throw new Error('actions must be an array of at most 100 steps');
  for (const a of actions) {
    if (!a || !['click', 'fill', 'hover', 'scroll', 'wait'].includes(a.type)) throw new Error('Unsupported action');
    if (['click', 'fill', 'hover'].includes(a.type) && typeof a.selector !== 'string') throw new Error('selector required');
    if (a.type === 'fill' && typeof a.value !== 'string') throw new Error('fill requires string value');
    if (a.type === 'wait' && (!Number.isFinite(a.ms) || a.ms < 0 || a.ms > 10000)) throw new Error('wait must be 0..10000 ms');
    if (a.type === 'scroll' && (!Number.isFinite(a.y) || Math.abs(a.y) > 1000000)) throw new Error('Invalid scroll position');
  }
  const out = resolve(outDir);
  await mkdir(out, { recursive: false }); // never overwrite an earlier capture
  const channel = process.env.NBRET_BROWSER_CHANNEL || (existsSync(chromium.executablePath()) ? undefined : 'chrome');
  const ctx = await chromium.launchPersistentContext(join(out, 'browser-profile'), {
    channel, headless: true, viewport: { width: 1440, height: 900 },
    args: ['--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1'],
  });
  const summary = { schemaVersion: 1, name: 'Network Based Reverse Engineering Tool', startedAt: new Date().toISOString(),
    targetOrigin: target.origin, capture: 'pending', rea: rea ? 'pending' : 'disabled', copy: copy ? 'pending' : 'disabled', errors: [] };
  let evidence, reaResult;
  try {
    const page = ctx.pages()[0] || await ctx.newPage();
    const recorder = await startCapture(page, { outDir: join(out, 'network'), origins: [target.origin], includeScriptSources });
    try {
      recorder.markAction('navigate');
      await page.goto(url, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(300);
      await recorder.snapshot('initial');
      for (const [i, a] of actions.entries()) {
        recorder.markAction(`${i + 1}:${a.type}`); // no field values in action labels
        if (a.type === 'click') await page.locator(a.selector).click({ timeout: 10000 });
        if (a.type === 'hover') await page.locator(a.selector).hover({ timeout: 10000 });
        if (a.type === 'fill') await page.locator(a.selector).fill(a.value, { timeout: 10000 });
        if (a.type === 'scroll') await page.evaluate(y => scrollTo(0, y), a.y);
        if (a.type === 'wait') await page.waitForTimeout(a.ms);
        await page.waitForTimeout(150);
        await recorder.snapshot(`after-${i + 1}`);
      }
      await page.waitForTimeout(500);
      if (rea) {
        try {
          const port = (await readFile(join(out, 'browser-profile', 'DevToolsActivePort'), 'utf8')).split(/\r?\n/)[0];
          if (!/^\d+$/.test(port)) throw new Error('Invalid CDP port');
          const cdp = await ctx.newCDPSession(page);
          const { targetInfo } = await cdp.send('Target.getTargetInfo');
          await cdp.detach();
          const result = await inspectWithRea(`http://127.0.0.1:${port}`, targetInfo.targetId, { includeScriptSources });
          reaResult = result;
          await writeFile(join(out, 'rea.json'), JSON.stringify(result, null, 2));
          summary.rea = 'captured';
        } catch { summary.rea = 'failed'; summary.errors.push(safeFailure('rea')); }
      }
    } finally { evidence = await recorder.finish(); summary.capture = 'captured'; }
  } catch { summary.capture = 'failed'; summary.errors.push(safeFailure('capture')); }
  finally { await ctx.close(); }
  if (copy && summary.capture === 'captured') {
    try {
      await exec(process.execPath, [join(root, 'copy', 'extract.mjs'), '--url', url, '--out', join(out, 'copy'), '--wait', '300'],
        { cwd: root, timeout: 180000, maxBuffer: 8 * 1024 * 1024, windowsHide: true });
      summary.copy = 'extracted';
    } catch { summary.copy = 'failed'; summary.errors.push(safeFailure('copy')); }
  }
  summary.finishedAt = new Date().toISOString();
  const reaScripts = reaResult?.data?.normalized_result?.scripts?.items || [];
  const links = (evidence?.requests || []).map(request => ({
    requestId: request.requestId, hop: request.hop, actionId: request.actionId,
    url: request.request.url,
    scripts: (request.initiator.frames || []).map(frame => {
      const script = evidence.scripts.find(s => s.url === frame.url);
      const matches = reaScripts.filter(s => s.url === frame.url);
      return { ...frame, networkScriptId: script?.scriptId, networkScriptFile: script?.file,
        reaScriptKeys: matches.map(s => s.script_key),
        sha256Match: !!script?.sha256 && matches.some(s => s.source?.artifact?.sha256 === script.sha256),
        matchBasis: 'URL; SHA256 additionally compared when source available. Not proof of causal equivalence.' };
    }),
  }));
  await writeFile(join(out, 'links.json'), JSON.stringify({ requests: links }, null, 2));
  summary.counts = { requests: evidence?.requests.length || 0, scripts: evidence?.scripts.length || 0, actions: evidence?.actions.length || 0 };
  summary.networkCoverage = { dropped: evidence?.dropped || {}, errors: evidence?.errors.length || 0,
    unavailableBodies: evidence?.requests.filter(r => r.body?.unavailable).length || 0,
    pendingRequests: evidence?.requests.filter(r => !r.finished && !r.failure && !r.redirected).length || 0 };
  summary.reaCompleteness = reaResult?.data?.normalized_result?.completeness || null;
  summary.limitations = [
    'Action association is temporal, not proof of causality.',
    'REA runs after the actions on the same page; COPY runs in separate fresh browser contexts.',
    'No server-side source, arbitrary process memory or original-source equivalence is claimed.',
    'Fresh profile only. COPY output, optional raw scripts and browser profile can contain sensitive page data; never commit runs.',
  ];
  await writeFile(join(out, 'summary.json'), JSON.stringify(summary, null, 2));
  await writeFile(join(out, 'REPORT.md'), `# NBRET evidence\n\nOrigin: ${target.origin}\n\n` +
    `- Network: ${summary.capture} (${summary.counts.requests} requests)\n- REA: ${summary.rea}\n- COPY: ${summary.copy}\n\n` +
    'Read network/evidence.json for paired inputs/outputs, initiator frames, actions and snapshots. links.json matches initiator URLs/source hashes to REA script evidence. Read rea.json for REA observations and copy/ for per-viewport DOM/CSS/assets.\n\n' +
    summary.limitations.map(x => '- ' + x).join('\n') + '\n');
  return summary;
}
