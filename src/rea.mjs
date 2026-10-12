import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
const exec = promisify(execFile);
const cli = fileURLToPath(new URL('../node_modules/rea-agents/scripts/rea.mjs', import.meta.url));

export async function inspectWithRea(endpoint, targetId, { includeScriptSources = false } = {}) {
  const args = [cli, 'inspect-web-page', endpoint, targetId, '--observation-ms', '500',
    '--include-json-body-shapes', '--include-storage-keys', '--format', 'json'];
  if (includeScriptSources) args.push('--include-script-sources');
  const { stdout } = await exec(process.execPath, args, { timeout: 120000, maxBuffer: 32 * 1024 * 1024, windowsHide: true });
  const data = JSON.parse(stdout);
  if (data.isError || data.error || data.success === false || data.operation !== 'inspect_web_page' || !data.normalized_result?.target) {
    throw new Error('REA did not return the expected page inspection evidence');
  }
  return { version: '6.4.0', phase: 'after-actions; separate observation window', data };
}
