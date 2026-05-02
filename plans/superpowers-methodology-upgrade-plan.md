# Implementation Plan — Superpowers Methodology Upgrade

**PRD**: (inline — no separate PRD file for this upgrade)
**Date**: 2026-05-02
**Tech Skills Required**: `skill-creator`, `incremental-implementation`

---

## Slice 0 — Tracer Bullet: Red-Green-Refactor in incremental-implementation

**Goal**: Add an explicit Step 3.5 "Refactor" phase to `incremental-implementation` SKILL.md, positioned between the green (passing) test confirmation and the commit step. Update `/build-feature` Phase 4 and `/build-quick` Phase 2 to reference the refactor step so all workflows enforce the full TDD loop.

**Layers**:
- `skills/incremental-implementation/SKILL.md` — insert Step 3.5 Refactor phase; add "refactor is optional" to anti-rationalization table
- `.agents/workflows/build-feature.md` — Phase 4 (implement) references the refactor step
- `.agents/workflows/build-quick.md` — Phase 2 (implement) references the refactor step

**Test**:
1. `skills/incremental-implementation/SKILL.md` contains a clearly labelled "Step 3.5 — Refactor" or "Refactor Phase" section positioned after the green step and before commit.
2. The anti-rationalization table in SKILL.md includes a row rebutting the excuse "refactor is optional / I'll do it later."
3. `.agents/workflows/build-feature.md` Phase 4 contains an explicit reference to the refactor step (text like "run the refactor phase per incremental-implementation").
4. `.agents/workflows/build-quick.md` Phase 2 contains the same reference.
5. The refactor step explicitly states: do not change behavior, run tests again after refactoring, only proceed to commit when tests are still green post-refactor.

Maps to Superpowers principle: **Red-Green-Refactor** — tests must fail before implementation; after green, an explicit refactor pass improves design without breaking tests.

**Tech skills**: `incremental-implementation`, `skill-creator`
**Commit**: `feat: add explicit red-green-refactor phase to incremental-implementation skill`

---

## Slice 1 — Socratic Brainstorming Skill

**Goal**: Create a new `skills/brainstorming/SKILL.md` that implements a structured Socratic dialogue loop to surface requirements, constraints, and edge cases before handing off to grill-me. Wire it into `/build-feature` as Phase 0.5 — inserted between "context load" and "grill-me" — so requirements are co-discovered interactively before adversarial stress-testing begins.

**Layers**:
- `skills/brainstorming/SKILL.md` (new file) — full 7-section SKILL.md anatomy with opening question set, iterative refinement loop (max 3 rounds), and "requirements frozen" gate
- `.agents/workflows/build-feature.md` — add Phase 0.5 "Brainstorm" between context load and grill-me; reference the brainstorming skill

**Test**:
1. `skills/brainstorming/SKILL.md` exists and follows the 7-section SKILL.md anatomy (Purpose, When to Use, Prerequisites, Steps, Anti-Rationalizations, Output, References).
2. The Steps section includes: (a) an opening question set that probes user intent, constraints, and acceptance criteria; (b) an iterative refinement loop capped at 3 rounds; (c) an explicit "requirements frozen" gate statement that must be confirmed before brainstorming hands off to grill-me.
3. `.agents/workflows/build-feature.md` has a Phase 0.5 (or equivalent label like "Phase 1 — Brainstorm") that loads the brainstorming skill and references the requirements-frozen gate as a prerequisite for the grill-me phase.
4. The skill includes an anti-rationalization rebuttal against "we already know the requirements."
5. The skill output section specifies what artifact is produced (a frozen requirements list or structured context block) to be passed to grill-me.

Maps to Superpowers principle: **Socratic Brainstorming** — structured dialogue that refines requirements before coding; questions surface edge cases, constraints, and user intent.

**Tech skills**: `skill-creator`
**Commit**: `feat: add brainstorming skill for Socratic requirements discovery before grilling`

---

## Slice 2 — Architectural Escalation in debug-investigator

