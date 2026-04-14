---
description: Full lifecycle orchestration for building features — from adversarial validation through to PR creation. Chains all mandatory process skills with gate conditions. Invoke with /build-feature.
version: 3.0.0
---

# /build-feature — Master Workflow

> Chains all mandatory process skills in the correct order with gate conditions between each phase.
> Individual slash commands (e.g. `/grill-me`, `/implement`) can be invoked independently for power users.

---

## Phase 0 — Skill Gap Detection + Context Load

**Run before anything else.**

### 0a. Context Resumption
1. Check `.agents/context-snapshots/` for an existing snapshot (newest first)
2. If found: load only the files and skills listed in it. Start from "Remaining Work". Skip to the listed phase.
3. If not found: proceed to 0b

### 0b. Skill Gap Detection
Parse the task description to extract technology signals (framework names, library names, service names).

Check installed skills in `.agents/skills/` against the extracted signals.

Produce one of three outcomes:

**OUTCOME A — All required skills present:**
```
All required skills are installed. Proceeding.
```

**OUTCOME B — Skills available in registry:**
```
This task requires [skill-list].
[N] skill(s) not installed. Options:
  1. Install now: agents-skills install [skill-list]
  2. Install via pack: agents-skills install [pack-name]  (if applicable)
  3. Proceed without (agent uses training data — lower confidence)
```
Wait for user choice before proceeding.

**OUTCOME C — Skills not in registry:**
```
This task requires [technology] but no matching skill is in the registry.
Options:
  1. Create a new skill: /skill-creator
  2. Proceed without (agent uses training data — lower confidence)
```
Wait for user choice before proceeding.

### 0c. Minimal Context Load
Load ONLY skills needed for Phase 1 (grill-me + write-a-prd + source-driven-development).
Do NOT load all skills. Run `agents-skills tokens --budget` to confirm you are under 40% budget.

**GATE**: budget under 40% and skill gap resolved → proceed to Phase 1

---

## Phase 1 — Adversarial Validation `/grill-me`

Load skill: `skills/grill-me/SKILL.md`

1. Restate the goal in one sentence
2. List all assumptions embedded in the plan
3. Attack each assumption — identify failure modes
4. Map the decision tree — name all branches
5. Surface scope creep vectors
6. Resolve every Critical/Significant assumption

**GATE**: every decision branch resolved, no "TBD" on Critical items → proceed to Phase 2

---

## Phase 2 — PRD `/write-a-prd`

Load skill: `skills/write-a-prd/SKILL.md`

1. Write problem statement (what, for whom, why now)
2. Define target users
3. Write user stories (min 3)
4. Define measurable success criteria
5. Set Always/Ask/Never scope boundaries
6. Write non-functional requirements
7. List dependencies and risks
8. Create GitHub issue with `[PRD]` title and `prd` label
9. Save to `.agents/docs/prd-<feature-slug>.md`

**GATE**: GitHub issue created, PRD saved locally → proceed to Phase 3

---

## Phase 3 — Implementation Plan `/prd-to-plan`

Load skill: `skills/prd-to-plan/SKILL.md`

1. Identify the tracer bullet (thinnest end-to-end path)
2. Decompose into vertical slices (each independently testable)
3. Order slices: tracer → high-risk → features → polish
4. For each slice: goal, layers, test, commit message
5. List required tech skills per slice
6. Save to `./plans/<feature-slug>-plan.md`

Load required tech skills now based on plan analysis.

**GATE**: plan saved, all slices have a test and commit message → proceed to Phase 4

---

## Phase 4 — Implementation `/implement`

Load skill: `skills/incremental-implementation/SKILL.md`
Load tech skills identified in Phase 3.
Load `skills/source-driven-development/SKILL.md` (always active during implementation).

For each slice:
1. State scope lock (slice name, test, files)
2. Write test first (failing)
3. Implement minimum code to pass
4. Verify: test passes, no regressions, TypeScript compiles, lint passes
5. Commit with the message from the plan

Check context budget between slices. If > 70%, trigger `context-engineering` compaction before continuing.

**GATE**: all slices committed and green → proceed to Phase 5

---

## Phase 5 — Quality Gates

Load skills for each gate:

### 5a. Code Review `/review`
Load skill: `skills/code-reviewer/SKILL.md`
- Self-review against all criteria
- Fix all blocking issues immediately
- Report suggestions to user

**GATE**: no blocking issues → proceed to 5b

### 5b. Security Audit `/secure`
Load skill: `skills/security-and-hardening/SKILL.md`
- Input validation audit
- Auth/authorisation check
- Secrets scan
- `npm audit --audit-level=high`
- OWASP checklist

**GATE**: no Critical/High issues → proceed to 5c

### 5c. Test Suite `/test`
Load skill: `skills/test-writing/SKILL.md`
- Verify all slice tests pass
- Add coverage for any untested branches found during review
- Run full test suite: `npm test`

**GATE**: all tests passing, no regressions → proceed to Phase 5a (optional gates)

---

## Phase 5a — Optional Gates (user opt-in)

Present these options to the user:

```
Optional quality gates available:
  [/perf]  Performance audit — Core Web Vitals, bundle analysis
  [/docs]  Documentation + ADRs
  Skip → proceed to Phase 6
```

If `/perf` selected:
- Load skill: `skills/performance-optimization/SKILL.md`
- Measure baseline → identify bottleneck → fix → re-measure

If `/docs` selected:
- Load skill: `skills/documentation-and-adrs/SKILL.md`
- Write ADRs for non-obvious decisions
- Document new APIs
- Update README if needed

---

## Phase 6 — Ship `/ship`

Load skills: `skills/git-workflow/SKILL.md` + `skills/ci-cd-and-automation/SKILL.md`

1. Create feature branch (from plan slug)
2. Stage only modified files
3. Commit with conventional commit message (approve with user)
4. Push to origin
5. Create PR with title, body, and `prd` issue link
6. Monitor CI — fix failures with fixup commits

**GATE**: all CI checks passing, PR created → workflow complete

---

## Quick Reference

| Command | Skill | Phase |
|---------|-------|-------|
| `/grill-me` | grill-me | Phase 1 |
| `/write-a-prd` | write-a-prd | Phase 2 |
| `/prd-to-plan` | prd-to-plan | Phase 3 |
| `/implement` | incremental-implementation | Phase 4 |
| `/review` | code-reviewer | Phase 5a |
| `/secure` | security-and-hardening | Phase 5b |
| `/test` | test-writing | Phase 5c |
| `/perf` | performance-optimization | Phase 5a opt-in |
| `/docs` | documentation-and-adrs | Phase 5a opt-in |
| `/ship` | git-workflow + ci-cd-and-automation | Phase 6 |
| `/compact` | context-engineering | Any phase |
| `/debug` | debug-investigator | On-demand |
| `/skill-creator` | skill-creator | Phase 0 (gap) |
