# agent-kit

Installs a document-driven Claude Code workflow into any project: six role agents, ceremony skills, and a `docs/` skeleton where **documents are the source of truth** and agents work through explicit gates.

```
npx @rescueahero/agent-kit            # interactive: Quick (everything) or Customize
npx @rescueahero/agent-kit --yes      # quick install, no questions
npx @rescueahero/agent-kit update     # refresh framework files later
```

## Installing

Requires Node.js 20.12 or later. Run every command from the root of the project you are installing into, or pass `--cwd <dir>`. Add `--dry-run` to any command to see the plan without writing anything.

### From npm

The package is [`@rescueahero/agent-kit`](https://www.npmjs.com/package/@rescueahero/agent-kit).

| How | Install | Update later |
|---|---|---|
| One-off with npx (recommended) | `npx @rescueahero/agent-kit` | `npx @rescueahero/agent-kit@latest update` |
| As a dev dependency | `npm install -D @rescueahero/agent-kit`, then `npx agent-kit` | `npm update @rescueahero/agent-kit`, then `npx agent-kit update` |
| Globally | `npm install -g @rescueahero/agent-kit`, then `agent-kit` | `npm update -g @rescueahero/agent-kit`, then `agent-kit update` |

The command is called `agent-kit`. The short `npx agent-kit` works only where the package is already installed (as a dev dependency or globally). Anywhere else, use the full `npx @rescueahero/agent-kit`, because npm has no unscoped package by that name. `@latest` on update makes npx fetch the newest release instead of reusing a cached one.

### From GitHub

No npm account or registry needed; npx downloads the repo and runs it:

```
npx github:rescueahero4/agent-kit                # latest on main
npx github:rescueahero4/agent-kit update         # refresh later
npx github:rescueahero4/agent-kit#<commit-or-tag> # pin a version
```

Or work from a clone, which is also how to try unreleased changes:

```
git clone https://github.com/rescueahero4/agent-kit.git
cd agent-kit && npm install
node bin/agent-kit.js --cwd ../my-project          # or: npm link, then agent-kit in any project
```

Whichever way you install, the result is the same. Your choices are saved in `.agent-kit.json`, so `update` can run from any source later.

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
npx @rescueahero/agent-kit init --docs-dir handbook --skills plan-epic,implement,qa-review \
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
`npx @rescueahero/agent-kit@latest update` (or the matching command from [Installing](#installing)) re-renders agents, skills, templates, the guide and the marked sections using the choices in `.agent-kit.json`. Files you edited or deleted are left alone and listed. Project state — RELEASES, LEARNINGS, PRD, SA, epics, issues — is never touched.

## The model in five lines
1. `RELEASES.md` pins every piece of work to a target version; one version is Active at a time.
2. The PRD says what/why; the SA says how. Both are short so every agent can read them every time.
3. Epic → Story → Task → Sub-task. One file per epic and per story. Nothing is deleted; `closed/` is history.
4. Gates: PO + SA + Security approve an epic; Implementer + QA (+ Security) approve a story's readiness; QA (+ Security) decide Done. Reviewers can't write code; builders can't change requirements.
5. Agents work on `dev` and story worktrees; `main` and `rc/*` are human-only. Learnings from every epic feed `LEARNINGS.md` so mistakes aren't repeated.

## Changing the framework
Edit the files under `template/`. Tokens are filled at install: `{{DOCS_DIR}}` (write it wherever a path points into the docs folder), `{{PROJECT_NAME}}`, `{{SLUG}}`, `{{OWNER}}`, `{{FIRST_VERSION}}`, `{{FIRST_THEME}}`, `{{DATE}}`, `{{CEREMONIES}}`, `{{AGENTS}}`. A skill's required agents are the agent names it mentions in backticks. `npm test` checks that every install renders without leftover tokens.
