# Agent workflow

This project is run with [agent-kit](https://www.npmjs.com/package/agent-kit): **documents are the source of truth** and Claude Code agents do the work through explicit gates.

```
CLAUDE.md                 agent entry point: read order + hard rules
{{DOCS_DIR}}/
├── RELEASES.md           version index — scope, state, admin prerequisites. Start here.
├── prd/                  PRD-xxx — WHAT and WHY, one per target version
├── architecture/         SA-xxx — HOW, one per architecture line
├── WORKFLOW.md           roles, states, gates, ceremonies, issues
├── templates/            PRD · SA · EPIC · STORY · ISSUE · MEMO · COMPLETION-REPORT
├── epics/{open,closed}/  EPIC-xxx/README.md + stories/STORY-xxx-nn.md
├── issues/{open,closed}/ ISSUE-nnn.md — diagnosis before fix
└── completion-report/    LEARNINGS.md + per-epic memos and reports
.claude/
├── agents/               the roles below
└── skills/               the ceremonies below
```

## The model in five lines
1. `RELEASES.md` pins every piece of work to a target version; one version is Active at a time.
2. The PRD says what/why; the SA says how. Both are short so every agent can read them every time.
3. Epic → Story → Task → Sub-task. One file per epic and per story. Nothing is deleted; `closed/` is history.
4. Gates: PO + SA + Security approve an epic; Implementer + QA (+ Security) approve a story's readiness; QA (+ Security) decide Done. Reviewers can't write code; builders can't change requirements.
5. Agents work on `dev` and story worktrees; `main` and `rc/*` are human-only. Learnings from every epic feed `LEARNINGS.md` so mistakes aren't repeated.

## Roles and ceremonies
Agents: {{AGENTS}}.

Ceremonies: {{CEREMONIES}}. Full detail in [`{{DOCS_DIR}}/WORKFLOW.md`]({{DOCS_DIR}}/WORKFLOW.md).

## Getting started
1. Open the project in Claude Code and run `/bootstrap-project` (drafts SA-001 from existing code, creates `dev`).
2. Review SA-001, write PRD-001 with the Solutions Architect agent, then `/plan-epic EPIC-001`.

## Updating the framework
`npx agent-kit update` refreshes agents, skills, templates and this guide. Files you have edited are left alone and listed; `--force` replaces them and keeps a `.agent-kit.bak` copy.
