---
description: Turns an approved PRD into a tracer-bullet implementation plan with vertical slices. Saves to ./plans/*.md. Invoke with /prd-to-plan.
---

# /prd-to-plan

Load skill: `skills/prd-to-plan/SKILL.md`

Given an approved PRD (from `.agents/docs/` or GitHub issue), produce an implementation plan:

1. Identify the tracer bullet — thinnest end-to-end path proving the architecture works
2. Decompose into vertical slices:
   - Each slice = one user-visible behaviour
   - Each slice is independently testable
   - Each slice has: goal, layers touched, test, commit message
3. Order slices: tracer bullet first → high-risk → features → polish
4. List required tech skills per slice
5. Save to `./plans/<feature-slug>-plan.md` using `skills/prd-to-plan/references/plan-template.md`

**Output goes to**: `/implement`
