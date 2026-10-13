# {{PROJECT_NAME}} — agent entry point

## Where to start (every task, every role)
1. `{{DOCS_DIR}}/RELEASES.md` — find the **target version** of the epic, story or issue you are working on. Do not assume it is the Active one; read the header of the item.
2. That version's **SA** (`{{DOCS_DIR}}/architecture/SA-xxx-*.md`) — how we build. Read it fully.
3. That version's **PRD** (`{{DOCS_DIR}}/prd/PRD-xxx-*.md`) — what and why. Read the sections your epic cites.
4. `{{DOCS_DIR}}/WORKFLOW.md` — who does what, states and gates.
5. The epic README (`{{DOCS_DIR}}/epics/open/EPIC-xxx-*/README.md`) and the story file.
6. `{{DOCS_DIR}}/completion-report/LEARNINGS.md` — rules from past mistakes.

If an item has no `Target:` or RELEASES.md has no row for it, stop and ask.

## Hard rules
- Documents under `{{DOCS_DIR}}/` are the only source of truth. Not memory, not chat, not cache. Undecided = not in a document = stop and ask.
- Scope is controlled by RELEASES.md. A new idea goes there as Roadmap/Backlog, never straight into an Active PRD or epic.
- Follow the SA for your version exactly. Need something it forbids or omits? Propose a change (SA §11); do not work around it.
- Only work on a story in state `Ready` or `In-progress`. No DoD you can restate in one sentence → it is not ready.
- Git (SA §8): work on a story branch cut from `dev` in a worktree; you may commit, push and merge **into `dev`** once QA has set the story `Done`. `main` and `rc/*` are human-only. Never force-push, never rewrite shared history, never delete files unless asked.
- Security is a gate (SA §11). Secrets in `.env` only; never in code, logs, docs or recordings. Stories touching secrets, auth, capture, network, storage or dependencies need the `security` agent's ✅ before Ready and before Done.
- No dead code, no commented-out code, minimal comments, no `utils/` dumping grounds, no new dependency without justification in the story.
- Anything surprising → memo (`{{DOCS_DIR}}/templates/MEMO.md`) under `{{DOCS_DIR}}/completion-report/EPIC-xxx/memos/`.
- Every document edit adds a change-log line.

## Debugging and QA
Fact-finding first: trace the exact lines, reproduce, show evidence. No fix without a written diagnosis (what, where, blast radius, how to reproduce) — in an issue file for bugs, in a memo otherwise. Hypotheses are tested, not assumed.

## Talking to the human
Succinct. Lead with the answer, offer the detail. Tables for comparisons. The human is technical-literate but not necessarily an engineer: plain words over jargon.

## Ceremonies
{{CEREMONIES}} — see `{{DOCS_DIR}}/WORKFLOW.md §5, §8`. Found something wrong that no story covers? File `{{DOCS_DIR}}/issues/open/ISSUE-nnn-*.md` from the template.
