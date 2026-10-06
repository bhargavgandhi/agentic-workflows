---
name: gate-protocol
description: Defines what a gate is, what stopping at one looks like, and the artifact each phase must produce. Use whenever running a gated workflow, approaching a gate, or writing a phase report.
version: 1.0.0
category: process
optional: false
phase: 0
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- Any gated workflow starts (`controlled-delegation`)
- A phase is about to end and an artifact must be written
- A gate is reached and the agent must stop
- A verify loop has failed and the agent is deciding whether to retry
- The agent is about to write code, to check whether Gate 1 has been passed

## 2. Prerequisites

- A writable `.agents/run/<task>/` directory for run artifacts
- A `plans/` directory for plan artifacts
- `references/artifact-schemas.md` read before writing any artifact

## 3. Steps

### 3a. What a gate is

A gate is a point where the agent **stops and produces nothing further until a
human responds**. Stopping at a gate is the correct outcome, not a failure.

Two gates exist:

| Gate | Position | Human decides |
|---|---|---|
| **Gate 1** | after the plan, before any code | is this the right design? |
| **Gate 2** | after verification, before merge | is this correct and safe to ship? |

### 3b. How to stop

At a gate:

1. Write the gate's artifact to disk — the artifact is the deliverable, not the
   chat message.
2. State the gate marker on its own line: `GATE 1: awaiting plan approval` or
   `GATE 2: awaiting review`.
3. Stop. Write no further files. Do not begin the next phase. Do not offer to
   begin it.

A gate is passed only by a human changing the artifact: Gate 1 by setting
`approved: true` in the plan's frontmatter, Gate 2 by merging or by replying.
An agent never marks its own gate as passed.

### 3c. Artifacts, not conversation

Every phase ends by writing a file. State lives in artifacts so the workflow
survives a context reset, works in any tool, and can be resumed by a different
agent. If losing the conversation loses the state, the state was in the wrong
place.

See `references/artifact-schemas.md` for the required shape of each. Templates
are in `assets/`.

### 3d. Negative knowledge is written as it is discovered

The plan carries two append-only sections:

- `## Ruled out` — approaches tried or considered and rejected, each with the reason
- `## Gotchas` — surprising facts discovered about the codebase or its dependencies

Write to them **the moment something is learned**, never at the end of a phase.
End-of-phase capture happens when context is most degraded and is the single
biggest source of knowledge loss across a reset. What costs real time after a
reset is re-walking dead ends, not re-reading decisions.

### 3e. Loops terminate explicitly

Every verify loop declares four things before it runs, recorded in
`.agents/run/<task>/attempts.json`:

| Element | Rule |
|---|---|
| Max iterations | 3 attempts against the **same failure signature** |
| Failure signature | A stable hash of the error. A different error is progress; the same one is a stall |
| Budget | A wall-clock or token ceiling, whichever the host can measure |
| Escalation | On exhaustion, stop and report at Gate 2 with everything tried |

Scope each retry to the failing target. Run the full suite once before Gate 2,
not on every iteration.

### 3f. Enforcement

Gate 1 is enforced by `hooks/guard-gate.js`, not by this document:

- as a git `pre-commit` hook — fast local feedback, skippable with `--no-verify`
- as a CI job — the real gate, and it cannot be skipped

It blocks a source-code commit when no plan in `plans/` carries both
`approved: true` and `branch: <current-branch>`, blocks commits to protected
branches, and blocks changes to `.env`, CI workflows and container config unless
the approved plan names them in `touches:`.

Docs-only and plan-only commits always pass, so writing the plan is never
blocked by the plan not yet existing.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|---|---|
| "The plan is obviously right, I'll start implementing and they can review the code" | Reviewing a plan costs minutes; reviewing a wrong implementation costs hours. The gate is there because the cheap review comes first. |
| "I'll write the code and just not commit it until approval" | Uncommitted work creates pressure to approve. Stop at the gate with nothing written. |
| "This change is too small to need a plan" | Then the plan is three lines and costs nothing. Size is not the criterion; writing code is. |
| "I'll put the gotchas in the handoff at the end" | At the end your context is most degraded. That is exactly when things get dropped. Write them now. |
| "The test is flaky, I'll retry once more" | "Flaky" is not a root cause. If the failure signature is unchanged, attempt 4 will fail too. Escalate. |
| "I'll mark the plan approved myself since the user said yes in chat" | A human sets `approved: true`. The field is the audit trail; an agent setting it erases the only evidence the gate was real. |
| "CI will catch it, I can `--no-verify` locally" | True, and it wastes a CI cycle and reviewer trust. The local hook exists to fail in two seconds instead of four minutes. |

## 5. Red Flags

Signs this skill is being violated:

- Source files changed in the same turn the plan was written
- A gate marker printed, followed by more work in the same response
- `approved: true` appearing in a commit authored by the agent
- A plan with an empty `## Ruled out` after a phase that involved real exploration
- `attempts.json` missing, or an attempt count above 3 for one failure signature
- The Gate 2 report claiming green checks with no artifact under `reports/`
- A commit using `--no-verify` with no explanation in the Gate 2 report

## 6. Verification Gate

Before printing `GATE 1: awaiting plan approval`:

- [ ] `plans/<task>.md` exists and validates against the schema
- [ ] Frontmatter has `branch:` set and `approved:` absent or `false`
- [ ] Every acceptance criterion maps to a named test
- [ ] One rejected alternative is recorded with its reason
- [ ] Any sensitive path the work needs is listed in `touches:`
- [ ] No source file has been created or modified

Before printing `GATE 2: awaiting review`:

- [ ] `.agents/run/<task>/gate2.md` exists and validates against the schema
- [ ] Every check named in the plan has a report under `reports/`
- [ ] Deviations from the approved plan are listed with reasons
- [ ] Review hotspots name specific lines touching state, effects, async timing,
      auth or user data
- [ ] `attempts.json` shows no unresolved loop at its iteration ceiling
- [ ] Nothing has been merged

## 7. References

- [artifact-schemas.md](references/artifact-schemas.md) — required shape of every artifact
- [assets/plan.md](assets/plan.md) — Gate 1 plan template
- [assets/brief.md](assets/brief.md) — Phase 0 brief template
- [assets/gate2.md](assets/gate2.md) — Gate 2 report template
