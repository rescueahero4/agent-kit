---
name: implement
description: Implement a Ready story — Implementer builds in its own worktree, QA verifies against the test plan, state updated. Use as /implement STORY-xxx-nn. Several stories without Conflicts-with overlap may be run in parallel.
---
Argument: one or more story IDs. For each, locate the story file under `docs/epics/open/*/stories/`.

Preconditions, or stop and say why: story state is `Ready`; its epic is `Ready for Development` or `In-progress`; no listed `Conflicts with:` story is currently `In-progress`.

1. Set story `In-progress` (and the epic `In-progress` if it was `Ready for Development`), change-log lines.
2. Spawn `implementer` with `isolation: worktree` (branch from `dev`, named per the story header), told: the story path, "implement per the story and SA, run SA §7 gates, set In Review when done". Independent stories may be spawned in the same turn.
3. When `In Review`, spawn `qa` told: the story path, "verify every scenario, record evidence, set Done or back to In-progress". If the header says `Security review: required`, spawn `security` in the same turn to verify mitigations in code; both must ✅.
4. If QA sends it back, spawn `implementer` again with the failing scenario, then QA again. Max 2 loops, then stop and report.
5. On `Done`: push the story branch, merge it into `dev` with a merge commit, run SA §7 gates on `dev`, delete the story branch. Never touch `main` or `rc/*`.
6. Report to the human: state, scenarios passed/failed/pending-human, gates summary, merge commit on `dev`, any memos written.
