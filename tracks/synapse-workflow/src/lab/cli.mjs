import { createInterface } from 'node:readline';
import { resolve } from 'node:path';
import { runLabRehearsal, runLabSuite, openLabSession, inspectLabRun } from './run.mjs';

const help = `Synapse local URL-to-report rehearsal

node src/lab/cli.mjs suite --out runs/my-fresh-suite
node src/lab/cli.mjs rehearse --out runs/my-fresh-run --mode secure
node src/lab/cli.mjs session --out runs/my-fresh-session --mode secure
node src/lab/cli.mjs inspect --out runs/existing-run

suite runs both secure and explicitly guided ownership-gap controls.
session accepts one JSON object per line. Commands:
  {"command":"request","path":"/","identity":"anonymous"}
  {"command":"request","path":"/api/register","method":"POST","identity":"owner","body":{"email":"owner@lab.test","password":"choose-a-disposable-password"}}
  {"command":"verify-mail","identity":"owner"}
  {"command":"request","path":"/api/login","method":"POST","identity":"owner","body":{"email":"owner@lab.test","password":"choose-a-disposable-password"}}
  {"command":"request","path":"/api/me","identity":"owner"}
  {"command":"hypothesis","question":"...","prediction":"...","disconfirmation":"...","evidenceIds":["receipt-id"]}
  {"command":"evaluate","ownerCreate":"id","ownerRead":"id","otherRead":"id","otherMe":"id","ownerMe":"id","anonymousRead":"id"}
  {"command":"report"}
  {"command":"status"}
  {"command":"stop"}

Request target is app (default) or inbox; only admitted relative paths. Auth is
kept in session memory, never echoed. Inspect reads records without networking.
EOF, SIGINT, SIGTERM and the session lifetime close owned services. Reuse no old
output directory. This is trusted local guided operation, not an OS sandbox,
external mailbox integration, hidden benchmark or autonomous discovery claim.
`;

function options(args) {
  const result = {};
  if (args.length % 2) throw Error('Options must have values');
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!['--out', '--mode'].includes(key) || Object.hasOwn(result, key)) throw Error('Unknown or duplicate option');
    result[key] = args[i + 1];
  }
  if (!result['--out']) throw Error('--out is required');
  return { outDir: resolve(result['--out']), mode: result['--mode'] ?? 'secure' };
}
const emit = value => process.stdout.write(JSON.stringify(value) + '\n');

async function interactive(config) {
  const session = await openLabSession({ ...config, deadlineMs: 10 * 60 * 1000 });
  const lines = createInterface({ input: process.stdin, crlfDelay: Infinity, terminal: false });
  let stopping;
  const finish = () => stopping ??= (async () => {
    lines.close();
    const cleanup = await session.close();
    const summary = await session.exportReport();
    emit({ type: 'stopped', cleanup, reportPath: summary.reportPath, summaryPath: summary.summaryPath });
  })();
  const onSignal = () => { void finish().catch(() => { process.exitCode = 1; }); };
  process.once('SIGINT', onSignal); process.once('SIGTERM', onSignal);
  const lifetime = setTimeout(onSignal, 10 * 60 * 1000); lifetime.unref();
  emit({ type: 'ready', ...session.status(), commandHelp: 'Send one JSON command per line. Stop with {"command":"stop"}; EOF also closes owned services.' });
  try {
    for await (const line of lines) {
      if (stopping) break;
      if (!line.trim()) continue;
      try {
        if (Buffer.byteLength(line) > 16384) throw Error('Command too large');
        const value = JSON.parse(line);
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Expected command object');
        const { command, ...params } = value;
        if (command === 'request') {
          const response = await session.request(params);
          emit({ type: 'observation', receipt: response.receipt, data: response.data });
        } else if (command === 'verify-mail') emit({ type: 'verification', ...await session.verifyMail(params) });
        else if (command === 'hypothesis') emit({ type: 'hypothesis', hypothesis: await session.setHypothesis(params) });
        else if (command === 'evaluate') emit({ type: 'evaluation', evaluation: await session.evaluate(params) });
        else if (command === 'report') emit({ type: 'report', ...await session.exportReport() });
        else if (command === 'status') emit({ type: 'status', ...session.status() });
        else if (command === 'stop') { await finish(); break; }
        else throw Error('Unknown command');
      } catch {
        // Do not print parser excerpts or arbitrary errors which may contain a
        // submitted password/token. No unknown command is executed as code.
        emit({ type: 'command-rejected', reason: 'Invalid command or incomplete operation; consult retained observations. No shell execution or authority expansion.' });
      }
    }
  } finally {
    clearTimeout(lifetime); process.removeListener('SIGINT', onSignal); process.removeListener('SIGTERM', onSignal);
    await finish();
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || ['help', '--help', '-h'].includes(command)) { process.stdout.write(help); return; }
  if (!['suite', 'rehearse', 'session', 'inspect'].includes(command)) throw Error('Unknown command');
  const config = options(args);
  if (command === 'inspect') { emit(await inspectLabRun(config.outDir)); return; }
  if (command === 'session') { await interactive(config); return; }
  const result = command === 'suite' ? await runLabSuite(config) : await runLabRehearsal(config);
  emit(result);
  if (result.status === 'incomplete') process.exitCode = 1;
}
main().catch(() => { process.stderr.write('Local lab command failed. Use a fresh output directory and inspect retained records; no external fallback was attempted.\n'); process.exitCode = 1; });
