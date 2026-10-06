# v4 — Repositioning: from skill library to orchestration layer

**Date**: 2026-09-26
**Status**: Stage 0 complete — Stages 1–4 pending
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

### 3.1 Correctness / hygiene — Stage 0, done

| Finding | Resolution |
|---|---|
| Version mismatch between `skills.json` and `SKILL.md` frontmatter | **18 registry versions synced** to frontmatter (frontmatter is the source of truth). The earlier count of 22 included four rows resolved by add/remove below, not by a version edit |
| **Third** source of truth: 20 tracked `.agents/skills/*/.version` files, stale, 12 skills missing one | Deleted from source and gitignored. They are install-time artifacts — every writer (`install.js:165,219`, `upgrade.js:137,152`) takes the version from the registry, never from a shipped file, so nothing read them. This kills the drift class rather than re-syncing it |
| `codebase-mapper`, `env-scanner` on disk but not in the registry — shipped to npm, impossible to install | **Registered** (optional, `full` bundle). Kept per decision 4 |
| `skill-anatomy-validator` — same, and never published | **Deleted** + `HARD_DELETED_NOTICE` entry |
| `doc-coauthoring` registry ghost (no folder) | **Registry entry removed** |
| `app-architect` — no `version:`, no `category:`, not 7-section, already `deprecated: true` | **Deleted** + `HARD_DELETED_NOTICE` entry |
| Stale context windows driving the 40% budget ("Claude Sonnet/Opus 4 — 200,000") | **Fixed**: Opus 5 / Sonnet 5 at 1M, Haiku 4.5 at 200K, marked as a cached snapshot, and a note that on a 1M window the 40% figure is a ceiling to stay far below, not a target to fill |
| `.cursorrules` is legacy and Cursor-only | **Cursor adapter now writes `AGENTS.md`** at root (§6.2) |
| `doctor` warned about every skill when run in the package source tree | **Fixed**: detects the source tree and reports registration coverage instead; consumer workspaces still get real version checks. Both paths verified |
| `source-driven-development` declared `phase: 1`, loaded in Phase 4 by every caller | Open — metadata fix, Stage 1 |

Verified after each change: 86/86 tests pass; `doctor` clean in both the source tree
and a synthetic consumer workspace.
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
  context grows slowly, instead of letting it grow fast and then clearing. Caveat from
  Anthropic's session-cost guidance: a subagent gets its own context and may re-read what
  the main session already has, so isolation is a net loss on small jobs. Use it for noisy,
  read-heavy work with throwaway output.
- **Clear per phase, not once.** An earlier draft of this plan argued the opposite on cache
  grounds; that was wrong. Anthropic's guidance is explicit that one long session costs more
  than the same work split across short ones, because every turn re-reads all accumulated
  prior turns. The per-turn context multiplier outweighs the one-time re-prefill a fresh
  session pays. Keep the >70% threshold as an additional trigger, not the only one.
- What clearing actually costs is **continuity**, not money — and artifacts are the fix.
  Cost favours short sessions; quality favours an unbroken thread; typed artifacts give
  continuity without context. That tension is the whole reason §4.2 exists.
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
| `.agents/run/<task>/brief.md` | **scope adapter** (below) or the kickoff template | us |
| `plans/<task>.md` with `approved: true` frontmatter | agent, approved by human | us |
| `plans/<task>.md#ruled-out`, `#gotchas` | agent, append-only during implement | us |
| `.agents/run/<task>/attempts.json` | verify loop | us |
| `.agents/run/<task>/reports/{review,security,tests}.md` | subagents | already specified in the subagent design doc §4 |
| `.agents/run/<task>/gate2.md` | orchestrator | us |
| `docs/agent-log.md` row | post-approval | us |

**Scope adapter (Phase 0).** The workflow's entry point normalizes whatever the operator
has into `brief.md`: a pasted requirement, a GitHub issue (`gh api`), a file path, or a URL.
Jira and Linear are optional adapters later, not v4 — the point is that every downstream
phase reads one shape regardless of where the work came from. Phase 1 then grills
`brief.md`, so "interrogate the ticket" and "interrogate the prompt" are the same step.

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

