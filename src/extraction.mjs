import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { collectPageInventory } from '../copy/page-inventory.mjs';
import { renderUsedCss } from '../copy/_lib.mjs';

const MAX_FRAMES = 20, MAX_CANVASES = 20, MAX_MARKUP = 5 * 1024 * 1024;

// Canvas pixels: one image per visible canvas, plus a second sample to tell animated from static drawing.
async function captureCanvases(page, outDir, inventory) {
  const list = [], handles = await page.$$('canvas');
  for (const [i, handle] of handles.slice(0, MAX_CANVASES).entries()) {
    const info = inventory[i] || {}, record = { index: i + 1, path: info.path, contexts: info.ctx || [], width: info.w, height: info.h };
    try {
      const box = await handle.boundingBox();
      if (!box || box.width < 1 || box.height < 1) { record.status = 'not-rendered'; continue; }
      if (!list.some(c => c.file)) await mkdir(join(outDir, 'canvases'), { recursive: true });
      const file = `canvases/${record.index}.png`, first = await handle.screenshot({ path: join(outDir, file), timeout: 5000 });
      await page.waitForTimeout(250);
      const second = await handle.screenshot({ timeout: 5000 });
      const digest = b => createHash('sha256').update(b).digest('hex');
      Object.assign(record, { status: 'captured', file, animated: digest(first) !== digest(second) });
    } catch { record.status = 'failed'; }
    finally { await handle.dispose(); list.push(record); }
  }
  for (const h of handles.slice(MAX_CANVASES)) await h.dispose();
  return { list, omitted: Math.max(0, handles.length - MAX_CANVASES) };
}

async function startTracking(cdp) {
  const sheets = new Map(), added = ({ header }) => sheets.set(header.styleSheetId, header);
  cdp.on('CSS.styleSheetAdded', added);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  await cdp.send('CSS.startRuleUsageTracking');
  return { cdp, sheets, added };
}

// Used CSS per frameId; a page session reports the main frame and its same-process children.
async function stopTracking({ cdp, sheets }) {
  const { ruleUsage } = await cdp.send('CSS.stopRuleUsageTracking');
  const groups = new Map();
  for (const r of ruleUsage.filter(r => r.used)) { const list = groups.get(r.styleSheetId) || []; list.push([r.startOffset, r.endOffset]); groups.set(r.styleSheetId, list); }
  const byFrame = new Map(), at = id => byFrame.get(id) || byFrame.set(id, { css: '', usedRules: 0, omittedSheets: 0 }).get(id);
  let total = 0;
  for (const [id, ranges] of groups) {
    const frame = at(sheets.get(id)?.frameId || '');
    if (++total > 100) { frame.omittedSheets++; continue; }
    try {
      const { text } = await cdp.send('CSS.getStyleSheetText', { styleSheetId: id });
      if (Buffer.byteLength(text) + Buffer.byteLength(frame.css) > MAX_MARKUP) { frame.omittedSheets++; continue; }
      const rendered = renderUsedCss(text, sheets.get(id)?.sourceURL || 'inline', ranges);
      frame.css += rendered.css; frame.usedRules += rendered.count;
    } catch { frame.omittedSheets++; }
  }
  return byFrame;
}

async function frameTreeIds(cdp) {
  const ids = new Map(), visit = (node, parentKey) => {
    const key = `${parentKey}>${node.frame.name || ''}|${node.frame.url}`;
    const list = ids.get(key) || []; list.push(node.frame.id); ids.set(key, list);
    for (const child of node.childFrames || []) visit(child, key);
  };
  visit((await cdp.send('Page.getFrameTree')).frameTree, '');
  return ids;
}

const frameKey = frame => `${frame.parentFrame() ? frameKey(frame.parentFrame()) : ''}>${frame.name()}|${frame.url()}`;

async function writeInventory(dir, inventory) {
  const { bodyHtml, headHtml, assets, ...rest } = inventory;
  await writeFile(join(dir, 'dom.json'), JSON.stringify(rest, null, 2));
  for (const [name, html] of [['body.html', bodyHtml], ['head.html', headHtml]]) {
    if (Buffer.byteLength(html) > MAX_MARKUP) throw new Error('State markup exceeds 5 MiB limit');
    await writeFile(join(dir, name), html);
  }
  await writeFile(join(dir, 'assets.txt'), assets.filter(u => /^https?:/.test(u)).sort().join('\n') + '\n');
  return { elements: rest.els.length, assets: assets.length };
}

