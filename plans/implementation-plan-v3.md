# Implementation Plan — agents-skills v3.0

**Source of Truth**: [prd-v3.md](./prd-v3.md)  
**Grill Analysis**: Completed — all critical assumptions resolved  
**Status**: Ready for execution  
**Date**: 2026-04-17

---

## Decisions Locked Before Implementation

| Decision | Resolution |
|----------|-----------|
| Skill label | "Mandatory Process Skills" → **Core Skills** |
| Optional skill label | "Optional Process Skills" → **Optional Skills** |
| Default install UX | Role-based wizard (Frontend / Backend / Fullstack / Full) replaces all-in-one default |
| Tech skills default | Opt-in only. Installed via role or add-on prompts, never by default |
| Skill gap detection | Binary installed/not check only — **no NLP, no signal maps** |
| Master workflow variants | Separate workflows; no internal scope selector |
| `/build-fullstack-feature` | **Deleted** — redundant with `/build-feature` |
| `/build-quick` | **New** — 4-phase fast loop (grill → implement → review → ship) |
| Upgrade content hash | Deferred to v4 — version string only in v3 |
| `app-architect` | Deprecated. Replaced by `write-a-prd` + `prd-to-plan` |
| `doc-coauthoring` | Renamed to `documentation-and-adrs` |

---

## Phase A — Foundation (Prerequisites)

> Must land before any other phase. These unblock everything downstream.

### A1 — Update `skills.json` manifest schema to v3
**File**: `skills.json`  
**Changes**:
- Bump `schema_version` → `3.0.0`
- Add `category` field: `"process"` | `"technology"`
- Add `optional` field: `true` | `false` (Core Skills = `false`, Optional Skills = `true`, Tech Skills = `true`)
- Add `bundle` field: which install bundles include this skill (`["core", "frontend", "backend", "fullstack", "full"]`)
- Add `packs` array to each skill entry (existing logic, now explicitly in schema)
- Register `app-architect` as tombstone entry with `deprecated: true`, `replacement: "write-a-prd"`
- Register `doc-coauthoring` as tombstone entry with `deprecated: true`, `replacement: "documentation-and-adrs"`

---

### A2 — Role-Based Install Wizard (`install.js`)
**File**: `src/commands/install.js`  
**Replace**: `_fullWizard()` — the current all-in-one installer  
**New wizard flow** (5 steps):

```
Step 1: Scope          → Local workspace | Global (~/)
Step 2: IDE select     → multi-select (auto-detected highlighted)
Step 3: Role / Bundle  → single select:
    ⭐ Frontend   — Core Skills + frontend-pack
       Backend   — Core Skills + backend-pack
       Fullstack — Core Skills + frontend-pack + backend-pack
       Full      — Everything (all tech skills)
Step 4: Add-ons        → multi-select (only shown for Frontend/Backend/Fullstack)
    ○  Mobile (React Native)
    ○  CMS (Payload CMS)
    ○  Firebase
    ○  Testing (Playwright)
Step 5: Confirm + install
```

**Bundle definitions** (resolved at install time from `skills.json` bundle field):

| Bundle | Core Skills | Tech Skills |
|--------|-------------|------------|
| Frontend | All 12 | react-component-scaffolder, frontend-design, api-integration, react-query, rtk-query |
| Backend  | All 12 | backend-engineer, graphql-backend |
| Fullstack | All 12 | All frontend + all backend tech skills |
| Full | All 12 + 5 Optional | All 13 tech skills |

**Add-on mappings**:
- Mobile → `react-native`
- CMS → `payload-cms`
- Firebase → `firebase-setup`
- Testing → `playwright`

**Post-install hints** (reordered — master workflow first):
```
  /build-feature   → Start building (full lifecycle)
  /build-quick     → Quick tasks: implement → review → ship
  agents-skills init    → Generate project profile
  agents-skills doctor  → Verify workspace health
```

---

### A3 — `agents-skills list --registry` command
**File**: `src/commands/list.js` (new `--registry` flag)  
**Behavior**: Fetch `skills.json` from GitHub, diff against locally installed skills, print missing + available.

---

### A4 — `agents-skills install <pack>` resolution
**File**: `src/commands/install.js` (existing single-skill path)  
**Change**: When target matches a pack alias in `skills.json`, resolve to individual skill list and install each.  
**Already partially implemented in staged changes** — verify pack resolution logic is wired to new schema.

---

