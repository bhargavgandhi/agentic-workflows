---
name: context-health-check
description: Live token budget monitoring and forward-planning for what not to load next. On-demand or triggered automatically by context-engineering.
version: 1.0.0
category: process
optional: true
phase: null
dependencies: [context-engineering]
---

## 1. Trigger Conditions

- On-demand: user or agent requests a context health check
- Automatically: invoked by `context-engineering` when budget crosses 40%
- Before loading any large file or set of files
- At the start of each new phase in a long session

## 2. Prerequisites

- `agents-skills.config.json` or model-agnostic default (128k budget)
- `.agents/` directory (for token count)

## 3. Steps

### Step 1: Measure Current Usage
```bash
agents-skills tokens --budget
```
Record: total tokens used, budget ceiling, percentage consumed.

### Step 2: Classify Budget State

| Usage | State | Required Action |
|-------|-------|----------------|
| < 40% | Green | Continue normally |
| 40–60% | Yellow | Apply forward-planning (Step 3) |
| 60–70% | Orange | Prepare snapshot draft; finish current phase |
| > 70% | Red | Trigger compaction immediately via `context-engineering` |

### Step 3: Forward-Planning (Yellow/Orange state)

For each file or skill you were planning to load next, answer:
1. **Is this needed in the next 1–2 phases?** If no, skip it.
2. **Can I get what I need from a targeted grep/read of specific lines?** If yes, do that instead of loading the whole file.
3. **Have I already summarised this content earlier in the session?** If yes, use your notes — don't re-read.
4. **Is this a skill I can unload?** If a skill phase is complete, mentally drop it.

### Step 4: Report Health Status

Output a brief status report:
```
Context Health: [GREEN / YELLOW / ORANGE / RED]
Used: X,XXX tokens (XX% of XX,XXX budget)
Remaining: X,XXX tokens

Next 2 phases: [list]
Files planned to load: [list]
Files skipped (budget): [list]
Recommendation: [action or "continue"]
```

### Step 5: Act on Recommendation
- **Green**: proceed
- **Yellow**: apply forward-planning, load only essential files
- **Orange**: complete current phase, create snapshot before starting next
- **Red**: stop and trigger `context-engineering` compaction now

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll check the budget later" | Context doesn't announce when it's full. Check proactively at phase transitions. |
| "I just need to load one more file" | That one file may be what pushes you into the red zone. Check first. |
| "The session is almost done, I don't need a snapshot" | If the session dies before you finish, the snapshot is what saves it. |

## 5. Red Flags

- Budget never checked during a session spanning more than 3 phases
- Files loaded without a forward-planning check in Yellow state
- Compaction triggered reactively at >80% instead of proactively at 70%

## 6. Verification Gate

- [ ] `agents-skills tokens --budget` run at each phase transition
- [ ] Budget state classified (Green/Yellow/Orange/Red)
- [ ] Forward-planning applied in Yellow/Orange state
- [ ] Compaction triggered in Red state before proceeding
- [ ] Health status reported to user in Orange/Red state

## 7. References

- [token-budget-guide.md](../context-engineering/references/token-budget-guide.md) — Model budgets and thresholds
