import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { validateScenarios, runScenarios } from '../src/scenarios.mjs';
import { startFixture } from './fixture.mjs';

test('manifest rejects unsafe identifiers, duplicate cases, unknown tools and invalid scope', () => {
  const scenario = { id: 'sum', url: 'http://localhost/', actions: [] };
  assert.equal(validateScenarios({ schemaVersion: 1, scenarios: [scenario] }).length, 1);
  for (const scenarios of [[{ ...scenario, id: '../escape' }], [scenario, scenario], [{ ...scenario, profile: 'unknown' }], [{ ...scenario, origins: ['https://api.test/path'] }]]) assert.throws(() => validateScenarios({ schemaVersion: 1, scenarios }));
});

test('scenario batch performs selected passes and derives reports without another capture', { timeout: 30000 }, async () => {
  const fixture = await startFixture();
  await mkdir('runs', { recursive: true });
  const out = resolve(`runs/scenarios-${Date.now()}`);
  try {
    const report = await runScenarios({ schemaVersion: 1, scenarios: [
      { id: 'sum', url: fixture.url, profile: 'network', retainProfile: false, actions: [{ type: 'click', selector: '#calculate' }], expectations: [{ selector: '#result', text: '25' }] },
      { id: 'sum-visual', url: fixture.url, profile: 'behavior', actions: [{ type: 'click', selector: '#calculate' }, { type: 'wait', ms: 100 }], expectations: [{ selector: '#result', text: 'wrong-result', timeoutMs: 0 }] },
    ] }, out);
    assert.equal(report.scenarios[0].status, 'captured');
    const summary = JSON.parse(await readFile(join(out, 'sum/summary.json'), 'utf8'));
    assert.equal(summary.copy, 'disabled');
    assert.equal(summary.rea, 'disabled');
    assert.equal(summary.visual.status, 'disabled');
    assert.equal(summary.assertions[0].passed, true);
    assert.equal(summary.profileRetention, 'discarded-after-close');
    await assert.rejects(access(join(out, 'sum/browser-profile')), /ENOENT/);
    assert.equal(summary.metrics.artifacts.groups.profile, undefined);
    assert.equal(report.scenarios[0].export.endpoints > 0, true);
    assert.equal(JSON.parse(await readFile(join(out, 'sum/assessment.json'), 'utf8')).identity.scenarioId, 'sum');
    const visual = JSON.parse(await readFile(join(out, 'sum-visual/summary.json'), 'utf8'));
    assert.equal(report.scenarios[1].status, 'failed');
    assert.equal(visual.capture, 'captured', 'Behavior assertion failure does not mislabel successful traffic capture');
    assert.equal(visual.assertions[0].passed, false);
    assert.ok(!JSON.stringify(visual).includes('wrong-result'));
    assert.equal(visual.visual.states.length, 1, 'Behavior profile avoids screenshots at intermediate actions');
    const state = JSON.parse(await readFile(join(out, 'sum-visual', visual.visual.states[0].file), 'utf8'));
    assert.equal(state.nodes.find(n => n.id === 'result').text, '25');
    await assert.rejects(runScenarios({ schemaVersion: 1, scenarios: [{ id: 'sum', url: fixture.url, actions: [] }] }, out), /EEXIST/);
  } finally { await fixture.close(); }
});
