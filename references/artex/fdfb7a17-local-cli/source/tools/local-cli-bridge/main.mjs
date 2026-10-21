import { readFile } from 'node:fs/promises';
import { createBridgeServer } from './server.mjs';
import { createRunner } from './runner.mjs';

async function main() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--token-file', '--port', '--host'].includes(args[i]) || !args[i + 1] || Object.hasOwn(options, args[i])) throw new Error('Usage: node main.mjs [--token-file PATH] [--port 18789] [--host 127.0.0.1]');
    options[args[i]] = args[i + 1];
  }
  const host = options['--host'] ?? '127.0.0.1';
  if (!['127.0.0.1', '::1'].includes(host)) throw new Error('Bridge must bind a loopback address.');
  const port = Number(options['--port'] ?? 18789);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port.');
  const token = options['--token-file']
    ? (await readFile(options['--token-file'], 'utf8')).trim()
    : process.env.ARTEX_CLI_BRIDGE_TOKEN;
  const server = createBridgeServer({ token, runner: createRunner() });
  server.on('error', error => {
    console.error(`Local CLI bridge cannot listen (${error.code ?? 'error'}).`);
    process.exitCode = 1;
  });
  server.listen(port, host, () => console.log(`Local CLI bridge listening on ${host}:${port} (buffered responses).`));
  const stop = () => {
    server.close();
    server.closeAllConnections();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}
main().catch(error => {
  // Configuration errors are generated here; file-system paths and contents are not logged.
  console.error(error.code ? `Local CLI bridge configuration failed (${error.code}).` : error.message);
  process.exitCode = 1;
});
