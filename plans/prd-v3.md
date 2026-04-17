# PRD — agents-skills v3.0
**Product**: `agents-skills` CLI (npm: `agents-skills`)  
**Author**: Bhargav Gandhi  
**Status**: Active — Grill-Me complete, ready for execution  
**Grill Analysis**: [implementation-plan-v3.md](./implementation-plan-v3.md)  
**Date**: 2026-04-13  
**Repo**: github.com/bhargavgandhi/agentic-workflows

---

## 1. Problem Statement

AI coding agents are powerful but undisciplined. They skip planning, hallucinate APIs, cut quality corners, and produce technically correct code that solves the wrong problem. Existing solutions are either:

- **Process-only** (Addy Osmani's agent-skills) — great playbooks, no tooling to distribute them
- **Tooling-only** (most CLI scaffolders) — easy to install, shallow in guidance

`agents-skills` v3 closes this gap: **a CLI that distributes production-grade process and technology skills into any IDE or agentic workflow**, making AI agents behave like senior engineers by default.

---

## 2. Product Vision

> **One command installs the discipline your AI agents are missing.**

`npx agents-skills install` scaffolds a curated set of process skills, technology skills, and workflow commands into the developer's workspace. From that point forward, every AI agent operating in that workspace follows a structured, quality-enforced development lifecycle — from adversarial idea validation through to PR creation.

---

## 3. Target Users

| User | Description | Primary Need |
|------|-------------|-------------|
| **Individual developer** | Uses Claude Code, Cursor, or Copilot daily | Wants agents that don't cut corners |
| **Team lead** | Standardizing AI workflows across a team | Consistent quality gates across all engineers |
| **OSS contributor** | Wants to contribute or extend skills | Clear anatomy standard and registry protocol |

**Primary user for v3**: Individual developer and team leads using Claude Code or Cursor as their primary agentic workflow.

---

## 4. Success Criteria

| Metric | v3 Target |
|--------|-----------|
| Time from `npx agents-skills install` to first usable skill | < 2 minutes |
| Process skills coverage of full dev lifecycle | 100% (Phase 0 → Ship) |
| Existing tech skills upgraded to 7-section anatomy | 100% |
| New process skills authored to 7-section anatomy | 100% |
| Skill gap detection before task execution | Working in master workflow |
| Agent-driven compact (context-engineering) | Replaces manual compact flow |
| Zero breaking changes to existing install commands | Guaranteed |

---

## 5. Scope

### In Scope (v3)
- New skill taxonomy: Core Skills (12) + Optional Skills (5) + Tech Skills (optional)
- 12 new/upgraded Core Skills
- 5 new Optional Skills
- 10 existing tech skills upgraded to 7-section anatomy
- Tech packs as install-time aliases (not versioned units)
- Master workflow (`/build-feature`) + fast loop (`/build-quick`) + individual slash commands
- Skill gap detection — binary installed/not check (no NLP) as Phase 0 of master workflow
- Context-engineering skill upgrades the `compact` CLI command to agent-driven
- Public skill registry backed by GitHub repo (first-party only, v3)
- Token budget system: model-agnostic defaults, config file override
- 7-section skill anatomy as recommended standard (all first-party skills must comply)

### Not in Scope (v3)
- Community skill contributions / open registry
- Per-pack versioning
- Visual registry browser / web UI
- Automated CI/CD for skill publishing
- Agent personas system (v4)
- Skill gap NLP / semantic signal parsing (deferred to v4)
- Upgrade content hash detection (deferred to v4)
- `/build-feature` internal scope selector (solved via `/build-quick` workflow instead)

---

## 6. Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: PROCESS SKILLS                                        │
│  Teach agents HOW TO THINK                                      │
│  Core Skills (12) + Optional Skills (5)                         │
│  Role-based install: Frontend / Backend / Fullstack / Full      │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: TECHNOLOGY SKILLS                                     │
│  Teach agents HOW TO USE SPECIFIC TOOLS                         │
│  Optional — installed individually or via pack aliases          │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3: WORKFLOWS & COMMANDS                                  │
│  Full lifecycle orchestration                                   │
│  Master workflow (automated) + Slash commands (composable)      │
└─────────────────────────────────────────────────────────────────┘
              ↑ All three layers distributed via CLI ↑
```

---

## 7. Process Skills Inventory

### 7a. Core Skills (12)

Included in all role-based installs (Frontend, Backend, Fullstack, Full). Not universally mandatory for every user — the install wizard recommends the right bundle per role.

| # | Skill | Phase | Status | Description |
|---|-------|-------|--------|-------------|
| 1 | `grill-me` | Phase 0 | **NEW** | Adversarial plan stress-testing. Attacks assumptions, resolves every branch of the decision tree before a line of code is written. |
| 2 | `context-engineering` | Phase 0 | **NEW** | Teaches agents how to pack context efficiently, what to load/drop, when to trigger compaction, and how to write agent-driven snapshots. Upgrades `compact` CLI to be agent-driven. |
| 3 | `write-a-prd` | Phase 1 | **NEW** | Produces a full PRD: user stories, success criteria, scope boundaries (Always/Ask/Never), non-functional requirements. Submitted as a GitHub issue. |
| 4 | `source-driven-development` | Phase 1 | **NEW** | Grounds every framework decision in official docs. Agent must cite sources, flag unverified claims, and never hallucinate API usage. |
| 5 | `prd-to-plan` | Phase 2 | **NEW** | Turns a PRD into a tracer-bullet implementation plan. Each bullet = thin end-to-end vertical slice. Saves to `./plans/*.md`. |
| 6 | `incremental-implementation` | Phase 2 | **NEW** | Implement → Test → Verify → Commit cycle discipline. Scope rules, slice sizing guidelines, no horizontal layers. |
| 7 | `code-reviewer` | Phase 4 | **UPGRADE** | Critique against project standards. Upgrade to 7-section anatomy with anti-rationalization table and verification gate. |
| 8 | `test-writing` | Phase 4 | **UPGRADE** | Vitest unit + Playwright E2E. Upgrade to 7-section anatomy. Add TDD process guidance (not just test authoring). |
| 9 | `security-and-hardening` | Phase 4 | **NEW** | OWASP Top 10, auth patterns, secrets management, dependency auditing. Non-negotiable quality gate. |
| 10 | `git-workflow` | Phase 5 | **UPGRADE** | Branch naming, conventional commits, PR creation. Upgrade to 7-section anatomy. |
| 11 | `ci-cd-and-automation` | Phase 5 | **NEW** | Shift Left, quality gate pipelines, feature flags. |
| 12 | `skill-creator` | Meta | **UPGRADE** | Generates new skills. Must enforce 7-section anatomy output. Upgrade with progressive disclosure and bundled resource generation. |

### 7b. Optional Skills (5)

Installed on demand or with the Full bundle. Available as opt-in gates in the master workflow.

| # | Skill | Trigger | Description |
|---|-------|---------|-------------|
| 1 | `performance-optimization` | Pre-ship opt-in | Core Web Vitals, bundle analysis, profiling. Measure-first approach. |
| 2 | `documentation-and-adrs` | Pre-ship opt-in | Architecture Decision Records, API docs, inline doc standards. |
| 3 | `debug-investigator` | On-demand | Root cause analysis, structured multi-step investigation. |
| 4 | `deprecation-and-migration` | On-demand | Code-as-liability mindset, migration patterns, zombie code removal. |
| 5 | `context-health-check` | On-demand / automatic | Live token budget monitoring. Forward-planning: decides what not to load next. |

---

## 8. Technology Skills Inventory

All existing tech skills are upgraded to 7-section anatomy. No new tech skills in v3.

### 8a. Individual Skills

| Skill | Pack Membership | Upgrade Priority |
|-------|----------------|-----------------|
| `firebase-setup` | `firebase-pack` | High |
| `graphql-backend` | `graphql-pack` | High |
| `graphql-frontend` | `graphql-pack` | High |
| `react-query` | `react-pack` | High |
| `rtk-query` | `react-pack` | Medium |
| `react-native` | `react-pack`, `mobile-pack` | High |
| `react-component-scaffolder` | `react-pack`, `frontend-pack` | Medium |
| `frontend-design` | `frontend-pack` | High |
| `payload-cms` | standalone | Medium |
| `api-integration` | `frontend-pack` | Medium |
| `backend-engineer` | `backend-pack` | High |
| `playwright` | `testing-pack` | Medium |
| `post-pr-review` | standalone | Low |

### 8b. Pack Aliases (Install-Time Only)

Packs are pure shortcuts — resolved to individual skill installs at install time. No pack versioning.

| Pack | Resolves To |
|------|-------------|
| `react-pack` | react-query, rtk-query, react-native, react-component-scaffolder |
| `frontend-pack` | react-component-scaffolder, frontend-design, api-integration |
| `graphql-pack` | graphql-backend, graphql-frontend |
| `backend-pack` | backend-engineer, graphql-backend |
| `firebase-pack` | firebase-setup |
| `mobile-pack` | react-native |
| `testing-pack` | playwright, test-writing |

---

## 9. Skill Anatomy Standard (7-Section Template)

Every first-party skill **must** implement all 7 sections. This is the quality signal to the community.

```markdown
---
name: skill-name
description: One-line trigger description for skill loader
version: 1.0.0
category: process | technology
optional: true | false
dependencies: []
---

## 1. Trigger Conditions
When to invoke this skill. Specific, not vague.

## 2. Prerequisites
What must be true before starting. Gate conditions.

## 3. Steps
The actual process. Numbered. Atomic. Verifiable.

## 4. Anti-Rationalization Table
| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I already know this framework" | Source-cite it or don't claim it |

## 5. Red Flags
Signs this skill is being violated. Self-diagnosis prompts.

## 6. Verification Gate
Checklist the agent completes before marking this skill done.
- [ ] Evidence item 1
- [ ] Evidence item 2

## 7. References
Links to supplementary patterns, checklists, official docs.
```

---

## 10. Workflows & Commands (Model C)

### 10a. Individual Slash Commands (Power Users)

Each command maps to exactly one lifecycle phase. Independently invocable.

| Command | Skill Invoked | Output |
|---------|--------------|--------|
| `/grill-me` | grill-me | Resolved decision tree, validated plan |
| `/write-a-prd` | write-a-prd | PRD document → GitHub issue |
| `/prd-to-plan` | prd-to-plan | `./plans/*.md` tracer-bullet plan |
| `/implement` | incremental-implementation + tech skills | Working vertical slice |
| `/review` | code-reviewer | Review report |
| `/secure` | security-and-hardening | Security audit report |
| `/test` | test-writing | Test suite |
| `/ship` | git-workflow + ci-cd-and-automation | Branch, commit, PR |
| `/perf` | performance-optimization | Performance audit (optional) |
| `/docs` | documentation-and-adrs | ADRs + docs (optional) |
| `/compact` | context-engineering | Agent-driven context snapshot |
| `/debug` | debug-investigator | Root cause report (on-demand) |

### 10b. Master Workflow (Automated Chain)

`/build-feature` — chains all Core Skill phases with gate conditions between each.

```
Phase 0: Skill Gap Detection
  └── Scan task requirements → check installed skills → surface missing skills
  └── Context budget check → load only needed skills

Phase 1: Grill  [/grill-me]
  └── Adversarial validation → resolved decision tree
  └── GATE: Every branch resolved? → proceed

Phase 2: PRD  [/write-a-prd]
  └── User stories, success criteria, scope boundaries
  └── GATE: GitHub issue created? → proceed

Phase 3: Plan  [/prd-to-plan]
  └── Tracer-bullet vertical slices → ./plans/*.md
  └── GATE: Each slice independently testable? → proceed

Phase 4: Implement  [/implement]
  └── Load tech skills based on plan
  └── Implement → Test → Verify → Commit per slice
  └── GATE: All slices green? → proceed

Phase 5: Quality  [/review] [/secure] [/test]
  └── Code review → Security audit → Test suite
  └── GATE: No critical issues? → proceed

Phase 5a: Optional Gates (user opt-in)
  └── [/perf] Performance audit
  └── [/docs] Documentation + ADRs

Phase 6: Ship  [/ship]
  └── Branch → Commit → PR

```

---

## 11. Skill Gap Detection (Phase 0 — Binary Check)

> **v3 scope**: Binary installed/not check only. No NLP, no natural language parsing, no signal maps. Semantic skill inference is deferred to v4.

Before any implementation begins, the master workflow runs a pre-task check:

1. Check if Core Skills are installed against local `skills.json`
2. Surface one of two outcomes:

```
OUTCOME A — Core Skills present:
  "Core Skills are installed. Proceeding."

OUTCOME B — Core Skills missing:
  "Core Skills are not fully installed.
   Run: agents-skills install
   Then re-run /build-feature."
```

**Tech skill gap detection** (manual, on-demand):
- User runs `agents-skills list --registry` to see what's available
- User installs individually: `agents-skills install react-native`
- Phase 0 does NOT auto-detect or infer tech skill requirements

---

## 12. Context Engineering Upgrade

### Current `compact` (human-driven)
User manually answers 8 CLI prompts → snapshot generated.

### v3 `compact` (agent-driven via `context-engineering` skill)

The `context-engineering` skill teaches the agent to:
1. **Monitor** — track which files were read, which decisions were made, which skills were loaded
2. **Detect** — recognize when context is approaching 70% capacity (forward-planning threshold)
3. **Derive** — auto-fill all snapshot fields from session state (no human prompts needed)
4. **Execute** — call `agents-skills compact --auto` with pre-filled JSON payload

The CLI gains a `--auto` flag that accepts a JSON payload and skips interactive prompts:
```bash
agents-skills compact --auto '{"goal":"...","completed":[...],...}'
```

Human-driven flow remains available for users who prefer manual control.

---

## 13. Token Budget System

### Model-Agnostic Defaults

```
Conservative default (no config): 128k context → 51,200 token budget (40%)
```

Applied when no `agents-skills.config.json` is found in workspace.

### Config File Override (`agents-skills.config.json`)

```json
{
  "model": "claude-sonnet-4-20250514",
  "contextWindow": 200000,
  "budgetPercent": 40
}
```

`init` still writes this file — but now surfaces the model-agnostic default as the recommended option:

```
Which AI model do you primarily use?
  ❯ Model-agnostic (recommended) — 128k default, works with any model
    Claude Sonnet/Opus 4          — 200k tokens → 80k budget
    GPT-4o                        — 128k tokens → 51k budget
    Gemini 2.5 Pro/Flash          — 1M tokens → 400k budget
    Custom                        — Set your own
```

---

## 14. CLI Commands (Full v3 Surface)

| Command | Description | Changed in v3? |
|---------|-------------|---------------|
| `agents-skills init` | Scan workspace, write config. Add model-agnostic default option. | **UPGRADE** |
| `agents-skills install <skill>` | Install individual skill | No change |
| `agents-skills install <pack>` | Install pack alias (resolves to individual skills) | **NEW** |
| `agents-skills list` | List installed skills | No change |
| `agents-skills list --registry` | List all available skills in public registry | **NEW** |
| `agents-skills upgrade` | Smart migration: detect schema version, update/add/remove skills | **NEW** |
| `agents-skills tokens` | Show token budget utilization | No change |
| `agents-skills tokens --budget` | Show current context utilization | No change |
| `agents-skills compact` | Interactive context snapshot (human-driven) | No change |
| `agents-skills compact --auto` | Agent-driven context snapshot via JSON payload | **NEW** |
| `agents-skills doctor` | Check for outdated skills, missing dependencies | **UPGRADE** (surfaces upgrade prompt) |
| `agents-skills recipe <name>` | Run a prompt recipe | No change |

---

## 14a. The `upgrade` Command (v2 → v3 Migration)

The existing infrastructure (`SkillRegistry.getOutdated()`, `.version` files, `doctor` version checks) provides the foundation. v3 adds a dedicated `upgrade` command on top of it.

### Behavior by Upgrade Type

**Minor upgrade** (e.g. v2.1 → v2.2 — same schema version):
```
agents-skills upgrade
  → Detect outdated skills via getOutdated()
  → Overwrite skill files with latest version
  → Update .version files
  → Print: "3 skills updated: code-reviewer v1.1, git-workflow v1.2, react-query v2.0"
```

**Major upgrade** (v2 → v3 — schema version change):
```
agents-skills upgrade
  → Detect schema_version mismatch (2.x → 3.0.0)
  → Run migration plan:

  STEP 1 — Show migration diff (read-only, no changes yet):
    ✓ Will UPDATE (12 skills): code-reviewer, git-workflow, test-writing...
    + Will ADD (8 new skills): grill-me, write-a-prd, prd-to-plan...
    ✗ Will REMOVE (2 skills): app-architect → merged into write-a-prd
                               doc-coauthoring → renamed to documentation-and-adrs

  STEP 2 — Confirm destructive changes:
    "2 skills will be removed. This cannot be undone. Proceed? [y/N]"

  STEP 3 — Execute (only after confirmation):
    → Remove deprecated skills
    → Install new Core Skills
    → Overwrite upgraded existing skills
    → Update skills.json schema_version to 3.0.0

  STEP 4 — Print summary:
    "Migration complete: 12 updated, 8 added, 2 removed."
    "Run 'agents-skills doctor' to verify workspace health."
```

### Safety Rules
- **Never silently delete files.** Always show the removal list and require explicit confirmation.
- **Never overwrite user-customized skills without warning.** If a skill's content hash differs from its installed version's known hash, warn: *"skill-name appears customized. Overwrite? [y/N]"*
- **Dry-run flag**: `agents-skills upgrade --dry-run` shows the migration diff without executing anything.
- **doctor integration**: After running `doctor`, if outdated skills or schema mismatch is detected, surface: *"Run 'agents-skills upgrade' to update."*

### Deprecated Skills in v3 Migration

| Deprecated Skill | Reason | Replacement |
|-----------------|--------|------------|
| `app-architect` | Superseded by deeper PRD-first flow | `write-a-prd` + `prd-to-plan` |
| `doc-coauthoring` | Renamed and expanded | `documentation-and-adrs` |

> **Note**: Both deprecated skills remain in the registry as tombstone entries for one major version, pointing users to their replacements. Hard removal in v4.

---

## 15. Registry Architecture

### v3 Registry (First-Party, GitHub-backed)

```
github.com/bhargavgandhi/agentic-workflows
  └── skills/
      ├── <skill-name>/
      │   ├── SKILL.md          (7-section anatomy)
      │   ├── references/       (supplementary docs)
      │   └── assets/           (templates, checklists)
  └── skills.json               (registry manifest)
```

### `skills.json` Manifest Schema

```json
{
  "version": "3.0.0",
  "skills": [
    {
      "name": "grill-me",
      "version": "1.0.0",
      "category": "process",
      "optional": false,
      "description": "Adversarial plan stress-testing",
      "packs": [],
      "dependencies": []
    }
  ],
  "packs": [
    {
      "name": "react-pack",
      "description": "All React-related skills",
      "skills": ["react-query", "rtk-query", "react-native", "react-component-scaffolder"]
    }
  ]
}
```

`agents-skills list --registry` fetches this manifest from GitHub and diffs against locally installed skills.

---

## 16. Implementation Plan (Phased)

### Phase A — Foundation (Prerequisite for everything)
1. Define and document 7-section skill anatomy standard
2. Update `skills.json` manifest schema to v3 (add `category`, `optional`, `packs`)
3. Add `agents-skills list --registry` command
4. Add `agents-skills install <pack>` resolution logic
5. Add `agents-skills compact --auto` flag
6. Update `init` to include model-agnostic default option

### Phase B — New Process Skills
Author in this priority order (Core Skills first, high-leverage first):

1. `grill-me` — highest leverage, no code dependency
2. `write-a-prd` — depends on grill-me output
3. `prd-to-plan` — depends on PRD output
4. `context-engineering` — upgrades compact, high daily value
5. `source-driven-development`
6. `incremental-implementation`
7. `security-and-hardening`
8. `ci-cd-and-automation`

Then optional:
9. `performance-optimization`
10. `documentation-and-adrs`
11. `context-health-check`
12. `deprecation-and-migration`

### Phase C — Upgrade Existing Skills
Upgrade all existing skills to 7-section anatomy. Priority: high-use first.

1. `code-reviewer`
2. `git-workflow`
3. `test-writing`
4. `skill-creator` (also add 7-section generation capability)
5. `frontend-design`
6. `backend-engineer`
7. `react-query`, `rtk-query`, `react-native`
8. `graphql-backend`, `graphql-frontend`
9. `firebase-setup`
10. `payload-cms`
11. `react-component-scaffolder`, `api-integration`
12. `playwright`, `post-pr-review`, `debug-investigator`, `doc-coauthoring`

### Phase D — Master Workflow & Slash Commands
1. Finalize `/build-feature` master workflow — update Phase 0 to binary skill check (no NLP)
2. Author `/build-quick` workflow (4 phases: grill → implement → review → ship)
3. Delete `/build-fullstack-feature` workflow (superseded by `/build-feature`)
4. Finalize individual slash commands for each phase
5. Wire optional gates (perf, docs) as user opt-in prompts in `/build-feature`

### Phase E — Validation
1. End-to-end test: `npx agents-skills install` on a fresh workspace — all 4 roles flow correctly
2. Run `/build-feature` on a real feature (internal team dogfood)
3. Run `/build-quick` on a bug fix
4. Run `agents-skills upgrade` on a v2 workspace — verify migration diff and confirmation gate
5. Verify agent-driven compact produces valid snapshots
6. Publish v3 to npm

---

## 17. What We Are NOT Building

- Community skill submissions or open registry
- Per-pack versioning or pack-level changelogs
- Web UI or visual skill browser
- Automated CI publishing pipeline for skills
- Agent personas (security-auditor, test-engineer) — v4

---

## 18. Decisions Resolved (Previously Open Questions)

| Question | Decision | Resolved |
|----------|---------|----------|
| Should `app-architect` be retired? | **Yes — deprecated.** Replaced by `write-a-prd` + `prd-to-plan`. Tombstone entry kept for v3, hard removal in v4. | Grill-Me |
| Should `doc-coauthoring` be renamed? | **Yes — renamed to `documentation-and-adrs`**. Tombstone entry kept for v3. | Grill-Me |
| How does skill gap detection handle unknown skills? | **Simplified.** v3 is binary check only (Core Skills installed or not). No NLP inference for unknown skills. `agents-skills list --registry` is the discovery path. | Grill-Me |
| Should `/build-feature` have a scope selector (quick vs full)? | **No.** Separate workflows: `/build-feature` (full) and `/build-quick` (4-phase fast loop). | Grill-Me |
| What is the default install bundle? | **Role-based wizard**: Frontend / Backend / Fullstack / Full. No all-in-one default. | Grill-Me |
| Should upgrade use content hashing? | **Not in v3.** Version string only. Content hash deferred to v4. | Grill-Me |

---

*This PRD is the source of truth for v3 scope. All implementation decisions should be checked against it. When decisions change, update this document and commit it.*  
*Grill analysis and implementation plan: [implementation-plan-v3.md](./implementation-plan-v3.md)*
