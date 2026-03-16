---
description: End-to-end orchestration for building features, fixing bugs, and shipping code. Non-technical team members should use this workflow for any code change request.
---

# Feature Lifecycle Workflow

> **Who is this for?** Any team member — technical or non-technical — who wants to request a feature, update, or bug fix. Simply tell the AI: _"Run /feature_lifecycle"_ and describe what you need in plain English. **You do not need to know any file names, tech stack details, or coding terms.**

> [!IMPORTANT]
> **AI Communication Mandate:**
>
> 1. **Accept Plain English:** Assume the user is non-technical. Do not ask for file paths, variable names, or architecture details unless absolutely necessary.
> 2. **Speak Plain English:** When asking questions or providing updates, avoid technical jargon. Explain your plans in terms of user experience and app features, not code structure.
> 3. **Be Autonomous:** Figure out which files need to change on your own using Phase 1.

---

## Phase 1: Research & Context Gathering

// turbo-all

**Goal**: Understand the codebase before writing a single line of code.

1. **Read Documentation**:
   - Read `PRODUCT_DOCUMENTATION.md` and `TECHNICAL_DOCUMENTATION.md`.

2. **Search for Existing Solutions**:
   - Use `grep_search` and `find_by_name` to check if a similar component, utility, or pattern already exists.
   - Follow the **Smart Component Creation Protocol** in `rules/workflow_protocols.md`.
   - **Rule**: Reuse and extend before creating new files.

3. **Analyze Architecture**:
   - Use `view_file_outline` on relevant files to understand the structure.
   - If modifying a shared component, run `grep_search` to find ALL usages (Strategic Impact Analysis).

4. **Output**: A compressed summary of findings (what exists, what can be reused, what needs to be built).

---

## Phase 2: Planning & Approval

> [!IMPORTANT]
> This is the ONLY manual step. The AI MUST pause here and wait for user approval before writing any code.

1. **Write an Implementation Plan**:
   - Follow the template in `workflows/plan.md`.
   - The plan MUST be in plain English so a non-technical team member can understand it.
   - Include: what will change, what files are affected, and any risks.

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

3. **For UI Changes**: Follow the `frontend-design` skill in `skills/frontend-design/SKILL.md`.

---

## Phase 4: Automated Testing & Quality Checks

**Goal**: Ensure the code compiles, lints, and formats correctly. Fix issues autonomously.

1. **Run Quality Checks** (in order):
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

2. **If Any Check Fails**:
   - Read the error output carefully.
   - Loop back to **Phase 3** and fix the issue.
   - Re-run the failing check.
   - **Maximum 3 fix-loops.** If still failing after 3 attempts, report the errors to the user with `notify_user`.

3. **Auto-Fix Shortcuts** (use first before manual fixes):
   // turbo

   ```bash
   npm run lint -- --fix
   ```

   // turbo

   ```bash
   npm run format
   ```

4. **Output**: All checks pass → report success to user.

---

## Phase 5: Git & PR Operations

> [!IMPORTANT]
> This phase is **only triggered when the user explicitly asks** (e.g., after local testing). Never auto-run git commands without user approval.

1. **Create a Branch**:
   - Feature: `feature/<short-description>` (e.g., `feature/add-calendar-tooltip`)
   - Bug Fix: `fix/<short-description>` (e.g., `fix/sidebar-toggle-ipad`)
   - Chore: `chore/<short-description>` (e.g., `chore/update-dependencies`)

   ```bash
   git checkout -b <branch-name>
   ```

2. **Run Code Review**:
   - Before committing, run the `/workflows/code_review.md` workflow to systematically review recent changes.
   - Address any feedback or issues caught during the review.

3. **Stage & Commit**:
   - Use **Conventional Commits**:
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

4. **Push & Open PR**:

   ```bash
   git push -u origin <branch-name>
   ```

   - After push, provide the user with the GitHub URL to create/view the PR.
   - If `gh` CLI is available, open the PR directly:

   ```bash
   gh pr create --title "<type>: <description>" --body "<summary of changes>" --base develop
   ```

5. **Post PR Review (Optional)**:
   - If requested, run the `/workflows/post_pr_review.md` workflow to post the code review feedback directly to the PR as inline comments.

---

## Quick Reference

| User Says                       | What Happens                               |
| ------------------------------- | ------------------------------------------ |
| _"Add a new feature..."_        | Run Phases 1–4, pause for local testing    |
| _"Fix this bug..."_             | Use `/debugging-agent` first, then Phase 4 |
| _"Check code quality"_          | Run Phase 4 only                           |
| _"Create a PR"_ / _"Push this"_ | Run Phase 5 only                           |
| _"Ship it"_                     | Run Phases 4 + 5                           |
