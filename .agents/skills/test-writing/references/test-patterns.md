# Test Patterns Guide

## Unit Test Protocol (`.test.tsx` or `.test.ts`)
- Use React Testing Library + Vitest.
- Group tests using `describe` blocks.
- Test user behaviors (aria-roles, clicking, typing), NOT implementation details (e.g., don't test Redux state directly in a UI test, test the rendered output).
- Mock Firebase Auth/API calls using MSW or Jest/Vitest mocks if necessary.
- Provide accessible test ids (`data-testid`) only as a fallback.

## E2E Protocol (`.spec.ts`)
- Use Playwright.
- Use the Page Object Model (POM) pattern if the test is complex.
- Ensure tests are resilient by using `locator.getByRole`, `locator.getByText` rather than rigid CSS selectors.
