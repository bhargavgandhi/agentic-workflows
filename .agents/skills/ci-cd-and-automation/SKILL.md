---
name: ci-cd-and-automation
description: Shift Left quality gates, CI pipeline design, feature flags for safe deployment.
version: 1.0.0
category: process
optional: false
phase: 5
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- `/ship` slash command is issued
- A new feature is about to be merged to the main branch
- Setting up a CI/CD pipeline for a new project
- Adding a new quality gate (lint, test, security scan) to an existing pipeline
- Implementing a feature that needs a feature flag for gradual rollout

## 2. Prerequisites

- Code is committed and reviewed
- Test suite exists and passes locally
- Repository access to create/modify CI config files (`.github/workflows/`, etc.)

## 3. Steps

### 3a. Shift Left — Move Quality Checks Earlier

The Shift Left principle: catch defects as early as possible in the development cycle. Apply these gates in order (fastest first):

1. **Pre-commit hooks** — lint + type-check (< 5 seconds). Run before every commit.
2. **PR checks** — unit tests + integration tests (< 3 minutes). Block merge on failure.
3. **Pre-merge checks** — E2E tests + security scan (< 10 minutes). Run on PR approval.
4. **Post-merge checks** — performance benchmarks, full E2E suite. Non-blocking on merge, blocking on deploy.

### 3b. CI Pipeline Design

A complete pipeline has these stages in order:

```
Stage 1: Install & Cache
  → npm ci (not npm install)
  → Cache node_modules by package-lock.json hash

Stage 2: Static Analysis (parallel)
  → Lint (ESLint)
  → Type check (tsc --noEmit)
  → Format check (Prettier)

Stage 3: Tests (parallel)
  → Unit tests with coverage report
  → Integration tests

Stage 4: Security
  → npm audit --audit-level=high
  → Dependency licence check (if required)

Stage 5: Build
  → Production build
  → Bundle size check (fail if > threshold)

Stage 6: E2E (on PR to main/staging only)
  → Playwright tests against preview deployment

Stage 7: Deploy (main branch only, after all stages pass)
  → Deploy to staging
  → Smoke test
  → Deploy to production (manual gate or auto)
```

### 3c. Feature Flags

Use feature flags when:
- A feature affects a large portion of users
- A feature has a dependency on a backend change not yet deployed
- A gradual rollout is needed (10% → 50% → 100%)
- A kill switch is needed for quick rollback without a deploy

Feature flag rules:
- Flag names use the format `feat_<feature_slug>` (e.g. `feat_new_checkout`)
- Default state is `off` (new features start disabled)
- Flags are removed within 2 sprints of reaching 100% rollout
- Never commit code that only works with a flag permanently enabled

### 3d. Quality Gate Thresholds

Define these explicitly in CI config — do not leave as defaults:

| Gate | Recommended Threshold |
|------|-----------------------|
| Test coverage | ≥ 80% lines for new code |
| Bundle size increase | ≤ 5% vs main branch |
| npm audit severity | Block on Critical and High |
| Lighthouse performance score | ≥ 80 (for user-facing pages) |
| Build time | Alert if > 10 minutes |

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "CI is set up already, I don't need to add a gate for this" | New features introduce new failure modes. Add the gate. |
| "The tests pass locally, CI is just a formality" | "Works on my machine" is not a deployment standard. |
| "Feature flags add complexity" | They add complexity that prevents outages. The tradeoff is correct. |
| "I'll set up CI after the MVP ships" | CI set up after MVP = CI never set up. Build it in from the start. |
| "Coverage gates are arbitrary" | Uncovered code is unknown code. The gate forces you to think about it. |

## 5. Red Flags

Signs this skill is being violated:

- Merging to main without all CI stages passing
- No automated tests in the pipeline
- Deployment triggered manually without a pipeline gate
- Feature with significant user impact deployed without a feature flag
- `npm install` used in CI instead of `npm ci`
- No coverage threshold defined — all coverage reports are informational only

## 6. Verification Gate

Before marking this skill complete:

- [ ] All CI stages defined and passing for the current PR
- [ ] Static analysis stage runs in < 5 minutes
- [ ] Unit + integration tests run in < 3 minutes on CI
- [ ] `npm audit --audit-level=high` in pipeline — currently passing
- [ ] Bundle size check present (web apps)
- [ ] Feature flag added if feature affects >10% of users or has a kill-switch requirement
- [ ] Pipeline config committed to version control
- [ ] No secrets in CI config — all secrets via environment variables

## 7. References

- [github-actions-template.yml](references/github-actions-template.yml) — Starter CI pipeline for Node/React
- [feature-flag-patterns.md](references/feature-flag-patterns.md) — Feature flag naming and lifecycle
