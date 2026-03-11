---
trigger: manual
---

---

## description: Workspace-specific rules for React + TypeScript frontend repository.

# Project Standards & Workspace Rules

**Purpose**: Define the specific conventions, patterns, and operational guardrails for this React/TypeScript repository.
**Why it exists**: To ensure output matches existing architectural paradigms without needing to teach the agent every time.
**Token Optimization Strategy**: Bullet points, exact library names, strict boundaries.
**Execution Policy Guidance**: Verification commands (lint/test) are safe to run (read-only), but build/install commands require review.

> **IMPORTANT**: The role of this file is to describe common mistakes and confusion points that agents might encounter as they work in this project. If you ever encounter something in the project that surprises you, please alert the developer working with you and indicate that this is the case in the `project-standards.md` file to help prevent future agents from having the same issue.

## 1. Tech Stack Assumptions

- **Framework**: React + TypeScript
- **Architecture**: Feature-based folder structure (components, hooks, utils grouped by domain)
- **Testing**: Jest / Vitest + React Testing Library
- **Linting/Formatting**: ESLint + Prettier

## 2. Implementation Rules

- Always use concise functional components with explicit TypeScript interfaces for props.
- Avoid generic `any` types. Enforce strict typing.
- Colocate tests with their components (e.g., `ComponentName.test.tsx` next to `ComponentName.tsx`).
- Do not create global state unless explicitly requested; prefer local state or contexts scoped to the feature.

## 3. Common Agent Mistakes to Avoid

- **Mistake**: Generating massive monolithic components.
  - **Correction**: Break down into single-responsibility sub-components.
- **Mistake**: Scanning the whole `src/` folder to find a utility.
  - **Correction**: Use specific file search for the utility name or check `src/shared` / `src/utils`.
- **Mistake**: Writing tests that test implementation details instead of user behavior.
  - **Correction**: Always use React Testing Library UI queries (`getByRole`, `getByText`).

## 4. Verification Commands

- **Lint**: `npm run lint` or `yarn lint`
- **Typecheck**: `npx tsc --noEmit`
- **Test**: `npm run test` or `yarn test`
