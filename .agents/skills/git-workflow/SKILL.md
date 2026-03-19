---
name: git-workflow
description: Enforces branch naming, conventional commits format, PR creation, and merge conflict resolution. Also covers the "babysit-pr" pattern. Use when commiting code, pushing to git, or opening PRs.
metadata:
  pattern: pipeline
  steps: "4"
---

You are running a Git workflow pipeline. Execute each step in order. Do NOT skip steps or proceed if a step fails.

## Step 1 — Branch Validation
- Review 'references/branch-naming.md'.
- Check the current branch. If it is `main` or `develop`, warn the user and attempt to create a valid feature/fix branch.
DO NOT proceed to Step 2 until you are on a properly named branch.

## Step 2 — Staging and Committing
- Review 'references/commit-conventions.md'.
- Review the diff (`git status` and `git diff`).
- Draft a commit message following Conventional Commits format. Present it to the user.
DO NOT proceed to Step 3 until the user approves the commit message. Once approved, commit the code.

## Step 3 — Push and PR Creation (Optional)
- Ask if the user wants to push to origin and create a PR.
- If yes, review 'references/pr-template.md'. Draft the PR body and execute the commands (e.g., using `gh pr create` or standard git push instructions).

## Step 4 — Babysit PR / CI Monitoring (Optional)
- If the PR is opened, check CI/CD action status if GitHub CLI is available.
- If checks fail, read the logs, fix the lint/test, and push a new fixup commit. Do NOT amend published commits as this requires a force-push.
