---
name: plan-epic
description: Plan an epic end to end — Tech Lead drafts stories, Implementer and QA check readiness in parallel, Product Owner and Solutions Architect review the epic in parallel, states updated. Use as /plan-epic EPIC-xxx.
---
Argument: an epic ID, e.g. `EPIC-003`. Locate `docs/epics/open/EPIC-xxx-*/README.md`. Stop if the epic is not in `Draft` or `Ready for Development`.

1. **Plan** — spawn `tech-lead` with: the epic path, "create stories per docs/WORKFLOW.md and docs/templates/STORY.md, do not set states beyond Draft". Wait.
2. **Readiness (parallel)** — for every story in `Draft`, spawn `implementer` and `qa` in the same turn (plus `security` for stories whose header says `Security review: required`), each told: "readiness review only, write your verdict row, do not build". Wait for all.
   - Any ❌ → spawn `tech-lead` once more with the collected questions to revise, then repeat step 2 for the affected stories (max 2 rounds; then stop and report to the human).
   - All ✅ → set each story `Ready`.
3. **Epic review (parallel)** — spawn `product-owner`, `solutions-architect` and `security` in the same turn for the Ready-for-Development gate. Wait for all three.
   - All ✅ → set the epic `Ready for Development` in its README and in the PRD epic table, add change-log lines.
   - Any ❌ → leave `Draft`, collect reasons.
4. **Report to the human** in under 15 lines: stories created (ID, outcome, state), verdicts, open questions, what needs a human decision.

Never implement anything in this skill. Never push to `main` or `rc/*`.