### 4.4 Session runtime — what the workflow should tell the operator to do

Source: Anthropic, *Maximizing the value of your Claude Code sessions*. Its four
highest-impact cost factors, in its order: session length and accumulated context, model
selection, effort level, prompt-cache management.

**Portable — belongs in the workflow itself, works in any tool:**

| Practice | Why it matters here |
|---|---|
| Short sessions, one per phase | Cheapest and matches the phase graph exactly |
| Attach files explicitly rather than describing them | Skips a discovery read; every tool has some form of this |
| Put the project's commands **with quiet flags** in the agent instructions file | Command output stays in context for the rest of the session. `primer-generator.js` should emit `--reporter=dot`-style flags, not bare commands |
| Route noisy, read-heavy work to an isolated context | Subagents where available, a second session where not |
| Never switch model or effort mid-phase | Invalidates the cached prefix and re-prefills at full price |
| Rename before clearing | Not a context mechanism — it makes the session findable again, which is the only way to recover the dead ends a handoff doc missed |

**Claude Code-specific — an accelerator layer, not core (see §6):**

- `/context` in a fresh session to audit what is loaded. This is strictly better than
  `agents-skills tokens --budget`, and another reason to retire `token-counter.js`.
- A **"Compact instructions"** section in the agent instructions file, so compaction
  preserves the same things every time. This materially weakens the "compaction loses key
  information" objection — directed compaction is close to a handoff doc at a fraction of
  the ceremony. Our `gotchas` / `ruledOut` fields are what compact instructions should name.
- `/rewind` for discarding a small bad stretch — costs nothing, where `/compact` rewrites
  the whole conversation.
- `model: haiku` in a subagent definition — confirms the per-subagent model tiering in
  `plans/orchestrator-subagent-pattern-design.md` is a one-line frontmatter change.
- Cache TTL is ~1 hour on subscriptions, ~5 minutes on API keys; compact before a break
  rather than after it.
- Do not run recurring loops in the main session; give them their own.
- Output over ~30,000 characters is spilled to a file with a preview inline;
  `BASH_MAX_OUTPUT_LENGTH` tunes it.
- Output tokens cost roughly 5x input, which is why report contracts should be tables, not
  prose.

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

## 6. Distribution — cross-tool is a requirement, not a preference

**Decided**: this must run under Claude Code, Cursor, GitHub Copilot, ChatGPT-driven local
editing, and any future agent. That settles §8.1 and it is the most consequential constraint
in this document, because it demotes everything tool-specific.

### 6.1 The portable substrate

Only two things are available in every tool: **files on disk** and **a prompt**. So the core
of v4 is exactly that, and nothing else:

1. **Artifacts** (§4.2) — the phase graph, as files. A tool that can read and write files
   can run the workflow, whether or not it has subagents, hooks, or slash commands.
2. **The workflow spec** — one markdown file the operator pastes or the tool auto-loads.
3. **Git-level enforcement** — `hooks/guard-gate.js` as a **git** `pre-commit` hook, not a
   Claude Code `PreToolUse` hook. Git is the one runtime every tool shares. A Claude Code
   hook fails earlier and is nicer; a git hook fails everywhere and is the floor. CI is the
   same argument one level out: a workflow job that rejects a PR whose plan lacks
   `approved: true` enforces Gate 1 against *any* agent, including one we have never heard of.

This is why the artifact-first graph stops being an elegance argument and becomes the
architecture. Portability was already the reason to build it; now it is the only reason we
need.

### 6.2 Instruction-file naming — verified, and it collapses the adapters

`AGENTS.md` is read natively by **Cursor** (root and subdirectories), **GitHub Copilot**
(root and nested), **Antigravity** (since v1.20.3, Mar 2026), **Codex**, and **Claude Code**
(since 18 Sep 2026), plus 20+ other tools.

