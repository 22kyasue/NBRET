// Install a portable, SHA-256 verified ZAP distribution in ignored local storage.
import { mkdir, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
const root = resolve('.tools');
await mkdir(root, { recursive: true });
const release = await (await fetch('https://api.github.com/repos/zaproxy/zaproxy/releases/latest', { headers: { 'User-Agent': 'NBRET-local-validation' } })).json();
const asset = release.assets?.find(a => a.name.endsWith('_Crossplatform.zip'));
if (!asset?.digest?.startsWith('sha256:')) throw new Error('Release has no verified download digest');
const response = await fetch(asset.browser_download_url);
if (!response.ok) throw new Error('ZAP download failed');
const bytes = Buffer.from(await response.arrayBuffer());
const sha256 = createHash('sha256').update(bytes).digest('hex');
if (`sha256:${sha256}` !== asset.digest || bytes.length !== asset.size) throw new Error('ZAP bytes do not match release');
const zip = resolve(root, asset.name);
await writeFile(zip, bytes);
// Python's standard zipfile avoids visible PowerShell extraction windows.
const python = process.env.NBRET_COMPUTERUSE_PYTHON || 'C:/Users/kotar/githubprojects/computeruse/.venv/Scripts/python.exe';
await promisify(execFile)(python, ['-m', 'zipfile', '-e', zip, root], { windowsHide: true, timeout: 120000 });
const version = release.tag_name.replace(/^v/, '');
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Unexpected release version');
const installDir = resolve(root, `ZAP_${version}`), jar = resolve(installDir, `zap-${version}.jar`);
await access(jar);
await writeFile(resolve(root, 'zap-receipt.json'), JSON.stringify({ tag: release.tag_name, installDir, jar, source: asset.browser_download_url, sha256, bytes: bytes.length, installedAt: new Date().toISOString() }, null, 2));
console.log(JSON.stringify({ tag: release.tag_name, installDir, sha256, bytes: bytes.length }));
