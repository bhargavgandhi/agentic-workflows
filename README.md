# agents-skills v2

> **Intelligent agent scaffolding** — install AI rules, skills, workflows, and hooks into any workspace. Features skill versioning, dependency resolution, project auto-detection, prompt recipes, token budget management, and context compaction.

[**View Landing Page**](https://bhargavgandhi.github.io/agentic-workflows/)

```bash
npx agents-skills
```

---

## What it does

`agents-skills` copies a canonical set of AI agent configuration files into your repository, mapped to the folder structure that each IDE (Antigravity, VS Code, Cursor, Claude Code) expects.

**One source of truth. All IDEs served.**

---

## Key Features

- **🚀 Multi-IDE**: Antigravity, VS Code, Cursor, Claude Code — all from one command.
- **📦 Skill Versioning**: Every skill has a version tracked in `.version` files. `doctor` catches outdated installs.
- **🔗 Dependency Resolution**: Skills declare dependencies in frontmatter. Installing `graphql-backend` auto-installs `backend-engineer`.
- **🔍 Project Auto-detection**: `agents-skills init` scans your workspace and generates a `project-profile.json` with framework, language, testing, and token budget config.
- **🍳 Prompt Recipes**: Parameterized prompttemplates (`add-auth`, `add-crud-page`, `setup-ci`, etc.) assembled interactively and copied to clipboard.
- **📊 Token Budget Enforcement**: Built-in 40% context budget rule. `agents-skills tokens` shows per-skill token costs. Workflows enforce this in Phase 0.
- **📸 Context Snapshots**: `agents-skills compact` creates a structured markdown snapshot so you can resume long sessions in a fresh chat without re-reading files.
- **📈 Local Telemetry**: Opt-in anonymous usage logging (local JSONL only, no external data).
- **🛡️ Safety First**: Automatic backups before global changes. Smart conflict resolution (overwrite / keep / merge / skip).

---

## Quick Start

```bash
# Full install wizard (all skills, workflows, rules, hooks)
npx agents-skills

# Install a single skill
npx agents-skills add react-query

# List everything installed
agents-skills list

# Check workspace health
agents-skills doctor
```

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `agents-skills` | Full interactive install wizard |
| `agents-skills add <skill>` | Install one skill (dependency-aware) |
| `agents-skills list [--skills\|--workflows\|--rules\|--recipes]` | List all installed content with versions |
| `agents-skills doctor` | Workspace health check — versions, deps, profile |
| `agents-skills init` | Auto-detect tech stack → generate `project-profile.json` |
| `agents-skills recipe [name]` | Browse and run parameterized prompt recipes |
| `agents-skills tokens [--budget\|--skill\|--file]` | Token usage breakdown with 40% budget check |
| `agents-skills compact` | Interactively create a context snapshot for resuming |
| `agents-skills telemetry [on\|off\|status\|report]` | Manage local telemetry |

---

## Skill Dependencies

Skills can declare dependencies in their `SKILL.md` frontmatter:

```yaml
---
name: graphql-backend
dependencies:
  - backend-engineer
---
```

When you run `agents-skills add graphql-backend`, the CLI detects and prompts to auto-install `backend-engineer` first. The dependency tree is resolved using a topological sort (Kahn's algorithm), so chains work correctly.

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
  "generated_at": "2026-04-10T...",
  "framework": "next-app-router",
  "language": "typescript",
  "styling": "tailwindcss",
  "stateManagement": "react-query",
  "testing": { "unit": "vitest", "e2e": "playwright" },
  "packageManager": "pnpm",
  "detectedSkills": ["frontend-design", "react-query", "playwright", "test-writing"],
  "tokenBudget": {
    "model": "claude-sonnet-4-20250514",
    "contextWindow": 200000,
    "budgetPercent": 40,
    "budgetTokens": 80000
  }
}
```

This profile is read by `agents-skills tokens` for budget calculations and by the `fullstack_feature_agent` workflow to load the right skills.

---

## Token Budget

The **40% Rule** is baked into every workflow and the project rules:

- Claude Sonnet/Opus 4: 200k tokens → **80k budget**
- GPT-4o: 128k tokens → **51k budget**
- Gemini 2.5 Pro/Flash: 1M tokens → **400k budget**

```bash
# See live breakdown per skill
agents-skills tokens

# Quick budget check only
agents-skills tokens --budget

# Count a specific file
agents-skills tokens --file src/components/EventModal.tsx

# Count a specific skill
agents-skills tokens --skill payload-cms
```

Example output:
```
  Skills                     33,652 tokens  42.1%
    ├── payload-cms                   8,042
    ├── react-native                  4,322
    ├── doc-coauthoring               4,061
    ...

  Total:       42,931 tokens  (53.7% of budget / 21.5% of window)
  Remaining:   37,069 tokens  (46.3% of budget)
```

---

## Context Snapshots

When a session grows long, `agents-skills compact` creates a structured snapshot:

```bash
agents-skills compact
```

It asks for:
- Session goal
- Completed steps
- Remaining work
- Key decisions made
- Files modified / to reference next session
- Active skills needed

The generated markdown in `.agents/context-snapshots/` can be pasted into a new chat to resume instantly — without re-reading the entire codebase.

---

## Prompt Recipes

Recipes are parameterized prompt templates. Run them interactively:

```bash
# List available recipes
agents-skills recipe

# Run a recipe (fills params interactively, copies to clipboard)
agents-skills recipe add-auth
agents-skills recipe add-crud-page
agents-skills recipe add-api-endpoint
agents-skills recipe add-test-suite
agents-skills recipe setup-ci
```

Each recipe assembles a complete, skill-aware prompt and copies it to your clipboard.

---

## IDE Output Mapping

| Source (`.agents/`) | Antigravity | VS Code / Copilot | Cursor | Claude Code |
|---|---|---|---|---|
| `rules/project_standards.md` | `.agents/rules/project_standards.md` | `.github/copilot-instructions.md` | `.cursorrules` | `CLAUDE.md` |
| `rules/*.md` (rest) | `.agents/rules/` | `.github/rules/` | `.cursor/rules/*.mdc` | `.claude/rules/` |
| `skills/` | `.agents/skills/` | `.github/skills/` | `.cursor/skills/` | `.claude/skills/` |
| `workflows/` | `.agents/workflows/` | `.github/agents/` | `.cursor/agents/` | `.claude/agents/` |
| `hooks/` | `.agents/hooks/` | `.github/hooks/` | `.cursor/rules/*.mdc` (alwaysApply) | `.claude/hooks/` |
| `recipes/` | `.agents/recipes/` | `.github/recipes/` | `.cursor/recipes/` | `.claude/recipes/` |

> **Cursor note:** Rules are converted from `.md` to `.mdc` format with the `alwaysApply`, `description`, and `globs` frontmatter fields required by Cursor.

---

## Included Content

### Rules

| File | Description |
|---|---|
| `project_standards.md` | Universal AI behavior guidelines — includes 40% context budget rule and snapshot protocol |
| `nodejs-standards.md` | Node.js architecture, security, and performance standards |
| `code_quality.md` | DRY, SOLID, naming, and error handling standards |
| `workflow_protocols.md` | Research → Plan → Execute → Verify lifecycle protocols |
| `react-standards.md` | React component patterns and hooks conventions |

### Skills

| Folder | Pattern | Dependencies | Description |
|---|---|---|---|
| `api-integration/` | Tool Wrapper | — | Frontend ↔ Redux/Firebase endpoint connection |
| `app-architect/` | Inversion | — | Structured requirements interview → architecture plan |
| `backend-engineer/` | Tool Wrapper | — | Node.js, TypeScript, MongoDB, REST APIs, Microservices |
| `code-reviewer/` | Reviewer | — | Checklist-driven PR review with severity classification |
| `debug-investigator/` | Pipeline | — | 4-step structured debugging: reproduce → trace → fix → report |
| `doc-coauthoring/` | Pipeline | — | 3-stage documentation co-authoring workflow |
| `firebase-setup/` | Tool Wrapper | — | Firebase Auth, Firestore, and Storage conventions (v9 SDK) |
| `frontend-design/` | Tool Wrapper | `react-component-scaffolder` | Production-grade UI/UX with premium design quality |
| `git-workflow/` | Pipeline | — | Branch naming, conventional commits, PR creation, CI babysit |
| `graphql-backend/` | Tool Wrapper | `backend-engineer` | Apollo Server, DataLoaders, schema design, N+1 prevention |
| `graphql-frontend/` | Tool Wrapper | — | Apollo Client, fragments, cache management, code generation |
| `payload-cms/` | Tool Wrapper | — | PayloadCMS v3 + Next.js: collections, blocks, media, email |
| `playwright/` | Pipeline | — | Full Playwright E2E: selectors, POM, assertions, mocking, CI |
| `post-pr-review/` | Tool Wrapper | `code-reviewer` | Post code review feedback as inline GitHub PR comments |
| `react-component-scaffolder/` | Generator | — | Boilerplate for strict React/Vite components |
| `react-native/` | Tool Wrapper | — | Expo, React Navigation, native modules, styling, performance |
| `react-query/` | Tool Wrapper | — | TanStack Query conventions, key factories, mutations |
| `rtk-query/` | Tool Wrapper | — | RTK Query data-fetching, cache tags, optimistic updates |
| `skill-creator/` | Inversion | — | Interview wizard that generates new skills from patterns |
| `test-writing/` | Pipeline | — | Vitest unit/integration tests and Playwright E2E tests |

### Workflows

| File | Description |
|---|---|
| `build_feature_agent.md` | End-to-end orchestration: discover → plan → build → ship |
| `fullstack_feature_agent.md` | **NEW** Fullstack features: phased backend → frontend → test, with budget-aware skill swapping |
| `refactor_agent.md` | Safe, behavior-preserving refactoring pipeline |

### Hooks

| File | Description |
|---|---|
| `pre-commit.md` | AI-powered security and standards audit before commits |
| `post-push.md` | PR description drafting and documentation gap detection |

### Recipes

| File | Params | Description |
|---|---|---|
| `add-auth.md` | provider, routes, login page | Add authentication with route protection |
| `add-crud-page.md` | entity, route, data source | Full CRUD list + form + delete for any entity |
| `add-api-endpoint.md` | name, method, path, auth | REST or GraphQL endpoint with validation |
| `add-test-suite.md` | target, test type, focus areas | Unit + integration + E2E coverage for any module |
| `setup-ci.md` | project type, pkg manager, deploy target | GitHub Actions CI/CD pipeline |

---

## Project Structure

```text
.agents/                  # Canonical agent source files
├── rules/                # Style guides & AI instructions
├── skills/               # Capability-specific prompt snippets (with .version files)
├── workflows/            # Multi-step task orchestrations
├── hooks/                # AI-powered event handlers
├── recipes/              # Parameterized prompt templates
├── context-snapshots/    # Auto-generated session resumption files
└── project-profile.json  # Generated by `agents-skills init`

bin/
└── cli.js                # CLI entry point + subcommand router

src/
├── adapters/             # IDE-specific mapping logic
│   ├── base.js
│   ├── antigravity.js
│   ├── vscode.js
│   ├── cursor.js
│   └── claude.js
├── commands/             # CLI command implementations
│   ├── list.js
│   ├── doctor.js
│   ├── init.js
│   ├── recipe.js
│   ├── tokens.js
│   ├── compact.js
│   └── telemetry.js
├── core/                 # Core engine modules
│   ├── skill-registry.js        # Versioned skill registry
│   ├── dependency-resolver.js   # Topological dependency resolver
│   ├── project-detector.js      # Tech stack auto-detection
│   ├── token-counter.js         # Token budget engine
│   ├── context-compactor.js     # Snapshot generator
│   ├── recipe-engine.js         # Template interpolation
│   └── telemetry.js             # Local JSONL telemetry
└── utils/
    ├── installer.js      # File copying + conflict resolution
    └── config.js         # User preferences (~/.agents-skills/config.json)

~/.agents-skills/         # User home (created on first run)
├── config.json           # Telemetry opt-in + preferences
└── telemetry.jsonl       # Local usage log (opt-in)

docs/                     # Landing page (GitHub Pages)
```

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
