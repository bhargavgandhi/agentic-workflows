# Review: addyosmani/agent-skills vs agentic-workflows

> A side-by-side comparison of Addy Osmani's `agent-skills` repo and our `agentic-workflows` repo — what they share, where each excels, and what we're missing.

---

## 1. Repository Philosophy

| Dimension | addyosmani/agent-skills | agentic-workflows (ours) |
|-----------|------------------------|--------------------------|
| **Core idea** | Engineering *discipline* packaged as skills — encode Google SWE culture into step-by-step workflows agents follow | Engineering *tooling* — an installable CLI that scaffolds skills, workflows, rules, and hooks into any workspace |
| **Design metaphor** | A textbook of senior-engineer playbooks | A toolbox with a smart installer |
| **Target user** | Any developer using any AI coding agent | Teams standardizing AI workflows across IDEs |
| **Shape of a skill** | Process-driven workflow with anti-rationalization tables, red flags, and verification gates | Technology-wrapper or interview-driven reference guide |

> **IMPORTANT**: The philosophical gap is significant. Addy's skills are **process-first** (how to think and work), ours are **technology-first** (how to use a specific tool). Both are valuable, but we're missing the *process discipline* layer entirely.

---

## 2. Skill Coverage Comparison

### Skills only Addy has (we lack entirely)

| Skill | What it does | Why it matters |
|-------|-------------|----------------|
| **idea-refine** | Structured divergent/convergent ideation to turn vague concepts into concrete proposals | We jump straight to architecture — there's no "help me think through this" step |
| **spec-driven-development** | Write a full PRD covering objectives, commands, structure, style, testing, boundaries *before* any code | Our `app-architect` asks 4 questions. Addy's spec covers 6 core areas with templates, success criteria reframing, and living-document guidance |
| **planning-and-task-breakdown** | Decompose specs into small, verifiable tasks with acceptance criteria, dependency ordering, sizing guidelines | We have no standalone planning skill — planning is embedded in our workflows but not reusable independently |
| **incremental-implementation** | Thin vertical slices: implement → test → verify → commit cycle with scope discipline rules | We don't have a skill that teaches *how* to implement incrementally |
| **test-driven-development** | Red-Green-Refactor, test pyramid, Beyonce Rule, browser testing patterns | Our `test-writing` focuses on writing tests, not on TDD as a development *process* |
| **context-engineering** | Feed agents the right information at the right time — rules files, context packing, MCP integrations | We handle this in our Phase 0 workflow checks, but it's not a standalone reusable skill |
| **source-driven-development** | Ground every framework decision in official docs — verify, cite, flag unverified | We have nothing comparable — agents can hallucinate API usage freely |
| **browser-testing-with-devtools** | Chrome DevTools MCP for live DOM inspection, console logs, network, perf | Our `playwright` covers E2E but not live debugging via DevTools |
| **code-simplification** | Chesterton's Fence, Rule of 500, reduce complexity while preserving behavior | Our `refactor_agent` workflow covers refactoring but not simplification as a standalone discipline |
| **security-and-hardening** | OWASP Top 10, auth patterns, secrets management, dependency auditing | We have zero security coverage |
| **performance-optimization** | Measure-first approach, Core Web Vitals targets, bundle analysis | We have zero performance coverage |
| **ci-cd-and-automation** | Shift Left, feature flags, quality gate pipelines | We have `setup-ci` as a recipe, but no skill teaching CI/CD principles |
| **deprecation-and-migration** | Code-as-liability mindset, migration patterns, zombie code removal | No equivalent |
| **documentation-and-adrs** | Architecture Decision Records, API docs, inline doc standards | Our `doc-coauthoring` covers writing docs but not ADRs or the "document the why" discipline |
| **shipping-and-launch** | Pre-launch checklists, staged rollouts, rollback procedures, monitoring | No equivalent |

### Skills we have that Addy lacks

| Skill | What it does | Advantage |
|-------|-------------|-----------|
| **firebase-setup** | Firebase Auth, Firestore, Storage conventions (v9 SDK) | Technology-specific depth |
| **payload-cms** | PayloadCMS v3 + Next.js: collections, blocks, media, email | Technology-specific depth |
| **graphql-backend** | Apollo Server, DataLoaders, schema design, N+1 prevention | Technology-specific depth |
| **graphql-frontend** | Apollo Client, fragments, cache management | Technology-specific depth |
| **react-query** | TanStack Query conventions, key factories, mutations | Technology-specific depth |
| **rtk-query** | RTK Query data-fetching, cache tags, optimistic updates | Technology-specific depth |
| **react-native** | Expo, React Navigation, native modules, styling | Technology-specific depth |
| **react-component-scaffolder** | Boilerplate for React/Vite components | Generator pattern |
| **api-integration** | Frontend ↔ Redux/Firebase endpoint connection | Technology-specific depth |
| **post-pr-review** | Post code review as inline GitHub PR comments | Useful automation |

> **NOTE**: Our technology-specific skills (firebase, payload-cms, graphql, react-query, etc.) are a genuine strength. Addy's repo is framework-agnostic by design. The two approaches complement each other.

---

## 3. Structural Differences

### What Addy has that we don't

