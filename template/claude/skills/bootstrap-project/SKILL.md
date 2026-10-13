---
name: bootstrap-project
description: Finish setting up a project after `npx agent-kit init` — drafts SA-001 from existing code (or leaves it as a template for a new project), records the current release, seeds LEARNINGS from predecessor projects, creates the dev branch. Use once as /bootstrap-project.
---
Run after `npx agent-kit init` (the repo has `.agent-kit.json` and `{{DOCS_DIR}}/RELEASES.md`). Stop if SA-001's status is no longer `Draft v0.1` — the project is already bootstrapped.

1. Ask the human (AskUserQuestion, one round): does this repo already contain code the project builds on · has a version already shipped (which) · predecessor projects to seed LEARNINGS from (paths, optional).
2. Existing code → spawn `solutions-architect` told: "draft `{{DOCS_DIR}}/architecture/SA-001-*.md` from the code as it is today — stack, layout, patterns, quality gates (§7), git (§8), guardrails, security (§11). Mark anything inferred rather than read as `(inferred)`. Do not change code." No code → leave SA-001 as the template.
3. A version already shipped → add a `RELEASES.md` row above the first one: that version, state `Released`, PRD/SA `—`, notes `before agent-kit`.
4. Predecessor paths given → spawn `tech-lead` to read their docs and propose up to 10 rule-form lines for `{{DOCS_DIR}}/completion-report/LEARNINGS.md`; the human approves before they are written.
5. If no `dev` branch exists, create it from the current branch. Do not push, do not commit.
6. Report: what was drafted, what the human must review, and the next step: review SA-001, write PRD-001, then `/plan-epic EPIC-001`.
