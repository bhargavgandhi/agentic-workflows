---
name: skill-creator
description: Creates new agent skills by interviewing the user, selecting the right design pattern, and generating a complete skill folder with SKILL.md, references/, and assets/. Use when the user says "create a skill", "new skill", "build a skill for", or "add a skill".
metadata:
  pattern: inversion
  interaction: multi-turn
---

**Role**: You are a skill-creation wizard. You interview the user to understand what the skill should do, select the correct design pattern, and generate a production-ready skill folder that matches this repository's conventions. DO NOT generate any files until all phases are complete.

## Phase 1 — Purpose & Trigger

**Gate Condition:** DO NOT proceed to Phase 2 until all 3 questions are answered.

Ask these questions in order. Wait for each answer.

- Q1: "What task or technology should this skill help accomplish? (e.g., 'Write Tailwind CSS following our conventions', 'Debug performance issues', 'Set up Stripe payments')"
- Q2: "When should an agent trigger this skill — what keywords or user intent should activate it? (e.g., 'when the user asks about Tailwind', 'when debugging perf regressions')"
- Q3: "What is the skill name in kebab-case? (e.g., `tailwind-css`, `stripe-payments`, `perf-debugger`)"

## Phase 2 — Pattern Selection

**Gate Condition:** DO NOT proceed to Phase 3 until the pattern is confirmed.

Load `references/pattern-selector.md` and present the 5 pattern options to the user:

1. **Tool Wrapper** — Wraps an existing tool/framework's conventions (e.g., `firebase-setup`, `rtk-query`)
2. **Pipeline** — Multi-step workflow with gate conditions between steps (e.g., `git-workflow`, `test-writing`)
3. **Generator** — Produces files from templates (e.g., `react-component-scaffolder`)
4. **Reviewer** — Evaluates existing code against a checklist (e.g., `code-reviewer`)
5. **Inversion** — Drives a multi-turn interview before producing output (e.g., `app-architect`)

Ask: "Based on what you described, I think this is a **[suggested pattern]**. Does that sound right, or would another pattern fit better?"

## Phase 3 — Content Gathering

**Gate Condition:** DO NOT proceed to Phase 4 until all questions are answered.

- Q4: "What are the 3–5 most important rules or conventions the agent must follow when using this skill?"
- Q5: "What are the top 3 mistakes (gotchas) that an agent commonly makes in this domain?"
- Q6: "Should this skill have reference files? If so, what topics should they cover? (e.g., 'common patterns', 'gotchas', 'API examples')"

## Phase 4 — Generation

**Gate Condition:** DO NOT generate until Phase 3 is fully answered.

1. Load `references/naming-conventions.md` for folder/file naming rules.
2. Load `assets/skill-template.md` for the SKILL.md scaffold.
3. Load `references/quality-checklist.md` and use it to self-evaluate before presenting.

Generate the following files:

```
.agents/skills/{skill-name}/
├── SKILL.md                    ← From template, filled with gathered info
└── references/
    ├── gotchas.md              ← From Q5 gotchas
    └── {topic}.md              ← One file per reference topic from Q6
```

4. Present the generated files to the user.
5. Ask: "Does this skill look correct? Would you like to adjust anything before we finalize?"
6. After approval, load `references/quality-checklist.md` and confirm all items pass.
