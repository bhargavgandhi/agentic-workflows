# Artifact Schemas

Every phase reads and writes files. These are the only interface between phases,
which is what makes the workflow resumable, tool-agnostic and testable.

```
brief.md ──> plan.md (@approved) ──> source changes ──> reports/*.md ──> gate2.md ──> agent-log.md row
                   ^                        |
                   └──── ruled-out, gotchas ┘   (append-only, written as discovered)
                                            attempts.json  (loop state)
```

Run artifacts live in `.agents/run/<task-slug>/`. The plan lives in `plans/`
because `guard-gate.js` reads it from there and because it is the artifact a
human edits.

---

## `.agents/run/<task>/brief.md`

Written by the Phase 0 scope adapter from whatever the operator supplied: a
pasted requirement, a GitHub issue, a file, or a URL. Normalising it means every
later phase reads one shape regardless of origin.

```markdown
---
task: drag-to-reorder-playlist          # slug, matches the run directory
source: github:owner/repo#214           # or: prompt | file:<path> | url:<url>
fetched_at: 2026-10-06
---

## Build
One sentence.

## Why
The user problem, one or two sentences.

## Acceptance criteria
1. Observable behaviour.
2. Observable behaviour.

## Out of scope
What must not be touched or built.

## Relevant files
Paths to read first.

## Constraints
e.g. no new dependencies; must work at 320px; reuse ListItem.

## Mode
FULL | QUICK
```

Required: `task`, `source`, `## Acceptance criteria` with at least one item.
An ambiguous or empty acceptance criteria section is a Phase 1 stop, not a
guess.

---

## `plans/<task>.md`

The Gate 1 artifact, and the only one a human edits. `approved` and `branch` are
read by `guard-gate.js`.

```markdown
---
task: drag-to-reorder-playlist
branch: feat/drag-to-reorder-playlist   # must match the working branch
approved: false                         # a HUMAN sets this to true
mode: FULL
touches: []                             # sensitive paths this work needs, e.g.
                                        #   - .github/workflows/ci.yml
---

## Files
| File | Change | Why |
|---|---|---|

## Contracts
Prop types, state shape, API request/response shapes.

## States covered
Loading, empty, error, success, and any edge states.

## Accessibility
Roles, keyboard path, focus management, screen-reader announcements.

## Test plan
| Acceptance criterion | Test | Type |
|---|---|---|
Every criterion in the brief must appear here with a named test.

## Risks
Anything touching state sync, effects, auth, data persistence or security.

## Rejected alternative
One approach considered and why it was rejected. Exactly one is the minimum.

## Ruled out
<!-- append-only. Add the moment something is tried and fails. -->

## Gotchas
<!-- append-only. Surprising facts about this codebase or its dependencies. -->
```

Required at Gate 1: `task`, `branch`, `approved`, every section above except
`Ruled out` and `Gotchas`, which start empty and fill during implementation.

**`approved: true` is set by a human.** An agent setting it defeats the only
mechanism that makes the gate real.

---

## `.agents/run/<task>/attempts.json`

Loop state. On disk rather than in context so an iteration ceiling survives a
context reset — the failure mode is an agent that resets, forgets it already
tried three times, and starts again.

```json
{
  "task": "drag-to-reorder-playlist",
  "loops": [
    {
      "target": "pnpm vitest run src/Playlist",
      "signature": "a3f9c21",
      "attempts": 2,
      "max": 3,
      "last_error": "expected 3 items, received 2",
      "resolved": false
    }
  ]
}
```

`signature` is a stable hash of the normalised error text. Attempts increment
only when the signature is unchanged; a new signature is a new loop, because a
different error means progress.

---

## `.agents/run/<task>/reports/{review,security,tests}.md`

One per quality gate. Shape is fixed so the orchestrator can merge them
mechanically — unchanged from `plans/orchestrator-subagent-pattern-design.md` §4.

```markdown
## Summary
- Gate: PASS | FAIL
- Critical: <n>  | High: <n>  | Medium: <n>  | Low: <n>

## Findings
| Severity | File:Line | Issue | Suggested Fix |
|----------|-----------|-------|----------------|

## Notes
```

Use `(suite)` as `File:Line` for findings not tied to a specific line.

PASS/FAIL per gate:
- review → FAIL on any Critical
- security → FAIL on any Critical or High
- tests → FAIL if the suite does not pass

Tables rather than prose: output tokens cost several times input, and a merge
step needs structure, not narrative.

---

## `.agents/run/<task>/gate2.md`

The Gate 2 artifact. What the human reads instead of the whole diff, so it must
be honest about what is weak.

```markdown
---
task: drag-to-reorder-playlist
branch: feat/drag-to-reorder-playlist
checks: { typecheck: pass, lint: pass, unit: pass, e2e: pass }
---

## What changed
| File | Change |
|---|---|

## How each criterion is proven
| Criterion | Test | Result |
|---|---|---|

## Deviations from the approved plan
What differed and why. "None" is a valid answer only if it is true.

## Review hotspots
Specific lines touching state, effects, async timing, auth or user data.

## Unsure about
Anything the agent could not verify. An empty section here is a red flag, not a
clean bill of health.

GATE 2: awaiting review
```

A check may be reported `pass` only if its command was run in this session and
its report exists under `reports/`.

---

## `docs/agent-log.md`

One row per completed task, appended after the human approves or rejects. This
is also the eval's data source — the columns are deliberately the metrics the
Stage 4 harness scores.

```markdown
| Date | Task | Plan approved first try | Review comments | Checks green first run | Notes |
|---|---|---|---|---|---|
| 2026-10-06 | drag-to-reorder-playlist | y | 2 | n | e2e flaked once on CI |
```
