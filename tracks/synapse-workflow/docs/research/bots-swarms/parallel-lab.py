import ast
import asyncio
import hashlib
import json
import platform
import sys
import time
from collections.abc import AsyncIterator
from pathlib import Path

HOME = Path(__file__).resolve().parent
pins = json.loads((HOME / 'snapshots.json').read_text())
queue = json.loads((HOME / 'queue.json').read_text())
root = Path(next(p['root'] for p in pins if p['name'] == 'scrapy'))
hashes = {}
checks = []
logs = []

class Logger:
    def exception(self, message):
        logs.append(message)

ns = {'asyncio': asyncio, 'AsyncIterator': AsyncIterator, 'logger': Logger()}
for relative, name in [('scrapy/utils/asyncgen.py', 'as_async_generator'),
                       ('scrapy/utils/asyncio.py', '_parallel_asyncio')]:
    raw = (root / relative).read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    expected = next(e['sha256'] for e in queue if e['repo'] == 'scrapy' and e['path'] == relative)
    assert digest == expected
    hashes[relative] = digest
    tree = ast.parse(raw.decode())
    node = next(n for n in tree.body if isinstance(n, ast.AsyncFunctionDef) and n.name == name)
    selected = ast.Module(body=[ast.ImportFrom(module='__future__', names=[ast.alias(name='annotations')], level=0), node], type_ignores=[])
    ast.fix_missing_locations(selected)
    exec(compile(selected, relative, 'exec'), ns)

parallel = ns['_parallel_asyncio']

def check(name, condition):
    checks.append({'name': name, 'pass': bool(condition)})
    assert condition, name

async def main():
    values = []
    running = 0
    peak = 0
    async def work(value):
        nonlocal running, peak
        running += 1
        peak = max(peak, running)
        await asyncio.sleep(0)
        values.append(value)
        running -= 1
    await asyncio.wait_for(parallel(range(6), 2, work), 2)
    check('sync input completes exactly once per item', sorted(values) == list(range(6)))
    check('observed concurrency two', peak == 2 and running == 0)
    values.clear()
    async def source():
        for value in range(3):
            yield value
    await asyncio.wait_for(parallel(source(), 2, work), 2)
    check('async input completes', sorted(values) == [0, 1, 2])
    values.clear()
    async def faulty(value):
        if value == 1:
            raise ValueError('synthetic item failure')
        values.append(value)
    await asyncio.wait_for(parallel(range(3), 2, faulty), 2)
    check('ordinary item failure permits siblings', sorted(values) == [0, 2])
    check('ordinary item failure logged', logs == ['Error processing an item'])
    started, cancelled, cleaned, effects = [], [], [], []
    ready = asyncio.Event()
    async def blocked(value):
        started.append(value)
        effects.append(value)
        if len(started) == 3:
            ready.set()
        try:
            await asyncio.Event().wait()
        except asyncio.CancelledError:
            cancelled.append(value)
            raise
        finally:
            await asyncio.sleep(0)
            cleaned.append(value)
    task = asyncio.create_task(parallel(range(3), 3, blocked))
    await asyncio.wait_for(ready.wait(), 2)
    task.cancel()
    try:
        await asyncio.wait_for(task, 2)
    except asyncio.CancelledError:
        check('parent cancellation propagated', True)
    else:
        check('parent cancellation propagated', False)
    check('all cooperative children cancelled', sorted(cancelled) == [0, 1, 2])
    check('child finally cleanup awaited', sorted(cleaned) == [0, 1, 2])
    check('prior synthetic effects remain', sorted(effects) == [0, 1, 2])
    entered = asyncio.Event()
    cleaned.clear()
    async def waiting(value):
        entered.set()
        try:
            await asyncio.Event().wait()
        finally:
            cleaned.append(value)
    async def broken_source():
        yield 7
        await entered.wait()
        raise ValueError('synthetic iterator failure')
    try:
        await asyncio.wait_for(parallel(broken_source(), 2, waiting), 2)
    except ExceptionGroup as error:
        check('iterator failure propagated', any(isinstance(e, ValueError) for e in error.exceptions))
    else:
        check('iterator failure propagated', False)
    check('iterator failure cleans started child', cleaned == [7])
    await asyncio.sleep(0)
    pending = [t for t in asyncio.all_tasks() if t is not asyncio.current_task() and not t.done()]
    check('no pending child tasks', not pending)
    return len(pending)

pending = asyncio.run(main())
receipt = {'at_ns': time.time_ns(), 'python': sys.version, 'platform': platform.platform(),
           'scope': 'AST-selected pinned functions; stdlib only; no network or Scrapy import',
           'hashes': hashes, 'checks': checks, 'pending_tasks': pending}
target = HOME / f"parallel-receipt-{receipt['at_ns']}.json"
with target.open('x', encoding='utf-8') as out:
    json.dump(receipt, out, indent=2)
print(json.dumps({'receipt': str(target), 'checks': len(checks), 'pending_tasks': pending}))
