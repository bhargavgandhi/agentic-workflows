# v4 — Repositioning: from skill library to orchestration layer

**Date**: 2026-09-26
**Status**: Proposed — awaiting decisions in §8
**Supersedes strategy in**: `README.md` (three-layer architecture), `plans/implementation-plan-v3.md`
**Builds on**: `plans/orchestrator-subagent-pattern-design.md` (keep — it is the one design that survives this pivot intact)

---

## 1. Thesis

The skills are the liability. The contract between phases is the asset.

v3 ships 34 skills, a package manager, a registry, four workflows, seven slash commands,
five recipes and four IDE adapters. Most of that competes with something better maintained
by someone else. What nothing else ships is a **gated, artifact-passing, resumable workflow
with enforced stopping points** — and that is what this repo should be.

v4 keeps the orchestration and outsources the content.

---

## 2. Evidence that the content layer is already commoditized

Same-named or directly equivalent skills that exist as first-party / well-maintained
upstreams today, against what `.agents/skills/` maintains:

| Ours | Upstream equivalent |
|---|---|
| `grill-me` | `anthropic-skills:grill-me` |
| `prd-to-plan` | `anthropic-skills:prd-to-plan` |
| `write-a-prd` | `anthropic-skills:to-prd` |
| `skill-creator` | `anthropic-skills:skill-creator` |
| `code-reviewer` | first-party `code-review` skill |
| `security-and-hardening` | first-party `security-review` skill |
| `incremental-implementation` (partly) | `anthropic-skills:writing-plans`, `anthropic-skills:brainstorming` |
| `frontend-design` | `anthropic-skills:ui-ux-max`, `anthropic-skills:design-prompter` |
| `codebase-mapper` (partly) | first-party `init` |
| 13 tech skills (react-query, rtk-query, react-native, graphql-\*, firebase-setup, payload-cms, api-integration, backend-engineer, playwright, react-component-scaffolder) | community skill sets, all more actively maintained than ours |

Four of our twelve "Core Skills" have a same-named first-party equivalent. That is not a
gap to close; it is a signal to stop competing.

### What has no upstream equivalent

- Gate semantics — what a gate is, what stopping looks like, what the human approves
- Typed artifacts passed between phases, with validation
- The subagent roster + fixed report contract (`plans/orchestrator-subagent-pattern-design.md` §3–4)
- Stack-aware command generation (`src/core/project-detector.js`, `src/core/primer-generator.js`)
- An enforced Gate 1 (nothing upstream can make an agent actually stop)

That list is the product.

---

## 3. Codebase review — findings

### 3.1 Correctness / hygiene

| Finding | Evidence | Fix |
|---|---|---|
| 22 of 34 skills have a version mismatch between `skills.json` and their `SKILL.md` (mostly registry `1.0.0` vs frontmatter `2.0.0`) | scripted diff of both sources | Scripted sync; `doctor`/`upgrade` compare these, so today `upgrade` re-downloads 22 skills every run |
| 3 skills on disk are absent from the registry: `codebase-mapper`, `env-scanner`, `skill-anatomy-validator` | `skills.json` has 32 entries, disk has 34 | Register or delete. They ship to npm via `files: [".agents/"]` but cannot be installed |
| `doc-coauthoring` is a registry ghost — no folder | `skills.json` registry vs disk | Delete the entry; `src/commands/upgrade.js:173` already treats it as hard-deleted |
| `app-architect` has no `version:`, no `category:`, and does not follow the 7-section anatomy | `.agents/skills/app-architect/SKILL.md` | Delete. README already claims v3 removed it |
| Stale context windows drive the token budget | `.agents/skills/context-engineering/references/token-budget-guide.md` lists "Claude Sonnet/Opus 4 — 200,000" | Current models are 1M (Opus 5, Sonnet 5); Haiku 4.5 is 200K. The 40% rule computes against the wrong denominator, and `agents-skills tokens --budget` reasons from this file |
| `source-driven-development` is declared `phase: 1` but every caller loads it in Phase 4 | `build-feature.md:107`, `build-quick.md:32`, `commands/implement.md:8` | Metadata fix |
| `env-scanner` + `codebase-mapper` are an unfinished pair | `codebase-mapper/assets/codebase-map-template.md:60` links to `.codebase-intel/CONFIG-MAP.md`, which only `env-scanner` writes | Finish both as Haiku subagents in Phase 1, or delete both. Deleting one leaves a broken link |
| Mode A parallel subagents have never run in this repo | `.claude/` contains only `CLAUDE.md` and `settings.json` — no `agents/` | Install them here; `doctor.js:239` already detects the drift |
| `test-coverage-analyzer`'s "new test files only" rule has no enforcement | design doc §3 specifies a post-hoc `git diff --name-status` check; not implemented anywhere in `src/` | Implement before giving that subagent a cheaper model |

Not a finding: `test/subagents.test.js` fails in a fresh clone only because `node_modules`
is absent. `npm ci` fixes it. 83/84 pass otherwise.

