import sys,json,hashlib
from pathlib import Path
sys.path.insert(0,r'C:/Users/kotar/githubprojects/prompt/scripts/archive')
import push
s=push.client()
root=Path(__file__).parent/'references'
keys=['snapshots/linear-webapp/2026-10-02/study.json','snapshots/og-x-recreate-20261016-cedar-disarto-support-analytics-dashboard/2026-10-16/study.json','snapshots/saved-design-split-view/2026-10-13/study.json']
for n,key in enumerate(keys):
 m=json.loads(s.get_object(Bucket=push.BUCKET,Key=key)['Body'].read());d=root/str(n);d.mkdir(parents=True,exist_ok=True);(d/'manifest.json').write_text(json.dumps(m,indent=2),encoding='utf8')
 entries=m['entries']; chosen=[e for e in entries if e['path'].endswith(('.png','.jpg','.webp')) and e.get('bytes',0)<2500000][:5]
 for e in chosen:
  b=s.get_object(Bucket=push.BUCKET,Key=push.blob_key(e['sha256']))['Body'].read()
  assert hashlib.sha256(b).hexdigest()==e['sha256'] and len(b)==e['bytes']
  p=d/Path(e['path']).name;p.write_bytes(b);print(str(p),flush=True)
 print(json.dumps({'key':key,'entries':len(entries),'images':len(chosen),'paths':[e['path'] for e in entries[:18]]}),flush=True)
