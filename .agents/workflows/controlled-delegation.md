---
description: The single end-to-end workflow — scope → plan (GATE 1) → implement → verify → report (GATE 2) → log. Two human gates, artifacts between every phase, runs in any agent. Invoke with /build.
version: 4.0.0
---

# /build — Controlled Delegation

> The human owns the spec, the architecture decisions and the merge.
> The agent owns the plan draft, the implementation and the tests.
> **Stopping at a gate is the correct behaviour, not a failure.**

Load skill: `skills/gate-protocol/SKILL.md` — read it before Phase 0, and read
`skills/gate-protocol/references/artifact-schemas.md` before writing any artifact.

**Modes.** `FULL` runs both gates. `QUICK` skips Gate 1 for changes under ~50
lines with no state, auth, data-persistence or security impact — it does not skip
the plan, only the wait for approval. If you cannot tell which applies, it is FULL.

**Capability tiers.** This workflow runs at Core tier — files and a prompt — in
any agent. Where the host offers more, the extras are accelerators and must never
be load-bearing: if a phase only produces a correct artifact when subagents exist,
the phase is wrong.

| Tier | Available | Adds |
|---|---|---|
| Core | everywhere | Artifacts, git hook, CI gate |
| Assisted | project instruction files + custom commands | Auto-loaded instructions, one command per phase |
| Accelerated | Claude Code | Parallel subagents, per-subagent `model:`, PreToolUse hooks |

---

## Phase 0 — Scope

Normalise whatever the operator gave you into one artifact. Every later phase
reads this shape regardless of where the work came from.

| Input | How to fetch |
|---|---|
| A prompt or pasted requirement | Use it directly |
| A GitHub issue | `gh api repos/<owner>/<repo>/issues/<n>` |
| A file path | Read it |
| A URL | Fetch it; if the host cannot, ask the operator to paste |

Write `.agents/run/<task>/brief.md` per the schema. Pick `<task>` as a slug from
the request; it is the run directory name and the plan filename.

**GATE**: `brief.md` exists with at least one acceptance criterion → Phase 1

---

## Phase 1 — Understand

Read `brief.md` and every file it names. Nothing else — a wide read here is paid
for on every subsequent turn.

If the acceptance criteria are ambiguous or missing, **ask up to three specific
questions and stop.** Do not guess at product behaviour. This applies equally
whether the brief came from a ticket or from a one-line prompt: the questions
interrogate the brief, not its origin.

Optional, where the repo is unfamiliar: `codebase-mapper` and `env-scanner`
produce `.codebase-intel/*.md`. Both are artifact producers, so they work at
Core tier; dispatch them to a cheap subagent where that is available.

**GATE**: acceptance criteria unambiguous → Phase 2

---

## Phase 2 — Plan, then STOP (Gate 1)

Write `plans/<task>.md` per the schema, from `assets/plan.md`.

Set `branch:` to the branch the work will happen on, named
`<type>/<semantic-name>` — `feat/`, `fix/`, `chore/`, `docs/`, `refactor/` or
`hotfix/`. Leave `approved: false`.

List any sensitive path the work genuinely needs in `touches:` — `.env*`, CI
workflows, container config. Anything not listed there will be blocked at commit
time, by design.

Then print, on its own line:

```
GATE 1: awaiting plan approval
```

and stop. Write no code. Do not offer to start. A human passes this gate by
setting `approved: true` in the plan's frontmatter — never the agent.

`QUICK` mode: still write the plan, then continue without waiting.

**GATE**: `approved: true` present in `plans/<task>.md` → Phase 3

---

## Phase 3 — Implement

Load `skills/incremental-implementation/SKILL.md` and
`skills/source-driven-development/SKILL.md`.

Work on the branch named in the plan. One slice at a time:

1. **Scope lock** — state the slice, its single test, and the files it touches
2. **Write the failing test first**
3. **Implement** the minimum that passes it
4. **Verify** — test passes, nothing regressed, typecheck and lint clean
5. **Commit** with a Conventional Commits message

Rules that hold for every slice:

- Touch only what the plan names. A discovery that the plan is wrong is a
  **stop and explain**, not an improvised redesign.
- Reuse existing components and patterns before creating new ones.
- No new dependency unless the plan named it.
- Append to `## Ruled out` and `## Gotchas` **the moment** something is learned.
  Not at the end of the phase — by then your context is at its worst and this is
  the single biggest source of knowledge loss across a reset.

Context: one `/clear`-equivalent at the Gate 1 boundary is the cheapest point to
reset, because the approved plan is a complete, human-verified spec. Beyond that,
reset on token pressure rather than on phase count.

**GATE**: every slice committed and green → Phase 4

---

## Phase 4 — Verify

Run the project's own checks, from the commands block in the agent instructions
file. Quiet flags matter: command output stays in context for the rest of the
session.

Loop discipline, per `gate-protocol` §3e, recorded in
`.agents/run/<task>/attempts.json`:

- 3 attempts against the **same failure signature**, then stop and escalate
- a different error is progress; the same error is a stall
- scope each retry to the failing target; run the full suite once at the end
- "flaky" is not a root cause

Quality gates produce one report each under `.agents/run/<task>/reports/`:
`review.md`, `security.md`, `tests.md`. At Accelerated tier, dispatch the three
subagents in parallel and merge. At Core tier, run them sequentially — the
artifacts are identical either way, which is the point.

**GATE**: all checks green, no Critical or High finding unresolved → Phase 5

---

## Phase 5 — Report, then STOP (Gate 2)

Write `.agents/run/<task>/gate2.md` from `assets/gate2.md`.

Be honest in `## Unsure about`. An empty section there is a red flag, not a clean
bill of health — it is the section a reviewer reads to decide where to look hard.

Print, on its own line:

```
GATE 2: awaiting review
```

and stop. Never merge.

**GATE**: human reviews → Phase 6

---

## Phase 6 — Log

After the human approves or rejects, append one row to `docs/agent-log.md`:

```
| Date | Task | Plan approved first try | Review comments | Checks green first run | Notes |
```

This is not bookkeeping. These columns are what the eval harness scores, so the
log is the evidence that the workflow helps — or that it does not.

---

## Never

- Never write code before Gate 1 is approved
- Never set `approved: true` yourself
- Never merge, push to a protected branch, or delete branches
- Never weaken, skip or quarantine a test to get green — say so at Gate 2 instead
- Never touch `.env*`, secrets, auth config or CI config unless the approved plan
  names them in `touches:`
- Never report a task done while any check is failing
