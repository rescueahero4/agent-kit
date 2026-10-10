# SA-xxx — Solution Architecture: <line>

**ID:** SA-xxx · **Applies to:** x.y.z ([RELEASES](../RELEASES.md)) · **Status:** Draft v0.1 · YYYY-MM-DD · **What/Why:** [PRD-xxx](../prd/PRD-xxx-name.md) · **Process:** [WORKFLOW.md](../WORKFLOW.md)

> Single source of truth for **how** the system is built. Every story is checked against it. Need something it forbids or omits? Stop and propose a change (§12). A version that changes stack, boundaries or guardrails gets a new SA; additions are amendments logged below with `effective from <version>`.

## 1. Shape
One diagram of the components and the principle that decides where logic lives.

## 2. Stack (fixed)
| Layer | Choice | Not allowed |
Be explicit about what is banned; silence invites drift.

## 3. Repository layout
Tree with one-line purpose per folder. Rule: new top-level folder/app/package = §12 change. No `utils/` dumping grounds.

## 4. Runtime contracts
Interfaces between components, auth model, request IDs, where types are generated from.

## 5. Coding patterns
Shared rules, then per-language rules. Validation at boundaries, error handling, module size, comments policy, dependency policy.

## 6. Testing
| Level | Tool | Must cover |
Unit · contract · fixture/eval · behaviour (Given/When/Then executed by QA) · replay/e2e. Where tests live.

## 7. Quality gates (CI and local)
The exact commands. All green before In Review.

## 8. Git & versioning
Branch model (default: `main` human-only ← `rc/*` ← `dev` agents ← story worktrees), commit convention, version stamping, secrets/.gitignore, secret scanning.

## 9. Observability
Logging shape, what is measured per request/session, what is forbidden (analytics SDKs etc.).

## 10. Guardrails (non-negotiable)
Numbered. Short. Include "docs are the source of truth, not agent memory".

## 11. Security
Secrets and keys · data minimisation and retention · transport and API hardening · supply chain · user safety · **harm review** criteria the `security` agent uses to reject plans.

## 12. Changing this document
Memo → Solutions Architect drafts → human approves → change log → affected epics re-reviewed.

## 13. Decisions (ADR-lite)
| # | Decision | Why | Revisit when |

## Change log
| Date | Version | Author | Change |
|---|---|---|---|
