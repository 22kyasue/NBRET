import { readFile, writeFile, mkdir, stat, realpath } from 'node:fs/promises';
import { resolve, relative, isAbsolute, join } from 'node:path';
import { createHash } from 'node:crypto';
import { clean, safeUrl } from './capture.mjs';
import { shape, contractKey } from './probe.mjs';

const redacted = value => JSON.stringify(value).includes('[REDACTED]');
const digest = value => createHash('sha256').update(value).digest('hex');

/** Derive observed HTTP contracts and draft variations without sending requests. */
export async function buildContractPlan({ networkDir, maxContracts = 100, maxSamples = 5, maxBytes = 1048576, maxTotalBytes = 20 * 1024 * 1024 } = {}) {
  for (const [name, value, limit] of [['maxContracts', maxContracts, 1000], ['maxSamples', maxSamples, 30], ['maxBytes', maxBytes, 20 * 1024 * 1024]]) {
    if (!Number.isSafeInteger(value) || value < 1 || value > limit) throw new Error(`Invalid ${name}`);
  }
  if (!Number.isSafeInteger(maxTotalBytes) || maxTotalBytes < 4096 || maxTotalBytes > 100 * 1024 * 1024) throw new Error('Invalid maxTotalBytes');
  const root = await realpath(resolve(networkDir)), evidenceFile = join(root, 'evidence.json');
  if ((await stat(evidenceFile)).size > 30 * 1024 * 1024) throw new Error('Evidence exceeds inventory budget');
  const sourceBytes = await readFile(evidenceFile);
  if (sourceBytes.length > 30 * 1024 * 1024) throw new Error('Evidence exceeds inventory budget');
  const evidence = JSON.parse(sourceBytes.toString('utf8'));
  if (!Array.isArray(evidence.requests) || evidence.requests.length > 10000) throw new Error('Invalid request evidence');
  const result = { schemaVersion: 1, status: 'draft', generatedAt: new Date().toISOString(),
    source: 'network/evidence.json', sourceSha256: digest(sourceBytes),
    limits: { maxContracts, maxSamples, maxBytes, maxTotalBytes }, contracts: [], proposals: [],
    coverage: { outOfScopeRequests: 0, omittedContracts: 0, omittedSamples: 0, unavailableBodies: 0, byteLimited: false },
    limitations: ['Observed contracts only; no endpoint completeness or server implementation is inferred.',
      'Proposals are unexecuted drafts. Select and authorize concrete probe cases before execution.',
      'Redacted inputs and required credentials cannot be recovered or safely replayed from evidence.',
      'Requests are linked to observation intervals, not proven causal actions.'] };
  const contracts = new Map();
  let retainedBytes = 0;
  const reserve = value => {
    const bytes = Buffer.byteLength(JSON.stringify(value));
    if (retainedBytes + bytes > Math.floor(maxTotalBytes * 0.7)) { result.coverage.byteLimited = true; return false; }
    retainedBytes += bytes; return true;
  };
  const loadBody = async file => {
    if (typeof file !== 'string') return undefined;
    const path = resolve(root, file), rel = relative(root, path);
    if (!rel || rel.startsWith('..') || isAbsolute(rel)) return undefined;
    try {
      const canonical = await realpath(path), canonicalRelative = relative(root, canonical);
      if (!canonicalRelative || canonicalRelative.startsWith('..') || isAbsolute(canonicalRelative)) return undefined;
      if ((await stat(path)).size > maxBytes) return undefined;
      return clean(JSON.parse(await readFile(path, 'utf8')));
    } catch { return undefined; }
  };
  for (const request of evidence.requests) {
    if (!request.inScope) { result.coverage.outOfScopeRequests++; continue; }
    if (!request.request?.url || !request.request.method) continue;
    const url = safeUrl(request.request.url), method = request.request.method.toUpperCase();
    let key; try { key = contractKey(url, method); } catch { continue; }
    let contract = contracts.get(key);
    if (!contract) {
      if (contracts.size >= maxContracts) { result.coverage.omittedContracts++; continue; }
      contract = { id: digest(key).slice(0, 16), key, method, endpoint: key.slice(method.length + 1),
        observations: 0, statuses: [], queryKeys: [], samples: [] };
      contracts.set(key, contract);
    }
    contract.observations++;
    if (request.response?.status !== undefined && !contract.statuses.includes(request.response.status)) contract.statuses.push(request.response.status);
    for (const key of new URL(url).searchParams.keys()) if (!contract.queryKeys.includes(key)) contract.queryKeys.push(key);
    if (contract.samples.length >= maxSamples) { result.coverage.omittedSamples++; continue; }
    let input;
    if (request.request.postData?.text && Buffer.byteLength(request.request.postData.text) <= maxBytes) {
      try { input = clean(JSON.parse(request.request.postData.text)); } catch {}
    }
    const output = await loadBody(request.body?.file);
    if (output === undefined) result.coverage.unavailableBodies++;
    const headers = clean(request.request.headers || {});
    const missingCredentials = Object.values(headers).some(value => value === '[REDACTED]') ||
      [...new URL(url).searchParams.values()].some(value => value.includes('[REDACTED]')) || (input !== undefined && redacted(input));
    const sample = { requestId: request.requestId, hop: request.hop || 0,
      observationIntervalId: request.observationIntervalId ?? request.actionId, association: 'temporal-not-causal',
      url, ...(input !== undefined ? { input, inputShape: shape(input) } : {}),
      ...(output !== undefined ? { output, outputShape: shape(output) } : { outputOmitted: request.body?.omitted || 'unavailable' }),
      status: request.response?.status, missingCredentials };
    if (!reserve(sample)) { result.coverage.omittedSamples++; continue; }
    contract.samples.push(sample);
    // Only structured JSON API observations are proposed, excluding scripts/documents.
    if (output === undefined || missingCredentials || !['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) continue;
    if (!['GET', 'HEAD'].includes(method) && input === undefined) continue;
    const source = { contractId: contract.id, requestId: request.requestId, hop: request.hop || 0 };
    const add = (kind, body) => {
      if (result.proposals.length >= maxContracts * maxSamples * 4) return;
      const proposal = { kind, source, requiresReview: true, requiresWriteAuthorization: !['GET', 'HEAD'].includes(method),
        request: { url, method, ...(body !== undefined ? { body } : {}) } };
      const sig = digest(JSON.stringify(proposal.request));
      if (!result.proposals.some(p => p.signature === sig) && reserve(proposal)) result.proposals.push({ ...proposal, signature: sig });
    };
    add('observed-input', input);
    if (input && typeof input === 'object' && !Array.isArray(input)) {
      // Bounded, one-field numeric boundaries. They are hypotheses, not expected outputs.
      const field = Object.keys(input).find(key => typeof input[key] === 'number' && Number.isFinite(input[key]));
      if (field) for (const value of [0, -1, 1]) if (input[field] !== value) add(`numeric-boundary:${field}`, { ...input, [field]: value });
    }
  }
  result.contracts = [...contracts.values()];
  result.coverage.contracts = result.contracts.length;
  result.coverage.proposals = result.proposals.length;
  // Account for metadata and pretty-printing, as well as retained payloads.
  while (Buffer.byteLength(JSON.stringify(result, null, 2)) > maxTotalBytes) {
    result.coverage.byteLimited = true;
    if (result.proposals.length) result.proposals.pop();
    else {
      const contract = result.contracts.findLast(c => c.samples.length);
      if (!contract) throw new Error('Inventory metadata exceeds byte budget');
      contract.samples.pop(); result.coverage.omittedSamples++;
    }
    result.coverage.proposals = result.proposals.length;
  }
  return result;
}

export async function runContractPlan({ outDir, ...options } = {}) {
  const plan = await buildContractPlan(options);
  await mkdir(outDir, { recursive: false });
  await writeFile(join(outDir, 'probe-plan.json'), JSON.stringify(plan, null, 2));
  return plan;
}
