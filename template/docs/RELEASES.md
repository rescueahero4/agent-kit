# Releases — the version index

**This is the first file to open.** Every PRD, Solution Architecture (SA), epic and story is pinned to a target version. Find the version you are working on here, then read *its* SA and *its* PRD — not another version's.

States: `Planned` (documents being written) · `Active` (being built; one Active at a time unless stated) · `Released` · `Roadmap` (idea parked; no PRD yet).

| Version | State | Theme | PRD | SA | Epics | Notes |
|---|---|---|---|---|---|---|
| **{{FIRST_VERSION}}** | **Planned** | {{FIRST_THEME}} | [PRD-001](prd/PRD-001-{{SLUG}}.md) | [SA-001](architecture/SA-001-{{SLUG}}.md) | — | |

## Admin prerequisites (human legwork, start before the version goes Active)

| Version | Needed before Active | Owner | Status |
|---|---|---|---|
| {{FIRST_VERSION}} | | {{OWNER}} | ☐ |

Development of a version never waits on this table; the table exists so the work is visible early.

## Rules

1. **Scope lives here.** A new idea is a row in this table (as `Roadmap`) or a line in the Backlog below — never a silent addition to an Active PRD. Moving an idea into an Active version requires a PRD change (change log + human approval).
2. **One SA per architecture line.** A version that changes stack, boundaries or guardrails gets a new SA (SA-002…); one that only adds to them gets amendments recorded in the SA change log with `effective from <version>`.
3. **Pinning.** Headers carry `Target: <version>`. An epic's target is inherited by its stories. Changing a target is a change-log event on the epic and in this table.
4. **Versions are semver.** `0.x.0` = milestone releases before the first production release; `0.x.y` = fixes; `1.0.0` = first production release.
5. **Release = all epics Done + completion reports written + tag.** The row flips to `Released`, the next `Planned` row becomes `Active`.

## Backlog (unscheduled ideas)

| Idea | Raised | Earliest sensible version | Why not now |
|---|---|---|---|

## Change log

| Date | Version | Author | Change |
|---|---|---|---|
| {{DATE}} | 0.1 | {{OWNER}} | Created with agent-kit |