So the per-IDE *instructions* fan-out is obsolete. One root `AGENTS.md` plus `.agents/`
covers every target we support, and the adapters shrink to only what `AGENTS.md` cannot
carry: slash commands, subagent definitions, hooks.

Two caveats to keep:

- **VS Code** gates it behind the `chat.useAgentsMdFile` setting and reads the workspace
  root only, so the VS Code adapter keeps writing `.github/copilot-instructions.md` as a
  fallback.
- `.cursorrules` is legacy and Cursor-only. Replaced with `AGENTS.md` in
  `src/adapters/cursor.js` (Stage 0).

`CLAUDE.md` becomes a thin pointer to `AGENTS.md` rather than a second maintained file.

### 6.2a Repo layout — follow the proven shape

Adopt the layout the Karpathy-guidelines distribution already uses, since it is the
cross-tool pattern working in the wild:

```
skills/<skill-name>/SKILL.md     canonical, tool-neutral
adapters/<agent-id>/             per-tool translation only
AGENTS.md                        root instructions, shared
```

### 6.3 Tiering, not forking

One workflow, three tiers of capability, degrading silently — the same structure
`plans/orchestrator-subagent-pattern-design.md` already uses for Mode A/B/C, generalized:

| Tier | Available where | What it adds |
|---|---|---|
| **Core** | everywhere | Artifacts, the workflow spec, git hooks, CI gate |
| **Assisted** | tools with project instruction files and custom commands | Auto-loaded instructions, one command to start a phase |
| **Accelerated** | Claude Code | Parallel subagents, per-subagent `model:`, PreToolUse hooks, `/context`, compact instructions, `/rewind` |

The rule: **no tier-3 feature may be load-bearing.** If the workflow only produces a correct
Gate 2 report when subagents exist, it is a Claude Code product wearing a cross-tool label.
The eval suite in Stage 4 should run at Core tier, so the floor is the thing being measured.

### 6.4 Channels

- **npm CLI** — the portable installer. Writes artifacts, detects stack, resolves pinned
  sources, installs the git hook. Shrinks to roughly detect + write + resolve.
- **Claude Code plugin** — optional accelerator bundling subagents, hooks and
  `gate-protocol`. Verify the plugin manifest schema against current docs; do not infer it.
- **Paste-in fallback** — for ChatGPT or any tool with no project-file mechanism, the CLI
  emits a single self-contained phase prompt including the relevant artifact contents. This
  is the tier-1 escape hatch and it must be tested, not assumed.

Plugin-only is now off the table. It would delete the most code and break the primary
requirement.

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
Introduce `sources.json` (pinned — decision 3). Replace owned skills with pinned refs plus
adapters. Owned set:

| Owned skill | Why it stays |
|---|---|
| `gate-protocol` | Nothing upstream defines a gate or a stopping point |
| `accessibility-engineering` | Real gap; plain markdown, portable |
| `storybook` | Real gap; plain markdown, portable |
| `simplicity-first` | Karpathy rule 2 — the one principle none of our 34 skills states. "Minimum code that solves the problem, nothing speculative; rewrite if 200 lines could be 50" |
| `design-to-code` (optional) | Vision-first from an image; Figma MCP when available. **Must** read a design-system manifest the user supplies — unconstrained is exactly how an agent invents component props |

Collapse 4 workflows → 1, 7 commands → 1, 5 recipes → 1, 5 rule files → 2. Retire
`memory-*`, `telemetry`, `recipe-engine`, `context-compactor`, `security-scanner`.

Note on `telemetry`: `install` currently prompts for telemetry opt-in on first run, which
makes a non-interactive install impossible. That blocks the Stage 4 eval harness, so
retiring telemetry is a prerequisite for measurement, not just cleanup.

