---
name: write-a-prd
description: Produces a full PRD with user stories, success criteria, scope boundaries (Always/Ask/Never), and non-functional requirements. Output submitted as a GitHub issue.
version: 1.0.0
category: process
optional: false
phase: 1
dependencies: [grill-me]
---

## 1. Trigger Conditions

Invoke this skill after `grill-me` has produced a validated plan and before `prd-to-plan` begins.

Specific triggers:
- `/write-a-prd` slash command
- Phase 2 of `/build-feature` master workflow
- User says "write a PRD", "define requirements", or "let's spec this out"
- A validated plan exists from `grill-me` and needs to be formalised

## 2. Prerequisites

- A validated plan from `grill-me` (or equivalent adversarial validation)
- Understanding of the target users and their goals
- Any known constraints: technical, timeline, compliance, team

## 3. Steps

1. **Confirm the problem statement.** In 2–3 sentences: what problem does this solve, for whom, and why now? If you cannot answer all three, ask before proceeding.

2. **Define target users.** List the primary user(s) affected. Include their role, goal, and knowledge level. At minimum one user type is required.

3. **Write user stories.** Format: *As a [user], I want to [action] so that [outcome].* Write one story per distinct user goal. Minimum 3 stories for any non-trivial feature.

4. **Define success criteria.** Each criterion must be:
   - **Measurable** — "< 200ms response time", not "fast"
   - **Verifiable** — testable by a human or automated test
   - **Binary** — pass or fail, not "mostly works"

5. **Set scope boundaries using Always/Ask/Never:**
   - **Always** — behaviours the agent must implement without asking
   - **Ask** — decisions requiring human confirmation before implementing
   - **Never** — explicit exclusions for this version (prevents scope creep)

6. **Write non-functional requirements.** Cover at minimum:
   - Performance targets (load time, query time, throughput)
   - Security constraints (auth, data exposure, input validation)
   - Accessibility requirements (WCAG level if applicable)
   - Browser/device/platform support

7. **Identify dependencies and risks.** List: external APIs, third-party services, other features this depends on, and the top 3 risks with mitigation strategies.

8. **Submit as GitHub issue.** Create a GitHub issue with:
   - Title: `[PRD] <feature name>`
   - Body: the full PRD in Markdown
   - Labels: `prd`, `planning`
   - Assign to the relevant milestone if one exists

9. **Save locally.** Write the PRD to `.agents/docs/prd-<feature-slug>.md` for offline reference.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "The requirements are obvious, no need to write them down" | Unwritten requirements are contracts with no terms. Write them. |
| "I'll figure out the edge cases during implementation" | The PRD is the place to decide what's in scope. Decide now. |
| "User stories are unnecessary overhead" | They are the only way to verify the implementation solves the right problem. |
| "We don't need a GitHub issue for this" | The issue is the audit trail. If it's not written down, it didn't happen. |
| "Success criteria can be qualitative" | "Feels fast" cannot be tested. Quantify it or explicitly defer measurement to a named phase. |

## 5. Red Flags

Signs this skill is being violated:

- PRD contains vague language: "handle edge cases", "improve performance", "user-friendly"
- No success criteria defined
- Always/Ask/Never not populated — scope is undefined
- User stories written from the system's perspective, not the user's
- No GitHub issue created
- Non-functional requirements omitted entirely

## 6. Verification Gate

Before marking this skill complete and proceeding to `/prd-to-plan`:

- [ ] Problem statement answers: what, for whom, why now
- [ ] At least one target user defined with role and goal
- [ ] Minimum 3 user stories written in correct format
- [ ] All success criteria are measurable and binary
- [ ] Always/Ask/Never scope boundaries populated
- [ ] Non-functional requirements cover performance, security, accessibility
- [ ] Dependencies and top 3 risks listed with mitigations
- [ ] GitHub issue created with `[PRD]` title and `prd` label
- [ ] PRD saved to `.agents/docs/prd-<feature-slug>.md`

## 7. References

- [prd-template.md](references/prd-template.md) — Full PRD document template
- [scope-boundaries-guide.md](references/scope-boundaries-guide.md) — How to write Always/Ask/Never rules
