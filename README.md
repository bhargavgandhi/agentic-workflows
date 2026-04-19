# agents-skills v3

> **Production-grade process and technology skills for AI agents** — one command installs the discipline your AI agents are missing. Ships a full dev lifecycle: adversarial idea validation through to PR creation.

[**View Landing Page**](https://bhargavgandhi.github.io/agentic-workflows/)

---

## Getting Started

```bash
npx agents-skills install   # one-time setup (role-based wizard)
agents-skills init          # generate project profile
```

Then use one command to build anything:

| Workflow | When to use |
|----------|------------|
| `/build-feature` | New features — full lifecycle: validate → PRD → plan → implement → review → ship |
| `/build-quick` | Bug fixes & small tasks — fast loop: validate → implement → review → ship |
| `/refactor-workflow` | Refactoring existing code safely without changing behavior |
| `/build-feature-agent` | Non-technical team members — guided version of the full lifecycle |

### Invoking Slash Commands in Your IDE

| IDE | How to invoke |
|-----|---------------|
| Claude Code | Type `/build-feature` directly in the chat prompt |
| Cursor | Type `/build-feature` in the AI chat panel |
| VS Code (Copilot) | `@workspace /build-feature` |
| Antigravity | Type `/build-feature` in the prompt bar |

---

## What it does

`agents-skills` distributes a curated set of **Core Skills**, **Optional Skills**, **Tech Skills**, and **workflow commands** into any workspace. Every AI agent operating in that workspace follows a structured, quality-enforced development lifecycle — from adversarial idea validation through to PR creation.

**Three layers. All IDEs served.**

---

## Three-Layer Architecture

```
┌────────────────────────────────────────────────────────────┐
│  LAYER 1: PROCESS SKILLS                                   │
│  Teach agents HOW TO THINK                                 │
│  Core Skills (12) + Optional Skills (5)                    │
│  Role-based install: Frontend / Backend / Fullstack / Full │
├────────────────────────────────────────────────────────────┤
│  LAYER 2: TECHNOLOGY SKILLS                                │
│  Teach agents HOW TO USE SPECIFIC TOOLS                    │
│  Optional — installed individually or via pack aliases     │
├────────────────────────────────────────────────────────────┤
│  LAYER 3: WORKFLOWS & COMMANDS                             │
│  Full lifecycle orchestration                              │
│  Master workflow (automated) + Slash commands (composable) │
└────────────────────────────────────────────────────────────┘
              ↑ All three layers distributed via CLI ↑
```

---

## Key Features

- **🧠 Core Skills**: 12 skills that teach agents how to think — from PRD writing to security hardening. Included in every role-based install bundle.
- **🚀 Multi-IDE**: Antigravity, VS Code, Cursor, Claude Code — all from one command.
- **📦 Skill Versioning**: Every skill has a version tracked in `.version` files. `doctor` catches outdated installs.
- **🔗 Dependency Resolution**: Skills declare dependencies in frontmatter. Installing `graphql-backend` auto-installs `backend-engineer`.
- **📦 Pack Aliases**: Install a curated pack with one command — `react-pack`, `frontend-pack`, `graphql-pack`, etc.
- **🔍 Project Auto-detection**: `agents-skills init` scans your workspace and generates a `project-profile.json` with framework, language, testing, and token budget config.
- **🍳 Prompt Recipes**: Parameterized prompt templates (`add-auth`, `add-crud-page`, `setup-ci`, etc.) assembled interactively and copied to clipboard.
- **📊 Token Budget Enforcement**: Built-in 40% context budget rule. `agents-skills tokens` shows per-skill token costs. Workflows enforce this in Phase 0.
- **📸 Context Snapshots**: `agents-skills compact` (human-driven) or `agents-skills compact --auto` (agent-driven via `context-engineering` skill) creates structured markdown snapshots for resuming long sessions.
- **⬆️ Smart Upgrade**: `agents-skills upgrade` detects schema version changes, shows a full migration diff, and safely removes deprecated skills with explicit confirmation.
- **🛡️ Safety First**: Automatic backups before global changes. Smart conflict resolution (overwrite / keep / merge / skip).

---

## Quick Start

```bash
# Full install wizard (all skills, workflows, rules, hooks)
npx agents-skills install

# Install a single skill
npx agents-skills install react-query

# Install a pack (resolves to individual skills)
npx agents-skills install react-pack

# List everything installed
agents-skills list

# Check workspace health
agents-skills doctor
```

---

## CLI Commands

| Command | Description | v3? |
|---------|-------------|-----|
| `agents-skills install` | Full interactive install wizard | — |
| `agents-skills install <skill>` | Install one skill (dependency-aware) | — |
| `agents-skills install <pack>` | Install pack alias (resolves to individual skills) | **NEW** |
| `agents-skills list` | List installed skills | — |
| `agents-skills list --registry` | List all available skills in public registry | **NEW** |
| `agents-skills upgrade` | Smart migration: detect schema version, update/add/remove skills | **NEW** |
| `agents-skills upgrade --dry-run` | Show migration diff without executing | **NEW** |
| `agents-skills init` | Auto-detect tech stack → generate `project-profile.json` (adds model-agnostic default) | **UPGRADE** |
| `agents-skills recipe [name]` | Browse and run parameterized prompt recipes | — |
| `agents-skills tokens [--budget\|--skill\|--file]` | Token usage breakdown with 40% budget check | — |
| `agents-skills compact` | Interactive context snapshot (human-driven) | — |
| `agents-skills compact --auto` | Agent-driven context snapshot via JSON payload | **NEW** |
| `agents-skills doctor` | Workspace health check — surfaces upgrade prompt on schema mismatch | **UPGRADE** |
| `agents-skills telemetry [on\|off\|status\|report]` | Manage local telemetry | — |

---

## Core Skills (12)

Included in all role-based install bundles (Frontend, Backend, Fullstack, Full).

| Skill | Phase | Description |
|-------|-------|-------------|
| `grill-me` | Phase 0 | Adversarial plan stress-testing. Attacks assumptions, resolves every branch of the decision tree before a line of code is written. |
| `context-engineering` | Phase 0 | Teaches agents how to pack context efficiently. Upgrades `compact` CLI to be agent-driven. |
| `write-a-prd` | Phase 1 | Produces a full PRD: user stories, success criteria, scope boundaries. Submitted as a GitHub issue. |
| `source-driven-development` | Phase 1 | Grounds every framework decision in official docs. Agent must cite sources, never hallucinate APIs. |
| `prd-to-plan` | Phase 2 | Turns a PRD into a tracer-bullet implementation plan. Each bullet = thin end-to-end vertical slice. |
| `incremental-implementation` | Phase 2 | Implement → Test → Verify → Commit cycle discipline. |
| `code-reviewer` | Phase 4 | Critique against project standards. Anti-rationalization table and verification gate. |
| `test-writing` | Phase 4 | Vitest unit + Playwright E2E. TDD process guidance. |
| `security-and-hardening` | Phase 4 | OWASP Top 10, auth patterns, secrets management, dependency auditing. |
| `git-workflow` | Phase 5 | Branch naming, conventional commits, PR creation. |
| `ci-cd-and-automation` | Phase 5 | Shift Left, quality gate pipelines, feature flags. |
| `skill-creator` | Meta | Generates new skills. Enforces 7-section anatomy output. |

## Optional Skills (5)

Installed on demand or with the Full bundle. Available as opt-in gates in `/build-feature`.

| Skill | Trigger | Description |
|-------|---------|-------------|
| `performance-optimization` | Pre-ship | Core Web Vitals, bundle analysis, profiling. |
| `documentation-and-adrs` | Pre-ship | Architecture Decision Records, API docs, inline doc standards. |
| `debug-investigator` | On-demand | Root cause analysis, structured multi-step investigation. |
| `deprecation-and-migration` | On-demand | Code-as-liability mindset, migration patterns, zombie code removal. |
| `context-health-check` | On-demand | Pre-load cost estimation and forward-planning for context budget. |

---

## Technology Skills

All tech skills upgraded to 7-section anatomy. Installed individually or via pack aliases.

### Individual Skills

| Skill | Pack | Description |
|-------|------|-------------|
| `firebase-setup` | `firebase-pack` | Firebase Auth, Firestore, and Storage conventions (v9 SDK) |
| `graphql-backend` | `graphql-pack`, `backend-pack` | Apollo Server, DataLoaders, schema design, N+1 prevention |
| `graphql-frontend` | `graphql-pack` | Apollo Client, fragments, cache management, code generation |
| `react-query` | `react-pack` | TanStack Query conventions, key factories, mutations |
| `rtk-query` | `react-pack` | RTK Query data-fetching, cache tags, optimistic updates |
| `react-native` | `react-pack`, `mobile-pack` | Expo, React Navigation, native modules, styling, performance |
| `react-component-scaffolder` | `react-pack`, `frontend-pack` | Boilerplate for strict React/Vite components |
| `frontend-design` | `frontend-pack` | Production-grade UI/UX with premium design quality |
| `payload-cms` | standalone | PayloadCMS v3 + Next.js: collections, blocks, media, email |
| `api-integration` | `frontend-pack` | Frontend ↔ Redux/Firebase endpoint connection |
| `backend-engineer` | `backend-pack` | Node.js, TypeScript, MongoDB, REST APIs, Microservices |
| `playwright` | `testing-pack` | Full Playwright E2E: selectors, POM, assertions, mocking, CI |
| `post-pr-review` | standalone | Post code review feedback as inline GitHub PR comments |

### Pack Aliases

Packs are install-time shortcuts — resolved to individual skill installs.

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

## 7-Section Skill Anatomy

Every first-party skill implements all 7 sections:

```markdown
---
name: skill-name
description: One-line trigger description
version: 1.0.0
category: process | technology
optional: true | false
dependencies: []
---

## 1. Trigger Conditions
## 2. Prerequisites
## 3. Steps
## 4. Anti-Rationalization Table
## 5. Red Flags
## 6. Verification Gate
## 7. References
```

---

## Workflows

### `/build-feature` — Master Workflow

Chains all Core Skill phases with gate conditions:

```
Phase 0: Core Skills Check (binary — no NLP)
  └── Are Core Skills installed? If not → print install command → exit

Phase 1: Grill  [/grill-me]
  └── Adversarial validation → resolved decision tree

Phase 2: PRD  [/write-a-prd]
  └── User stories, success criteria, scope → GitHub issue

Phase 3: Plan  [/prd-to-plan]
  └── Tracer-bullet vertical slices → ./plans/*.md

Phase 4: Implement  [/implement]
  └── Load tech skills → Implement → Test → Verify → Commit

Phase 5: Quality  [/review] [/secure] [/test]
  └── Code review → Security audit → Test suite

Phase 5a: Optional Gates (user opt-in)
  └── [/perf]  Performance audit
  └── [/docs]  Documentation + ADRs

Phase 6: Ship  [/ship]
  └── Branch → Commit → PR
```

### `/build-quick` — Fast Loop

For **bug fixes and small tasks** — 4 phases, no PRD or plan:

```
Phase 1: Grill      [/grill-me]   (lightweight — scope validation only)
Phase 2: Implement  [/implement]
Phase 3: Review     [/review]
Phase 4: Ship       [/ship]
```

### Individual Slash Commands

| Command | Skill | Output |
|---------|-------|--------|
| `/grill-me` | grill-me | Resolved decision tree |
| `/write-a-prd` | write-a-prd | PRD → GitHub issue |
| `/prd-to-plan` | prd-to-plan | `./plans/*.md` |
| `/implement` | incremental-implementation + tech skills | Working vertical slice |
| `/review` | code-reviewer | Review report |
| `/secure` | security-and-hardening | Security audit |
| `/test` | test-writing | Test suite |
| `/ship` | git-workflow + ci-cd-and-automation | Branch, commit, PR |
| `/perf` | performance-optimization | Performance audit |
| `/docs` | documentation-and-adrs | ADRs + docs |
| `/compact` | context-engineering | Agent-driven context snapshot |
| `/debug` | debug-investigator | Root cause report |

---

## Skill Gap Detection

Phase 0 of `/build-feature` runs a binary Core Skills check — no NLP parsing:

```
OUTCOME A — Core Skills installed:
  "Core Skills are installed. Proceeding."

OUTCOME B — Core Skills missing:
  "Core Skills are not fully installed.
   Run: npx agents-skills install
   Then re-run /build-feature."
```

To browse and install tech skills: `agents-skills list --registry`

---

## Upgrade Command

### Minor upgrade (same schema version)
```
agents-skills upgrade
  → Detect outdated skills → overwrite with latest → update .version files
  → "3 skills updated: code-reviewer v1.1, git-workflow v1.2"
```

### Major upgrade (v2 → v3 schema change)
```
agents-skills upgrade
  STEP 1 — Show migration diff (read-only):
    ✓ Will UPDATE (12 skills): code-reviewer, git-workflow...
    + Will ADD (8 new skills): grill-me, write-a-prd...
    ✗ Will REMOVE (2 skills): app-architect, doc-coauthoring

  STEP 2 — Confirm destructive changes:
    "2 skills will be removed. Proceed? [y/N]"

  STEP 3 — Execute after confirmation

  STEP 4 — Summary + "Run agents-skills doctor to verify"
```

Use `agents-skills upgrade --dry-run` to preview without executing.

---

## Context Engineering Upgrade

### Human-driven (still available)
```bash
agents-skills compact
```
Interactive prompts → snapshot in `.agents/context-snapshots/`.

### Agent-driven (new in v3)
```bash
agents-skills compact --auto '{"goal":"...","completed":[...],...}'
```
The `context-engineering` skill teaches agents to auto-fill all snapshot fields from session state — no human prompts needed.

---

## Token Budget System

### Model-agnostic default
```
Conservative default: 128k context → 51,200 token budget (40%)
```

### Config file override (`agents-skills.config.json`)
```json
{
  "model": "claude-sonnet-4-20250514",
  "contextWindow": 200000,
  "budgetPercent": 40
}
```

```bash
# See live breakdown per skill
agents-skills tokens

# Quick budget check
agents-skills tokens --budget
```

---

## Skill Dependencies

Skills declare dependencies in their `SKILL.md` frontmatter:

```yaml
---
name: graphql-backend
dependencies:
  - backend-engineer
---
```

**Current dependency graph:**

```
graphql-backend   → backend-engineer
frontend-design   → react-component-scaffolder
post-pr-review    → code-reviewer
```

---

## Project Profile

Running `agents-skills init` scans your workspace and writes `.agents/project-profile.json`:

```json
{
  "generated_at": "2026-04-14T...",
  "framework": "next-app-router",
  "language": "typescript",
  "styling": "tailwindcss",
  "stateManagement": "react-query",
  "testing": { "unit": "vitest", "e2e": "playwright" },
  "packageManager": "pnpm",
  "detectedSkills": ["frontend-design", "react-query", "playwright", "test-writing"],
  "tokenBudget": {
    "model": "model-agnostic",
    "contextWindow": 128000,
    "budgetPercent": 40,
    "budgetTokens": 51200
  }
}
```

---

## IDE Output Mapping

| Source (`.agents/`) | Antigravity | VS Code / Copilot | Cursor | Claude Code |
|---|---|---|---|---|
| `rules/project-standards.md` | `.agents/rules/project-standards.md` | `.github/copilot-instructions.md` | `.cursorrules` | `CLAUDE.md` |
| `rules/*.md` (rest) | `.agents/rules/` | `.github/rules/` | `.cursor/rules/*.mdc` | `.claude/rules/` |
| `skills/` | `.agents/skills/` | `.github/skills/` | `.cursor/skills/` | `.claude/skills/` |
| `commands/` | `.agents/commands/` | `.github/instructions/` | `.cursor/commands/` | `.claude/commands/` |
| `workflows/` | `.agents/workflows/` | `.github/agents/` | `.cursor/agents/` | `.claude/agents/` |
| `hooks/` | `.agents/hooks/` | `.github/hooks/` | `.cursor/rules/*.mdc` (alwaysApply) | `.claude/hooks/` |
| `recipes/` | `.agents/recipes/` | `.github/recipes/` | `.cursor/recipes/` | `.claude/recipes/` |

---

## Project Structure

```text
.agents/                  # Canonical agent source files
├── rules/                # Style guides & AI instructions
├── skills/               # Capability-specific prompt snippets
│   ├── <process-skill>/  # Mandatory + optional process skills
│   └── <tech-skill>/     # Technology skills
├── commands/             # Thin slash command stubs (10-20 lines each)
│   ├── grill-me.md       # /grill-me
│   ├── write-a-prd.md    # /write-a-prd
│   ├── prd-to-plan.md    # /prd-to-plan
│   ├── implement.md      # /implement
│   ├── ship.md           # /ship
│   └── compact.md        # /compact
├── workflows/            # Full orchestration docs
│   ├── build-feature.md         # Master workflow (full lifecycle)
│   ├── build-quick.md           # Fast loop (bug fixes, small tasks)
│   ├── build-feature-agent.md   # Non-technical user variant
│   └── refactor-workflow.md     # Safe refactoring workflow
├── hooks/                # AI-powered event handlers
├── recipes/              # Parameterized prompt templates
├── context-snapshots/    # Auto-generated session resumption files
└── project-profile.json  # Generated by `agents-skills init`

bin/
└── cli.js                # CLI entry point + subcommand router

src/
├── adapters/             # IDE-specific mapping logic
├── commands/             # CLI command implementations
│   ├── list.js
│   ├── doctor.js
│   ├── init.js
│   ├── recipe.js
│   ├── tokens.js
│   ├── compact.js
│   ├── upgrade.js        # NEW: smart migration command
│   └── telemetry.js
└── core/                 # Core engine modules
    ├── skill-registry.js
    ├── dependency-resolver.js
    ├── project-detector.js
    ├── token-counter.js
    ├── context-compactor.js
    ├── recipe-engine.js
    └── telemetry.js

skills.json               # Registry manifest (v3 schema)
docs/                     # Landing page (GitHub Pages)
```

---

## `skills.json` Registry Manifest

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

## Requirements

- **Node.js 16+**
- **npm 7+** (for `npx` support)

---

## Development

```bash
# Link locally for testing
npm link
agents-skills help

# Unlink when done
npm unlink -g agents-skills
```

---

## Publishing

```bash
npm login
npm version patch   # or minor/major
npm publish --access public
```

The `prepublishOnly` script automatically copies `.agents/skills` → `skills/` and `.agents/recipes` → `recipes/` before publish.

---

## License

MIT
