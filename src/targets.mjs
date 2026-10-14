import { EventEmitter } from 'node:events';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { startCapture } from './capture.mjs';

// Flattened CDP transport restricted to the newly launched, owned browser endpoint.
async function connect(endpoint) {
  const u = new URL(endpoint);
  if (u.protocol !== 'ws:' || u.hostname !== '127.0.0.1') throw new Error('Owned loopback CDP endpoint required');
  const socket = new WebSocket(endpoint), events = new EventEmitter(), pending = new Map();
  events.setMaxListeners(1000);
  let id = 0;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { socket.close(); reject(new Error('CDP connection timeout')); }, 10000);
    socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
    socket.addEventListener('error', () => { clearTimeout(timer); reject(new Error('CDP connection failed')); }, { once: true });
  });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id); if (!request) return;
      pending.delete(message.id); clearTimeout(request.timer);
      if (message.error) request.reject(Object.assign(new Error('CDP command failed'), { cdpMethod: request.method, cdpCode: message.error.code })); else request.resolve(message.result);
    } else {
      // A detached target never answers: fail its outstanding commands now instead of waiting for the timeout.
      if (message.method === 'Target.detachedFromTarget') for (const [requestId, p] of pending) if (p.sessionId === message.params.sessionId) {
        pending.delete(requestId); clearTimeout(p.timer); p.reject(Object.assign(new Error('Target ended'), { cdpMethod: p.method }));
      }
      events.emit(message.method, message.params, message.sessionId);
    }
  });
  socket.addEventListener('close', () => { for (const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error('CDP disconnected')); } pending.clear(); });
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => { pending.delete(requestId); reject(Object.assign(new Error('CDP command timeout'), { cdpMethod: method })); }, 10000);
    pending.set(requestId, { resolve, reject, timer, method, sessionId });
    try { socket.send(JSON.stringify({ id: requestId, method, params, ...(sessionId ? { sessionId } : {}) })); }
    catch { clearTimeout(timer); pending.delete(requestId); reject(new Error('CDP send failed')); }
  });
  const session = sessionId => {
    const listeners = new Map();
    return {
      send: (method, params) => send(method, params, sessionId),
      on(method, handler) { const wrapper = (params, id) => { if (id === sessionId) handler(params); }; listeners.set(handler, [method, wrapper]); events.on(method, wrapper); },
      off(method, handler) { const entry = listeners.get(handler); if (entry) { events.off(entry[0], entry[1]); listeners.delete(handler); } },
      async detach() { for (const [method, wrapper] of listeners.values()) events.off(method, wrapper); listeners.clear(); await send('Target.detachFromTarget', { sessionId }).catch(() => {}); },
    };
  };
  return { send, session, events, close: () => socket.close() };
}

