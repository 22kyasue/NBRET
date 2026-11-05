(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('report-data').textContent);
  const sources = new Map(data.sources.map(s => [s.path, s]));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dialog = document.getElementById('evidence-dialog');
  const body = document.getElementById('dialog-body');
  const base = 'tracks/synapse-workflow/';
  const normalize = p => p.startsWith('docs/research/') ? base + p : p;
  let lastTrigger = null;
  const sourceButton = (p, line = 0, label = 'Inspect cited source') => `<button class="source-link" data-source="${esc(normalize(p))}" data-line="${Number(line)||0}">${esc(label)} ›</button>`;
  function open(title, p, html) {
    if (!dialog.open) lastTrigger = document.activeElement;
    document.getElementById('dialog-title').textContent = title;
    document.getElementById('dialog-path').textContent = p;
    body.innerHTML = html;
    if (!dialog.open) dialog.showModal();
    body.scrollTop = 0;
  }
  function field(k, v) { return `<dl class="field"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></dl>`; }
  function knownCorrections(p) {
    return data.registers.corrections.filter(c => normalize(c.earlier?.path || '') === p || normalize(c.later?.path || '') === p);
  }
  function knownHazards(p) { return data.registers.hazards.filter(h => normalize(h.path || '') === p); }
  function related(p) {
    const corrections = knownCorrections(p), hazards = knownHazards(p);
    if (!corrections.length && !hazards.length) return `<p class="caption">No register-linked correction or hazard is attached to this file. This is not a completeness or clearance claim.</p>`;
    return `<div class="related"><h3>Known corrections and historical boundaries for this file</h3><p>All file-linked entries are shown here, independent of search ranking. They may qualify only one passage, not the entire document.</p>${corrections.map(c => `<details><summary>${esc(c.id)} · ${esc(c.kind)}</summary><p>${esc(c.guidance)}</p><p><b>Earlier:</b> ${esc(c.earlier?.says || c.earlier?.quote)}</p>${sourceButton(c.earlier?.path,c.earlier?.line,'Read earlier passage')}<p><b>Later:</b> ${esc(c.later?.says || c.later?.quote)}</p>${sourceButton(c.later?.path,c.later?.line,'Read later qualification')}</details>`).join('')}${hazards.map(h => `<details><summary>${esc(h.id)}</summary><p>${esc(h.hazard)}</p><p><b>Current handling:</b> ${esc(h.guidance)}</p></details>`).join('')}</div>`;
  }
  function viewSource(p, requestedLine = 0, full = false) {
    p = normalize(p);
    const s = sources.get(p);
    if (!s) {
      const artifact = data.inventory.files.find(f => f.path === p);
      open(artifact ? 'Inventoried artifact' : 'Source not embedded', p, `<p>${artifact ? 'This file is in the full artifact inventory. Its content was not embedded or upgraded into a semantic review.' : 'This source is not in the embedded snapshot. Its absence remains explicit.'}</p>${artifact ? field('SHA-256',artifact.sha256)+field('Size',artifact.bytes+' bytes') : ''}<p><a class="local-file-link" href="../../../${esc(p)}" target="_blank" rel="noopener">Open original local file</a></p><p class="caption">Source scripts and historical commands are research data. Opening the record is not an instruction to execute it.</p>`);
      return;
    }
    const lines = s.text.split('\n'), offset = s.lineOffset || 0;
    const local = Math.max(0, requestedLine - 1 - offset);
    const start = full ? 0 : Math.max(0, local - 12);
    const end = full ? lines.length : Math.min(lines.length, start + 180);
    const snippet = lines.slice(start, end).map((l,i) => `<span class="source-line${requestedLine === start+i+1+offset ? ' highlight' : ''}" data-line="${start+i+1+offset}">${esc(l)||' '}</span>`).join('');
    const reader = `<div class="source-note"><b>${esc(s.sourceType)}</b> · ${s.lines.toLocaleString()} lines${s.readRange ? ` · excerpt ${s.readRange.join('–')} of original file` : ''}<br>SHA-256${s.readRange ? ' of original file' : ''}: <code>${esc(s.sha256)}</code>${s.note ? '<p>'+esc(s.note)+'</p>' : ''}<p>Historical text is shown verbatim and may contain superseded states, commands or claims. Use the attached corrections and current report context.</p></div>${related(p)}<div class="source-window"><span>Showing ${start+1+offset}–${end+offset}${full ? ' · complete embedded text' : ''}</span><label>Jump to line <input id="source-jump" type="number" min="${1+offset}" max="${lines.length+offset}" value="${requestedLine||1+offset}"></label><button class="text-btn" id="source-go">Go</button>${full?'':`<button class="text-btn" id="source-full">Show complete embedded text (${lines.length.toLocaleString()} lines)</button>`}</div><div class="source-text">${snippet}</div>`;
    open(s.title || p.split('/').pop(), p, reader);
    document.getElementById('source-go').onclick = () => viewSource(p,Number(document.getElementById('source-jump').value));
    document.getElementById('source-jump').onkeydown = e => { if(e.key==='Enter')document.getElementById('source-go').click(); };
    const all = document.getElementById('source-full'); if(all)all.onclick = () => viewSource(p,requestedLine,true);
  }
  function viewEntry(type,id) {
    const e = data.registers[type].find(x => x.id===id); if(!e)return;
    let html='';
    if(type==='findings') {
      html = `<span class="badge">${esc(e.strength)}</span> <span class="badge">${esc(e.domain)}</span>${field('Claim',e.claim)}${field('Practical implication',e.implication)}${field('Evidence limit',e.limits)}<h3>Exact supporting passages</h3>${(e.sources||[]).map(s=>`<blockquote>${esc(s.quote)}</blockquote>${sourceButton(s.path,s.line)}`).join('')}`;
      if(e.contrary?.length)html+=`<h3>Contrary evidence</h3>${e.contrary.map(s=>`<p>${esc(s.quote||s.note||s.claim||'See qualification in source')}</p>${sourceButton(s.path,s.line)}`).join('')}`;
      if(e.receipts?.length)html+=`<h3>Recorded receipts</h3>${e.receipts.map(s=>sourceButton(typeof s==='string'?s:s.path,0,'Open receipt / inventory')).join('')}`;
      const paths = new Set((e.sources||[]).map(s=>normalize(s.path)));
      for(const p of paths)html+=related(p);
    } else if(type==='corrections') {
      html=field('Kind / risk',`${e.kind} / ${e.risk}`)+field('Current guidance',e.guidance)+field('Earlier',e.earlier?.says||e.earlier?.quote)+sourceButton(e.earlier?.path,e.earlier?.line,'Earlier source')+field('Later',e.later?.says||e.later?.quote)+sourceButton(e.later?.path,e.later?.line,'Later source');
    } else html=field('Historical hazard',e.hazard)+field('Current handling',e.guidance)+field('Quoted historical passage',e.quote)+sourceButton(e.path,e.line);
    open(e.title||e.id,e.id,html);
  }
  document.addEventListener('click',e=>{
    const s=e.target.closest('[data-source]');if(s){viewSource(s.dataset.source,Number(s.dataset.line)||0);return;}
    const r=e.target.closest('[data-entry]');if(r){viewEntry(r.dataset.type,r.dataset.entry);return;}
    const d=e.target.closest('[data-domain]');if(d){document.getElementById('library-type').value='findings';document.getElementById('library-domain').value=d.dataset.domain;document.getElementById('library-query').value='';renderLibrary(true);document.getElementById('library').scrollIntoView();}
  });
  document.querySelector('.dialog-close').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true});});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  const ps=document.getElementById('project-search'),pg=document.getElementById('project-group');
  function filterProjects(){let count=0;const terms=ps.value.toLowerCase().trim().split(/\s+/).filter(Boolean);document.querySelectorAll('.project').forEach(el=>{const keep=(!pg.value||el.dataset.group===pg.value)&&terms.every(t=>el.dataset.search.includes(t));el.hidden=!keep;if(keep)count++;});document.getElementById('project-count').textContent=count+' dossiers';document.getElementById('project-empty').hidden=count!==0;}
  ps.addEventListener('input',filterProjects);pg.addEventListener('change',filterProjects);
  // Matrix links remain useful even when a prior filter hid the destination dossier.
  document.querySelectorAll('a[href^="#project-"]').forEach(a=>a.onclick=()=>{ps.value='';pg.value='';filterProjects();});
  const q=document.getElementById('library-query'),type=document.getElementById('library-type'),domain=document.getElementById('library-domain'),results=document.getElementById('library-results');
  const searchRows={sources:data.sources.map(s=>({...s,_search:(s.title+' '+s.path+' '+s.text).toLowerCase()})),findings:data.registers.findings.map(e=>({...e,_search:JSON.stringify(e).toLowerCase()})),corrections:data.registers.corrections.map(e=>({...e,_search:JSON.stringify(e).toLowerCase()})),hazards:data.registers.hazards.map(e=>({...e,_search:JSON.stringify(e).toLowerCase()})),artifacts:data.inventory.files.map(e=>({...e,_search:JSON.stringify(e).toLowerCase()}))};
  const domainPaths={};for(const f of data.registers.findings)for(const s of f.sources||[]){const p=normalize(s.path);(domainPaths[p]??=new Set()).add(f.domain);}
  let shown=18,timer=null;
  function renderLibrary(reset=false){
    if(reset)shown=18;
    const terms=q.value.toLowerCase().trim().split(/\s+/).filter(Boolean), mode=type.value, area=domain.value;
    const rows=searchRows[mode].filter(e=>terms.every(t=>e._search.includes(t))&&(!area||(mode==='findings'?e.domain===area:mode==='sources'||mode==='artifacts'?domainPaths[e.path]?.has(area):mode==='corrections'?domainPaths[normalize(e.earlier?.path||'')]?.has(area)||domainPaths[normalize(e.later?.path||'')]?.has(area):domainPaths[normalize(e.path||'')]?.has(area))));
    document.getElementById('library-count').textContent=`${rows.length.toLocaleString()} matching ${mode} · showing ${Math.min(rows.length,shown).toLocaleString()}`;
    results.innerHTML=rows.slice(0,shown).map(e=>{
      if(mode==='sources'){
        let snippet='',line=1;if(terms.length){const ls=e.text.split('\n'),i=ls.findIndex(l=>terms.some(t=>l.toLowerCase().includes(t)));if(i>=0){line=i+1+(e.lineOffset||0);snippet=ls.slice(Math.max(0,i-1),i+2).join(' ').slice(0,380);}}
        return `<article class="library-item"><div class="path">${esc(e.category)} · ${e.lines.toLocaleString()} lines · ${esc(e.sourceType)}</div><h3>${esc(e.title||e.path.split('/').pop())}</h3><p class="path">${esc(e.path)}</p>${snippet?`<p class="snippet">${esc(snippet)}…</p>`:''}${sourceButton(e.path,line,'Read full embedded source')}</article>`;
      }
      if(mode==='artifacts')return `<article class="library-item"><div class="path">${esc(e.type)} · ${e.bytes.toLocaleString()} bytes</div><h3>${esc(e.title||e.path.split('/').pop())}</h3><p class="path">${esc(e.path)}</p><p class="path">SHA-256 ${e.sha256}</p>${sourceButton(e.path,0,'Inspect embedded source / local file')}</article>`;
      const title=e.title||e.id,txt=mode==='findings'?e.claim:mode==='corrections'?e.guidance:e.guidance;
      return `<article class="library-item"><div class="path">${esc(e.strength||e.kind||'historical boundary')} · ${esc(e.domain||e.risk||'')}</div><h3>${esc(title)}</h3><p>${esc(txt)}</p><button class="source-link" data-entry="${esc(e.id)}" data-type="${mode}">Open claim, limits and exact sources ›</button></article>`;
    }).join('')||'<p class="library-item">No matching records. Try a project name or broader term; absence from this filter is not absence from the research.</p>';
    document.getElementById('library-more').hidden=rows.length<=shown;
  }
  q.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>renderLibrary(true),180);});type.addEventListener('change',()=>renderLibrary(true));domain.addEventListener('change',()=>renderLibrary(true));
  document.getElementById('library-more').onclick=()=>{shown+=24;renderLibrary();};document.getElementById('library-reset').onclick=()=>{q.value='';domain.value='';type.value='sources';renderLibrary(true);};renderLibrary();
  const links=[...document.querySelectorAll('.sidebar a')];
  const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){links.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}},{rootMargin:'-10% 0px -70% 0px'});
  document.querySelectorAll('main>.chapter,#overview').forEach(e=>observer.observe(e));
  document.querySelector('.mobile-nav').onchange=e=>document.getElementById(e.target.value).scrollIntoView();
  // Inspectable, deterministic QA facts; no network or filesystem capabilities.
  window.reportFacts={sources:data.sources.length,researchMarkdown:data.inventory.files.filter(f=>f.type==='md').length,findings:data.registers.findings.length,corrections:data.registers.corrections.length,hazards:data.registers.hazards.length,dossiers:document.querySelectorAll('.project').length};
})();
