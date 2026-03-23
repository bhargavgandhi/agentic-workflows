---
description: End-to-end orchestration for building features, fixing bugs, and shipping code. Non-technical team members should use this workflow for any code change request.
---

# Build Feature Agent

> **Who is this for?** Any team member — technical or non-technical — who wants to request a feature, update, or bug fix. Simply tell the AI: _"Run /build_feature_agent"_ and describe what you need in plain English. **You do not need to know any file names, tech stack details, or coding terms.**

> [!IMPORTANT]
> **AI Communication Mandate:**
>
> 1. **Accept Plain English:** Assume the user is non-technical. Do not ask for file paths, variable names, or architecture details unless absolutely necessary.
> 2. **Speak Plain English:** When asking questions or providing updates, avoid technical jargon. Explain your plans in terms of user experience and app features, not code structure.
> 3. **Be Autonomous:** Figure out which files need to change on your own using Phase 1.

---

## Phase 1: Discovery & Research

// turbo-all

**Goal**: Understand the request and codebase before writing a single line of code.

### 1a. Interactive Clarification (for vague or complex requests)

If the request is ambiguous or covers multiple unknowns, **do not write code yet**. First:

1. Read `PRODUCT_DOCUMENTATION.md` and `TECHNICAL_DOCUMENTATION.md` if they exist.
2. Use `grep_search` to check if a similar feature, component, or pattern already exists.
3. Use `notify_user` to ask **2–3 targeted questions** about edge cases, UX preferences, or business logic constraints.
4. Iterate — wait for the user's response. If ambiguity remains, ask one more round. **Maximum 3 rounds.** After 3 rounds, make reasonable assumptions, document them explicitly, and proceed.

> Skip 1a if the request is clear and specific.

### 1b. Codebase Reconnaissance

1. **Search for Existing Solutions**: Use `grep_search` and `find_by_name` to check if a similar component, utility, or pattern already exists. **Rule**: Reuse and extend before creating new files.
2. **Analyze Architecture**: Use `view_file_outline` on relevant files to understand the structure. If modifying a shared component, run `grep_search` to find ALL usages (Strategic Impact Analysis).
3. **Deep Reconnaissance (fallback)**: If the architecture is unclear after step 1–2, perform targeted deep dives:
   - Use specific grep searches: `grep -rn "export const [Target]" src/`
   - Map the dependency tree for the target component (what it imports, who imports it).
   - Limit full file reads to a strict maximum of 5. For others, read only the outline/signatures.
   - Output a structural map artifact before writing any code.
4. **Output**: A compressed summary of findings (what exists, what can be reused, what needs to be built).

---

## Phase 2: Planning & Approval

> [!IMPORTANT]
> This is the ONLY manual step. The AI MUST pause here and wait for user approval before writing any code.

1. **Define the Plan**:
   - State the problem clearly in one sentence.
   - List all specific requirements and edge cases discovered during research.
   - Identify exactly which files will be modified or created.
   - Document any breaking changes or new dependencies being introduced.
   - Break the task into discrete, verifiable implementation phases.
   - Write the plan using the `implementation_plan.md` artifact format.
   - The plan MUST be in plain English so a non-technical team member can understand it.

2. **Present for Review**:
   - Use `notify_user` to send the plan for approval.
   - **DO NOT proceed until the user explicitly approves.**

3. **If Rejected**: Update the plan based on feedback and re-present. Repeat until approved.

---

## Phase 3: Implementation & Guardrails

**Goal**: Write production-quality code that follows all project standards.

1. **Follow All Rules**:
   - `rules/project_standards.md` — React/Vite/Tailwind conventions.
   - `rules/code_quality.md` — Formatting, linting, type safety, DRY.
   - `rules/workflow_protocols.md` — Component creation, impact analysis.

2. **Implementation Checklist**:
   - [ ] Functional components with hooks.
   - [ ] Reused existing components/utilities where possible (from Phase 1 findings).
   - [ ] Proper TypeScript types (no `any`).
   - [ ] Followed naming conventions (PascalCase components, camelCase utils, kebab-case directories).
   - [ ] Used `cn()` helper for conditional Tailwind classes.