export async function startTargetCapture(page, { endpoint, outDir, origins, identity, includeScriptSources, includeStreamPayloads, assetStore, heldBodies }) {
  const transport = await connect(endpoint), recorders = new Map(), tasks = new Set(), initializing = new Map(), instrumented = new Set();
  const errors = [], filter = [{ type: 'page' }, { type: 'iframe' }, { type: 'worker' }, { type: 'service_worker' }, { type: 'shared_worker' }, { exclude: true }];
  const autoAttach = { autoAttach: true, waitForDebuggerOnStart: true, flatten: true, filter };
  let currentAction = null, stopping = false;
  // Lifecycle of every auto-attached target, including ones that end before capture finishes.
  const lifecycle = new Map(), sessions = new Map();
  const detached = ({ sessionId, targetId }) => {
    const entry = lifecycle.get(targetId || sessions.get(sessionId));
    if (entry && !entry.endedAt) Object.assign(entry, { endedAt: new Date().toISOString(), endedDuringAction: currentAction?.id ?? null });
  };
  transport.events.on('Target.detachedFromTarget', detached);
  const attached = ({ sessionId, targetInfo }) => {
    sessions.set(sessionId, targetInfo.targetId);
    if (!lifecycle.has(targetInfo.targetId)) lifecycle.set(targetInfo.targetId, { targetId: targetInfo.targetId, type: targetInfo.type, startedAt: new Date().toISOString(), startedDuringAction: currentAction?.id ?? null });
    const task = (async () => {
      const session = transport.session(sessionId);
      try {
        if (initializing.has(targetInfo.targetId)) { await initializing.get(targetInfo.targetId); return; }
        if (recorders.has(targetInfo.targetId)) return;
        if (!stopping && ['page', 'iframe', 'worker'].includes(targetInfo.type)) await session.send('Target.setAutoAttach', { ...autoAttach, filter: filter.filter(f => !['service_worker', 'shared_worker'].includes(f.type)) }).catch(() => {});
        if (!stopping && ['iframe', 'worker', 'service_worker', 'shared_worker'].includes(targetInfo.type)) {
          if (recorders.size >= 20) { errors.push({ code: 'TARGET_LIMIT' }); return; }
          const tag = createHash('sha256').update(targetInfo.targetId).digest('hex').slice(0, 24);
          const recorder = await startCapture(page, { outDir: join(outDir, tag), origins, includeScriptSources, includeStreamPayloads, assetStore, heldBodies,
            identity: { ...identity, targetId: targetInfo.targetId, targetType: targetInfo.type }, session });
          if (currentAction) recorder.markAction(currentAction.label, currentAction.id);
          recorders.set(targetInfo.targetId, { recorder, targetInfo, tag });
          instrumented.add(targetInfo.targetId);
        }
      } catch (error) { errors.push({ code: 'TARGET_ATTACH_FAILED', type: targetInfo.type, method: error.cdpMethod, cdpCode: error.cdpCode }); }
      finally { await session.send('Runtime.runIfWaitingForDebugger').catch(() => {}); }
    })();
    if (!initializing.has(targetInfo.targetId)) initializing.set(targetInfo.targetId, task);
    tasks.add(task); task.finally(() => tasks.delete(task));
  };
  transport.events.on('Target.attachedToTarget', attached);
  try { await transport.send('Target.setAutoAttach', autoAttach); }
  catch (error) {
    stopping = true;
    transport.events.off('Target.attachedToTarget', attached); transport.events.off('Target.detachedFromTarget', detached);
    await transport.send('Target.setAutoAttach', { autoAttach: false, waitForDebuggerOnStart: false, flatten: true }).catch(() => {});
    transport.close();
    throw error;
  }
  while (tasks.size) await Promise.all([...tasks]);
  return {
    instrumented,
    markAction(label, id) { currentAction = { label, id }; for (const { recorder } of recorders.values()) recorder.markAction(label, id); },
    async finish() {
      stopping = true;
      while (tasks.size) await Promise.all([...tasks]);
      const targets = [];
      for (const { recorder, targetInfo, tag } of recorders.values()) {
        try {
          const evidence = await recorder.finish();
          const life = lifecycle.get(targetInfo.targetId);
          targets.push({ targetId: targetInfo.targetId, type: targetInfo.type, file: `network/targets/${tag}/evidence.json`, requests: evidence.requests.length, scripts: evidence.scripts.length, status: 'captured', endedBeforeFinish: !!life?.endedAt });
        } catch { errors.push({ code: 'TARGET_FINISH_FAILED', type: targetInfo.type }); }
      }
      transport.events.off('Target.attachedToTarget', attached); transport.events.off('Target.detachedFromTarget', detached);
      await transport.send('Target.setAutoAttach', { autoAttach: false, waitForDebuggerOnStart: false, flatten: true }).catch(() => {});
      transport.close();
      const recorded = new Set(targets.map(t => t.targetId));
      return { targets, lifecycle: [...lifecycle.values()].map(l => ({ ...l, recorded: recorded.has(l.targetId) })), errors,
        limitations: ['Up to 20 independently recorded worker/frame targets in the owned browser.', 'Targets start paused until instrumented, so short-lived workers keep their first requests; lifecycle times are when CDP reported attach/detach.', 'Action association is temporal; service-worker install/activate states are not tracked.'] };
    },
  };
}
