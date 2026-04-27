# [PRD] SkillKit Gap Analysis & Feature Adaptations for agents-skills

**Date:** 2026-04-27  
**Status:** Ready for implementation planning  
**Author:** Bhargav Gandhi

---

## Problem Statement

`agents-skills` and SkillKit are both skill distribution platforms for AI coding agents, but they solve different halves of the same problem. SkillKit wins on **ecosystem intelligence** (persistent memory across sessions, auto-generated agent instructions, security scanning, team manifests). `agents-skills` wins on **process discipline** (opinionated dev lifecycle, token budgeting, multi-IDE delivery, 7-section skill anatomy).

Developers using `agents-skills` repeatedly re-explain context to agents across sessions, manually write CLAUDE.md files for every project, and have no automated safety net catching security issues before review. These are solvable with targeted adaptations from SkillKit's model — without abandoning what makes `agents-skills` distinct.

**For whom:** `agents-skills` users — solo developers and engineering teams using Claude Code, Cursor, or VS Code Copilot.  
**Why now:** SkillKit has shipped these features and is building mindshare. The adaptations are well-scoped and high-value. The window to own these capabilities in `agents-skills` is 2–4 sprints.

---

## Target Users

| User | Role | Goal | Knowledge Level |
|------|------|------|-----------------|
| Solo developer | Full-stack engineer | Agent remembers what it learned last session; no re-explaining the same context | Comfortable with CLI, unfamiliar with agent internals |
| Team lead | Engineering manager | Commit one manifest so every engineer gets the same skill set without manual sync | High engineering literacy, low agent tooling depth |
| Security-conscious developer | Backend/infra engineer | CLI catches prompt injection and secret leakage automatically, not just via a review checklist | High security awareness, moderate agent tooling depth |
| New project starter | Any engineer | `agents-skills init` generates native IDE instruction files, not just a JSON profile | Beginner to agent tooling |

---

## User Stories

1. As a **solo developer**, I want the agent to automatically inject what it learned in previous sessions at the start of a new session, so I don't re-explain project conventions every time.

2. As a **solo developer**, I want observations captured automatically during a session (tool outcomes, errors, solutions) and compressed into reusable learnings, so the system gets smarter over time without manual effort.

3. As a **developer starting a new project**, I want `agents-skills init` to scan my codebase and generate native instruction files (`.claude/CLAUDE.md`, `.cursor/.cursorrules`, `.github/copilot-instructions.md`) automatically, so I don't write agent configuration by hand.

4. As a **team lead**, I want to commit a `.skills` manifest to the repo so every engineer gets the same skill set and versions when they run `agents-skills install`, without any manual sync.

5. As a **security-conscious developer**, I want `agents-skills scan` to automatically detect prompt injection patterns, leaked secrets, and command injection in my skills and code, so I catch risks before they reach review — not just via a checklist skill.

6. As a **developer**, I want workflows to skip irrelevant steps automatically (e.g. skip security scan if no `.ts` files changed) and run independent steps in parallel (e.g. lint + test simultaneously), so workflows finish faster and waste less context.

7. As a **developer**, I want session handoff documents auto-generated at the end of every session, so the next session picks up exactly where I left off without me running `/compact` manually.

---

## Feature Breakdown

### F1 — Memory System (P0)

**What it is:** Persistent, automatic learning across sessions. Three lifecycle hooks capture and inject context without user intervention.

**Gap today:** `compact` exists but is manual, flat, and not searchable. There is no automatic capture, no learning extraction, no progressive injection.

**Adaptation from SkillKit:**

| SkillKit Concept | agents-skills Adaptation |
|---|---|
| SessionStart hook — inject prior learnings | `agents-skills memory inject` — reads learnings index, injects top-N by relevance into session context |
| PostToolUse hook — record observations | Hook into existing `hooks/` system to capture tool outcomes as raw observations |
| SessionEnd hook — compress observations | `compact` extended: auto-compress observations into learnings after every session |
| Progressive disclosure (3 layers) | Layer 1: index titles + tags (~50 tokens). Layer 2: excerpts (~200 tokens). Layer 3: full content on demand |
| `memory export <name>` — convert learning to skill | `agents-skills memory export <name>` — promotes a learning into a new skill file |
| `memory sync-claude` — update CLAUDE.md | Extend `init` to write a `## LEARNED` section from high-confidence learnings |
| Global + project-scoped storage | `~/.agents-skills/memory/` (global) + `<project>/.agents/memory/` (project) |

