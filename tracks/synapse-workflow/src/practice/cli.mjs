import { startPracticeApp } from './app.mjs';

const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--port' || !/^(0|[1-9][0-9]*)$/.test(args[1]))) throw new Error('Usage: node src/practice/cli.mjs [--port 0]');
const app = await startPracticeApp({ port: args.length ? Number(args[1]) : 0 });
console.log(app.url);
let closing = false;
const stop = async () => { if (closing) return; closing = true; await app.close(); };
process.once('SIGINT', stop); process.once('SIGTERM', stop);
