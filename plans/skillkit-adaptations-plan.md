# Implementation Plan — SkillKit Gap Analysis Adaptations

**PRD**: `.agents/docs/prd-skillkit-gap-analysis-adaptations.md`  
**Date**: 2026-04-27  
**Tech Skills Required**: `backend-engineer`, `incremental-implementation`, `security-and-hardening`

---

## Slice 0 — Tracer Bullet: `.skills` manifest round-trip works end-to-end

**Goal**: `agents-skills init` writes a `.skills.json` manifest from the current install state, and `agents-skills install` reads it back and installs exactly those skills — no drift.

**Layers**: CLI command (`init.js`) → manifest writer (new `manifest.js` core module) → `skill-registry.js` → filesystem write → `install.js` reads manifest → installs skills

**Test**:

1. Run `agents-skills init` in a workspace with 3 installed skills
2. Confirm `.skills.json` exists with correct skill names, versions, and role
3. Delete installed skills from `.agents/`
4. Run `agents-skills install`
5. Confirm the same 3 skills are reinstalled, matching `.skills.json` exactly
6. Run `agents-skills doctor` — confirm zero drift reported

Maps to PRD success criterion: "Zero drift between manifest and installed set"

**Tech skills**: `backend-engineer`  
**Commit**: `feat: add .skills manifest write on init and read on install`

---

## Slice 1 — `--dry-run` flag on install shows manifest diff without writing

**Goal**: Running `agents-skills install --dry-run` with a `.skills.json` present prints what would be installed/updated/removed without touching the filesystem.

**Layers**: `install.js` → manifest reader → diff engine (new) → console output only

**Test**:

1. Have `.skills.json` with 3 skills; currently install 2 of them
2. Run `agents-skills install --dry-run`
3. Output must show: 1 to-install, 2 already-current, 0 removed — no files written
4. Confirm `.agents/` directory unchanged after dry run

Maps to PRD success criterion: "`install --dry-run` shows diff without writing files"

**Tech skills**: `backend-engineer`  
**Commit**: `feat: add --dry-run flag to install command for manifest diff preview`

---

## Slice 2 — `doctor` detects drift between manifest and installed skills

**Goal**: `agents-skills doctor` warns when installed skills differ from `.skills.json` — wrong versions, extra skills, missing skills.

**Layers**: `doctor.js` (extend existing) → manifest reader → installed skill scanner → diff reporter

**Test**:

1. `.skills.json` declares `grill-me@1.2.0`; install `grill-me@1.1.0`
2. Run `agents-skills doctor`
3. Output must include: `[DRIFT] grill-me: manifest=1.2.0, installed=1.1.0`
4. Run `agents-skills install` to fix; run `doctor` again — zero drift

Maps to PRD success criterion: "`doctor` flags drift between manifest and installed set"

**Tech skills**: `backend-engineer`  
**Commit**: `feat: extend doctor to detect drift between .skills manifest and installed skills`

---

## Slice 3 — Security scanner detects HIGH-severity findings in skill files

**Goal**: `agents-skills scan` runs against installed skills and reports HIGH-severity findings (hardcoded secrets, prompt injection, destructive ops without gates) with file name, line number, and remediation hint.

**Layers**: New CLI command `scan.js` → new core module `security-scanner.js` → rule engine (JSON rules) → file reader → console reporter

**Test**:

1. Add a test skill file containing `sk-abc123` on line 7
2. Run `agents-skills scan`
3. Output must include: `[HIGH] secrets  test-skill/SKILL.md:7  Hardcoded API key pattern (sk-...)`
4. Run `time agents-skills scan` on a 50-skill workspace — must complete in < 5s

Maps to PRD success criteria: "Scan detects hardcoded `sk-` key", "Completes in < 5s for ≤ 50 skills"

**Tech skills**: `backend-engineer`, `security-and-hardening`  
**Commit**: `feat: add agents-skills scan command with HIGH-severity detection rules`

---

## Slice 4 — Scanner escape hatch and full rule set (MEDIUM + LOW)

**Goal**: `# agents-skills ignore: <rule>` suppresses a specific finding. MEDIUM and LOW rules (XSS, destructive ops, anatomy checks) are active. `--strict` enables expanded rules.

**Layers**: `security-scanner.js` (extend) → inline comment parser → rule set expansion → `--strict` flag in `scan.js`

**Test**:

1. Add `# agents-skills ignore: secrets` above the `sk-abc123` line
2. Run `agents-skills scan` — HIGH finding must be absent
3. Add a skill missing the Verification Gate section
4. Run `agents-skills scan` — `[LOW] anatomy` finding must appear
5. Run `agents-skills scan --strict` — additional rules fire

Maps to PRD success criterion: "`ignore` comment suppresses finding"

