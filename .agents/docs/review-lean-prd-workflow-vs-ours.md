# Review: Lean PRD-First Workflow vs Our Multi-Skill Workflow

> Comparing a minimal 4-skill approach (`grill-me` → `write-a-prd` → `prd-to-plan` → `write-a-skill`) against our current multi-skill + multi-workflow architecture.

---

## 1. The Lean Approach Explained

The proposed model has exactly 4 skills that form a strict pipeline:

```
  grill-me           write-a-prd         prd-to-plan          write-a-skill
 ┌──────────┐      ┌──────────┐      ┌──────────────┐      ┌──────────────┐
 │ Stress-  │      │ Create   │      │ Turn PRD     │      │ Create new   │
 │ test the │ ───▶ │ a PRD    │ ───▶ │ into impl    │ ───▶ │ agent skill  │
 │ idea     │      │ document │      │ plan         │      │              │
 └──────────┘      └──────────┘      └──────────────┘      └──────────────┘
  "Am I sure       "What exactly     "How do I       "Teach agents
   about this?"     am I building?"   build it?"       to do this"
```

### What Each Skill Does

| Skill | Purpose | Key Technique |
|-------|---------|---------------|
| **grill-me** | Interview the user relentlessly about a plan or design until reaching shared understanding | Resolves every branch of the decision tree — adversarial questioning to find gaps |
| **write-a-prd** | Create a PRD through user interview, codebase exploration, and module design | Outputs a GitHub issue — forces product-level thinking before code |
| **prd-to-plan** | Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices | Saves as `./plans/*.md` — bridges product spec to engineering execution |
| **write-a-skill** | Create new agent skills with proper structure, progressive disclosure, and bundled resources | Self-extending system — the platform teaches itself new capabilities |

---

## 2. Our Current Approach

We have **20 skills** + **3 workflows** + **5 rules** + **2 hooks** + **5 recipes**:

### Workflows (our primary orchestrators)
- `build_feature_agent` — end-to-end: Phase 0 (context) → Phase 1 (discovery) → Phase 2 (plan) → Phase 3 (implement) → Phase 4 (quality) → Phase 5 (git)
- `fullstack_feature_agent` — same but with explicit backend → frontend → test phasing and skill swapping
- `refactor_agent` — understand → plan → execute → verify → git

### Skills (our toolbox)
20 technology-specific and process skills loaded on-demand by workflows.

---

## 3. Head-to-Head Comparison

### 3a. Flow Structure

| Dimension | Lean 4-Skill PRD-First | Our Multi-Skill Workflow |
|-----------|----------------------|--------------------------|
| **Entry point** | Always `grill-me` — stress-test the idea first | `build_feature_agent` — start with discovery |
| **Spec creation** | Dedicated `write-a-prd` skill — full PRD as GitHub issue | Phase 2 in workflow — `implementation_plan.md` artifact |
| **Planning** | `prd-to-plan` — tracer-bullet vertical slices | Phase 2 embedded in workflow — file-level plan |
| **Implementation** | Not covered — relies on the plan being so good execution is straightforward | Phase 3 — detailed implementation with rule enforcement |
| **Quality gates** | Not covered — no testing, linting, or review skills | Phase 4 — tsc, lint, prettier, self-review, test writing |
| **Git/PR** | Not covered | Phase 5 — branch, commit, push, PR creation |
| **Extensibility** | `write-a-skill` — the system can teach itself new skills | `skill-creator` — same concept |

### 3b. Philosophy

| Dimension | Lean 4-Skill | Our Approach |
|-----------|-------------|--------------|
| **Core belief** | "If the spec is perfect, implementation is easy" | "Implementation needs guardrails at every step" |
| **Where effort goes** | 90% upfront thinking, 10% execution | 30% planning, 70% guided execution |
| **Agent trust level** | High — trusts the agent to execute a good plan | Low — agents need checklists, rules, and quality gates |
| **Context cost** | Very low — 4 small skills | High — 20 skills (but loaded selectively via Phase 0) |
| **Token budget** | ~4,000–8,000 tokens total | ~40,000–80,000 tokens when fully loaded |

