---
description: Incremental implementation — one vertical slice at a time. Test first, implement, verify, commit. Invoke with /implement.
---

# /implement

Load skill: `skills/incremental-implementation/SKILL.md`
Load skill: `skills/source-driven-development/SKILL.md`
Load tech skills identified in the plan (only those needed for current slice).

Given a plan from `./plans/`, execute the Implement → Test → Verify → Commit loop per slice:

For each slice:
1. **Scope lock**: state the slice name, the single test, and the files to be modified
2. **Write test first** (failing) — test the user-visible behaviour
3. **Implement** the minimum code to pass the test
4. **Verify**: test passes, no regressions, TypeScript compiles, lint passes
5. **Commit**: `git commit -m "<message from plan>"`

Check context budget between slices (`agents-skills tokens --budget`).
If > 70%, run `/compact` before continuing.

**Output goes to**: `/review` → `/secure` → `/test` (quality gates)
