import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TEMPLATE_DIR = fileURLToPath(new URL('../template/', import.meta.url));
const WORKFLOW_ORDER = ['bootstrap-project', 'plan-epic', 'implement', 'qa-review', 'close-epic', 'fix-issue', 'security-scan'];
const rank = (dir) => (WORKFLOW_ORDER.includes(dir) ? WORKFLOW_ORDER.indexOf(dir) : WORKFLOW_ORDER.length);

export function readTemplate(rel) {
  return readFileSync(join(TEMPLATE_DIR, rel), 'utf8').replace(/\r\n/g, '\n');
}

export function listTemplateFiles(rel) {
  return readdirSync(join(TEMPLATE_DIR, rel), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? listTemplateFiles(`${rel}/${entry.name}`) : [`${rel}/${entry.name}`],
  );
}

function frontmatter(text) {
  const block = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  return Object.fromEntries(
    block.split('\n').map((line) => {
      const i = line.indexOf(':');
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
  );
}

function summarize(description) {
  return description.split(/ — |\. /)[0];
}

export function loadCatalog() {
  const agents = readdirSync(join(TEMPLATE_DIR, 'claude/agents'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const meta = frontmatter(readTemplate(`claude/agents/${f}`));
      return { name: meta.name, file: `claude/agents/${f}`, summary: summarize(meta.description) };
    });
  const agentNames = agents.map((a) => a.name);
  const dirs = readdirSync(join(TEMPLATE_DIR, 'claude/skills')).sort((a, b) => rank(a) - rank(b));
  const skills = dirs.map((dir) => {
    const text = readTemplate(`claude/skills/${dir}/SKILL.md`);
    const meta = frontmatter(text);
    return {
      name: meta.name,
      dir,
      summary: summarize(meta.description),
      usage: meta.description.match(/Use (?:once )?as (\/[a-z-]+(?: [A-Z]+-[a-z0-9-]+)?)/)?.[1] ?? `/${dir}`,
      requires: agentNames.filter((n) => text.includes(`\`${n}\``)),
    };
  });
  return { agents, skills };
}
