import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, symlink, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { readJournal, createJournal, appendEvent } from '../src/investigation/journal.mjs';
import { replay, applyEvent } from '../src/investigation/records.mjs';
import { renderInvestigation } from '../src/investigation/report.mjs';

const cli = resolve('src/investigation/cli.mjs');
const manifest = () => ({ schemaVersion: 1, kind: 'nbret-investigation', id: 'practice-1',
  target: 'http://127.0.0.1:39999', mode: 'practice', createdAt: '2026-10-18T20:00:00.000Z',
  limitations: ['No target execution authorized or performed.'] });
const run = args => spawnSync(process.execPath, [cli, ...args], { windowsHide: true, encoding: 'utf8', timeout: 10000 });

test('offline CLI persists a record, resumes by replay, exports and rejects stale append/overwrite', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-offline-cli-'));
  try {
    const input = join(root, 'manifest.json'), directory = join(root, 'journal'), out = join(root, 'report');
    await writeFile(input, JSON.stringify(manifest()));
    const init = run(['init','--manifest',input,'--out',directory]);
    assert.equal(init.status, 0, init.stderr);
    const initial = JSON.parse(init.stdout);
    const eventFile = join(root, 'event.json');
    await writeFile(eventFile, JSON.stringify({ id:'event-1', at:'2026-10-18T20:01:00.000Z',
      actor:{id:'operator-1',role:'operator'},type:'progress.recorded',payload:{note:'Inspected supplied documentation only.',minutes:2} }));
    const args = ['append','--run',directory,'--event',eventFile,'--revision','0','--head',initial.head];
    const appended = run(args);
    assert.equal(appended.status,0,appended.stderr);
    assert.equal(JSON.parse(appended.stdout).revision,1);
    assert.equal(run(args).status,2,'stale CAS must reject even an identical retry');
    const status = run(['status','--run',directory]);
    assert.equal(status.status,0,status.stderr);
    assert.equal(JSON.parse(status.stdout).revision,1);
    const exported = run(['report','--run',directory,'--out',out]);
    assert.equal(exported.status,0,exported.stderr);
    const saved = JSON.parse(await readFile(join(out,'records.json'),'utf8'));
    assert.equal(saved.head,(await readJournal(directory)).head);
    const md = await readFile(join(out,'REPORT.md'),'utf8');
    assert.match(md,/OFFLINE FOUNDATION/);
    assert.match(md,/not a clean assessment result/);
    assert.match(md,/event\\-1/);
    assert.equal(run(['report','--run',directory,'--out',out]).status,2);
    assert.equal(await readFile(join(out,'REPORT.md'),'utf8'),md);
    const nested=join(directory,'export');
    assert.equal(run(['report','--run',directory,'--out',nested]).status,2);
    await assert.rejects(lstat(nested),{code:'ENOENT'});
    assert.equal(run(['report','--run',directory,'--out',directory]).status,2);
    const alias=join(root,'journal-alias');
    await symlink(directory,alias,'junction');
    assert.equal(run(['report','--run',directory,'--out',join(alias,'export')]).status,2);
    await assert.rejects(lstat(nested),{code:'ENOENT'});
    assert.equal((await readJournal(directory)).revision,1,'rejected nested exports leave journal usable');
    assert.equal(run(['init','--manifest',input,'--out',join(directory,'nested-journal')]).status,2);
    await assert.rejects(lstat(join(directory,'nested-journal')),{code:'ENOENT'});
    const second=join(root,'second-journal');
    assert.equal(run(['init','--manifest',input,'--out',second]).status,0);
    assert.equal(run(['report','--run',directory,'--out',join(second,'export')]).status,2);
    await assert.rejects(lstat(join(second,'export')),{code:'ENOENT'});
    assert.equal((await readJournal(second)).revision,0,'exports must not poison another journal');
    assert.equal(run(['run','--run',directory]).status,2,'no executor command');
    assert.equal(run(['status','--run',directory,'--unknown','x']).status,2);
    await writeFile(eventFile,JSON.stringify({id:'event-2',at:'2026-10-18T20:02:00.000Z',actor:{id:'operator-1',role:'operator'},type:'review.recorded',payload:{leadId:'missing'}}));
    const current=JSON.parse(status.stdout);
    assert.equal(run(['append','--run',directory,'--event',eventFile,'--revision','1','--head',current.head]).status,2);
    assert.equal((await readJournal(directory)).revision,1,'invalid semantic event never commits');
  } finally { await rm(root,{recursive:true,force:true}); }
});

