---
name: documentation-and-adrs
description: Architecture Decision Records, API docs, and inline documentation standards. Captures the why, not just the what.
version: 1.0.0
category: process
optional: true
phase: 5
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill as an **opt-in gate** before ship, or whenever a significant architectural decision is made.

Specific triggers:
- `/docs` slash command
- Phase 5a of `/build-feature` (user opt-in)
- A new architectural pattern, library, or approach is introduced
- A non-obvious technical decision is made that future engineers will question
- A public API is created or modified
- A `TODO` or `FIXME` comment exists that needs resolution or documentation

## 2. Prerequisites

- Implementation complete for the current feature
- Understanding of the decisions made during implementation

## 3. Steps

### 3a. Architecture Decision Records (ADRs)

Write an ADR for any decision that is:
- Hard to reverse
- Non-obvious (a future engineer would ask "why did we do it this way?")
- A significant trade-off (choosing A over B, C)

ADR format (save to `.agents/docs/adrs/NNNN-<slug>.md`):

```markdown
# ADR-NNNN: [Decision Title]

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-XXXX

## Context
What situation forced this decision?

## Decision
What was decided, and what are the key constraints it operates under?

## Consequences
What becomes easier? What becomes harder? What are the trade-offs accepted?

## Alternatives Considered
| Alternative | Why Rejected |
|-------------|-------------|
| | |
```

### 3b. API Documentation

For every new or modified public API (REST endpoint, exported function, component prop):
- Document parameters: name, type, required/optional, constraints
- Document return value / response shape
- Document error cases and status codes
- Add at least one usage example

Use JSDoc for TypeScript functions. Use OpenAPI/Swagger comments for REST endpoints if the project uses a doc generator.

### 3c. Inline Documentation Standards

Write inline comments only when:
- The code is not self-explanatory (algorithm, business rule, workaround)
- A future engineer would waste >5 minutes understanding why this exists
- A specific workaround was applied for a known library bug or constraint

Do NOT write comments that restate the code:
```ts
// BAD: Increment counter
counter++;

// GOOD: Counter resets to 0 at 60 to match server-side minute boundary
counter = counter >= 60 ? 0 : counter + 1;
```

### 3d. README Updates

If the feature changes:
- How to run/develop the project
- Environment variables required
- API endpoints or configuration options
- Deployment steps

...update the README before shipping.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "The code is self-documenting" | The code explains what. ADRs explain why. Both are needed. |
| "I'll write the ADR later" | Later means never. Write the ADR while the decision context is fresh. |
| "This decision is obvious" | Obvious to you now, not to the engineer onboarding in 6 months. Write it down. |
| "We don't have time to document before shipping" | Documentation written after the fact is always incomplete. It takes 15 minutes now. |

## 5. Red Flags

Signs this skill is being violated:

- Major architectural decision made with no ADR
- New public API with no parameter documentation
- Inline comments describe what the code does, not why
- README still describes old behaviour after a significant change
- `TODO` comments left in shipped code without a linked issue

## 6. Verification Gate

Before marking documentation complete:

- [ ] ADR written for every hard-to-reverse or non-obvious decision this session
- [ ] ADR includes: context, decision, consequences, alternatives considered
- [ ] New/modified public APIs documented with parameters, return values, and examples
- [ ] Inline comments added where logic is non-obvious (not where it is obvious)
- [ ] README updated if setup, env vars, or deployment changed
- [ ] No `TODO`/`FIXME` comments in shipped code without linked issues

## 7. References

- [adr-template.md](references/adr-template.md) — Full ADR template
- [jsdoc-standards.md](references/jsdoc-standards.md) — JSDoc formatting guide
