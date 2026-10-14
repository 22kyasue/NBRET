import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { runCapture } from '../src/run.mjs';
import { loadRun, compareRuns } from '../src/compare.mjs';

test('WebSocket and SSE observations are bounded, opt-in and key-redacted', { timeout: 30000 }, async () => {
  const sockets = new Set();
  const server = createServer((req, res) => {
    if (req.url === '/events') { res.writeHead(200, { 'Content-Type': 'text/event-stream' }); res.end('data: {"result":42,"token":"fixture-secret"}\n\n'); return; }
    res.setHeader('Content-Type', 'text/html');
    res.end('<output id="ws"></output><output id="sse"></output><script>const ws=new WebSocket(location.origin.replace("http","ws")+"/socket");ws.onmessage=e=>{document.querySelector("#ws").textContent=JSON.parse(e.data).result;ws.close()};const events=new EventSource("/events");events.onmessage=e=>{document.querySelector("#sse").textContent=JSON.parse(e.data).result;events.close()}</script>');
  });
  server.on('upgrade', (req, socket) => {
    sockets.add(socket); socket.on('close', () => sockets.delete(socket));
    const accept = createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    const body = Buffer.from('{"result":42,"token":"fixture-secret"}');
    socket.write(Buffer.concat([Buffer.from([0x81, body.length]), body]));
    socket.on('data', () => socket.end(Buffer.from([0x88, 0x00])));
    socket.on('error', () => {});
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  await mkdir('runs', { recursive: true });
  try {
    for (const enabled of [false, true]) {
      const out = resolve(`runs/streams-${enabled}-${Date.now()}`);
      const summary = await runCapture({ url: `http://127.0.0.1:${server.address().port}/`, outDir: out, rea: false, copy: false, includeStreamPayloads: enabled });
      assert.equal(summary.capture, 'captured');
      const raw = await readFile(join(out, 'network/evidence.json'), 'utf8');
      const evidence = JSON.parse(raw);
      const ws = evidence.sockets.flatMap(s => s.frames).find(f => f.direction === 'received' && f.opcode === 1);
      const sse = evidence.eventSources[0];
      assert.ok(ws); assert.ok(sse);
      for (const event of [ws, sse]) {
        if (enabled) assert.deepEqual(JSON.parse(event.payload.text), { result: 42, token: '[REDACTED]' });
        else { assert.equal(event.payloadOmitted, 'secret-safety'); assert.equal(event.payload, undefined); }
      }
      assert.ok(!raw.includes('fixture-secret'));
      const loaded = await loadRun(out);
      assert.equal(loaded.streams.length, 2);
      assert.deepEqual(compareRuns(loaded, loaded).changes, []);
      if (enabled) assert.ok(loaded.streams.every(s => s.messages[0].payloadHash));
    }
  } finally {
    for (const socket of sockets) socket.destroy();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});

test('binary and unstructured stream messages keep comparable digests without persisting raw bytes', { timeout: 45000 }, async () => {
  const sockets = new Set();
  let variant = 'a';
  const server = createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.end('<output></output><script>const ws=new WebSocket(location.origin.replace("http","ws")+"/socket");ws.binaryType="arraybuffer";let n=0;ws.onmessage=()=>{if(++n===2){document.querySelector("output").textContent="done";ws.close()}}</script>');
  });
  server.on('upgrade', (req, socket) => {
    sockets.add(socket); socket.on('close', () => sockets.delete(socket));
    const accept = createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    const binary = gzipSync(Buffer.from(`binary-secret-${variant}`)), text = Buffer.from(`plain token=text-secret-${variant}`);
    socket.write(Buffer.concat([Buffer.from([0x82, binary.length]), binary, Buffer.from([0x81, text.length]), text]));
    socket.on('data', () => socket.end(Buffer.from([0x88, 0x00])));
    socket.on('error', () => {});
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  await mkdir('runs', { recursive: true });
  const capture = async (enabled, label) => {
    const out = resolve(`runs/binary-streams-${label}-${Date.now()}`);
    const summary = await runCapture({ url: `http://127.0.0.1:${server.address().port}/`, outDir: out, rea: false, copy: false, includeStreamPayloads: enabled, expectations: [{ selector: 'output', text: 'done' }] });
    assert.equal(summary.assertions[0].passed, true, JSON.stringify(summary.assertions));
    const raw = await readFile(join(out, 'network/evidence.json'), 'utf8');
    assert.ok(!/binary-secret|text-secret/.test(raw));
    return { out, frames: JSON.parse(raw).sockets.flatMap(s => s.frames).filter(f => f.direction === 'received' && [1, 2].includes(f.opcode)) };
  };
  try {
    const off = await capture(false, 'off');
    assert.ok(off.frames.every(f => !f.payloadHash && f.payloadOmitted === 'secret-safety'));
    const a1 = await capture(true, 'a1'), a2 = await capture(true, 'a2');
    const bin = a1.frames.find(f => f.opcode === 2), txt = a1.frames.find(f => f.opcode === 1);
    assert.equal(bin.payloadFormat, 'gzip'); assert.equal(bin.payloadOmitted, 'binary-frame'); assert.match(bin.payloadHash, /^[a-f0-9]{64}$/);
    assert.equal(bin.payloadBytes, gzipSync(Buffer.from('binary-secret-a')).length);
    assert.equal(txt.payloadFormat, 'text'); assert.equal(txt.payload.omitted, 'non-structured-payload'); assert.ok(txt.payloadHash);
    assert.deepEqual(compareRuns(await loadRun(a1.out), await loadRun(a2.out)).changes, []);
    variant = 'b';
    const b = await capture(true, 'b');
    const changes = compareRuns(await loadRun(a1.out), await loadRun(b.out)).changes;
    assert.ok(changes.some(c => /stream/i.test(JSON.stringify(c))), JSON.stringify(changes));
  } finally {
    for (const socket of sockets) socket.destroy();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});

test('stream format sniffing recognizes common framings without decoding content', async () => {
  const { sniffFormat } = await import('../src/capture.mjs');
  const cases = { gzip: gzipSync(Buffer.from('x')), 'msgpack-map-like': Buffer.from([0x81, 0xa1, 0x61, 0x01]), 'protobuf-like': Buffer.from([0x08, 0x96, 0x01]), 'json-like-text': Buffer.from('{"a":1}'), text: Buffer.from('hello'), empty: Buffer.alloc(0) };
  for (const [format, bytes] of Object.entries(cases)) assert.equal(sniffFormat(bytes), format);
});
