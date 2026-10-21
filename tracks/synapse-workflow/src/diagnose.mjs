import { createHash } from 'node:crypto';
import { safeUrl } from './capture.mjs';

/** Evidence-specific repair candidates. Collection failures are never site defects. */
export function diagnose({ network = {}, capture, explore, probes = [], scan, scenario, analysis, networkFile = 'capture/network/evidence.json' } = {}) {
  const issues = [], seen = new Set();
  const add = item => {
    const id = createHash('sha256').update(`${item.rule}:${item.target || ''}`).digest('hex').slice(0, 12);
    if (seen.has(id)) return; seen.add(id);
    issues.push({ id, ...item });
  };
  const requests = network.requests || [];
  for (const [i, r] of requests.entries()) {
    const url = safeUrl(r.request?.url), status = r.response?.status;
    const evidence = [{ file: networkFile, pointer: `/requests/${i}`, requestId: r.requestId }];
    if (r.inScope && status >= 500 && status <= 599) add({ rule: 'http-server-error', target: url,
      category: 'observed-failure', severity: 'high', confidence: 'high', title: `Observed HTTP ${status}`,
      evidence, whyItMatters: 'A resource requested by the application returned a server error in this observation.',
      suggestedFix: 'Reproduce the same request, inspect server logs and dependencies, and repair the failing handler or upstream service.',
      verification: 'Add an explicit expected-status check for this URL and reproduce the original UI step.' });
    if (r.inScope && status === 404 && ['Script', 'Stylesheet', 'Image', 'Font'].includes(r.resourceType)) add({ rule: 'missing-asset', target: url,
      category: 'observed-failure', severity: 'medium', confidence: 'high', title: 'Application asset returned 404', evidence,
      whyItMatters: 'A referenced script, stylesheet, image or font was not found.',
      suggestedFix: 'Correct the emitted asset path or publish the missing asset; invalidate stale HTML or manifests if needed.',
      verification: 'Check this exact asset returns the intended content and repeat the page load.' });
    if (r.failure?.blockedReason === 'csp') add({ rule: 'csp-blocked-resource', target: url,
      category: 'review-candidate', severity: 'low', confidence: 'high', title: 'A resource was blocked by the page CSP', evidence,
      whyItMatters: 'This may be an intentional restriction or an unused/broken integration.',
      suggestedFix: 'Confirm whether the integration is intended. Remove unused embeds or reconcile the narrowly approved origin with the policy; avoid broadly weakening CSP.',
      verification: 'Repeat the affected feature and inspect whether its required request succeeds without extra CSP violations.' });
  }
  const auth = analysis?.profile?.authObservations || [];
  if (scenario?.status === 'failed') add({ rule: 'ui-assertion-failed', category: 'observed-failure', severity: 'high', confidence: 'high',
    title: 'A configured UI scenario failed', evidence: [{ file: 'scenario.json' }],
    whyItMatters: 'The observed UI did not satisfy an explicitly configured expectation. The expectation and environment still need to be checked.',
    suggestedFix: 'Inspect the failed step, matched control, network response and executed handler. Correct the implementation or update an outdated expectation based on the intended behavior.',
    verification: 'Repeat the same scenario and confirm its UI assertions and relevant HTTP checks pass.' });
  for (const group of auth) if (group.observations >= 3) add({ rule: 'repeated-auth-checks', target: group.request,
    category: 'optimization-hypothesis', severity: 'low', confidence: 'medium', title: `${group.observations} repeated unauthenticated API checks`,
    evidence: group.evidence, whyItMatters: 'Repeated checks can add request overhead; the observation may include reloads or intentional polling.',
    suggestedFix: 'Inspect session initialization and reactivity. Deduplicate concurrent checks or reuse a known unauthenticated state when correct for the application.',
    verification: 'Compare request counts in a single fresh navigation and after a deliberate auth-state change.' });
  if (auth.length) add({ rule: 'authorization-matrix-not-established', category: 'test-coverage-gap', severity: 'info', confidence: 'high',
    title: 'Role-based authorization behavior is not established by the captured rejections',
    evidence: auth.flatMap(g => g.evidence || []).slice(0, 5),
    whyItMatters: 'Observed 401/403 responses cover specific requests in this session; they do not establish which resources each role can access.',
    suggestedFix: 'Prepare explicit allow/deny checks for anonymous and authorized account roles using read-only resources and accounts you are permitted to test.',
    verification: 'Run the declared role matrix and assert expected status and content for each resource; retain the role context with the evidence.' });
  const js = requests.filter(r => /(?:java|ecma)script/i.test(r.response?.mimeType || ''));
  const uniqueJs = [...new Set(js.map(r => safeUrl(r.request?.url)))];
  if (uniqueJs.length >= 100) add({ rule: 'script-fanout', target: capture?.targetOrigin,
    category: 'optimization-hypothesis', severity: 'medium', confidence: 'medium', title: `${uniqueJs.length} distinct JavaScript URLs observed`,
    evidence: [{ file: 'capture/network/evidence.json', pointer: '/requests' }],
    whyItMatters: 'A large dependency fan-out can affect startup, but this count alone does not establish a bottleneck.',
    suggestedFix: 'Measure a controlled cold/warm navigation. Audit route-level lazy loading, unused feature imports and caching; prioritize modules on the measured critical path.',
    verification: 'Compare navigation timings and JavaScript request count before/after with the same device, network, cache state and instrumentation.' });
  const immersive = uniqueJs.filter(url => /\/immersive\//.test(url));
  if (immersive.length >= 20) add({ rule: 'immersive-prefetch-review', target: capture?.targetOrigin,
    category: 'optimization-hypothesis', severity: 'medium', confidence: 'medium', title: `${immersive.length} immersive-feature script URLs loaded`,
    evidence: [{ file: 'capture/network/evidence.json', pointer: '/requests' }],
    whyItMatters: 'If the default page does not need this feature immediately, eager imports may consume startup bandwidth and CPU.',
    suggestedFix: 'Trace the importing modules in structure.json and consider loading the immersive feature when it is opened. Confirm its role before changing preload behavior.',
    verification: 'Verify the ordinary page still works, the immersive route loads on demand, and cold-start measurements improve.' });
  const snapshots = network.snapshots || [];
  const maxMetric = field => Math.max(0, ...snapshots.map(s => s.accessibility?.[field] || 0));
  for (const [field, title, fix] of [
    ['renderedImagesMissingAlt', 'Rendered images without alt attributes', 'Supply useful alternative text for meaningful images, or alt="" for decorative images.'],
    ['renderedButtonsMissingName', 'Rendered buttons without a collected accessible name', 'Give controls a visible label or an appropriate accessible name, then verify with the browser accessibility tree and keyboard navigation.'],
  ]) if (maxMetric(field)) add({ rule: field, target: capture?.targetOrigin, category: 'accessibility-candidate', severity: 'medium', confidence: 'medium',
    title: `${title}: up to ${maxMetric(field)}`, evidence: [{ file: 'capture/network/evidence.json', pointer: '/snapshots' }],
    whyItMatters: 'The DOM heuristic found elements that may be difficult to identify with assistive technology. It is not a full accessibility audit.',
    suggestedFix: fix, verification: 'Repeat the metric and inspect the affected controls/images using a computed accessibility tree.' });
  const loadMs = snapshots.map(s => s.performanceTiming?.loadMs).filter(Number.isFinite);
  if (loadMs.some(ms => ms > 5000)) add({ rule: 'slow-instrumented-load', target: capture?.targetOrigin,
    category: 'optimization-hypothesis', severity: 'medium', confidence: 'low', title: `Instrumented load event exceeded 5 seconds (max ${Math.round(Math.max(...loadMs))} ms)`,
    evidence: [{ file: 'capture/network/evidence.json', pointer: '/snapshots' }],
    whyItMatters: 'This observation includes debugger/profiler and local network effects; it is a prompt to measure, not a production performance score.',
    suggestedFix: 'Collect an uninstrumented baseline and identify blocking resources, route bootstrap work and unnecessary dependencies.',
    verification: 'Measure repeated cold/warm navigations on a controlled connection, then compare the same metrics after the change.' });
  for (const alert of scan?.alerts || []) {
    const fixes = {
      '10055': 'Review the specific CSP directive. Where feasible, move inline script to external files or use per-response nonces/hashes; test the required interactions before enforcing the tighter policy.',
      '10047': 'Verify whether the HTTP endpoint serves content or redirects to HTTPS, then enforce the intended HTTPS-only behavior without breaking required redirects.',
      '10015': 'Review caching by resource sensitivity: public static assets and personalized responses should have appropriate, different cache policies.',
    };
    if (alert.name === 'Modern Web Application') continue;
    add({ rule: `zap-${alert.pluginId}-${alert.name}`, target: safeUrl(alert.url), category: 'scanner-finding',
      severity: ['High', 'Medium', 'Low'].includes(alert.risk) ? alert.risk.toLowerCase() : 'info',
      confidence: alert.confidence?.toLowerCase() || 'unconfirmed', title: alert.name,
      evidence: [{ file: 'scan/scan.json', pluginId: alert.pluginId }],
      whyItMatters: 'The scanner reported this condition. Its exploitability and applicability require confirmation.',
      suggestedFix: fixes[alert.pluginId] || 'Reproduce the scanner finding, confirm its impact and apply a targeted fix.',
      verification: 'Repeat the specific scanner rule and the functional checks affected by the proposed change.',
      reference: `https://www.zaproxy.org/docs/alerts/${alert.pluginId}/` });
  }
  const unexercised = [];
  for (const [i, script] of (analysis?.structure?.scripts || []).entries()) {
    if (/vendor|node_modules/.test(script.urls[0])) continue;
    for (const [j, event] of script.events.entries()) {
      const fn = script.functions.find(f => f.id === event.targetFunctionId);
      if (fn?.execution?.count === 0) unexercised.push({ event: event.event, function: fn.name, url: script.urls[0],
        evidence: { file: 'structure.json', pointer: `/scripts/${i}/events/${j}` } });
    }
  }
  if (unexercised.length) add({ rule: 'unexercised-event-handlers', category: 'test-coverage-gap', severity: 'info', confidence: 'high',
    title: `${unexercised.length} resolved application event handlers were not executed in the recorded session`,
    evidence: unexercised.slice(0, 10).map(e => e.evidence), examples: unexercised.slice(0, 10).map(({evidence,...x})=>x),
    whyItMatters: 'V8 reported zero executions for these matched callback ranges during this observation. This is a test coverage gap, not proof the feature is broken.',
    suggestedFix: 'Add focused, authorized scenarios for the relevant click, keyboard or input flows and assert their expected outcomes.',
    verification: 'Repeat precise coverage with those scenarios and confirm the intended handlers execute and their UI/API assertions pass.' });
  for (const gap of analysis?.coverage?.gaps || []) add({ rule: `collection-${gap.code}`, category: 'collection-gap',
    severity: 'info', confidence: 'high', title: `${gap.code}: ${gap.count}`, evidence: [{ file: gap.evidence }],
    whyItMatters: 'This limits what NBRET can conclude; it is not evidence of a website defect.',
    suggestedFix: /truncat|drop|bounded/.test(gap.code) ? 'Use a focused scenario or adjust the specific collection budget, then repeat the observation.' :
      /pending/.test(gap.code) ? 'Allow bounded drainage; distinguish long-lived media/streams from unfinished API requests.' :
      /policy/.test(gap.code) ? 'Review the approved observation policy and retain the reported exclusions.' : 'Recover or repeat the missing observation and preserve the original failure record.',
    verification: 'Confirm the specific coverage gap is resolved or explicitly accepted before making stronger conclusions.' });
  const order = { high: 0, medium: 1, low: 2, info: 3 };
  issues.sort((a, b) => (order[a.severity] ?? 4) - (order[b.severity] ?? 4));
  return { schemaVersion: 1, kind: 'nbret-diagnosis', issues,
    summary: { observedFailures: issues.filter(i => i.category === 'observed-failure').length,
      scannerFindings: issues.filter(i => i.category === 'scanner-finding').length,
      improvementCandidates: issues.filter(i => ['optimization-hypothesis', 'accessibility-candidate', 'review-candidate'].includes(i.category)).length,
      testCoverageGaps: issues.filter(i => i.category === 'test-coverage-gap').length,
      collectionGaps: issues.filter(i => i.category === 'collection-gap').length },
    limitations: ['Priorities are rule-based triage, not a measured quality score.', 'No fixes are applied to the target site by this analysis.'] };
}
