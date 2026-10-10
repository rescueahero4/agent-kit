---
name: security-scan
description: Run the Security agent's repo sweep — secrets, dependency audit, log redaction, Tauri capabilities, .gitignore gaps — and file issues for findings. Use as /security-scan, before cutting an rc branch, or after merging several stories to dev.
---
Spawn `security` told: "repo scan per your definition; file findings as issues; do not fix; summarise". Report to the human: count by severity, the S1/S2 issue IDs, and whether `dev` is clean enough to cut an `rc/*` branch. Never fix anything in this skill.
