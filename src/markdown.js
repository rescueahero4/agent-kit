const START = '<!-- agent-kit:start -->';
const END = '<!-- agent-kit:end -->';

export function render(text, values) {
  return text.replace(/\{\{([A-Z_]+)\}\}/g, (token, key) => {
    if (!(key in values)) throw new Error(`Unknown template token ${token}`);
    return values[key];
  });
}

export function demoteHeadings(text) {
  let inFence = false;
  return text
    .split('\n')
    .map((line) => {
      if (/^(```|~~~)/.test(line)) inFence = !inFence;
      return !inFence && /^#{1,5} /.test(line) ? `#${line}` : line;
    })
    .join('\n');
}

export function wrapBlock(body) {
  return `${START}\n${body.trim()}\n${END}`;
}

export function upsertBlock(existing, body) {
  const eol = existing.includes('\r\n') ? '\r\n' : '\n';
  const text = existing.replace(/\r\n/g, '\n');
  const block = wrapBlock(body);
  const start = text.indexOf(START);
  const end = text.indexOf(END);
  let next;
  if (start === -1 && end === -1) {
    next = text.trim() ? `${text.trimEnd()}\n\n${block}\n` : `${block}\n`;
  } else if (start !== -1 && end > start && text.indexOf(START, start + 1) === -1) {
    next = text.slice(0, start) + block + text.slice(end + END.length);
  } else {
    throw new Error('unbalanced agent-kit markers');
  }
  return next.replace(/\n/g, eol);
}

export function appendMissingLines(existing, lines) {
  const eol = existing.includes('\r\n') ? '\r\n' : '\n';
  const present = new Set(existing.split(/\r?\n/).map((l) => l.trim()));
  const missing = lines.filter((l) => !present.has(l));
  if (!missing.length) return existing;
  const base = existing && !existing.endsWith('\n') ? existing + eol : existing;
  return base + missing.join(eol) + eol;
}

export function fillDocHeader(text, replacements) {
  const cut = text.indexOf('\n## ');
  const head = cut === -1 ? text : text.slice(0, cut);
  const filled = replacements.reduce((h, [from, to]) => h.split(from).join(to), head);
  return filled + text.slice(head.length);
}
