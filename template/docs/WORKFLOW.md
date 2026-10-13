# Workflow — how work moves

**Status:** v0.1 · 2026-10-10 · [RELEASES.md](RELEASES.md) says *which version* · its PRD says *what/why* · its SA says *how* · this file says *who does what, when*.

**Rule zero: documents are the source of truth.** Agent memory, chat history and caches do not count. If a decision, verdict or lesson is not written into a file under `{{DOCS_DIR}}/`, it did not happen.

---

## 1. Hierarchy

Everything hangs off a **target version** in `RELEASES.md`.

```
RELEASES.md ─ version ─ PRD-xxx (+ SA-xxx)
              └─┬─ EPIC-xxx  ({{DOCS_DIR}}/epics/open/EPIC-xxx/README.md → {{DOCS_DIR}}/epics/closed/ when Done)
          │     └─ STORY-xxx-nn  (…/stories/STORY-xxx-nn-short-name.md)
          │            └─ Tasks T1, T2…  (checklist inside the story)
          │                   └─ Sub-tasks T1.1…  (only when a task needs splitting)
          └─ completion-report/EPIC-xxx/  (memos during work, REPORT.md on close)

ISSUE-nnn  ({{DOCS_DIR}}/issues/open/ISSUE-nnn-short-name.md → {{DOCS_DIR}}/issues/closed/ when resolved)
```

Folders follow one pattern: `open/` is work to do, `closed/` is history. Nothing is deleted.

One PRD per feature set. One folder per epic. One file per story. Tasks and sub-tasks stay inside the story file.

## 2. Roles (Claude Code subagents in `.claude/agents/`)

| Role | Owns | May edit | May not |
|---|---|---|---|
| **Product Owner** | Does the epic deliver the PRD outcome? Success metrics, priorities | Epic README (state, metrics), PRD change proposals | Code, SA |
| **Solutions Architect** | Does the plan obey the SA? Technical risk, boundaries, dependencies | SA (via §11 proposal), epic technical notes | Code |
| **Tech Lead** | Turns an epic into stories, tasks, DoD and test-plan skeletons | Story files | Code, SA, PRD |
| **Implementer** | Builds exactly what the story says | Code, tests, story task checkboxes, memos | Story DoD, SA, PRD |
| **QA** | Verifies behaviour against the test plan; guards readiness | Story test plan verdicts, memos | Code |
| **Security** | Secrets, data minimisation, transport, supply chain, harm review of plans (SA §11) | Security verdict rows, memos, issues (S1) | Code, DoD |

Every role starts by reading, in order: `CLAUDE.md` → `RELEASES.md` (find the target version of the epic/story) → that version's SA → that version's PRD, the sections the epic cites → epic README → story → `completion-report/LEARNINGS.md`. No exceptions; the documents are short on purpose.

## 3. States

**Epic:** `Draft` → `Ready for Development` → `In-progress` → `Done`
**Story:** `Draft` → `Ready` → `In-progress` → `In Review` → `Done` (or `Blocked`, with reason)

State lives in the file header and in the PRD epic table. Whoever changes a state updates both and adds a change-log line.

## 4. Gates

### Epic → Ready for Development
Product Owner, Solutions Architect **and** Security review in parallel and all must write ✅ in the epic README:
- stories listed with one-line outcomes
- success metrics measurable
- epic Definition of Done written
- SA: no story contradicts the SA; dependencies on other epics named
- learnings from `completion-report/LEARNINGS.md` checked for relevance
- **Security** (third parallel reviewer): plan passes the SA §11 harm review; stories touching secrets, auth, capture, network, storage or dependencies are flagged `security-review: required` in their header

### Story → Ready
Tech Lead writes the story (template §6). Then Implementer **and** QA review in parallel:
- Implementer: "I can restate the DoD in one sentence and know when I'm finished." If not → `Draft`, with the question written in the story.
- QA: "The test plan has Given/When/Then scenarios whose outcome I can observe or run." If not → `Draft`, with what's missing written in the story.
Both ✅ → `Ready`. Stories flagged `security-review: required` also need a Security ✅ at this gate (threat notes + mitigations present in the story).

### Story → Done
- Implementer: all tasks checked, quality gates green (SA §7), memo written if anything surprising happened.
- QA executes every scenario, records result per scenario in the story. Any ❌ → back to `In-progress` with the failing scenario named.
- Stories flagged `security-review: required`: Security verifies mitigations in the code (secret scan, log redaction, schema strictness, least privilege) and writes its row. ❌ blocks `Done`.
- All ✅ → `Done`. The Implementer (or the ceremony) then merges the story branch into `dev` and deletes the branch.

