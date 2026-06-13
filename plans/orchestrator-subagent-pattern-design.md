# Orchestrator + Subagent Pattern for Quality Gates

**Date**: 2026-06-11
**Status**: Approved (design phase) — pending implementation plan
**Scope**: General pattern for `/build-feature` Phase 5 and `/build-quick` Phase 3. Applies abstractly; per-workflow integration happens at plan/implementation time.

---

## 1. Problem

`build-feature.md` Phase 5 currently runs three quality gates (code review, security audit, test suite) sequentially in the main agent's context. This is slow (no parallelism) and bloats the orchestrator's context with the full detail of each analysis. `build-quick.md` Phase 3 has the same single-gate version of the context-bloat problem.

Claude Code's `Agent`/`Task` tool can dispatch parallel subagents that report back — but this capability does **not exist** in other IDEs/agents this package targets (Cursor, VS Code, Antigravity). The design must degrade gracefully across platforms without silently changing behavior or skipping gates.

---

## 2. Architecture & Execution Modes

A binary Phase-0-style capability check selects one of three execution modes for the quality-gate phase:

```
Mode A — Native Parallel Subagents (Claude Code only)
  Condition: .claude/agents/{code-review-analyzer,security-auditor,test-coverage-analyzer}.md
             exist AND Agent/Task tool is available this session
  → Dispatch all 3 in parallel (single message, 3 Agent calls), merge reports

Mode B — Worktree-Parallel (EXPERIMENTAL / best-effort, other agents/models)
  Condition: Not Mode A, AND the host environment supports running isolated
             sessions per `git worktree` (agent must confirm this capability —
             not auto-detectable generically)
  → Create 3 worktrees, run each gate's *skill* (not the Claude subagent
    definitions) in its own worktree/session, write report files, merge back

Mode C — Sequential (default fallback)
  Condition: Neither A nor B
  → Run gates one at a time in the current workspace — today's behavior,
    unchanged
```

Mode A is the only mode with true parallel subagent dispatch and is the primary implementation target alongside Mode C. **Mode B is documented as an escape hatch, not an implementation target for v1** — no concrete host environment has been identified where multi-session-per-worktree execution is available to a non-Claude agent today. It exists so the design doesn't preclude such a host later, but implementation should treat "Mode B unavailable → Mode C" as the expected path for every non-Claude-Code platform right now. Mode C is always available and is byte-for-byte today's `build-feature.md` Phase 5.

---

## 3. Subagent Roster (Mode A)

| Subagent | Wraps skill | Tools | Write access |
|---|---|---|---|
| `code-review-analyzer` | `code-reviewer` | Read, Grep, Glob, Bash (read-only: `git diff`, lint, typecheck) | None — report only |
| `security-auditor` | `security-and-hardening` | Read, Grep, Glob, Bash (read-only: `npm audit`, `git diff`) | None — report only |
| `test-coverage-analyzer` | `test-writing` | Read, Grep, Glob, Bash (test runner), Write | **New test files only** — additive, no edits to existing source |

Rationale for the write-access split: three agents editing the same working tree concurrently risks races/conflicts. Keeping review and security report-only means the orchestrator (sole writer for source fixes) applies all source-code changes sequentially after merging findings. Test-coverage-analyzer is the exception because adding a *new* test file is additive and essentially conflict-free.

**Enforcement caveat**: Claude Code's `tools` frontmatter grants/denies `Write` wholesale — it cannot scope `test-coverage-analyzer` to "new files only" at the permission level. The "new test files only" rule is therefore a **prompt instruction backed by post-hoc verification**: after this subagent returns, the orchestrator runs `git diff --name-status` and treats any modification to a pre-existing file as a Critical finding (see Section 8).

In Mode B, the same 3 *skills* (`code-reviewer`, `security-and-hardening`, `test-writing`) run as normal single-agent sessions inside their own worktrees — the Claude-specific subagent definitions above aren't used there.

---

## 4. Report Contract

