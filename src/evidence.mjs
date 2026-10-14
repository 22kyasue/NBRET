import { readFile } from 'node:fs/promises';
import { join, resolve, relative, isAbsolute } from 'node:path';

export async function readEvidence(root, summary) {
  try {
    const raw = await readFile(join(root, 'network/evidence.json'), 'utf8');
    const evidence = JSON.parse(raw), inputs = [{ file: 'network/evidence.json', raw }];
    for (const target of summary.targetCapture?.targets || []) {
      const path = resolve(root, target.file), rel = relative(resolve(root), path);
      if (isAbsolute(rel) || rel === '..' || rel.startsWith('../') || rel.startsWith('..\\')) throw new Error('Target evidence path escapes capture');
      const targetRaw = await readFile(path, 'utf8'), child = JSON.parse(targetRaw);
      inputs.push({ file: target.file, raw: targetRaw });
      const prefix = target.file.replace(/^network\//, '').replace(/evidence\.json$/, '');
      const decorate = r => ({ ...r, targetId: target.targetId, targetType: target.type,
        ...(r.requestId ? { requestId: `${target.targetId}:${r.requestId}`, originalRequestId: r.requestId } : {}),
        ...(r.body?.file ? { body: { ...r.body, file: prefix + r.body.file } } : {}),
        ...(r.file ? { file: prefix + r.file } : {}) });
      for (const key of ['requests', 'scripts', 'sockets', 'eventSources', 'errors']) evidence[key] = [...(evidence[key] || []), ...(child[key] || []).map(decorate)];
      evidence.savedAssetBytes = (evidence.savedAssetBytes || 0) + (child.savedAssetBytes || 0);
      if (child.assetReuse) for (const field of ['hits', 'misses', 'linkedBytes', 'copiedBytes']) { evidence.assetReuse ||= { enabled: child.assetReuse.enabled }; evidence.assetReuse[field] = (evidence.assetReuse[field] || 0) + (child.assetReuse[field] || 0); }
      for (const [key, value] of Object.entries(child.dropped || {})) { evidence.dropped ||= {}; evidence.dropped[key] = (evidence.dropped[key] || 0) + value; }
    }
    return { raw: inputs.length === 1 ? raw : JSON.stringify(inputs), evidence, missing: false };
  } catch (error) {
    if (error.code !== 'ENOENT' || summary.capture === 'captured') throw error;
    const evidence = { identity: summary.identity, requests: [], actions: [], scripts: [], errors: [{ code: 'NETWORK_EVIDENCE_MISSING' }],
      limitations: ['No network evidence file was recovered from this failed capture; empty lists do not mean no traffic occurred.'] };
    return { raw: JSON.stringify(evidence), evidence, missing: true };
  }
}
