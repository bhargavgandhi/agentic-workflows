# Token Budget Guide

## Model Context Windows

| Model | Context Window | Recommended Budget (40%) |
|-------|---------------|--------------------------|
| Model-agnostic default | 128,000 | 51,200 |
| Claude Sonnet/Opus 4 | 200,000 | 80,000 |
| GPT-4o | 128,000 | 51,200 |
| Gemini 2.5 Pro/Flash | 1,000,000 | 400,000 |

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
