import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, posix } from 'node:path';
import { userInfo } from 'node:os';
import * as p from '@clack/prompts';

const CLAUDE_MD_MODES = ['block', 'import', 'skip'];
const GUIDE_MODES = ['file', 'readme', 'skip'];

export function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
}

function gitUserName(cwd) {
  try {
    return execFileSync('git', ['config', 'user.name'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

function nextMinor(version) {
  const m = /^(\d+)\.(\d+)\.\d+/.exec(version ?? '');
  if (!m || version.startsWith('0.0.0')) return '0.1.0';
  return `${m[1]}.${Number(m[2]) + 1}.0`;
}

export function detectDefaults(cwd) {
  const pkgPath = join(cwd, 'package.json');
  const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf8')) : {};
  const name = pkg.name?.replace(/^@[^/]+\//, '') || basename(cwd);
  const readme = readdirSync(cwd).find((f) => f.toLowerCase() === 'readme.md');
  const claudePath = !existsSync(join(cwd, 'CLAUDE.md')) && existsSync(join(cwd, '.claude/CLAUDE.md'))
    ? '.claude/CLAUDE.md'
    : 'CLAUDE.md';
  return {
    name,
    owner: gitUserName(cwd) || userInfo().username,
    version: nextMinor(pkg.version),
    theme: 'To be defined',
    readmePath: readme ?? 'README.md',
    claudePath,
  };
}

export function validateDocsDir(value) {
  const dir = posix.normalize((value ?? '').trim().replace(/\\/g, '/')).replace(/\/$/, '');
  if (!dir || dir === '.' || dir.startsWith('/') || /^[a-zA-Z]:/.test(dir)) return 'Use a relative folder inside the project, e.g. docs';
  if (dir.split('/').includes('..')) return 'The folder must stay inside the project';
  if (dir === '.claude' || dir.startsWith('.claude/')) return '.claude/ is reserved for agents and skills';
  return undefined;
}

function parseList(flag, value, known) {
  if (value === 'all') return [...known];
  if (value === 'none' || value === '') return [];
  const items = value.split(',').map((s) => s.trim()).filter(Boolean);
  const unknown = items.filter((i) => !known.includes(i));
  if (unknown.length) throw new Error(`--${flag}: unknown ${unknown.join(', ')} (choose from ${known.join(', ')})`);
  return items;
}

function oneOf(flag, value, allowed) {
  if (value !== undefined && !allowed.includes(value)) throw new Error(`--${flag} must be one of ${allowed.join(', ')}`);
  return value;
}

export function withRequiredAgents(agents, skills, catalog) {
  const needed = catalog.skills.filter((s) => skills.includes(s.dir)).flatMap((s) => s.requires);
  const added = [...new Set(needed)].filter((a) => !agents.includes(a));
  const ordered = catalog.agents.map((a) => a.name).filter((n) => agents.includes(n) || added.includes(n));
  return { agents: ordered, added };
}

function guard(value) {
  if (p.isCancel(value)) {
    p.cancel('Nothing installed.');
    process.exit(1);
  }
  return value;
}

// Flags pre-answer questions; quick mode (or no TTY) fills the rest with defaults, customize asks for them.
export async function collectInitOptions(flags, cwd, catalog, interactive) {
  const d = detectDefaults(cwd);
  const agentNames = catalog.agents.map((a) => a.name);
  const skillDirs = catalog.skills.map((s) => s.dir);
  const given = {
    docsDir: flags['docs-dir'],
    agents: flags.agents !== undefined ? parseList('agents', flags.agents, agentNames) : undefined,
    skills: flags.skills !== undefined ? parseList('skills', flags.skills, skillDirs) : undefined,
    claudeMd: oneOf('claude-md', flags['claude-md'], CLAUDE_MD_MODES),
    guide: oneOf('guide', flags.guide, GUIDE_MODES),
    name: flags.name,
    owner: flags.owner,
    version: flags['first-version'],
    theme: flags.theme,
  };
  if (given.docsDir !== undefined) {
    const problem = validateDocsDir(given.docsDir);
    if (problem) throw new Error(`--docs-dir: ${problem}`);
  }
  if (given.version !== undefined && !/^\d+\.\d+\.\d+$/.test(given.version)) {
    throw new Error('--first-version must look like x.y.z');
  }

  let customize = false;
  if (interactive) {
    customize = guard(await p.select({
      message: 'Install mode',
      options: [
        { value: false, label: 'Quick', hint: 'everything, default locations' },
        { value: true, label: 'Customize', hint: 'choose folder, agents, skills and where instructions go' },
      ],
    }));
  }
  const ask = async (key, prompt, fallback) => given[key] ?? (customize ? guard(await prompt()) : fallback);

  const docsDir = await ask('docsDir', () => p.text({
    message: 'Docs folder (created if missing, merged if it exists)',
    initialValue: 'docs',
    validate: validateDocsDir,
  }), 'docs');
  const pickedSkills = await ask('skills', () => p.multiselect({
    message: 'Skills (slash-command ceremonies)',
    options: catalog.skills.map((s) => ({ value: s.dir, label: s.usage, hint: s.summary })),
    initialValues: skillDirs,
    required: false,
  }), skillDirs);
  const pickedAgents = await ask('agents', () => p.multiselect({
    message: 'Agents (roles)',
    options: catalog.agents.map((a) => ({ value: a.name, label: a.name, hint: a.summary })),
    initialValues: agentNames,
    required: false,
  }), agentNames);
  const claudeMd = await ask('claudeMd', () => p.select({
    message: `Agent instructions in ${d.claudePath}`,
    options: [
      { value: 'block', label: 'Add a marked section', hint: 'created if missing; replaced cleanly on update' },
      { value: 'import', label: 'Add one import line', hint: `rules live in <docs>/AGENT-RULES.md` },
      { value: 'skip', label: 'Skip' },
    ],
  }), 'block');
  const guide = await ask('guide', () => p.select({
    message: 'Workflow guide for humans',
    options: [
      { value: 'file', label: 'Separate AGENT-WORKFLOW.md', hint: `plus a link section in ${d.readmePath}` },
      { value: 'readme', label: `Section in ${d.readmePath}` },
      { value: 'skip', label: 'Skip' },
    ],
  }), 'file');
  const name = await ask('name', () => p.text({ message: 'Project name', initialValue: d.name }), d.name);
  const owner = await ask('owner', () => p.text({ message: 'Owner', initialValue: d.owner }), d.owner);
  const version = await ask('version', () => p.text({
    message: 'First version planned with agent-kit',
    initialValue: d.version,
    validate: (v) => (/^\d+\.\d+\.\d+$/.test(v) ? undefined : 'Use x.y.z'),
  }), d.version);
  const theme = await ask('theme', () => p.text({ message: 'One-line theme of that version', initialValue: d.theme }), d.theme);

  const { agents, added } = withRequiredAgents(pickedAgents, pickedSkills, catalog);
  return {
    docsDir: posix.normalize(docsDir.trim().replace(/\\/g, '/')).replace(/\/$/, ''),
    agents,
    addedAgents: added,
    skills: pickedSkills,
    claudeMd,
    guide,
    claudePath: d.claudePath,
    readmePath: d.readmePath,
    values: {
      PROJECT_NAME: name,
      SLUG: slugify(name),
      OWNER: owner,
      FIRST_VERSION: version,
      FIRST_THEME: theme,
      DATE: new Date().toISOString().slice(0, 10),
    },
  };
}
