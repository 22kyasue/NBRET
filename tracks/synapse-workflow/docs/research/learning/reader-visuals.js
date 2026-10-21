function beginnerHome(){
  const icons=DATA.visuals.icons;
  return '<div class="plain-intro"><h1>Let’s make sense of the research.</h1><p class="lede">We studied how people keep websites safe. Start with one familiar example: <strong>an online shop.</strong></p></div>'+
  '<section class="story" aria-label="Our running example"><div class="story-head">'+icons.shop+'<div><h2>Imagine this is your shop.</h2><p>Alice and Bob are customers. Each should see only their own orders.</p></div></div><ol class="story-stages"><li>'+icons.people+'<strong>Something goes wrong</strong><p>Alice opens an order and sees Bob’s home address.</p></li><li>'+icons.search+'<strong>We investigate</strong><p>How did that happen? Did anyone notice? Who can fix it?</p></li><li>'+icons.shield+'<strong>We check the repair</strong><p>After the change, Alice is refused. Bob can still read his own order.</p></li></ol><p class="story-foot">This is a made-up example. We’ll use it to explain the real research, one idea at a time.</p></section>'+
  '<h2>What would you like to understand?</h2><p class="small">Pick a picture. Each lesson has a short illustrated walkthrough.</p><div class="visual-map">'+DATA.visuals.map+'</div>'+
  '<div class="route"><a class="primary" href="#topic=01">Start with who does what →</a><a class="plain" href="#reading-plan">Give me a reading order</a></div>'+
  '<h2>Four things the research helped us understand</h2><div class="visual-summary"><div><h3>Buying software leaves jobs to do.</h3><p>Someone still needs to watch, decide what a warning means, and respond.</p></div><div><h3>A short report can miss the important part.</h3><p>“Request succeeded” does not tell us whether Alice got her own order or Bob’s.</p></div><div><h3>Asking for a change is one step.</h3><p>Pressing “block” or “stop” needs a follow-up check that it worked.</p></div><div><h3>AI actions need checks too.</h3><p>We need to control what it can do and inspect what actually happened.</p></div></div>'+
  '<section class="panel" id="reading-plan"><h2 style="margin-top:0">Start here. Go at your own pace.</h2><ol class="reading-plan"><li><a href="#topic=01">Who helps keep a website safe?</a><span>Meet the people and tools.</span></li><li><a href="#topic=02">How do people look for weak spots?</a><span>Follow Alice and Bob’s order problem.</span></li><li><a href="#topic=06">When should you believe a result?</a><span>See why a green PASS can mislead.</span></li><li><a href="#topic=08">How do we know a fix worked?</a><span>Repeat the right check after the change.</span></li></ol></section>'+
  '<h2>All eight short lessons</h2><div class="map">'+TOPICS.map(t=>'<a class="topic-card" href="#topic='+t.id+'"><span class="number">'+t.id+'</span><div>'+DATA.visuals.figures[t.id].illustration.replace('class=""','class="topic-thumb"')+'<h3>'+esc(t.title)+'</h3><p>'+esc(t.question)+'</p></div></a>').join('')+'</div>'+
  '<details class="overview-details"><summary>What research is underneath these lessons?</summary><p>There are '+DATA.docs.length+' documents in this snapshot. They include detailed studies, source-code notes, experiments, plans and handoffs. Four technical tracks are still being investigated; the provider study has a bounded delivery checkpoint.</p>'+DATA.overview.tracks.map(t=>'<h3>'+esc(t.title)+'</h3><p>'+esc(t.researched)+'</p><p><strong>What remains open:</strong> '+esc(t.limit)+'</p>'+sourceList(t.sources)).join('')+'<h3>What is NBRET?</h3><p>NBRET is the local tool in this repository. It records website activity and helps inspect and test it. The research asks how to turn those records into useful, repeatable checks.</p>'+sourceList(['2026-10-16-rea-and-security-workflows.md','security-landscape/inventory.md'])+'<p>This is a dated learning guide. Small controlled tests and reading source code do not establish that every real website or product behaves the same way.</p></details><p class="small" style="margin-top:28px"><a href="#library">Search the detailed research</a> · <a href="#notebook">Your saved notes</a></p>';
}

