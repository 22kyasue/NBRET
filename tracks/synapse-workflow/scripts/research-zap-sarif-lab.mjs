import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {resolve,join,delimiter} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const out=resolve(`runs/zap-sarif-research-${Date.now()}`);mkdirSync(out);
const render=process.argv[2]==='render';
const install=resolve('.tools/ZAP_2.17.0'),java='C:/Users/kotar/AppData/Local/Programs/BurpSuite/jre/bin/java.exe';
const addon=join(install,'plugin',readdirSync(join(install,'plugin')).find(x=>/^reports-release-0\.43\.0\.zap$/.test(x)));
const unpack=spawnSync('python',['-c',`import zipfile,sys,pathlib
z=zipfile.ZipFile(sys.argv[1]); out=pathlib.Path(sys.argv[2])
for n in z.namelist():
 if n.endswith('.jar'):
  p=out/pathlib.Path(n).name; p.write_bytes(z.read(n)); print(p)
`,addon,out],{windowsHide:true,encoding:'utf8',timeout:30000});
if(unpack.status!==0)throw new Error(unpack.stderr);
const jars=(unpack.stdout||'').trim().split(/\r?\n/).filter(Boolean);
const source=`import org.parosproxy.paros.core.scanner.Alert;
import org.parosproxy.paros.network.HttpMessage;
import org.zaproxy.addon.reports.sarif.SarifResult;
import org.zaproxy.addon.reports.ReportData;
import org.zaproxy.zap.extension.alert.AlertNode;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.templateresolver.FileTemplateResolver;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import java.nio.file.Files;
import java.nio.file.Path;
public class SarifResearch {
 static void check(boolean v,String label){if(!v)throw new AssertionError(label);System.out.println("PASS "+label);}
 public static void main(String[] args)throws Exception{
  HttpMessage m=new HttpMessage();
  m.setRequestHeader("POST https://lab.invalid/path?token=SYNTHETIC_URL HTTP/1.1\\r\\nHost: lab.invalid\\r\\nAuthorization: Bearer SYNTHETIC_AUTH\\r\\nCookie: session=SYNTHETIC_COOKIE\\r\\nX-API-Key: SYNTHETIC_KEY\\r\\nContent-Type: application/json\\r\\n\\r\\n");
  m.setRequestBody("{\\\"password\\\":\\\"SYNTHETIC_BODY\\\"}");
  m.setResponseHeader("HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nSet-Cookie: session=SYNTHETIC_RESPONSE_COOKIE\\r\\n\\r\\n");
  m.setResponseBody("SYNTHETIC_RESPONSE_BODY");
  Alert a=new Alert(1,Alert.RISK_LOW,Alert.CONFIDENCE_MEDIUM,"synthetic");a.setDescription("description");a.setMessage(m);a.setUri(m.getRequestHeader().getURI().toString());a.setAttack("SYNTHETIC_ATTACK");a.setEvidence("SYNTHETIC_RESPONSE_BODY");
  SarifResult r=SarifResult.builder().setAlert(a).build();
  check(!r.getWebRequest().getHeaders().get("Authorization").contains("SYNTHETIC_AUTH"),"authorization_masked_control");
  check(r.getWebRequest().getHeaders().get("Cookie").contains("SYNTHETIC_COOKIE"),"request_cookie_preserved");
  check(r.getWebRequest().getHeaders().get("X-API-Key").equals("SYNTHETIC_KEY"),"custom_key_preserved");
  check(r.getWebRequest().getTarget().contains("SYNTHETIC_URL"),"url_query_preserved");
  check(r.getWebRequest().getBody().getText().contains("SYNTHETIC_BODY"),"request_body_preserved");
  check(r.getWebResponse().getHeaders().get("Set-Cookie").contains("SYNTHETIC_RESPONSE_COOKIE"),"response_cookie_preserved");
  check(r.getWebResponse().getBody().getText().contains("SYNTHETIC_RESPONSE_BODY"),"response_body_preserved");
  check(r.getLocations().getFirst().getProperties().getAttack().equals("SYNTHETIC_ATTACK"),"attack_preserved");
  if(args.length>0){
   ReportData data=new ReportData("synthetic");AlertNode root=new AlertNode(0,"root");AlertNode group=new AlertNode(1,"group");AlertNode instance=new AlertNode(2,"instance");instance.setUserObject(a);group.add(instance);root.add(group);data.setAlertTreeRootNode(root);
   FileTemplateResolver resolver=new FileTemplateResolver();resolver.setTemplateMode(TemplateMode.TEXT);TemplateEngine engine=new TemplateEngine();engine.setTemplateResolver(resolver);
   Context ctx=new Context();ctx.setVariable("reportData",data);ctx.setVariable("zapVersion","2.17.0");
   String json=engine.process(args[0],ctx);Files.writeString(Path.of("report.json"),json);check(json.contains("SYNTHETIC_COOKIE"),"serialized_cookie_preserved");check(!json.contains("SYNTHETIC_AUTH"),"serialized_authorization_masked");
  }
 }
}
`;
const file=join(out,'SarifResearch.java');writeFileSync(file,source);
const classpath=[join(install,'zap-2.17.0.jar'),join(install,'lib','*'),addon,...jars].join(delimiter);
const args=['-Djava.awt.headless=true','--class-path',classpath,file,...(render?[resolve('C:/Users/kotar/.codex/research/zap-extensions-network-0.25.0/addOns/reports/src/main/zapHomeFiles/reports/sarif-json/report.json')]:[])];
const started=performance.now(),r=spawnSync(java,args,{cwd:out,windowsHide:true,encoding:'utf8',timeout:30000});
writeFileSync(join(out,'stdout.txt'),r.stdout||'');writeFileSync(join(out,'stderr.txt'),r.stderr||'');
const hash=b=>createHash('sha256').update(b).digest('hex');
let artifact;
if(render&&r.status===0){
 try{const b=readFileSync(join(out,'report.json')),j=JSON.parse(b),v=j.runs[0].results[0];
 artifact={sha256:hash(b),bytes:b.length,parse:true,checks:{oneResult:j.runs[0].results.length===1,authorizationMasked:!v.webRequest.headers.Authorization.includes('SYNTHETIC_AUTH'),cookie:v.webRequest.headers.Cookie.includes('SYNTHETIC_COOKIE'),customKey:v.webRequest.headers['X-API-Key']==='SYNTHETIC_KEY',url:v.webRequest.target.includes('SYNTHETIC_URL'),requestBody:v.webRequest.body.text.includes('SYNTHETIC_BODY'),responseCookie:v.webResponse.headers['Set-Cookie'].includes('SYNTHETIC_RESPONSE_COOKIE'),responseBody:v.webResponse.body.text.includes('SYNTHETIC_RESPONSE_BODY'),attack:v.locations[0].properties.attack==='SYNTHETIC_ATTACK'}};
 }catch(e){artifact={parse:false,error:e.message};}
}
const receipt={at:new Date().toISOString(),out,scope:render?'Installed addon builder/support/Thymeleaf with pinned source JSON template, synthetic hand-built alert tree. No daemon, target, database, filter or real credentials.':'Installed reports addon SarifResult builder with synthetic in-memory HTTP messages. No daemon, target requests, browser, real credentials, or generated JSON report.',command:{executable:java,args,cwd:out},exit:r.status,error:r.error?.message,signal:r.signal,elapsedMs:performance.now()-started,passes:(r.stdout||'').split(/\r?\n/).filter(s=>s.startsWith('PASS ')),addonSha256:hash(readFileSync(addon)),fixtureSha256:hash(source),stdoutSha256:hash(r.stdout||''),stderrSha256:hash(r.stderr||'')};
receipt.artifact=artifact;
writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2));writeFileSync(`docs/research/security-landscape/deep-review/zap-sarif-${render?'render-':''}lab-receipt.json`,JSON.stringify(receipt,null,2));console.log(JSON.stringify({...receipt,stderrTail:(r.stderr||'').slice(-2000)}));
