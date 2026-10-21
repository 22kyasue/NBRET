import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export function connectHarness() {
  const root = process.env.NBRET_COMPUTERUSE_ROOT || 'C:/Users/kotar/githubprojects/computeruse';
  const python = process.env.NBRET_COMPUTERUSE_PYTHON || join(root, '.venv', 'Scripts', 'python.exe');
  const child = spawn(python, [fileURLToPath(new URL('../scripts/harness-browser.py', import.meta.url))], {
    cwd: root, windowsHide: true, stdio: ['pipe', 'pipe', 'ignore'], env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });
  let pending, failed = false;
  const fail = () => { failed = true; clearTimeout(pending?.timer); pending?.reject(new Error('Existing computeruse harness unavailable')); pending = null; };
  child.on('error', fail); child.on('exit', fail);
  createInterface({ input: child.stdout }).on('line', line => {
    if (!pending) return;
    const p = pending; pending = null; clearTimeout(p.timer);
    try { const value = JSON.parse(line); if (value.error) throw new Error('Harness operation failed'); p.resolve(value.result); }
    catch { p.reject(new Error('Harness operation failed')); }
  });
  return {
    call(request) {
      if (failed || pending) return Promise.reject(new Error('Harness unavailable or operation already pending'));
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { fail(); child.kill(); }, 45000);
        pending = { resolve, reject, timer };
        child.stdin.write(JSON.stringify(request) + '\n');
      });
    },
    close() { clearTimeout(pending?.timer); child.stdin.end(); child.kill(); },
  };
}

export async function readHarnessView(harness, tab, { maxElements = 2000, maxTextChars = 50000 } = {}) {
  if (!Number.isSafeInteger(maxElements) || maxElements < 1 || maxElements > 10000 || !Number.isSafeInteger(maxTextChars) || maxTextChars < 1 || maxTextChars > 1000000) throw new Error('Invalid DOM inventory budget');
  const view = await harness.call({ op: 'read', tab });
  const elements = [...(view.elements || [])].slice(0, maxElements); let text = (view.text || '').slice(0, maxTextChars);
  let nextElement = view.next_element_offset, nextText = view.next_offset;
  while (Number.isSafeInteger(nextElement) && nextElement > 0 && elements.length < maxElements) {
    const chunk = await harness.call({ op: 'read', tab, element_offset: nextElement });
    if (chunk.url !== view.url) throw new Error('Page changed during inventory');
    elements.push(...(chunk.elements || []).slice(0, maxElements - elements.length));
    if (chunk.next_element_offset === nextElement) break;
    nextElement = chunk.next_element_offset;
  }
  while (Number.isSafeInteger(nextText) && nextText > 0 && text.length < maxTextChars) {
    const chunk = await harness.call({ op: 'read', tab, offset: nextText });
    if (chunk.url !== view.url) throw new Error('Page changed during inventory');
    text += (chunk.text || '').slice(0, maxTextChars - text.length);
    if (chunk.next_offset === nextText) break;
    nextText = chunk.next_offset;
  }
  return { ...view, elements, text, next_element_offset: nextElement, next_offset: nextText,
    elements_truncated: !!nextElement || (view.elements || []).length > maxElements, truncated: !!nextText || (view.text || '').length > maxTextChars };
}

export async function waitHarnessReady(harness, tab, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  let view;
  do {
    view = await harness.call({ op: 'read', tab });
    const loading = /^(?:loading[^\n]*|ページを読み込み中…?)$/i.test((view.text || '').trim());
    if (view.ready === undefined || (view.ready === 'complete' && !loading &&
        ((view.text || '').length || view.elements?.length))) return { view, settled: true };
    if (Date.now() >= deadline) return { view, settled: false };
    await new Promise(r => setTimeout(r, Math.min(1000, deadline - Date.now())));
  } while (true);
}
