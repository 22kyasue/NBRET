import test from 'node:test';
import assert from 'node:assert/strict';
import { assessRun } from '../src/assess.mjs';

test('assessment distinguishes missing evidence, scope, budgets and separate COPY state', () => {
  const result = assessRun({ capture: 'captured', rea: 'disabled', copy: 'extracted' }, {
    requests: [{ inScope: false }, { inScope: true, finished: true, body: { omitted: 'size-limit' } }, { inScope: true, failure: {} }, { inScope: true }],
    dropped: { pending: 2, bytes: 1 }, errors: [{}],
  });
  const gaps = Object.fromEntries(result.gaps.map(g => [g.id, g.count]));
  assert.equal(gaps['out-of-scope-requests'], 1);
  assert.equal(gaps['response-body-gaps'], 1);
  assert.equal(gaps['unfinished-requests'], 1);
  assert.equal(gaps['failed-requests'], 1);
  assert.equal(gaps['dropped-observations'], 3);
  assert.equal(gaps['copy-separate-state'], 1);
  assert.equal(gaps['capture-failed'], undefined);
  assert.equal(gaps['copy-not-extracted'], undefined);
  assert.match(result.gaps.find(g => g.id === 'rea-not-captured').next, /disabled is not a failure/);
});
