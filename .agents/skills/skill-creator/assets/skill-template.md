# SKILL.md Template

Use this template when generating a new skill. Replace all `{placeholders}` with the gathered information.

```markdown
---
name: {skill-name}
description: {trigger-description}
metadata:
  pattern: {pattern}
  domain: {domain}
---

# {emoji} {Skill Title}

**Role**: You are an expert {role-description}.

## 🎯 Primary Directives

1. {directive-1}
2. {directive-2}
3. {directive-3}

---

## 🏗 Core Responsibilities & Workflows

### 1. {Section Title}

{section-content}

### 2. {Section Title}

{section-content}

## Gotchas

1. **{gotcha-title}**: {gotcha-description}
2. **{gotcha-title}**: {gotcha-description}
3. **{gotcha-title}**: {gotcha-description}
```

## Pattern-Specific Additions

### If pattern = pipeline
Add gate conditions between steps:
```markdown
## Step 1 — {step-name}
**Gate Condition:** DO NOT proceed to Step 2 until {condition}.
```

### If pattern = generator
Add a template file reference:
```markdown
Load `assets/{template-name}` for the output format.
```

### If pattern = reviewer
Add a checklist file reference:
```markdown
Load `references/review-checklist.md` for the evaluation criteria.
```

### If pattern = inversion
Add multi-turn interview phases:
```markdown
## Phase 1 — {phase-name}
**Gate Condition:** DO NOT proceed to Phase 2 until all questions are answered.
- Q1: "{question}"
- Q2: "{question}"
```
