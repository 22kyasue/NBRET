const PUB=DATA.publication;
let activePublicationRoute='';
let publicationScrollTimer=0;
function rememberPublicationPosition(){if(!activePublicationRoute)return;state.readingPositions??={};state.readingPositions[activePublicationRoute]=Math.round(window.scrollY);save();}
window.addEventListener('scroll',()=>{clearTimeout(publicationScrollTimer);publicationScrollTimer=setTimeout(rememberPublicationPosition,500);},{passive:true});
window.addEventListener('pagehide',rememberPublicationPosition);
const companyPath=c=>'cybersecurity-firms/'+c.profile;
function readingTime(paths,extra=''){const words=(extra+' '+paths.map(p=>DOCS.get(p)?.text||'').join(' ')).split(/\s+/).length;return Math.max(1,Math.ceil(words/200));}
function companyDocuments(c){return [...new Set([companyPath(c),...c.sections.flatMap(s=>s.docs.map(p=>'cybersecurity-firms/'+p))])];}
function companyCard(c){return '<a class="company-card" href="#company='+c.id+'">'+DATA.visuals.icons[c.icon]+'<div><h3>'+esc(c.name)+'</h3><p>'+esc(c.focus)+'</p><small>'+companyDocuments(c).length+' studies · about '+readingTime(companyDocuments(c))+' min reading</small></div><span aria-hidden="true">↗</span></a>';}
function publicationNav(){
  $('#topic-nav').setAttribute('aria-label','Research chapters');
  $('#topic-nav').innerHTML='<a href="#home" data-publication-link="home">Start here</a><a href="#companies" data-publication-link="companies">Company dossiers</a>'+PUB.chapters.map((c,i)=>'<a href="#chapter='+c.id+'" data-publication-link="'+c.id+'"><span>'+String(i+1).padStart(2,'0')+'</span><span>'+esc(c.title)+'</span></a>').join('')+'<a href="#basics">Short visual introductions</a>';
  $('#resume').onclick=()=>{location.hash=state.lastPublication||'chapter=attacks';};
}
function home(){
  const totalCompanyDocs=new Set(PUB.companies.flatMap(companyDocuments)).size;
  return '<div class="publication-intro"><p class="reading-kicker">A research collection you can work through</p><h1>Inside cybersecurity.</h1><p class="lede">Understand how attacks work, what security companies do, and how to build and reproduce the mechanisms yourself.</p><p class="publication-note">Seven substantial chapters connect the ideas. Eleven company dossiers bring together the full profiles and their technical studies. Short visual introductions are available whenever a topic is new.</p><div class="intro-meta"><span>'+DATA.docs.length+' underlying research documents</span><span>'+totalCompanyDocs+' studies in company dossiers</span><span>Source links and evidence limits retained</span></div><div class="route"><a class="primary" href="#chapter=attacks">Read: how hacking works →</a><a class="plain" href="#companies">Explore the companies</a></div></div>'+
  '<section class="reading-goals"><div>'+DATA.visuals.icons.key+'<h3>Understand the technique</h3><p>What access does someone start with? What boundary fails? What becomes possible?</p></div><div>'+DATA.visuals.icons.repair+'<h3>Reproduce and build it</h3><p>Follow the components, local experiments and implementation decisions.</p></div><div>'+DATA.visuals.icons.people+'<h3>Understand the business</h3><p>Who does the work, what is delivered, and which responsibilities remain with the customer?</p></div></section>'+
  '<h2>A reading route through the whole subject</h2><p class="small">Start at the top for a connected course, or choose the question you care about. Reading estimates include the full studies on that page.</p><div class="chapter-list" id="reading-plan">'+PUB.chapters.map((c,i)=>'<a class="chapter-card" href="#chapter='+c.id+'"><span class="chapter-number">'+String(i+1).padStart(2,'0')+'</span>'+DATA.visuals.icons[c.icon]+'<div><h3>'+esc(c.title)+'</h3><p>'+esc(c.deck)+'</p><small>'+c.studies.length+' full studies + '+c.deeper.length+' further readings · about '+readingTime(c.studies,c.text)+' min</small></div><span aria-hidden="true">→</span></a>').join('')+'</div>'+
  '<div class="section-label"><h2>The individual company research</h2><a class="small" href="#companies">View the dossier index →</a></div><p>Follow each provider from its business and service model into deployment, AI features, action permissions, public code and operating evidence.</p><div class="company-grid">'+PUB.companies.map(companyCard).join('')+'</div>'+
  '<section class="panel"><h3>How to use this collection</h3><p>Read the chapter explanation first. Continue into the full studies beneath it for the technical detail, source links and experiments. In a company dossier, start with what the company sells, then follow its operating model and specific mechanisms.</p><p class="small">Our reconstruction blueprints describe independently implementable designs. They do not claim to recover proprietary systems. Historical figures and product details retain their source dates. A study of code, a vendor description and a controlled experiment establish different things.</p><a href="#basics">Want a short illustrated introduction first? →</a></section>';
}
function companiesPage(){return '<p class="reading-kicker">Business → service delivery → implementation</p><h1>Inside the companies.</h1><p class="lede">Read each provider as a complete dossier: what it sells, how the work happens, which technical mechanisms were researched, and what you could build from that understanding.</p><p>Ten representative providers with Japan relevance, plus a separate GMO Flatt Security supplement. This is a research sample, not an effectiveness ranking.</p><div class="company-grid">'+PUB.companies.map(companyCard).join('')+'</div><h2>Compare them across the same questions</h2>'+sourceList(['cybersecurity-firms/service-process-comparison.md','cybersecurity-firms/history-timelines.md','cybersecurity-firms/financial-anchors.md','cybersecurity-firms/ai-evidence-matrix.md','cybersecurity-firms/selection.md','cybersecurity-firms/coverage-audit.md']);}
function researchStudy(p,id){
  const d=DOCS.get(p);if(!d)return '';
  const rendered=markdown(d.text,p).html.replace(/<h1\b/g,'<h2').replace(/<\/h1>/g,'</h2>').replace(/id="([^"]+)"/g,(_,v)=>'id="'+id+'-'+v+'"');
  return '<section class="full-study" id="'+id+'"><div class="study-topline"><span>Full research study</span><a href="'+docHref(p)+'">Read separately / save →</a></div><article class="document">'+rendered+'</article></section>';
}
function contents(items){return '<nav class="reading-contents" aria-label="On this page"><strong>On this page</strong>'+items.map(([id,label])=>'<button type="button" data-reading-jump="'+id+'">'+esc(label)+'</button>').join('')+'</nav>';}
function flowStrip(items){return '<ol class="publication-flow">'+items.map(([icon,label])=>'<li>'+DATA.visuals.icons[icon]+'<span>'+esc(label)+'</span></li>').join('')+'</ol>';}
function chapterFigure(c){
  const flows={attacks:[['people','Starting access'],['key','A boundary fails'],['server','A new capability'],['document','An observed consequence']],tools:[['laptop','Browser action'],['packet','Request and response'],['document','Saved observation'],['search','Interpretation']],engines:[['key','Scope and identity'],['packet','A selected test'],['search','A meaningful check'],['document','Retained evidence']],operations:[['packet','An event is collected'],['radar','A detection fires'],['people','Someone investigates'],['shield','Response is verified']],agents:[['document','Information arrives'],['agent','A step is proposed'],['key','A permission gate'],['shield','An effect is checked']],replicate:[['shop','Controlled fixture'],['search','Repeatable test'],['queue','Investigation workflow'],['people','Service delivery']]};
  if(c.id==='services')return '<div class="service-comparison"><div>'+DATA.visuals.icons.radar+'<strong>Product</strong><p>A capability you operate.</p></div><div>'+DATA.visuals.icons.people+'<strong>Managed service</strong><p>People operating agreed controls.</p></div><div>'+DATA.visuals.icons.search+'<strong>Assessment</strong><p>An investigation into a defined question.</p></div></div>';
  return '<figure class="chapter-figure">'+flowStrip(flows[c.id])+'<figcaption>A conceptual reading path. Each transition has prerequisites; the full studies distinguish documented mechanisms, inspected code and tested outcomes.</figcaption></figure>';
}
function companyPage(c){
  const paths=companyDocuments(c);
  const toc=[['company-overview','What the company does'],['company-build','How to reproduce the capability'],['implementation-notebook','Implementation notebook & checks'],['company-profile','The full company profile'],...c.sections.map((s,i)=>['company-section-'+i,s.title])];
  return '<div class="publication-breadcrumb"><a href="#companies">← All companies</a><span>'+paths.length+' studies · about '+readingTime(paths)+' min</span></div><h1>'+esc(c.name)+'</h1><p class="lede">'+esc(c.focus)+'</p>'+contents(toc)+
  '<section id="company-overview" class="company-primer"><h2>What this company does</h2><p>'+esc(c.plain)+'</p><h3>How the technical work happens</h3><p>'+esc(c.mechanism)+'</p>'+flowStrip([['packet','Collect information'],['search','Investigate'],['key','Decide and authorize'],['shield','Act and verify']])+'<p class="small">A teaching framework for reading this dossier. The original studies below identify the provider-specific workflow, documented stages and unknowns.</p></section>'+
  '<section id="company-build" class="reconstruction"><h2>How you could reproduce the capability</h2><p>'+esc(c.build)+'</p><h3>What it takes to deliver it as a service</h3><p>'+esc(c.service)+'</p><p class="small">This is our independent design synthesis, grounded in the linked research. It is not proprietary source code, a production-ready clone or evidence of equivalent effectiveness.</p><a href="#chapter=replicate">Work through the implementation projects →</a></section>'+
  implementationNotebook(c)+researchStudy(companyPath(c),'company-profile')+
  c.sections.map((s,i)=>'<section id="company-section-'+i+'" class="dossier-section"><h2>'+esc(s.title)+'</h2>'+s.docs.map((p,j)=>researchStudy('cybersecurity-firms/'+p,'company-study-'+i+'-'+j)).join('')+'</section>').join('')+
  '<section class="panel"><h3>Place this company in context</h3>'+sourceList(['cybersecurity-firms/history-timelines.md','cybersecurity-firms/financial-anchors.md','cybersecurity-firms/service-process-comparison.md','cybersecurity-firms/ai-evidence-matrix.md'])+'</section><div class="topic-end"><a href="#companies">← Company dossiers</a><a href="#chapter=services">Understand the service categories →</a></div>';
}
function implementationNotebook(c){
  const b=PUB.blueprints[c.id];
  return '<section class="implementation-notebook" id="implementation-notebook"><p class="reading-kicker">Independent reconstruction design</p><h2>Implementation notebook</h2><p>'+esc(b.goal)+'</p><h3>A starting data contract</h3><pre><code>'+esc(b.input)+'</code></pre><p class="small">Illustrative schema for your own prototype, not a proprietary vendor API.</p><h3>The pieces to implement</h3><ol>'+b.components.map(([name,text])=>'<li><h4>'+esc(name)+'</h4><p>'+esc(text)+'</p></li>').join('')+'</ol><h3>A concrete exercise</h3><p>'+esc(b.exercise)+'</p><h3>Checks before you call it working</h3><ul>'+b.checks.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><p class="small">The complete studies that follow explain the documented behavior and the limits behind this design. The prototype itself is proposed unless an executed receipt is supplied.</p></section>';
}
function chapterPage(c){
  const i=PUB.chapters.indexOf(c);
  const intro=markdown(c.text,'learning/chapters/'+c.guide).html.replace(/^<h1[^>]*>.*?<\/h1>\n?/,'');
  const toc=[['chapter-explanation','The connected explanation'],...c.studies.map((p,j)=>['chapter-study-'+j,title(p)]),['chapter-deeper','Further technical reading']];
  return '<div class="publication-breadcrumb"><a href="#home">← Research chapters</a><span>Chapter '+(i+1)+' · about '+readingTime(c.studies,c.text)+' min</span></div><h1>'+esc(c.title)+'</h1><p class="lede">'+esc(c.deck)+'</p>'+chapterFigure(c)+contents(toc)+'<section id="chapter-explanation" class="chapter-explanation document">'+intro+'</section>'+
  (c.id==='replicate'?'<section class="lab-downloads"><h3>The runnable teaching lab</h3><p>Node.js is already used by this repository. These files contain the entire lab and its repeatable checks.</p><a href="labs/order-access-lab.mjs" download>Download the lab source</a><a href="labs/verify-order-lab.mjs" download>Download its verification script</a><button type="button" id="show-lab-source">Read the full lab code here</button><pre id="lab-source" hidden><code>'+esc(DATA.publication.labSource)+'</code></pre></section>':'')+
  (c.id==='replicate'?'<article class="document service-exercise">'+markdown(PUB.serviceExercise,'learning/labs/SERVICE-EXERCISE.md').html.replace(/<h1\b/g,'<h2').replace(/<\/h1>/g,'</h2>')+'</article>':'')+
  '<div class="research-section-break"><h2>Continue into the full research</h2><p>These are the complete studies, including original references and limits. The explanation above is a route into this material; it does not replace it.</p></div>'+c.studies.map((p,j)=>researchStudy(p,'chapter-study-'+j)).join('')+
  '<section id="chapter-deeper"><h2>Further technical reading</h2>'+sourceList(c.deeper)+'</section><div class="topic-end">'+(i?'<a href="#chapter='+PUB.chapters[i-1].id+'">← '+esc(PUB.chapters[i-1].title)+'</a>':'<a href="#home">← Research overview</a>')+(i<PUB.chapters.length-1?'<a href="#chapter='+PUB.chapters[i+1].id+'">Next: '+esc(PUB.chapters[i+1].title)+' →</a>':'<a href="#companies">Explore the companies →</a>')+'</div>';
}
function route(){
  clearTimeout(publicationScrollTimer);rememberPublicationPosition();activePublicationRoute='';
  const raw=location.hash.slice(1),params=new URLSearchParams(raw);
  const company=PUB.companies.find(c=>c.id===params.get('company'));
  const chapter=PUB.chapters.find(c=>c.id===params.get('chapter'));
  if(!company&&!chapter&&raw!=='companies'&&raw!=='basics'){baseRoute();document.querySelectorAll('[data-publication-link]').forEach(a=>a.classList.toggle('active',a.dataset.publicationLink==='home'&&(!raw||raw==='home')));return;}
  if(company){$('#content').innerHTML=companyPage(company);document.title=company.name+' — research dossier';}
  else if(chapter){$('#content').innerHTML=chapterPage(chapter);document.title=chapter.title+' — NBRET';}
  else if(raw==='companies'){$('#content').innerHTML=companiesPage();document.title='Company dossiers — NBRET';}
  else{$('#content').innerHTML=beginnerHome();document.title='Short visual introductions — NBRET';}
  if(company||chapter){state.lastPublication=raw;save();}
  document.querySelectorAll('[data-publication-link]').forEach(a=>a.classList.toggle('active',a.dataset.publicationLink===(company||raw==='companies'?'companies':chapter?.id)));
  document.querySelectorAll('[data-reading-jump]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.readingJump)?.scrollIntoView());
  const sourceButton=$('#show-lab-source');if(sourceButton)sourceButton.onclick=()=>{const p=$('#lab-source');p.hidden=!p.hidden;sourceButton.textContent=p.hidden?'Read the full lab code here':'Hide lab code';};
  mountVisuals();window.scrollTo(0,0);
  if(company||chapter){activePublicationRoute=raw;requestAnimationFrame(()=>window.scrollTo(0,state.readingPositions?.[raw]||0));}
}
