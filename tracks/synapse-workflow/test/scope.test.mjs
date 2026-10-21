import test from 'node:test';
import assert from 'node:assert/strict';
import { createScope } from '../src/scope.mjs';

test('scope matches exact scheme, hostname and port, rejecting credentials and malformed entries', () => {
  const scope = createScope(['https://example.com', 'http://127.0.0.1:8080']);
  assert.equal(scope.allows('https://example.com/api?q=1'), true);
  for (const url of ['http://example.com', 'https://example.com:8443', 'https://example.com.attacker.test',
    'https://api.example.com', 'https://user:pass@example.com', 'file:///tmp/test', 'bad']) {
    assert.equal(scope.allows(url), false, url);
    assert.throws(() => scope.require(url));
  }
  for (const origin of ['https://example.com/path', 'https://example.com?token=secret',
    'https://user:pass@example.com', 'ftp://example.com', 'https://example.com/#part']) {
    assert.throws(() => createScope([origin]));
  }
});
