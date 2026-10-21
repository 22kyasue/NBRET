import { isDeepStrictEqual } from 'node:util';

const typeOf = value => value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
const matcherKeys = new Set(['exists', 'type', 'equals', 'includes', 'minLength', 'maxLength', 'min', 'max']);
export function validateMatcher(matcher) {
  if (!matcher || typeof matcher !== 'object' || Array.isArray(matcher) || !Object.keys(matcher).length ||
      Object.keys(matcher).some(key => !matcherKeys.has(key))) throw new Error('Unsupported assertion matcher');
  if (matcher.type !== undefined && !['null', 'array', 'object', 'string', 'number', 'boolean'].includes(matcher.type)) throw new Error('Invalid assertion type');
  if (matcher.exists !== undefined && typeof matcher.exists !== 'boolean') throw new Error('Invalid exists assertion');
  if (matcher.includes !== undefined && typeof matcher.includes !== 'string') throw new Error('includes requires string');
  for (const key of ['minLength', 'maxLength']) if (matcher[key] !== undefined && (!Number.isSafeInteger(matcher[key]) || matcher[key] < 0)) throw new Error('Invalid length assertion');
  for (const key of ['min', 'max']) if (matcher[key] !== undefined && !Number.isFinite(matcher[key])) throw new Error('Invalid numeric assertion');
}

export function atPointer(value, pointer) {
  if (typeof pointer !== 'string' || (pointer !== '' && !pointer.startsWith('/')) || /~(?![01])/u.test(pointer)) throw new Error('JSON path must be an RFC6901 pointer');
  let found = true, current = value;
  for (const part of pointer === '' ? [] : pointer.slice(1).split('/').map(x => x.replace(/~1/g, '/').replace(/~0/g, '~'))) {
    if (current === null || typeof current !== 'object' || !Object.hasOwn(current, part)) { found = false; current = undefined; break; }
    current = current[part];
  }
  return { found, value: current };
}

export function matchValue(actual, matcher, { found = true, path = '' } = {}) {
  validateMatcher(matcher);
  if (actual === '[REDACTED]') return [{ path, assertion: 'value', outcome: 'unavailable', reason: 'Value was redacted' }];
  const results = [];
  const add = (assertion, passed) => results.push({ path, assertion, outcome: passed ? 'passed' : 'failed' });
  for (const [key, expected] of Object.entries(matcher)) {
    if (key === 'exists') add(key, found === expected);
    else if (key === 'type') add(key, found && typeOf(actual) === expected);
    else if (key === 'equals') add(key, found && isDeepStrictEqual(actual, expected));
    else if (key === 'includes') add(key, found && typeof actual === 'string' && actual.includes(expected));
    else if (key === 'min' || key === 'max') add(key, found && typeof actual === 'number' && (key === 'min' ? actual >= expected : actual <= expected));
    else {
      const length = typeof actual === 'string' || Array.isArray(actual) ? actual.length : actual && typeof actual === 'object' ? Object.keys(actual).length : null;
      add(key, found && length !== null && (key === 'minLength' ? length >= expected : length <= expected));
    }
  }
  return results;
}

export function validateExpect(expect) {
  if (!expect || typeof expect !== 'object' || Array.isArray(expect) ||
    Object.keys(expect).some(k => !['status', 'headers', 'json', 'maxDurationMs'].includes(k))) throw new Error('Invalid expectations');
  const statuses = expect.status === undefined ? [] : Array.isArray(expect.status) ? expect.status : [expect.status];
  if (expect.status !== undefined && !statuses.length || statuses.some(v => !Number.isSafeInteger(v) || v < 100 || v > 599)) throw new Error('Invalid status expectation');
  if (expect.maxDurationMs !== undefined && (!Number.isFinite(expect.maxDurationMs) || expect.maxDurationMs < 0)) throw new Error('Invalid duration expectation');
  if (expect.headers !== undefined) {
    if (!expect.headers || typeof expect.headers !== 'object' || Array.isArray(expect.headers)) throw new Error('Invalid header assertions');
    for (const matcher of Object.values(expect.headers)) validateMatcher(matcher);
  }
  if (expect.json !== undefined) {
    if (!Array.isArray(expect.json) || expect.json.length > 100) throw new Error('Invalid JSON assertions');
    for (const { path, ...matcher } of expect.json) { atPointer({}, path); validateMatcher(matcher); }
  }
}

export function evaluateExpect(entry, expect = {}) {
  validateExpect(expect);
  if (!entry?.response) return [{ assertion: 'response', outcome: 'unavailable', reason: entry?.errorCode || 'Response missing' }];
  const checks = [];
  if (expect.status !== undefined) checks.push({ assertion: 'status', outcome: (Array.isArray(expect.status) ? expect.status : [expect.status]).includes(entry.response.status) ? 'passed' : 'failed' });
  if (expect.maxDurationMs !== undefined) checks.push({ assertion: 'duration', outcome: entry.elapsedMs <= expect.maxDurationMs ? 'passed' : 'failed' });
  const headers = Object.fromEntries(Object.entries(entry.response.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
  for (const [header, matcher] of Object.entries(expect.headers || {})) checks.push(...matchValue(headers[header.toLowerCase()], matcher,
    { found: Object.hasOwn(headers, header.toLowerCase()), path: `header:${header.toLowerCase()}` }));
  for (const { path, ...matcher } of expect.json || []) {
    if (!Object.hasOwn(entry.response, 'body')) checks.push({ path, assertion: 'json', outcome: 'unavailable', reason: 'Structured response body unavailable' });
    else checks.push(...matchValue(atPointer(entry.response.body, path).value, matcher, { found: atPointer(entry.response.body, path).found, path }));
  }
  return checks.length ? checks : [{ assertion: 'configured', outcome: 'unavailable', reason: 'No assertions configured' }];
}