Each subagent/skill-run ends with a markdown report in this fixed shape — returned as the final message (Mode A) or written to `.agents/tmp/<gate>-report.md` (Mode B):

```markdown
## Summary
- Gate: PASS | FAIL
- Critical: <n>  | High: <n>  | Medium: <n>  | Low: <n>

## Findings
| Severity | File:Line | Issue | Suggested Fix |
|----------|-----------|-------|----------------|
| Critical | src/auth.js:42 | ... | ... |
| Critical | (suite) | 3 tests failing after new coverage added | ... |

## Notes
(test-coverage-analyzer only: new test files added + branches covered)
```

For findings not tied to a specific file (e.g., overall test-suite failures), use `(suite)` as the `File:Line` value.

**Per-gate PASS/FAIL definition** (matches existing `build-feature.md` gate language):
- `code-review-analyzer` → FAIL if any **Critical** finding ("blocking issues")
- `security-auditor` → FAIL if any **Critical/High** finding
- `test-coverage-analyzer` → FAIL if the test suite (including newly added tests) doesn't pass

---

## 5. Orchestrator Merge Logic

After collecting all reports (3 for Phase 5, 1 for build-quick's Phase 3):

1. If `test-coverage-analyzer` added test files → run `npm test`. Failures here block regardless of the other reports.
2. Aggregate all Critical/High findings from review + security reports into one fix list, sorted by severity.
3. Empty list + tests green → **GATE PASS** → proceed to next phase.
4. Non-empty → orchestrator (has Edit access) applies fixes **sequentially**, one finding at a time, then re-runs lint/typecheck/tests.
5. Re-evaluate: all Critical/High resolved + tests green → **GATE PASS**. If a Critical finding can't be safely auto-fixed → **STOP**, surface to user — never silently skip.
6. Medium/Low findings from any report are never blocking — collected into a single non-blocking "Suggestions" list shown to the user after the gate phase.

**Note on step 4's sequential approach**: applying fixes one-at-a-time with a relint/retest cycle between each is intentional — it preserves clear attribution (which fix caused which test/lint outcome) and avoids compounding unrelated changes before verification. For gate phases with many findings this is slower than batching, but correctness/attribution is the priority for a quality gate; batching can be revisited later if dispatch volume in practice makes this a bottleneck.

---

## 6. Per-Workflow Integration

### `build-feature.md` Phase 5 (3 gates — full benefit of Mode A/B parallelism)
- Mode A: dispatch all 3 subagents in parallel → merge per Section 5
- Mode B: 3 worktrees, 3 skill-sessions, merge per Section 5
- Mode C: today's sequential 5a → 5b → 5c, unchanged

### `build-quick.md` Phase 3 (1 gate — no parallelism gain, but context isolation still applies)
- Mode A: dispatch single `code-review-analyzer` subagent → merge logic (steps 2-6, step 1 n/a)
- Mode B/C: unchanged — orchestrator runs `code-reviewer` skill directly in its own context

Keeping one report contract and one merge procedure for both workflows (regardless of 1 vs. 3 gates) avoids maintaining two different patterns.

---

## 7. Distribution & Installation

**New source directory**: `.agents/subagents/` containing `code-review-analyzer.md`, `security-auditor.md`, `test-coverage-analyzer.md`.

- Each file needs full Claude Code subagent frontmatter: `name`, `description`, `tools` (restricted per Section 3) — unlike the existing workflow files in `.agents/workflows/`, which only declare `description`/`version`
- **`description` must be narrow** to prevent unwanted auto-invocation outside the orchestrator flow, e.g.: *"Used internally by /build-feature Phase 5 for parallel security audits. Do not invoke directly."*
- Body = condensed steps from the wrapped skill + an instruction to always emit the Section 4 report format

**`.claude/agents/` already exists as an install target** — it currently receives `.agents/workflows/*.md` wholesale via `ClaudeAdapter.install()`. The new subagents merge into the same destination directory (different filenames, no collision):

```js
// New step in src/adapters/claude.js install()
// 7. Subagents → .claude/agents/ (alongside workflow orchestrators)
const subagentsSrc = path.join(sourceDir, 'subagents');
await smartCopyFolder(subagentsSrc, path.join(targetDir, 'agents'), clack, 'Claude Subagent');
```

**Other adapters** (cursor.js, vscode.js, antigravity.js): **no change**. `.agents/subagents/` is never copied for non-Claude IDEs — those installs rely on Mode B/C using existing skill files only.

**No `skills.json` changes** — like `workflows/`, `hooks/`, `commands/`, `recipes/`, this folder is copied wholesale by the adapter, not resolved per-bundle. All 3 wrapped skills are Core Skills present in every bundle, so per-bundle gating would be redundant.

**`doctor.js`**: add a drift check comparing `.agents/subagents/*.md` ↔ `.claude/agents/{code-review-analyzer,security-auditor,test-coverage-analyzer}.md`. **This is new logic, not a drop-in reuse** — the existing drift check (`detectManifestDrift`) compares `skills.json` + `.version` files for *skills* only; workflows and agents aren't versioned or drift-checked today. Implementation will need a separate comparison (e.g., content-hash based) for this non-skill file set. Track as its own task in the implementation plan rather than assuming it folds into the existing check.

**Publish mirroring**: follows whatever mechanism `.agents/recipes` → `recipes/` uses today (exact `prepublishOnly`/`sourceDir` wiring to be confirmed during implementation — no new mechanism needed).

---

## 8. Error Handling

All failure modes resolve **fail-safe, never silent-pass**:

| Failure | Handling |
|---|---|
| Subagent returns malformed report (no parseable `## Summary`) | Treat as **FAIL**, show raw output to user, require manual review |
| Subagent times out / errors | Treat as **FAIL** for that gate; proceed using the other reports but flag the missing gate to the user before continuing |
| `test-coverage-analyzer` adds tests that then fail | Counts as a **Critical** finding for the test gate |
| `test-coverage-analyzer` modifies a pre-existing file (not just new test files) | Orchestrator runs `git diff --name-status` after it returns; any modified (non-new) file → **Critical** finding, surfaced to user — write restriction is enforced post-hoc, not by permissions (see Section 3) |
| Mode B worktree create/merge fails | Fall back to **Mode C** for this run, log a one-line warning, continue sequentially |
| Orchestrator's auto-fix for a Critical finding isn't safe/obvious | **STOP** — surface finding + suggested fix to user, do not guess |

---

## 9. Validation Strategy

1. **Report-merge sanity check**: hand-craft 3-4 sample report files (well-formed PASS, well-formed FAIL with Critical, malformed) and confirm the Section 5 merge logic responds correctly to each — scenario-based, since the merge logic lives in agent reasoning, not deterministic code
2. **Dogfood on this repo**: re-run `/build-feature` Phase 5 (Mode A) against a recently merged PR's diff (e.g., the manifest-drift-detection PR) and compare the 3 subagent reports against the human review that already happened
3. **Cross-IDE check**: confirm Mode detection falls through to Mode C in Cursor/VS Code (no `.claude/agents/` subagents present) and produces identical behavior to pre-change `build-feature.md`
4. **`doctor.js`**: run after install to confirm the 3 subagent files land correctly in `.claude/agents/` with no drift
5. **End-to-end**: full `/build-feature` run on a small real feature, confirming parallel dispatch fires, merge logic gates correctly, and Phase 5a proceeds only when expected

---

## Out of Scope (this design)

- Parallelizing implementation slices (Phase 4) — explicitly excluded; sequential implementation avoids concurrent-edit risk
- Parallel subagents for Phase 1 (grill-me) / Phase 2 (PRD) research — not part of this design
- New custom subagents beyond the 3 quality-gate roles — other ad-hoc dispatches continue to use `general-purpose` with inline prompts
- Plugin marketplace distribution — separate effort, tracked independently
