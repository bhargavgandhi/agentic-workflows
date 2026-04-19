---
name: test-writing
description: Writes Vitest unit/integration tests and Playwright E2E tests following TDD discipline. Use when writing new tests or when implementing a slice test-first.
version: 2.0.0
category: process
optional: false
phase: 4
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- `/test` slash command is issued
- A new slice is started in `incremental-implementation` (write the test first)
- Phase 5 of `/build-feature` (quality gate — test coverage check)
- User says "write tests", "add test coverage", or "this needs tests"
- A bug is fixed and a regression test is needed

## 2. Prerequisites

- The feature or component to be tested exists (or its interface is defined for TDD)
- Test framework installed: Vitest (unit) or Playwright (E2E)
- `references/test-patterns.md` available

## 3. Steps

Execute each step in order. Do NOT skip steps or proceed if a step fails.

### Step 1 — Identify Test Type
Determine which framework applies:
- **Unit/Integration Tests**: testing logic, hooks, or UI in isolation → use `Vitest` + `React Testing Library`
- **E2E Tests**: testing full browser flows across multiple pages → use `@playwright/test`

For TDD (writing the test before implementation):
- Write the test for the user-visible behaviour described in the slice goal
- The test must fail initially (for the right reason, not a setup error)
- Implementation is written to make this test pass

### Step 2 — Load References
Read `references/test-patterns.md` for framework-specific patterns, file placement, and mock conventions. Do not proceed without understanding the applicable patterns.

### Step 3 — Write the Test
Follow the TDD / behaviour-driven approach:
- Test **user-visible behaviour**, not implementation details
- Use React Testing Library queries: `getByRole`, `getByText`, `getByLabelText` — not `getByTestId` (last resort)
- One `describe` block per component/feature; one `it` block per behaviour
- Mock only at system boundaries (API calls, external services) — not internal functions
- Place unit tests co-located: `ComponentName.test.tsx` next to `ComponentName.tsx`
- Place E2E tests in `/tests/e2e/` as `feature-name.spec.ts`

Test structure (unit):
```ts
describe('ComponentName', () => {
  it('shows error message when form submitted empty', async () => {
    render(<ComponentName />);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
```

### Step 4 — Run and Validate
Run the specific test you just wrote:
- Unit: `npm run test -- --run ComponentName.test.tsx`
- E2E: `npx playwright test tests/e2e/feature-name.spec.ts`

Do NOT mark complete until the test passes. Fix errors and retry. If the test cannot be made to pass, report the blocker to the user.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll test implementation details so the test is more specific" | Tests that test implementation details break on refactors. Test behaviour. |
| "I'll use `getByTestId` for easy selection" | `getByTestId` tests the DOM structure, not user behaviour. Use semantic queries. |
| "The test is written, I'll run it later" | A test that hasn't been run hasn't been validated. Run it now. |
| "Mocking the internal function makes the test cleaner" | Mock at boundaries, not internals. Internal mocking means you're testing the mock. |
| "Coverage is at 80%, we're fine" | 80% average can hide 0% coverage on critical paths. Check what's covered, not just the number. |

## 5. Red Flags

Signs this skill is being violated:

- Tests written after implementation is already "done"
- `getByTestId` used as the primary selection strategy
- Tests asserting on CSS classes, internal state, or implementation details
- Tests not run after being written
- Mocks placed on internal functions instead of at API/service boundaries
- Test file not co-located with the component it tests (unit tests)

## 6. Verification Gate

Before marking test writing complete:

- [ ] Test type determined (unit vs E2E)
- [ ] `references/test-patterns.md` consulted
- [ ] Tests use semantic queries (`getByRole`, `getByText`, `getByLabelText`)
- [ ] Mocks placed only at system boundaries
- [ ] Test file placed in correct location (co-located for unit, `/tests/e2e/` for E2E)
- [ ] Test run and passing locally
- [ ] No previously passing tests broken by the new test setup

## 7. References

- [test-patterns.md](references/test-patterns.md) — Vitest and Playwright patterns, mock conventions
