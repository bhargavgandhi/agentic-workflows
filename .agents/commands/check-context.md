---
description: Live session status report. Estimates context window usage, tool calls, files touched, and capacity health. Invoke with /check-context.
---

# /check-context

Generate a live session status report by reasoning over the current conversation. No CLI call needed — derive everything from what you can observe.

Output the following sections, ~40 lines total:

---

## 1. Context Window Metrics

| Metric | Value |
|---|---|
| Max tokens (context window) | [model limit, e.g. 200,000] |
| Tokens used (estimate) | [estimate based on conversation length] |
| Tokens remaining (estimate) | [max − used] |
| Usage % | [used / max × 100] |
| Capacity | [████░░░░░░ XX%] 🟢 / 🟡 / 🔴 |

Status: 🟢 Healthy (<50%) / 🟡 Moderate (50–75%) / 🔴 Low (>75%)

---

## 2. Checkpoint / Compaction Status

- Checkpoint active: Yes / No
- If yes: checkpoint number, step ID range summarized, what was preserved, what was lost

---

## 3. Tool Calls Breakdown

| Category | Tools | Count |
|---|---|---|
| File tools | Read, Edit, Write, Glob, Grep | X |
| Bash / system | Bash | X |
| Agent tools | Agent, Skill | X |
| Other | WebFetch, WebSearch, etc. | X |
| **Total** | | **X** |

---

## 4. Session Activity Summary

- User turns: X
- Files created: X — [list names]
- Files modified: X — [list names]
- Files read/viewed: X

---

## 5. Capacity Assessment

```
[████████░░] XX% used  —  ~XX,XXX tokens remaining
```

Estimated headroom:
- File reads remaining: ~X large files or ~X small files
- Tool calls remaining: ~X (at current avg tokens/call)

---

## 6. Recommendations

- [ ] [e.g. "Context is healthy — no action needed"]
- [ ] [e.g. "3 large files read this session — prefer targeted line reads going forward"]
- [ ] [e.g. "Run /compact before starting the next phase — ~40% headroom remaining"]

Data loss risk: None / Low / Medium / High — [reason]

---

## 7. Token Efficiency Insights

- Heaviest tool category this session: [category] (~X tokens)
- Lightest: [category]
- Files on disk vs. in context: [X files saved] / [X still only in memory]
- Memory preservation: [are key decisions/outputs committed to disk or only in context?]