### A5 — `agents-skills compact --auto` flag
**File**: `src/commands/compact.js`  
**Change**: Accept `--auto <json>` flag. Parse JSON payload, skip interactive prompts, write snapshot directly.  
**Already staged** — verify and finalize.

---

### A6 — `agents-skills init` — model-agnostic default
**File**: `src/commands/init.js`  
**Change**: Add model-agnostic option as the default selection in the model picker.  
**Already staged** — verify and finalize.

---

## Phase B — New Core Skills

> Author in priority order. Each skill must use 7-section anatomy.

| Priority | Skill | Status | Notes |
|----------|-------|--------|-------|
| 1 | `grill-me` | ✅ Exists | Verify 7-section anatomy compliance |
| 2 | `write-a-prd` | ✅ Exists | Verify 7-section anatomy compliance |
| 3 | `prd-to-plan` | ✅ Exists | Verify 7-section anatomy compliance |
| 4 | `context-engineering` | ✅ Exists | Verify compact --auto integration |
| 5 | `source-driven-development` | ✅ Exists | Verify 7-section anatomy compliance |
| 6 | `incremental-implementation` | ✅ Exists | Verify 7-section anatomy compliance |
| 7 | `security-and-hardening` | ✅ Exists | Verify 7-section anatomy compliance |
| 8 | `ci-cd-and-automation` | ✅ Exists | Verify 7-section anatomy compliance |

---

## Phase C — Upgrade Existing Skills to 7-Section Anatomy

> Upgrade in order. Run `agents-skills doctor` after each batch.

| Priority | Skill | Target |
|----------|-------|--------|
| 1 | `code-reviewer` | Add anti-rationalization table + verification gate |
| 2 | `git-workflow` | Add trigger conditions, red flags, verification gate |
| 3 | `test-writing` | Add TDD process guidance (not just test authoring) |
| 4 | `skill-creator` | Add 7-section generation enforcement, progressive disclosure |
| 5 | `frontend-design` | Already upgraded (staged) — verify |
| 6 | `backend-engineer` | Add 7-section anatomy |
| 7 | `react-query`, `rtk-query`, `react-native` | Add 7-section anatomy |
| 8 | `graphql-backend`, `graphql-frontend` | Add 7-section anatomy |
| 9 | `firebase-setup` | Add 7-section anatomy |
| 10 | `payload-cms` | Add 7-section anatomy |
| 11 | `react-component-scaffolder`, `api-integration` | Add 7-section anatomy |
| 12 | `playwright`, `post-pr-review`, `debug-investigator` | Add 7-section anatomy |

**Deprecation actions** (handled in upgrade command + tombstone entries):
- `app-architect` → tombstone → replaced by `write-a-prd` + `prd-to-plan`
- `doc-coauthoring` → tombstone → replaced by `documentation-and-adrs`

---

## Phase D — Master Workflow & Slash Commands

### D1 — `/build-feature` (Master Workflow)
**File**: `.agents/workflows/build-feature.md`  
**Phases**:
```
Phase 0: Skill Check (binary — NOT NLP)
  └── Are Core Skills installed? If no → print install command and exit

Phase 1: Grill         [/grill-me]
  └── GATE: Every branch resolved?

Phase 2: PRD           [/write-a-prd]
  └── GATE: GitHub issue created?

Phase 3: Plan          [/prd-to-plan]
  └── GATE: Each slice independently testable?

Phase 4: Implement     [/implement]
  └── Load tech skills based on plan
  └── GATE: All slices green?

Phase 5: Quality       [/review] [/secure] [/test]
  └── GATE: No critical issues?

Phase 5a: Optional     [/perf] [/docs]
  └── User opt-in only

Phase 6: Ship          [/ship]
```

---

### D2 — `/build-quick` (New — Fast Loop)
**File**: `.agents/workflows/build-quick.md`  
**When**: Bug fixes, small tasks, hotfixes  
**Phases**:
```
Phase 1: Grill         [/grill-me]   (lightweight — decision tree only, no full PRD)
Phase 2: Implement     [/implement]
Phase 3: Review        [/review]
Phase 4: Ship          [/ship]
```

---

### D3 — Delete `/build-fullstack-feature`
**File**: `.agents/workflows/build-fullstack-feature.md`  
**Action**: Delete. Any references in README or docs updated to point to `/build-feature`.

---

### D4 — Individual Slash Commands
Verify and finalize all existing command files:

