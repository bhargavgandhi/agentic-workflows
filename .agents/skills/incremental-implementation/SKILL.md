---
name: incremental-implementation
description: Implement → Test → Verify → Commit cycle discipline. Strict scope rules, vertical slice sizing, no horizontal layers.
version: 1.0.0
category: process
optional: false
phase: 2
dependencies: [prd-to-plan]
---

## 1. Trigger Conditions

Invoke this skill during the implementation phase — after a plan exists and slices are defined.

Specific triggers:
- `/implement` slash command
- Phase 4 of `/build-feature` master workflow
- Any time the agent is about to write production code

## 2. Prerequisites

- A plan from `prd-to-plan` with at least one slice defined
- The relevant tech skills loaded for the current slice
- Tests are writable (test framework installed)

## 3. Steps

The core loop runs once per slice:

### Step 1: Scope Lock
Before writing a single line of code, state aloud (in your response):
- The exact slice being implemented (from the plan)
- The single test that will verify it's done
- Files that will be created or modified (no others)

If you cannot state all three clearly, the slice is not well-defined. Return to `prd-to-plan`.

### Step 2: Write the Test First
Write the failing test before writing implementation code. The test must:
- Test the user-visible behaviour described in the slice goal
- Be independently runnable (no dependency on other incomplete slices)
- Fail for the right reason (not a setup error)

### Step 3: Implement the Slice
Write the minimum code required to make the test pass:
- Touch only files listed in the scope lock
- Do not refactor surrounding code unless it directly blocks the test
- Do not add features not in the current slice ("while I'm here" additions are forbidden)
- Do not write abstraction layers not immediately needed

### Step 4: Verify
Run the test. All of the following must be true before proceeding:
- The new test passes
- No previously passing tests are now failing
- TypeScript compiles without errors (if applicable)
- Linting passes

If verification fails, fix within the current slice scope. Do not expand scope to fix it.

### Step 5: Commit
Once verified, commit immediately using the commit message defined in the plan:
```
git add <only the files listed in scope lock>
git commit -m "feat: <slice commit message from plan>"
```

Never batch multiple slices into one commit. Each slice = one commit.

### Step 6: Advance to Next Slice
Load the next slice from the plan. Repeat from Step 1.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll write the tests after, I know this code works" | You don't. Tests written after implementation confirm what you built, not what was needed. |
| "Let me refactor this while I'm in the file" | Refactoring during feature work mixes concerns and breaks git bisect. One slice, one commit. |
| "I'll add this helper now since I'll need it in slice 3" | You don't know that yet. YAGNI. Build it when slice 3 starts. |
| "I'll batch these 3 small slices into one commit" | Small commits are the undo button. Don't merge them. |
| "The linting error is unrelated to my change" | Unrelated or not — if it fails, you didn't leave the codebase clean. Fix it. |
| "I'll verify manually, the test suite is slow" | Manual verification is not verification. Run the suite. |

## 5. Red Flags

Signs this skill is being violated:

- Files modified not in the scope lock
- Commit contains changes from multiple slices
- Tests written after implementation is already "done"
- TypeScript or lint errors present at commit time
- Implementation contains code for future slices ("just getting ahead")
- A slice has been in-progress for more than a day without a commit

## 6. Verification Gate

Per slice, before advancing:

- [ ] Scope lock stated (slice name, test, files)
- [ ] Test written before implementation
- [ ] Test was failing before implementation (for the right reason)
- [ ] Test passes after implementation
- [ ] No regressions in existing tests
- [ ] TypeScript compiles (if applicable)
- [ ] Lint passes
- [ ] Committed with correct message from plan
- [ ] Only files in scope lock were committed

## 7. References

- [slice-sizing-guide.md](references/slice-sizing-guide.md) — How big should a slice be?
- [commit-discipline.md](references/commit-discipline.md) — Conventional commit rules for slices