---

## 4. Where the Lean Approach is Better

### 4a. 🔴 The "Grill Me" Concept is Superior to Our Discovery Phase

Our `build_feature_agent` Phase 1a does "interactive clarification" — asks 2-3 questions, maximum 3 rounds. It's polite and accommodating.

`grill-me` is fundamentally different: it's **adversarial by design**. It doesn't ask questions to fill in blanks — it attacks the plan to find weaknesses:

- "What happens when X fails?"
- "Why not use Y instead?"
- "You said Z, but that contradicts your earlier statement about W."
- "What evidence do you have that users actually want this?"

**Why this matters**: AI agents are yes-machines by default. Our workflows reinforce this — the agent asks polite questions, then builds whatever the user wants. `grill-me` creates a deliberate friction point that catches bad ideas *before* they become bad code.

> **We are completely missing this adversarial validation step.**

### 4b. 🔴 PRD-as-Source-of-Truth is More rigorous than Our Implementation Plan

Our workflows produce an `implementation_plan.md` that lists files to modify and technical steps. This is an **engineering plan**.

`write-a-prd` produces a **product requirements document** — it answers *why* before *how*:
- User stories with acceptance criteria
- Success metrics
- Non-functional requirements
- Scope boundaries (what we're NOT building)
- Submitted as a GitHub issue (tracked, versioned, reviewable by the team)

**Why this matters**: Our implementation plans are technically excellent but skip the product-level "why." When requirements change mid-implementation, we have no reference document to check against. The PRD serves as the canonical "this is what we agreed to build" artifact.

### 4c. 🟡 Tracer-Bullet Vertical Slices are a Better Planning Model

Our Phase 2 planning is file-centric: "modify `X.tsx`, create `Y.ts`." The `prd-to-plan` skill plans in **tracer bullets** — thin end-to-end slices that prove the architecture works:

```
Tracer bullet 1: User can see an empty state (proves routing + API + UI work together)
Tracer bullet 2: User can create a single item (proves write path works)
Tracer bullet 3: User can view items (proves read path + rendering)
```

Each tracer bullet is a complete vertical slice that can be shipped independently. Our plans are technically richer but often describe horizontal layers — "first set up the types, then the API, then the UI" — which doesn't produce a working system until all layers are done.

### 4d. 🟢 Dramatically Lower Context Cost

4 skills × ~2,000 tokens ≈ **8,000 tokens** vs. our selective loading of ~5–8 skills × ~5,000 tokens ≈ **25,000–40,000 tokens**.

The lean approach leaves more context window for actual codebase analysis and reasoning. This is non-trivial — with a 200k token window and 80k budget, the lean model uses ~10% of budget on skills, we use ~30–50%.

---

## 5. Where Our Approach is Better

### 5a. 🔴 Implementation Quality Assurance

The lean model **stops at planning**. It has no:
- TypeScript type checking (`tsc --noEmit`)
- Lint enforcement
- Self-code-review
- Test writing automation
- Formatting checks

It bets on "good plan = good code." In practice, even with a perfect plan, agents still:
- Introduce `any` types
- Skip error handling
- Create prop drilling
- Forget cleanup in `useEffect`
- Write non-accessible HTML

Our Phase 4 quality gates catch all of this. **The lean model is dangerously optimistic about agent execution quality.**

### 5b. 🔴 Technology-Specific Guidance

When an agent needs to write a Firebase query, GraphQL resolver, or React Query hook, the lean model provides no guidance. Ours provides:
- `firebase-setup` — modular SDK patterns
- `graphql-backend` — DataLoader setup, N+1 prevention
- `react-query` — key factories, mutation patterns
- `payload-cms` — collection config, block editor setup

Without these, the agent will use whatever patterns it learned from training data — which may be outdated, deprecated, or wrong for your project.

### 5c. 🟡 Git Workflow Automation

The lean model has no git skill. Our Phase 5 handles:
- Branch naming conventions
- Conventional commit messages
- PR creation with `gh` CLI
- Post-PR-review inline comments

### 5d. 🟡 Budget-Aware Skill Swapping

Our `fullstack_feature_agent` explicitly swaps skill context between phases — load backend skills, drop them, load frontend skills. The lean model doesn't address context management because it doesn't need to (only 4 skills), but it also can't scale to complex projects that need technology-specific guidance.

---

## 6. Synthesis: What's the Ideal Approach?

Neither approach alone is optimal. The best model combines both:

```
  LEAN FRONT-END                           OUR BACK-END
  (thinking & planning)                    (execution & guardrails)
  
  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │ grill-me │ → │ write-a- │ → │ prd-to-  │ → │ build_   │ → │ quality  │ → │ git      │
  │          │   │ prd      │   │ plan     │   │ feature  │   │ gates    │   │ workflow │
  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
  ADVERSARIAL     PRODUCT        TRACER         GUIDED          TSC+LINT       COMMIT+PR
  VALIDATION      SPEC           BULLETS        EXECUTION       +REVIEW
```

### Recommended Hybrid Architecture

| Phase | Source | What happens |
|-------|--------|-------------|
| **Phase 0: Grill** | Lean model | Adversarial questioning to stress-test the idea. Resolve every ambiguity. |
| **Phase 1: PRD** | Lean model | Create a formal PRD with user stories, success criteria, scope boundaries. Save as GitHub issue. |
| **Phase 2: Plan** | Lean model + Ours | Turn PRD into tracer-bullet implementation plan. But also include file-level detail from our approach. |
| **Phase 3: Implement** | Our model | Guided execution with technology-specific skills loaded on-demand. |
| **Phase 4: Quality** | Our model | tsc → lint → prettier → self-review → test writing. Non-negotiable. |
| **Phase 5: Ship** | Our model | Git workflow, PR creation, post-review comments. |

---

## 7. What We Should Change

### Adopt from the Lean Model

1. **Add `grill-me` as a new skill** — adversarial plan validation before any implementation starts. This plugs our biggest gap: we never challenge the user's assumptions.
2. **Add `write-a-prd` skill or upgrade `app-architect`** — produce a real PRD (not just an architecture doc) with user stories, success criteria, and "Not Doing" list. Submit as GitHub issue.
3. **Adopt tracer-bullet planning in `prd-to-plan`** — replace our file-centric Phase 2 planning with vertical slice planning. Each slice should be a complete, testable end-to-end path.
4. **Upgrade `skill-creator` with progressive disclosure and bundled resources** — our current version is good but `write-a-skill` adds structure for progressive disclosure.

### Keep from Our Model

1. **Keep all technology-specific skills** — they provide depth the lean model can't offer.
2. **Keep Phase 4 quality gates** — non-negotiable. No amount of planning replaces `tsc --noEmit`.
3. **Keep context budget management** — Phase 0 token checks, skill swapping, context snapshots.
4. **Keep the CLI tooling** — installer, versioning, dependency resolution.
5. **Keep prompt recipes** — useful for templated common tasks.

### The Key Insight

> The lean model is right that **most agent failures happen in the planning phase, not the coding phase**. If the plan is wrong, perfect execution just produces the wrong thing faster.
>
> But our model is right that **agents need guardrails during execution too**. Even with a perfect plan, agents cut corners, hallucinate APIs, and skip edge cases.
>
> **The answer is both: rigorous planning (lean) + disciplined execution (ours).**

---

## 8. Proposed New Workflow

If we adopt the hybrid, our primary workflow becomes:

```
/grill-me   →   /write-a-prd   →   /prd-to-plan   →   /build_feature_agent (Phase 3–5)
```

Or as a single workflow:

```markdown
## Phase 0: Context Budget Check (existing)
## Phase 1: Grill (NEW — from grill-me)  
## Phase 2: PRD (NEW — from write-a-prd)
## Phase 3: Plan (UPGRADED — tracer bullets from prd-to-plan)
## Phase 4: Implement (existing Phase 3)
## Phase 5: Quality (existing Phase 4)
## Phase 6: Ship (existing Phase 5)
```

This expands our 5-phase workflow to 7 phases but front-loads the thinking. The additional phases cost almost zero tokens (they're conversational, not file-heavy) but dramatically reduce rework.