**Tech skills**: `backend-engineer`  
**Commit**: `feat: add scanner escape hatch, MEDIUM/LOW rules, and --strict flag`

---

## Slice 5 — Primer generates `.claude/CLAUDE.md` from detected stack + installed skills

**Goal**: `agents-skills init --primer` scans the project with `project-detector.js`, reads installed skills, and writes a `.claude/CLAUDE.md` containing: tech stack summary, active skills list, and available slash commands.

**Layers**: `init.js` (extend with `--primer` flag) → `project-detector.js` (already exists) → new `primer-generator.js` core module → new `claude.md` template → filesystem write

**Test**:

1. Run in a Next.js + TypeScript workspace with `grill-me`, `react-query`, `security-and-hardening` installed
2. Run `agents-skills init --primer`
3. Confirm `.claude/CLAUDE.md` exists and contains:
   - Framework: Next.js, Language: TypeScript
   - Skills: grill-me, react-query, security-and-hardening
   - Commands: `/build-feature`, `/grill-me`, `/ship`, `/write-a-prd`
4. Run again — confirm file is updated incrementally (no overwrite of custom sections)

Maps to PRD success criterion: "Primer generates `.claude/CLAUDE.md` with stack + skills + commands"

**Tech skills**: `backend-engineer`  
**Commit**: `feat: add --primer flag to init generating .claude/CLAUDE.md from detected stack`

---

## Slice 6 — Primer generates instruction files for Cursor and VS Code Copilot

**Goal**: `agents-skills init --primer` also writes `.cursor/.cursorrules` and `.github/copilot-instructions.md` alongside the Claude file.

**Layers**: `primer-generator.js` (extend) → adapter pattern per IDE → existing `src/adapters/` for IDE-specific format knowledge → filesystem write

**Test**:

1. Run `agents-skills init --primer` in any workspace
2. Confirm 3 files written: `.claude/CLAUDE.md`, `.cursor/.cursorrules`, `.github/copilot-instructions.md`
3. Each file must list the same skills and commands, formatted for its IDE
4. Running again with `--force` overwrites all; without `--force`, only appends new sections

Maps to PRD success criterion: "No skills listed that aren't installed; no installed skills omitted"

**Tech skills**: `backend-engineer`  
**Commit**: `feat: extend primer to generate cursor and copilot instruction files`

---

## Slice 7 — Memory capture: observations written on tool use via hooks

**Goal**: After each tool call in a session, an observation is written to `.agents/memory/observations/` capturing: tool name, outcome (success/failure), key result summary, timestamp.

**Layers**: New `memory-capture.js` hook → `hooks/` integration → observation file writer → `.agents/memory/observations/` directory

**Test**:

1. Enable memory hooks (default on)
2. Run any `agents-skills` command that invokes a tool
3. Confirm an observation `.json` file exists in `.agents/memory/observations/` with correct fields
4. Confirm no secret values are present (redacted by scanner patterns)

Maps to PRD success criterion: "PostToolUse hook records at least 1 observation per tool call"

**Tech skills**: `backend-engineer`  
**Commit**: `feat: add memory observation capture hook on tool use`

---

## Slice 8 — Memory compress: observations distilled into structured learnings

**Goal**: `agents-skills memory compress` reads all pending observations and produces structured learning files in `.agents/memory/learnings/` — each with title, tags, content, and effectiveness score.

**Layers**: New `memory.js` command → new `memory-compressor.js` core module → observation reader → learning writer → index updater (`index.json`)

**Test**:

1. Seed 5 observation files in `.agents/memory/observations/`
2. Run `agents-skills memory compress`
3. Confirm ≥ 1 learning file created in `.agents/memory/learnings/`
4. Confirm `index.json` updated with title, tags, timestamp
5. Run `agents-skills memory compress` again with same input — no duplicate learnings

Maps to PRD success criterion: "`memory compress` converts ≥ 3 observations into 1 structured learning"

**Tech skills**: `backend-engineer`  
**Commit**: `feat: add memory compress command distilling observations into learnings`

---

## Slice 9 — Memory search and status

**Goal**: `agents-skills memory search <query>` returns relevant learnings by tag and content match. `agents-skills memory status` shows observation count, learning count, and last compression timestamp.

**Layers**: `memory.js` (extend) → `index.json` reader → text search (Layer 1: index, Layer 2: excerpts) → console output

**Test**:

1. Seed 3 learnings with different tags
2. Run `agents-skills memory search "typescript"`
3. Confirm only learnings tagged or containing "typescript" returned
4. Run `agents-skills memory status` — shows correct counts and last-compressed date

Maps to PRD success criterion: "Memory inject loads top-3 relevant learnings in < 200 tokens"

