import { posix } from 'node:path';
import { listTemplateFiles, readTemplate } from './catalog.js';
import { demoteHeadings, fillDocHeader, render, wrapBlock } from './markdown.js';

const SEEDED_DOCS = new Set(['RELEASES.md', 'completion-report/LEARNINGS.md']);
export const GITIGNORE_LINES = ['.env*', '!.env.example'];
export const GUIDE_FILE = 'AGENT-WORKFLOW.md';
export const RULES_FILE = 'AGENT-RULES.md';

function ceremoniesLine(skills) {
  const listed = skills.filter((s) => s.dir !== 'bootstrap-project');
  return listed.length
    ? listed.map((s) => `\`${s.usage}\``).join(' · ')
    : 'No ceremony skills installed; run the steps by hand';
}

// Every file, block and line set the chosen options produce. `framework` files are refreshed by
// `update`; `seed` files are project state, written once and never touched again.
export function desiredOutputs(opts, catalog) {
  const skills = catalog.skills.filter((s) => opts.skills.includes(s.dir));
  const agents = catalog.agents.filter((a) => opts.agents.includes(a.name));
  const values = {
    ...opts.values,
    DOCS_DIR: opts.docsDir,
    CEREMONIES: ceremoniesLine(skills),
    AGENTS: agents.length ? agents.map((a) => `\`${a.name}\``).join(' · ') : 'none installed',
  };
  const out = [];
  const file = (path, source, kind, content = render(readTemplate(source), values)) =>
    out.push({ type: 'file', path, kind, content });
  const block = (path, body, createAs) => out.push({ type: 'block', path, body, createAs });

  for (const a of agents) file(`.claude/${a.file.slice('claude/'.length)}`, a.file, 'framework');
  for (const s of skills) {
    for (const src of listTemplateFiles(`claude/skills/${s.dir}`)) {
      file(`.claude/${src.slice('claude/'.length)}`, src, 'framework');
    }
  }

  for (const src of listTemplateFiles('docs')) {
    const rel = src.slice('docs/'.length);
    const seeded = SEEDED_DOCS.has(rel) || rel.endsWith('.gitkeep');
    file(posix.join(opts.docsDir, rel), src, seeded ? 'seed' : 'framework');
  }
  const { SLUG, FIRST_VERSION, DATE, PROJECT_NAME } = values;
  const header = [
    ['PRD-xxx-name.md', `PRD-001-${SLUG}.md`],
    ['SA-xxx-name.md', `SA-001-${SLUG}.md`],
    ['PRD-xxx', 'PRD-001'],
    ['SA-xxx', 'SA-001'],
    ['x.y.z', FIRST_VERSION],
    ['YYYY-MM-DD', DATE],
    ['<Product>', PROJECT_NAME],
  ];
  for (const [kind, dir] of [['PRD', 'prd'], ['SA', 'architecture']]) {
    const content = fillDocHeader(render(readTemplate(`docs/templates/${kind}.md`), values), header);
    file(posix.join(opts.docsDir, dir, `${kind}-001-${SLUG}.md`), null, 'seed', content);
  }

  const rules = render(readTemplate('CLAUDE.md'), values);
  if (opts.claudeMd === 'block') {
    block(opts.claudePath, demoteHeadings(rules), `${wrapBlock(rules)}\n`);
  } else if (opts.claudeMd === 'import') {
    const rulesPath = posix.join(opts.docsDir, RULES_FILE);
    file(rulesPath, null, 'framework', rules);
    const importPath = posix.relative(posix.dirname(opts.claudePath), rulesPath);
    const body = `## Agent workflow\n\n@${importPath}`;
    block(opts.claudePath, body, `# ${PROJECT_NAME}\n\n${wrapBlock(body)}\n`);
  }

  const guide = render(readTemplate(GUIDE_FILE), values);
  if (opts.guide === 'file') {
    file(GUIDE_FILE, null, 'framework', guide);
    const body = `## Agent workflow\n\nThis project uses agent-kit. Read [${GUIDE_FILE}](${GUIDE_FILE}) for the roles, ceremonies and folder layout.`;
    block(opts.readmePath, body, `# ${PROJECT_NAME}\n\n${wrapBlock(body)}\n`);
  } else if (opts.guide === 'readme') {
    block(opts.readmePath, demoteHeadings(guide), `# ${PROJECT_NAME}\n\n${wrapBlock(demoteHeadings(guide))}\n`);
  }

  out.push({ type: 'lines', path: '.gitignore', lines: GITIGNORE_LINES });
  return out;
}