3. **For UI/Frontend Changes** (trigger `frontend-design` skill):
   - Commit to a bold aesthetic direction before writing any CSS/JSX.
   - File structure for a new frontend module:
     - `[ModuleName].tsx`
     - `index.ts` (for exporting)
     - `[ModuleName].types.ts` (if types are complex)
   - Load `skills/frontend-design/SKILL.md` for full design system guidelines.

4. **For API/State Changes**: Invoke the `api-integration` skill to scaffold Redux/Firebase connections.

---

## Phase 4: Quality Checks & Self-Review

**Goal**: Ensure the code compiles, lints, and has a self-review before it reaches the user.

### 4a. Automated Checks (run in order)

// turbo

```bash
npx tsc --noEmit
```

// turbo

```bash
npm run lint
```

// turbo

```bash
npx prettier --check .
```

**If Any Check Fails**:
- Read the error output carefully.
- Loop back to **Phase 3** and fix the issue.
- Re-run the failing check.
- **Maximum 3 fix-loops.** If still failing after 3 attempts, report errors to the user with `notify_user`.

**Auto-Fix Shortcuts** (use first before manual fixes):

// turbo

```bash
npm run lint -- --fix
```

// turbo

```bash
npm run format
```

### 4b. Self Code Review (invoke `code-reviewer` skill)

Load `skills/code-reviewer/SKILL.md` and perform a PR-style self-review on the newly written files. Check:
- TypeScript strictness (`any` usage).
- Component size and complexity.
- Security (input validation, auth checks).
- Performance (N+1 queries, missing `useEffect` cleanup).
- Architecture alignment with `rules/project_standards.md`.

Fix any **blocking issues** found immediately. Report suggestions to the user.

### 4c. Test Writing (for new modules)

Invoke the `test-writing` skill to create a `.test.tsx` file covering:
- Rendering and user-centric interactions.
- Edge cases and error states.

Run the specific test file:

// turbo

```bash
npx vitest run [ModuleName].test.tsx
```

---

## Phase 5: Git & PR Operations

> [!IMPORTANT]
> This phase is **only triggered when the user explicitly asks** (e.g., "push this", "create a PR"). Never auto-run git commands without user approval.

1. **Create a Branch**:
   - Feature: `feature/<short-description>` (e.g., `feature/add-calendar-tooltip`)
   - Bug Fix: `fix/<short-description>` (e.g., `fix/sidebar-toggle-ipad`)
   - Chore: `chore/<short-description>` (e.g., `chore/update-dependencies`)

   ```bash
   git checkout -b <branch-name>
   ```

2. **Stage & Commit** using **Conventional Commits**:
   - `feat: <description>` — New feature
   - `fix: <description>` — Bug fix
   - `refactor: <description>` — Code restructure (no behavior change)
   - `chore: <description>` — Tooling, dependencies, config
   - `docs: <description>` — Documentation only
   - `style: <description>` — Formatting only (no logic change)
   - Commit message must be clear enough for a non-technical person to understand.

   ```bash
   git add -A
   git commit -m "<type>: <description>"
   ```

3. **Push & Open PR**:

   ```bash
   git push -u origin <branch-name>
   ```

   - After push, provide the user with the GitHub URL to create/view the PR.
   - If `gh` CLI is available, open the PR directly:

   ```bash
   gh pr create --title "<type>: <description>" --body "<summary of changes>" --base develop
   ```

4. **Post PR Review (Optional)**:
   - If requested, invoke the `post-pr-review` skill to post the code review feedback directly to the PR as inline comments.

---

## Quick Reference

| User Says                       | What Happens                                        |
| ------------------------------- | --------------------------------------------------- |
| _"Add a new feature..."_        | Run Phases 1–4, pause for local testing             |
| _"Fix this bug..."_             | Use `debug-investigator` skill, then Phase 4        |
| _"Review my code"_              | Use `code-reviewer` skill (Phase 4b only)           |
| _"Post review to PR"_           | Use `post-pr-review` skill (Phase 5, optional)      |
| _"Check code quality"_          | Run Phase 4a only                                   |
| _"Create a PR"_ / _"Push this"_ | Run Phase 5 only                                    |
| _"Ship it"_                     | Run Phases 4 + 5                                    |
| _"I have a vague idea..."_      | Run Phase 1a (interactive discovery) first          |
