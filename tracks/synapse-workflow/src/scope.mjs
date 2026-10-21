/** Exact-origin scope shared by discovery, probes and scanner adapters. */
export function createScope(origins) {
  if (!Array.isArray(origins) || !origins.length) throw new Error('Explicit origins required');
  const allowed = new Set(origins.map(value => {
    const u = new URL(value);
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password ||
        u.pathname !== '/' || u.search || u.hash) throw new Error('Scope entries must be HTTP(S) origins without credentials, paths or queries');
    return u.origin;
  }));
  return {
    origins: [...allowed],
    allows(value) {
      try { const u = new URL(value); return !u.username && !u.password && allowed.has(u.origin); }
      catch { return false; }
    },
    require(value) {
      if (!this.allows(value)) throw new Error('URL outside explicit origin scope');
      return new URL(value).href;
    },
  };
}
