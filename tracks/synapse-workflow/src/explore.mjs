import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createScope } from './scope.mjs';
import { connectHarness, readHarnessView, waitHarnessReady } from './harness.mjs';
import { safeStateUrl as safeUrl } from './capture.mjs';
import { validateInteractions, riskyControl as risky } from './interactions.mjs';

const fingerprint = view => createHash('sha256').update(JSON.stringify({ url: safeUrl(view.url), text: view.text,
  elements: (view.elements || []).map(({ ref, ...e }) => e) })).digest('hex');

/** Read-only default discovery. Optional UI interactions must name observed labels. */
export async function runExplore({ url, origins = [], outDir, maxPages = 10, maxDepth = 2,
  maxStates = 30, maxMs = 120000, settleMs = 1000, interactions = [], driver } = {}) {
  const scope = createScope([new URL(url).origin, ...origins]); scope.require(url);
  for (const [key, value, limit] of [['maxPages', maxPages, 100], ['maxDepth', maxDepth, 10], ['maxStates', maxStates, 300], ['maxMs', maxMs, 600000]]) {
    if (!Number.isSafeInteger(value) || value < (key === 'maxDepth' ? 0 : 1) || value > limit) throw new Error('Invalid Explore budget');
  }
  if (!Number.isSafeInteger(settleMs) || settleMs < 0 || settleMs > 10000) throw new Error('Invalid settling budget');
  validateInteractions(interactions);
  await mkdir(outDir, { recursive: false });
  const harness = driver || connectHarness();
  const result = { schemaVersion: 1, tier: 2, origins: scope.origins, startedAt: new Date().toISOString(),
    limits: { maxPages, maxDepth, maxStates, maxMs, settleMs }, pages: [], states: [], transitions: [], skipped: [], errors: [],
    limitations: ['Only observed links and explicitly named interactions are explored.', 'State identity is a DOM/text fingerprint, not semantic equivalence.', 'Browser redirects and page subresources may leave the origin scope; external final pages are not captured.', 'DOM/text evidence can contain personal data; keep runs private.'] };
  const queue = [{ url, depth: 0, parent: null }], visited = new Set(), states = new Set();
  let depthLimited = false, queueLimited = false;
  const deadline = Date.now() + maxMs; let tab;
  const record = async (view, via, parent) => {
    if (!scope.allows(view.url)) { result.skipped.push({ reason: 'out-of-scope-final-url', url: safeUrl(view.url) }); return null; }
    const hash = fingerprint(view);
    if (states.has(hash)) {
      const id = result.states.find(s => s.sha256 === hash)?.id;
      result.transitions.push({ from: parent, to: id, via, revisited: true });
      return id;
    }
    if (result.states.length >= maxStates) return null;
    states.add(hash); const id = result.states.length + 1;
    const file = `state-${id}.json`;
    await writeFile(join(outDir, file), JSON.stringify({ ...view, url: safeUrl(view.url) }, null, 2));
    result.states.push({ id, url: safeUrl(view.url), sha256: hash, file });
    result.transitions.push({ from: parent, to: id, via }); return id;
  };
  try {
    tab = (await harness.call({ op: 'new_tab', value: url })).tab;
    if (!tab) throw new Error('No owned tab');
    if (settleMs) await new Promise(r => setTimeout(r, settleMs));
    while (queue.length && visited.size < maxPages && result.states.length < maxStates && Date.now() < deadline) {
      const item = queue.shift();
      const normalized = new URL(item.url);
      if (visited.has(normalized.href)) continue;
      visited.add(normalized.href);
      if (result.pages.length) {
        await harness.call({ op: 'navigate', tab, value: item.url });
        if (settleMs) await new Promise(r => setTimeout(r, settleMs));
      }
      const readiness = await waitHarnessReady(harness, tab, Math.max(0, Math.min(30000, deadline - Date.now())));
      const view = await readHarnessView(harness, tab, { maxElements: 300 });
      const state = await record(view, { type: 'navigate' }, item.parent);
      if (!state) continue;
      result.pages.push({ url: safeUrl(item.url), depth: item.depth, state,
        settled: readiness.settled,
        truncated: !!(view.next_offset || view.next_element_offset || view.truncated || view.elements_truncated) });
      for (const e of view.elements || []) {
        if (!e.href) continue;
        let link; try { link = new URL(e.href, view.url); } catch { continue; }
        if (!scope.allows(link.href) || risky.test(`${e.name || ''} ${link.pathname}`)) {
          result.skipped.push({ url: safeUrl(link.href), reason: 'out-of-scope-or-destructive-link' }); continue;
        }
        if (!visited.has(link.href)) {
          if (item.depth >= maxDepth) depthLimited = true;
          else if (queue.length >= maxPages * 10) queueLimited = true;
          else queue.push({ url: link.href, depth: item.depth + 1, parent: state });
        }
      }
      for (const interaction of interactions) {
        if (Date.now() >= deadline || result.states.length >= maxStates) break;
        // Reset to the source page for each independent branch.
        await harness.call({ op: 'navigate', tab, value: item.url });
        if (settleMs) await new Promise(r => setTimeout(r, settleMs));
        const before = (await waitHarnessReady(harness, tab, Math.max(0, Math.min(30000, deadline - Date.now())))).view;
        if (!scope.allows(before.url)) continue;
        const matches = (before.elements || []).filter(e => e.name === interaction.name && !e.frame &&
          !risky.test(`${e.name} ${e.href || ''}`) && (!e.href || scope.allows(new URL(e.href, before.url).href)));
        if (matches.length !== 1) { result.skipped.push({ reason: 'missing-or-ambiguous-interaction', name: interaction.name }); continue; }
        const action = await harness.call({ op: interaction.type, tab, ref: matches[0].ref });
        if (action.performed === false) { result.skipped.push({ reason: 'interaction-not-performed', name: interaction.name }); continue; }
        if (settleMs) await new Promise(r => setTimeout(r, settleMs));
        await record(await harness.call({ op: 'read', tab }), interaction, state);
      }
    }
    result.coverage = { queuedPages: queue.length, depthLimited, queueLimited, stateLimitReached: result.states.length >= maxStates };
    result.status = queue.length || depthLimited || queueLimited || result.coverage.stateLimitReached || Date.now() >= deadline || result.pages.some(p => p.truncated || !p.settled) ? 'bounded' : 'completed';
  } catch { result.status = 'failed'; result.errors.push({ code: 'EXPLORE_FAILED', message: 'Harness operation or evidence recording failed' }); }
  finally {
    if (tab) {
      try { result.cleanup = await harness.call({ op: 'close_tab', tab }); }
      catch { result.cleanup = { closed: false }; }
      if (!result.cleanup.closed) { result.errors.push({ code: 'OWNED_TAB_NOT_CLOSED', tab }); result.status = 'incomplete'; }
    }
    harness.close?.();
    result.finishedAt = new Date().toISOString();
    await writeFile(join(outDir, 'explore.json'), JSON.stringify(result, null, 2));
  }
  return result;
}
