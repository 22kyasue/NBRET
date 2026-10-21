// Shared, read-only helpers for the research register: loading, validation and retrieval.
// Nothing here imports, executes or fetches research artifacts.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, '../../..');
export const researchRoot = path.join(repoRoot, 'docs', 'research');
export const registerDir = path.join(here, 'register');

export const DOMAINS = {
  'service-delivery': 'Service delivery: scoping, engagement process, deliverables, retest',
  commercial: 'Commercial: pricing, effort, staffing, buyer evidence',
  standards: 'Standards and procurement frameworks',
  providers: 'Security providers: services, contracts, AI claims, SLAs',
  'ai-evaluation': 'Evaluating AI contributions: oracles, benchmarks, scoring',
  'agent-runtime': 'AI agent runtimes and SDKs: permissions, sandboxing, budgets, memory',
  authorization: 'Authorization testing and policy engines',
  scanners: 'Scanners: ZAP, Nuclei and the NBRET adapter',
  'evidence-handling': 'Evidence capture, attribution, integrity and confidentiality',
  reporting: 'Reports, report formats and finding state',
  cloud: 'Cloud configuration auditing and cloud SDK behavior',
  'network-discovery': 'Network discovery: Nmap, DNS, packets, connectivity',
  'identity-ad': 'Directory and identity analysis: AD, LDAP, BloodHound, Impacket',
  'interception-proxy': 'Interception proxies: mitmproxy, TLS, HTTP/2, HAR',
  'workers-queues': 'Workers and queues: admission, leases, cancellation, effects',
  'crawling-load': 'Crawlers and load limits against client systems',
  'defensive-response': 'Defensive response: EDR/MDR actions, approval, containment',
  safety: 'Safety boundaries and stopped work',
};
export const STRENGTHS = ['integrated-lab', 'component-lab', 'source-trace', 'public-doc', 'vendor-claim', 'synthesis'];
export const STAGES = ['scoping', 'authorization', 'discovery', 'testing', 'evidence', 'triage', 'reporting', 'remediation', 'retest', 'operations', 'ai-evaluation', 'commercial'];
export const CORRECTION_KINDS = ['reversed', 'narrowed', 'confirmed-later', 'status-outdated', 'superseded-plan'];
export const RISKS = ['high', 'medium', 'low'];

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
export function loadRegister() {
  const load = name => {
    const file = path.join(registerDir, `${name}.json`);
    return fs.existsSync(file) ? readJson(file)[name] : [];
  };
  return { findings: load('findings'), corrections: load('corrections'), hazards: load('hazards') };
}

