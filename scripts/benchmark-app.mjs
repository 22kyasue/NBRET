import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { startAppFixture, appScenarios } from '../test/app-fixture.mjs';
import { runScenarios } from '../src/scenarios.mjs';
import { observeContracts } from '../src/contracts.mjs';

const fixture = await startAppFixture();
await mkdir('runs', { recursive: true });
const root = resolve(`runs/app-benchmark-${Date.now()}`);
try {
  const report = await runScenarios(appScenarios(fixture.url), root);
  assert.ok(report.scenarios.every(s => s.status === 'captured'), 'All app scenario expectations pass');
  const statuses = {};
  for (const scenario of report.scenarios) {
    const evidenceRaw = await readFile(join(root, scenario.id, 'network/evidence.json'), 'utf8');
    assert.ok(!evidenceRaw.includes('fixture-password'), 'Recorded password is redacted');
    const evidence = JSON.parse(evidenceRaw);
    statuses[scenario.id] = [...new Set(evidence.requests.map(r => r.response?.status).filter(Boolean))];
    await writeFile(join(root, scenario.id, 'contracts.json'), JSON.stringify(await observeContracts(join(root, scenario.id)), null, 2));
  }
  assert.ok(statuses.unauthenticated.includes(401));
  assert.ok(statuses['server-failure'].includes(503));
  const receipt = { root, verified: true, scenarios: report.scenarios.map(s => s.id), observedStatuses: statuses,
    limitations: ['Local controlled app only; no real account or production mutation.', 'Cookie persistence verified within one scenario; separate scenarios still use fresh profiles.', 'This is a benchmark corpus, not general authenticated-session management.'] };
  await writeFile(join(root, 'app-benchmark.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
} finally { await fixture.close(); }
