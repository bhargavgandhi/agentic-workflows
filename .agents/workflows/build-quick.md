---
description: Fast 4-phase workflow for bug fixes and small tasks — validate → implement → review → ship. No PRD or plan required. Invoke with /build-quick.
version: 1.0.0
---

# /build-quick — Fast Loop Workflow

> Lightweight workflow for **bug fixes, hotfixes, and small well-scoped tasks**.
> Skips PRD and implementation plan phases — goes straight from validation to code.
>
> **For new features** with meaningful scope: use `/build-feature` instead — full 6-phase lifecycle.

---

## Phase 1 — Adversarial Validation `/grill-me`

Load skill: `skills/grill-me/SKILL.md`

Keep it lightweight — focus on:
1. Restate the goal in one sentence. If unclear, ask before proceeding.
2. List assumptions (minimum 3). Attack each for failure modes.
3. Identify the single critical decision branch. Resolve it.
4. Confirm scope is genuinely small — if it's not, switch to `/build-feature`.

**GATE**: goal clear, assumptions resolved, scope confirmed small → proceed to Phase 2

---

## Phase 2 — Implementation `/implement`

Load skill: `skills/incremental-implementation/SKILL.md`
Load `skills/source-driven-development/SKILL.md` (always active during implementation).
Load relevant tech skills based on the task.

1. State scope lock — one sentence: what changes, what files
2. Write test first (failing)
3. Implement minimum code to pass
4. Verify: test passes, no regressions, TypeScript compiles (if applicable), lint passes
5. Commit with a conventional commit message

Check context budget if the implementation spans more than 3 files. If > 70%, trigger `context-engineering` compaction.

**GATE**: change implemented, test passing, committed → proceed to Phase 3

---

## Phase 3 — Code Review `/review`

Load skill: `skills/code-reviewer/SKILL.md`

1. Self-review the diff against project standards
2. Check for: unintended side effects, missing error handling, security issues
3. Fix all blocking issues immediately
4. Report suggestions to user (non-blocking)

**GATE**: no blocking issues → proceed to Phase 4

---

## Phase 4 — Ship `/ship`

Load skills: `skills/git-workflow/SKILL.md`

1. Stage only modified files (no accidental inclusions)
2. Confirm commit message with user
3. Push to origin
4. Create PR with a concise title and one-line body describing the fix
5. Monitor CI — apply fixup commits if needed

**GATE**: CI passing, PR created → workflow complete

---

## Quick Reference

| Command | Skill | Phase |
|---------|-------|-------|
| `/grill-me` | grill-me | Phase 1 |
| `/implement` | incremental-implementation | Phase 2 |
| `/review` | code-reviewer | Phase 3 |
| `/ship` | git-workflow | Phase 4 |
| `/compact` | context-engineering | Any phase |
| `/debug` | debug-investigator | On-demand |

---

## When to upgrade to `/build-feature`

Switch to `/build-feature` if any of these are true during Phase 1:
- The change touches more than 3 files in unrelated layers
- A PRD-level decision needs to be documented for the team
- Security implications require a full audit
- The fix introduces new behaviour (not just restoring existing behaviour)