### 3.2 Structural — the package manager is the biggest maintenance cost

Roughly 3,700 of 5,475 lines in `src/` implement distribution, not workflow:

| Subsystem | Lines | Verdict |
|---|---|---|
| `install.js` + `upgrade.js` + `doctor.js` + `list.js` | 1,318 | Shrinks hard once skills are references rather than vendored copies |
| `skill-registry.js` + `manifest.js` + `dependency-resolver.js` | 492 | Replaced by a pinned `sources.json` |
| `memory-capture/compressor/exporter/search` + `memory.js` | 525 | Delete — duplicates CLAUDE.md and native memory, and nothing in any workflow calls it |
| `telemetry.js` + `telemetry.js` command | 291 | Delete — local telemetry for an unmeasured install base |
| `recipe-engine.js` + `recipe.js` + 5 recipes | 274 | Collapses to one kickoff template |
| `context-compactor.js` + `token-counter.js` + `tokens.js` + `compact.js` | 712 | Replaced by artifact conventions; Claude Code shows context usage natively |
| `security-scanner.js` | 81 | Superseded by the first-party `security-review` skill |

**Keep**: `project-detector.js` (216), `primer-generator.js` (146), `workflow-runner.js` (146),
`subagent-drift.js`, `adapters/`, `utils/installer.js`, a slimmer `bin/cli.js` — roughly
1,000 lines. Estimate, not a measurement.

Note `workflow-runner.js` already parses `<!-- parallel-group -->` and `<!-- condition: -->`
directives. That is a proto-graph executor and it is the right thing to build on.

---

## 4. The three engineering disciplines, made concrete

"Context engineering" is an established term. "Graph engineering" and "loop engineering" are
not standard terms of art — below is the charitable, concrete reading of each. Treat the
labels as ours, not as citations.

### 4.1 Context — artifacts over transcript

- State lives in files, not conversation. If losing the conversation loses the state, the
  state was in the wrong place.
- Prefer **isolation over eviction**: fan reading out to subagents so the orchestrator's
  context grows slowly, instead of letting it grow fast and then clearing.
- **One** `/clear`, at the Gate 1 → implementation boundary, not one per phase. Phase count
  is not a proxy for token pressure; keep the existing >70% threshold for everything else.
- Capture **negative knowledge incrementally**. The snapshot schema
  (`src/core/context-compactor.js`) has seven fields and every one records what to do. Add
  `ruledOut` and `gotchas`, written as they are discovered and append-only across phases.
  What costs real time across a context reset is the dead ends, not the decisions.

### 4.2 Graph — phases as typed nodes, artifacts as edges

Each phase declares its inputs and outputs as files with a schema. The runner refuses to
enter a node whose inputs are missing or malformed.

```
understand ──[task-brief.md]──> plan ──[plan.md @approved]──> implement
                                                                  │
                          ┌───────────────────────────────────────┤
                          │         [diff + attempts.json]        │
                          v                                       v
                    verify (loop) ──[reports/*.md]──> report ──[gate2.md]──> log
```

Why this matters more than it sounds: artifacts are the only portable interface. They make
the workflow resumable after a `/clear`, testable without a model, and runnable in Cursor or
VS Code where subagents do not exist. The graph is what makes one workflow work everywhere.