export async function startStateExtraction(page, { fullPage = true } = {}) {
  const context = page.context(), main = await startTracking(await context.newCDPSession(page));
  // Same hook as COPY: record which drawing contexts each canvas requests.
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) { (this.__ctxTypes ||= new Set()).add(type); return original.call(this, type, ...rest); };
  });
  // Cross-process (OOPIF) frames need their own session; tracking starts when each frame commits.
  const remote = new Map(), pending = new Set();
  const attach = frame => {
    if (frame === page.mainFrame() || remote.has(frame) || remote.size >= MAX_FRAMES) return;
    const p = (async () => {
      try { const session = await context.newCDPSession(frame); remote.set(frame, await startTracking(session)); }
      catch { /* same-process frame: covered by the page session */ }
    })();
    pending.add(p); p.finally(() => pending.delete(p));
  };
  page.on('framenavigated', attach);
  let closed = false;
  const close = async () => {
    if (closed) return; closed = true;
    page.off('framenavigated', attach); await Promise.allSettled([...pending]);
    for (const t of [main, ...remote.values()]) { t.cdp.off('CSS.styleSheetAdded', t.added); await t.cdp.detach().catch(() => {}); }
  };
  return {
    close,
    async finish({ outDir, identity, actionId }) {
      await mkdir(outDir, { recursive: false });
      try {
        await Promise.allSettled([...pending]);
        const mainCss = await stopTracking(main);
        const { frameTree } = await main.cdp.send('Page.getFrameTree'), mainId = frameTree.frame.id;
        const treeIds = await frameTreeIds(main.cdp);
        const top = { css: '', usedRules: 0, omittedSheets: 0 };
        for (const id of [mainId, '']) { const v = mainCss.get(id); if (v) { top.css += v.css; top.usedRules += v.usedRules; top.omittedSheets += v.omittedSheets; } }
        const inventory = await collectPageInventory(page), counts = await writeInventory(outDir, inventory);
        await writeFile(join(outDir, 'used.css'), top.css);
        await page.screenshot({ path: join(outDir, 'viewport.png'), timeout: 10000 });
        const canvases = await captureCanvases(page, outDir, inventory.canvases);
        if (canvases.list.length) await writeFile(join(outDir, 'canvases.json'), JSON.stringify(canvases.list, null, 2));

        const children = page.frames().filter(f => f !== page.mainFrame()), frames = [], index = new Map();
        for (const [i, frame] of children.slice(0, MAX_FRAMES).entries()) {
          const record = { index: i + 1, url: frame.url(), name: frame.name() || undefined, parent: index.get(frame.parentFrame()) || 0, process: remote.has(frame) ? 'out-of-process' : 'same-process' };
          index.set(frame, record.index); frames.push(record);
          const dir = join(outDir, 'frames', String(record.index));
          try {
            if (frame.isDetached()) throw new Error('detached');
            const element = await frame.frameElement();
            const box = await element.boundingBox(); await element.dispose();
            if (box) record.rect = [box.x, box.y, box.width, box.height].map(Math.round);
            await mkdir(dir, { recursive: true });
            Object.assign(record, await writeInventory(dir, await collectPageInventory(frame)));
            let css;
            if (remote.has(frame)) { const used = await stopTracking(remote.get(frame)); css = { css: '', usedRules: 0, omittedSheets: 0 }; for (const v of used.values()) { css.css += v.css; css.usedRules += v.usedRules; css.omittedSheets += v.omittedSheets; } }
            else { const ids = treeIds.get(frameKey(frame)) || []; css = mainCss.get(ids.shift()); }
            if (css) { await writeFile(join(dir, 'used.css'), css.css); record.usedRules = css.usedRules; record.omittedSheets = css.omittedSheets; }
            else record.usedRules = null; // frame id not matched; its rules stay unattributed
            record.status = 'extracted';
          } catch (e) { record.status = 'failed'; record.reason = /detached/i.test(e.message) ? 'detached' : 'unreadable'; }
        }
        if (frames.length) await writeFile(join(outDir, 'frames.json'), JSON.stringify(frames, null, 2));

        let fullPageStatus = 'disabled';
        if (fullPage) {
          try { await page.screenshot({ path: join(outDir, 'full.png'), fullPage: true, timeout: 15000 }); fullPageStatus = 'captured'; }
          catch { fullPageStatus = 'failed'; }
        }
        const result = { schemaVersion: 2, mode: 'same-state', identity, actionId, observedAt: new Date().toISOString(),
          viewport: page.viewportSize(), elements: counts.elements, assets: counts.assets, usedRules: top.usedRules, omittedSheets: top.omittedSheets,
          frames: { discovered: children.length, extracted: frames.filter(f => f.status === 'extracted').length, outOfProcess: frames.filter(f => f.process === 'out-of-process').length, omitted: Math.max(0, children.length - MAX_FRAMES) },
          fullPage: fullPageStatus,
          canvases: { found: canvases.list.length + canvases.omitted, captured: canvases.list.filter(c => c.status === 'captured').length, animated: canvases.list.filter(c => c.animated).length, omitted: canvases.omitted },
          limitations: ['Interacted state only; no navigation, scrolling, hover pass or extra asset requests. Elements below the fold are inventoried as rendered; lazy content that never loaded is absent.', 'Full-page screenshot is taken after DOM/CSS extraction and temporarily resizes the viewport, which can trigger resize or lazy-load handlers.', 'Raw markup/CSS/text/screenshot are unredacted opt-in local evidence.', 'DOM/CSS and screenshot are sequential observations, not an atomic freeze.', 'Cross-origin stylesheet reads may be incomplete; omitted sheets are counted.', `Child frames: up to ${MAX_FRAMES}; out-of-process frame CSS usage is tracked from the frame's commit, so rules used before tracking attached can be missed.`, `Canvas: up to ${MAX_CANVASES} top-document canvases as rendered pixels; drawing code, scene graphs and shaders are not recovered. "animated" compares two samples 250 ms apart.`] };
        await writeFile(join(outDir, 'summary.json'), JSON.stringify(result, null, 2));
        return result;
      } finally { await close(); }
    },
  };
}
