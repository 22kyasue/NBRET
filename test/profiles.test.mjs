import test from 'node:test';
import assert from 'node:assert/strict';
import { captureProfile } from '../src/profiles.mjs';

test('profiles select only required passes and return independent configurations', () => {
  assert.equal(captureProfile('network').rea, false);
  assert.equal(captureProfile('network').visual, false);
  assert.equal(captureProfile('behavior').visual, true);
  assert.equal(captureProfile('behavior').copy, false);
  assert.equal(captureProfile('full').copy, true);
  const p = captureProfile('network'); p.copy = true;
  assert.equal(captureProfile('network').copy, false);
  assert.throws(() => captureProfile('constructor'));
});
