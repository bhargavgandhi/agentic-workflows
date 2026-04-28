---
name: codebase-mapper
description: Produces a structured CODEBASE.md that maps the app's folder anatomy, key files, and layer responsibilities — giving any agent an instant orientation without re-scanning the whole repo. Invoke when onboarding to a new repo or before a major refactor.
version: 1.0.0
category: process
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- User says "document the codebase", "map the project structure", "where do I make changes for X", "generate a codebase guide", or "create an architecture overview"
- Onboarding to a new or unfamiliar repo at the start of a session
- Before a major refactor that spans multiple directories
- A CLAUDE.md is missing or empty and needs to be bootstrapped with structure

## 2. Prerequisites

- The target repo is accessible with at least a root-level directory structure
- Agent has read access to the project root
- Do NOT invoke on repos with fewer than 10 source files — a CLAUDE.md comment is sufficient

## 3. Steps

### Step 1 — Scan top-level and second-level directory structure

List directories to depth 2 only. Do not recurse further.

Exclude: `node_modules/`, `.git/`, `dist/`, `build/`, `.next/`, `coverage/`, `__pycache__/`

For each directory found, note: name, approximate file count, dominant file extension.

**Gate**: produce the directory list before proceeding. Do not open individual files yet.

### Step 2 — Identify the app's key layers

Map each directory to a logical layer:

| Layer | Examples |
|---|---|
| Entry points | `src/index.ts`, `app.py`, `main.go`, `pages/`, `routes/`, `cmd/` |
| Business logic | `services/`, `domain/`, `use-cases/`, `handlers/` |
| Data access | `repositories/`, `models/`, `db/`, `prisma/`, `migrations/` |
| UI / Presentation | `components/`, `views/`, `screens/`, `templates/` |
| Config / Infra | `config/`, `infra/`, `.github/`, `docker/`, `k8s/` |
| Shared utilities | `utils/`, `helpers/`, `lib/`, `common/`, `shared/` |
| Tests | `__tests__/`, `tests/`, `spec/`, `e2e/` |

For each layer identified, read at most 2–3 representative file names (not their contents) to confirm the layer assignment.

### Step 3 — Identify the 10 most important files

Based on the layer map, identify the 10–15 files most likely to be touched by agents. Criteria:
- Entry points (where the app starts)
- Core service files (main business logic)
- Router/controller files (API surface)
- Database schema or ORM model files
- Config files (`tsconfig.json`, `package.json`, `pyproject.toml`, `.env.example`)

For each, read only the first 20 lines to confirm purpose.

### Step 4 — Write CODEBASE.md

Load `assets/codebase-map-template.md` and populate it with:
- App overview (1–3 sentences from README or package.json description)
- Folder map (each directory with a one-paragraph purpose summary)
- Layer diagram (text-based, no external rendering needed)
- Key files table (file path + one-line responsibility)
- Where to make common changes (e.g., "Adding a new API endpoint → `src/routes/`")

Write output to `.codebase-intel/CODEBASE.md`. Create the directory if it doesn't exist.

For monorepos, write one CODEBASE.md at the root. Use sub-sections per package in the Folder Map (e.g., `## Package: apps/web`). Do not write separate CODEBASE.md files per package.

If a CLAUDE.md already exists at root, append a `## Codebase Map` section pointing to `.codebase-intel/CODEBASE.md` — do not overwrite the existing CLAUDE.md.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|---|---|
| "I'll just scan the repo at the start of each session instead" | That's the problem this skill solves. Re-scanning wastes 10–30 tool calls per session. CODEBASE.md is loaded in 1 read. |
| "The README already explains the structure" | READMEs are written for humans, not agents. They lack file paths, layer assignments, and "where do I make changes for X" guidance. |
| "I only need to understand the files relevant to this task" | Future agents don't know which files are relevant until they have a map. This is for them, not for the current session. |
| "I'll read the full src/ directory to be thorough" | Depth-2 scan + key file sampling is sufficient. Reading all source files violates the Global Agent Rules no-full-scan rule. |

## 5. Red Flags

- CODEBASE.md has no file paths — only generic descriptions
- Folder map has fewer than 5 entries for a repo with 10+ directories
- "Key files" table is missing or has fewer than 5 entries
- Agent read more than 15 files to produce the map (over-scanning)
- The "Where to make common changes" section is absent

## 6. Verification Gate

- [ ] CODEBASE.md exists at `.codebase-intel/CODEBASE.md`
- [ ] Every top-level directory in the repo has an entry in the Folder Map section
- [ ] Key files table has 10–15 entries with file paths and one-line descriptions
- [ ] "Where to make common changes" section covers at least 3 common change types
- [ ] Agent used ≤ 15 file reads to produce the entire document
- [ ] No individual file read exceeded 20 lines (Step 3 sampling constraint)
- [ ] Existing `CLAUDE.md` was not overwritten (only appended if present)

## 7. References

- [codebase-map-template.md](assets/codebase-map-template.md) — Output format template
- [gotchas.md](references/gotchas.md) — Common mistakes when mapping codebases
