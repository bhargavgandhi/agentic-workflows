---
description: Apply systematic reasoning to safely refactor code without changing behavior.
---

# Refactor Agent

> [!IMPORTANT]
> **AI Communication Mandate:**
>
> 1. **Accept Plain English:** A non-technical user might request refactors like "Move the date picker to a shared widget" or "Clean up the schedule page logic" without naming files or functions.
> 2. **Speak Plain English:** When presenting your plan, explain "Smells" and "Steps" in terms a non-coder can understand.
> 3. **Be Autonomous:** Determine the file impact yourself based on their description.

---

## Phase 1: Understand & Analyse

**Goal**: Understand what the code does before touching a single line.

1. **Locate the Code**: Use `grep_search` and `find_by_name` to find the affected files based on the user's description.
2. **Understand It**: Document what the code does, its inputs/outputs, and any side effects.
3. **Check Test Coverage**: Do NOT refactor without tests. If tests are missing, write them first.
4. **Identify Code Smells**: Look for:
   - Long methods / large classes
   - Duplicate logic
   - Poor naming
   - Tight coupling / missing abstraction
5. **Output**: A compressed summary of what needs to change and why.

---

## Phase 2: Planning & Approval

> [!IMPORTANT]
> This is the ONLY manual step. The AI MUST pause here and wait for user approval before changing any code.

Create a `refactoring_plan.md` artifact using this structure:

```markdown
# Refactoring Plan

## 1. Current State
- **What it does**: [Brief summary]
- **Test Coverage**: [Existing / Missing]

## 2. Code Smells Identified
- [ ] [Smell 1: e.g. Long Function `processData`]
- [ ] [Smell 2: e.g. Duplicate logic in `A` and `B`]

## 3. Proposed Steps (Small, Safe Increments)
- [ ] Step 1: [e.g. Extract method `validateInput`]
- [ ] Step 2: [e.g. Rename variable `x` → `userIndex`]
- [ ] Step 3: [e.g. Inline temp variable]

## 4. Risk Assessment
- [Any shared components affected? Breaking changes?]
```

Use `notify_user` to present the plan. **DO NOT proceed until the user explicitly approves.**

---

## Phase 3: Execution

**Goal**: Apply refactoring steps safely, one at a time.

1. **Follow Rules**: Adhere to `rules/code_quality.md` and `rules/project_standards.md`.
2. **One Step at a Time**: Execute each step from the plan sequentially.
3. **Run checks after every step**:

```bash
npx tsc --noEmit
```

```bash
npm run lint
```

4. **If a step breaks checks**: Revert it and rethink. Do NOT pile fix upon fix.

---

## Phase 4: Self-Review & Verification

**Goal**: Confirm the refactor improved the code without changing behavior.

1. **Self-Review Checklist**:
   - [ ] Is the code clearer and more readable?
   - [ ] Did behavior stay exactly the same?
   - [ ] No new `any` types introduced?
   - [ ] All quality checks passing?

2. **Run full quality suite**:

```bash
npx tsc --noEmit
```

```bash
npm run lint
```

```bash
npx prettier --check .
```

3. **Run existing tests** (and any new ones written in Phase 1).

4. **Invoke `code-reviewer` skill** for a final PR-style self-review of the changed files.

---

## Phase 5: Git & PR Operations

> [!IMPORTANT]
> Only triggered when the user explicitly asks (e.g., "push this", "create a PR"). Never auto-run git commands.

When the user confirms the refactor is good, execute **Phase 5: Git & PR Operations** from `/workflows/build_feature_agent.md` step-by-step.
