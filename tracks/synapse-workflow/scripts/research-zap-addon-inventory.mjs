import {spawnSync} from 'node:child_process';
const r=spawnSync('python',['-c',`import zipfile,sys
z=zipfile.ZipFile(sys.argv[1])
names=z.namelist()
print('thymeleaf entries:',sum(n.startswith('org/thymeleaf/') for n in names))
for n in names:
 if n in ['org/thymeleaf/TemplateEngine.class','org/thymeleaf/context/Context.class'] or n.endswith('.jar'): print(n)
`,'.tools/ZAP_2.17.0/plugin/reports-release-0.43.0.zap'],{windowsHide:true,encoding:'utf8'});
console.log(r.stdout);console.error(r.stderr);