**New CLI subcommands:**
- `agents-skills memory status` — show observation count, learning count, last compression
- `agents-skills memory search <query>` — find relevant learnings
- `agents-skills memory compress` — manually trigger compression
- `agents-skills memory export <name>` — convert learning → skill

---

### F2 — Primer: Auto-generated Agent Instructions (P0)

**What it is:** Static analysis of the codebase that generates native IDE instruction files for every installed agent — not a generic JSON profile.

**Gap today:** `agents-skills init` generates `project-profile.json`. That's internal config. Users still write `.claude/CLAUDE.md`, `.cursor/.cursorrules`, etc. by hand.

**Adaptation from SkillKit:**

Extend `agents-skills init` with a `--primer` flag (or make it the default behavior) that:

1. Runs `project-detector.js` (already exists) to identify framework, language, testing tools, linters
2. Reads installed skills from the local `.agents/` directory
3. Generates IDE-native instruction files tailored to the detected stack:
   - `.claude/CLAUDE.md` — for Claude Code
   - `.cursor/.cursorrules` — for Cursor
   - `.github/copilot-instructions.md` — for GitHub Copilot
   - `.vscode/copilot-instructions.md` — for VS Code Copilot
4. Instructions include: tech stack summary, active skills list, workflow commands available, coding standards derived from installed process skills

**Configuration:** `.agents/primer-config.json` — override templates, add custom guidelines, set update strategy (incremental vs. forced regeneration).

**Key difference from SkillKit:** Our Primer is skills-aware — it lists which `/build-feature`, `/grill-me`, `/ship` commands are available and what each phase does, not just generic coding standards.

---

### F3 — `.skills` Manifest for Team Distribution (P1)

**What it is:** A git-committable `.skills.json` manifest that declares the exact skill set and versions a project requires. Running `agents-skills install` with a manifest present installs exactly what's declared — no drift, no manual sync.

**Gap today:** No declarative install. Every engineer runs the interactive wizard independently, which diverges over time.

**Manifest format:**
```json
{
  "version": "1.0",
  "role": "fullstack",
  "skills": [
    { "name": "grill-me", "version": "1.2.0" },
    { "name": "security-and-hardening", "version": "1.0.0" },
    { "name": "react-query", "version": "2.1.0" }
  ],
  "packs": ["react-pack"]
}
```

**CLI behavior:**
- `agents-skills init` — writes `.skills.json` based on current install
- `agents-skills install` — detects `.skills.json` and installs from it (prompts if no manifest found)
- `agents-skills install --dry-run` — shows what would be installed/updated before touching files
- `agents-skills doctor` — extended to flag drift between installed skills and `.skills.json`

---

### F4 — Security Scanner CLI (P1)

**What it is:** A new `agents-skills scan` subcommand that runs automated detection rules against skill files and optionally the workspace, catching issues before they reach review.

**Gap today:** `security-and-hardening` skill exists as an **agent instruction** (tells the agent what to check manually). There is no **automated CLI scan** — no `agents-skills scan` command, no rule engine, no file-level findings.

**What gets scanned:**
- Installed skill `.md` files — for prompt injection patterns, embedded secrets, unsafe instructions
- Workspace files (opt-in via `--workspace`) — for hardcoded secrets, command injection, unsafe `eval` usage

**Detection rules (initial set, ≥ 10 at launch):**

| Rule | Category | Severity |
|------|----------|----------|
| Hardcoded API key pattern (`sk-`, `AKIA`, `ghp_`) | Secrets | HIGH |
| `process.env` values committed directly | Secrets | HIGH |
| Prompt injection markers (`ignore previous instructions`) | Prompt injection | HIGH |
| `eval()` with dynamic input | Command injection | HIGH |
| `exec()` / `execSync()` with string concat | Command injection | HIGH |
| `innerHTML` assignment | XSS | MEDIUM |
| `git push --force` in skill instructions | Destructive ops | MEDIUM |
| `rm -rf` without confirmation gate | Destructive ops | MEDIUM |
| Missing `# agents-skills ignore` escape hatch documentation | Config | LOW |
| Skill missing verification gate section | Anatomy | LOW |

**Output format:**
```
SCAN RESULTS — 3 findings

[HIGH]   secrets         skills/my-skill/SKILL.md:14   Hardcoded API key pattern detected (sk-...)
                         Fix: Move to environment variable. Add to .gitignore.

[MEDIUM] destructive-ops skills/deploy/SKILL.md:42     `git push --force` without confirmation gate
                         Fix: Add "Ask" scope boundary before any force-push instruction.

[LOW]    anatomy         skills/new-skill/SKILL.md      Missing Verification Gate section (section 6)
                         Fix: Add verification checklist before marking skill complete.
```