### Epic → Done
All stories Done → Tech Lead compiles `completion-report/EPIC-xxx/REPORT.md` from the memos → PO confirms success metrics → epic folder moves `epics/open/` → `epics/closed/` → PRD table updated → LEARNINGS.md updated.

## 5. Ceremonies (skills in `.claude/skills/`)

| Command | Runs | Parallel? |
|---|---|---|
| `/plan-epic EPIC-xxx` | Tech Lead drafts stories → Implementer + QA (+ Security if flagged) readiness → PO + SA + Security epic review → states updated, summary to human | Readiness and review groups each run in parallel |
| `/implement STORY-xxx-nn` | Checks `Ready` → Implementer builds (worktree off `dev`) → QA executes test plan (+ Security if flagged) → `Done` → merge to `dev` | Sequential by nature |
| `/security-scan` | Security agent sweeps the repo and `dev`: secrets, dependency audit, log redaction, capability set; files S1/S2 issues | — |
| `/qa-review STORY-xxx-nn` | QA only, re-runs the test plan on current code | — |
| `/close-epic EPIC-xxx` | Compiles report, moves folder to `epics/closed/`, updates PRD table and LEARNINGS | — |
| `/fix-issue ISSUE-nnn` | QA diagnoses → Tech Lead routes → Implementer fixes (if direct) → QA verifies → moved to `issues/closed/` | — |

Independent stories may be implemented in parallel, one Implementer each, each in its own git worktree. Stories that touch the same files are serialised by the Tech Lead (declared in the story header as `Conflicts with:`).

## 6. Templates

In [`templates/`](templates/): `EPIC.md`, `STORY.md`, `ISSUE.md`, `MEMO.md`, `COMPLETION-REPORT.md`. Copy, don't improvise. Every document ends with a **Change log** table.

## 7. Memos and the completion report

- Any agent that hits something surprising (a wrong assumption, a flaky tool, a decision made on the spot) writes a memo: `completion-report/EPIC-xxx/memos/<date>-<role>-<slug>.md` (template `MEMO.md`). One page max.
- On epic close the Tech Lead compiles `REPORT.md`: what shipped, metrics vs targets, challenges, issues, decisions taken, and **learnings as rules** ("always…", "never…").
- Learnings that apply beyond one epic are appended to `completion-report/LEARNINGS.md` — a short, deduplicated list every role reads at start. That file is how the same mistake is not made twice.

## 8. Issues

An **issue** is anything wrong that is not already a planned task: a bug seen in use, a failing gate on `main`, a wrong assumption in a document, a security concern. Issues are not stories — they are triaged first.

- Anyone (human or agent) files `{{DOCS_DIR}}/issues/open/ISSUE-nnn-short-name.md` from `templates/ISSUE.md`. Next free number; never reuse.
- **Severity:** `S1` blocks play or leaks data · `S2` wrong result for the player · `S3` degraded/cosmetic · `S4` {{DOCS_DIR}}/tooling.
- **Diagnosis before fix (CLAUDE.md rule).** QA or Implementer writes the diagnosis in the issue: exact lines, reproduction, blast radius (downstream consumers and sibling code), evidence. No code change until the diagnosis is written.
- **Routing** by the Tech Lead: fold into an existing `Draft`/`Ready` story, create a new story in the relevant epic, or fix directly as an issue (S1/S2 hotfix, or trivial S3/S4). The issue records where it went.
- **Closing:** QA verifies with the same evidence standard as a story, writes the verdict, moves the file to `issues/closed/`. If the root cause is a lesson, add it to `LEARNINGS.md`.
- Ceremony: `/fix-issue ISSUE-nnn` — QA diagnoses → Tech Lead routes → (if direct fix) Implementer fixes → QA verifies → closed.

## 9. Human in the loop

The human approves: PRD and SA changes, epic → Ready for Development, cutting `rc/*`, anything touching `main`, deleting files, external accounts. Agents push and merge on `dev` and story branches only (SA §8). Agents stop and ask when the SA or PRD is silent on something they need.

## Change log

| Date | Version | Author | Change |
|---|---|---|---|
| {{DATE}} | 1.0 | {{OWNER}} | Installed with agent-kit |
