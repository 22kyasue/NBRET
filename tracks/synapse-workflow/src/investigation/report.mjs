import { replay, summarize } from './records.mjs';

// A renderer for local operator declarations. It never loads referenced artifacts.
const escape = value => String(value ?? '').replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '')
  .replace(/\\/g, '\\\\').replace(/([`*_{}\[\]()#+.!|>~-])/g, '\\$1').replace(/</g, '&lt;').replace(/&(?!(?:lt);)/g, '&amp;');
const text = value => escape(typeof value === 'string' ? value : JSON.stringify(value));
const paragraph = (label, value) => value === undefined ? '' : `**${label}:** ${text(value)}\n\n`;

export function projectInvestigation(snapshot) {
  const state = replay(snapshot.manifest, snapshot.events);
  const summary = summarize(state);
  return { schemaVersion: 1, kind: 'nbret-investigation-projection',
    investigationId: snapshot.manifest.id, revision: snapshot.revision, journalHead: snapshot.head,
    summary, limitations: [
      'Offline operator-supplied records only; no application was contacted by this workflow.',
      'Review support and declared reproduction are not independently authenticated effects.',
      'Distinct actor labels do not enforce session, account or answer-key isolation.',
      'Artifact digests are recorded references; this increment does not open or verify artifact files.',
      'This private package may contain sensitive free text; no automatic secret sanitization is claimed.',
      'No discovery-effectiveness, complete-coverage, production-readiness or repair-success claim follows.',
    ] };
}

export function renderInvestigation(snapshot) {
  const projection = projectInvestigation(snapshot), { summary } = projection;
  const lines = [`# Investigation record: ${text(snapshot.manifest.id)}\n`,
    paragraph('Target metadata', snapshot.manifest.target),
    paragraph('Mode', snapshot.manifest.mode),
    paragraph('Journal revision', snapshot.revision),
    paragraph('Journal head', snapshot.head),
    paragraph('Recorded status', summary.status),
    '**OFFLINE FOUNDATION — these are recorded declarations, not verified security findings.**\n\n'];
  const allLeads = new Map(snapshot.events.filter(e => e.type === 'lead.recorded').map(e => [e.payload.id, e.payload]));
  for (const [key, title] of [['reviewSupported', 'Review-supported leads'], ['needsAction', 'Needs owner action'],
    ['unconfirmed', 'Unconfirmed leads'], ['rejected', 'Rejected leads retained for audit']]) {
    lines.push(`## ${title}\n\n`);
    const items = summary[key] || [];
    if (!items.length) lines.push('None recorded in this category. This is not a clean assessment result.\n\n');
    for (const item of items) {
      const lead = typeof item === 'string' ? allLeads.get(item) : item;
      lines.push(`### ${text(lead.id)}: ${text(lead.title)}\n\n`);
      for (const [label, field] of [['Question','question'], ['Declared environment','environment'], ['Declared identity','identity'],
        ['Reported observation','observed'], ['Possible consequences, not demonstrated by this record','possibleConsequences'], ['Limitations','limitations']]) {
        lines.push(paragraph(label, lead[field]));
      }
      const history = snapshot.events.filter(e => ['review.recorded','verification.recorded'].includes(e.type) && e.payload.leadId === lead.id);
      for (const event of history) {
        lines.push(`#### ${event.type === 'review.recorded' ? 'Recorded review' : 'Recorded owner verification'}\n\n`);
        lines.push(paragraph('Actor / time', `${event.actor.id} (${event.actor.role}) / ${event.at}`));
        for (const [key, value] of Object.entries(event.payload)) if (key !== 'leadId') lines.push(paragraph(text(key), value));
      }
    }
  }
  lines.push('## Pending owner requests\n\n');
  const requests = summary.pendingRequests || [];
  if (!requests.length) lines.push('No pending requests recorded.\n\n');
  for (const request of requests) lines.push(paragraph('Request', request));
  lines.push('## Recorded work and stop reason\n\n');
  for (const record of summary.progress || []) lines.push(paragraph('Progress declaration', record));
  if (summary.stopped) lines.push(paragraph('Stop declaration', summary.stopped));
  lines.push('## Complete event history\n\n');
  for (const event of snapshot.events) {
    lines.push(`- ${text(event.id)} · ${text(event.at)} · ${text(event.actor.id)} · ${text(event.type)}\n`);
  }
  lines.push('\n## Limits and remaining work\n\n');
  for (const limit of [...projection.limitations, ...(snapshot.manifest.limitations || []), ...(summary.limitations || [])]) lines.push(`- ${text(limit)}\n`);
  return { markdown: lines.join(''), projection };
}
