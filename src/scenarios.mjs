import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { runCapture, captureOrigins } from './run.mjs';
import { captureProfile } from './profiles.mjs';
import { assessRun } from './assess.mjs';
import { writeInvestigation } from './investigation.mjs';
import { localResponses } from './responses.mjs';
import { validateExpectations } from './expectations.mjs';
import { validateMotion } from './motion.mjs';
import { readEvidence } from './evidence.mjs';

export function validateScenarios(manifest) {
  if (manifest?.schemaVersion !== 1 || !Array.isArray(manifest.scenarios) || manifest.scenarios.length < 1 || manifest.scenarios.length > 20) throw new Error('Scenario manifest requires schemaVersion 1 and 1..20 scenarios');
  const ids = new Set();
  for (const s of manifest.scenarios) {
    if (!s || typeof s.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(s.id) || ids.has(s.id)) throw new Error('Scenario IDs must be unique non-sensitive identifiers');
    ids.add(s.id);
    captureOrigins(s.url, s.origins);
    validateExpectations(s.expectations);
    validateMotion(s.motion, s.url);
    if (s.includeStreamPayloads !== undefined && typeof s.includeStreamPayloads !== 'boolean') throw new Error('includeStreamPayloads must be boolean');
    if (s.retainProfile !== undefined && typeof s.retainProfile !== 'boolean') throw new Error('retainProfile must be boolean');
    if (s.captureTargets !== undefined && typeof s.captureTargets !== 'boolean') throw new Error('captureTargets must be boolean');
    const profile = captureProfile(s.profile || 'behavior');
    if (s.visualCheckpoints !== undefined && !['all', 'final'].includes(s.visualCheckpoints)) throw new Error('visualCheckpoints must be all or final');
    const overrides = localResponses(s.url, s.responses);
    if (overrides.length && (profile.rea || profile.copy)) throw new Error('Response experiments require network or behavior profile');
    if (!Array.isArray(s.actions) || s.actions.length > 100) throw new Error('Each scenario requires at most 100 explicit actions');
  }
  return manifest.scenarios;
}

export async function runScenarios(manifest, outDir) {
  const scenarios = validateScenarios(manifest), root = resolve(outDir);
  await mkdir(root, { recursive: false });
  const report = { schemaVersion: 1, startedAt: new Date().toISOString(), scenarios: [],
    policy: 'Serial fresh-profile captures; profiles select tools. No endpoint replay, scanning, shared-session changes or automatic scope expansion.' };
  for (const s of scenarios) {
    const profile = captureProfile(s.profile || 'behavior'), out = join(root, s.id);
    const entry = { id: s.id, profile: s.profile || 'behavior', toolSelection: profile, status: 'pending' };
    report.scenarios.push(entry);
    try {
      const summary = await runCapture({ url: s.url, outDir: out, actions: s.actions, origins: s.origins, scenarioId: s.id,
        rea: profile.rea, copy: profile.copy, copyMode: s.copyMode || profile.copyMode, captureTargets: s.captureTargets ?? profile.captureTargets, sessionIn: s.sessionIn, sessionOut: s.sessionOut, assetStore: s.assetStore, viewport: s.viewport, reducedMotion: s.reducedMotion, motion: s.motion, visual: profile.visual, responses: s.responses, visualCheckpoints: s.visualCheckpoints || profile.visualCheckpoints, includeStreamPayloads: !!s.includeStreamPayloads, expectations: s.expectations, retainProfile: s.retainProfile ?? true });
      entry.identity = summary.identity;
      entry.metrics = summary.metrics;
      entry.status = summary.errors.length ? 'failed' : 'captured';
      if (summary.capture === 'captured') {
        const { evidence } = await readEvidence(out, summary);
        await writeFile(join(out, 'assessment.json'), JSON.stringify(assessRun(summary, evidence), null, 2));
        entry.export = await writeInvestigation(out);
      }
    } catch { entry.status = 'failed'; entry.error = 'Scenario failed; raw errors omitted to avoid persisting input values or credentials.'; }
    // Checkpoint after every scenario; a later failure does not lose prior receipts.
    await writeFile(join(root, 'scenarios.json'), JSON.stringify(report, null, 2));
  }
  report.finishedAt = new Date().toISOString();
  await writeFile(join(root, 'scenarios.json'), JSON.stringify(report, null, 2));
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { file: { type: 'string' }, out: { type: 'string' }, help: { type: 'boolean' } } });
  if (values.help || !values.file || !values.out) {
    console.log('Usage: npm run scenarios -- --file scenarios.json --out runs/new-batch\nRuns explicit browser actions against authorized targets. Output must not exist.');
    process.exitCode = values.help ? 0 : 1;
  } else {
    const result = await runScenarios(JSON.parse(await readFile(values.file, 'utf8')), values.out);
    console.log(JSON.stringify(result, null, 2));
    if (result.scenarios.some(s => s.status === 'failed')) process.exitCode = 1;
  }
}
