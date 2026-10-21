import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join,delimiter} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const out=resolve(`runs/zap-report-filter-research-${Date.now()}`);mkdirSync(out);
const install=resolve('.tools/ZAP_2.17.0'),java='C:/Users/kotar/AppData/Local/Programs/BurpSuite/jre/bin/java.exe',addon=join(install,'plugin/reports-release-0.43.0.zap');
const source=`import org.parosproxy.paros.core.scanner.Alert;
import org.zaproxy.addon.reports.ReportData;
import org.zaproxy.addon.reports.ExtensionReports;
import org.zaproxy.zap.extension.alert.AlertNode;
import java.util.List;
import java.util.Comparator;
import org.zaproxy.zap.model.Context;
public class ReportFilterResearch {
 static void check(boolean v,String label){if(!v)throw new AssertionError(label);System.out.println("PASS "+label);}
 static final Comparator<AlertNode> ORDER=Comparator.comparing(AlertNode::getNodeName);
 static AlertNode node(String uri){Alert a=new Alert(1,Alert.RISK_LOW,Alert.CONFIDENCE_MEDIUM,"synthetic");a.setUri(uri);AlertNode n=new AlertNode(1,uri,ORDER);n.setUserObject(a);return n;}
 static ReportData data(){ReportData d=new ReportData("synthetic");d.setSites(List.of("https://lab.invalid"));d.setIncludeRisk(Alert.RISK_LOW,true);d.setIncludeConfidence(Alert.CONFIDENCE_MEDIUM,true);return d;}
 static class Reports extends ExtensionReports {AlertNode root;Reports(AlertNode r){root=r;}@Override public AlertNode getRootAlertNode(){return root;}}
 static class FaultData extends ReportData {FaultData(){super("synthetic fault");setIncludeConfidence(Alert.CONFIDENCE_MEDIUM,true);}@Override public boolean isIncludeRisk(int risk){throw new IllegalStateException("synthetic fault seam");}}
 public static void main(String[] args){
  check(ExtensionReports.isIncluded(data(),node("https://lab.invalid/path")),"exact_site_control_included");
  check(!ExtensionReports.isIncluded(data(),node("https://other.invalid/path")),"distinct_host_control_excluded");
  check(ExtensionReports.isIncluded(data(),node("https://lab.invalid.sibling.invalid/path")),"host_prefix_sibling_included");
  AlertNode root=new AlertNode(0,"root",ORDER),group=new AlertNode(1,"group",ORDER);group.add(node("https://lab.invalid/path"));group.add(node("https://other.invalid/path"));root.add(group);Reports reports=new Reports(root);
  AlertNode filtered=reports.getFilteredAlertTree(data());check(filtered!=root,"normal_filter_separate_root");check(filtered.getChildAt(0).getChildCount()==1,"normal_filter_one_instance");
  AlertNode fault=reports.getFilteredAlertTree(new FaultData());check(fault==root,"injected_fault_returns_original_root");check(fault.getChildAt(0).getChildCount()==2,"injected_fault_original_population");
  Context context=new Context(null,1);context.addIncludeInContextRegex("https://lab[.]invalid/.*");context.addExcludeFromContextRegex("https://lab[.]invalid/private");
  String excluded="https://lab.invalid/private";check(context.isIncluded(excluded),"context_include_match_control");check(!context.isInContext(excluded),"context_exclusion_control");
  ReportData contextual=data();contextual.setContexts(List.of(context));check(ExtensionReports.isIncluded(contextual,node(excluded)),"report_context_ignores_exclusion");context.setInScope(false);check(ExtensionReports.isIncluded(contextual,node(excluded)),"report_context_ignores_inscope_flag");
 }
}
`;
const file=join(out,'ReportFilterResearch.java');writeFileSync(file,source);
const args=['-Djava.awt.headless=true','--class-path',[join(install,'zap-2.17.0.jar'),join(install,'lib','*'),addon].join(delimiter),file];
const start=performance.now(),r=spawnSync(java,args,{cwd:out,windowsHide:true,encoding:'utf8',timeout:30000});
const hash=b=>createHash('sha256').update(b).digest('hex');
writeFileSync(join(out,'stdout.txt'),r.stdout||'');writeFileSync(join(out,'stderr.txt'),r.stderr||'');
const receipt={at:new Date().toISOString(),out,scope:'Actual installed report filter with synthetic root-provider override and explicit injected ReportData fault; no target, daemon, database or artifact.',command:{executable:java,args,cwd:out},exit:r.status,error:r.error?.message,elapsedMs:performance.now()-start,passes:(r.stdout||'').split(/\r?\n/).filter(x=>x.startsWith('PASS ')),fixtureSha256:hash(source),addonSha256:hash(readFileSync(addon)),stdoutSha256:hash(r.stdout||''),stderrSha256:hash(r.stderr||'')};
writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2));writeFileSync('docs/research/security-landscape/deep-review/zap-report-filter-lab-receipt.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify({...receipt,stderrTail:(r.stderr||'').slice(-1500)}));