**Tech skills**: `backend-engineer`  
**Commit**: `feat: add memory search and status subcommands`

---

## Slice 10 — Memory inject: top learnings surfaced at session start

**Goal**: `agents-skills memory inject` reads `index.json`, scores learnings by relevance to the current project context, and outputs the top-3 as a compact markdown block (< 200 tokens) to be prepended to the session.

**Layers**: `memory.js` (extend) → `project-detector.js` for context → relevance scorer → progressive disclosure (Layer 1 by default) → stdout output

**Test**:

1. Have 5 learnings; 2 tagged `react`, 1 tagged `security`, 2 tagged `typescript`
2. Run in a React + TypeScript project
3. `memory inject` output must include the 2 `react` learnings and 2 `typescript` learnings (capped at 3 total by token budget)
4. Token count of output: < 200 (verified via `agents-skills tokens`)

Maps to PRD success criterion: "Inject loads top-3 in < 200 tokens"

**Tech skills**: `backend-engineer`  
**Commit**: `feat: add memory inject command surfacing top learnings at session start`

---

## Slice 11 — Memory export: learning promoted to a full skill

**Goal**: `agents-skills memory export <learning-name>` converts a structured learning into a new SKILL.md with all 7 sections, placed in `skills/<learning-name>/`.

**Layers**: `memory.js` (extend) → learning reader → skill scaffolder (reuse pattern from `skill-creator`) → SKILL.md writer → `skills.json` updater

**Test**:

1. Have a learning `prefer-zod-validation` in `.agents/memory/learnings/`
2. Run `agents-skills memory export prefer-zod-validation`
3. Confirm `skills/prefer-zod-validation/SKILL.md` created with all 7 sections populated
4. Run `agents-skills doctor` — new skill passes anatomy check

Maps to PRD success criterion: "`memory export` creates a valid SKILL.md that passes doctor anatomy check"

**Tech skills**: `backend-engineer`  
**Commit**: `feat: add memory export command promoting learnings to skills`

---

## Slice 12 — Conditional + parallel execution in `/build-feature` quality gates

**Goal**: In `/build-feature` Phase 4 (quality gates), lint + typecheck + test run in parallel. Phase 5 (security) is skipped automatically when only `.md` or config files changed.

**Layers**: Workflow markdown files (`skills/`) → new `parallel-group` and `condition` comment directives → workflow executor logic (extend `context-compactor.js` or a new `workflow-runner.js`)

**Test**:

1. Run `/build-feature` on a branch with only `.md` file changes
2. Confirm Phase 5 log shows: `skipped: no source files changed`
3. Run `/build-feature` on a branch with `.ts` changes
4. Confirm lint + typecheck + test all start within 1s of each other (parallel)
5. Wall time for Phase 4 must be < sum of individual tool times

Maps to PRD success criteria: "Security scan skipped on docs-only change", "Parallel Phase 4 wall time < serial sum"

**Tech skills**: `backend-engineer`, `incremental-implementation`  
**Commit**: `feat: add conditional skip and parallel execution to build-feature quality gates`

---

## Optional Slices (post-MVP)

- [ ] `memory sync-claude` — auto-populate CLAUDE.md `## LEARNED` section from high-confidence learnings — depends on: Slice 9, Slice 10
- [ ] Global memory at `~/.agents-skills/memory/` — share learnings across projects — depends on: Slice 8
- [ ] Primer config file (`.agents/primer-config.json`) — custom templates, update strategy — depends on: Slice 6
- [ ] Conditional + parallel execution in `/build-quick` — depends on: Slice 12
- [ ] Skill Marketplace / community registry — deferred, requires hosting

---

## Risks

| Risk                                                                        | Slice Affected | Mitigation                                                                                                                  |
| --------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Memory inject exceeds 40% token budget                                      | 10             | Hard cap at 200 tokens (Layer 1 index only). `--deep` flag for Layer 2. Measure every injection with `tokens` subcommand.   |
| Primer `--primer` overwrites user-customized CLAUDE.md                      | 5, 6           | Default: incremental (append only). `--force` required to overwrite. Backup written to `.agents/backups/` before any write. |
| Scanner false positives erode trust                                         | 3, 4           | Ship ≤ 15 conservative rules. `--strict` opt-in for expanded set. `ignore` escape hatch on day one, not as a follow-up.     |
| `.skills` manifest version conflicts break team installs                    | 0, 1, 2        | `--dry-run` surfaces conflicts before any write. Conflict UI: overwrite / keep / skip (mirrors existing `upgrade` flow).    |
| Parallel execution in Phase 4 causes interleaved output that's hard to read | 12             | Buffer each tool's output, print sequentially after all finish. Show a live status line per running tool during execution.  |
