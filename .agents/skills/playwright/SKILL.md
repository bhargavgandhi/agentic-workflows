---
name: Playwright E2E Engineer
description: Write, run, and debug end-to-end tests using Playwright. Covers test structure, selectors, POM, async handling, network mocking, and CI/CD integration.
---

# Playwright E2E Skill

**Role**: You are a Playwright automation engineer. You write reliable, maintainable, and fast E2E tests using `@playwright/test`.

---

## 1. Setup

```bash
# Install Playwright in an existing project
npm init playwright@latest

# Or add to an existing project
npm install -D @playwright/test
npx playwright install  # installs browsers
```

**Minimal `playwright.config.ts`**:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
```

---

## 2. Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature: User Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should log in with valid credentials', async ({ page }) => {
    // Arrange
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');

    // Act
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Assert
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('bad@example.com');
    await page.getByLabel('Password').fill('wrong');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});
```

---

## 3. Selector Strategy (Priority Order)

```typescript
// ✅ BEST: Role-based (most accessible and stable)
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
page.getByLabel('Username')

// ✅ GOOD: Test IDs (for complex UI without clear roles)
page.locator('[data-testid="submit-button"]')
page.locator('[data-cy="user-input"]')

// ✅ GOOD: Text content (for unique, stable text)
page.getByText('Confirm your order')
page.getByText(/welcome back/i)

// ⚠️ OK: Semantic attributes
page.locator('input[name="email"]')
page.locator('button[type="submit"]')

// ❌ AVOID: Classes / IDs (can change without warning)
page.locator('.btn-primary')
page.locator('#submit-btn')
```

**Advanced locator chaining**:
```typescript
// Filter rows containing specific text
const row = page.locator('tr').filter({ hasText: 'John Doe' });
await row.getByRole('button', { name: 'Edit' }).click();

// nth element
await page.locator('li').nth(2).click();
```

---

## 4. Page Object Model (POM)

Create one Page Object per page or major component:

```typescript
// tests/e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByTestId('error-message');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// Usage in test
test('login flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 5. Waiting Strategies

**Use Playwright's auto-waiting — never use `setTimeout`.**

```typescript
// ✅ Auto-waits for element to be actionable
await page.getByRole('button', { name: 'Submit' }).click();

// ✅ Wait for navigation after an action
await Promise.all([
  page.waitForURL('/dashboard'),
  page.getByRole('button', { name: 'Sign in' }).click(),
]);

// ✅ Wait for specific element state
await page.locator('.spinner').waitFor({ state: 'hidden' });
await page.locator('.result').waitFor({ state: 'visible' });

// ✅ Wait for network request to complete
await page.waitForResponse('**/api/data');
```

---

## 6. Assertions

```typescript
// URL and title
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveTitle('My App - Dashboard');

// Element visibility
await expect(page.locator('.alert')).toBeVisible();
await expect(page.locator('.modal')).toBeHidden();

// Text content
await expect(page.locator('h1')).toHaveText('Welcome');
await expect(page.locator('h1')).toContainText('Welc');

// Input values
await expect(page.locator('input[name="email"]')).toHaveValue('user@example.com');

// Count
await expect(page.locator('li')).toHaveCount(5);

// Attribute
await expect(page.locator('button')).toHaveAttribute('disabled');
```

---

## 7. Network & API Mocking

```typescript
// Mock an API response
await page.route('**/api/users', (route) => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 1, name: 'Test User' }]),
  });
});

// Intercept and modify a request
await page.route('**/api/cart', (route) => {
  route.fulfill({ status: 500 });
});
```

---

## 8. Authentication Reuse (Avoid Logging in Per Test)

Using `storageState` to reuse a session:
```typescript
// auth.setup.ts (run once before all tests)
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER!);
  await page.getByLabel('Password').fill(process.env.TEST_PASS!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.context().storageState({ path: '.auth/user.json' });
});
```

```typescript
// In your test file, apply saved auth state
test.use({ storageState: '.auth/user.json' });
```

---

## 9. Workflow Rules

1. **Detect first**: When testing localhost, **always** check which port the dev server is running on before writing test code.
2. **Visible browser**: Always use `headless: false` during development for visibility. Only use `headless: true` in CI.
3. **Placement**: Put all Playwright tests in `tests/e2e/`. Use `.spec.ts` extension.
4. **Isolation**: Each test must be independent. Never share state between tests.
5. **Use POM**: For any non-trivial flow with more than 2–3 interactions, use a Page Object.
6. **Selectors**: Prefer `getByRole` and `getByLabel`. Only use `data-testid` as a fallback.
7. **No `waitForTimeout`**: Never use `page.waitForTimeout()`. Always wait for a specific state or response.
8. **Run & Validate**: Always run the specific test after writing it: `npx playwright test <file> --headed`. Fix any failures before moving on.
9. **Debugging**: Use `npx playwright test --debug` or `await page.pause()` for interactive debugging.

---

## 10. Error Handling

Always wrap automation scripts in try-catch, especially for flaky flows:

```typescript
test('resilient test with screenshot on failure', async ({ page }) => {
  try {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  } catch (error) {
    await page.screenshot({ path: '/tmp/failure-screenshot.png', fullPage: true });
    throw error;  // Re-throw so the test still fails
  }
});
```

For Playwright config-level screenshots on all failures:
```typescript
// playwright.config.ts — already covered:
use: {
  screenshot: 'only-on-failure',
  trace: 'on-first-retry',
}
```

---

## 11. Debugging

```bash
# Interactive debug mode (pauses at each step)
npx playwright test --debug

# Run with visible browser and slow motion
npx playwright test --headed

# Use slowMo to make actions visible
const browser = await chromium.launch({ headless: false, slowMo: 100 });

# Show trace viewer after failure
npx playwright show-trace trace.zip
```

In-code debugging pause (useful with `--debug` flag):
```typescript
await page.pause();  // Opens Playwright Inspector
```

---

## 12. Troubleshooting

| Problem | Fix |
|---|---|
| `Playwright not installed` | Run `npx playwright install` to install browsers |
| `Element not found` timeout | Add explicit wait: `await page.locator('.el').waitFor({ timeout: 10000 })` |
| `Browser doesn't open` | Ensure `headless: false` and that a display is available |
| `Test is flaky` | Use `retries: 2` in config; check for race conditions in auto-waiting |
| `Authentication fails in CI` | Use `storageState` to reuse saved session (see Section 8) |
| `npx playwright test` doesn't find tests | Confirm `testDir` in config matches your folder structure |
