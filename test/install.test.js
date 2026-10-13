import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { loadCatalog } from '../src/catalog.js';
import { main } from '../src/cli.js';
import { validateDocsDir, withRequiredAgents } from '../src/options.js';
import { hash } from '../src/plan.js';

const dirs = [];
after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

function project(files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'agent-kit-'));
  dirs.push(dir);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(dir, path, '..'), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  return dir;
}

const read = (dir, path) => readFileSync(join(dir, path), 'utf8');
const quiet = async (args) => {
  const log = console.log;
  console.log = () => {};
  try {
    await main(args);
  } finally {
    console.log = log;
  }
};

function allFiles(dir, rel = '') {
  return readdirSync(join(dir, rel), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? allFiles(dir, join(rel, e.name)) : [join(rel, e.name)],
  );
}

test('skill dependencies are read from the skill files', () => {
  const { skills } = loadCatalog();
  const requires = Object.fromEntries(skills.map((s) => [s.dir, s.requires]));
  assert.deepEqual(requires['qa-review'], ['qa']);
  assert.deepEqual(requires['security-scan'], ['security']);
  assert.deepEqual(requires.implement, ['implementer', 'qa', 'security']);
  assert.equal(requires['plan-epic'].length, 6);
});

test('choosing skills pulls in the agents they need', () => {
  const { agents, added } = withRequiredAgents([], ['qa-review'], loadCatalog());
  assert.deepEqual(agents, ['qa']);
  assert.deepEqual(added, ['qa']);
});

test('docs folder must stay inside the project', () => {
  assert.equal(validateDocsDir('docs/agents'), undefined);
  for (const bad of ['', '/abs', 'C:/x', '../out', '.claude/docs']) assert.ok(validateDocsDir(bad), bad);
});

test('quick install into an existing project merges and renames the docs folder', async () => {
  const dir = project({
    'README.md': '# Existing\n',
    'CLAUDE.md': '# My rules\n',
    '.gitignore': 'node_modules/\n',
    'package.json': '{"name":"@acme/shop","version":"2.3.1"}',
  });
  await quiet(['init', '--yes', '--docs-dir', 'handbook', '--cwd', dir]);

  for (const file of allFiles(dir)) assert.doesNotMatch(read(dir, file), /\{\{[A-Z_]+\}\}/, file);
  assert.match(read(dir, 'CLAUDE.md'), /^# My rules\n\n<!-- agent-kit:start -->\n## shop — agent entry point/);
  assert.match(read(dir, '.claude/agents/qa.md'), /handbook\/RELEASES\.md/);
  assert.doesNotMatch(read(dir, '.claude/agents/qa.md'), /\bdocs\//);
  assert.match(read(dir, 'handbook/RELEASES.md'), /\*\*2\.4\.0\*\*.*PRD-001-shop\.md/);
  assert.ok(existsSync(join(dir, 'handbook/architecture/SA-001-shop.md')));
  assert.match(read(dir, 'README.md'), /\[AGENT-WORKFLOW\.md\]/);
  assert.equal(read(dir, '.gitignore'), 'node_modules/\n.env*\n!.env.example\n');
});

test('custom install: skills only, import line into .claude/CLAUDE.md, guide in README', async () => {
  const dir = project({ '.claude/CLAUDE.md': '# Rules\n' });
  await quiet(['init', '--yes', '--agents', 'none', '--skills', 'qa-review', '--claude-md', 'import', '--guide', 'readme', '--name', 'Demo App', '--cwd', dir]);

  assert.deepEqual(readdirSync(join(dir, '.claude/agents')), ['qa.md']);
  assert.deepEqual(readdirSync(join(dir, '.claude/skills')), ['qa-review']);
  assert.match(read(dir, '.claude/CLAUDE.md'), /\n@\.\.\/docs\/AGENT-RULES\.md\n/);
  assert.match(read(dir, 'docs/AGENT-RULES.md'), /^# Demo App — agent entry point/);
  assert.match(read(dir, 'docs/AGENT-RULES.md'), /`\/qa-review STORY-xxx-nn` — see/);
  assert.match(read(dir, 'README.md'), /^# Demo App\n\n<!-- agent-kit:start -->\n## Agent workflow/);
  assert.ok(existsSync(join(dir, 'docs/prd/PRD-001-demo-app.md')));
  assert.ok(!existsSync(join(dir, 'AGENT-WORKFLOW.md')));
});

test('existing files are skipped unless --overwrite, which keeps a backup', async () => {
  const dir = project({ '.claude/agents/qa.md': 'my own qa\n' });
  await quiet(['init', '--yes', '--cwd', dir]);
  assert.equal(read(dir, '.claude/agents/qa.md'), 'my own qa\n');

  const dir2 = project({ '.claude/agents/qa.md': 'my own qa\n' });
  await quiet(['init', '--yes', '--overwrite', '--cwd', dir2]);
  assert.match(read(dir2, '.claude/agents/qa.md'), /You are QA/);
  assert.equal(read(dir2, '.claude/agents/qa.md.agent-kit.bak'), 'my own qa\n');
});

test('update refreshes untouched framework files, keeps edited ones and never touches project state', async () => {
  const dir = project();
  await quiet(['init', '--yes', '--cwd', dir]);
  writeFileSync(join(dir, '.claude/agents/tech-lead.md'), 'stale\n');
  const manifest = JSON.parse(read(dir, '.agent-kit.json'));
  manifest.files['.claude/agents/implementer.md'] = hash('older kit version\n');
  writeFileSync(join(dir, '.agent-kit.json'), JSON.stringify(manifest));
  writeFileSync(join(dir, '.claude/agents/implementer.md'), 'older kit version\n');
  writeFileSync(join(dir, 'docs/RELEASES.md'), 'my releases\n');

  await quiet(['update', '--cwd', dir]);
  assert.equal(read(dir, '.claude/agents/tech-lead.md'), 'stale\n');
  assert.match(read(dir, '.claude/agents/implementer.md'), /You are the Implementer/);
  assert.ok(!existsSync(join(dir, '.claude/agents/implementer.md.agent-kit.bak')));
  assert.equal(read(dir, 'docs/RELEASES.md'), 'my releases\n');

  await quiet(['update', '--force', '--cwd', dir]);
  assert.match(read(dir, '.claude/agents/tech-lead.md'), /You are the Tech Lead/);
  assert.equal(read(dir, '.claude/agents/tech-lead.md.agent-kit.bak'), 'stale\n');
  assert.equal(read(dir, 'docs/RELEASES.md'), 'my releases\n');
});

test('init refuses to run twice', async () => {
  const dir = project();
  await quiet(['init', '--yes', '--cwd', dir]);
  await assert.rejects(main(['init', '--yes', '--cwd', dir]), /already installed/);
});
