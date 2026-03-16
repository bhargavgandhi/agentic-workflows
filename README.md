# agents-skills

> **Cross-IDE agent scaffolding** — install AI rules, skills, workflows, and hooks into any workspace with a single command.

```bash
npx agents-skills
```

---

## What it does

`agents-skills` copies a canonical set of AI agent configuration files into your repository, mapped to the folder structure that each IDE (Antigravity, VS Code, Cursor, Claude Code) expects.

**One source of truth. All IDEs served.**

---

## Quick Start

```bash
# In your project directory
npx agents-skills

# Or install globally and run anywhere
npm install -g agents-skills
agents-skills
```

The interactive CLI will ask you two questions:

1. **Where?** — Local workspace (current directory) or Global (your home directory)
2. **Which IDE(s)?** — Pick one or more from the list

---

## IDE Output Mapping

| Source (`.agents/`) | Antigravity | VS Code / Copilot | Cursor | Claude Code |
|---|---|---|---|---|
| `rules/global-rules.md` | `.agents/rules/global-rules.md` | `.github/copilot-instructions.md` | `.cursorrules` | `CLAUDE.md` |
| `rules/*.md` (rest) | `.agents/rules/` | `.github/rules/` | `.cursor/rules/*.mdc` | `.claude/rules/` |
| `skills/` | `.agents/skills/` | `.github/agents/skills/` | `.cursor/agents/skills/` | `.claude/skills/` |
| `workflows/` | `.agents/workflows/` | `.github/agents/workflows/` | `.cursor/agents/workflows/` | `.claude/agents/` |
| `hooks/` | `.agents/hooks/` | `.github/hooks/` | `.cursor/rules/*.mdc` (alwaysApply) | `.claude/hooks/` |

> **Cursor note:** Rules are converted from `.md` to `.mdc` format with the `alwaysApply`, `description`, and `globs` frontmatter fields required by Cursor.

---

## Included Content

### Rules (`rules/`)
| File | Description |
|---|---|
| `global-rules.md` | Universal AI behavior guidelines (becomes the primary system prompt) |
| `nodejs-standards.md` | Node.js architecture, security, and performance standards |

### Skills (`skills/`)
| Folder | Description |
|---|---|
| `backend-engineer/` | Node.js, TypeScript, MongoDB, REST APIs, Microservices |
| `graphql-backend/` | Apollo Server, DataLoaders, schema design, N+1 prevention |
| `graphql-frontend/` | Apollo Client, fragments, cache management, code generation |
| `api-integration/` | Frontend ↔ Redux/Firebase endpoint connection patterns |
| `react-component-scaffolder/` | Boilerplate for strict React/Vite components |
| `code-reviewer/` | Architectural flaws, tech debt, and standards review |
| `test-writing/` | Vitest unit/integration tests and Playwright E2E tests |
| `frontend-design/` | Production-grade UI/UX with premium design quality |
| `doc-coauthoring/` | Structured documentation co-authoring workflow |

### Workflows (`workflows/`)
| File | Description |
|---|---|
| `feature_lifecycle.md` | End-to-end feature build and ship orchestration |
| `code_review.md` | Systematic PR-style code review |
| `debugging_agent.md` | Root cause analysis and bug hunting |
| `refactor.md` | Safe, behavior-preserving refactoring |
| `interactive_plan.md` | Deep reasoning planning session |
| `frontend-module.md` | Strategic frontend module creation |
| `post_pr_review.md` | Post-review GitHub PR inline comment posting |

### Hooks (`hooks/`)
| File | Description |
|---|---|
| `pre-commit.md` | AI-powered security and standards audit before commits |
| `post-push.md` | PR description drafting and documentation gap detection |

---

## Project Structure

```
agents-skills/
├── bin/
│   └── cli.js              # CLI entry point
├── src/
│   └── adapters/
│       ├── base.js          # IDEAdapter interface
│       ├── antigravity.js   # Antigravity adapter
│       ├── vscode.js        # VS Code / GitHub Copilot adapter
│       ├── cursor.js        # Cursor adapter (.mdc format)
│       └── claude.js        # Claude Code adapter
└── .agents/                 # Canonical source templates
    ├── rules/
    ├── skills/
    ├── workflows/
    └── hooks/
```

---

## Requirements

- **Node.js 16+** (uses native `fs.cpSync`)
- **npm 7+** (for `npx` support)

## Publishing (maintainers)

```bash
npm login
npm publish --access public
```

## License

MIT
