// Read-only audit of user-visible transcript items; never exports reasoning items.
import fs from 'node:fs';
import path from 'node:path';
const base='C:/Users/kotar/.codex/sessions/2026/10/17';
const ids={Rowan:'01a14b2b',Tomo:'01a14b36',Agate:'01a14b39',Linden:'01a14b6a-0a4b',Lark:'01a14b6a-7451',Pearl:'01a14c28'};
const text=p=>{const v=p.content||p.output||[];return typeof v==='string'?v:Array.isArray(v)?v.filter(c=>['input_text','output_text'].includes(c.type)).map(c=>c.text||'').join('\n'):'';};
const strong=/Operation did not complete successfully because|violates? (?:our |the )?(?:content|safety|usage) polic|(?:cannot|can't|unable to) (?:assist|help|comply|continue with|provide (?:instructions|assistance))|content_policy_violation|safety_violation|blocked by (?:safety|policy)|rejected by (?:safety|policy)|automatic approval review rejected|potentially unwanted software/ig;
const report=/safety warning|safety pause|paused again|got paused|is stopped|was stopped|are getting stopped|stopped because|getting blocked|flagged operation stopped|permitted alternative tasks|independent permitted tasks/i;
const result={scope:'Selected Oct17 research rollouts, message and tool-result records only. Internal reasoning is excluded.',sessions:[],toolCandidates:[],humanReports:[],refusalCandidates:[]};
for(const [name,prefix] of Object.entries(ids)){
 const file=fs.readdirSync(base).find(n=>n.includes(prefix));if(!file)continue;
 const lines=fs.readFileSync(path.join(base,file),'utf8').split('\n');
 const counts={messages:0,toolResults:0};
 for(let i=0;i<lines.length;i++){
  if(!lines[i])continue;const r=JSON.parse(lines[i]);if(r.type!=='response_item')continue;const p=r.payload;
  const ref={session:name,timestamp:r.timestamp,file,line:i+1};
  if(p.type==='message'&&p.role==='user'){
   counts.messages++;const s=text(p);
   if(s.length<1000&&!s.includes('<kokuban-message')&&!s.includes('<hook_prompt')&&report.test(s))result.humanReports.push({...ref,text:s});
  }
  if(p.type==='message'&&p.role==='assistant'){
   counts.messages++;const s=text(p);const matches=[...s.matchAll(strong)];
   if(matches.length&&s.length<4000)result.refusalCandidates.push({...ref,text:s});
  }
  if(p.type==='custom_tool_call_output'){
   counts.toolResults++;const s=text(p);const matches=[...s.matchAll(strong)];
   for(const m of matches.slice(0,3))result.toolCandidates.push({...ref,callId:p.call_id,excerpt:s.slice(Math.max(0,m.index-130),m.index+400),outputChars:s.length});
  }
 }
 result.sessions.push({session:name,file,...counts});
}
fs.writeFileSync(new URL('./candidate-records.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({sessions:result.sessions,humanReports:result.humanReports,toolCandidateCount:result.toolCandidates.length,refusalCandidateCount:result.refusalCandidates.length},null,2));
