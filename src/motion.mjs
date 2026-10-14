import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export function validateMotion(config, url) {
  if (!config) return null;
  const value = { mode: 'observe', frames: 5, intervalMs: 100, ...config };
  if (!['observe', 'seek'].includes(value.mode) || !Array.isArray(value.selectors) || value.selectors.length < 1 || value.selectors.length > 20 || value.selectors.some(s => typeof s !== 'string' || !s || s.length > 1000)) throw new Error('Motion requires 1..20 bounded selectors and observe/seek mode');
  if (!Number.isInteger(value.frames) || value.frames < 2 || value.frames > 120 || !Number.isInteger(value.intervalMs) || value.intervalMs < 1 || value.intervalMs > 1000 || value.frames * value.intervalMs > 10000) throw new Error('Motion sampling exceeds frame/time budget');
  if (value.afterAction !== undefined && (!Number.isInteger(value.afterAction) || value.afterAction < 1 || value.afterAction > 100)) throw new Error('afterAction must be 1..100');
  if (value.mode === 'seek' && !['127.0.0.1', '[::1]'].includes(new URL(url).hostname)) throw new Error('Animation seeking is restricted to literal loopback fixtures');
  return value;
}

export async function captureMotion(page, { config, outDir, identity, actionId }) {
  let saved;
  const samples = [];
  try {
    if (config.mode === 'seek') saved = await page.evaluateHandle(() => document.getAnimations().map(a => ({ animation: a, time: a.currentTime, state: a.playState })));
    for (let index = 0; index < config.frames; index++) {
      if (saved) await page.evaluate(({ saved, time }) => { for (const item of saved) { item.animation.pause(); item.animation.currentTime = time; } }, { saved, time: index * config.intervalMs });
      else if (index) await page.waitForTimeout(config.intervalMs);
      const sample = await page.evaluate(selectors => ({ timestamp: performance.now(),
        elements: selectors.map(selector => ({ selector, nodes: [...document.querySelectorAll(selector)].slice(0, 100).map((el, index) => {
          const r = el.getBoundingClientRect(), s = getComputedStyle(el);
          return { index, rect: { x: r.x, y: r.y, width: r.width, height: r.height }, transform: s.transform, opacity: s.opacity };
        }) })),
        animations: document.getAnimations().slice(0, 100).map(a => { const timing = a.effect?.getTiming(); return { targetId: a.effect?.target?.id || null, duration: typeof timing?.duration === 'number' ? timing.duration : null, easing: timing?.easing, iterations: Number.isFinite(timing?.iterations) ? timing.iterations : 'infinite' }; }),
      }), config.selectors);
      samples.push({ index, requestedTimeMs: index * config.intervalMs, ...sample });
    }
  } finally {
    if (saved) {
      try { await page.evaluate(saved => { for (const item of saved) { const a = item.animation; a.currentTime = item.time; if (item.state === 'running') a.play(); else if (item.state === 'finished') a.finish(); else if (item.state === 'idle') a.cancel(); else a.pause(); } }, saved); }
      finally { await saved.dispose(); }
    }
  }
  const start = samples[0].timestamp;
  for (const s of samples) { s.elapsedMs = s.timestamp - start; delete s.timestamp; }
  const result = { schemaVersion: 1, identity, actionId, config, samples,
    limitations: ['Top-document geometry/style samples only; no video or full animation-source recovery.', 'Observe samples use actual elapsed times and can drift; seek mode manipulates only local fixture WAAPI/CSS animations and restores prior state.', 'Canvas, JS requestAnimationFrame loops and scroll engines are not deterministically seeked.'] };
  await writeFile(join(outDir, 'motion.json'), JSON.stringify(result, null, 2));
  return { file: 'motion.json', actionId, mode: config.mode, samples: samples.length };
}
