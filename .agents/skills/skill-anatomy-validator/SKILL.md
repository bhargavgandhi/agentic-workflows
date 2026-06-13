---
name: skill-anatomy-validator
description: Validates that a SKILL.md follows the required 7-section anatomy (Trigger Conditions, Prerequisites, Steps, Anti-Rationalization Table, Red Flags, Verification Gate, References) with non-empty, sufficiently concrete content in each section. Invoke before opening a PR that adds or edits a skill.
version: 1.0.0
category: process
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- User says "validate this skill", "check skill anatomy", "does this SKILL.md follow the standard", or "review my SKILL.md structure"
- Before opening a PR that adds a new `.agents/skills/*/SKILL.md` or edits an existing one
- After `skill-creator` generates a new skill, as a final check
- A contributor asks "is this skill ready?"

## 2. Prerequisites

- A target `SKILL.md` file path is known and readable
- Do NOT invoke on non-skill markdown files (READMEs, plans, docs) — this validates only files matching `.agents/skills/*/SKILL.md`

## 3. Steps

### Step 1 — Read the target file and extract `## ` headers

Read the full `SKILL.md`. List every level-2 (`## `) heading in document order, stripping any leading numbering (e.g. "## 1. Trigger Conditions" → "Trigger Conditions"). Ignore any `## ` lines that appear inside fenced code blocks (` ``` `) — those are example output, not section headings.

### Step 2 — Confirm the 7 required sections, in order

The required anatomy, in this exact order:

1. Trigger Conditions
2. Prerequisites
3. Steps
4. Anti-Rationalization Table
5. Red Flags
6. Verification Gate
7. References

For each, confirm a heading with that exact name (case-insensitive, numbering ignored) exists and appears in this relative order. Report any that are missing, renamed, or out of order.

### Step 3 — Confirm each section has non-empty content

For each of the 7 sections, confirm there is at least one non-blank, non-heading line before the next `## ` heading (or end of file for the last section). A section containing only whitespace or a single placeholder line (e.g. "TODO") fails.

### Step 4 — Check the Anti-Rationalization Table

Confirm the "Anti-Rationalization Table" section contains a markdown table with a header row, separator row, and **at least 3 data rows**. Fewer than 3 rows is a weak table — flag it.

### Step 5 — Check Trigger Conditions for concreteness

Confirm "Trigger Conditions" lists **at least 2 bullet points**, and at least one bullet contains a quoted user phrase (e.g. `"do X"`) or a concrete situational trigger — not just "when relevant" or "when needed".

### Step 6 — Report results

Produce a pass/fail report in this shape:

```markdown
### Skill Anatomy Check: <skill-name>

- [ ] All 7 sections present, in order
- [ ] Every section has non-empty content
- [ ] Anti-Rationalization Table has >= 3 rows
- [ ] Trigger Conditions has >= 2 concrete bullets

### Issues
- <specific missing/weak items, with section name and what's needed>
```

If all 4 checks pass, state **PASS**. Otherwise state **FAIL** and list every issue — never report PASS with unresolved issues.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|---|---|
| "The headings look right at a glance, that's good enough" | Section *names* matching isn't the check — empty or placeholder content under a correct heading still fails Step 3. |
| "This skill is simple, it doesn't need a full Anti-Rationalization table" | Every skill in this catalog has one. A thin table is a sign the skill hasn't been pressure-tested against agent excuses — flag it, don't waive it. |
| "Trigger Conditions says 'when relevant', that's fine" | Vague triggers are why skills get under- or over-invoked. Step 5 exists specifically to catch this. |
| "I'll skim the file instead of reading it in full" | Section boundaries and content can't be verified from a skim — read the whole `SKILL.md`. |

## 5. Red Flags

- Reporting PASS without explicitly checking all 4 items in Step 6
- Treating a renamed section (e.g. "## Common Pitfalls" instead of "## Red Flags") as a match
- Counting a table's header + separator rows toward the 3-row data minimum
- Validating a file that isn't a `SKILL.md` (e.g. a workflow or command file) — those don't follow this anatomy

## 6. Verification Gate

- [ ] All 7 required section headings found, in the correct order
- [ ] Every section has at least one non-blank content line
- [ ] Anti-Rationalization Table has >= 3 data rows
- [ ] Trigger Conditions has >= 2 bullets, at least one concrete
- [ ] Report explicitly states PASS or FAIL with an itemized issue list

## 7. References

- [codebase-mapper/SKILL.md](../codebase-mapper/SKILL.md) — example of a skill that fully complies with the 7-section anatomy
