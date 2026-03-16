---
description: An interactive plan that uses specialized sub-agent personas and iterative user questioning to build complex features.
---

# Interactive Plan Workflow

> **Purpose**: Use this workflow when you have a vague or complex idea that needs to be refined interactively before any coding begins. It guides the AI to act as an orchestrator that delegates tasks to specialized "Sub-Agent Personas" in sequence.

---

## Phase 1: The Discovery Agent (Interactive Loop)

**Role**: Product Manager & Requirements Gatherer
**Goal**: Iterate with the user to uncover missing requirements.

1. **Initial Assessment**: Read the user's initial request.
2. **Codebase Context First**: Before asking questions, scan the codebase for relevant context:
   - Read `PRODUCT_DOCUMENTATION.md` and `TECHNICAL_DOCUMENTATION.md` if they exist.
   - Read any relevant files in `.agent/docs/` (e.g., `app_flow.md`, `leader_flow.md`).
   - Use `Grep` to check if a similar feature or component already exists.
   - This prevents asking questions already answered by existing documentation.
3. **Interactive Questioning**: Do not write any code yet. Use the `notify_user` tool to ask 2-3 highly targeted questions about:
   - Edge cases (e.g., "What happens if this data is empty?")
   - Design/UX preferences (e.g., "Should this be a modal or a new page?")
   - Business logic constraints
4. **Iterate**: Wait for the user's response. If the answers reveal more ambiguity, ask another round of questions. **Maximum 3 rounds of questioning.** If ambiguity remains after 3 rounds, make reasonable assumptions, document them explicitly, and proceed.
5. **Handoff**: Once clear, output a `requirements_spec.md` artifact and move to Phase 2.

---

## Phase 2: The Architecture Agent

**Role**: Senior Staff Engineer
**Goal**: Design the technical implementation plan.

1. **Analyze Requirements**: Read the `requirements_spec.md`.
2. **System Reconnaissance**: Use `grep_search` to find where this new feature fits into the existing repo architecture.
3. **Draft Plan**: Create an `implementation_plan.md` detailing exact files to create/modify and the data flow.
4. **Approval**: Use `notify_user` to mandate the user's go-ahead on the architecture plan.

---

## Phase 3: The Implementation Agents (Parallel Execution)

**Role**: Frontend Developer & API Developer
**Goal**: Write the code safely.

_The AI will now execute the plan, adopting specific skills:_

1. **API/State Agent Task**: Invoke the `api-integration` skill to scaffold Redux/Firebase connections.
2. **UI Agent Task**: Invoke the `react-component-scaffolder` skill to create boilerplate, and the `frontend-design` skill to build the UI with Tailwind.
3. **Check**: Run `npx tsc --noEmit` and `npm run lint` continuously during this phase.

---

## Phase 4: The QA & Review Agent

**Role**: Quality Assurance & Code Reviewer
**Goal**: Find flaws in the Implementation Agent's work.

1. **Self-Review**: Invoke the `code-reviewer` skill internally against the newly written files.
2. **Self-Correction**: Fix any issues found during the self-review without bothering the user.
3. **Test Writing**: Invoke the `test-writing` skill to create a `.test.tsx` file for robust coverage.
4. **Final Handoff**: Give the user a summary of what was built, what decisions were made, and instructions to test it locally.

---

## Phase 5: Git & PR Operations

> [!IMPORTANT]
> This phase is **only triggered when the user explicitly asks** (e.g., "push this", "create a PR"). Never auto-run git commands without user approval.

1. **Run Code Review**: Before committing, run the `.agent/workflows/code_review.md` workflow against all changed files. Address any issues found.

2. **Create a Branch** (if not already on a feature branch):
   - Feature: `feature/<short-description>`
   - Bug Fix: `fix/<short-description>`

   ```bash
   git checkout -b <branch-name>
   ```

3. **Stage & Commit** using Conventional Commits:
   - `feat: <description>` — New feature
   - `fix: <description>` — Bug fix
   - `refactor: <description>` — Code restructure

   ```bash
   git add <specific-files>
   git commit -m "<type>: <description>"
   ```

4. **Push & Open PR**:

   ```bash
   git push -u origin <branch-name>
   gh pr create --title "<type>: <description>" --body "<summary>" --base develop
   ```

5. **Post PR Review (Optional)**: If requested, run `.agent/workflows/post_pr_review.md` to post inline review comments on the PR.
