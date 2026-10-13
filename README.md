# agent-kit

Installs a document-driven Claude Code workflow into any project: six role agents, ceremony skills, and a `docs/` skeleton where **documents are the source of truth** and agents work through explicit gates.

```
npx agent-kit            # interactive: Quick (everything) or Customize
npx agent-kit --yes      # quick install, no questions
npx agent-kit update     # refresh framework files later
```

## What gets installed

| Piece | Where | Optional? |
|---|---|---|
| Docs skeleton — RELEASES, WORKFLOW, LEARNINGS, templates, PRD-001, SA-001, epics/issues folders | `docs/` or any folder you name | Folder name is your choice |
| Agents — product-owner · solutions-architect · tech-lead · implementer · qa · security | `.claude/agents/` | Pick any; skills add the agents they need |
| Skills — `/bootstrap-project` `/plan-epic` `/implement` `/qa-review` `/close-epic` `/fix-issue` `/security-scan` | `.claude/skills/` | Pick any |
| Agent instructions | `CLAUDE.md` (or `.claude/CLAUDE.md`) — a marked section, or one `@import` line pointing to `<docs>/AGENT-RULES.md`; file created if missing | Yes |
| Workflow guide for humans | `AGENT-WORKFLOW.md` + a link section in `README.md`, or a section in `README.md` | Yes |
| `.env*` ignore rules | `.gitignore` (missing lines only) | — |
| Install record | `.agent-kit.json` — your choices and file fingerprints; commit it | — |

Existing files are never silently replaced: init skips them unless you choose to replace them (a `.agent-kit.bak` copy is kept). Sections added to `CLAUDE.md` and `README.md` sit between `<!-- agent-kit:start -->` / `<!-- agent-kit:end -->` markers; everything outside them is left alone.

## Options

```
npx agent-kit init --docs-dir handbook --skills plan-epic,implement,qa-review \
  --agents none --claude-md import --guide readme --dry-run
```

| Flag | Values | Default |
|---|---|---|
| `-y, --yes` | quick install, no questions | interactive in a terminal |
| `--docs-dir` | relative path | `docs` |
| `--agents` / `--skills` | `all`, `none`, or comma list | `all` |
| `--claude-md` | `block` · `import` · `skip` | `block` |
| `--guide` | `file` · `readme` · `skip` | `file` |
| `--name` `--owner` `--first-version` `--theme` | project values | detected from package.json and git |
| `--overwrite` (init) / `--force` (update) | replace existing / edited files, keeping a backup | off |
| `--dry-run` | show the plan, write nothing | off |
| `--cwd` | project folder | current folder |

## After installing
1. Open the project in Claude Code and run `/bootstrap-project` — for existing code, the Solutions Architect drafts SA-001 from what is there.
2. Review SA-001, write PRD-001, then `/plan-epic EPIC-001`.

## Updating
`npx agent-kit update` re-renders agents, skills, templates, the guide and the marked sections using the choices in `.agent-kit.json`. Files you edited or deleted are left alone and listed. Project state — RELEASES, LEARNINGS, PRD, SA, epics, issues — is never touched.

## The model in five lines
1. `RELEASES.md` pins every piece of work to a target version; one version is Active at a time.
2. The PRD says what/why; the SA says how. Both are short so every agent can read them every time.
3. Epic → Story → Task → Sub-task. One file per epic and per story. Nothing is deleted; `closed/` is history.
4. Gates: PO + SA + Security approve an epic; Implementer + QA (+ Security) approve a story's readiness; QA (+ Security) decide Done. Reviewers can't write code; builders can't change requirements.
5. Agents work on `dev` and story worktrees; `main` and `rc/*` are human-only. Learnings from every epic feed `LEARNINGS.md` so mistakes aren't repeated.

## Changing the framework
Edit the files under `template/`. Tokens are filled at install: `{{DOCS_DIR}}` (write it wherever a path points into the docs folder), `{{PROJECT_NAME}}`, `{{SLUG}}`, `{{OWNER}}`, `{{FIRST_VERSION}}`, `{{FIRST_THEME}}`, `{{DATE}}`, `{{CEREMONIES}}`, `{{AGENTS}}`. A skill's required agents are the agent names it mentions in backticks. `npm test` checks that every install renders without leftover tokens.
