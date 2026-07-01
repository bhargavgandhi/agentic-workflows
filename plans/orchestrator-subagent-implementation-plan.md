# Orchestrator + Subagent Pattern — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the design in `plans/orchestrator-subagent-pattern-design.md` — add the 3 Mode-A subagent definitions, the new drift-detection logic, the Claude adapter install step, and rewrite `build-feature.md` Phase 5 / `build-quick.md` Phase 3 to use the Mode A/B/C framework.

**Architecture:** New source directory `.agents/subagents/` holds 3 Claude Code subagent definitions (`code-review-analyzer`, `security-auditor`, `test-coverage-analyzer`), each wrapping an existing skill and emitting the Section 4 report contract. `ClaudeAdapter` gains a 7th install step copying this folder into `.claude/agents/`. A new `src/core/subagent-drift.js` does content-hash comparison (subagents aren't versioned like skills) and is surfaced as a new `doctor.js` section. `build-feature.md` Phase 5 and `build-quick.md` Phase 3 are rewritten to detect Mode A vs Mode C and apply the shared merge logic from Section 5 of the design.

**Tech Stack:** Node.js (`node --test`), `gray-matter` for frontmatter parsing, existing `smartCopyFolder` installer utility.

---

## Task 1: Create the 3 subagent definitions in `.agents/subagents/`

**Files:**
- Create: `.agents/subagents/code-review-analyzer.md`
- Create: `.agents/subagents/security-auditor.md`
- Create: `.agents/subagents/test-coverage-analyzer.md`
- Test: `test/subagents.test.js`

- [ ] **Step 1: Create `.agents/subagents/code-review-analyzer.md`**

```markdown
---
name: code-review-analyzer
description: Used internally by /build-feature Phase 5 and /build-quick Phase 3 for parallel code review. Do not invoke directly.
tools: Read, Grep, Glob, Bash
---

You are a Senior Staff Engineer performing a strict, read-only PR review as part of an automated quality gate. You have no write access — your job is to produce a findings report, not to fix anything.

## Scope

1. Run `git diff` (and `git diff --stat`) to identify every changed file. Read each diff carefully.
2. Run the project's lint and typecheck commands (e.g. `npm run lint`, `npx tsc --noEmit`) if they exist — read-only, do not fix failures yourself.
3. Evaluate each changed file against:
   - **Correctness**: edge cases, error handling
   - **Security**: input validation, auth checks, injection risks
   - **Performance**: N+1 queries, missing cleanup, unnecessary re-renders
   - **Code Quality**: naming, DRY, complexity
   - **Architecture**: follows existing project patterns
   - **TypeScript**: no `any`, correct public API types
   - **Testing**: meaningful coverage of new/changed behaviour

## Severity

- **Critical**: breaks functionality, security hole, data loss
- **High**: significant bug or missing essential handling
- **Medium**: quality/maintainability issue, not blocking
- **Low**: style/nit

## Output — always end your response with this exact report format

```markdown
## Summary
- Gate: PASS | FAIL
- Critical: <n>  | High: <n>  | Medium: <n>  | Low: <n>

## Findings
| Severity | File:Line | Issue | Suggested Fix |
|----------|-----------|-------|----------------|
| ... | ... | ... | ... |

## Notes
(any context the orchestrator needs — e.g. files you couldn't review, lint/typecheck not configured)
```

**Gate rule**: FAIL if any **Critical** finding exists ("blocking issues" in code-reviewer terms). Otherwise PASS, even with High/Medium/Low findings.

Do not modify any files. Do not run commands that write to the working tree (`git commit`, `git add`, formatters with `--write`, etc.).
```

- [ ] **Step 2: Create `.agents/subagents/security-auditor.md`**

```markdown
---
name: security-auditor
description: Used internally by /build-feature Phase 5 for parallel security audits. Do not invoke directly.
tools: Read, Grep, Glob, Bash
---

You are a security auditor performing a strict, read-only OWASP-style audit as part of an automated quality gate. You have no write access — your job is to produce a findings report, not to fix anything.

## Audit checklist

Run `git diff` to scope your review to changed files, then check:

1. **Input validation**: every new data-entry point (forms, API params, URL segments, uploads) validated server-side; output encoded before render (XSS).
2. **Auth/authorisation**: protected routes verify authentication server-side; authorisation checked at resource level, not just route level; session tokens not in localStorage.
3. **Secrets**: no API keys/tokens/credentials in source (grep for `api_key`, `secret`, `password`, `token` in the diff); `.env` in `.gitignore`.
4. **Injection**: all DB queries parameterised/ORM — no string-concatenated queries.
5. **Dependencies**: if `package.json` changed, run `npm audit --audit-level=high` (read-only) and report Critical/High advisories.
6. **OWASP Top 10**: walk the changed code against the standard Top 10 categories, marking Pass/Fail/N-A.
7. **Security headers** (if a web endpoint changed): CSP, X-Frame-Options, X-Content-Type-Options, HTTPS enforced.

## Severity

- **Critical**: exploitable vulnerability (injection, auth bypass, exposed secret)
- **High**: missing essential control (no input validation, no authz check, `npm audit` High advisory)
- **Medium**: hardening gap (missing security header, Moderate advisory)
- **Low**: best-practice suggestion

## Output — always end your response with this exact report format

```markdown
## Summary
- Gate: PASS | FAIL
- Critical: <n>  | High: <n>  | Medium: <n>  | Low: <n>

## Findings
| Severity | File:Line | Issue | Suggested Fix |
|----------|-----------|-------|----------------|
| ... | ... | ... | ... |

## Notes
(any context the orchestrator needs — e.g. `npm audit` not run because package.json unchanged)
```

**Gate rule**: FAIL if any **Critical or High** finding exists. Otherwise PASS.

Do not modify any files. Do not run commands that write to the working tree.
```

- [ ] **Step 3: Create `.agents/subagents/test-coverage-analyzer.md`**

```markdown
---
name: test-coverage-analyzer
description: Used internally by /build-feature Phase 5 and /build-quick Phase 3 for parallel test coverage analysis. May add new test files only — never edits existing files. Do not invoke directly.
tools: Read, Grep, Glob, Bash, Write
---

You are a test-coverage analyst running as part of an automated quality gate. You may **create new test files**, but must **never modify an existing file** (source or test) — the orchestrator verifies this with `git diff --name-status` after you return, and any modification to a pre-existing file is treated as a Critical finding.

## Steps

1. Run `git diff --name-only` to find changed source files.
2. For each changed source file, check whether it has corresponding test coverage for its new/changed behaviour:
   - Unit/integration: co-located `*.test.ts`/`*.test.tsx` (Vitest + React Testing Library)
   - E2E: `/tests/e2e/*.spec.ts` (Playwright)
3. For any changed branch/behaviour with no test:
   - Write a **new** test file (do not edit an existing test file — if a co-located test file already exists and needs new cases, report this as a finding instead of editing it)
   - Use semantic queries (`getByRole`, `getByText`, `getByLabelText`) — not `getByTestId`
   - Mock only at system boundaries
4. Run the full suite: `npm test`. If you added Playwright specs, also run `npx playwright test <new-spec>`.
5. Do not mark complete until everything you added passes.

## Severity

- **Critical**: test suite (including your additions) fails; or a changed branch has zero coverage and a new test file couldn't be added without editing an existing file
- **High**: significant untested branch in changed code, no new test added
- **Medium**: minor untested edge case
- **Low**: suggestion for additional coverage

## Output — always end your response with this exact report format

```markdown
## Summary
- Gate: PASS | FAIL
- Critical: <n>  | High: <n>  | Medium: <n>  | Low: <n>

## Findings
| Severity | File:Line | Issue | Suggested Fix |
|----------|-----------|-------|----------------|
| Critical | (suite) | 3 tests failing after new coverage added | ... |

## Notes
List every new test file you created and which branches/behaviours each covers.
```

**Gate rule**: FAIL if the test suite (including newly added tests) doesn't pass. Otherwise PASS.
```

- [ ] **Step 4: Write `test/subagents.test.js`**

```js
'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const fs       = require('node:fs');
const path     = require('node:path');
const matter   = require('gray-matter');

const SUBAGENTS_DIR = path.join(__dirname, '..', '.agents', 'subagents');

const EXPECTED = {
  'code-review-analyzer':   { tools: ['Read', 'Grep', 'Glob', 'Bash'] },
  'security-auditor':       { tools: ['Read', 'Grep', 'Glob', 'Bash'] },
  'test-coverage-analyzer': { tools: ['Read', 'Grep', 'Glob', 'Bash', 'Write'] },
};

for (const [name, expected] of Object.entries(EXPECTED)) {
  test(`${name}.md has valid Claude Code subagent frontmatter`, () => {
    const filePath = path.join(SUBAGENTS_DIR, `${name}.md`);
    assert.ok(fs.existsSync(filePath), `${name}.md should exist in .agents/subagents/`);

    const { data, content } = matter(fs.readFileSync(filePath, 'utf8'));

    assert.equal(data.name, name);
    assert.ok(data.description && data.description.length > 0, 'description should be non-empty');
    assert.match(data.description, /do not invoke directly/i);

    const tools = data.tools.split(',').map(t => t.trim());
    assert.deepEqual(tools, expected.tools);

    assert.match(content, /## Summary/);
    assert.match(content, /## Findings/);
    assert.match(content, /Gate: PASS \| FAIL/);
  });
}
```

- [ ] **Step 5: Run the new test**

Run: `node --test test/subagents.test.js`
Expected: 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add .agents/subagents/ test/subagents.test.js
git commit -m "feat(subagents): add code-review-analyzer, security-auditor, test-coverage-analyzer definitions"
```

---

## Task 2: Add content-hash subagent drift detection

**Files:**
- Create: `src/core/subagent-drift.js`
- Test: `test/subagent-drift.test.js`

- [ ] **Step 1: Write the failing test — `test/subagent-drift.test.js`**

```js
'use strict';

const { test } = require('node:test');
const assert   = require('node:assert/strict');
const fs       = require('node:fs');
const path     = require('node:path');
const os       = require('node:os');

const { detectSubagentDrift, SUBAGENT_NAMES } = require('../src/core/subagent-drift');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'subagent-drift-test-'));
}

function writeSubagent(dir, name, content) {
  fs.writeFileSync(path.join(dir, `${name}.md`), content, 'utf8');
}

test('detectSubagentDrift: no drift when installed matches source', () => {
  const sourceDir = tmpDir();
  const installedDir = tmpDir();

  for (const name of SUBAGENT_NAMES) {
    writeSubagent(sourceDir, name, `# ${name}\ncontent`);
    writeSubagent(installedDir, name, `# ${name}\ncontent`);
  }

  const result = detectSubagentDrift(sourceDir, installedDir);
  assert.equal(result.hasDrift, false);
  assert.deepEqual(result.issues, []);

  fs.rmSync(sourceDir, { recursive: true });
  fs.rmSync(installedDir, { recursive: true });
});

test('detectSubagentDrift: detects a missing subagent', () => {
  const sourceDir = tmpDir();
  const installedDir = tmpDir();

  for (const name of SUBAGENT_NAMES) {
    writeSubagent(sourceDir, name, `# ${name}\ncontent`);
    if (name !== 'security-auditor') {
      writeSubagent(installedDir, name, `# ${name}\ncontent`);
    }
  }

  const result = detectSubagentDrift(sourceDir, installedDir);
  assert.equal(result.hasDrift, true);
  assert.deepEqual(result.issues, [
    { type: 'missing', subagent: 'security-auditor', details: 'security-auditor.md not installed in .claude/agents/' },
  ]);

  fs.rmSync(sourceDir, { recursive: true });
  fs.rmSync(installedDir, { recursive: true });
});

test('detectSubagentDrift: detects an outdated (content-mismatched) subagent', () => {
  const sourceDir = tmpDir();
  const installedDir = tmpDir();

  for (const name of SUBAGENT_NAMES) {
    writeSubagent(sourceDir, name, `# ${name}\nv2`);
    writeSubagent(installedDir, name, `# ${name}\nv1`);
  }

  const result = detectSubagentDrift(sourceDir, installedDir);
  assert.equal(result.hasDrift, true);
  assert.equal(result.issues.length, 3);
  for (const issue of result.issues) {
    assert.equal(issue.type, 'outdated');
  }

  fs.rmSync(sourceDir, { recursive: true });
  fs.rmSync(installedDir, { recursive: true });
});

test('detectSubagentDrift: ignores subagents not present in source', () => {
  const sourceDir = tmpDir();
  const installedDir = tmpDir();

  writeSubagent(sourceDir, 'code-review-analyzer', '# code-review-analyzer\ncontent');
  writeSubagent(installedDir, 'code-review-analyzer', '# code-review-analyzer\ncontent');
  // security-auditor and test-coverage-analyzer don't exist in source — skip, not "missing"

  const result = detectSubagentDrift(sourceDir, installedDir);
  assert.equal(result.hasDrift, false);

  fs.rmSync(sourceDir, { recursive: true });
  fs.rmSync(installedDir, { recursive: true });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/subagent-drift.test.js`
Expected: FAIL with `Cannot find module '../src/core/subagent-drift'`

- [ ] **Step 3: Implement `src/core/subagent-drift.js`**

```js
'use strict';

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const SUBAGENT_NAMES = ['code-review-analyzer', 'security-auditor', 'test-coverage-analyzer'];

function _hash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/**
 * Compare .agents/subagents/*.md (package source) against .claude/agents/*.md
 * (installed) using content hashes — subagents aren't versioned like skills,
 * so drift is detected by hash mismatch rather than a `.version` file.
 *
 * @param {string} sourceDir    - path to .agents/subagents/
 * @param {string} installedDir - path to .claude/agents/
 * @returns {{
 *   hasDrift: boolean,
 *   issues: Array<{ type: 'missing'|'outdated', subagent: string, details: string }>
 * }}
 */
function detectSubagentDrift(sourceDir, installedDir) {
  const issues = [];

  for (const name of SUBAGENT_NAMES) {
    const sourceFile = path.join(sourceDir, `${name}.md`);
    const sourceHash = _hash(sourceFile);
    if (!sourceHash) continue; // source doesn't ship this subagent — nothing to compare

    const installedFile = path.join(installedDir, `${name}.md`);
    const installedHash = _hash(installedFile);

    if (!installedHash) {
      issues.push({
        type: 'missing',
        subagent: name,
        details: `${name}.md not installed in .claude/agents/`,
      });
    } else if (installedHash !== sourceHash) {
      issues.push({
        type: 'outdated',
        subagent: name,
        details: `${name}.md differs from package source — re-run install to update`,
      });
    }
  }

  return { hasDrift: issues.length > 0, issues };
}

module.exports = { detectSubagentDrift, SUBAGENT_NAMES };
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test test/subagent-drift.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/core/subagent-drift.js test/subagent-drift.test.js
git commit -m "feat(core): add content-hash drift detection for subagent definitions"
```

---

## Task 3: Wire `ClaudeAdapter` to install subagents

**Files:**
- Modify: `src/adapters/claude.js:6-15` (header comment), `src/adapters/claude.js:60-63` (install steps)

- [ ] **Step 1: Update the header comment**

In `src/adapters/claude.js`, change:

```js
/**
 * Claude Code adapter.
 *
 * rules/project-standards.md → CLAUDE.md (root)
 * rules/* (rest)        → .claude/rules/
 * skills/               → .claude/skills/
 * commands/             → .claude/commands/
 * workflows/            → .claude/agents/
 * hooks/                → .claude/hooks/
 */
```

to:

```js
/**
 * Claude Code adapter.
 *
 * rules/project-standards.md → CLAUDE.md (root)
 * rules/* (rest)        → .claude/rules/
 * skills/               → .claude/skills/
 * commands/             → .claude/commands/
 * workflows/            → .claude/agents/
 * subagents/            → .claude/agents/ (merged with workflows)
 * hooks/                → .claude/hooks/
 */
```

- [ ] **Step 2: Add install step 7**

In `src/adapters/claude.js`, after the existing step 6 (Recipes), add:

```js
    // 6. Recipes → .claude/recipes/
    const recipesSrc = path.join(sourceDir, 'recipes');
    await smartCopyFolder(recipesSrc, path.join(targetDir, 'recipes'), clack, 'Claude Recipe');

    // 7. Subagents → .claude/agents/ (alongside workflow orchestrators)
    const subagentsSrc = path.join(sourceDir, 'subagents');
    await smartCopyFolder(subagentsSrc, path.join(targetDir, 'agents'), clack, 'Claude Subagent');
  }
```

(i.e. insert the new step between the existing step 6 block and the closing `}` of `install()`.)

- [ ] **Step 3: Syntax check**

Run: `node -c src/adapters/claude.js`
Expected: no output (success)

- [ ] **Step 4: Commit**

```bash
git add src/adapters/claude.js
git commit -m "feat(adapters): install .agents/subagents/ into .claude/agents/ for Claude Code"
```

---

## Task 4: Add "Subagent Drift" section to `doctor.js`

**Files:**
- Modify: `src/commands/doctor.js:11` (import), `src/commands/doctor.js` (new section before Summary)

- [ ] **Step 1: Add the import**

In `src/commands/doctor.js`, change:

```js
const { readManifest, scanInstalledSkills, detectManifestDrift } = require('../core/manifest');
```

to:

```js
const { readManifest, scanInstalledSkills, detectManifestDrift } = require('../core/manifest');
const { detectSubagentDrift } = require('../core/subagent-drift');
```

- [ ] **Step 2: Add the new section before the Summary**

In `src/commands/doctor.js`, find:

```js
  } else {
    _info(`No schema version marker found. Run \`agents-skills upgrade\` to set up v${PKG_SCHEMA}.`);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
```

Replace with:

```js
  } else {
    _info(`No schema version marker found. Run \`agents-skills upgrade\` to set up v${PKG_SCHEMA}.`);
  }

  // ── 10. Subagent Drift ──────────────────────────────────────────────────────
  _header('Subagent Drift');

  const claudeAgentsDir = path.join(cwd, '.claude', 'agents');

  if (fs.existsSync(claudeAgentsDir)) {
    const subagentsSourceDir = path.join(__dirname, '..', '..', '.agents', 'subagents');
    const subagentDrift = detectSubagentDrift(subagentsSourceDir, claudeAgentsDir);

    if (subagentDrift.hasDrift) {
      _warn(`Subagent drift detected (${subagentDrift.issues.length} issue${subagentDrift.issues.length === 1 ? '' : 's'})`);
      for (const issue of subagentDrift.issues) {
        const icon = issue.type === 'missing' ? '✗' : '↻';
        _warn(`  ${icon} ${issue.subagent}: ${issue.details}`);
      }
    } else {
      _checkLine(true, 'No subagent drift detected');
    }
  } else {
    _info('.claude/agents/ not found — skipping subagent drift checks (Claude Code only)');
  }

  // ── Summary ────────────────────────────────────────────────────────────────
