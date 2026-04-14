---
name: skill-creator
description: Creates new agent skills by interviewing the user, selecting the right design pattern, and generating a complete skill folder with SKILL.md in 7-section anatomy, references/, and assets/.
version: 2.0.0
category: process
optional: false
phase: 0
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- User says "create a skill", "new skill", "build a skill for", or "add a skill"
- `/skill-creator` slash command
- A skill gap is detected (`build-feature` Phase 0) and no registry match exists
- A technology or process pattern is repeatedly used but has no formalised skill

## 2. Prerequisites

- A clear description of what the skill should do (gathered via interview if not provided)
- `references/pattern-selector.md` loaded for pattern selection
- `assets/skill-template.md` loaded for the SKILL.md scaffold

**Do NOT generate any files until all interview phases are complete.**

## 3. Steps

### Phase 1 — Purpose & Trigger

**Gate**: do not proceed until all 3 questions are answered.

Ask in order, waiting for each answer:
- Q1: "What task or technology should this skill help accomplish? (e.g., 'Write Tailwind CSS following our conventions', 'Debug performance issues')"
- Q2: "When should an agent trigger this skill — what keywords or user intent should activate it?"
- Q3: "What is the skill name in kebab-case? (e.g., `tailwind-css`, `stripe-payments`)"

### Phase 2 — Pattern Selection

**Gate**: do not proceed until pattern is confirmed.

Load `references/pattern-selector.md` and present the 5 patterns:

1. **Tool Wrapper** — wraps a framework's conventions (e.g., `firebase-setup`, `rtk-query`)
2. **Pipeline** — multi-step workflow with gate conditions (e.g., `git-workflow`, `test-writing`)
3. **Generator** — produces files from templates (e.g., `react-component-scaffolder`)
4. **Reviewer** — evaluates code against a checklist (e.g., `code-reviewer`)
5. **Inversion** — multi-turn interview before producing output (e.g., `skill-creator`)

Ask: "Based on what you described, I think this is a **[suggested pattern]**. Does that sound right, or would another fit better?"

### Phase 3 — Content Gathering

**Gate**: do not proceed until all 3 questions are answered.

- Q4: "What are the 3–5 most important rules or conventions the agent must follow?"
- Q5: "What are the top 3 mistakes (gotchas) an agent commonly makes in this domain?"
- Q6: "Should this skill have reference files? If so, what topics should they cover?"

### Phase 4 — Generation

**Gate**: do not generate until Phase 3 is fully answered.

1. Load `references/naming-conventions.md` for folder/file naming rules
2. Load `assets/skill-template.md` for the SKILL.md scaffold
3. Generate the skill using the **7-section anatomy** (mandatory for all first-party skills):

```
.agents/skills/{skill-name}/
├── SKILL.md          ← 7-section anatomy (see template)
└── references/
    ├── gotchas.md    ← From Q5
    └── {topic}.md   ← One per reference topic from Q6
```

**7-section anatomy required fields:**
- Section 1: Trigger Conditions (specific, not vague)
- Section 2: Prerequisites (gate conditions)
- Section 3: Steps (numbered, atomic, verifiable)
- Section 4: Anti-Rationalization Table (agent excuses + rebuttals)
- Section 5: Red Flags (self-diagnosis prompts)
- Section 6: Verification Gate (checklist before marking done)
- Section 7: References (links to reference files)

4. Present generated files to the user
5. Ask: "Does this skill look correct? Would you like to adjust anything before we finalise?"
6. After approval, load `references/quality-checklist.md` and confirm all items pass
7. Write `.version` file with `1.0.0` into the skill directory

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I have enough info to generate without asking all questions" | The interview is the quality gate. Skipping it produces shallow skills. |
| "The 7-section anatomy is optional for simple skills" | It is not optional for first-party skills. All sections must be present. |
| "I'll skip the Anti-Rationalization Table, it seems unnecessary" | The table is what prevents the skill from being ignored under pressure. It is mandatory. |
| "I'll generate the skill and let the user refine it" | Generation without approval produces unreviewed skills. Present, confirm, then finalise. |

## 5. Red Flags

Signs this skill is being violated:

- Files generated before Phase 3 questions are all answered
- Generated SKILL.md missing one or more of the 7 sections
- Anti-Rationalization Table not present or only has 1–2 entries
- Verification Gate is a generic checklist, not specific to the skill's domain
- `.version` file not written after generation

## 6. Verification Gate

Before marking skill creation complete:

- [ ] All Phase 1–3 questions answered by the user
- [ ] Pattern selected and confirmed
- [ ] 7-section SKILL.md generated with all sections present
- [ ] Anti-Rationalization Table has ≥ 3 entries specific to this skill's domain
- [ ] Verification Gate has ≥ 3 domain-specific checklist items
- [ ] Reference files generated for all topics from Q6
- [ ] User approved the generated skill
- [ ] `references/quality-checklist.md` evaluated and all items pass
- [ ] `.version` file written (`1.0.0`)

## 7. References

- [pattern-selector.md](references/pattern-selector.md) — Pattern descriptions and selection guide
- [naming-conventions.md](references/naming-conventions.md) — Folder and file naming rules
- [quality-checklist.md](references/quality-checklist.md) — Pre-publish skill quality checklist
- [assets/skill-template.md](assets/skill-template.md) — 7-section SKILL.md scaffold
