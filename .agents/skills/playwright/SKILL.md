---
name: playwright
description: Write, run, and debug end-to-end tests using Playwright. Covers test structure, selectors, POM, async handling, network mocking, and CI/CD integration.
version: 2.0.0
category: technology
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- Writing new end-to-end tests for any web feature
- Migrating an existing test suite to Playwright
- Debugging a flaky or broken E2E test
- Setting up Playwright in a new project (config, CI integration)
- Implementing authentication reuse or network mocking strategies

## 2. Prerequisites

- `@playwright/test` installed and browsers downloaded (`npx playwright install`)
- `playwright.config.ts` present at project root with `baseURL`, `testDir`, and retry settings
- Dev server start command known (and port confirmed before writing tests)

## 3. Steps

### Step 1: Confirm the Dev Server Port
Before writing a single line of test code, verify which port the dev server runs on. Do not assume `3000` or `8080`. Run or read the start script.

### Step 2: Choose the Right Selector
Follow this priority order — top to bottom:

1. `getByRole('button', { name: 'Submit' })` — most stable, tests accessibility
2. `getByLabel('Email')` — for form inputs
3. `getByText('Confirm order')` — for unique stable text
4. `locator('[data-testid="submit-btn"]')` — fallback when no semantic target exists
5. `locator('.btn-primary')` — **never** use; classes change without notice

### Step 3: Structure Tests with Page Object Model (POM)
For any flow with more than 2–3 interactions, extract a Page Object:

```ts
// tests/e2e/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}
  readonly emailInput = this.page.getByLabel('Email');
  readonly submitButton = this.page.getByRole('button', { name: 'Sign in' });

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.submitButton.click();
  }
}
```

POMs hold locators and actions. Assertions stay in the `.spec.ts` file.

### Step 4: Use Auto-Waiting — Never `waitForTimeout`
Playwright auto-waits for elements to be actionable. Use explicit state waits when you need to block:

```ts
// ✅ Wait for spinner to disappear
await page.locator('.spinner').waitFor({ state: 'hidden' });

// ✅ Wait for navigation after click
await Promise.all([
  page.waitForURL('/dashboard'),
  page.getByRole('button', { name: 'Sign in' }).click(),
]);

// ❌ Never do this
await page.waitForTimeout(2000);
```

### Step 5: Reuse Auth State Across Tests
Never log in on every test — use `storageState`:

```ts
// auth.setup.ts
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER!);
  await page.getByLabel('Password').fill(process.env.TEST_PASS!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.context().storageState({ path: '.auth/user.json' });
});
```

Apply in test files: `test.use({ storageState: '.auth/user.json' });`

### Step 6: Configure for CI
```ts
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
```

### Step 7: Run and Validate Before Marking Done
```bash
npx playwright test tests/e2e/login.spec.ts --headed
```
Fix any failures before marking the task complete.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll use `waitForTimeout(2000)` just to be safe" | Timeouts cause both flakiness and slow tests. Use `waitFor({ state })` or `waitForURL` — Playwright knows when actions complete. |
| "I'll use `.btn-primary` selector, it's shorter" | CSS classes are refactor targets. A renamed class silently breaks the test. Use `getByRole` or `data-testid`. |
| "I'll log in at the start of every test for isolation" | Repeated logins are slow and flaky. Use `storageState` to reuse auth sessions. |
| "The POM adds boilerplate, I'll inline the locators in the test" | Inlined locators duplicate across tests. When the UI changes, every test breaks separately. |
| "I don't need retries, the test should just pass" | Network timing and CI environments introduce non-determinism. Always configure retries in CI. |

## 5. Red Flags

Signs this skill is being violated:

- `page.waitForTimeout()` used anywhere in the test suite
- Selectors use CSS class names (`.btn-primary`, `#submit`)
- Every test file re-implements a login flow instead of using `storageState`
- No Page Object exists for flows with 3+ interactions
- `playwright.config.ts` missing `retries` for CI
- Dev server port hard-coded without verification

## 6. Verification Gate

Before marking Playwright work complete:

- [ ] Dev server port verified before test code was written
- [ ] Selectors use `getByRole`, `getByLabel`, or `getByText` — no CSS classes
- [ ] POM created for any flow with 3+ interactions
- [ ] No `waitForTimeout` calls — replaced with explicit state waits
- [ ] Auth state reused via `storageState` if login is required
- [ ] `retries: 2` set for CI in `playwright.config.ts`
- [ ] Tests run locally and pass: `npx playwright test --headed`

## 7. References

- [playwright-config.md](references/playwright-config.md) — Config file patterns and CI setup
- [pom-patterns.md](references/pom-patterns.md) — Page Object Model conventions
- [auth-reuse.md](references/auth-reuse.md) — storageState and global setup