**Escape hatch:** `# agents-skills ignore: <rule-name>` inline comment suppresses a specific rule for that line.

---

### F5 — Conditional & Parallel Workflow Execution (P1)

**What it is:** Workflow steps that skip automatically when conditions aren't met, and independent steps that run in parallel where possible.

**Gap today:** All workflow phases are sequential and unconditional. Security scan always runs even on a docs-only change. Lint and test always run serially even when they have no dependency on each other.

**Adaptation from SkillKit:** We keep our markdown-based workflow format (not YAML) but add frontmatter-level metadata to skill invocations.

**Conditional execution** — in workflow markdown, steps can declare a condition:
```
<!-- condition: files.changed('**/*.ts', '**/*.tsx') -->
Run `/security-review` only if TypeScript files changed.
```

**Parallel step groups** — steps in the same parallel group run simultaneously:
```
<!-- parallel-group: quality -->
- Run lint
- Run type-check
- Run tests
<!-- end-parallel-group -->
```

**Where this is meaningful (not everywhere):**
- `/build-feature` Phase 4 (quality gates): lint + typecheck + test → run in parallel
- `/build-feature` Phase 5 (security): skip if only docs/config files changed
- `/build-quick` Phase 2 (verify): skip security gate on pure refactors (files.changed excludes new dependencies)
- `/refactor-workflow`: skip PRD and grill-me phases unconditionally (already excluded by design)

**Where it is NOT added:** Phase gates that enforce process discipline (grill-me before PRD, PRD before plan) remain sequential and unconditional — that's the core value proposition.

---

## Updated Competitive Gap Analysis

| Feature | Priority | Status |
|---------|----------|--------|
| Memory System (persistent learning across sessions) | **P0** | Not built |
| Primer (auto-generate IDE instruction files) | **P0** | Partially built (`project-detector.js` exists; output is JSON only) |
| `.skills` manifest for team distribution | **P1** | Not built |
| Security Scanner CLI (`agents-skills scan`) | **P1** | Skill exists (manual checklist); no automated CLI scan |
| Conditional + parallel workflow execution | **P1** | Not built |
| Skill Marketplace / Registry | P2 | Deferred — requires hosting infrastructure |
| MCP Server / REST API | P3 | Deferred |
| Chrome Extension | P3 | Deferred |
| Mesh networking / inter-agent messaging | Never | Out of scope |

---

## Scope Boundaries

### Always (implement without asking)
- Memory system: lifecycle hooks, compression, injection, `memory` subcommand group
- Primer: extend `agents-skills init` to generate IDE-native instruction files from detected stack + installed skills
- `.skills` manifest: `init` writes it, `install` reads it, `doctor` validates drift
- Security scanner: `agents-skills scan` with ≥ 10 rules, local-only, escape hatch support
- Conditional + parallel execution in `/build-feature` and `/build-quick` quality gate phases only

### Ask (confirm before implementing)
- Memory `export` → skill promotion: confirm skill anatomy is enforced on exported learnings
- Primer generating instructions for agents beyond the 4 currently supported IDEs
- Security scanner `--workspace` flag: confirm scope of files scanned to avoid false positives on user code
- Parallel execution in phases beyond quality gates: confirm process integrity is preserved

### Never (explicitly excluded from this version)
- Mesh P2P networking or inter-agent messaging
- Replacing the 7-section skill anatomy with any other format
- Removing role-based install wizard in favor of a flat marketplace
- Transmitting any skill content or memory data to external services — all analysis is local
- Making `compact` a no-op in favor of memory system — both coexist; `compact` remains for explicit session snapshots

---

## Success Criteria

