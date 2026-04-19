---
name: add-test-suite
description: Write comprehensive tests for an existing module or component
parameters:
  - name: target
    type: text
    description: What module, component, or feature do you want to test? (e.g. "EventModal component", "auth service", "checkout flow")
    default: MyComponent
  - name: test_type
    type: select
    options: [unit, integration, e2e, all]
    default: all
    description: What kind of tests should we write?
  - name: coverage_focus
    type: text
    description: Any specific edge cases or scenarios to prioritize?
    default: happy path, empty states, error states, user interactions
skills_required:
  - test-writing
  - playwright
workflow: build-feature
tags: [testing, vitest, playwright, unit, e2e, coverage]
---

## Task: Write Test Suite for "{{target}}"

**Test types:** {{test_type}}  
**Coverage focus:** {{coverage_focus}}

### What to build

Research the target first:
1. Locate all files related to "{{target}}"
2. Understand what the code does, its inputs, outputs, and side effects
3. Identify untested code paths

Then write tests:

**Unit / Integration tests** (if `{{test_type}}` is `unit`, `integration`, or `all`):
- Test the happy path first
- Test: {{coverage_focus}}
- Mock all external dependencies (API calls, database, auth)
- Cover error states and boundary conditions
- Co-locate test files with source files (`*.test.ts` or `*.test.tsx`)

**E2E tests** (if `{{test_type}}` is `e2e` or `all`):
- Write Playwright tests for user-facing flows
- Use data-testid selectors (avoid CSS/text selectors)
- Test from the user's perspective (what does the user see and do?)
- Include accessibility checks where applicable

### Standards to follow

- Follow the `test-writing` skill for all test conventions
- Follow the `playwright` skill for all E2E conventions
- Tests must be deterministic — no random data, no time-sensitive assertions
- Each test should be independent (no shared state between tests)
