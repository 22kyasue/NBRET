import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { reviewArtifacts, artifactClass, scanText } from '../src/review.mjs';

test('review inventories provenance without exporting captured secrets or overwriting output', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-review-'));
  try {
    const run = join(root, 'capture'), out = join(root, 'review');
    await mkdir(run); await writeFile(join(run, 'summary.json'), '{"private":"VERY_SECRET"}');
    await writeFile(join(run, 'body.html'), 'PRIVATE_MARKUP');
    await reviewArtifacts(run, out);
    const text = await readFile(join(out, 'artifact-review.json'), 'utf8');
    assert.ok(!text.includes('VERY_SECRET')); assert.ok(!text.includes('PRIVATE_MARKUP'));
    assert.equal(JSON.parse(text).files.length, 2);
    assert.equal(artifactClass('profile/Cookies'), 'session-sensitive');
    assert.equal(artifactClass('copy/viewport.png'), 'visual-sensitive');
    await assert.rejects(reviewArtifacts(run, out), /EEXIST/);
    await assert.rejects(reviewArtifacts(run, join(run, 'review')), /outside/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('review flags credential shapes by kind and line without copying their values', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-secrets-'));
  // Fixture credentials are assembled at runtime so this file itself does not trip secret scanners.
  const jwt = ['eyJhbGciOiJIUzI1NiJ9', 'eyJzdWIiOiJmaXh0dXJlLXVzZXIifQ', 'c2lnbmF0dXJlLWZpeHR1cmU'].join('.');
  const aws = 'AKIA' + 'FIXTURE0EXAMPLE1', key = ['-----BEGIN', 'PRIVATE KEY-----'].join(' ');
  try {
    const run = join(root, 'capture'), out = join(root, 'review');
    await mkdir(join(run, 'network/assets'), { recursive: true }); await mkdir(join(run, 'browser-profile'));
    await writeFile(join(run, 'network/assets/app.js'), `const a=1;\nconst config={apiKey:"${aws}"};\n`);
    await writeFile(join(run, 'network/evidence.json'), JSON.stringify({ headers: { authorization: '[REDACTED]' }, note: `Bearer ${jwt}` }, null, 2));
    await writeFile(join(run, 'key.txt'), `x\n${key}\n`);
    await writeFile(join(run, 'browser-profile/Local State.json'), `{"token":"${jwt}"}`);
    await writeFile(join(run, 'clean.json'), '{"authorization":"[REDACTED]","password":"[REDACTED]"}');
    const result = await reviewArtifacts(run, out);
    const text = await readFile(join(out, 'artifact-review.json'), 'utf8'), findings = JSON.parse(text).secretScan.findings;
    for (const value of [jwt, aws, 'FIXTURE0EXAMPLE1']) assert.ok(!text.includes(value));
    const kinds = path => findings.filter(f => f.path === path).map(f => f.kind).sort();
    assert.deepEqual(kinds('network/assets/app.js'), ['aws-access-key', 'credential-assignment']);
    assert.equal(findings.find(f => f.kind === 'aws-access-key').lines[0], 2);
    assert.deepEqual(kinds('network/evidence.json'), ['bearer-token', 'jwt']);
    assert.deepEqual(kinds('key.txt'), ['private-key']);
    assert.deepEqual(kinds('browser-profile/Local State.json'), []);
    assert.deepEqual(kinds('clean.json'), []);
    assert.equal(result.secretFiles, 3);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('secret scan ignores redacted placeholders and ordinary text', () => {
  assert.deepEqual(scanText('Bearer [REDACTED]\n{"password":"[REDACTED]"}\nhello world https://example.test/path'), []);
  assert.deepEqual(scanText('https://user:pa55word@example.test/').map(f => f.kind), ['url-credentials']);
});
