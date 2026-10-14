import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { collectPageInventory } from '../copy/page-inventory.mjs';
import { renderUsedCss } from '../copy/_lib.mjs';

export async function startStateExtraction(page) {
  const cdp = await page.context().newCDPSession(page), sheets = new Map();
  const added = ({ header }) => sheets.set(header.styleSheetId, header);
  cdp.on('CSS.styleSheetAdded', added);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  await cdp.send('CSS.startRuleUsageTracking');
  let closed = false;
  const close = async () => { if (!closed) { closed = true; cdp.off('CSS.styleSheetAdded', added); await cdp.detach(); } };
  return {
    close,
    async finish({ outDir, identity, actionId }) {
      await mkdir(outDir, { recursive: false });
      try {
        const { ruleUsage } = await cdp.send('CSS.stopRuleUsageTracking');
        const groups = new Map();
        for (const r of ruleUsage.filter(r => r.used)) { const list = groups.get(r.styleSheetId) || []; list.push([r.startOffset, r.endOffset]); groups.set(r.styleSheetId, list); }
        let css = '', usedRules = 0, omittedSheets = 0;
        for (const [id, ranges] of [...groups].slice(0, 100)) {
          try {
            const { text } = await cdp.send('CSS.getStyleSheetText', { styleSheetId: id });
            if (Buffer.byteLength(text) + Buffer.byteLength(css) > 5 * 1024 * 1024) { omittedSheets++; continue; }
            const rendered = renderUsedCss(text, sheets.get(id)?.sourceURL || 'inline', ranges);
            css += rendered.css; usedRules += rendered.count;
          } catch { omittedSheets++; }
        }
        omittedSheets += Math.max(0, groups.size - 100);
        const { bodyHtml, headHtml, assets, ...inventory } = await collectPageInventory(page);
        await writeFile(join(outDir, 'dom.json'), JSON.stringify(inventory, null, 2));
        for (const [name, html] of [['body.html', bodyHtml], ['head.html', headHtml]]) {
          if (Buffer.byteLength(html) > 5 * 1024 * 1024) throw new Error('State markup exceeds 5 MiB limit');
          await writeFile(join(outDir, name), html);
        }
        await writeFile(join(outDir, 'used.css'), css);
        await writeFile(join(outDir, 'assets.txt'), assets.filter(u => /^https?:/.test(u)).sort().join('\n') + '\n');
        await page.screenshot({ path: join(outDir, 'viewport.png'), timeout: 10000 });
        const result = { schemaVersion: 1, mode: 'same-state', identity, actionId, observedAt: new Date().toISOString(),
          viewport: page.viewportSize(), elements: inventory.els.length, assets: assets.length, usedRules, omittedSheets,
          limitations: ['Current top-document state only; no navigation, scrolling, hover pass or extra asset requests.', 'Raw markup/CSS/text/screenshot are unredacted opt-in local evidence.', 'DOM/CSS and screenshot are sequential observations, not an atomic freeze.', 'Cross-origin stylesheet reads may be incomplete; omitted sheets are counted.'] };
        await writeFile(join(outDir, 'summary.json'), JSON.stringify(result, null, 2));
        return result;
      } finally { await close(); }
    },
  };
}
