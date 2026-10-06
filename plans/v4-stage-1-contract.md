---
task: v4-stage-1-contract
branch: feat/v4-orchestration-layer
approved: true
mode: FULL
touches:
  - .github/workflows/ci.yml
---

# Plan — v4 Stage 1: the phase contract

Stage 1 of `plans/v4-orchestration-repositioning.md` §7. Approved in session by
the repository owner before implementation started.

Scope: define the contract between phases and make Gate 1 enforceable. Delete
nothing — Stage 2's removals depend on this contract proving itself first.

## Files

| File | Change | Why |
|---|---|---|
| `src/core/gate-check.js` | new | Pure gate logic, testable without git |
| `hooks/guard-gate.js` | new | CLI wrapper: `--staged` for the hook, `--range` for CI |
| `hooks/pre-commit` | edit | Call guard-gate for fast local feedback |
| `.github/workflows/ci.yml` | edit | Add the `gate` job — the unskippable gate |
| `test/gate-check.test.js` | new | 15 cases over classification, plan discovery and the gate |
| `.agents/skills/gate-protocol/SKILL.md` | new | What a gate is, how to stop, loop discipline |
| `.agents/skills/gate-protocol/references/artifact-schemas.md` | new | Required shape of every artifact |
| `.agents/skills/gate-protocol/assets/{brief,plan,gate2}.md` | new | Templates |
| `.agents/workflows/controlled-delegation.md` | new | The single workflow, FULL/QUICK, 7 phases |
| `docs/agent-log.md` | new | Phase 6 output and the eval's data source |
| `skills.json` | edit | Register `gate-protocol` as core in all bundles |
| `.agents/skills/source-driven-development/SKILL.md` | edit | `phase: 1` → `phase: 4`; every caller loads it in Phase 4 |

## Contracts

Artifact graph, fully specified in `references/artifact-schemas.md`:

```
brief.md -> plan.md (@approved) -> source -> reports/*.md -> gate2.md -> agent-log row
                  ^                   |
                  +-- ruled-out, gotchas (append-only)
                      attempts.json (loop state)
```

`checkGate({ files, branch, planDir, cwd }) -> { ok, violations[], checked }`.
Pure: takes a file list, reads plans from disk, returns violations. No git, no
network, no model.

## States covered

- Docs/plan-only change → pass, so writing the plan is never blocked by the plan
  not existing yet
- Source change, no approved plan → block `no-approved-plan`
- Source change, approved plan for a *different* branch → block
- Protected branch → block `protected-branch`
- Sensitive path not in `touches:` → block, even with an approved plan
- Sensitive path alone, no source files → still block (no technicality escape)
- Unparseable plan frontmatter → not an approval
- Missing `plans/` directory → empty, not an error
- CI detached HEAD → branch resolved from `GITHUB_HEAD_REF`

## Accessibility

Not applicable — no UI in this stage.

## Test plan

| Acceptance criterion | Test | Type |
|---|---|---|
| Source commit without an approved plan is blocked | `checkGate: source change without an approved plan is blocked` | unit |
| Approved plan for this branch unblocks it | `checkGate: source change with an approved plan for this branch passes` | unit |
| One branch's approval does not unlock another | `checkGate: another branch's approved plan does not unlock this branch` | unit |
| Protected branches rejected | `checkGate: committing to a protected branch is blocked` | unit |
| Sensitive paths need naming in `touches:` | `checkGate: sensitive path is blocked even with an approved plan` + `...passes when the plan names it` | unit |
| Docs-only commits never blocked | `checkGate: docs-only commit passes with no plan at all` | unit |
| All violations reported, not just the first | `checkGate: reports every violation, not just the first` | unit |
| Hook works against real git state | run `guard-gate.js --staged` against this commit | manual |

## Risks

- **Enforcement is the point, so a false positive is expensive.** Mitigated by
  blocking only source extensions and named sensitive paths; docs, plans, JSON
  and YAML pass freely.
- `--no-verify` bypasses the local hook. Accepted: CI runs the same check.
- The CI job uses `origin/${{ github.base_ref }}`, which is only set on
  `pull_request` events. On a push-triggered run the job would fail to resolve a
  range — the workflow currently only triggers on `pull_request`, so this is
  correct today and a trap if the trigger is widened.
- `touches:` is a self-declared allowlist. It does not stop a determined agent;
  it makes the intent reviewable in the diff, which is the realistic goal.

## Rejected alternative

**A Claude Code `PreToolUse` hook instead of a git hook.** Rejected: it fails
earlier and reads better, but it only works in Claude Code. The cross-tool
requirement (§6) makes git and CI the only enforcement surfaces every agent has
to pass through. The PreToolUse hook stays available as an Accelerated-tier
addition that fails two seconds sooner, never as the mechanism.

## Ruled out

- Putting the loop counter in the agent's context rather than `attempts.json` —
  it does not survive a context reset, which is exactly when an agent forgets it
  already tried three times and starts the loop again.
- Letting any approved plan in `plans/` unlock a commit — one approval would
  then unlock every future branch in the repo. Hence the `branch:` match.

## Gotchas

- `git rev-parse --abbrev-ref HEAD` returns the literal string `HEAD` in CI's
  detached checkout, so branch detection must prefer `GITHUB_HEAD_REF`.
- `core.hooksPath` is unset in a fresh clone, so the pre-commit hook does
  nothing until `npm run setup:hooks` runs. The CI job is therefore the only
  gate a contributor cannot opt out of by doing nothing.
- `git rev-parse --short A B` fails with "Needed a single revision"; pass one
  ref at a time.