**Goal**: Extend `debug-investigator` SKILL.md with a Phase 4 "Architectural Review" trigger. After 3 failed fix attempts on the same bug class, the agent must stop applying tactical fixes and escalate to an architectural review that examines structural root causes. Add an explicit "attempt counter" tracking instruction and a "pattern analysis" step that identifies whether the bug class is symptomatic of a deeper design problem.

**Layers**:
- `skills/debug-investigator/SKILL.md` — add attempt counter instruction; add pattern analysis step; add Phase 4 escalation trigger; update anti-rationalization table

**Test**:
1. `skills/debug-investigator/SKILL.md` contains an explicit instruction to track a "fix attempt counter" for each bug class (e.g., a numbered attempt log in the debug report).
2. A "Pattern Analysis" step exists that directs the agent to examine whether the current bug shares a root class with previous bugs before proposing a fix.
3. A Phase 4 "Architectural Review" section exists that is explicitly triggered when the attempt counter reaches 3 on the same bug class.
4. The architectural review phase includes instructions to: (a) examine the design of the affected module, (b) consider whether the bug class indicates a missing abstraction or invariant violation, (c) propose a structural fix rather than a patch.
5. The anti-rationalization table includes a row rebutting "this fix is different from the previous ones" as a reason to skip escalation.

Maps to Superpowers principle: **4-Phase Debugging** — reproduce → root cause investigation → pattern analysis → hypothesis testing → implementation; architectural review triggered after 3 failed fix attempts on same bug class.

**Tech skills**: `skill-creator`, `debug-investigator`
**Commit**: `feat: add architectural escalation trigger to debug-investigator after 3 failed attempts`

---

## Slice 3 — Subagent Code Review Checkpoint in incremental-implementation

**Goal**: Add a "Checkpoint Review" cadence to `incremental-implementation` SKILL.md: after every 3 completed slices, or after any slice explicitly flagged as high-risk, the agent must pause, load `code-reviewer`, and run a review against the accumulated diff before starting the next slice. Update `/build-feature` Phase 4 to reference this checkpoint cadence.

**Layers**:
- `skills/incremental-implementation/SKILL.md` — add checkpoint cadence rule; add instruction to load code-reviewer; add blocking gate before next slice
- `.agents/workflows/build-feature.md` — Phase 4 references the checkpoint cadence from the skill

**Test**:
1. `skills/incremental-implementation/SKILL.md` contains a "Checkpoint Review" section with an explicit cadence rule: every 3 slices, or any slice marked as high-risk, triggers a review pause.
2. The section instructs the agent to load `code-reviewer` skill and run it against the accumulated diff (or the last 3 slices) before proceeding.
3. A blocking gate is stated: do not start the next slice if the checkpoint review surfaces any blocking issues; resolve them first.
4. High-risk slice criteria are defined (e.g., changes to auth, data migrations, public API contracts, shared utilities).
5. `.agents/workflows/build-feature.md` Phase 4 contains a reference to the checkpoint cadence ("run checkpoint review per incremental-implementation every 3 slices").

Maps to Superpowers principle: **Subagent-driven development** — code review as a checkpoint agent embedded in the implementation loop, not just an end gate.

**Tech skills**: `incremental-implementation`, `code-reviewer`
**Commit**: `feat: add subagent review checkpoints to incremental-implementation every 3 slices`

---

## Slice 4 — Writing-Skills TDD: Test Specs as Documentation

**Goal**: Add a Step 0 "Spec First" phase to `test-writing` SKILL.md. Before writing any test code, the agent must write a plain-English spec block describing the behavior under test. The spec language must appear verbatim in the test's `describe`/`it` strings and must be included in the PR description. This enforces tests as living documentation of intent.

**Layers**:
- `skills/test-writing/SKILL.md` — add Step 0 spec-writing instruction with example; add verbatim-spec rule for describe/it strings; add anti-rationalization against skipping spec

