# Automation Improvements — Repo Hygiene & Contributor Safety

**Source**: `/claude-automation-recommender` analysis, 2026-06-08
**Why this matters**: This repo publishes `agents-skills` to npm — other engineers install its skills/workflows/hooks into their own IDEs. Gaps here ship as bugs in their setups, not just ours.
**Status**: Proposed — not yet implemented

---

## 1. Guard the generated `skills/` and `recipes/` directories

**Problem**: `package.json`'s `prepublishOnly` runs `rm -rf skills recipes && cp -r .agents/skills skills && cp -r .agents/recipes recipes`. The top-level `skills/` and `recipes/` are *generated mirrors* of `.agents/skills/` and `.agents/recipes/` — identical in structure, easy to mistake for the source. Any edit made directly to `skills/*` is silently destroyed on the next publish, with zero warning at edit time.

**Fix**: Add a `PreToolUse` hook in `.claude/settings.json` that blocks `Edit`/`Write` on paths matching `^skills/|^recipes/` and tells the agent/user to edit the `.agents/` copy instead.

**Verify**: Attempt an edit to `skills/grill-me/SKILL.md` — confirm the hook blocks it with a clear redirect message to `.agents/skills/grill-me/SKILL.md`.

---

## 2. Auto-run manifest tests on manifest/skill edits

**Problem**: `skills.json` ↔ `.agents/skills/**` consistency (bundle membership, tombstones, 7-section anatomy) is currently checked only by manually running `node --test test/manifest.test.js`, or at install-time via `doctor`'s drift detection (which only inspects an end-user's *installed* copy, not the source tree during authoring).

**Fix**: Add a `PostToolUse` hook on `Edit|Write` matching `skills\.json|\.agents/skills/.*/SKILL\.md` that runs `node --test test/manifest.test.js` and surfaces failures immediately.

**Verify**: Edit a `SKILL.md` to remove a required section header — confirm the hook fires the test run and reports the failure inline.

---

## 3. Add CI (GitHub Actions) running tests on every PR

**Problem**: There is no `.github/workflows/` — zero automated gate before merging to `main`. Test coverage is also thin (one file, `manifest.test.js`, 282 lines, vs. ~2,000 lines of command logic). For a package other engineers depend on, this means regressions in `install`, `doctor`, `upgrade`, etc. can land without any automated check.

**Fix**:
- Add `.github/workflows/ci.yml`: on `pull_request` to `main`, run `npm ci && npm test`
- (Stretch) Add a `node --check` syntax pass across `bin/**/*.js src/**/*.js` mirroring the existing pre-commit hook, so CI catches what local hooks might be skipped via `--no-verify`

**Verify**: Open a draft PR with a deliberately broken test — confirm the CI check fails and blocks merge (if branch protection is configured) or at least shows red in the PR checks.

---

## 4. `skill-anatomy-validator` skill

**Problem**: All 26 skills now comply with the 7-section anatomy (Trigger Conditions → Prerequisites → Steps → Anti-Rationalization Table → Red Flags → Verification Gate → References), achieved through manual verification this session. There's no repeatable way for contributors to check a new/edited `SKILL.md` against this structure before opening a PR — the standard will silently erode as the skill catalog grows.

**Fix**: Create `.agents/skills/skill-anatomy-validator/SKILL.md` — a skill (invocable by both Claude and users) that:
- Parses a target `SKILL.md`'s `## ` headers
- Confirms all 7 required sections are present, in order, with non-empty content
- Flags weak Anti-Rationalization tables (e.g., fewer than N rows) or vague Trigger Conditions

**Verify**: Run it against `skills/code-reviewer/SKILL.md` (should pass) and a deliberately incomplete draft skill (should fail with specific missing-section feedback).

---

## Priority Order

1. **#1 (guard generated dirs)** — cheapest fix, prevents silent data loss, no dependencies
2. **#3 (CI)** — biggest structural gap for a shared package; unblocks confident merging
3. **#2 (manifest test hook)** — nice local feedback loop, complements #3
4. **#4 (skill-anatomy-validator)** — formalizes a standard that currently lives only in this session's verification

## Out of Scope / Not Recommended
- External plugin bundles — this repo *is* a skills package; installing more for its own development adds little
- ESLint/Prettier/TypeScript migration — real but separate from "automation," and not raised by the recommender analysis as the top concern
