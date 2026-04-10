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

## 4. Context Budget Management

**The 40% Rule**: A chat session's static context (rules + skills + workflows + project profile loaded at the start) must NEVER exceed **40% of the model's context window**. The remaining 60% is reserved for active reasoning, user messages, and tool outputs.

- **Context Window Reference**:
  - Claude Sonnet/Opus 4: 200,000 tokens → budget cap = **80,000 tokens**
  - GPT-4o: 128,000 tokens → budget cap = **51,200 tokens**
  - Gemini 2.5 Pro/Flash: 1,000,000 tokens → budget cap = **400,000 tokens**

- **Selective Skill Loading**: When a workflow or task requires skills, load ONLY the skills needed for the current task. **NEVER load all 20+ skills simultaneously.** Ask yourself: "What skills are actually needed for the next 2 phases?"

- **Context Snapshot Trigger**: If a session is running long (many files read, many tool calls made), proactively create a context snapshot at `.agents/context-snapshots/` BEFORE the context fills. Use `agents-skills compact` from the terminal, or create the snapshot manually using the format defined in Section 5.

- **Token Counting**: Run `agents-skills tokens --budget` to see current context utilization at any time.

## 5. Context Resumption Protocol

When starting a new chat session to continue ongoing work:

1. **Check for snapshots first**: Look for `.agents/context-snapshots/` in the workspace. If a snapshot exists, read it BEFORE doing any other file reads.
2. **Load from snapshot**: Use only the files listed in "Files to Reference" — do NOT re-scan the whole codebase.
3. **Load minimal skills**: Load ONLY the skills listed in the snapshot's "Active Skills" section.
4. **Continue from remaining work**: Start from the "Remaining Work" checklist in the snapshot.

**Snapshot format** (create manually or via `agents-skills compact`):

```markdown
# Context Snapshot — <ISO timestamp>

## Session Goal
<One-line description of what we are building>

## Completed Steps
- [x] <step>

## Remaining Work
- [ ] <step>

## Key Decisions Made
- <decision>

## Files Modified This Session
- `<path>`

## Files to Reference (Next Session)
- `<path:line-range>`

## Active Skills (Load These Only)
- <skill-name>
```
