import { chromium } from 'playwright';
import { mkdir, readFile, writeFile, realpath, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { performance } from 'node:perf_hooks';
import { randomUUID } from 'node:crypto';
import { startCapture } from './capture.mjs';
import { inspectWithRea } from './rea.mjs';
import { proxyOptions } from './investigation.mjs';
import { captureVisualState } from './visual.mjs';
import { localResponses, installLocalResponses } from './responses.mjs';
import { validateExpectations, checkExpectations } from './expectations.mjs';
import { measureArtifacts } from './metrics.mjs';
import { startStateExtraction } from './extraction.mjs';
import { readSession, applySession, saveSession } from './sessions.mjs';
import { startTargetCapture } from './targets.mjs';
import { readEvidence } from './evidence.mjs';
import { validateMotion, captureMotion } from './motion.mjs';
const exec = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
let versions;
const toolVersions = () => versions ||= Promise.all(['playwright', 'rea-agents'].map(async name => {
  try { return [name, JSON.parse(await readFile(join(root, 'node_modules', name, 'package.json'), 'utf8')).version]; }
  catch { return [name, null]; }
})).then(Object.fromEntries);
const safeFailure = phase => ({ phase, code: 'PHASE_FAILED', message: `${phase} failed; raw browser/child-process errors omitted because they may contain input values or credentials.` });

export function captureOrigins(url, extra = []) {
  if (!Array.isArray(extra) || extra.length > 50) throw new Error('origins must be an array of at most 50 HTTP(S) origins');
  const target = new URL(url);
  if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password) throw new Error('HTTP(S) URL without credentials required');
  return [...new Set([target.origin, ...extra.map(value => {
    const u = new URL(value);
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || u.pathname !== '/' || u.search || u.hash) throw new Error('Additional scope must be an HTTP(S) origin without credentials, path, query or fragment');
    return u.origin;
  })])];
}

