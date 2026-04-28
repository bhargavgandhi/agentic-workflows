# codebase-mapper Gotchas

## 1. Scanning beyond depth 2
Reading every file in `src/` to understand the structure violates the Global Agent Rules no-full-scan rule. List directories first, then read only 2–3 representative filenames per layer to confirm the assignment. Save deep reads for the "Key Files" step.

## 2. Overwriting CLAUDE.md
If a CLAUDE.md already exists, append a `## Codebase Map` section pointing to `.codebase-intel/CODEBASE.md`. Never overwrite the existing file — it may contain project-specific rules and context the team has written manually.

## 3. Generic folder descriptions
"Contains utility files" is not useful. Every folder summary must answer: "What does an agent need to know to decide whether to look here for a change?" If the description doesn't help with that decision, rewrite it.

## 4. Skipping the "Where to Make Common Changes" section
This section is the highest-value part of the document for agents. Without it, CODEBASE.md is just a README mirror. Always include at least 3 common change types with specific directory paths.

## 5. Mapping test directories as business logic
Test directories (`__tests__/`, `spec/`, `e2e/`) are the test layer, not business logic. Mark them correctly — agents should not be directed to `tests/` when asked to implement a feature.

## 6. Forgetting monorepo packages
In monorepos, each `packages/{name}/` or `apps/{name}/` is its own app with its own folder structure. Map each package separately in the Folder Map section.
