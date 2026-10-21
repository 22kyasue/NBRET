// Result-first presentation for a reviewed workflow summary. No activity counters.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeLink = value => {
  if (/^https?:\/\//.test(value || '')) return esc(value);
  if (/^[a-zA-Z0-9_-]+\.html(?:#[a-zA-Z0-9_-]+)?$/.test(value || '')) return esc(value);
  return '#';
};
export function renderReaderReport(summary) {
  const cards = (summary.results || []).map(r => `<article><p class="label">${esc(r.basis)}</p><h2>${esc(r.title)}</h2><p>${esc(r.explanation)}</p></article>`).join('');
  const rows = (summary.pages || []).map(p => `<tr><td><a href="${safeLink(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a></td><td>${esc(p.purpose)}</td><td>${esc(p.access)}</td></tr>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(summary.title)}</title><style>
  :root{font:17px/1.65 system-ui,sans-serif;color:#243433;background:#f4f6f3}*{box-sizing:border-box}body{margin:0}main{max-width:920px;margin:auto;padding:64px 28px}header{max-width:760px;margin-bottom:38px}.eyebrow,.label{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#537368;font-weight:650}h1{font-size:clamp(36px,6vw,56px);line-height:1.08;letter-spacing:-.045em;margin:14px 0 22px}h2{font-size:24px;line-height:1.3;letter-spacing:-.025em;margin:8px 0 12px}p{margin:10px 0}.lead{font-size:22px;line-height:1.5}nav{display:flex;gap:22px;flex-wrap:wrap;margin:28px 0}a{color:#225d4a;text-underline-offset:4px}section{margin:38px 0}article,.panel{background:#fff;border:1px solid #dce3da;border-radius:14px;padding:25px 28px;margin:16px 0}.flow{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.flow span{background:#e5eee5;padding:10px 16px;border-radius:7px}.flow b{color:#7a8c80;font-weight:400}.table{overflow:auto}table{width:100%;border-collapse:collapse;font-size:15px}th,td{text-align:left;padding:16px 12px;border-bottom:1px solid #dce3da;vertical-align:top}th{font-weight:600;color:#537368}li{margin:12px 0}footer{border-top:1px solid #dce3da;margin-top:44px;padding-top:22px;font-size:14px;color:#627168}details{margin-top:22px}summary{cursor:pointer;color:#225d4a}@media(max-width:600px){main{padding:32px 20px}.panel,article{padding:21px}.lead{font-size:20px}.flow{gap:8px}th,td{padding:12px 8px}}@media print{nav,footer details{display:none}article{break-inside:avoid}}
  </style></head><body><main><header><div class="eyebrow">Website understanding · TOBIRA</div><h1>${esc(summary.title)}</h1><p class="lead">${esc(summary.conclusion)}</p><nav><a href="#results">What we learned</a><a href="#access">Pages & access</a><a href="#next">What to check next</a></nav></header>
  <section aria-label="The visitor journey"><div class="flow">${(summary.journey || []).map((s,i)=>`${i?'<b aria-hidden="true">→</b>':''}<span>${esc(s)}</span>`).join('')}</div></section>
  <section id="results">${cards}</section>
  <section id="access"><h2>Pages and access</h2><p>${esc(summary.accessIntroduction)}</p><div class="panel table"><table><thead><tr><th>Page</th><th>What it is for</th><th>What we know about access</th></tr></thead><tbody>${rows}</tbody></table></div></section>
  <section id="next" class="panel"><h2>What to check next</h2><ul>${(summary.nextChecks || []).map(s=>`<li>${esc(s)}</li>`).join('')}</ul></section>
  <footer><p>${esc(summary.scope)}</p><details><summary>Technical evidence, if you want it</summary><p>${esc(summary.evidenceExplanation)}</p><a href="${safeLink(summary.technicalReport || 'TECHNICAL.html')}">Open the detailed evidence report</a></details></footer></main></body></html>`;
}
