// Read-only local diagnostic metadata. Never reads authentication stores.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
const db=new DatabaseSync('C:/Users/kotar/.codex/logs_2.sqlite',{readOnly:true});
const ids=['01a14b2b-396f-73e0-9a37-379a502b2b9c','01a14b36-083f-7103-be7f-3fccb88c196a','01a14b39-c3dc-7142-b619-419d04ad875d','01a14b6a-0a4b-7491-b9ef-b92311ef9a72','01a14b6a-7451-7602-8b7e-3abc7516c9da','01a14c28-5021-7be3-9001-c20968039d9c'];
const q=db.prepare(`SELECT id,ts,level,target,thread_id,feedback_log_body FROM logs WHERE thread_id IN (${ids.map(()=>'?').join(',')}) AND (level='WARN' OR level='ERROR') AND (lower(feedback_log_body) LIKE '%safety%' OR lower(feedback_log_body) LIKE '%cyber_policy%' OR lower(feedback_log_body) LIKE '%content_filter%' OR lower(feedback_log_body) LIKE '%policy violation%' OR lower(feedback_log_body) LIKE '%blocked%') ORDER BY ts LIMIT 40`);
const rows=q.all(...ids).map(r=>{const s=r.feedback_log_body||'';const at=s.search(/safety|cyber_policy|content_filter|policy violation|blocked/i);return {id:r.id,time:new Date(Number(r.ts)*1000).toISOString(),level:r.level,target:r.target,thread:r.thread_id,excerpt:s.slice(Math.max(0,at-100),at+450)};});
const result={scope:'Read-only exact six-thread WARN/ERROR diagnostic search for named safety-related terms; not full product/account telemetry.',matches:rows};
fs.writeFileSync(new URL('./diagnostic-search.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
db.close();