```

Note: `cwd` is already defined earlier in `doctorCommand()` (section 4, `const cwd = process.cwd();`) and is in scope here.

- [ ] **Step 3: Syntax check**

Run: `node -c src/commands/doctor.js src/core/subagent-drift.js`
Expected: no output (success)

- [ ] **Step 4: Manual verification**

Run: `node bin/cli.js doctor`
Expected: a new "Subagent Drift" section appears, printing `.claude/agents/ not found — skipping subagent drift checks (Claude Code only)` (since this repo doesn't have an installed `.claude/agents/` from a real install).

- [ ] **Step 5: Commit**

```bash
git add src/commands/doctor.js
git commit -m "feat(doctor): detect subagent drift between .agents/subagents/ and .claude/agents/"
```

---

## Task 5: Rewrite `build-feature.md` Phase 5 (Mode A/B/C + merge logic)

**Files:**
- Modify: `.agents/workflows/build-feature.md:122-152` (entire Phase 5 section)

- [ ] **Step 1: Replace Phase 5**

In `.agents/workflows/build-feature.md`, replace the entire Phase 5 section (from `## Phase 5 — Quality Gates` through the `---` before `## Phase 5a`):

```markdown
## Phase 5 — Quality Gates

### Mode Detection (run once)

Check both conditions:
1. Do `.claude/agents/code-review-analyzer.md`, `.claude/agents/security-auditor.md`, and `.claude/agents/test-coverage-analyzer.md` all exist?
2. Is the `Agent`/`Task` tool available in this session?

- **Both true** → **Mode A** (native parallel subagents, Claude Code only)
- **Otherwise** → **Mode C** (sequential — today's behaviour, unchanged). Mode B (worktree-parallel) is an experimental escape hatch for non-Claude agents/models that can confirm isolated-session-per-worktree support — see `plans/orchestrator-subagent-pattern-design.md` Section 2. Treat "Mode B unavailable" as the default for every non-Claude-Code platform.

### Mode A — Parallel Subagent Dispatch

Dispatch all 3 subagents in a single message (parallel `Agent`/`Task` calls):
- `code-review-analyzer` — wraps `skills/code-reviewer/SKILL.md`, read-only
- `security-auditor` — wraps `skills/security-and-hardening/SKILL.md`, read-only
- `test-coverage-analyzer` — wraps `skills/test-writing/SKILL.md`, may add new test files only

Each returns a report in the Summary/Findings/Notes format defined in its own `.claude/agents/*.md` (see `plans/orchestrator-subagent-pattern-design.md` Section 4).

After `test-coverage-analyzer` returns, run `git diff --name-status` — if it modified any **pre-existing** file (not just added new test files), treat this as a **Critical** finding for the test gate, surfaced to the user.

Proceed to **Merge Logic**.

### Mode C — Sequential (default fallback, today's behaviour)

#### 5a. Code Review `/review`
Load skill: `skills/code-reviewer/SKILL.md`
- Self-review against all criteria
- Produce the Summary/Findings/Notes report (do not fix yet — fixes happen in Merge Logic step 4)

#### 5b. Security Audit `/secure`
Load skill: `skills/security-and-hardening/SKILL.md`
- Input validation audit
- Auth/authorisation check
- Secrets scan
- `npm audit --audit-level=high`
- OWASP checklist
- Produce the Summary/Findings/Notes report

#### 5c. Test Suite `/test`
Load skill: `skills/test-writing/SKILL.md`
- Verify all slice tests pass
- Add coverage for any untested branches found during review (new test files only)
- Run full test suite: `npm test`
- Produce the Summary/Findings/Notes report

Proceed to **Merge Logic**.

### Merge Logic (applies to Mode A and Mode C alike)

1. If the test gate added test files, run `npm test`. Failures here block regardless of the other reports.
2. Aggregate all Critical/High findings from the review and security reports into one fix list, sorted by severity.
3. Empty list + tests green → **GATE PASS** → proceed to Phase 5a.
4. Non-empty → apply fixes **sequentially**, one finding at a time, then re-run lint/typecheck/tests after each.
5. Re-evaluate: all Critical/High resolved + tests green → **GATE PASS**. If a Critical finding can't be safely auto-fixed → **STOP**, surface to user — never silently skip.
6. Medium/Low findings from any report are non-blocking — collect into a single "Suggestions" list shown to the user after this phase.

**GATE**: Merge Logic resolves to PASS → proceed to Phase 5a

---
```

- [ ] **Step 2: Sanity-check the diff**

Run: `git diff .agents/workflows/build-feature.md`
Expected: only the Phase 5 section changed; Phase 0-4 and Phase 5a-6 untouched.

- [ ] **Step 3: Commit**

```bash
git add .agents/workflows/build-feature.md
git commit -m "feat(build-feature): rewrite Phase 5 quality gates with Mode A/B/C orchestration"
```

---

## Task 6: Rewrite `build-quick.md` Phase 3 (Mode A/C, single gate)

**Files:**
- Modify: `.agents/workflows/build-quick.md:47-58` (entire Phase 3 section)

- [ ] **Step 1: Replace Phase 3**

In `.agents/workflows/build-quick.md`, replace the entire Phase 3 section (from `## Phase 3 — Code Review` through the `---` before `## Phase 4`):

```markdown
## Phase 3 — Code Review `/review`

### Mode Detection
1. Does `.claude/agents/code-review-analyzer.md` exist?
2. Is the `Agent`/`Task` tool available in this session?

- **Both true** → **Mode A**: dispatch a single `code-review-analyzer` subagent (no parallelism gain with one gate, but context isolation still applies)
- **Otherwise** → **Mode C**: load `skills/code-reviewer/SKILL.md` directly in this session (today's behaviour, unchanged)

### Mode A
Dispatch `code-review-analyzer` (wraps `skills/code-reviewer/SKILL.md`, read-only). It returns a report in the Summary/Findings/Notes format (see `plans/orchestrator-subagent-pattern-design.md` Section 4).

### Mode C
1. Self-review the diff against project standards
2. Check for: unintended side effects, missing error handling, security issues
3. Produce the Summary/Findings/Notes report

### Merge Logic
Same as `/build-feature` Phase 5 Merge Logic, steps 2-6 (step 1 — test-coverage-analyzer — doesn't apply here, there's only one gate):
- Empty Critical/High list → **GATE PASS** → proceed to Phase 4
- Non-empty → fix sequentially, one finding at a time, re-lint/typecheck after each; re-evaluate
- If a Critical finding can't be safely auto-fixed → **STOP**, surface to user
- Medium/Low findings → non-blocking "Suggestions" list shown to user

**GATE**: no Critical/High issues remaining → proceed to Phase 4

---
```

- [ ] **Step 2: Sanity-check the diff**

Run: `git diff .agents/workflows/build-quick.md`
Expected: only the Phase 3 section changed; Phase 1-2 and Phase 4 untouched.

- [ ] **Step 3: Commit**

```bash
git add .agents/workflows/build-quick.md
git commit -m "feat(build-quick): rewrite Phase 3 code review with Mode A/C orchestration"
```

---

## Task 7: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including the new `test/subagents.test.js` (3 tests) and `test/subagent-drift.test.js` (4 tests).

- [ ] **Step 2: Syntax-check all modified/new JS files**

Run: `node -c src/adapters/claude.js src/commands/doctor.js src/core/subagent-drift.js`
Expected: no output (success)

- [ ] **Step 3: Dogfood install into a scratch workspace**

```bash
mkdir -p /tmp/agents-skills-subagent-check
cd /tmp/agents-skills-subagent-check
node /Users/bhargav/Desktop/BG/BGApps/agentic-workflows/bin/cli.js install
```

During the wizard: choose **Local workspace**, **Claude Code**, any role (e.g. Fullstack), no add-ons.

Expected: `.claude/agents/code-review-analyzer.md`, `.claude/agents/security-auditor.md`, and `.claude/agents/test-coverage-analyzer.md` exist alongside the existing workflow-derived agent files.

- [ ] **Step 4: Run doctor against the scratch workspace**

```bash
cd /tmp/agents-skills-subagent-check
node /Users/bhargav/Desktop/BG/BGApps/agentic-workflows/bin/cli.js doctor
```

Expected: "Subagent Drift" section reports "No subagent drift detected".

- [ ] **Step 5: Clean up the scratch workspace**

```bash
rm -rf /tmp/agents-skills-subagent-check
```

- [ ] **Step 6: Final commit (if any cleanup/fixes were needed)**

```bash
git status
```

If clean, no further commit needed — Tasks 1-6 already committed incrementally.

---

## Out of Scope (carried over from design doc)

- Mode B (worktree-parallel) implementation — documented as an escape hatch only
- Cursor/VS Code/Antigravity adapter changes — explicitly unchanged per Section 7
- `skills.json` changes — none required per Section 7
- Plugin marketplace distribution — separate effort