**Stage 3 — distribution** (2–3 days)
Add the plugin manifest. Shrink `install/upgrade/doctor/list`. Bump `schema_version` to
4.0.0, extend `HARD_DELETED_NOTICE` in `upgrade.js:171` for every removed skill, rewrite
`README.md` and `docs/index.html`.

**Stage 4 — the eval** (ongoing; this is the moat)

**Build the runner, don't depend on one.** Surveyed options: `skillgym` generates training
tasks for fine-tuning skill-use agents (wrong problem); `agent-skills-eval` is a per-skill
test runner (wrong unit); `skill-eval-harness` measures per-skill causal lift and is the
closest fit. But our unit is a *workflow*, it must run at Core tier with no Claude-specific
runner, and taking a dependency on a small third-party repo reintroduces the upstream risk
this whole plan exists to remove. So own ~150 lines and steal the method:

- paired runs, with and without the gates, same model, same reps
- repetitions over task count — agent runs are high-variance, so 3 tasks × 5 reps beats
  5 tasks × 1. A 5-task single-run comparison cannot produce a publishable delta
- an answer-leak check, so the eval does not hand the agent its own solution
- three conditions, after SkillsBench: no skills / curated / self-generated

Nobody in this space ships a *measured* workflow. The original workflow spec already
defines the schema: `docs/agent-log.md` with columns for plan-approved-first-try,
checks-green-first-run, and review-comment count. That is a scored eval wearing a log's
clothing. Turn it into a suite of N fixed tasks, run the workflow against them, and publish
the numbers. "Our workflow gets Gate 1 approved first try 8/10 times" is a claim no skill
library can make, and it is what would make this repo worth installing over a folder of
markdown.

---

## 8. Decisions

1. ~~**Multi-IDE**~~ — **settled**: cross-tool is a requirement (§6). Core tier is files plus
   a prompt; enforcement is git and CI; Claude Code features are an accelerator that may
   never be load-bearing.
2. ~~**Plugin-only**~~ — **settled**: off the table, it breaks (1).
3. ~~**Pin vs float**~~ — **settled**: pin, via `sources.json` with an `update` command that
   diffs before writing.
4. ~~**`env-scanner` + `codebase-mapper`**~~ — **settled**: finish, as artifact producers
   (`.codebase-intel/*.md`) so they work at Core tier, with subagent dispatch as the
   accelerated path. Both registered in Stage 0.
5. ~~**Owned-skill bar**~~ — **settled**: a skill earns a place only if it is plain markdown
   and portable. Anything needing a tool-specific runtime is a tier-3 feature, not core.

### Conventions settled alongside

- **Branches**: `<type>/<semantic-name>` with `feat/ fix/ chore/ docs/ refactor/ hotfix/`
  — `feat/`, not `feature/`, so the prefix matches the Conventional Commits type.
  Recorded in `git-workflow/references/branch-naming.md` (Stage 0).
- **Dropped from scope**: style-only-changes-for-designers skill; JS→TS codemod migration
  skill. Too specific to earn maintenance.

---

## 9. Changelog

- **2026-09-26** — Initial plan.
- **2026-09-26** — Revised against Anthropic's *Maximizing the value of your Claude Code
  sessions*: reversed the per-phase-clear cost argument in §4.1 (long sessions cost more,
  not less), added §4.4 session runtime, added the small-job caveat to subagent isolation.
  Rewrote §6 for the cross-tool requirement and closed decisions 1 and 2.
- **2026-10-06** — Stage 0 executed (§3.1). Closed decisions 3–5. Verified AGENTS.md is
  native in Cursor, Copilot, Antigravity and Claude Code, which collapses the per-IDE
  instructions fan-out (§6.2) and adds the `adapters/<agent-id>/` layout (§6.2a). Added the
  Phase 0 scope adapter (§4.2), `simplicity-first` and optional `design-to-code` to the
  owned set (§7 Stage 2), and the decision to own the eval runner rather than depend on
  `skill-eval-harness` (§7 Stage 4). Recorded the branch convention and the two dropped
  skills (§8).
