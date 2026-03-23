# Naming Conventions

## Folder & File Names

- **Skill folder**: kebab-case, short and descriptive → `react-native`, `payload-cms`, `git-workflow`
- **SKILL.md**: Always uppercase `SKILL.md` — this is the entry point every agent looks for
- **References**: `references/{topic}.md` in kebab-case → `gotchas.md`, `navigation-patterns.md`
- **Assets**: `assets/{filename}` for templates, scaffolds, or static files → `architecture-template.md`, `Component.tsx`

## SKILL.md Frontmatter

```yaml
---
name: kebab-case-name       # Must match the folder name
description: One sentence    # Used by agents to decide when to trigger
metadata:
  pattern: tool-wrapper      # One of: tool-wrapper, pipeline, generator, reviewer, inversion
  domain: short-slug         # Technology domain (e.g., react-native-expo)
---
```

### Rules

1. `name` must be kebab-case and match the folder name exactly
2. `description` must be a single sentence that tells the agent WHEN to trigger this skill
3. Include user-intent keywords in the description: "when the user asks about...", "use when..."
4. `pattern` must be one of the 5 defined patterns
5. `domain` is a short slug for the technology domain

## Skill Body Structure

```
# {emoji} {Title}

**Role**: You are an expert...

## 🎯 Primary Directives
(3-5 numbered directives)

---

## 🏗 Core Responsibilities & Workflows
(Numbered sections with ### headings)

## Gotchas
(Numbered list of common mistakes)
```

### Rules

1. Always start with a Role statement
2. Primary Directives: 3-5 rules that are ALWAYS active
3. Core Responsibilities: Detailed sections covering the skill's domain
4. Reference file loads: Use `Load references/{file}.md` to point the agent to deeper content
5. Gotchas: Numbered list at the bottom — the most common mistakes agents make
6. No trailing periods on the last line of the file