| Feature | Criterion | Pass |
|---------|-----------|------|
| Memory — capture | `PostToolUse` hook records at least 1 observation per tool call | Observation file created in `.agents/memory/observations/` |
| Memory — compress | `memory compress` converts ≥ 3 observations into 1 structured learning | Learning file created with title, tags, content |
| Memory — inject | `memory inject` loads top-3 relevant learnings in < 200 tokens at session start | Token count verified via `agents-skills tokens` |
| Memory — export | `memory export my-learning` creates a valid SKILL.md with all 7 sections | File passes `doctor` anatomy check |
| Primer | `agents-skills init --primer` generates `.claude/CLAUDE.md` for a Next.js project | File contains: stack summary, active skills list, available slash commands |
| Primer | Generated files reflect installed skills accurately | No skills listed that aren't installed; no installed skills omitted |
| `.skills` manifest | `init` writes `.skills.json`; fresh `install` installs exactly those skills | Zero drift between manifest and installed set |
| `.skills` manifest | `install --dry-run` shows diff without writing files | Dry run output matches actual install (verified by running both) |
| Security scanner | `scan` detects a hardcoded `sk-` API key in a test skill file | HIGH finding returned with file + line number |
| Security scanner | `scan` completes in < 5s for a workspace with ≤ 50 skills | Measured via `time agents-skills scan` |
| Security scanner | `# agents-skills ignore: secrets` suppresses the finding | Finding absent from output |
| Parallel execution | Lint + typecheck + test run concurrently in `/build-feature` Phase 4 | Wall time < sum of individual times |
| Conditional execution | Security scan skipped when only `.md` files changed | Phase 5 log shows "skipped: no source files changed" |
| Zero regression | All 4 master workflows complete end-to-end after each feature lands | No phase errors in a clean run |

---

## Non-Functional Requirements

**Performance**
- Memory inject: top-3 learnings loaded in < 100ms, < 200 tokens at Layer 1
- Memory compress: processes ≤ 20 observations in < 3s
- `agents-skills scan`: < 5s for ≤ 50 skills
- Primer generation: < 10s for any project under 500 files
- `.skills` manifest install: adds < 10s to existing `npx agents-skills install` flow

**Security**
- All memory data stored locally only — no external transmission
- Scanner rules are plain `.json` / `.md` files in the repo — version-controlled and auditable
- `.skills` manifest validated against JSON schema before any install executes
- Memory learnings do not capture secret values — observations redact patterns matching scanner rules

**Developer Experience**
- All new subcommands follow existing CLI output conventions (spinner, color-coded severity)
- `--dry-run` available on any command that writes files
- Every new command added to `agents-skills --help` output
- Memory system is opt-out, not opt-in — active by default, disabled via `--no-memory` flag

**Platform Support**
- macOS, Linux, Windows (WSL) — all features
- Node.js ≥ 18 — no new runtime dependencies beyond what's already in `package.json`

---

## Dependencies & Risks

### Dependencies
- `src/core/project-detector.js` — Primer reuses this; must be extended to output IDE-native formats
- `src/core/context-compactor.js` — Memory compress pipeline builds on this
- `hooks/` directory — lifecycle hooks for memory capture integrate here
- `skills.json` registry — `.skills` manifest format must stay compatible

### Top Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Memory injection adds too many tokens, violating 40% budget rule | Medium | High | Cap injection at 200 tokens (Layer 1 only by default). `--deep-memory` flag for Layer 2/3. Measure via `tokens` subcommand. |
| Security scanner false-positive rate erodes trust | Medium | High | Launch with ≤ 15 conservative rules. `--strict` flag for expanded rules. `ignore` escape hatch from day one. |
| `.skills` manifest version conflicts break team installs | Medium | Medium | `--dry-run` surfaces conflicts before any write. Conflict resolution: `overwrite / keep / skip` prompts (same pattern as existing upgrade flow). |
| Primer-generated files overwrite user-customized CLAUDE.md | High | High | Default to incremental (append new sections only). `--force` required to overwrite. Always backup before write. |

---

## Out of Scope (Explicitly Deferred)

- Skill Marketplace / community registry (requires hosting + moderation)
- MCP Server / REST API
- Chrome Extension
- Mesh networking / inter-agent messaging
- Skill impact lineage tracking
- Support for agents beyond Claude Code, Cursor, VS Code Copilot, GitHub Copilot (Primer v1)

---

## Implementation Order

Recommended sequencing based on dependency graph and user impact:

1. **`.skills` manifest** — foundational, no dependencies, unblocks team adoption immediately
2. **Security Scanner CLI** — self-contained, high trust signal, extends existing `security-and-hardening` skill
3. **Primer** — extends `project-detector.js` (already exists), high first-impression value
4. **Memory System** — most complex, depends on hooks infrastructure; build capture → compress → inject in sequence
5. **Conditional + parallel execution** — last, depends on understanding workflow execution after other features land

---

## Next Step

Run `/prd-to-plan` to convert this PRD into a tracer-bullet implementation plan with vertical slices.