Artifacts to define (v4's real deliverable):

| Artifact | Written by | Schema owner |
|---|---|---|
| `.agents/run/<task>/brief.md` | human (kickoff template) | us |
| `plans/<task>.md` with `approved: true` frontmatter | agent, approved by human | us |
| `plans/<task>.md#ruled-out`, `#gotchas` | agent, append-only during implement | us |
| `.agents/run/<task>/attempts.json` | verify loop | us |
| `.agents/run/<task>/reports/{review,security,tests}.md` | subagents | already specified in the subagent design doc §4 |
| `.agents/run/<task>/gate2.md` | orchestrator | us |
| `docs/agent-log.md` row | post-approval | us |

### 4.3 Loop — explicit termination, budget, escalation

Every loop in the workflow needs four things stated, not implied:

1. **Max iterations** — 3 on the same failure (already in the workflow prose; make it a
   counter in `attempts.json` so it survives a context reset)
2. **A failure signature** — hash the error so "same error" is detectable; retrying a
   different error is progress, retrying the same one is a stall
3. **A budget** — wall-clock or token ceiling per loop, whichever the host can measure
4. **An escalation target** — which gate the loop falls back to, and what it must report

Loop-engineering failure to avoid specifically: the verify→fix loop re-running the *full*
suite each iteration. Scope the re-run to the failing target, then run the full suite once
before Gate 2.

---

## 5. Sourcing model — pinned references, not floating

**Recommendation: pin. Do not float.**

"Point at upstream so everyone always has the latest" makes the workflow non-reproducible.
An upstream edit can silently change the shape of a Gate 1 plan, and `hooks/guard-gate.js`
(which greps for `approved: true`) then fails against a plan that no longer has that field.
Debugging that is worse than maintaining the file yourself, because you cannot see the
change that caused it.

Proposal: `sources.json` — a lockfile of skill references.

```json
{
  "schema_version": "4.0.0",
  "sources": [
    { "id": "anthropic/grill-me",   "kind": "builtin",     "pin": "bundled" },
    { "id": "matt-pocock/ts-strict", "kind": "git",
      "repo": "…", "path": "skills/typescript", "rev": "<sha>" }
  ],
  "owned": ["gate-protocol", "accessibility-engineering", "storybook"]
}
```

- `agents-skills update` bumps `rev`s and shows a diff before writing — the same shape as
  the existing `upgrade --dry-run`, which already works this way
- A skill we own appears in `owned` and nowhere else, so the boundary is explicit
- Honest accounting: this trades 34 content files for ~10 pinned refs plus an update
  command. A real reduction, not elimination. Anyone promising elimination is hiding the
  lockfile.

### Adapting upstream output

Upstream skills do not share an output contract. So for every phase backed by an upstream
skill, we own a thin **adapter**: "run `<upstream skill>`, then normalize its findings into
`reports/review.md` per §4 of the subagent design." The adapter is 20 lines and it is the
thing that makes composition possible. This is the layer to invest in.

---

## 6. Distribution

Decided earlier in this thread: the repo stays a product installed from npm. So v4 keeps the
CLI rather than going plugin-only — but adds a Claude Code plugin manifest as a second
distribution path, because that is where subagents, hooks and per-agent model selection
actually work.

- **npm CLI** — stays the installer for Cursor / VS Code / Antigravity, and shrinks to
  detect-stack + write-artifacts + resolve-sources
- **Claude Code plugin** — bundles the workflow, subagents, hooks, and `gate-protocol`;
  versioned and updated by the plugin system rather than by `upgrade.js`
- Verify the plugin manifest schema against current Claude Code docs before implementing;
  do not infer it

Going plugin-only would delete more code but contradicts the npm decision. Worth
reconsidering explicitly rather than by drift.

---

## 7. Sequencing — contract before deletion

Order matters. Deleting skills before the contract exists means deleting something the
workflow turns out to need.

**Stage 0 — stop the bleeding** (~half a day, scripted, no strategy risk)
Sync the 22 versions. Register or delete the 3 orphans. Drop the `doc-coauthoring` ghost and
`app-architect`. Fix the context-window table. Install `.claude/agents/` so Mode A runs here.
Do this regardless of everything below.

**Stage 1 — the contract** (1–2 days)
Write the artifact schemas (§4.2), `gate-protocol`, the single `controlled-delegation`
workflow with FULL/QUICK modes, the kickoff template, and `hooks/guard-gate.js`. Delete
nothing yet. Validate by running one real feature through it end to end.

**Stage 2 — the source swap** (2–3 days)
Introduce `sources.json`. Replace owned skills with pinned refs plus adapters. Keep only
`gate-protocol`, `accessibility-engineering`, `storybook` as owned — the three with no
upstream equivalent. Collapse 4 workflows → 1, 7 commands → 1, 5 recipes → 1, 5 rule files
→ 2. Retire `memory-*`, `telemetry`, `recipe-engine`, `context-compactor`, `security-scanner`.

**Stage 3 — distribution** (2–3 days)
Add the plugin manifest. Shrink `install/upgrade/doctor/list`. Bump `schema_version` to
4.0.0, extend `HARD_DELETED_NOTICE` in `upgrade.js:171` for every removed skill, rewrite
`README.md` and `docs/index.html`.

**Stage 4 — the eval** (ongoing; this is the moat)
Nobody in this space ships a *measured* workflow. The original workflow spec already
defines the schema: `docs/agent-log.md` with columns for plan-approved-first-try,
checks-green-first-run, and review-comment count. That is a scored eval wearing a log's
clothing. Turn it into a suite of N fixed tasks, run the workflow against them, and publish
the numbers. "Our workflow gets Gate 1 approved first try 8/10 times" is a claim no skill
library can make, and it is what would make this repo worth installing over a folder of
markdown.

---

## 8. Decisions needed

1. **Multi-IDE** — keep Cursor / VS Code / Antigravity as supported targets, or narrow to
   Claude Code? Keeping them is what forces the artifact-first design (a good constraint)
   but it caps how much of the subagent and hook machinery can be core.
2. **Pin vs float** — recommendation is pin (§5). Floating is simpler to describe and
   strictly worse to debug.
3. **Plugin-only** — reconsider §6 explicitly. It deletes the most code and loses non-Claude
   IDEs.
4. **`env-scanner` + `codebase-mapper`** — finish as Phase 1 Haiku subagents, or delete the
   pair? Recommendation: finish. Phase 1 currently has no repo-orientation step at all, and
   these two are already written.
