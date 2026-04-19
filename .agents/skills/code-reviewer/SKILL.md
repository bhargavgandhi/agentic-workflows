---
name: code-reviewer
description: Trigger this skill when the user asks for a PR review or code critique against project standards. Also invoked internally by /build-feature (Phase 5) as a self-review step before committing.
version: 2.0.0
category: process
optional: false
phase: 4
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- User asks for a code review, PR review, or critique
- `/review` slash command is issued
- Phase 5 of `/build-feature` (quality gate — self-review before PR)
- A feature branch is ready to merge and needs a final review

## 2. Prerequisites

- Access to the modified files or diff
- `references/review-checklist.md` loaded
- Understanding of the project's standards (`rules/project_standards.md` if present)

## 3. Steps

**Role**: You are a Senior Staff Engineer doing a strict PR review.

1. **Identify scope.** List every file that was changed. Read the diffs carefully. Your job is to critique and suggest specific fixes — do NOT rewrite entire files.

2. **Load the checklist.** Read `references/review-checklist.md`. Every rule in it will be evaluated.

3. **Evaluate each criterion:**
   - **Correctness**: Does the code do what it's supposed to? Are edge cases and errors handled?
   - **Security**: Input validation, auth checks, no data exposure, no injection vulnerabilities.
   - **Performance**: No N+1 queries, no missing `useEffect` cleanup, proper memoisation in React.
   - **Code Quality**: Readable names, no unnecessary complexity, DRY.
   - **Architecture**: Follows patterns in `rules/project_standards.md`. Proper separation of concerns.
   - **TypeScript**: No `any`, correct types on public APIs.
   - **Testing**: Meaningful tests covering edge cases and error conditions.

4. **Self-correction mode** (when invoked internally by `/build-feature`): Fix any blocking issues immediately without asking the user. Report suggestions only.

5. **Produce the review report** using the output format below:
   - **🔴 Blocking Issues**: Must be fixed before merging (type errors, security holes, broken tests)
   - **🟡 Suggestions**: Good to have but not blocking (readability, minor refactors)
   - **🟢 Approvals**: What was done well

   For each issue:
   - **Location**: `[FileName.ts]` line X
   - **Issue**: clear description of the problem
   - **Suggestion**: specific recommendation with a code snippet if applicable

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "This is a minor PR, I'll skip the checklist" | The checklist catches what pattern-matching misses. Run it. |
| "The code looks fine to me" | "Looks fine" is not a review. Evaluate each criterion explicitly. |
| "I'll rewrite this section to make it cleaner" | Your job is to critique, not rewrite. Point to the issue, suggest the fix. |
| "The tests are passing, so security is fine" | Tests do not test security posture. Check the security criteria explicitly. |
| "I won't nitpick style, that's subjective" | Style that violates project standards is not subjective. Checklist items are objective. |

## 5. Red Flags

Signs this skill is being violated:

- Review produced without reading `references/review-checklist.md`
- No blocking issues found on a large PR (either nothing was wrong or the review was shallow)
- Review contains only positive feedback
- Issues reported without file and line references
- Agent rewrote code instead of flagging specific issues

## 6. Verification Gate

Before marking review complete:

- [ ] All changed files identified and read
- [ ] `references/review-checklist.md` evaluated line by line
- [ ] All 7 criteria (correctness, security, performance, quality, architecture, TypeScript, testing) assessed
- [ ] Blocking issues separated from suggestions
- [ ] Every issue has a file + line reference
- [ ] Every blocking issue has a specific, actionable suggestion
- [ ] At least one approval (what was done well) included

## 7. References

- [review-checklist.md](references/review-checklist.md) — Complete criteria checklist
