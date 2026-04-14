---
name: prd-to-plan
description: Turns a PRD into a tracer-bullet implementation plan. Each bullet is a thin end-to-end vertical slice. Saves to ./plans/*.md.
version: 1.0.0
category: process
optional: false
phase: 2
dependencies: [write-a-prd]
---

## 1. Trigger Conditions

Invoke this skill after a PRD has been approved and before implementation begins.

Specific triggers:
- `/prd-to-plan` slash command
- Phase 3 of `/build-feature` master workflow
- User says "create a plan", "break this into tasks", or "how do we implement this PRD"
- A PRD exists in `.agents/docs/` or as a GitHub issue

## 2. Prerequisites

- An approved PRD (from `write-a-prd` or equivalent)
- Understanding of the tech stack and existing codebase structure
- Any known architectural constraints

## 3. Steps

1. **Read and internalise the PRD.** Specifically extract:
   - Success criteria (these define when each slice is "done")
   - Always/Ask/Never scope boundaries (these constrain implementation choices)
   - Dependencies (these determine ordering)

2. **Identify the tracer bullet.** The tracer bullet is the thinnest possible end-to-end path that proves the core architecture works. It must:
   - Touch every layer (UI → logic → data)
   - Be independently deployable and testable
   - Not include any optional features

3. **Decompose into vertical slices.** Each slice must be:
   - **Thin** — implements one user-visible behaviour, not a horizontal layer
   - **End-to-end** — touches all layers needed for that behaviour
   - **Independently testable** — can be verified without completing other slices
   - **Committable** — results in a working, non-broken state after commit

   Bad slice: "Set up database schema" (horizontal layer, not end-to-end)
   Good slice: "User can create an account and see their profile" (vertical, end-to-end)

4. **Order slices by dependency and risk.** Tracer bullet first. High-risk or high-uncertainty slices early (fail fast). Optional features last.

5. **For each slice, write:**
   - **Goal**: one sentence describing the user-visible outcome
   - **Layers touched**: UI, API, DB, etc.
   - **Test**: how to verify it's done (maps directly to a success criterion)
   - **Commit message**: the conventional commit message for this slice

6. **Identify required tech skills.** For each slice, note which technology skills should be loaded (e.g. `react-query`, `firebase-setup`). This feeds Phase 0 skill gap detection.

7. **Save the plan.** Write to `./plans/<feature-slug>-plan.md` using the plan template.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll start with the database schema first" | That's a horizontal layer, not a slice. Where's the UI? Where's the test? |
| "This slice is too small to be useful" | Small slices = small risks = easy rollback. If it tests one behaviour, it's the right size. |
| "I can combine these slices to go faster" | Merged slices = merged failure modes. Keep them independent. |
| "The plan doesn't need to be written down, I know what to do" | The plan is the contract for /implement. If it's not written, it will drift. |
| "I'll figure out the tech skills as I go" | Skill gap detection runs before implementation. List them now. |

## 5. Red Flags

Signs this skill is being violated:

- Slices are named after layers ("set up DB", "build API", "build UI") instead of user behaviours
- A slice cannot be tested without completing another slice first
- Slices are described in terms of technical tasks, not user outcomes
- Plan file not created — planning is verbal only
- No test defined for a slice
- Slice order puts high-uncertainty work last

## 6. Verification Gate

Before marking this skill complete and proceeding to `/implement`:

- [ ] Tracer bullet slice identified and listed first
- [ ] Every slice is vertical (touches all layers for one behaviour)
- [ ] Every slice is independently testable
- [ ] Every slice has a test that maps to a PRD success criterion
- [ ] Every slice has a commit message in conventional commit format
- [ ] Slices ordered: tracer bullet → high-risk → features → polish
- [ ] Required tech skills listed per slice
- [ ] Plan saved to `./plans/<feature-slug>-plan.md`

## 7. References

- [plan-template.md](references/plan-template.md) — Plan file template
- [vertical-slice-guide.md](references/vertical-slice-guide.md) — What makes a good vertical slice
