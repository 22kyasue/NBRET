from pathlib import Path
import json,hashlib,urllib.request,shutil
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root=Path(__file__).resolve().parents[2]/'src/practice/fonts'
root.mkdir(parents=True,exist_ok=True)
source=Path('C:/Windows/Fonts/NotoSansJP-VF.ttf')
font=TTFont(source)
before=set(font.getBestCmap())
font=instantiateVariableFont(font,{'wght':(400,700)},inplace=True)
font.flavor='woff2'
target=root/'NotoSansJP-400-700.woff2'
font.save(target)
check=TTFont(target)
assert set(check.getBestCmap())==before
assert all(ord(c) in before for c in 'Synapse Assessment Report セキュリティ診断結果 株式会社 検証 証拠 改善')
latin=Path('C:/Users/kotar/githubprojects/prompt/sites/tobira-composed-preview/assets/tobira-gallery/landing-pages/twenty-com/_next/static/media')
for weight,name in [(400,'inter_latin_400-s.p.2h4gfjtuiqdh0.woff2'),(500,'inter_latin_500-s.p.0q2yue2unru1q.woff2'),(600,'inter_latin_600-s.p.0tb8ku2pttcmt.woff2')]:
 shutil.copyfile(latin/name,root/f'Inter-{weight}.woff2')
for name,url in [('NotoSansJP-OFL.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/OFL.txt'),('Inter-OFL.txt','https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt')]:
 (root/name).write_bytes(urllib.request.urlopen(url).read())
receipt={'notoSource':'Installed NotoSansJP-VF.ttf','notoSourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'notoGlyphsPreserved':len(before),'notoWeights':[400,700],'latinSource':'Existing prompt private design library / twenty-com capture','files':[{'name':p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in root.iterdir() if p.is_file()]}
(root/'provenance.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf8')
print(json.dumps({'directory':str(root),'fontBytes':sum(p.stat().st_size for p in root.glob('*.woff2')),'glyphs':len(before)}),flush=True)
