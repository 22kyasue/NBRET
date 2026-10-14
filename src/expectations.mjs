export function validateExpectations(expectations = []) {
  if (!Array.isArray(expectations) || expectations.length > 20) throw new Error('At most 20 expectations are allowed');
  for (const e of expectations) {
    if (!e || typeof e.selector !== 'string' || !e.selector || e.selector.length > 1000) throw new Error('Expectation selector required');
    if (e.text === undefined && e.visible === undefined && e.count === undefined) throw new Error('Expectation requires text, visible or count');
    if (e.text !== undefined && (typeof e.text !== 'string' || e.text.length > 2000)) throw new Error('Expected text must be a bounded string');
    if (e.visible !== undefined && typeof e.visible !== 'boolean') throw new Error('Expected visibility must be boolean');
    if (e.count !== undefined && (!Number.isInteger(e.count) || e.count < 0 || e.count > 2000)) throw new Error('Expected count must be 0..2000');
    if (e.timeoutMs !== undefined && (!Number.isInteger(e.timeoutMs) || e.timeoutMs < 0 || e.timeoutMs > 5000)) throw new Error('Expectation timeout must be 0..5000 ms');
  }
  return expectations;
}

export async function checkExpectations(page, expectations) {
  const results = [];
  for (const [index, e] of expectations.entries()) {
    const checks = ['text', 'visible', 'count'].filter(k => e[k] !== undefined);
    const deadline = performance.now() + (e.timeoutMs ?? 1500);
    let passed = false;
    try {
      const locator = page.locator(e.selector);
      do {
        const count = await locator.count();
        passed = (e.count === undefined || count === e.count);
        if (e.text !== undefined) passed = passed && count === 1 && (await locator.textContent({ timeout: 500 })) === e.text;
        if (e.visible !== undefined) passed = passed && (e.visible ? count === 1 && await locator.isVisible() : count === 0 || count === 1 && !await locator.isVisible());
        if (passed || performance.now() >= deadline) break;
        await page.waitForTimeout(50);
      } while (performance.now() < deadline);
    } catch { passed = false; }
    results.push({ index, checks, passed }); // Never persist input values or page text in summary errors.
  }
  return results;
}
