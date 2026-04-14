---
name: post-pr-review
description: Post completed code review feedback directly to a GitHub Pull Request as inline comments using the GitHub CLI.
version: 2.0.0
category: technology
optional: true
phase: null
dependencies:
  - code-reviewer
---

## 1. Trigger Conditions

Invoke this skill when:

- The `code-reviewer` skill has finished producing feedback and the user asks to post it to GitHub
- A user asks to "post the review to the PR" or "leave comments on the PR"
- Inline review comments need to be submitted to a specific PR number

## 2. Prerequisites

- GitHub CLI (`gh`) installed and authenticated — verify with `gh auth status`
- PR number known (ask the user if not provided)
- Review feedback produced by `code-reviewer` skill (with file paths and line numbers)
- Line numbers in the feedback must be within the PR diff (GitHub rejects comments on unchanged lines)

## 3. Steps

### Step 1: Retrieve the Latest Commit ID
GitHub inline comments require the commit SHA, not just the PR number:

```bash
COMMIT_ID=$(gh pr view <PR_NUMBER> --json commits --jq '.commits[-1].oid')
```

Confirm the SHA is non-empty before proceeding.

### Step 2: Filter to Actionable Items Only
Before posting, filter the review output:

- **Post**: 🔴 Blocking issues, 🟡 Suggestions
- **Skip**: 🟢 Approvals, general praise, summary notes — these are for chat, not inline comments

### Step 3: Post Each Inline Comment

For each actionable item, post to the specific file and line:

```bash
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments \
  -f body="**[🔴 Blocking]**: <comment text>" \
  -f commit_id="$COMMIT_ID" \
  -f path="<path/to/file.ts>" \
  -F line=<line_number> \
  -f side="RIGHT"
```

> `/repos/{owner}/{repo}` is a `gh` macro that auto-resolves to the current repo. Do not substitute literal values unless auto-resolution fails.

### Step 4: Batch All Comments Before Notifying the User
Post all comments in sequence before asking the user to reload the PR. Avoid round-trips where the user reloads mid-batch.

### Step 5: Confirm Completion
After all comments are posted, tell the user how many comments were submitted and ask them to reload the PR.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll post the approval comment too — it's helpful context" | Approval noise clutters the PR review thread. Only actionable items belong as inline comments. |
| "I'll guess the line number from the review" | Wrong line numbers cause the GitHub API to reject the request with a 422. Verify line numbers are in the diff before posting. |
| "I'll post one comment per file rather than per line" | File-level comments lose the context of exactly which line the issue refers to. Post at the specific line. |
| "I can proceed without verifying `gh auth status`" | An unauthenticated `gh` silently fails or returns confusing errors. Always verify auth first. |

## 5. Red Flags

Signs this skill is being violated:

- `gh auth status` not run before attempting to post comments
- Approval or summary-only comments posted as inline PR comments
- Line numbers not verified against the PR diff
- All comments bundled into a single comment body instead of separate inline comments
- PR number assumed rather than confirmed with the user

## 6. Verification Gate

Before marking post-PR-review complete:

- [ ] `gh auth status` confirmed — CLI is authenticated
- [ ] PR number confirmed with the user or retrieved from context
- [ ] Latest commit SHA retrieved via `gh pr view ... --json commits`
- [ ] Only 🔴 blocking and 🟡 suggestion items submitted — approvals excluded
- [ ] Each comment posted at a specific file path and line number within the diff
- [ ] User notified of total comments posted with instruction to reload the PR

## 7. References

- [code-reviewer](../code-reviewer/SKILL.md) — Produces the review feedback consumed by this skill
- [git-workflow](../git-workflow/SKILL.md) — Git and PR branching conventions
