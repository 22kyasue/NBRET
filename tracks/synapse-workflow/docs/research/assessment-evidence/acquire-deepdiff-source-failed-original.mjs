// Public, exact locked source acquisition only. Never installs/imports the package.
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const root = 'C:/Users/kotar/.codex/research/assessment-evidence-sdk-sources/deepdiff-8.6.1';
const expected = 'ec56d7a769ca80891b5200ec7bd41eec300ced91ebcc7797b41eb2b3f3ff643a';
const metadataUrl = 'https://pypi.org/pypi/deepdiff/8.6.1/json';
mkdirSync(root, { recursive: true });
const metadataResponse = await fetch(metadataUrl);
if (!metadataResponse.ok) throw Error(`Metadata HTTP ${metadataResponse.status}`);
const metadataBytes = Buffer.from(await metadataResponse.arrayBuffer());
const metadata = JSON.parse(metadataBytes);
const item = metadata.urls.find(x => x.filename === 'deepdiff-8.6.1.tar.gz');
if (!item || item.digests.sha256 !== expected) throw Error('Release/lock hash mismatch');
const archive = resolve(root, item.filename);
if (!existsSync(archive)) {
  const response = await fetch(item.url);
  if (!response.ok) throw Error(`Archive HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (createHash('sha256').update(bytes).digest('hex') !== expected) throw Error('Archive hash mismatch');
  writeFileSync(archive, bytes, { flag: 'wx' });
}
if (createHash('sha256').update(readFileSync(archive)).digest('hex') !== expected) throw Error('Saved archive mismatch');
const destination = resolve(root, 'source');
if (!existsSync(destination)) {
  const extraction = String.raw`import pathlib, sys, tarfile
archive, destination = sys.argv[1:]
root = pathlib.Path(destination).resolve()
with tarfile.open(archive, 'r:gz') as tf:
    for member in tf.getmembers():
        path = pathlib.PurePosixPath(member.name)
        if path.is_absolute() or '..' in path.parts or member.issym() or member.islnk():
            raise ValueError('Unsafe archive member')
        if not (member.isfile() or member.isdir()):
            raise ValueError('Unsupported archive member')
        target = root.joinpath(*path.parts).resolve()
        if not target.is_relative_to(root):
            raise ValueError('Archive escape')
    tf.extractall(root, filter='data')
print('Source extracted; package not imported or installed.')
`;
  const output = execFileSync('C:/Users/kotar/.codex/research/assessment-evidence-venv/Scripts/python.exe',
    ['-c', extraction, archive, destination], { windowsHide: true, encoding: 'utf8' });
  process.stdout.write(output);
}
const receipt = {
  at: new Date().toISOString(), package: 'deepdiff', version: '8.6.1',
  source: metadataUrl, distribution: item.url, archive, destination,
  sha256: expected, bytes: readFileSync(archive).length,
  metadataSha256: createHash('sha256').update(metadataBytes).digest('hex'),
  upstreamGitCommit: null,
  licenseClaim: 'MIT classifier; complete distributed license still to read',
  behavior: 'Public source acquisition/extraction only; no package import, install, model, server or test execution',
};
const id = Date.now();
writeFileSync(resolve(root, `metadata-${id}.json`), metadataBytes, { flag: 'wx' });
writeFileSync(resolve('docs/research/assessment-evidence', `deepdiff-source-acquisition-${id}.json`), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(receipt, null, 2));
