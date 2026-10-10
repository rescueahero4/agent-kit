---
name: bootstrap-project
description: Start a new project from this template — asks for name, owner, first version and theme, fills placeholders, renames PRD/SA templates into docs/prd and docs/architecture, initialises git with main and dev. Use as /bootstrap-project in a fresh copy of agentic-project-template.
---
Run inside a fresh copy of the template (the folder contains `CLAUDE.md`, `docs/RELEASES.md`, `.claude/`). Stop if `docs/prd/` already has a PRD — the project is already bootstrapped.

1. Ask the human (AskUserQuestion, one round): project name · short slug (kebab-case) · owner name · first target version (default `0.1.0`) · one-line theme of that version · whether predecessor projects exist (paths) to seed LEARNINGS from.
2. Replace placeholders everywhere under the folder: `{{PROJECT_NAME}}`, `{{SLUG}}`, `{{OWNER}}`, `{{FIRST_VERSION}}`, `{{FIRST_THEME}}`, `{{DATE}}` (today, ISO).
3. Copy `docs/templates/PRD.md` → `docs/prd/PRD-001-<slug>.md` and `docs/templates/SA.md` → `docs/architecture/SA-001-<slug>.md`; set their IDs, Target/Applies-to, date and cross-links. Leave bodies as templates — the human and the Solutions Architect fill them.
4. If predecessor paths were given, spawn `tech-lead` to read their docs and propose up to 10 rule-form lines for `docs/completion-report/LEARNINGS.md`; the human approves before they are written.
5. Remove this skill's folder (`.claude/skills/bootstrap-project/`) and the `README.md` section "Starting a project"; the template's `README.md` becomes the project README skeleton.
6. `git init`, create `main`, first commit `chore: bootstrap from agentic-project-template`, create `dev` from `main`. Do not push.
7. Report: files created, placeholders filled, and the next step: write PRD-001 and SA-001, then `/plan-epic EPIC-001`.
