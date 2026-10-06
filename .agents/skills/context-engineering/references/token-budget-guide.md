# Token Budget Guide

## Model Context Windows

Cached snapshot — verify before relying on a row. Prefer your tool's own
context readout (e.g. `/context` in Claude Code) over this table.

| Model | Context Window | Recommended Budget (40%) |
|-------|---------------|--------------------------|
| Model-agnostic default | 128,000 | 51,200 |
| Claude Opus 5 | 1,000,000 | 400,000 |
| Claude Sonnet 5 | 1,000,000 | 400,000 |
| Claude Haiku 4.5 | 200,000 | 80,000 |

Set the real window explicitly in `agents-skills.config.json` rather than
inferring it here:

```json
{ "model": "claude-opus-5", "contextWindow": 1000000, "budgetPercent": 40 }
```

**The 40% rule is about what you load, not what the window allows.** On a
1M-window model, 400,000 tokens of loaded context is a context-rot problem
long before it is a capacity problem — treat the percentage as a ceiling to
stay far below, not a target to fill.

## Budget Thresholds

| Threshold | Meaning | Action |
|-----------|---------|--------|
| 0–40% | Green zone | Normal operation |
| 40–60% | Yellow zone | Begin forward-planning; avoid loading unnecessary files |
| 60–70% | Orange zone | Draft snapshot; finish current phase before loading more |
| >70% | Red zone | Trigger compaction immediately |

## Typical Token Costs

| Content | Approximate Tokens |
|---------|--------------------|
| One skill SKILL.md | 800–2,000 |
| All 20 skills loaded | ~30,000–40,000 |
| One React component (200 lines) | ~600 |
| Project profile JSON | ~500 |
| Context snapshot | ~400–800 |
| This token budget guide | ~300 |

## Checking Usage

```bash
agents-skills tokens --budget
```

Output shows: current usage, budget, and percentage consumed.
