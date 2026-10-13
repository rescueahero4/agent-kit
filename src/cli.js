import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import * as p from '@clack/prompts';
import { loadCatalog } from './catalog.js';
import { collectInitOptions } from './options.js';
import { desiredOutputs } from './outputs.js';
import { applyPlan, planInit, planUpdate, recordedHashes } from './plan.js';

export const MANIFEST = '.agent-kit.json';
const KIT_VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

const HELP = `agent-kit ${KIT_VERSION} — install a document-driven Claude Code workflow into a project

Usage
  npx agent-kit [init] [options]   install (interactive unless --yes or no terminal)
  npx agent-kit update [options]   refresh agents, skills, templates and instruction blocks

Init options
  -y, --yes                 quick install with defaults, no questions
  --docs-dir <path>         docs folder, relative to the project (default: docs)
  --agents <all|none|a,b>   agents to install (default: all)
  --skills <all|none|a,b>   skills to install; their required agents are added (default: all)
  --claude-md <block|import|skip>   how to add instructions to CLAUDE.md (default: block)
  --guide <file|readme|skip>        AGENT-WORKFLOW.md + README link, README section, or nothing (default: file)
  --name, --owner, --first-version, --theme   project values (default: detected)
  --overwrite               replace existing files, keeping a .agent-kit.bak copy (default: skip them)

Update options
  --force                   also replace files you edited, keeping a .agent-kit.bak copy

Common
  --dry-run                 show the plan, write nothing
  --cwd <dir>               project folder (default: current folder)
  -h, --help · -v, --version`;

const LABELS = {
  create: 'Create',
  update: 'Update',
  overwrite: 'Replace (backup kept)',
  skip: 'Skip',
};

function summarize(ops) {
  const lines = [];
  for (const status of Object.keys(LABELS)) {
    const group = ops.filter((op) => op.status === status);
    if (!group.length) continue;
    lines.push(`${LABELS[status]} (${group.length})`);
    for (const op of group) lines.push(`  ${op.path}${op.reason ? `  — ${op.reason}` : ''}`);
  }
  const unchanged = ops.filter((op) => op.status === 'same').length;
  if (unchanged) lines.push(`Unchanged: ${unchanged}`);
  return lines.join('\n') || 'Nothing to do.';
}

const writes = (ops) => ops.some((op) => ['create', 'update', 'overwrite'].includes(op.status));

async function confirmOrStop(interactive, ops, message) {
  if (!interactive || !writes(ops)) return;
  const ok = await p.confirm({ message });
  if (p.isCancel(ok) || !ok) {
    p.cancel('Nothing written.');
    process.exit(1);
  }
}

function writeManifest(cwd, opts, files) {
  const { addedAgents, ...kept } = opts;
  writeFileSync(join(cwd, MANIFEST), `${JSON.stringify({ kit: KIT_VERSION, ...kept, files }, null, 2)}\n`);
}

async function init(flags, cwd, interactive) {
  if (existsSync(join(cwd, MANIFEST))) {
    throw new Error(`agent-kit is already installed here (${MANIFEST}). Run \`npx agent-kit update\` instead.`);
  }
  const catalog = loadCatalog();
  if (interactive) p.intro(`agent-kit ${KIT_VERSION}`);
  const opts = await collectInitOptions(flags, cwd, catalog, interactive);
  if (opts.addedAgents.length) console.log(`Adding agents the chosen skills need: ${opts.addedAgents.join(', ')}`);

  let ops = planInit(desiredOutputs(opts, catalog), cwd, { overwrite: flags.overwrite });
  const existing = ops.filter((op) => op.reason === 'already exists');
  if (interactive && existing.length && !flags.overwrite) {
    const replace = await p.select({
      message: `${existing.length} file(s) already exist with different content`,
      options: [
        { value: false, label: 'Keep mine', hint: 'skip them' },
        { value: true, label: 'Replace them', hint: 'a .agent-kit.bak copy is kept' },
      ],
    });
    if (p.isCancel(replace)) process.exit(1);
    if (replace) ops = planInit(desiredOutputs(opts, catalog), cwd, { overwrite: true });
  }

  console.log(`\nProject: ${opts.values.PROJECT_NAME} · owner ${opts.values.OWNER} · first version ${opts.values.FIRST_VERSION} · docs in ${opts.docsDir}/\n`);
  console.log(summarize(ops));
  if (flags['dry-run']) return console.log('\nDry run: nothing written.');
  await confirmOrStop(interactive, ops, 'Install?');

  applyPlan(ops, cwd);
  writeManifest(cwd, opts, recordedHashes(ops));
  const next = opts.skills.includes('bootstrap-project')
    ? 'Open Claude Code here and run /bootstrap-project.'
    : `Fill ${opts.docsDir}/architecture/SA-001-${opts.values.SLUG}.md and ${opts.docsDir}/prd/PRD-001-${opts.values.SLUG}.md, then plan EPIC-001.`;
  const done = `Installed. Choices are recorded in ${MANIFEST}; commit it. Next: ${next}`;
  if (interactive) p.outro(done);
  else console.log(`\n${done}`);
}

async function update(flags, cwd, interactive) {
  const path = join(cwd, MANIFEST);
  if (!existsSync(path)) throw new Error(`No ${MANIFEST} here. Run \`npx agent-kit init\` first.`);
  const { kit, files, ...opts } = JSON.parse(readFileSync(path, 'utf8'));
  const catalog = loadCatalog();
  const ops = planUpdate(desiredOutputs(opts, catalog), cwd, files, { force: flags.force });

  console.log(`agent-kit ${kit} → ${KIT_VERSION}\n`);
  console.log(summarize(ops));
  const edited = ops.filter((op) => op.reason === 'edited by you');
  if (edited.length) console.log('\nEdited files were kept. Re-run with --force to replace them (a .agent-kit.bak copy is kept).');
  if (flags['dry-run']) return console.log('\nDry run: nothing written.');
  await confirmOrStop(interactive, ops, 'Apply update?');

  applyPlan(ops, cwd);
  writeManifest(cwd, opts, recordedHashes(ops, files));
  console.log(writes(ops) ? '\nUpdated.' : '\nAlready up to date.');
}

export async function main(argv) {
  const { values: flags, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      yes: { type: 'boolean', short: 'y' },
      'docs-dir': { type: 'string' },
      agents: { type: 'string' },
      skills: { type: 'string' },
      'claude-md': { type: 'string' },
      guide: { type: 'string' },
      name: { type: 'string' },
      owner: { type: 'string' },
      'first-version': { type: 'string' },
      theme: { type: 'string' },
      overwrite: { type: 'boolean' },
      force: { type: 'boolean' },
      'dry-run': { type: 'boolean' },
      cwd: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });
  if (flags.help) return console.log(HELP);
  if (flags.version) return console.log(KIT_VERSION);

  const cwd = resolve(flags.cwd ?? process.cwd());
  const interactive = !flags.yes && process.stdin.isTTY && process.stdout.isTTY;
  const command = positionals[0] ?? 'init';
  if (command === 'init') return init(flags, cwd, interactive);
  if (command === 'update') return update(flags, cwd, interactive);
  throw new Error(`Unknown command "${command}". Run agent-kit --help.`);
}
