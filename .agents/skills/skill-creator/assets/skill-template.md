# SKILL.md Template (v3 — 7-Section Anatomy)

Use this template when generating a new skill. All 7 sections are mandatory for first-party skills.
Replace all `{placeholders}` with gathered information.

```markdown
---
name: {skill-name}
description: {one-line trigger description for skill loader}
version: 1.0.0
category: process | technology
optional: true | false
phase: 0 | 1 | 2 | 4 | 5 | null
dependencies: []
---

## 1. Trigger Conditions

When to invoke this skill. Be specific — name keywords, user intents, and workflow phases.

- {specific trigger 1}
- {specific trigger 2}

## 2. Prerequisites

What must be true before starting. Gate conditions the agent must verify.

- {prerequisite 1}
- {prerequisite 2}

## 3. Steps

The actual process. Numbered, atomic, and verifiable.

1. **{step name}**: {description — what to do, how to do it, what it produces}

2. **{step name}**: {description}

3. **{step name}**: {description}

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "{common shortcut excuse}" | {why this is wrong and what to do instead} |
| "{another excuse}" | {rebuttal} |
| "{a third excuse}" | {rebuttal} |

## 5. Red Flags

Observable signs this skill is being violated.

- {red flag 1 — specific observable symptom}
- {red flag 2}
- {red flag 3}

## 6. Verification Gate

Domain-specific checklist completed before marking this skill done.

- [ ] {evidence item 1 — specific to this skill's domain}
- [ ] {evidence item 2}
- [ ] {evidence item 3}

## 7. References

- [{reference-file.md}](references/{reference-file.md}) — {description}
```

---

## Pattern-Specific Additions

### If pattern = pipeline
Add gate conditions between steps:
```markdown
### Step 1 — {step-name}
{instructions}
**Gate**: do not proceed to Step 2 until {condition}.
```

### If pattern = generator
Add a template file reference in Step 3:
```markdown
Load `assets/{template-name}` for the output format.
```

### If pattern = reviewer
Add a checklist reference in Step 2:
```markdown
Load `references/review-checklist.md` for the complete evaluation criteria.
```

### If pattern = inversion
Add multi-turn interview phases to Step 3:
```markdown
### Phase 1 — {phase-name}
**Gate**: do not proceed to Phase 2 until all questions answered.
- Q1: "{question}"
- Q2: "{question}"
```
