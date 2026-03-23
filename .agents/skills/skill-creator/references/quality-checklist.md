# Quality Checklist

Run through this checklist before presenting a generated skill to the user. Every item must pass.

## Structure

- [ ] Folder name is kebab-case and matches `name` in frontmatter
- [ ] `SKILL.md` exists at the root of the skill folder
- [ ] YAML frontmatter has `name`, `description`, and `metadata.pattern`
- [ ] `references/` directory exists (even if only `gotchas.md`)
- [ ] No empty files or placeholder content

## Frontmatter

- [ ] `name` is kebab-case
- [ ] `description` is a single sentence with trigger keywords
- [ ] `pattern` is one of: `tool-wrapper`, `pipeline`, `generator`, `reviewer`, `inversion`
- [ ] `domain` is present and is a short slug (optional for inversion pattern)

## Body Content

- [ ] Starts with a `**Role**` statement
- [ ] Has 3-5 Primary Directives
- [ ] Has at least 2 Core Responsibility sections
- [ ] Has a Gotchas section with at least 3 items
- [ ] Reference files are loaded with `Load references/{file}.md` syntax
- [ ] No generic filler — every rule is specific and actionable

## Pattern Compliance

- [ ] **Pipeline**: Has gate conditions between every step ("DO NOT proceed until...")
- [ ] **Generator**: Has an `assets/` directory with at least one template file
- [ ] **Reviewer**: Has a `references/review-checklist.md`
- [ ] **Inversion**: Has numbered Phases with gate conditions and explicit questions
- [ ] **Tool Wrapper**: Does NOT have gate conditions (it's reference material, not sequential)

## Quality

- [ ] No trailing period on the last line
- [ ] No duplicate information between SKILL.md and reference files
- [ ] Every gotcha is a real, practical mistake — not a generic platitude
- [ ] File references point to files that actually exist
- [ ] No TODO, FIXME, or placeholder text remaining