export async function runCapture({ url, outDir, actions = [], rea = true, copy = true, includeScriptSources = false, proxy, proxyInsecure = false, origins = [], scenarioId = 'default', visual = false, responses = [], visualCheckpoints = 'all', includeStreamPayloads = false, expectations = [], retainProfile = true, copyMode = 'separate', sessionIn, sessionOut, captureTargets = false, motion, viewport = { width: 1440, height: 900 }, reducedMotion = 'no-preference', assetStore }) {
  const started = performance.now();
  const startedAt = new Date().toISOString();
  const phaseMs = {};
  const allowedOrigins = captureOrigins(url, origins);
  const motionConfig = validateMotion(motion, url);
  if (!Number.isInteger(viewport.width) || !Number.isInteger(viewport.height) || viewport.width < 200 || viewport.width > 4000 || viewport.height < 100 || viewport.height > 4000) throw new Error('Viewport must be within 200..4000 by 100..4000');
  if (!['reduce', 'no-preference'].includes(reducedMotion)) throw new Error('Invalid reduced-motion preference');
  const imported = sessionIn ? await readSession(sessionIn, allowedOrigins) : null;
  if (sessionIn && sessionOut && resolve(sessionIn) === resolve(sessionOut)) throw new Error('Session export must not overwrite its input');
  if (typeof retainProfile !== 'boolean') throw new Error('retainProfile must be boolean');
  if (!['same-state', 'separate'].includes(copyMode)) throw new Error('copyMode must be same-state or separate');
  if (imported && copy && copyMode === 'separate') throw new Error('Imported sessions require same-state COPY or COPY disabled');
  validateExpectations(expectations);
  if (!['all', 'final'].includes(visualCheckpoints)) throw new Error('visualCheckpoints must be all or final');
  const overrides = localResponses(url, responses);
  if (overrides.length && (rea || copy || proxy)) throw new Error('Local response experiments require REA/COPY disabled and no proxy to avoid mixing altered and direct observations');
  if (typeof scenarioId !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(scenarioId)) throw new Error('scenarioId must be a non-sensitive identifier of 1..80 letters, digits, dots, underscores or hyphens');
  const connection = proxyOptions(proxy, proxyInsecure);
  const target = new URL(url);
  if (!['http:', 'https:'].includes(target.protocol)) throw new Error('HTTP(S) URL required');
  if (!Array.isArray(actions) || actions.length > 100) throw new Error('actions must be an array of at most 100 steps');
  if (motionConfig?.afterAction > actions.length) throw new Error('Motion checkpoint exceeds action sequence');
  for (const a of actions) {
    if (!a || !['click', 'fill', 'hover', 'scroll', 'wait'].includes(a.type)) throw new Error('Unsupported action');
    if (['click', 'fill', 'hover'].includes(a.type) && typeof a.selector !== 'string') throw new Error('selector required');
    if (a.type === 'fill' && typeof a.value !== 'string') throw new Error('fill requires string value');
    if (a.type === 'wait' && (!Number.isFinite(a.ms) || a.ms < 0 || a.ms > 10000)) throw new Error('wait must be 0..10000 ms');
    if (a.type === 'scroll' && (!Number.isFinite(a.y) || Math.abs(a.y) > 1000000)) throw new Error('Invalid scroll position');
  }
  const out = resolve(outDir);
  if (sessionOut) {
    const sessionRelative = relative(join(out, 'browser-profile'), resolve(sessionOut));
    if (!sessionRelative || (!sessionRelative.startsWith('..') && !sessionRelative.startsWith('../'))) throw new Error('Session export must be outside the generated browser profile');
  }
  await mkdir(out, { recursive: false }); // never overwrite an earlier capture
  const channel = process.env.NBRET_BROWSER_CHANNEL || (existsSync(chromium.executablePath()) ? undefined : 'chrome');
  const summary = { schemaVersion: 1, name: 'Network Based Reverse Engineering Tool', startedAt,
    targetOrigin: target.origin, capture: 'pending', rea: rea ? 'pending' : 'disabled', copy: copy ? 'pending' : 'disabled', errors: [] };
  summary.connection = { proxy: connection.proxy?.server || null, ignoreHTTPSErrors: !!connection.ignoreHTTPSErrors, scope: copyMode === 'same-state' ? 'Network, REA and same-state COPY share the capture connection.' : 'Network and REA capture; separate COPY uses its own direct connection.' };
  summary.identity = { runId: randomUUID(), scenarioId, state: 'fresh-profile', allowedOrigins };
  if (imported) { summary.identity.state = 'isolated-profile-with-imported-session'; summary.sessionImport = { sha256: imported.sha256, cookies: imported.state.cookies.length, origins: imported.state.origins.length }; }
  summary.runtime = { node: process.version, browser: null, channel: channel || 'bundled-chromium', tools: await toolVersions() };
  summary.options = { rea, copy, copyMode, captureTargets, includeScriptSources, includeStreamPayloads, visual, visualCheckpoints, retainProfile, viewport, reducedMotion };
  summary.profileRetention = retainProfile ? 'preserved' : 'pending';
  if (overrides.length) {
    summary.identity.state += '-with-local-response-overrides';
    summary.options.responseOverrides = overrides.map(({ path, method, status, delayMs }) => ({ path, method, status, delayMs }));
  }
  summary.visual = { status: visual ? 'pending' : 'disabled', states: [] };
  const observeVisual = async (page, actionId) => {
    if (!visual) return;
    const t = performance.now();
    try {
      summary.visual.states.push(await captureVisualState(page, { outDir: join(out, 'visual'), identity: summary.identity, actionId, index: summary.visual.states.length }));
      if (summary.visual.status !== 'failed') summary.visual.status = 'captured';
    } catch { summary.visual.status = 'failed'; summary.errors.push(safeFailure('visual')); }
    finally { phaseMs.visual = (phaseMs.visual || 0) + performance.now() - t; }
  };
  const observeMotion = async (page, actionId) => {
    if (!motionConfig || summary.motion) return;
    const t = performance.now();
    try { summary.motion = await captureMotion(page, { config: motionConfig, outDir: out, identity: summary.identity, actionId }); }
    catch { summary.motion = { status: 'failed' }; summary.errors.push(safeFailure('motion')); }
    finally { phaseMs.motion = performance.now() - t; }
  };
  let evidence, reaResult, ctx, targetRecorder, networkStarted, browserClosed = false;
  try {
    const launchStarted = performance.now();
    try {
      ctx = await chromium.launchPersistentContext(join(out, 'browser-profile'), {
        ...connection, channel, headless: true, viewport, reducedMotion,
        args: ['--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1'],
      });
    } finally { phaseMs.browserLaunch = performance.now() - launchStarted; }
    summary.runtime.browser = ctx.browser()?.version() || null;
    if (imported) await applySession(ctx, imported.state);
    await installLocalResponses(ctx, target.origin, overrides);
    networkStarted = performance.now();
    const page = ctx.pages()[0] || await ctx.newPage();
    if (captureTargets) {
      const [port, path] = (await readFile(join(out, 'browser-profile', 'DevToolsActivePort'), 'utf8')).split(/\r?\n/);
      if (!/^\d+$/.test(port) || !path.startsWith('/devtools/browser/')) throw new Error('Invalid owned CDP endpoint');
      targetRecorder = await startTargetCapture(page, { endpoint: `ws://127.0.0.1:${port}${path}`, outDir: join(out, 'network/targets'), origins: allowedOrigins, identity: summary.identity, includeScriptSources, includeStreamPayloads, assetStore });
    }
    const recorder = await startCapture(page, { outDir: join(out, 'network'), origins: allowedOrigins, includeScriptSources, identity: summary.identity, includeStreamPayloads, instrumentedTargets: targetRecorder?.instrumented, assetStore });
    let extraction;
    try {
      if (copy && copyMode === 'same-state') extraction = await startStateExtraction(page);
      let actionId = recorder.markAction('navigate');
      targetRecorder?.markAction('navigate', actionId);
      await page.goto(url, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(300);
      await recorder.snapshot('initial');
      if (visualCheckpoints === 'all') await observeVisual(page, actionId);
      for (const [i, a] of actions.entries()) {
        actionId = recorder.markAction(`${i + 1}:${a.type}`); // no field values in action labels
        targetRecorder?.markAction(`${i + 1}:${a.type}`, actionId);
        if (a.type === 'click') await page.locator(a.selector).click({ timeout: 10000 });
        if (a.type === 'hover') await page.locator(a.selector).hover({ timeout: 10000 });
        if (a.type === 'fill') await page.locator(a.selector).fill(a.value, { timeout: 10000 });
        if (a.type === 'scroll') await page.evaluate(y => scrollTo(0, y), a.y);
        if (a.type === 'wait') await page.waitForTimeout(a.ms);
        if (motionConfig?.afterAction === i + 1) await observeMotion(page, actionId);
        await page.waitForTimeout(150);
        await recorder.snapshot(`after-${i + 1}`);
        if (visualCheckpoints === 'all') await observeVisual(page, actionId);
      }
      await page.waitForTimeout(500);
      summary.assertions = await checkExpectations(page, expectations);
      if (summary.assertions.some(a => !a.passed)) summary.errors.push(safeFailure('expectations'));
      if (motionConfig && motionConfig.afterAction === undefined) await observeMotion(page, actionId);
      if (visualCheckpoints === 'final') await observeVisual(page, actionId);
      if (extraction) {
        const t = performance.now();
        try { summary.copyState = await extraction.finish({ outDir: join(out, 'copy'), identity: summary.identity, actionId }); summary.copy = 'extracted'; }
        catch { summary.copy = 'failed'; summary.errors.push(safeFailure('copy')); }
        finally { phaseMs.copy = performance.now() - t; }
      }
      if (rea) {
        const reaStarted = performance.now();
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
        finally { phaseMs.rea = performance.now() - reaStarted; }
      }
    } finally {
      try { if (extraction) await extraction.close(); }
      finally {
        if (targetRecorder) summary.targetCapture = await targetRecorder.finish();
        evidence = await recorder.finish(); summary.capture = 'captured';
      }
    }
  } catch { summary.capture = 'failed'; summary.errors.push(safeFailure(ctx ? 'capture' : 'browserLaunch')); }
  finally {
    if (networkStarted !== undefined) phaseMs.networkSession = performance.now() - networkStarted;
    if (targetRecorder && !summary.targetCapture) { try { summary.targetCapture = await targetRecorder.finish(); } catch { summary.errors.push(safeFailure('targets')); } }
    if (summary.targetCapture?.errors.length) summary.errors.push(safeFailure('targets'));
    if (ctx) {
      if (sessionOut) {
        try { summary.sessionExport = await saveSession(ctx, sessionOut, allowedOrigins); }
        catch { summary.errors.push(safeFailure('sessionExport')); }
      }
      const closeStarted = performance.now();
      try { await ctx.close(); browserClosed = true; } catch { summary.errors.push(safeFailure('browserClose')); }
      phaseMs.browserClose = performance.now() - closeStarted;
    }
  }
  if (!retainProfile) {
    if (ctx && browserClosed) {
      const cleanupStarted = performance.now();
      try {
        const [actualOut, profile] = await Promise.all([realpath(out), realpath(join(out, 'browser-profile'))]);
        if (relative(actualOut, profile) !== 'browser-profile') throw new Error('Profile resolved outside its generated run directory');
        await rm(profile, { recursive: true });
        summary.profileRetention = 'discarded-after-close';
      } catch { summary.profileRetention = 'cleanup-failed'; summary.errors.push(safeFailure('profileCleanup')); }
      phaseMs.profileCleanup = performance.now() - cleanupStarted;
    } else summary.profileRetention = 'preserved-close-unconfirmed';
  }
  if (summary.rea === 'pending') summary.rea = 'skipped';
  if (summary.visual.status === 'pending') summary.visual.status = 'skipped';
  if (copy && copyMode === 'separate' && summary.capture === 'captured') {
    const copyStarted = performance.now();
    try {
      await exec(process.execPath, [join(root, 'copy', 'extract.mjs'), '--url', url, '--out', join(out, 'copy'), '--wait', '300'],
        { cwd: root, timeout: 180000, maxBuffer: 8 * 1024 * 1024, windowsHide: true });
      summary.copy = 'extracted';
    } catch { summary.copy = 'failed'; summary.errors.push(safeFailure('copy')); }
    finally { phaseMs.copy = performance.now() - copyStarted; }
  }
  if (summary.copy === 'pending') summary.copy = 'skipped';
  if (summary.targetCapture?.targets.length && evidence) evidence = (await readEvidence(out, summary)).evidence;
  summary.finishedAt = new Date().toISOString();
  if (overrides.length) summary.responseOverrides = overrides.map(({ path, method, status, delayMs, hits }) => ({ path, method, status, delayMs, hits }));
  const reaScripts = reaResult?.data?.normalized_result?.scripts?.items || [];
  const links = (evidence?.requests || []).map(request => ({
    requestId: request.requestId, targetId: request.targetId, targetType: request.targetType, hop: request.hop, actionId: request.actionId,
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
  await writeFile(join(out, 'links.json'), JSON.stringify({ identity: summary.identity, requests: links }, null, 2));
  summary.counts = { requests: evidence?.requests.length || 0, scripts: evidence?.scripts.length || 0, actions: evidence?.actions.length || 0 };
  summary.networkCoverage = { dropped: evidence?.dropped || {}, errors: evidence?.errors.length || 0,
    unavailableBodies: evidence?.requests.filter(r => r.body?.unavailable).length || 0,
    pendingRequests: evidence?.requests.filter(r => !r.finished && !r.failure && !r.redirected).length || 0 };
  summary.reaCompleteness = reaResult?.data?.normalized_result?.completeness || null;
  summary.limitations = [
    'Action association is temporal, not proof of causality.',
    copyMode === 'same-state' ? 'REA and COPY inspect the interacted capture page sequentially; no atomic freeze is claimed.' : 'REA runs after actions; separate COPY runs in fresh contexts.',
    'No server-side source, arbitrary process memory or original-source equivalence is claimed.',
    'Fresh profile only. COPY output, optional raw scripts and browser profile can contain sensitive page data; never commit runs.',
  ];
  const accountingStarted = performance.now();
  let artifacts;
  try { artifacts = await measureArtifacts(out); }
  catch { artifacts = { status: 'failed' }; summary.errors.push(safeFailure('artifactAccounting')); }
  phaseMs.artifactAccounting = performance.now() - accountingStarted;
  summary.metrics = { phaseMs, artifacts, assetReuse: evidence?.assetReuse || null, elapsedBeforeReportsMs: performance.now() - started,
    networkSavedAssetBytes: evidence?.savedAssetBytes || 0,
    notes: ['networkSession includes REA, visual, motion and same-state COPY time; phases must not be summed.', 'Network savedAssetBytes excludes browser profile, COPY, REA, visual and reports; grouped artifact accounting is separate.', 'Elapsed time excludes final summary/report writes.'] };
  await writeFile(join(out, 'summary.json'), JSON.stringify(summary, null, 2));
  await writeFile(join(out, 'REPORT.md'), `# NBRET evidence\n\nOrigin: ${target.origin}\n\n` +
    `- Network: ${summary.capture} (${summary.counts.requests} requests)\n- REA: ${summary.rea}\n- COPY: ${summary.copy}\n\n` +
    `- Same-state visual: ${summary.visual.status} (${summary.visual.states.length} states)\n- Expectations: ${(summary.assertions || []).filter(a => a.passed).length}/${summary.assertions?.length || 0} passed\n\n` +
    'Read network/evidence.json for paired inputs/outputs, initiator frames, actions and snapshots. links.json matches initiator URLs/source hashes to REA script evidence. Read rea.json for REA observations and copy/ for per-viewport DOM/CSS/assets.\n\n' +
    summary.limitations.map(x => '- ' + x).join('\n') + '\n');
  return summary;
}
