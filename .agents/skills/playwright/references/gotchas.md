# Playwright Gotchas

1. **Using `waitForTimeout` instead of state-based waiting**: `page.waitForTimeout(5000)` causes massive flakiness in CI. Always wait for specific elements to become visible or for network requests to finish (`page.waitForResponse(...)`).
2. **CSS Selectors over Role-based Selectors**: Using `page.locator('.btn-primary')` will randomly break when UI libraries change classes. Always use `page.getByRole('button', { name: 'Submit' })`.
3. **Running headed in CI**: Forgetting to set `headless: true` when executing in CI environments without xvfb leads to crashes. 
4. **Leaking state across tests**: Relying on database state left by the previous test instead of cleaning up or arranging data in a `beforeEach` hook. Plays havoc with parallel execution.
