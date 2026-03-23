---
name: post-pr-review
description: Post completed code review feedback directly to a GitHub Pull Request as inline comments using the GitHub CLI. Use when the user asks to post a review to a PR.
metadata:
  pattern: tool-wrapper
  domain: git-github
  requires: gh-cli
---

# Post PR Review Skill

**Purpose**: Take actionable feedback from the `code-reviewer` skill and post it directly to the relevant lines in a GitHub Pull Request using the `gh` CLI.

**Prerequisite**: GitHub CLI (`gh`) must be authenticated. Run `gh auth status` to verify.

## Step 1 — Retrieve the Latest Commit ID

```bash
COMMIT_ID=$(gh pr view <PR_NUMBER> --json commits --jq '.commits[-1].oid')
```

## Step 2 — Post Inline Comments

For each actionable review item, identify the exact file path and line number, then post:

```bash
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments \
  -f body="**[🔴 Blocking / 🟡 Suggestion]**: [Your comment here]" \
  -f commit_id="$COMMIT_ID" \
  -f path="[path/to/modified/file.ts]" \
  -F line=[line_number] \
  -f side="RIGHT"
```

> **Note**: Using `/repos/{owner}/{repo}` triggers a `gh` macro that auto-resolves the repo from the current directory.

## Gotchas

1. **Only post actionable items** — skip 🟢 approvals, focus on 🔴 blocking and 🟡 suggestions.
2. **Line numbers must be in the diff** — GitHub only accepts comments on lines that appear in the PR diff.
3. **Batch where possible** — post all comments before asking the user to reload the PR.
