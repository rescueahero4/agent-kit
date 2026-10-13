import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { appendMissingLines, upsertBlock } from './markdown.js';

export const BACKUP_SUFFIX = '.agent-kit.bak';

export function hash(content) {
  return createHash('sha256').update(content.replace(/\r\n/g, '\n')).digest('hex');
}

function read(cwd, path) {
  const full = join(cwd, path);
  return existsSync(full) ? readFileSync(full, 'utf8') : null;
}

const same = (a, b) => a.replace(/\r\n/g, '\n') === b.replace(/\r\n/g, '\n');

function planEdit(output, current) {
  if (output.type === 'lines') {
    const next = appendMissingLines(current ?? '', output.lines);
    if (current === null) return { status: 'create', content: next };
    return next === current ? { status: 'same' } : { status: 'update', content: next };
  }
  if (current === null) return { status: 'create', content: output.createAs };
  try {
    const next = upsertBlock(current, output.body);
    return next === current ? { status: 'same' } : { status: 'update', content: next };
  } catch (err) {
    return { status: 'skip', reason: err.message };
  }
}

// Statuses: create · update (safe in-place write) · overwrite (backup first) · same · skip (with reason)
export function planInit(outputs, cwd, { overwrite }) {
  return outputs.map((output) => {
    const current = read(cwd, output.path);
    if (output.type !== 'file') return { ...output, ...planEdit(output, current) };
    if (current === null) return { ...output, status: 'create' };
    if (same(current, output.content)) return { ...output, status: 'same' };
    return overwrite ? { ...output, status: 'overwrite' } : { ...output, status: 'skip', reason: 'already exists' };
  });
}

export function planUpdate(outputs, cwd, recorded, { force }) {
  return outputs
    .filter((output) => output.kind !== 'seed')
    .map((output) => {
      const current = read(cwd, output.path);
      if (output.type !== 'file') return { ...output, ...planEdit(output, current) };
      const known = recorded[output.path];
      if (current === null) {
        return known ? { ...output, status: 'skip', reason: 'removed by you' } : { ...output, status: 'create' };
      }
      if (same(current, output.content)) return { ...output, status: 'same' };
      if (known && hash(current) === known) return { ...output, status: 'update' };
      if (force) return { ...output, status: 'overwrite' };
      return { ...output, status: 'skip', reason: known ? 'edited by you' : 'not installed by agent-kit' };
    });
}

function backupPath(full) {
  let candidate = full + BACKUP_SUFFIX;
  for (let n = 1; existsSync(candidate); n++) candidate = `${full}${BACKUP_SUFFIX}.${n}`;
  return candidate;
}

export function applyPlan(ops, cwd) {
  for (const op of ops) {
    if (!['create', 'update', 'overwrite'].includes(op.status)) continue;
    const full = join(cwd, op.path);
    mkdirSync(dirname(full), { recursive: true });
    if (op.status === 'overwrite') writeFileSync(backupPath(full), readFileSync(full));
    writeFileSync(full, op.content);
  }
}

// Hashes of the framework files agent-kit now owns, so `update` can tell untouched files from edited ones.
export function recordedHashes(ops, previous = {}) {
  const files = { ...previous };
  for (const op of ops) {
    if (op.type !== 'file' || op.kind !== 'framework') continue;
    if (['create', 'update', 'overwrite', 'same'].includes(op.status)) files[op.path] = hash(op.content);
  }
  return files;
}
