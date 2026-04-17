---
description: Branch → Commit → PR. Enforces conventional commits and CI monitoring. Invoke with /ship.
---

# /ship

Load skill: `skills/git-workflow/SKILL.md`
Load skill: `skills/ci-cd-and-automation/SKILL.md`

Prerequisites: all quality gates passed (`/review`, `/secure`, `/test`).

1. **Branch**: create `feature/<slug>` or `fix/<slug>` from main
2. **Stage**: `git status` → stage only modified files (no `git add .`)
3. **Commit**: draft conventional commit message → present for approval → commit
4. **Push**: `git push -u origin <branch>`
5. **PR**: `gh pr create` with title, body (from PRD issue), labels, linked issue
6. **Monitor CI**: `gh pr checks` → fix failures with fixup commits (never `--amend`)

**Never push directly to main.** Always via PR with CI passing.
