import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { startFixture } from '../test/fixture.mjs';
import { captureProfile } from '../src/profiles.mjs';
import { runCapture } from '../src/run.mjs';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { samples: { type: 'string', default: '3' } } });
const repeats = Number(values.samples);
if (!Number.isInteger(repeats) || repeats < 1 || repeats > 10) throw new Error('--samples must be 1..10');

await mkdir('runs', { recursive: true });
const root = resolve(`runs/profile-benchmark-${Date.now()}`);
await mkdir(root);
const fixture = await startFixture(), samples = [];
try {
  for (let sample = 1; sample <= repeats; sample++) for (const name of ['network', 'behavior', 'full', 'behavior-discarded-profile']) {
    const discard = name === 'behavior-discarded-profile';
    const profile = captureProfile(discard ? 'behavior' : name), out = join(root, `${name}-${sample}`);
    const summary = await runCapture({ url: fixture.url, outDir: out, scenarioId: 'sum-default', ...profile,
      actions: [{ type: 'click', selector: '#calculate' }], expectations: [{ selector: '#result', text: '25' }], retainProfile: !discard });
    assert.equal(summary.capture, 'captured');
    assert.equal(summary.errors.length, 0, JSON.stringify(summary.errors));
    if (name === 'full') { assert.equal(summary.rea, 'captured'); assert.equal(summary.copy, 'extracted'); }
    const evidence = JSON.parse(await readFile(join(out, 'network/evidence.json'), 'utf8'));
    const response = evidence.requests.find(r => r.request.url.endsWith('/sum'));
    assert.deepEqual(JSON.parse(await readFile(join(out, 'network', response.body.file), 'utf8')), { result: 25 });
    samples.push({ profile: name, sample, requiredResultVerified: true, visualStates: summary.visual.states.length,
      profileRetention: summary.profileRetention,
      elapsedMs: summary.metrics.elapsedBeforeReportsMs, artifactBytes: summary.metrics.artifacts.bytes,
      artifactGroups: summary.metrics.artifacts.groups, phaseMs: summary.metrics.phaseMs, runtime: summary.runtime });
  }
  const aggregates = [...new Set(samples.map(s => s.profile))].map(profile => {
    const group = samples.filter(s => s.profile === profile), times = group.map(s => s.elapsedMs).sort((a,b) => a-b);
    return { profile, samples: group.length, medianMs: times[Math.floor(times.length / 2)], minMs: times[0], maxMs: times.at(-1), meanArtifactBytes: group.reduce((n,s) => n+s.artifactBytes, 0)/group.length };
  });
  const result = { root, verified: true, samples, aggregates, limitations: ['Repeated local fixture samples, not a general performance guarantee.', 'All profiles resolve the required calculation question; broader profiles intentionally collect additional evidence.', 'Artifact sizes are logical and exclude final report writes. Cold profile/browser conditions and load affect timings.'] };
  await writeFile(join(root, 'profile-benchmark.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ root, verified: true, samples: samples.map(({ profile, elapsedMs, artifactBytes, visualStates }) => ({ profile, elapsedMs, artifactBytes, visualStates })) }, null, 2));
} finally { await fixture.close(); }
