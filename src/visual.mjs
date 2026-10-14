import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Read-only observation of the current page: no navigation, hover or scrolling.
export async function captureVisualState(page, { outDir, identity, actionId, index }) {
  await mkdir(outDir, { recursive: true });
  const tag = String(index).padStart(3, '0');
  const data = await page.evaluate(() => {
    const elements = [...document.querySelectorAll('body *')];
    return {
      viewport: { width: innerWidth, height: innerHeight, scrollX, scrollY },
      nodesTruncated: elements.length > 2000,
      nodes: elements.slice(0, 2000).map((el, index) => {
        const r = el.getBoundingClientRect(), s = getComputedStyle(el);
        return { index, tag: el.tagName, id: el.id || null,
          text: ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'].includes(el.tagName) ? null : [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').slice(0, 500),
          rect: { x: r.x, y: r.y, width: r.width, height: r.height },
          style: Object.fromEntries(['display', 'position', 'color', 'background-color', 'font-family', 'font-size', 'font-weight', 'opacity', 'transform', 'border-radius'].map(k => [k, s.getPropertyValue(k)])) };
      }),
      animations: document.getAnimations().slice(0, 100).map(a => ({ playState: a.playState, currentTime: a.currentTime, targetId: a.effect?.target?.id || null })),
    };
  });
  // Viewport only: full-page capture can change layout/trigger lazy loading.
  await page.screenshot({ path: join(outDir, `${tag}.png`), timeout: 10000 });
  const state = { schemaVersion: 1, identity, actionId, index, observedAt: new Date().toISOString(),
    screenshot: `${tag}.png`, ...data,
    limitations: ['DOM and screenshot are sequential observations; animations may advance between them.', 'Raw visible text and screenshots are not redacted. Opt-in local artifacts only.', 'Top document only; capped inventory does not replace full COPY extraction.'] };
  await writeFile(join(outDir, `${tag}.json`), JSON.stringify(state, null, 2));
  return { actionId, index, file: `visual/${tag}.json`, screenshot: `visual/${tag}.png` };
}