function diagram(t){
  const ex=t.example;
  return '<section class="visual-topic-figure"><header><h3>See it step by step</h3><p>Read the pictures, or press Play steps to follow the sequence.</p></header><iframe class="visual-frame" data-visual="'+t.id+'" title="Illustrated walkthrough: '+esc(t.title)+'" sandbox="allow-scripts"></iframe></section><section class="picture-example" data-example="'+t.id+'"><h3>'+esc(ex.title)+'</h3><p>'+esc(ex.prompt)+'</p><div class="example-choices" role="group" aria-label="Choose an example">'+ex.options.map((o,i)=>'<button type="button" data-example-choice="'+i+'" aria-pressed="'+(i===0)+'">'+esc(o.label)+'</button>').join('')+'</div><div class="example-output" aria-live="polite" aria-atomic="true">'+exampleAnswer(ex.options[0])+'</div></section>';
}
function exampleAnswer(o){return '<div class="example-answer">'+DATA.visuals.icons[o.icon]+'<div><h4>'+esc(o.headline)+'</h4><p>'+esc(o.body)+'</p><div class="example-result">'+esc(o.result)+'</div></div></div>'}
function casePicture(id,index){
  const icon=DATA.visuals.icons;
  const card=(name,body,tag='')=>'<div class="case-card"><strong>'+name+'</strong>'+body+(tag?'<small>'+tag+'</small>':'')+'</div>';
  const row=(a,b)=>'<div class="case-pair">'+a+'<span class="case-arrow" aria-hidden="true">→</span>'+b+'</div>';
  let art='';
  if(id==='01')art=row(card(index===0?'Software':index===1?'People':'An investigation',icon[index===0?'radar':index===1?'people':'search']),card('The job', '<p>'+(index===0?'Notice unusual activity':index===1?'Investigate a warning':'Test an agreed weak spot')+'</p>'));
  if(id==='02')art=row(card('Signed in as Alice',icon.people),card(index===0?'Automatic checks':index===1?'Bob’s order #42':'Defending team',index===1?'<p>Customer: Bob<br>Address: 12 Example Lane</p>':icon[index===0?'radar':'people'],index===0?'May not test the Alice/Bob rule':index===1?'Alice can read someone else’s details':'Did they notice and respond?'));
  if(id==='03')art=row(card('Original exchange','<p>Account: Alice<br>Requested: Bob’s order<br>Reply: Bob’s address</p>'),card('Short report','<p>“One request succeeded.”</p>','Which account? Whose data?'));
  if(id==='04')art='<div class="shared-address"><div class="case-people">'+card('Alice',icon.people)+card('Bob',icon.people)+'</div><span class="case-down" aria-hidden="true">↓</span>'+card(index===0?'Café Wi-Fi':'Alice’s VPN route',icon[index===0?'router':'tunnel'],index===0?'One shared public address':'Alice is still signed in as Alice')+'</div>';
  if(id==='05')art=row(card('Stop request',icon.cancel,'“Please stop job 42.”'),card(index===0?'Worker may continue':'Work was checked',icon[index===0?'worker':'search'],index===0?'Sending the signal is not confirmation':'Account for receipts already created'));
  if(id==='06')art='<div class="response-picture"><div class="response-label">Reply label: <strong>403 — access denied</strong></div><div class="response-body"><span>Content inside the same reply</span><p>Customer: <strong>Bob</strong><br>Address: <strong>12 Example Lane</strong></p></div><div class="response-caption">'+(index===0?'The label says “denied.” What about the data?':'Alice received Bob’s private data. The privacy rule failed.')+'</div></div>';
  if(id==='07')art=row(card('AI assistant',icon.agent,'“Block this account.”'),card(index===0?'A suggestion':'Permission check',icon[index===0?'document':'key'],index===0?'No account has changed':'Allowed? Approval needed? Then check effect.'));
  if(id==='08')art=row(card(index===0?'Old report':'Alice’s request',index===0?'<p>Problem listed</p>':'<p>Bob’s order is refused.</p>'),card(index===0?'New report':'Bob’s own request',index===0?'<p>Problem missing</p>':'<p>His order is shown.</p>',index===0?'Why did it disappear?':'Both sides of the rule were checked'));
  return '<div class="case-picture" aria-label="Fictional visual example">'+art+'</div>';
}
function mountVisuals(){
  document.querySelectorAll('iframe[data-visual]').forEach(frame=>{
    const figure=DATA.visuals.figures[frame.dataset.visual];
    frame.srcdoc=figure.html;
  });
  document.querySelectorAll('[data-example]').forEach(root=>{
    root.querySelector('.example-output').insertAdjacentHTML('afterbegin',casePicture(root.dataset.example,0));
    root.addEventListener('click',e=>{
      const button=e.target.closest('[data-example-choice]');if(!button)return;
      const t=TOPICS.find(t=>t.id===root.dataset.example);
      root.querySelectorAll('[data-example-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      root.querySelector('.example-output').innerHTML=casePicture(t.id,Number(button.dataset.exampleChoice))+exampleAnswer(t.example.options[Number(button.dataset.exampleChoice)]);
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches && e.detail>0)root.querySelector('.example-answer').animate([{opacity:.4,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'cubic-bezier(.23,1,.32,1)'});
    });
  });
}
window.addEventListener('message',event=>{
  if(event.data?.type!=='nbret-figure-size')return;
  const frame=[...document.querySelectorAll('iframe[data-visual]')].find(f=>f.contentWindow===event.source&&f.dataset.visual===event.data.id);
  const height=Number(event.data.height);
  if(frame&&Number.isFinite(height)&&height>=200&&height<=10000)frame.style.height=Math.ceil(height)+2+'px';
});
