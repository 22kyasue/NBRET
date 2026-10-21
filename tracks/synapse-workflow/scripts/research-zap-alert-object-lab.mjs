import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {resolve,join,delimiter} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const out=resolve(`runs/zap-alert-object-research-${Date.now()}`);mkdirSync(out);
const install=resolve('.tools/ZAP_2.17.0'),java='C:/Users/kotar/AppData/Local/Programs/BurpSuite/jre/bin/java.exe';
const source=`import org.parosproxy.paros.core.scanner.Alert;
import java.util.Map;
public class AlertObjectResearch {
 static void check(boolean value,String label){if(!value)throw new AssertionError(label);System.out.println("PASS "+label);}
 public static void main(String[] args){
  Alert a=new Alert(1);Alert b=new Alert(2);a.setName("one");b.setName("two");
  check(a.equals(b),"unset_ids_equal");check(a.hashCode()!=b.hashCode(),"equal_objects_different_hashes");
  a.setAlertId(1);b.setAlertId(2);check(!a.equals(b),"assigned_id_control_differs");
  a.setAlertRef("1-custom");a.setSourceHistoryId(123);Alert copied=a.newInstance();
  check(copied.getAlertRef().equals("1"),"clone_custom_reference_defaults");check(copied.getSourceHistoryId()==0,"clone_explicit_source_history_lost");
  check(a.getAlertRef().equals("1-custom")&&a.getSourceHistoryId()==123,"original_identity_control_unchanged");
  Alert s=new Alert(3);check(!s.isSystemic(),"systemic_initial_false");s.setTags(Map.of("SYSTEMIC","true"));check(!s.isSystemic(),"systemic_cached_after_tag_change");
  Alert control=new Alert(3);control.setTags(Map.of("SYSTEMIC","true"));check(control.isSystemic(),"systemic_tag_before_read_control_true");
 }
}
`;
const file=join(out,'AlertObjectResearch.java');writeFileSync(file,source);
const jar=join(install,'zap-2.17.0.jar'),classpath=[jar,join(install,'lib','*')].join(delimiter);
const args=['-Djava.awt.headless=true','--class-path',classpath,file];
const started=performance.now(),r=spawnSync(java,args,{cwd:out,windowsHide:true,encoding:'utf8',timeout:30000});
writeFileSync(join(out,'stdout.txt'),r.stdout||'');writeFileSync(join(out,'stderr.txt'),r.stderr||'');
const hash=b=>createHash('sha256').update(b).digest('hex');
const receipt={at:new Date().toISOString(),out,scope:'Actual installed Alert object methods only; no daemon/network/browser/database',command:{executable:java,args,cwd:out},exit:r.status,error:r.error?.message,signal:r.signal,elapsedMs:performance.now()-started,passes:(r.stdout||'').split(/\r?\n/).filter(s=>s.startsWith('PASS ')),jarSha256:hash(readFileSync(jar)),reviewedSourceSha256:hash(readFileSync('C:/Users/kotar/.codex/research/zaproxy-2.17.0/zap/src/main/java/org/parosproxy/paros/core/scanner/Alert.java')),fixtureSha256:hash(source),stdoutSha256:hash(r.stdout||''),stderrSha256:hash(r.stderr||'')};
writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2));writeFileSync('docs/research/security-landscape/deep-review/zap-alert-object-lab-receipt.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify({...receipt,stderrTail:(r.stderr||'').slice(-1000)}));
