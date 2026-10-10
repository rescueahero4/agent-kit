# agentic-project-template

A project skeleton where **documents are the source of truth** and Claude Code agents do the work through explicit gates.

```
CLAUDE.md                 agent entry point: read order + hard rules
docs/
├── RELEASES.md           version index — scope, state, admin prerequisites. Start here.
├── prd/                  PRD-xxx — WHAT and WHY, one per target version
├── architecture/         SA-xxx — HOW, one per architecture line
├── WORKFLOW.md           roles, states, gates, ceremonies, issues
├── templates/            PRD · SA · EPIC · STORY · ISSUE · MEMO · COMPLETION-REPORT
├── epics/{open,closed}/  EPIC-xxx/README.md + stories/STORY-xxx-nn.md
├── issues/{open,closed}/ ISSUE-nnn.md — diagnosis before fix
└── completion-report/    LEARNINGS.md + per-epic memos and reports
.claude/
├── agents/               product-owner · solutions-architect · tech-lead · implementer · qa · security
└── skills/               /plan-epic · /implement · /qa-review · /close-epic · /fix-issue · /security-scan · /bootstrap-project
```

## The model in five lines
1. `RELEASES.md` pins every piece of work to a target version; one version is Active at a time.
2. The PRD says what/why; the SA says how. Both are short so every agent can read them every time.
3. Epic → Story → Task → Sub-task. One file per epic and per story. Nothing is deleted; `closed/` is history.
4. Gates: PO + SA + Security approve an epic; Implementer + QA (+ Security) approve a story's readiness; QA (+ Security) decide Done. Reviewers can't write code; builders can't change requirements.
5. Agents work on `dev` and story worktrees; `main` and `rc/*` are human-only. Learnings from every epic feed `LEARNINGS.md` so mistakes aren't repeated.

## Starting a project
1. Copy this repo (GitHub "Use this template", or `cp -r`).
2. Open it in Claude Code and run `/bootstrap-project`.
3. Fill PRD-001 and SA-001 with the Solutions Architect agent, then `/plan-epic EPIC-001`.

## Changing the framework
Edit here, not in projects. Projects copy the framework at bootstrap time; back-port improvements deliberately.
