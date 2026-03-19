# agents-skills

> **Cross-IDE agent scaffolding** — install AI rules, skills, workflows, and hooks into any workspace with a single command.

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

- **🚀 Multi-IDE Support**: Antigravity, VS Code, Cursor, and Claude Code.
- **🛡️ Safety First**: Automatic blanket backups (`~/.gemini_backup`) before any global changes.
- **🧠 Smart Conflict Resolution**: Choose to Overwrite, Keep both (`_copy`), Merge, or Skip when files already exist.
- **✨ Cursor-Ready**: Automatically converts Markdown rules to `.mdc` format with proper frontmatter.
- **🤖 AI-Powered Hooks**: Includes pre-commit and post-push instructions for your AI assistant.

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

| Source (`.agents/`)          | Antigravity                          | VS Code / Copilot                 | Cursor                              | Claude Code       |
| ---------------------------- | ------------------------------------ | --------------------------------- | ----------------------------------- | ----------------- |
| `rules/project_standards.md` | `.agents/rules/project_standards.md` | `.github/copilot-instructions.md` | `.cursorrules`                      | `CLAUDE.md`       |
| `rules/*.md` (rest)          | `.agents/rules/`                     | `.github/rules/`                  | `.cursor/rules/*.mdc`               | `.claude/rules/`  |
| `skills/`                    | `.agents/skills/`                    | `.github/skills/`                 | `.cursor/skills/`                   | `.claude/skills/` |
| `workflows/`                 | `.agents/workflows/`                 | `.github/agents/`                 | `.cursor/agents/`                   | `.claude/agents/` |
| `hooks/`                     | `.agents/hooks/`                     | `.github/hooks/`                  | `.cursor/rules/*.mdc` (alwaysApply) | `.claude/hooks/`  |

> **Cursor note:** Rules are converted from `.md` to `.mdc` format with the `alwaysApply`, `description`, and `globs` frontmatter fields required by Cursor.

---

## Included Content

### Rules (`rules/`)

| File                    | Description                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| `project_standards.md`  | Universal AI behavior guidelines (becomes the primary system prompt) |
| `nodejs-standards.md`   | Node.js architecture, security, and performance standards            |
| `code_quality.md`       | DRY, SOLID, naming, and error handling standards                     |
| `workflow_protocols.md` | Research -> Plan -> Execute -> Verify lifecycle protocols            |

### Skills (`skills/`)

| Folder                        | Pattern       | Description                                                 |
| ----------------------------- | ------------- | ----------------------------------------------------------- |
| `api-integration/`            | Tool Wrapper  | Frontend ↔ Redux/Firebase endpoint connection patterns      |
| `app-architect/`              | Inversion     | Structured requirements interview → architecture plan       |
| `backend-engineer/`           | Tool Wrapper  | Node.js, TypeScript, MongoDB, REST APIs, Microservices      |
| `code-reviewer/`              | Reviewer      | Checklist-driven PR review with severity classification     |
| `debug-investigator/`         | Pipeline      | 4-step structured debugging: reproduce → trace → fix → report |
| `doc-coauthoring/`            | Pipeline      | 3-stage documentation co-authoring workflow                 |
| `firebase-setup/`             | Tool Wrapper  | Firebase Auth, Firestore, and Storage conventions (v9 SDK)  |
| `frontend-design/`            | Tool Wrapper  | Production-grade UI/UX with premium design quality          |
| `git-workflow/`               | Pipeline      | Branch naming, conventional commits, PR creation, CI babysit |
| `graphql-backend/`            | Tool Wrapper  | Apollo Server, DataLoaders, schema design, N+1 prevention   |
| `graphql-frontend/`           | Tool Wrapper  | Apollo Client, fragments, cache management, code generation |
| `playwright/`                 | Pipeline      | Full Playwright E2E: selectors, POM, assertions, mocking, CI |
| `react-component-scaffolder/` | Generator     | Boilerplate for strict React/Vite components                |
| `react-query/`                | Tool Wrapper  | TanStack Query conventions, key factories, mutations        |
| `rtk-query/`                  | Tool Wrapper  | RTK Query data-fetching, cache tags, optimistic updates     |
| `test-writing/`               | Pipeline      | Vitest unit/integration tests and Playwright E2E tests      |


### Workflows (`workflows/`)

| File                   | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `feature_lifecycle.md` | End-to-end feature build and ship orchestration           |
| `code_review.md`       | Systematic PR-style code review                           |
| `debugging_agent.md`   | Root cause analysis and bug hunting                       |
| `refactor.md`          | Safe, behavior-preserving refactoring                     |
| `interactive_plan.md`  | Interactive multi-round requirement gathering session     |
| `plan.md`              | Deep reasoning technical implementation planning template |
| `frontend-module.md`   | Strategic frontend module creation                        |
| `post_pr_review.md`    | Post-review GitHub PR inline comment posting              |

### Hooks (`hooks/`)

| File            | Description                                             |
| --------------- | ------------------------------------------------------- |
| `pre-commit.md` | AI-powered security and standards audit before commits  |
| `post-push.md`  | PR description drafting and documentation gap detection |

---

## Development & Quality

This repository comes with built-in hooks to ensure code quality:

- **Code Review**: Run `npm run code-review` to scan your staged changes for TODOs, console logs, and legacy references.
- **Pre-commit**: Automatically runs syntax checks and validation before every commit.

## Project Structure

```text
.agents/        # Canonical agent source files (Distributed)
├── rules/      # Style guides & AI instructions
├── skills/     # Capability-specific prompt snippets
├── workflows/  # Multi-step task orchestrations
└── hooks/      # AI-powered event handlers (e.g. pre-commit)

bin/            # CLI Entry point
├── cli.js      # Main CLI logic

src/            # Core logic & Adapters
├── adapters/   # IDE-specific mapping logic
│   ├── base.js
│   ├── antigravity.js
│   ├── vscode.js
│   ├── cursor.js
│   └── claude.js
└── utils/      # Shared utilities (installer, conflict resolution)

hooks/          # Git hook implementations for current repository
docs/           # Landing page assets (GitHub Pages)
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
