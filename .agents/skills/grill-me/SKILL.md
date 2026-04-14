---
name: grill-me
description: Adversarial plan stress-testing. Attacks assumptions and resolves every branch of a decision tree before a line of code is written.
version: 1.0.0
category: process
optional: false
phase: 0
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill **before any implementation begins** — at the moment a plan, feature idea, or approach is proposed but before any code, PRD, or task list is created.

Specific triggers:
- User says "I want to build X", "let's implement Y", or describes a feature goal
- An implementation plan has been drafted but not yet approved
- A PRD exists but hasn't been stress-tested
- The agent is about to make a significant architectural or technology decision

## 2. Prerequisites

- A stated goal, feature description, or implementation plan (even informal)
- Access to any relevant constraints: existing codebase, framework, team size, timeline

## 3. Steps

1. **Restate the goal in one sentence.** If you cannot do this clearly, the goal is not yet defined enough to proceed. Ask clarifying questions until you can.

2. **List all assumptions embedded in the plan.** Assumptions are anything stated or implied as true without verification. Examples:
   - "This API exists and behaves as expected"
   - "Users will understand this UX pattern"
   - "The database can handle this query at scale"
   - "This library is maintained and production-ready"

3. **Attack each assumption.** For every assumption, ask: *What if this is false?* Generate the worst-case failure mode. Rate each as:
   - **Critical** — plan fails if this assumption is wrong
   - **Significant** — major rework required
   - **Minor** — recoverable without redesign

4. **Map the decision tree.** Identify every fork in the plan where different conditions lead to different paths. For each fork:
   - Name the condition
   - Define what happens in each branch
   - Verify the plan handles **all** branches — not just the happy path

5. **Surface scope creep vectors.** Identify where the plan is likely to expand: vague requirements, missing edge cases, "we'll figure it out later" deferments. Name each one explicitly.

6. **Resolve every open branch.** Do not proceed until every Critical and Significant assumption has either been:
   - Verified (with a source or concrete evidence), or
   - Converted into an explicit constraint or risk in the plan

7. **Produce the validated plan.** Rewrite or confirm the original plan with all resolved branches, explicit constraints, and named risks. This is the input to `/write-a-prd`.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "This is straightforward, no need to stress-test" | Every plan that skipped this step had hidden assumptions. Do it anyway. |
| "The user already knows what they want" | User wants = stated goal. Plan validity = different question. Stress-test the plan, not the goal. |
| "I've seen this pattern before, it works" | Past success ≠ current validity. The codebase, dependencies, and constraints are different now. |
| "We can handle edge cases later" | "Later" is where technical debt lives. Name the edge cases now and decide consciously. |
| "The happy path is 95% of cases" | The 5% is where bugs, security holes, and outages live. Map it. |
| "This is just a small feature" | Small features become large features. The grill protects scope. |

## 5. Red Flags

Signs this skill is being violated:

- Plan contains words like "probably", "should work", "we'll see", "TBD", or "assume"
- No failure modes have been identified
- Decision tree has branches marked "handle later" or "depends on X"
- The plan was approved in under 2 minutes without any pushback
- Agent says "looks good" without having asked a single adversarial question
- All scenarios described are success scenarios

## 6. Verification Gate

Before marking this skill complete and proceeding to `/write-a-prd`:

- [ ] Goal restated in one unambiguous sentence
- [ ] All assumptions listed (minimum 3 for any non-trivial feature)
- [ ] Every Critical assumption has been verified or converted to a named risk
- [ ] Decision tree mapped with all branches named
- [ ] All branches resolved (no "TBD" or "handle later" on Critical/Significant branches)
- [ ] Scope creep vectors named and constrained
- [ ] Validated plan produced and confirmed with user

## 7. References

- [decision-tree-template.md](references/decision-tree-template.md) — Template for mapping branches
- [assumption-log.md](references/assumption-log.md) — Log format for tracking assumptions and resolutions
