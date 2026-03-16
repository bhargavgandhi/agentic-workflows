---
description: Apply systematic reasoning to safely refactor code without changing behavior.
---

> [!IMPORTANT]
> **AI Communication Mandate:**
>
> 1. **Understand Plain English Requirements:** A non-technical user might request refactors like "Move the date picker to a shared widget" or "Clean up the schedule page logic" without naming specific files or functions.
> 2. **Communicate Clearly:** When presenting your `refactoring_plan.md` to the user, ensure your explanations of "Smells" and "Steps" can be understood by someone who doesn't code. Avoid excessive jargon.
> 3. **Be Autonomous:** Determine the file impact yourself based on their description.

1. **PRIMING**: You are an expert refactoring agent. Before starting, methodically plan using the principles below in a scratchpad or thought block.
   - **Understand First**: Document what the code does, inputs/outputs, and side effects.
   - **Check Tests**: Do NOT refactor without tests. If missing, write them first.
   - **Identify Opportunities**: Look for Code Smells (Long Methods, Large Classes, Duplication, etc.).
   - **Risk Mitigation**: Plan small steps, check for behavior changes.

2. Create a file `refactoring_plan.md` (or use the scratchpad if the refactor is small/single-file) using this checklist:

   # Refactoring Plan

   ## 1. Current State Analysis
   - **Understanding**: [Brief summary of what the code does]
   - **Test Coverage**: [Status of existing tests]

   ## 2. Targeted Code Smells
   - [ ] [Smell 1: e.g. Long Function `processData`]
   - [ ] [Smell 2: e.g. Duplicate logic in `A` and `B`]

   ## 3. Proposed Changes (Small Steps)
   - [ ] Step 1: [e.g. Extract method `validateInput`]
   - [ ] Step 2: [e.g. Rename variable `x` to `userIndex`]
   - [ ] Step 3: [e.g. Inline temp variable]

   ## 4. Verification
   - [ ] Run quality checks from `/feature_lifecycle` Phase 4:
     - `npx tsc --noEmit`
     - `npm run lint`
     - `npx prettier --check .`
   - [ ] Run existing tests (if available)
   - [ ] Add new tests if needed

3. execute the refactoring steps one by one.
   - **Follow Rules**: Adhere to `rules/code_quality.md` and `rules/project_standards.md`.
   - **Crucial**: Run quality checks after _every_ step.
   - **Crucial**: If a step breaks checks, revert and rethink. Do not pile fix upon fix.

4. conducting a final review against the checklist:
   - [ ] Is the code clearer?
   - [ ] Did behavior stay the same?
   - [ ] Are all quality checks passing?

5. **Ship It**: Ask the user to review the final refactoring.

6. **Git & PR Operations**:
   When the user confirms the refactor is good, or explicitly asks to commit/push:
   - Execute **Phase 5: Git & PR Operations** from the `/workflows/feature_lifecycle.md` workflow step-by-step.
   - This ensures the code is reviewed, committed with conventional messages, pushed, and a PR is created consistently.