**Test**:
1. `skills/test-writing/SKILL.md` has a Step 0 "Spec First" section positioned before any test code instruction.
2. The Step 0 section includes: (a) instructions to write a plain-English behavior spec block before opening any test file; (b) a concrete example showing the spec block and the resulting describe/it strings that reproduce the spec language verbatim.
3. A rule is stated: the language of the spec block must appear verbatim (or near-verbatim) in the test's `describe` and `it` strings — implementation details must not leak into spec language.
4. The anti-rationalization table includes a row rebutting "the tests are self-documenting / I'll write the spec later."
5. The skill's Output section or a note references including the spec block in the PR description to make it a living documentation artifact.

Maps to Superpowers principle: **Writing-skills TDD** — test specs written first as documentation of intent; tests communicate "what" before implementation addresses "how."

**Tech skills**: `skill-creator`, `test-writing`
**Commit**: `feat: add spec-first documentation discipline to test-writing skill`

---

## Slice 5 — execute-plan: Batched Slice Execution with Checkpoints

**Goal**: Create a new `.agents/workflows/execute-plan.md` workflow that reads an existing plan file, groups its slices into configurable batches (default batch size: 3), executes each batch using the `incremental-implementation` discipline, runs a `code-reviewer` checkpoint after each batch, pauses for user approval before starting the next batch, and performs a context budget check before each batch to prevent context window exhaustion. Also create `.agents/commands/execute-plan.md` as the slash command entry point.

**Layers**:
- `.agents/workflows/execute-plan.md` (new file) — batch size config; per-batch code-reviewer checkpoint; user approval gate; context budget check
- `.agents/commands/execute-plan.md` (new file) — slash command definition that loads execute-plan workflow

**Test**:
1. `.agents/workflows/execute-plan.md` exists and defines a configurable batch size (default 3) at the top of the workflow.
2. The workflow has a per-batch checkpoint step that loads `code-reviewer` and runs it against the diff accumulated during that batch.
3. An explicit user approval gate is defined between batches: the workflow must pause, surface the checkpoint review output, and wait for explicit user confirmation before starting the next batch.
4. A context budget check step exists that must run before each batch begins — if context budget is below a stated threshold (e.g., 30% remaining), the workflow must trigger a compact/snapshot before proceeding.
5. `.agents/commands/execute-plan.md` exists and correctly references the execute-plan workflow as its implementation.

Maps to Superpowers principle: **execute-plan** — batched plan execution with review checkpoints at configurable intervals; prevents runaway execution without oversight.

**Tech skills**: `skill-creator`, `incremental-implementation`, `code-reviewer`, `context-engineering`
**Commit**: `feat: add execute-plan workflow for batched slice execution with review checkpoints`

---

## Slice 6 — Wire Brainstorming into build-quick

**Goal**: Add an optional Phase 0.5 brainstorming step to `/build-quick` that can be skipped with an explicit `--skip-brainstorm` flag for truly small, well-defined tasks. Define the criteria that determine when brainstorming is mandatory vs. skippable. Update the "upgrade to build-feature" trigger in build-quick to include "ambiguous requirements" as an escalation signal.

**Layers**:
- `.agents/workflows/build-quick.md` — add Phase 0.5 brainstorming step with skip condition; update upgrade-to-build-feature trigger

**Test**:
1. `.agents/workflows/build-quick.md` contains a Phase 0.5 (or equivalent positioning) that loads the brainstorming skill before grill-me.
2. An explicit skip condition is defined with criteria for when `--skip-brainstorm` is appropriate (e.g., task is a one-line fix, requirements are a direct restatement of an error message, no user-facing behavior is changed).
3. The skip condition explicitly states that ambiguous requirements disqualify a task from skipping brainstorming.
4. The "upgrade to build-feature" escalation trigger in build-quick is updated to include "ambiguous requirements discovered during brainstorming" as a named escalation reason alongside any existing triggers.
5. The phase is clearly marked as optional with the skip mechanism documented, so build-quick retains its lightweight character for genuinely simple tasks.

Maps to Superpowers principle: **Socratic Brainstorming** — even lightweight workflows benefit from structured requirement surfacing; the skip path keeps build-quick fast without removing the safety valve.

**Tech skills**: `incremental-implementation`
**Commit**: `feat: wire optional brainstorming phase into build-quick workflow`
