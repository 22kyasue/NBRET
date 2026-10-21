import {readFileSync,writeFileSync,mkdirSync,openSync,closeSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root='C:/Users/kotar/.codex/research/nuclei',moduleRoot=resolve('.tools/security-research-go/module-cache/pkg/mod/github.com/projectdiscovery/fastdialer@v0.5.25'),out=resolve(`runs/dialer-cache-research-${Date.now()}`);mkdirSync(out);
const source=`package main
import("context";"errors";"fmt";"net";"sync";"sync/atomic";"syscall";"time";fd "github.com/projectdiscovery/fastdialer/fastdialer")
func check(v bool,label string){if !v{panic(label)};fmt.Println("PASS "+label)}
func wait(n *atomic.Int64,w int64){until:=time.Now().Add(time.Second);for n.Load()<w&&time.Now().Before(until){time.Sleep(time.Millisecond)}}
func main(){
 a,e:=net.Listen("tcp","127.0.0.1:0");if e!=nil{panic(e)};_,port,_:=net.SplitHostPort(a.Addr().String());b,e:=net.Listen("tcp",net.JoinHostPort("127.0.0.2",port));if e!=nil{a.Close();panic(e)};dns,e:=net.ListenPacket("udp","127.0.0.1:0");if e!=nil{a.Close();b.Close();panic(e)}
 var wg sync.WaitGroup;var ac,bc,dc,calls atomic.Int64;var reject atomic.Bool
 serve:=func(l net.Listener,n *atomic.Int64){wg.Add(1);go func(){defer wg.Done();for{c,e:=l.Accept();if e!=nil{return};n.Add(1);c.Close()}}()};serve(a,&ac);serve(b,&bc);wg.Add(1);go func(){defer wg.Done();buf:=make([]byte,4096);for{_,_,e:=dns.ReadFrom(buf);if e!=nil{return};dc.Add(1)}}();defer func(){a.Close();b.Close();dns.Close();wg.Wait()}()
 options:=fd.DefaultOptions;options.HostsFile=false;options.ResolversFile=false;options.BaseResolvers=[]string{dns.LocalAddr().String()};options.EnableFallback=false;options.DialerTimeout=time.Second
 options.Dialer=&net.Dialer{Timeout:time.Second,Control:func(network,address string,c syscall.RawConn)error{host,_,e:=net.SplitHostPort(address);if e!=nil{return e};ip:=net.ParseIP(host);if ip==nil||!ip.IsLoopback(){return errors.New("research loopback guard")};return nil}}
 options.OnValidateTarget=func(host,ip,port string)error{calls.Add(1);if reject.Load(){return errors.New("synthetic policy revocation")};return nil}
 d,e:=fd.NewDialer(options);if e!=nil{panic(e)};defer d.Close();target:=net.JoinHostPort("fixture.invalid",port)
 dial:=func(d *fd.Dialer,ip string)error{ctx,cancel:=context.WithTimeout(context.WithValue(context.Background(),fd.IP,ip),2*time.Second);defer cancel();c,e:=d.Dial(ctx,"tcp",target);if c!=nil{c.Close()};return e}
 check(dial(d,"127.0.0.1")==nil,"first_context_ip_a_connects");wait(&ac,1);check(ac.Load()==1&&bc.Load()==0,"first_listener_a_control")
 check(dial(d,"127.0.0.2")==nil,"cached_context_ip_b_connects");wait(&ac,2);check(ac.Load()==2&&bc.Load()==0,"cached_override_b_still_reaches_a");check(calls.Load()==1,"cached_dial_skips_validation_callback")
 reject.Store(true);check(dial(d,"127.0.0.2")==nil,"cached_dial_after_callback_policy_revoke");wait(&ac,3);check(ac.Load()==3&&calls.Load()==1,"revoked_callback_not_rechecked_on_cache_hit")
 fresh,e:=fd.NewDialer(options);if e!=nil{panic(e)};defer fresh.Close();check(dial(fresh,"127.0.0.2")==fd.NoAddressAllowedError,"fresh_dialer_revoke_control_denies");check(bc.Load()==0,"rejection_opens_no_b_connection")
 reject.Store(false);check(dial(fresh,"127.0.0.2")==nil,"fresh_allowed_context_b_connects");wait(&bc,1);check(bc.Load()==1,"fresh_listener_b_control");check(dc.Load()==0,"zero_dns_trap_queries")
 fmt.Printf("COUNTS a=%d b=%d dns=%d validation=%d\\n",ac.Load(),bc.Load(),dc.Load(),calls.Load())
}
`;
const file=join(out,'main.go');writeFileSync(file,source);const sdk=resolve('.tools/security-research-go/sdk/go/bin/go.exe'),args=['run',file];
const env={...process.env,GOTOOLCHAIN:'local',CGO_ENABLED:'0',GOPATH:resolve('.tools/security-research-go/module-cache'),GOCACHE:resolve('.tools/security-research-go/cache'),GOPROXY:'off',GOSUMDB:'off'};
const fd=openSync(join(out,'stdout.txt'),'w'),efd=openSync(join(out,'stderr.txt'),'w'),start=performance.now();const r=spawnSync(sdk,args,{cwd:root,env,windowsHide:true,stdio:['ignore',fd,efd],timeout:60000});closeSync(fd);closeSync(efd);
const hash=b=>createHash('sha256').update(b).digest('hex'),stdout=readFileSync(join(out,'stdout.txt'),'utf8');
const receipt={at:new Date().toISOString(),out,scope:'Actual Fastdialer component, owned dual loopback TCP listeners and UDP DNS trap, loopback-only net.Dialer guard. No Nuclei engine/third party/model/credentials.',command:{executable:sdk,args,cwd:root},moduleNetwork:{GOPROXY:'off',GOSUMDB:'off'},exit:r.status,error:r.error?.message,elapsedMs:performance.now()-start,passes:stdout.split(/\r?\n/).filter(s=>s.startsWith('PASS ')),counts:stdout.split(/\r?\n/).find(s=>s.startsWith('COUNTS ')),fixtureSha256:hash(source),sourceSha256:Object.fromEntries(['fastdialer/dialer.go','fastdialer/dialer_private.go','fastdialer/utils/dialwrap.go','go.mod'].map(p=>[p,hash(readFileSync(join(moduleRoot,p)))])),parentGoModSha256:hash(readFileSync(join(root,'go.mod'))),parentGoSumSha256:hash(readFileSync(join(root,'go.sum'))),stdoutSha256:hash(stdout),stderrSha256:hash(readFileSync(join(out,'stderr.txt')))};
writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2));writeFileSync('docs/research/security-landscape/deep-review/nuclei-dialer-cache-lab-receipt.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify({...receipt,stderrTail:readFileSync(join(out,'stderr.txt'),'utf8').slice(-1200)}));
