---
name: context-health-check
description: Pre-load planning and forward-planning for context budget. Checks disk token costs before loading files or skills. Use /check-context for live session status.
version: 1.1.0
category: process
optional: true
phase: null
dependencies: [context-engineering]
---

## 1. Trigger Conditions

- Before loading a large file or set of files (pre-load check)
- Before starting a new phase — decide what to load vs. skip
- When `context-engineering` signals a phase transition
- On-demand: agent or user wants a pre-task load plan

**Not a live session monitor.** For live context window usage, run `/check-context` instead.

## 2. Prerequisites

- `.agents/` directory present in workspace
- `agents-skills.config.json` or model-agnostic default (128k budget)

## 3. Steps

### Step 1: Check disk token cost before loading

Use the CLI to see how many tokens a skill or file will consume _before_ loading it:

```bash
# Cost of a specific skill
agents-skills tokens --skill react-native

# Cost of a specific file
agents-skills tokens --file src/components/BigComponent.tsx

# Full .agents/ inventory (all installed skills)
agents-skills tokens
```

This tells you the **disk size** of the content — a reliable proxy for how much context it will consume when loaded.

### Step 2: Apply the load/skip decision

| Skill/file token cost | Decision                                                   |
| --------------------- | ---------------------------------------------------------- |
| < 1,500 tokens        | Load freely                                                |
| 1,500–4,000 tokens    | Load only if needed in the next 1–2 phases                 |
| > 4,000 tokens        | Load only if directly required; prefer targeted line reads |

### Step 3: Forward-planning before each phase

For each file or skill planned to load next, answer:

1. **Is this needed in the next 1–2 phases?** If no, skip it.
2. **Can I get what I need from a targeted read of specific lines?** If yes, prefer that over loading the whole file.
3. **Have I already summarised this content earlier in the session?** If yes, use your notes — don't re-read.
4. **Is this a skill whose phase is complete?** Drop it mentally; don't re-read it.

### Step 4: For live session status — use `/check-context`

`agents-skills tokens` measures files on disk. It cannot see your live chat session.

To get actual context window usage, token consumption by tool category, and capacity assessment for the current session, run:

```
/check-context
```

## 4. Anti-Rationalization Table

| Excuse the agent will use                                 | Rebuttal                                                                         |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| "I don't need to check cost before loading"               | A 7,000-token skill loaded unnecessarily burns ~9% of a 80k budget. Check first. |
| "I'll just load everything and see what fits"             | Front-loading bloats the session from turn 1. Load on demand.                    |
| "agents-skills tokens shows I'm under budget so I'm fine" | That's the disk inventory, not your session. Run /check-context for live status. |
| "I checked context at the start, I'm good"                | Context grows with every tool call and file read. Re-check at phase transitions. |

## 5. Red Flags

- Skills loaded at session start "just in case" they might be needed
- A skill with >4,000 tokens loaded for a task where only 1 section was needed
- Agent conflates `agents-skills tokens` output with live session token count
- No pre-load check before reading a file >500 lines

## 6. Verification Gate

- [ ] `agents-skills tokens --skill <name>` checked before loading any skill >1,500 tokens
- [ ] Load/skip decision applied per Step 2 table
- [ ] Forward-planning applied before each phase transition
- [ ] `/check-context` used (not `agents-skills tokens`) for live session status

## 7. References

- [token-budget-guide.md](../context-engineering/references/token-budget-guide.md) — Model budgets and thresholds
- [commands/check-context.md](../../commands/check-context.md) — `/check-context` command for live session status
