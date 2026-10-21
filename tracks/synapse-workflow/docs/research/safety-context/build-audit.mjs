import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const dir=import.meta.dirname, root=path.resolve(dir,'../../..');
const data=JSON.parse(fs.readFileSync(path.join(dir,'audit.json'),'utf8'));
const candidates=JSON.parse(fs.readFileSync(path.join(dir,'candidate-records.json'),'utf8'));
const remoteFile=path.join(root,'runs/cybersecurity-firms-20261017/visible-rejection-audit.json');
const remote=fs.existsSync(remoteFile)?JSON.parse(fs.readFileSync(remoteFile,'utf8')).entries:[];
for(const r of data.references)if(r.path&&!fs.existsSync(path.join(root,r.path)))throw Error('Missing source '+r.path);
const receipt=JSON.parse(fs.readFileSync(path.join(root,'docs/research/security-landscape/deep-review/nuclei-composition-lab-receipt.json'),'utf8'));
if(receipt.exit!==1||receipt.tests.length!==0)throw Error('Endpoint receipt changed');
const logPath=path.join(root,'runs/nuclei-composition-research-1792267301095/test.jsonl');
const log=fs.readFileSync(logPath);const logHash=crypto.createHash('sha256').update(log).digest('hex');
if(logHash!==receipt.logSha256||!log.toString('utf8').includes('Operation did not complete successfully because the file contains a virus or potentially unwanted software.'))throw Error('Original endpoint log verification failed');
const base='C:/Users/kotar/.codex/sessions/2026/10/17';
const transcripts=[];
for(const [session,name]of Object.entries(data.sessions)){
 const bytes=fs.readFileSync(path.join(base,name));const lines=bytes.toString('utf8').split('\n');
 for(const ref of data.references.filter(r=>r.session===session)){
  const record=JSON.parse(lines[ref.line-1]);
  if(record.timestamp!==ref.time)throw Error('Reference timestamp mismatch '+ref.id);
  if(ref.excerpt){const p=record.payload;const t=(p.content||[]).map(c=>c.text||'').join('\n');if(!t.includes(ref.excerpt))throw Error('Reference excerpt mismatch '+ref.id);}
 }
 transcripts.push({session,file:name,bytes:bytes.length,lines:lines.filter(Boolean).length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),note:'Read-only snapshot; active session may append later. Internal reasoning is not exported.'});
}
const bundle={...data,generated:new Date().toISOString(),remote,sessionsReviewed:candidates.sessions};
const serialized=JSON.stringify(bundle).replaceAll('<','\\u003c');
const template=fs.readFileSync(path.join(dir,'audit.template.html'),'utf8');
const output=template.replace('<!-- AUDIT_DATA -->',()=>`<script type="application/json" id="audit-data">${serialized}</script>`);
fs.writeFileSync(path.join(dir,'index.html'),output);
const verification={generated:bundle.generated,eventCards:data.events.length,remoteEntries:remote.length,originalPolicyNotice:'Not recovered in examined user-visible records; absence is not proof no UI notice occurred',endpointLogHashVerified:logHash,referencesChecked:data.references.length,transcripts,outputSha256:crypto.createHash('sha256').update(output).digest('hex')};
fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify(verification,null,2)+'\n');
const markdown=`# Why did the research stop?\n\n${data.finding}\n\nOpen [the HTML timeline](index.html) for expandable context, evidence and classification.\n\n## Timeline\n\n| Time (UTC, 2026-10-17) | Session | What is actually established |\n| --- | --- | --- |\n${data.events.map(e=>`| ${e.time.slice(11,19)} (${e.timeKind}) | ${e.actor} | ${e.title}. ${e.label}. |`).join('\n')}\n\n## Interpretation\n\n${data.interpretation.map(x=>`### ${x.title}\n\n${x.text}`).join('\n\n')}\n\n## Evidence and scope\n\n${data.scope}\n\n${data.limits.map(x=>'- '+x).join('\n')}\n\nThe build verifies transcript timestamps/selected visible excerpts and the original endpoint-error log hash. It does not infer hidden classifier reasoning. Regex candidates were manually classified: quoted refusal examples in upstream source, contract language, and repeated reads of the same error are not new blocks. The first extraction helper had a string-vs-array shape error and was corrected; that was an ordinary local audit-script failure.\n\n[Audit data](audit.json), [candidate extraction](candidate-records.json), [verification](verification.json). Original session paths and line numbers are recorded; full transcripts and internal reasoning are not embedded in the HTML. No blocked action was retried.\n\n## Official context\n\n${data.policySources.map(x=>`- [${x.title}](${x.url}): ${x.point}`).join('\n')}\n\nPublic documentation checked during this audit. General policy descriptions do not identify the cause of a particular session event. API safeguards are not automatically Codex safeguards. Account status is unavailable.\n`;
fs.writeFileSync(path.join(dir,'README.md'),markdown);
console.log(JSON.stringify({output:path.join(dir,'index.html'),events:data.events.length,remote:remote.length,references:data.references.length,verifiedEndpointHash:true}));
