# agent-kit — working on the installer

This repo is the `@rescueahero/agent-kit` npm package (command: `agent-kit`). The framework it installs lives in `template/`; its rules (`template/CLAUDE.md`) apply to projects that install it, not to this repo.

- `template/` — agents, skills, docs and guide, with `{{TOKENS}}` filled at install (list in README "Changing the framework"). Write `{{DOCS_DIR}}/…`, never a literal `docs/…`.
- `src/` — `catalog` reads the template · `outputs` decides what to write · `plan` compares with disk and writes · `options` asks/detects · `cli` wires commands.
- One runtime dependency (`@clack/prompts`). Add another only with a reason in the PR.
- `npm test` must pass. Try changes against a scratch folder: `node bin/agent-kit.js --yes --dry-run --cwd <dir>`.
- Never publish to npm or push without the owner asking.
