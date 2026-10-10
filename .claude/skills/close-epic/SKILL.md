---
name: close-epic
description: Close an epic whose stories are all Done — compile the completion report from memos, confirm metrics with the Product Owner, move the epic to epics/closed, update PRD table and LEARNINGS. Use as /close-epic EPIC-xxx.
---
Argument: an epic ID. Precondition: every story under its `stories/` is `Done`; otherwise stop and list the ones that aren't.

1. Spawn `tech-lead` told: "write docs/completion-report/EPIC-xxx/REPORT.md from docs/templates/COMPLETION-REPORT.md using all memos in memos/, and propose LEARNINGS lines".
2. Spawn `product-owner` for the Done gate against the report's metrics table.
3. If ✅: move `docs/epics/open/EPIC-xxx-*/` to `docs/epics/closed/`, set state `Done` in the README and the PRD epic table, append approved learnings to `docs/completion-report/LEARNINGS.md`, change-log lines everywhere touched. Moving a folder is a file operation the human may need to approve — ask if it fails.
4. Report to the human: what shipped, metrics vs targets, learnings added.
