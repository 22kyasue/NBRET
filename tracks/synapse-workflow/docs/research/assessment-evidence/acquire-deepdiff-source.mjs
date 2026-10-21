// Public, exact locked source acquisition only. Never installs/imports the package.
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const pins = {
  deepdiff: { name: 'deepdiff', version: '8.6.1', filename: 'deepdiff-8.6.1.tar.gz', sha256: 'ec56d7a769ca80891b5200ec7bd41eec300ced91ebcc7797b41eb2b3f3ff643a' },
  orderly: { name: 'orderly-set', version: '5.5.0', filename: 'orderly_set-5.5.0.tar.gz', sha256: 'e87185c8e4d8afa64e7f8160ee2c542a475b738bc891dc3f58102e654125e6ce' },
};
const selected = process.argv[2] || 'deepdiff';
const pin = pins[selected];
if (!pin) throw Error('Unknown exact locked source');
const root = `C:/Users/kotar/.codex/research/assessment-evidence-sdk-sources/${pin.name}-${pin.version}`;
const expected = pin.sha256;
const metadataUrl = `https://pypi.org/pypi/${pin.name}/${pin.version}/json`;
mkdirSync(root, { recursive: true });
const metadataResponse = await fetch(metadataUrl);
if (!metadataResponse.ok) throw Error(`Metadata HTTP ${metadataResponse.status}`);
const metadataBytes = Buffer.from(await metadataResponse.arrayBuffer());
const metadata = JSON.parse(metadataBytes);
const item = metadata.urls.find(x => x.filename === pin.filename);
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
if (!existsSync(resolve(destination, '.extraction-complete.json'))) {
  const extraction = String.raw`import pathlib, sys, tarfile, json, os
archive, destination = sys.argv[1:]
root = pathlib.Path(destination).resolve()
if os.name == 'nt':
    root = pathlib.Path(chr(92) * 2 + '?' + chr(92) + str(root))
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
    for member in tf.getmembers():
        target = root.joinpath(*pathlib.PurePosixPath(member.name).parts)
        if target.exists():
            if member.isfile() and target.read_bytes() != tf.extractfile(member).read():
                raise ValueError('Existing file differs; preserving it')
            continue
        tf.extract(member, path=root, filter='data')
    (root / '.extraction-complete.json').write_text(json.dumps({'members': len(tf.getmembers()), 'existing_files': 'compared, never overwritten'}))
print('Source extracted; package not imported or installed.')
`;
  const output = execFileSync('C:/Users/kotar/.codex/research/assessment-evidence-venv/Scripts/python.exe',
    ['-c', extraction, archive, destination], { windowsHide: true, encoding: 'utf8' });
  process.stdout.write(output);
}
const receipt = {
  at: new Date().toISOString(), package: pin.name, version: pin.version,
  source: metadataUrl, distribution: item.url, archive, destination,
  sha256: expected, bytes: readFileSync(archive).length,
  metadataSha256: createHash('sha256').update(metadataBytes).digest('hex'),
  upstreamGitCommit: null,
  licenseClaim: 'MIT classifier; complete distributed license still to read',
  behavior: 'Public source acquisition/extraction only; no package import, install, model, server or test execution',
};
const id = Date.now();
writeFileSync(resolve(root, `metadata-${id}.json`), metadataBytes, { flag: 'wx' });
writeFileSync(resolve('docs/research/assessment-evidence', `${selected}-source-acquisition-${id}.json`), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(receipt, null, 2));
