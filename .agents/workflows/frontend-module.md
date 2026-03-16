---
description: Create Frontend Module (Strategic Agent Flow)
---

# Create Frontend Module (Strategic Agent Flow)

**Purpose**: Execute a deterministic, multi-step process for building a new React/TS frontend module from scratch.
**Why it exists**: To prevent context pollution and ensure all modules include tests, self-review, and validation.
**Token Optimization Strategy**: Artifact-driven handoffs between steps.
**Execution Policy Guidance**: Verification commands should be run using terminal tools. Assume read-only commands are safe.

**INSTRUCTIONS**: Execute these steps sequentially. Do not skip ahead. Require user verification if unsure.

## 1. Research & Repository Reconnaissance (Role: Research Agent)

- Identify the target location for the new module within the feature-based folder structure.
- Execute a targeted file search (max 5-10 files) to find relevant existing types, UI components, or utilities.
- **Output**: A short markdown artifact `research_notes.md` containing compressed context (existing imports to use, CSS/styling patterns, folder path).
- **Halt condition**: If the architecture is unclear, stop and ask the user.

## 2. Implementation Plan Generation (Role: Planning Agent)

- Create or update the artifact `implementation_plan.md` detailing the proposed module architecture.
- Ensure the plan is extremely precise and relevant.
- **Wait for user review**: Yield execution and notify the user for review. Do not proceed to the next step until the user has explicitly approved the plan.
- **Output**: `implementation_plan.md` created or updated.

## 3. Implementation of Module (Role: Implementation Agent)

- Read ONLY the `research_notes.md` and `implementation_plan.md` artifacts and the specific user request. Do not re-scan the repo.
- Write the React component(s) and necessary TypeScript interfaces.
- Create the standard file structure:
  - `[ModuleName].tsx`
  - `index.ts` (for exporting)
  - `[ModuleName].types.ts` (if types are complex)
- **Output**: Created/Modified files.

## 4. Unit Test Creation (Role: Test Agent)

- Review the newly created component code.
- Create `[ModuleName].test.tsx` using React Testing Library.
- Ensure you are testing user-centric behaviors (rendering, clicking, error states).
- **Output**: Test file created.

## 5. Self Code Review (Role: Review Agent)

- Perform a comprehensive Code Review similar to a PR review. Check existing implementations and compare with new changes.
- Provide structured feedback, comments, and architectural critique for the code changes directly to the user.
- Review the implemented code against `rules/project_standards.md`.
- Check for:
  - TypeScript strictness (`any` usage).
  - Component size and complexity.
  - Correct use of React Testing Library.
- **Output**: Provide feedback comments and fix any critical issues found immediately.

## 6. Verification

- Run local verification checks in the terminal:
  - Typecheck: Run `npx tsc --noEmit`
  - Lint: Run the project's lint command targeting the new files.
  - Test: Run the specific test file created.
- **Checklist**:
  - [ ] Types pass
  - [ ] Linter passes
  - [ ] Tests pass
- **Output**: Terminal logs and fix any failures.

## 7. Structured Summary Output

- Generate a final response to the user formatted exactly as follows:
  - **Files Created**: List of absolute paths.
  - **Files Modified**: List of absolute paths.
  - **Commands to Run**: Any manual commands the user should run (e.g., `npm run dev` to see it).
  - **Risks & Follow-ups**: Notable tech debt, edge cases not covered, or architectural suggestions.
