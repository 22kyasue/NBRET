export const riskyControl = /(?:delete|remove|purchase|checkout|pay|logout|log.out|sign.out|unsubscribe|submit|send|publish|install|destroy|reset|cancel|confirm|approve|revoke|保存|削除|購入|支払|送信|公開|登録|ログアウト)/i;

export function validateInteractions(interactions, { allowFill = false } = {}) {
  if (!Array.isArray(interactions) || interactions.length > 30 || interactions.some(i =>
    !i || !(allowFill ? ['click', 'hover', 'fill'] : ['click', 'hover']).includes(i.type) ||
    typeof i.name !== 'string' || !i.name.trim() || i.name.length > 300 || riskyControl.test(i.name) ||
    (i.type === 'fill' && (typeof i.value !== 'string' || i.value.length > 5000)) ||
    (i.timeoutMs !== undefined && (!Number.isSafeInteger(i.timeoutMs) || i.timeoutMs < 0 || i.timeoutMs > 10000)) ||
    (i.tag !== undefined && !['a', 'button', 'input', 'textarea', 'select'].includes(i.tag)))) {
    throw new Error('Interactions require exact bounded non-destructive click/hover names');
  }
  for (const i of interactions) if (i.expect !== undefined) {
    if (!i.expect || typeof i.expect !== 'object' || Array.isArray(i.expect) || Object.entries(i.expect).some(([k, v]) =>
      !['textIncludes', 'elementName', 'urlIncludes', 'fieldValueEquals'].includes(k) || typeof v !== 'string' || !v.length || v.length > 3000)) throw new Error('Invalid UI expectation');
  }
}

export function evaluateUiExpect(view, expect = {}, { controlName } = {}) {
  return Object.entries(expect).map(([kind, value]) => ({ assertion: kind,
    outcome: (kind === 'textIncludes' ? (view.text || '').includes(value) : kind === 'elementName' ?
      (view.elements || []).some(e => e.name === value) : kind === 'urlIncludes' ? (view.url || '').includes(value) :
      kind === 'fieldValueEquals' ? (view.elements || []).some(e => e.name === controlName && ['input', 'textarea'].includes(e.tag) && e.type !== 'password' && e.value === value) : false) ? 'passed' : 'failed' }));
}
