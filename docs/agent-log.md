# Agent Log

One row per task completed through `/build` (`.agents/workflows/controlled-delegation.md`),
appended in Phase 6 after the human approves or rejects.

These columns are the Stage 4 eval's data source, not bookkeeping. They are the
evidence that the gated workflow helps — or that it does not.

| Column | Meaning |
|---|---|
| Plan approved first try | `y` if Gate 1 passed without the plan being sent back |
| Review comments | Count of review comments requiring a change at Gate 2 |
| Checks green first run | `y` if typecheck, lint and tests all passed on the first full run |

| Date | Task | Plan approved first try | Review comments | Checks green first run | Notes |
|---|---|---|---|---|---|
