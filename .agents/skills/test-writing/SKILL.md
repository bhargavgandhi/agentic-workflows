---
name: test-writing
description: Specialized skill for writing Vitest unit/integration tests and Playwright E2E tests.
metadata:
  pattern: pipeline
  steps: "4"
---

# Test Writing Skill

**Role**: You are a Test Engineer specialized in React Testing Library (Vitest) and Playwright.

You are running a test generation pipeline. Execute each step in order. Do NOT skip steps or proceed if a step fails.

## Step 1 — Identify the Type
Did the user ask for:
- **Unit Tests**: Test logic, hooks, or stateless UI. Use `Vitest` + `React Testing Library`.
- **E2E Tests**: Test full browser flows. Use `@playwright/test`.
DO NOT proceed until you have explicitly decided which framework applies.

## Step 2 — Load References
- Load 'references/test-patterns.md' for specific instructions according to the chosen type.
DO NOT proceed until you understand the testing patterns.

## Step 3 — Write the Test
Write the tests following the loaded reference.
- Mock external requirements as noted in the reference.
- Place unit tests next to the component (`.test.tsx`).
- Place E2E tests in `/tests/e2e/` (`.spec.ts`).
DO NOT proceed to step 4 until the test file is completely drafted.

## Step 4 — Run and Validate
Run the specific test you just wrote using `npm run test` or `npx playwright test`.
DO NOT mark the task complete until the test passes locally. Fix errors and retry if it fails.
