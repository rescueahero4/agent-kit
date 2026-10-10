---
name: fix-issue
description: Work an issue from docs/issues/open — QA writes the diagnosis, Tech Lead routes it (fold into a story, new story, or direct fix), Implementer fixes if direct, QA verifies and closes. Use as /fix-issue ISSUE-nnn.
---
Argument: an issue ID. Locate `docs/issues/open/ISSUE-nnn-*.md`. Stop if the Observed/Reproduction sections are empty — ask the human to fill them.

1. **Diagnose** — spawn `qa` told: "write the Diagnosis section with evidence (exact lines, reproduction confirmed, blast radius). Do not change code." If it cannot be reproduced, record that and stop; report to the human.
2. **Route** — spawn `tech-lead` told: "read the diagnosis; decide fold-into-story / new-story / direct-fix; write the decision in `Routed to:`". For fold/new-story, update or create the story and stop here — the story flows through `/plan-epic` or `/implement`.
3. **Direct fix only** — spawn `implementer` with `isolation: worktree` off `dev` (or off the `rc/*` branch only if the human says so): fix per the diagnosis, add a regression test, run SA §7 gates, fill Resolution. Security-relevant issues (S1, or touching SA §11 items) also get a `security` verification in step 4.
4. **Verify** — spawn `qa`: execute the Verification table, record evidence. ✅ → state `Closed`, move the file to `docs/issues/closed/`, add a LEARNINGS line if the root cause is a lesson. ❌ → back to Implementer, max 2 loops.
5. On close, merge into `dev` as in `/implement`. Report to the human in under 10 lines: cause, blast radius, where it was routed, verification result.
