---
name: qa-review
description: Re-run QA verification for a story on the current code without re-implementing. Use as /qa-review STORY-xxx-nn, e.g. after a human-run manual scenario.
---
Argument: a story ID. Locate the story file. Spawn `qa` told: the story path, "execute the full test plan on current code, record results with evidence, update state". Report the per-scenario table and the resulting state to the human in under 10 lines.