| Command | File | Status |
|---------|------|--------|
| `/grill-me` | `.agents/commands/grill-me.md` | ✅ Exists |
| `/write-a-prd` | `.agents/commands/write-a-prd.md` | ✅ Exists |
| `/prd-to-plan` | `.agents/commands/prd-to-plan.md` | ✅ Exists |
| `/implement` | `.agents/commands/implement.md` | ✅ Exists |
| `/compact` | `.agents/commands/compact.md` | ✅ Exists |
| `/ship` | `.agents/commands/ship.md` | ✅ Exists |
| `/check-context` | `.agents/commands/check-context.md` | ✅ Exists (staged) |

---

## Phase E — Documentation

### E1 — README.md: Getting Started Hero Section
**Position**: Immediately after install command. Before the architecture diagram.  
**Add**: 3-step start + workflow comparison table + per-IDE invocation guide.

```markdown
## Getting Started

1. **Install** — `npx agents-skills install`
2. **Configure** — `agents-skills init`
3. **Build** — `/build-feature`

### Workflows

| Workflow | When to Use |
|----------|-------------|
| `/build-feature` | New features — full lifecycle: validate → PRD → plan → implement → review → ship |
| `/build-quick` | Bug fixes & small tasks — fast loop: validate → implement → review → ship |
| `/refactor-workflow` | Refactoring existing code safely without changing behavior |

### Invoking Slash Commands in Your IDE
| IDE | How to invoke |
|-----|--------------|
| Claude Code | Type `/build-feature` directly in the chat prompt |
| Cursor | Type in the AI chat panel |
| VS Code (Copilot) | Reference via `@workspace` + command name |
| Antigravity | Type `/build-feature` in the prompt bar |
```

---

### E2 — `docs/index.html`: Get Started Section
**Position**: New section above the architecture content (below hero).  
**Add**:
- 3-step flow card (Install → Configure → Build)
- Workflow comparison card (3 workflows)
- IDE invocation quick-reference

---

## Phase F — Upgrade Command

### F1 — `agents-skills upgrade`
**File**: `src/commands/upgrade.js` (new)  
**v3 scope** (version-string only — no content hash):

```
Minor upgrade (same schema version):
  → Detect outdated via getOutdated()
  → Overwrite skill files with latest version
  → Update .version files

Major upgrade (schema version change):
  → Show migration diff (read-only)
  → Confirm destructive removals explicitly
  → Execute: remove tombstoned skills, add new Core Skills, update schema_version
```

**Deferred to v4**: Content hash detection for user-customized skills.  
**Safety rules** (unchanged from PRD):
- Never silently delete files
- `--dry-run` flag always available

---

## Phase G — Validation

1. `npx agents-skills install` on a fresh workspace → wizard flows correctly through all 4 roles
2. `/build-feature` runs end-to-end on a real feature (internal dogfood)
3. `/build-quick` runs end-to-end on a bug fix
4. `agents-skills upgrade` migrates a v2 workspace to v3 correctly
5. `agents-skills list --registry` fetches and diffs correctly
6. Publish v3 to npm

---

## What Is NOT Being Built (v3 Explicit Non-Goals)

- Skill gap NLP / semantic signal parsing — **removed from v3 entirely**
- Upgrade content hash detection — **deferred to v4**
- `/build-feature --scope quick` scope selector — **solved via separate `/build-quick` workflow**
- Community skill submissions or open registry
- Per-pack versioning
- Visual skill browser / web UI
- Agent personas system

---

## Files Affected Summary

| File | Action |
|------|--------|
| `skills.json` | Schema upgrade to v3 (category, optional, bundle fields) |
| `src/commands/install.js` | Role-based wizard replaces all-in-one `_fullWizard` |
| `src/commands/upgrade.js` | New command |
| `src/commands/list.js` | Add `--registry` flag |
| `.agents/workflows/build-feature.md` | Simplify Phase 0 to binary skill check (no NLP) |
| `.agents/workflows/build-quick.md` | **New file** |
| `.agents/workflows/build-fullstack-feature.md` | **Delete** |
| `README.md` | Getting Started hero section + workflow table + IDE guide |
| `docs/index.html` | Get Started section above architecture content |
| `.agents/docs/prd-v3.md` | Terminology + skill gap detection + open questions resolved |
| All 12 Core Skills `SKILL.md` | Verify 7-section anatomy |
| All 13 Tech Skills `SKILL.md` | Upgrade to 7-section anatomy |

---

*This plan is the implementation source of truth. The PRD remains the product source of truth. When they conflict, the PRD wins — update this plan, not the PRD.*
