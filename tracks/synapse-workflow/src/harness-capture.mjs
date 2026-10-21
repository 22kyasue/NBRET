import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { connectHarness, readHarnessView, waitHarnessReady } from './harness.mjs';
import { startCapture, safeStateUrl } from './capture.mjs';
import { createScope } from './scope.mjs';
import { inspectWithRea } from './rea.mjs';
import { validateInteractions, riskyControl, evaluateUiExpect } from './interactions.mjs';

/** Observe an owned tab in the existing computeruse browser. COPY is intentionally unavailable. */
export async function runHarnessCapture({ url, origins = [], outDir, includeScriptSources = false, includeCoverage = false, rea = true,
  settleMs = 3000, scrollSteps = 2, readyTimeoutMs = 30000, maxSnapshotNodes = 10000, drainMs = 5000,
  interactions = [], tab: suppliedTab, closeTab = true } = {}) {
  const scope = createScope([new URL(url).origin, ...origins]); scope.require(url);
  validateInteractions(interactions, { allowFill: true });
  if (!Number.isSafeInteger(settleMs) || settleMs < 0 || settleMs > 10000 ||
      !Number.isSafeInteger(scrollSteps) || scrollSteps < 0 || scrollSteps > 10 ||
      !Number.isSafeInteger(readyTimeoutMs) || readyTimeoutMs < 0 || readyTimeoutMs > 60000 ||
      !Number.isSafeInteger(drainMs) || drainMs < 0 || drainMs > 30000) throw new Error('Invalid capture budgets');
  await mkdir(outDir, { recursive: false });
  const harness = connectHarness();
  const summary = { schemaVersion: 1, startedAt: new Date().toISOString(), targetOrigin: new URL(url).origin,
    browser: 'existing-computeruse-harness', capture: 'pending', rea: rea ? 'pending' : 'disabled', copy: 'disabled', errors: [] };
  let tab = suppliedTab, connection, recorder, evidence, reaResult;
  try {
    if (!tab) tab = (await harness.call({ op: 'new_tab', value: url })).tab;
    const { endpoint } = await harness.call({ op: 'connection' });
    connection = await chromium.connectOverCDP(endpoint);
    let page;
    for (const ctx of connection.contexts()) for (const candidate of ctx.pages()) {
      const cdp = await ctx.newCDPSession(candidate);
      try { if ((await cdp.send('Target.getTargetInfo')).targetInfo.targetId === tab) page = candidate; }
      finally { await cdp.detach(); }
    }
    if (!page) throw new Error('Owned tab unavailable');
    recorder = await startCapture(page, { outDir: join(outDir, 'network'), origins: scope.origins,
      includeScriptSources, includeCoverage, maxSnapshotNodes, maxEntries: 10000, maxPending: 1000, maxBodyBytes: 8 * 1024 * 1024, maxTotalBytes: 80 * 1024 * 1024 });
    recorder.markAction('navigate-observation');
    await harness.call({ op: 'navigate', tab, value: url });
    await new Promise(r => setTimeout(r, settleMs));
    const readyDeadline = Date.now() + readyTimeoutMs;
    let readiness;
    do {
      readiness = await harness.call({ op: 'read', tab });
      if (readiness.ready === 'complete' && ((readiness.text || '').length > 100 || (readiness.elements || []).length > 5)) break;
      if (Date.now() >= readyDeadline) break;
      await new Promise(r => setTimeout(r, 1000));
    } while (true);
    summary.readiness = { complete: readiness.ready === 'complete', textCharacters: readiness.text?.length || 0,
      budgetMs: readyTimeoutMs };
    await recorder.snapshot('initial');
    summary.interactions = [];
    for (const [i, step] of interactions.entries()) {
      const before = (await waitHarnessReady(harness, tab, Math.min(10000, readyTimeoutMs))).view;
      const eligible = e => e.name === step.name && !e.frame && (!step.tag || e.tag === step.tag) &&
        (step.type !== 'fill' || ['input', 'textarea'].includes(e.tag) && e.type !== 'password') &&
        !riskyControl.test(`${e.name} ${e.href || ''}`) && (!e.href || scope.allows(new URL(e.href, before.url).href));
      let matches = (before.elements || []).filter(eligible);
      if (matches.length !== 1) matches = ((await harness.call({ op: 'find', tab, value: step.name })).elements || []).filter(eligible);
      if (matches.length !== 1) {
        summary.interactions.push({ name: step.name, status: 'missing-or-ambiguous' });
        summary.errors.push({ phase: 'interaction', code: 'MISSING_OR_AMBIGUOUS_CONTROL' }); continue;
      }
      recorder.markAction(`interaction-${i + 1}:${step.type}`);
      const action = await harness.call({ op: step.type, tab, ref: matches[0].ref, ...(step.type === 'fill' ? { value: step.value } : {}) });
      await new Promise(r => setTimeout(r, 500));
      await recorder.snapshot(`interaction-${i + 1}`);
      let after, assertions;
      const assertionDeadline = Date.now() + (step.timeoutMs ?? 3000);
      do {
        after = await readHarnessView(harness, tab);
        assertions = evaluateUiExpect(after, step.expect, { controlName: step.name });
        if (!assertions.some(a => a.outcome === 'failed') || Date.now() >= assertionDeadline) break;
        await new Promise(r => setTimeout(r, 200));
      } while (true);
      summary.interactions.push({ name: step.name, type: step.type, url: safeStateUrl(after.url),
        status: action.performed === false ? 'not-performed' : assertions.some(a => a.outcome === 'failed') ? 'failed' : 'observed', assertions });
      if (assertions.some(a => a.outcome === 'failed')) summary.errors.push({ phase: 'interaction', code: 'UI_ASSERTION_FAILED' });
      if (action.performed === false) summary.errors.push({ phase: 'interaction', code: 'ACTION_NOT_PERFORMED' });
    }
    for (let i = 0; i < scrollSteps; i++) {
      recorder.markAction(`scroll-observation-${i + 1}`);
      await harness.call({ op: 'scroll', tab, value: 'down' });
      await new Promise(r => setTimeout(r, 1000));
      await recorder.snapshot(`scroll-${i + 1}`);
    }
    const view = await readHarnessView(harness, tab);
    await writeFile(join(outDir, 'page-observation.json'), JSON.stringify(view, null, 2));
    summary.page = { title: view.title, ready: view.ready, textCharacters: view.text?.length || 0,
      elements: view.elements?.length || 0, truncated: !!(view.truncated || view.elements_truncated) };
    if (rea) {
      try {
        reaResult = await inspectWithRea(endpoint, tab, { includeScriptSources });
        await writeFile(join(outDir, 'rea.json'), JSON.stringify(reaResult, null, 2));
        summary.rea = 'captured';
      } catch { summary.rea = 'failed'; summary.errors.push({ phase: 'rea', code: 'PHASE_FAILED' }); }
    }
    summary.drain = await recorder.waitForIdle({ timeoutMs: drainMs });
    await recorder.snapshot('final');
    summary.capture = 'captured';
  } catch { summary.capture = 'failed'; summary.errors.push({ phase: 'capture', code: 'PHASE_FAILED' }); }
  finally {
    if (recorder) {
      try { evidence = await recorder.finish(); }
      catch { summary.capture = 'failed'; summary.errors.push({ phase: 'finish', code: 'PHASE_FAILED' }); }
    }
    // Playwright connectOverCDP marks this connection for disconnect-only close.
    if (connection) { try { await connection.close(); } catch { summary.errors.push({ phase: 'disconnect', code: 'DISCONNECT_FAILED' }); } }
    if (tab && closeTab) {
      try { summary.cleanup = await harness.call({ op: 'close_tab', tab }); }
      catch { summary.cleanup = { closed: false }; }
      if (!summary.cleanup.closed) summary.errors.push({ phase: 'cleanup', code: 'OWNED_TAB_NOT_CLOSED' });
    }
    harness.close();
  }
  const reaScripts = reaResult?.data?.normalized_result?.scripts?.items || [];
  const links = (evidence?.requests || []).map(r => ({ requestId: r.requestId, hop: r.hop,
    observationIntervalId: r.observationIntervalId, association: 'temporal-not-causal',
    scripts: (r.initiator.frames || []).map(frame => {
      const script = evidence.scripts.find(s => s.url === frame.url);
      const matches = reaScripts.filter(s => s.url === frame.url);
      return { ...frame, networkScriptId: script?.scriptId, networkScriptFile: script?.file,
        reaScriptKeys: matches.map(s => s.script_key),
        sha256Match: !!script?.sha256 && matches.some(s => s.source?.artifact?.sha256 === script.sha256) };
    }) }));
  await writeFile(join(outDir, 'links.json'), JSON.stringify({ requests: links }, null, 2));
  summary.counts = { requests: evidence?.requests.length || 0, scripts: evidence?.scripts.length || 0,
    actions: evidence?.actions.length || 0, snapshots: evidence?.snapshots.length || 0 };
  summary.networkCoverage = { dropped: evidence?.dropped || {}, errors: evidence?.errors.length || 0,
    outOfScopeRequests: evidence?.requests.filter(r => !r.inScope).length || 0,
    unavailableBodies: evidence?.requests.filter(r => r.body?.unavailable).length || 0,
    pendingRequests: evidence?.requests.filter(r => !r.finished && !r.failure && !r.redirected).length || 0 };
  summary.reaCompleteness = reaResult?.data?.normalized_result?.completeness || null;
  summary.executionCoverage = evidence?.coverageSummary || { status: 'unavailable' };
  summary.limitations = ['Existing signed-in harness profile; its first opening precedes recorder attachment, then navigation is recorded.',
    'COPY disabled. DOM observations are collector evidence, not a site reconstruction.',
    'Structured HTTP bodies are key-redacted; unstructured/binary bodies and storage values are omitted.',
    'Only this page CDP target is recorded; workers and cross-process frames can be incomplete.'];
  summary.finishedAt = new Date().toISOString();
  await writeFile(join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
  await writeFile(join(outDir, 'REPORT.md'), '# NBRET harness capture\n\n' +
    `Network: ${summary.capture}; REA: ${summary.rea}; COPY: disabled.\n\n` +
    summary.limitations.map(x => '- ' + x).join('\n') + '\n');
  return summary;
}
