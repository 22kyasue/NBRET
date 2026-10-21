import fs from 'node:fs';
const own='docs/research/assessment-evidence/';
let source=fs.readFileSync(own+'run-openfga-iterator-suite.mjs','utf8');
source=source.replaceAll('openfga-iterator-suite','openfga-fastpath-suite');
source=source.replace("'./internal/iterator','-count=1'", () => "'./internal/graph','-run','^(TestFastPathDirect|TestFastPathComputed|TestFastPathUnion|TestFastPathIntersection|TestFastPathDifference|TestFastPathOperationSetup|TestWeight2|TestCheckUsersetFastPathV2|TestCheckTTUFastPathV2|TestRecursiveTTUObjectProvider|TestRecursiveUsersetObjectProvider|TestIteratorToUserset)$','-count=1'");
source=source.replace("...fs.readdirSync(path.join(root,'internal/iterator')).filter(n=>n.endsWith('.go')).map(n=>'internal/iterator/'+n)", "...['internal/iterator','internal/concurrency','internal/graph'].flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(n=>n.endsWith('.go')).map(n=>dir+'/'+n))");
source=source.replace('Selected unchanged iterator package tests', 'Selected unchanged graph fast-path and object-provider tests');
fs.writeFileSync(own+'run-openfga-fastpath-suite-v2.mjs',source,{flag:'wx'});
