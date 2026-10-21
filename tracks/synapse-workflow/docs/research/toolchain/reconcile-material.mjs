// Metadata reconciliation only. Never awards semantic read credit or executes upstream code.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const base=path.resolve('docs/research/toolchain');
const destination=path.join(base,'supplemental-material-queue.json');
try { await fs.access(destination); throw new Error('Supplemental queue exists; preserve its history rather than regenerate'); }
catch(error) { if(error.code!=='ENOENT') throw error; }
const inventory=JSON.parse(await fs.readFile(path.join(base,'local-material-inventory.json')));
const pins=JSON.parse(await fs.readFile(path.join(base,'snapshots.json')));
const original=JSON.parse(await fs.readFile(path.join(base,'queue.json')));
const rows=[];
for(const item of inventory.material.filter(x=>x.queueStatus==='not_in_read_queue')){
 const ext=path.extname(item.path).toLowerCase(),name=path.basename(item.path);
 let category='unclassified_material',next='Inspect relevance and provenance before scope decision';
 if(/(^|\/)(__pycache__|\.pytest_cache)(\/|$)/.test(item.path)||ext==='.pyc'){
  category='local_runtime_cache';next='Retain as provenance; no upstream semantic coverage credit';
 }else if(item.path.startsWith('.yarn/cache/')){
  category='packaged_dependency';next='Resolve exact dependency reachability from manifests/lockfile; archive bytes are not source review';
 }else if(/\.(ts|tsx|js|cjs|mjs|cpp|cxx|hpp|nse|sql|sh|ps1|bat|pl|peg|y|l|inc)$/.test(item.path)){
  category='implementation_or_test_unread';next='Prioritize complete callers, parsers, report/UI transforms and dependency enforcement; source-only for dangerous capabilities';
 }else if(/\.(md|txt|rst|luadoc|1|adoc)$/.test(item.path)||/^(LICENSE.*|COPYING.*|NOTICE.*|README.*|AGENTS\.md)$/i.test(name)){
  category='documentation_or_license_unread';next='Read in bounded outputs; separate release claims, scope guidance and actual implementation';
 }else if(/\.(json|ya?ml|xml|toml|ini|conf|cnf|config|lock|cmake|in|ac|am|m4|mk|mak|sln|vcxproj|props|targets|bazel|cue|template)$/.test(item.path)||/^(Dockerfile.*|.*\.Dockerfile|Makefile.*|CMakeLists\.txt|package\.json|.*lock.*)$/.test(name)){
  category='configuration_build_or_data_unread';next='Inspect content/type and runtime/build reachability; do not assume all YAML/JSON are configuration';
 }else if(/\.(pcap.*|cap|har|mitm|snap|bin|zip|db|class|pem|crt|key)$/.test(item.path)){
  category='fixture_archive_or_binary_boundary';next='Trace referenced tests and distinguish synthetic fixture from packaged dependency; no execution or credential use';
 }else if(/\.(png|jpe?g|gif|svg|ico|icns|tiff|webp|woff2?|ttf|otf|pdf|vsdx|graffle|mp4|cast)$/.test(item.path)){
  category='visual_or_document_asset';next='Inspect only where needed for workflow/evidence claims; path inventory is not visual review';
 }
 const pin=pins.find(x=>x.name===item.repo),bytes=await fs.readFile(path.join(pin.root,item.path));
 rows.push({...item,sha256:createHash('sha256').update(bytes).digest('hex'),category,status:'unread',readRanges:[],next,basis:'Path-based provisional classification and byte hashing only; no semantic read credit'});
}
const categories=Object.fromEntries([...new Set(rows.map(x=>x.category))].map(c=>[c,rows.filter(x=>x.category===c).length]));
const report={at:new Date().toISOString(),inventoryAt:inventory.at,originalQueueFiles:original.length,omittedPaths:rows.length,categories,limitations:['Original queue/history remains unchanged','Classification uses paths, not content semantics; every classification is provisional','Local runtime cache hashes do not establish upstream provenance','Packaged dependencies require caller/manifest prioritization, not automatic exclusion','No source read, execution, network retrieval or exhaustion claim'],material:rows};
await fs.writeFile(destination,JSON.stringify(report,null,2),{flag:'wx'});
console.log(JSON.stringify({at:report.at,originalQueueFiles:original.length,omittedPaths:rows.length,categories}));
