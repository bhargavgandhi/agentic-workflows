---
description: You are an expert test writing agent specialized in creating comprehensive, maintainable, and meaningful tests. Apply systematic reasoning to ensure proper test coverage and quality. This workflow covers both Vitest unit/integration tests and Playwright E2E tests for the yog-web application.
---

# Test Writing Workflow — yog-web

This project uses two test frameworks:

| Layer                  | Framework                      | Config                           | Test Directory           | Run Command           |
| ---------------------- | ------------------------------ | -------------------------------- | ------------------------ | --------------------- |
| **Unit / Integration** | Vitest + React Testing Library | `vite.config.ts` (Vitest plugin) | `src/**/*.test.ts(x)`    | `npx vitest run`      |
| **E2E**                | Playwright                     | `playwright.config.ts`           | `tests/e2e/**/*.spec.ts` | `npx playwright test` |

> **Current state:** Playwright is installed (`@playwright/test ^1.58.1`), config exists. Vitest and React Testing Library are NOT yet installed — install them before writing unit tests (see Setup section).

---

## Part 1: Unit & Integration Tests (Vitest)

### Setup (if not yet installed)

```bash
// turbo
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Add to `vite.config.ts`:

```ts
/// <reference types="vitest" />
export default defineConfig({
  // ...existing config
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
    css: true,
  },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom";
```

### What to Test (Priority Order)

1. 🔴 **Redux Slices & Thunks** — `attendeesSlice`, `paymentSlice`, `submitRegistrationThunk`, `processPaymentThunk`
2. 🔴 **Pure Business Logic** — `buildPaymentBreakdown`, `calculateSavingAmount`, `mapAttendeeToApi`, `sortAttendeeListByStatus`
3. 🟠 **Custom Hooks** — `useShibirEventFlags`, `useFetchCalculateEstimate`, `useEventAttendeesQuery`
4. 🟡 **Utility Functions** — `userState` helpers (`isUserPaid`, `getMemberDisplayStatus`), `getDiscountAmount`
5. 🟢 **Components (behaviour-focused)** — `RegistrationInfoListItem` toggles, `ReviewRegistrationListItem` badge rendering, `ManageButton` conditional display

### File Placement Convention

Place test files **next to** the source file they test:

```
src/core/store/attendees/attendeesSlice.ts
src/core/store/attendees/attendeesSlice.test.ts

src/features/events/components/Payment/buildPaymentBreakdown.ts
src/features/events/components/Payment/buildPaymentBreakdown.test.ts
```

### Test Structure

```ts
import { describe, it, expect, vi } from "vitest";

describe("[ModuleName]", () => {
  describe("[functionName]", () => {
    it("should [expected behavior] when [condition]", () => {
      // Arrange
      const input = {
        /* ... */
      };

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
```

### Mocking Strategy for This Project

| Dependency                                      | How to Mock                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **API calls** (`apiClient`, `registrationAPIs`) | `vi.mock('@/core/api/registrationAPIs')`                                                   |
| **Redux store**                                 | Use `configureStore` with real reducers for slice tests; use `vi.mock` for component tests |
| **React Query**                                 | Mock the query hooks with `vi.mock('@/core/hooks/useEventAttendeesQuery')`                 |
| **React Router**                                | `vi.mock('react-router-dom', ...)` — mock `useParams`, `useNavigate`, `useSearchParams`    |
| **GrowthBook**                                  | `vi.mock('@/core/hooks/useFeatureFlag')` — control feature flag returns                    |
| **Stripe**                                      | `vi.mock('@stripe/react-stripe-js')` and `vi.mock('@stripe/stripe-js')`                    |

### Example: Testing `buildPaymentBreakdown`

```ts
import { describe, it, expect } from "vitest";
import { buildPaymentBreakdown } from "./buildPaymentBreakdown";

describe("buildPaymentBreakdown", () => {
  const baseMember = {
    _id: "1",
    seva: 175,
    data: { hasMysteryGift: false },
  };

  it("should include shibir seva when baseAmount and total exist", () => {
    const result = buildPaymentBreakdown({
      paymentMembers: [baseMember],
      paymentRules: { baseAmount: 175 },
    });
    expect(result.itemizedList).toContainEqual(
      expect.objectContaining({ name: "Shibir Seva", amount: 175 }),
    );
  });

  it("should add mystery box line item when member has gift", () => {
    const result = buildPaymentBreakdown({
      paymentMembers: [{ ...baseMember, data: { hasMysteryGift: true } }],
      mysteryBoxSeva: 25,
      paymentRules: { baseAmount: 175 },
    });
    expect(result.itemizedList).toContainEqual(
      expect.objectContaining({ name: "Mystery Box", amount: 25 }),
    );
  });
});
```

### Principles

- **Test behaviour, not implementation** — assert outputs and side effects, not internal state
- **AAA pattern** — Arrange, Act, Assert in every test
- **Independence** — tests must not depend on each other's state
- **Naming** — `should_[expected]_when_[condition]`
- **One assertion per concept** — multiple `expect()` calls are fine if testing the same logical concept
- **Realistic mock data** — use shapes that match actual API responses / Redux state

---

## Part 2: E2E Tests (Playwright)

### Config Notes

The Playwright config is at `playwright.config.ts`:

- **Test dir:** `./tests/e2e`
- **Base URL:** Currently set to `http://localhost:5173` — update to `http://localhost:3002` to match `vite.config.ts`
- **Browsers:** Chromium, Firefox, WebKit
- **Retries in CI:** 2
- **Trace:** On first retry

### File Placement Convention

```
tests/
  e2e/
    registration/
      event-details.spec.ts
      attendee-selection.spec.ts
      registration-info.spec.ts
      review-registration.spec.ts
    payment/
      payment-overview.spec.ts
      make-payment.spec.ts
    fixtures/
      auth.ts           # Authentication helpers
      test-data.ts       # Shared test data
    page-objects/
      EventDetailsPage.ts
      AttendeesPage.ts
      RegistrationInfoPage.ts
      ReviewRegistrationPage.ts
      PaymentOverviewPage.ts
      MakePaymentPage.ts
```

### Critical User Journeys to Test (Priority)

1. 🔴 **RSVP Flow:** Open event → Click "I will attend" → Fill member details modal → Save → Lands on attendees page
2. 🔴 **Family Registration:** Attendee selection → Registration Info → Review → T&C → Complete
3. 🔴 **Payment Flow:** Payment Overview → (Early Bird) → Sponsor Youth → Make Payment → Success
4. 🟠 **Returning User:** Edit existing registration → Submit directly from Review (bypass T&C)
5. 🟡 **Guest Registration:** Same flow but with `?type=guest` param
6. 🟡 **Mystery Box Toggle:** Toggle on Registration Info page → Verify on Review page → Verify in Payment Breakdown

### Test Structure

```ts
import { test, expect } from "@playwright/test";

test.describe("Registration Flow", () => {
  test("should complete RSVP and navigate to attendees", async ({ page }) => {
    // Navigate
    await page.goto("/events/test-event-id");

    // RSVP
    await page.getByRole("button", { name: /I will attend/i }).click();

    // Fill modal
    await page.getByLabel("First Name").fill("John");
    await page.getByRole("button", { name: /save/i }).click();

    // Assert navigation
    await expect(page).toHaveURL(/registration\/attendees/);
  });
});
```

### Page Object Model Example

```ts
// tests/e2e/page-objects/EventDetailsPage.ts
import { type Page, type Locator, expect } from "@playwright/test";

export class EventDetailsPage {
  readonly page: Page;
  readonly rsvpButton: Locator;
  readonly memberDetailsModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.rsvpButton = page.getByRole("button", { name: /I will attend/i });
    this.memberDetailsModal = page.getByRole("dialog");
  }

  async goto(eventId: string) {
    await this.page.goto(`/events/${eventId}`);
  }

  async rsvp() {
    await this.rsvpButton.click();
    await expect(this.memberDetailsModal).toBeVisible();
  }
}
```

### Selector Strategy for This App

| Priority | Selector     | Example                                         |
| -------- | ------------ | ----------------------------------------------- |
| 1st      | Role + Name  | `page.getByRole('button', { name: 'CONFIRM' })` |
| 2nd      | Text content | `page.getByText('Review Registration')`         |
| 3rd      | Label        | `page.getByLabel('Need accommodation?')`        |
| 4th      | Test ID      | `page.getByTestId('attendee-card-123')`         |
| ❌ Avoid | CSS classes  | `page.locator('.bg-[#5c3d2e]')`                 |

### Authentication Strategy

For authenticated pages, bypass the UI login:

```ts
// tests/e2e/fixtures/auth.ts
import { test as base } from "@playwright/test";

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Set auth token directly via localStorage/cookie
    await page.goto("/");
    await page.evaluate((token) => {
      localStorage.setItem("authToken", token);
    }, process.env.TEST_AUTH_TOKEN);
    await use(page);
  },
});
```

### Best Practices

- **Isolate state** — each test starts with a clean context (fresh login, no stale Redux)
- **Wait for API responses** — use `page.waitForResponse()` instead of arbitrary timeouts
- **Network interception** — use `page.route()` to mock API responses for deterministic tests
- **Assertions before actions** — always assert the page is in the expected state before clicking
- **Screenshots on failure** — enabled by default in Playwright
- **Trace viewer** — use `npx playwright show-trace trace.zip` to debug failures

### Run Commands

```bash
# Run all E2E tests
// turbo
npx playwright test

# Run specific test file
// turbo
npx playwright test tests/e2e/registration/event-details.spec.ts

# Run in headed mode (watch the browser)
npx playwright test --headed

# Run with UI mode (interactive debugging)
npx playwright test --ui

# Generate test code from browser actions
npx playwright codegen http://localhost:3002

# View last test report
// turbo
npx playwright show-report
```

---

## Part 3: Shared Principles (Both Layers)

### Test Case Identification

For every unit/function/flow, systematically identify:

1. **Happy Path** — Normal expected usage
2. **Edge Cases** — Empty inputs, boundary values, single-element collections, max values
3. **Error Cases** — Invalid inputs, network failures, missing params, permission denied
4. **Async Cases** — Race conditions, timeout handling, promise rejection

### Test Quality Criteria

- **Independent:** Tests don't depend on each other
- **Repeatable:** Same result every time
- **Fast:** Unit tests = milliseconds, E2E tests = seconds
- **Readable:** Test name describes what's being tested
- **Focused:** One logical concept per test

### Coverage Strategy

| Priority        | What                                        | Layer            |
| --------------- | ------------------------------------------- | ---------------- |
| 🔴 Critical     | Registration submission, payment processing | E2E + Unit       |
| 🔴 Critical     | `buildPaymentBreakdown`, Redux thunks       | Unit             |
| 🟠 Important    | Feature flag gating, early bird logic       | Unit             |
| 🟡 Nice-to-have | UI badge rendering, toggle animations       | Unit (component) |
| 🟢 Growth       | Cross-browser E2E, mobile viewport tests    | E2E              |

### Anti-Patterns to Avoid

- ❌ Testing implementation details (CSS classes, internal state)
- ❌ Flaky tests that sometimes pass/fail
- ❌ Tests with no assertions
- ❌ Hard-coded IDs or data that could change
- ❌ Arbitrary `sleep()` or `setTimeout()` waits
- ❌ Testing third-party library behaviour (Stripe, React Query internals)
- ❌ Snapshot tests for dynamic content