const lineCache = new Map();
export function fileLines(rel) {
  if (!lineCache.has(rel)) {
    const abs = path.join(repoRoot, rel);
    lineCache.set(rel, fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8').split(/\r?\n/) : null);
  }
  return lineCache.get(rel);
}

// Quotes are compared after collapsing whitespace and Markdown emphasis. The quote must sit on the
// cited line; a quote that wraps onto the next line is accepted when it starts on the cited line.
const squash = s => s.replace(/[*`_]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
export function locateQuote(rel, line, quote) {
  const lines = fileLines(rel);
  if (!lines) return { ok: false, reason: 'missing file' };
  const want = squash(quote);
  if (want.length < 8) return { ok: false, reason: 'quote too short' };
  const at = i => squash(lines[i] || '');
  if (at(line - 1).includes(want)) return { ok: true, line };
  const joined = squash(`${lines[line - 1] || ''} ${lines[line] || ''}`);
  if (joined.includes(want) && !at(line).includes(want)) return { ok: true, line };
  const found = lines.findIndex(l => squash(l).includes(want));
  return found >= 0 ? { ok: false, reason: `quote is on line ${found + 1}, not ${line}`, actual: found + 1 } : { ok: false, reason: 'quote not found in file' };
}

export function walkMarkdown(dir = researchRoot) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return p === here ? [] : walkMarkdown(p);
    return e.name.endsWith('.md') ? [p] : [];
  });
}
export const rel = abs => path.relative(repoRoot, abs).replaceAll('\\', '/');

// ---------- Retrieval ----------

const STOP = new Set('a an the and or of to in on for with by from at as is are was were be been being it its this that these those what which who whom how why when where does do did can could should would will shall may might must our we us you your they them their there here have has had not no yes if then than so such into about over under any all some each per via vs i me my one two also just like got make use used using out up down more most less very'.split(' '));

// Domain vocabulary bridges between practitioner wording and study wording.
const SYNONYMS = [
  ['price', 'pricing', 'cost', 'fee', 'quote', 'budget', 'yen', 'dollar', 'credits', 'commercial'],
  ['effort', 'hours', 'days', 'person-days', 'engineer-weeks', 'duration', 'turnaround', 'staffing', 'testers'],
  ['pentest', 'penetration', 'assessment', 'engagement', 'ptaas'],
  ['scope', 'allowlist', 'boundary', 'out-of-scope', 'excluded', 'in-scope', 'egress', 'offsite'],
  ['finished', 'completed', 'completion', 'terminal', 'done', 'stop', 'stopped', 'cancel', 'cancellation', 'abort'],
  ['leak', 'redact', 'redaction', 'mask', 'masking', 'secret', 'credential', 'cookie', 'token', 'confidentiality', 'sensitive'],
  ['retry', 'retries', 'resend', 'replay', 'repeat', 'duplicate', 'idempotent', 'idempotency'],
  ['tenant', 'principal', 'identity', 'user', 'account', 'role', 'session'],
  ['authorization', 'authz', 'permission', 'access', 'allow', 'deny', 'denied', 'policy', 'idor', 'bola'],
  ['cache', 'cached', 'caching', 'stale', 'reuse', 'saved', 'offline'],
  ['fix', 'remediation', 'repair', 'patch', 'retest', 'verify', 'verification'],
  ['report', 'deliverable', 'sarif', 'findings', 'output', 'export'],
  ['ai', 'llm', 'model', 'agent', 'gpt', 'autonomous', 'copilot', 'gemini'],
  ['benchmark', 'evaluation', 'eval', 'score', 'scorer', 'oracle', 'grader', 'accuracy', 'precision'],
  ['sandbox', 'container', 'sudo', 'isolation', 'privilege'],
  ['rate', 'throttle', 'limit', 'limiter', 'load', 'concurrency', 'production', 'outage'],
  ['queue', 'worker', 'job', 'lease', 'bullmq', 'scheduler'],
  ['crawler', 'crawl', 'spider', 'scrapy'],
  ['isolate', 'isolation', 'containment', 'contain', 'response', 'edr', 'mdr', 'soc'],
  ['approval', 'approve', 'consent', 'preauthorization', 'mandate'],
  ['sla', 'response-time', 'minutes', 'clock'],
  ['japan', 'japanese', 'domestic', 'residency', 'gmo', 'lac', 'nri', 'ierae'],
  ['cloud', 'aws', 's3', 'bucket', 'prowler', 'azure', 'gcp'],
  ['port', 'nmap', 'filtered', 'closed', 'discovery', 'host'],
  ['active-directory', 'ad', 'ldap', 'bloodhound', 'kerberos', 'impacket'],
  ['proxy', 'mitmproxy', 'intercept', 'interception', 'har', 'tls'],
  ['standard', 'standards', 'wstg', 'asvs', 'owasp', 'nist', 'tiber', 'dora', 'att&ck', 'attack'],
  ['clean', 'empty', 'nothing', 'no-findings', 'pass', 'false-negative'],
  ['read-only', 'readonly', 'non-mutating', 'mutating', 'mutation', 'state-changing', 'side-effect', 'side-effects', 'safe', 'unsafe'],
  ['get', 'post', 'put', 'patch', 'verb', 'method', 'http'],
  ['delete', 'deletion', 'cleanup', 'rollback', 'recovery', 'revoke', 'revocation'],
];
const SYN = new Map();
for (const group of SYNONYMS) for (const w of group) SYN.set(w, [...new Set([...(SYN.get(w) || []), ...group])]);

// Japanese practitioner terms mapped to corpus vocabulary.
const JA = {
  '価格': 'price pricing cost', '料金': 'price pricing fee', '費用': 'cost price', '見積': 'quote price effort',
  '工数': 'effort person-days hours', '人日': 'person-days effort', '期間': 'duration days',
  '診断': 'assessment pentest', '脆弱性': 'vulnerability', 'ペネトレーション': 'penetration pentest', 'ペンテスト': 'pentest',
  '報告書': 'report deliverable', 'レポート': 'report', '再診断': 'retest', '修正': 'fix remediation',
  '権限': 'authorization permission', '認可': 'authorization', '認証': 'authentication', 'テナント': 'tenant',
  'スキャナ': 'scanner', 'スキャン': 'scan scanner', '範囲': 'scope', 'スコープ': 'scope', '対象外': 'excluded out-of-scope',
  '国内': 'japan domestic', '日本': 'japan japanese', 'データ': 'data', '保存': 'retention storage', '保持': 'retention',
  '承認': 'approval', '隔離': 'isolation containment', '封じ込め': 'containment', '対応': 'response',
  '生成ai': 'ai llm', 'ai': 'ai', 'エージェント': 'agent', '評価': 'evaluation', '精度': 'accuracy precision',
  '資格情報': 'credential', '秘密': 'secret', '漏洩': 'leak', 'クッキー': 'cookie', '停止': 'stop cancellation',
  '完了': 'completed completion', '再送': 'retry resend', 'キャッシュ': 'cache', '負荷': 'load rate', '本番': 'production',
  '標準': 'standard', 'ガイドライン': 'standard guideline', 'クラウド': 'cloud', '監視': 'monitoring soc',
};

const stem = w => w.length > 4 ? w.replace(/(ations?|ings?|ies|edly|ed|es|s)$/u, m => (m === 'ies' ? 'y' : '')) : w;
export function tokenize(text) {
  const lower = text.toLowerCase();
  const out = [];
  for (const m of lower.matchAll(/[a-z0-9][a-z0-9&._-]*[a-z0-9]|[a-z0-9]/g)) {
    for (const part of [m[0], ...m[0].split(/[._-]/)]) {
      if (part.length < 2 && part !== 'ai') continue;
      if (STOP.has(part) || /^\d{1,2}$/.test(part)) continue;
      out.push(stem(part));
    }
  }
  return out;
}

export function expandQuery(query) {
  let text = query;
  const lower = query.toLowerCase();
  for (const [ja, en] of Object.entries(JA)) if (lower.includes(ja)) text += ' ' + en;
  const base = [...new Set(tokenize(text))];
  const weights = new Map(base.map(t => [t, 1]));
  for (const raw of text.toLowerCase().match(/[a-z0-9&-]+/g) || []) {
    for (const s of SYN.get(raw) || SYN.get(stem(raw)) || []) {
      for (const t of tokenize(s)) if (!weights.has(t)) weights.set(t, 0.35);
    }
  }
  return weights;
}

class Bm25 {
  constructor(docs, { k1 = 1.2, b = 0.75 } = {}) {
    this.docs = docs; this.k1 = k1; this.b = b;
    this.df = new Map();
    let total = 0;
    for (const d of docs) {
      d.tf = new Map();
      for (const t of d.tokens) d.tf.set(t, (d.tf.get(t) || 0) + 1);
      for (const t of d.tf.keys()) this.df.set(t, (this.df.get(t) || 0) + 1);
      total += d.tokens.length;
    }
    this.avg = total / Math.max(1, docs.length);
  }
  idf(t) { const n = this.docs.length, df = this.df.get(t) || 0; return Math.log(1 + (n - df + 0.5) / (df + 0.5)); }
  score(d, weights) {
    let s = 0, matched = 0;
    for (const [t, w] of weights) {
      const f = d.tf.get(t);
      if (!f) continue;
      if (w === 1) matched++;
      s += w * this.idf(t) * (f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + this.b * d.tokens.length / this.avg));
    }
    return { s, matched };
  }
}

// Section chunks: heading-delimited, then windowed so that no chunk dwarfs the others.
export function chunkCorpus() {
  const chunks = [];
  for (const abs of walkMarkdown()) {
    const r = rel(abs);
    const lines = fileLines(r);
    let heading = '', start = 0;
    const flush = end => {
      for (let s = start; s < end; s += 40) {
        const e = Math.min(end, s + 60);
        const text = lines.slice(s, e).join('\n');
        if (text.trim()) chunks.push({ kind: 'passage', path: r, start: s + 1, end: e, heading, text, tokens: tokenize(`${heading} ${heading} ${text}`) });
        if (e === end) break;
      }
    };
    for (let i = 0; i < lines.length; i++) {
      if (/^#{1,6} /.test(lines[i])) { if (i > start) flush(i); start = i; heading = lines[i].replace(/^#+\s*/, ''); }
    }
    flush(lines.length);
  }
  return chunks;
}

export function buildIndex() {
  const reg = loadRegister();
  const cards = [
    ...reg.findings.map(f => ({ kind: 'finding', item: f, tokens: tokenize([f.title, f.title, f.claim, f.implication, f.limits, ...(f.questions || []), ...(f.questions || []), ...(f.terms || []), ...(f.terms || []), f.domain].join(' ')) })),
    ...reg.corrections.map(c => ({ kind: 'correction', item: c, tokens: tokenize([c.earlier.says, c.later.says, c.guidance, c.id.replaceAll('.', ' ')].join(' ')) })),
    ...reg.hazards.map(h => ({ kind: 'hazard', item: h, tokens: tokenize([h.hazard, h.guidance, h.quote, h.path].join(' ')) })),
  ];
  const passages = chunkCorpus();
  return { reg, cards: new Bm25(cards), passages: new Bm25(passages) };
}

// Corrections whose earlier passage sits inside a returned passage are attached to it.
function correctionsFor(reg, p) {
  return reg.corrections.filter(c => c.earlier.path === p.path && c.earlier.line >= p.start - 5 && c.earlier.line <= p.end + 5);
}
function hazardsFor(reg, p) {
  return reg.hazards.filter(h => h.path === p.path && h.line >= p.start - 5 && h.line <= p.end + 5);
}

export function search(index, query, { cards: nCards = 5, passages: nPassages = 6 } = {}) {
  const weights = expandQuery(query);
  if (![...weights.values()].some(w => w === 1)) return null;
  const core = [...weights.values()].filter(w => w === 1).length;
  const rank = (bm, docs) => docs.map(d => {
    const { s, matched } = bm.score(d, weights);
    return { d, s: s * (0.5 + 0.5 * matched / core) };
  }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  const cardHits = rank(index.cards, index.cards.docs);
  const findings = cardHits.filter(x => x.d.kind === 'finding').slice(0, nCards);
  const top = cardHits[0]?.s || 1;
  // Corrections and hazards only when they rank close to the best card, so unrelated ones stay out.
  const corrections = cardHits.filter(x => x.d.kind === 'correction' && x.s > top * 0.6).slice(0, 3);
  const hazards = cardHits.filter(x => x.d.kind === 'hazard' && x.s > top * 0.5).slice(0, 2);
  // At most two passages per file so one long study cannot crowd out the rest.
  const perFile = new Map(), passages = [];
  for (const x of rank(index.passages, index.passages.docs)) {
    const n = perFile.get(x.d.path) || 0;
    if (n >= 2) continue;
    perFile.set(x.d.path, n + 1);
    passages.push(x);
    if (passages.length >= nPassages) break;
  }
  return {
    findings: findings.map(x => ({ score: +x.s.toFixed(2), ...x.d.item })),
    corrections: corrections.map(x => ({ score: +x.s.toFixed(2), ...x.d.item })),
    hazards: hazards.map(x => x.d.item),
    passages: passages.map(x => ({
      score: +x.s.toFixed(2), path: x.d.path, lines: [x.d.start, x.d.end], heading: x.d.heading,
      excerpt: bestExcerpt(x.d.text, weights),
      corrections: correctionsFor(index.reg, x.d).map(c => ({ id: c.id, risk: c.risk, guidance: c.guidance, later: `${c.later.path}:${c.later.line}` })),
      hazards: hazardsFor(index.reg, x.d).map(h => ({ id: h.id, guidance: h.guidance })),
    })),
  };
}

function bestExcerpt(text, weights) {
  const lines = text.split('\n');
  let best = 0, bestScore = -1;
  lines.forEach((l, i) => {
    const toks = new Set(tokenize(l));
    let s = 0; for (const [t, w] of weights) if (toks.has(t)) s += w;
    if (s > bestScore) { bestScore = s; best = i; }
  });
  return lines.slice(best, best + 2).join(' ').replace(/\s+/g, ' ').slice(0, 420);
}
