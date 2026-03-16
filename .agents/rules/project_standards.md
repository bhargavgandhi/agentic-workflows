---
trigger: manual
description: Global invariant agent behaviors, constraints, and execution policies.
---

---

## description: Global invariant agent behaviors, constraints, and execution policies.

# Global Agent Rules

**Purpose**: Establish minimal, invariant baseline behaviors for all agentic operations across any repository.
**Why it exists**: To prevent runaway context pollution, prevent destructive terminal executions, and enforce deterministic reasoning.
**Token Optimization Strategy**: Terse, imperative statements. No fluff. Process-oriented over descriptive.
**Execution Policy Guidance**: Safety-first. All terminal commands must be user-verified unless explicitly marked safe.
**Workspace Standards:** If your task involves writing or reviewing code, you MUST read [rules/project_standards.md] before beginning implementation.

## 1. Context Engineering & Memory

- **Never scan the entire repository.** Absolutely no recursive directory reading without restrictive globbing.
- **Targeted Reconnaissance Only.** Use precise `grep` or file searches to locate targets.
- **Search Protocol (AST vs Text):** When performing deep mapping (e.g., finding exactly which files import a specific component and what props they pass), use AST-like tools (`view_file_outline`, `view_code_item`) to avoid reading large irrelevent files. For simple text finding (e.g., finding where a variable name lives), use `grep_search`.
- **Limit File Reads.** Read a maximum of 5–10 files simultaneously.
- **Summarize Constantly.** After reading files, immediately output compressed notes and discard raw file text from active reasoning.
- **Do Not Re-read.** Rely on your structured research artifacts rather than re-reading the same file.
- **Use Artifacts.** For any output longer than 50 lines, generate a Markdown artifact.

## 2. Safety & Execution Policies

- **Default to "Request Review".** Terminal execution (especially git, rm, npm install/uninstall) must default to requiring user approval.
- **No Destructive Auto-runs.** Never auto-run commands that mutate state or delete data.
- **Strict Step Gating.** Never skip steps in a workflow. You must produce the required output for step N before proceeding to step N+1.

## 3. Delegation Model

If a task is complex, conceptualize sub-agents mentally and execute their roles sequentially:

- **Research Agent**: Scans, reads 5-10 files, and outputs compressed context.
- **Implementation Agent**: Uses compressed context to write code. Does no broad scanning.
- **Test Agent**: Reads the Implementation Agent's output and writes unit tests.
- **Review Agent**: Critiques the code and tests against standards.
