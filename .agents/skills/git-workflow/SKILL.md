---
name: git-workflow
description: Enforces branch naming, conventional commits format, PR creation, and merge conflict resolution. Use when committing code, pushing to git, or opening PRs.
version: 2.0.0
category: process
optional: false
phase: 5
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- `/ship` slash command is issued
- Phase 6 of `/build-feature` (branch → commit → PR)
- User says "commit", "push", "open a PR", or "create a pull request"
- A merge conflict needs resolution
- CI checks on a PR are failing and need a fixup commit

## 2. Prerequisites

- Code is written and verified (tests pass, lint passes)
- Git is initialised and a remote origin exists
- GitHub CLI (`gh`) available for PR creation (optional but recommended)

## 3. Steps

Execute each step in order. Do NOT skip steps or proceed if a step fails.

### Step 1 — Branch Validation
- Review `references/branch-naming.md` for naming conventions
- Check the current branch: `git branch --show-current`
- If on `main` or `develop`, warn the user and create a valid feature/fix branch before proceeding
- **Gate**: do not proceed until on a properly named branch

### Step 2 — Staging and Committing
- Review `references/commit-conventions.md` for conventional commits format
- Run `git status` and `git diff` to understand what changed
- Stage only the files relevant to this slice/feature (do not `git add .` blindly)
- Draft a commit message following Conventional Commits format
- Present the message to the user and wait for approval
- **Gate**: do not commit until the message is approved

Commit format:
```
<type>(<scope>): <short description>

[optional body]
[optional footer: BREAKING CHANGE, closes #issue]
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`

### Step 3 — Push and PR Creation
- Ask if the user wants to push and open a PR
- If yes, review `references/pr-template.md` and draft the PR body
- Create the PR using `gh pr create` with the drafted title and body
- Set appropriate labels (`feature`, `bugfix`, `chore`, etc.)
- Link to the relevant GitHub issue if one exists

### Step 4 — Babysit PR / CI Monitoring
- If the PR is open, check CI status: `gh pr checks <PR-number>`
- If checks fail: read the logs, fix lint/test errors, push a fixup commit
- **Never amend published commits** (would require force-push). Always add a new fixup commit.
- Repeat until all checks pass

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "The branch name doesn't matter" | Branch names are used in PR titles, changelogs, and git bisect. Follow the convention. |
| "I'll use `git add .` for speed" | Unrelated files in a commit pollute the history and make rollback impossible. Stage explicitly. |
| "I'll write the commit message later" | The message is part of the commit. Draft it now while the context is fresh. |
| "I'll amend the last commit instead of a fixup" | Amending a published commit requires force-push, which rewrites shared history. Add a fixup. |
| "The CI failure is unrelated to my change" | "Unrelated" failures still block the merge. Fix them or explain them in the PR. |

## 5. Red Flags

Signs this skill is being violated:

- Commit message doesn't follow Conventional Commits format
- `git add .` used without reviewing `git status` first
- Committing directly to `main` or `develop`
- PR created without a description or linked issue
- Published commit amended with `--amend` instead of a fixup commit
- CI failures ignored or marked as "unrelated"

## 6. Verification Gate

Before marking this skill complete:

- [ ] On a properly named feature/fix branch (not main/develop)
- [ ] `git status` reviewed — only relevant files staged
- [ ] Commit message follows Conventional Commits format
- [ ] Commit message approved before executing
- [ ] PR created with title, body, and labels
- [ ] PR linked to relevant issue (if one exists)
- [ ] All CI checks passing on the PR

## 7. References

- [branch-naming.md](references/branch-naming.md) — Branch naming conventions
- [commit-conventions.md](references/commit-conventions.md) — Conventional Commits format
- [pr-template.md](references/pr-template.md) — PR body template