| Feature | Description | Our gap |
|---------|-------------|---------|
| **Anti-rationalization tables** | Every skill has a table of excuses agents use to skip steps + documented rebuttals | Our skills have no defense against agent shortcuts |
| **Red flags section** | Signs the skill is being violated — lets agents self-diagnose | We don't have this |
| **Verification gates** | Every skill ends with an evidence checklist — "Seems right" is never sufficient | Some of our workflows have checklists, but skills themselves don't |
| **Agent personas** | Pre-configured specialist personas (code-reviewer, test-engineer, security-auditor) | We have `code-reviewer` skill, but no persona concept |
| **Reference checklists** | Supplementary material skills pull in on-demand (testing-patterns, security-checklist, etc.) | We have some references in individual skills, but no shared reference library |
| **Slash commands** | 7 composable commands mapping to the dev lifecycle | We have workflows but not slash-command-style composition |
| **Multi-agent personas** | 3 specialist agents (code-reviewer, test-engineer, security-auditor) | We have a code-reviewer skill but not a persona system |

### What we have that Addy doesn't

| Feature | Description | Our advantage |
|---------|-------------|---------------|
| **CLI installer** (`npx agents-skills`) | One command to scaffold everything into any workspace | Addy requires manual copy or plugin install |
| **Skill versioning** (`.version` files) | Track installed versions, `doctor` catches outdated skills | No versioning in Addy's repo |
| **Dependency resolution** | Skills declare dependencies in frontmatter; auto-installed via topological sort | Addy's skills are independent |
| **Project auto-detection** (`init`) | Scans workspace → generates `project-profile.json` | No equivalent |
| **Token budget engine** (`tokens` command) | Per-skill token costs, 40% budget enforcement | Addy mentions context-aware loading but has no tooling |
| **Context snapshots** (`compact`) | Structured markdown snapshots for session resumption | No snapshot mechanism |
| **Prompt recipes** | Parameterized prompt templates (add-auth, add-crud-page, etc.) | No recipe system |
| **Multi-IDE output mapping** | Same source → Antigravity, VS Code, Cursor, Claude Code | Per-IDE setup docs but no unified installer |
| **Local telemetry** | Opt-in anonymous usage logging | No telemetry |

---

## 4. Quality of Individual Skills

### Skill depth comparison (side-by-side)

| Aspect | Addy's spec-driven-development | Our app-architect |
|--------|--------------------------------|-------------------|
| **Questions asked** | Open-ended clarifying Q&A until requirements are concrete | 4 fixed questions (Q1–Q4) |
| **Output structure** | 6-section spec template with success criteria, boundaries (Always/Ask First/Never), code style examples | Architecture template from an asset file |
| **Living document guidance** | Yes — update when decisions change, commit the spec, reference in PRs | No — output once and move on |
| **Anti-rationalization** | 5-row table of excuses and rebuttals | None |
| **Red flags** | 5 specific warning signs | None |
| **Verification checklist** | 5-item checklist to confirm spec completeness before implementation | Single confirmation question |

> **WARNING**: Even where our skills overlap with Addy's (e.g., app-architect ↔ spec-driven-development), his versions are significantly deeper, more defensive, and more structured. Our skills tend to stop at "here's how to use the tool" while his continue into "here's how to not cut corners."

---

## 5. Workflow Comparison

| Aspect | Addy's lifecycle commands | Our workflows |
|--------|--------------------------|---------------|
| **Model** | Composable slash commands (`/spec` → `/plan` → `/build` → `/test` → `/review` → `/ship`) that can be invoked independently | Monolithic multi-phase workflows (`build_feature_agent`, `fullstack_feature_agent`, `refactor_agent`) |
| **Composability** | High — use `/review` alone, or chain `/spec` → `/plan` | Low — workflows are all-or-nothing with Skip/Resume |
| **Skill loading** | Context-aware: load skills relevant to current task | Budget-aware: swap skills between phases |
| **Process coverage** | Full lifecycle from idea → production | Discovery → Build → Quality → Git (no launch, no deprecation) |

---

## 6. Key Gaps Summary

### Critical gaps we should fill

1. **🔴 No specification phase** — We jump from "what do you want?" to "here's my plan." No PRD, no spec, no success criteria.
2. **🔴 No anti-rationalization defense** — Our skills have zero protection against agents cutting corners.
3. **🔴 No security skill** — Zero coverage of OWASP, auth patterns, secrets management.
4. **🔴 No performance skill** — Zero coverage of Core Web Vitals, profiling, bundle analysis.
5. **🟡 No verification gates on skills** — Our workflows have checklists, but individual skills don't enforce their own quality.
6. **🟡 No incremental implementation discipline** — We tell agents *what* to build but not *how* to build it safely.
7. **🟡 No source-citation discipline** — Agents can hallucinate framework APIs without consequence.
8. **🟡 No composable slash commands** — Our workflows are monolithic, not individually invocable phases.

### What we're doing well

1. **✅ CLI tooling** — Best-in-class installer, versioning, dependency resolution, token budgeting.
2. **✅ Technology-specific depth** — Firebase, Payload CMS, GraphQL, React Query, React Native.
3. **✅ Context budget management** — Baked into workflows and CLI, not just advice.
4. **✅ Multi-IDE support** — Unified source mapping across 4 IDEs.
5. **✅ Prompt recipes** — Reusable parameterized templates for common tasks.

---

## 7. Recommendations

1. **Adopt the skill anatomy standard**: Add anti-rationalization tables, red flags, and verification gates to every skill.
2. **Add process skills**: Create `spec-driven-development`, `incremental-implementation`, `security-and-hardening`, `performance-optimization` (or adapt Addy's).
3. **Make workflows composable**: Expose individual phases as slash commands that can be used independently.
4. **Add agent personas**: Create specialist reviewer personas (security auditor, test engineer) beyond our current code-reviewer.
5. **Create a shared reference library**: Testing patterns, security checklist, performance checklist, accessibility checklist.
6. **Strengthen the app-architect skill**: Expand from 4 fixed questions to a deeper, iterative spec process with success criteria reframing and boundary definitions.