test('renderer treats supplied markup as text and makes provenance limits visible', () => {
  const m=manifest(); m.limitations=['<script>alert(1)</script> [click](javascript:alert(1))'];
  const result=renderInvestigation({manifest:m,events:[],revision:0,head:'a'.repeat(64)});
  assert.doesNotMatch(result.markdown,/<script>/);
  assert.doesNotMatch(result.markdown,/\[click\]\(javascript:/);
  assert.match(result.markdown,/do not enforce session/);
  assert.equal(result.projection.revision,0);
});

test('populated review package preserves disagreements, requests and separate owner verification', async () => {
  const root=await mkdtemp(join(tmpdir(),'nbret-offline-package-'));
  try {
    const directory=join(root,'journal');
    let snapshot=await createJournal(directory,manifest());
    const add=async(type,payload,who='investigator-1',role='investigator')=>{
      const event={id:`event-${snapshot.revision+1}`,at:'2026-10-18T20:01:00.000Z',actor:{id:who,role},type,payload};
      snapshot=await appendEvent(directory,event,{expectedRevision:snapshot.revision,expectedHead:snapshot.head,
        validate:(s,e)=>{applyEvent(replay(s.manifest,s.events),e);}});
    };
    await add('lead.recorded',{id:'lead-1',title:'Record completeness question',question:'Does the supplied record support the interpretation?',
      environment:'local-revision-1',identity:'fictional-user-A',observed:'Supplied observation has not been independently authenticated.',possibleConsequences:['Interpretation might be wrong.'],limitations:['Offline declarations only.']});
    await add('evidence.recorded',{id:'evidence-1',leadId:'lead-1',artifactDigest:'a'.repeat(64),producerId:'observer-2',
      environment:'local-revision-1',identity:'fictional-user-A',completeness:'complete',source:'operator-supplied',description:'Fictional declared evidence; no file opened.'});
    await add('review.recorded',{leadId:'lead-1',decision:'needs-action',rationale:'Need clarification.',evidenceIds:['evidence-1'],objections:['Origin remains unverified.']},'reviewer-1','reviewer');
    await add('request.recorded',{id:'request-1',leadId:'lead-1',question:'Confirm the record origin.',reason:'A digest does not authenticate a producer.'});
    await add('review.recorded',{leadId:'lead-1',decision:'supported',rationale:'Declared record is consistent.',evidenceIds:['evidence-1'],objections:['Still a declaration.']},'reviewer-1','reviewer');
    let status=run(['status','--run',directory]);
    assert.equal(status.status,0,status.stderr);
    assert.equal(JSON.parse(status.stdout).counts.reviewSupported,1);
    assert.equal(JSON.parse(status.stdout).counts.pendingRequests,1);
    let rendered=renderInvestigation(snapshot);
    assert.match(rendered.markdown,/Record completeness question/);
    assert.match(rendered.markdown,/Origin remains unverified/,'earlier objections survive newer support');
    assert.match(rendered.markdown,/Still a declaration/);
    assert.match(rendered.markdown,/Confirm the record origin/);
    await add('verification.recorded',{leadId:'lead-1',result:'not-reproduced',instructions:'Compare the supplied fictional records manually.',
      expected:'Consistent record.',observed:'Owner could not confirm consistency.',limitations:['No target activity.']},'kotaro','operator');
    status=run(['status','--run',directory]);
    assert.equal(JSON.parse(status.stdout).counts.reviewSupported,0);
    assert.equal(JSON.parse(status.stdout).counts.needsAction,1);
    rendered=renderInvestigation(snapshot);
    assert.equal(rendered.projection.summary.needsAction.length,1);
    assert.match(rendered.markdown,/Owner could not confirm consistency/);
    assert.match(rendered.markdown,/Compare the supplied fictional records manually/);
    await add('run.stopped',{reason:'Record exercise complete.'},'kotaro','operator');
    const stop=JSON.parse(run(['status','--run',directory]).stdout);
    assert.ok(stop.stopped);
    assert.equal(stop.counts.needsAction,1);
  } finally {await rm(root,{recursive:true,force:true});}
});
