---
description: End-to-end orchestration for building a complete fullstack feature — frontend, backend, and tests — with strict context budget controls between phases.
---

# Fullstack Feature Agent

> **Who is this for?** Use this workflow when building a feature that touches **both frontend and backend** (e.g. a new CRUD page with an API + database, a real-time feature, or a new complete module). For frontend-only or backend-only changes, use `/build_feature_agent` instead.

> [!IMPORTANT]
> **Context Budget Rule**: This workflow loads skills in phases — never all at once. Each phase loads only the skills it needs. Total skill context at any phase must stay under **40% of your model's context window** (~80k tokens on Claude Sonnet).

---

## Phase 0: Context Budget Check

> Run this before every session — including resuming after a break.

1. **Check for an existing context snapshot** in `.agents/context-snapshots/` — if one exists, read it first and skip to the listed remaining step.

2. **Load project profile**: Read `.agents/project-profile.json` if present. This tells you the framework, language, and token budget.

3. **Phase skill budget** — load only these initial skills (do NOT load all skills yet):
   - `code-reviewer` — always needed for Phase 4
   - `git-workflow` — always needed for Phase 5
   - One of: `app-architect` (if planning from scratch) or review `.agents/context-snapshots/` (if resuming)

4. **Token check**: Run `agents-skills tokens --budget` to confirm you are under budget before proceeding.

---

## Phase 1: Discovery & Research

// turbo-all

**Goal**: Understand the full scope of the feature across the frontend and backend before writing a single line of code.

### 1a. Clarify Requirements (if needed)

If the request is ambiguous:
1. Read `PRODUCT_DOCUMENTATION.md` if it exists.
2. Ask **3 targeted questions** covering:
   - **Data model**: What entities are involved? What are the relationships?
   - **API contract**: What does the frontend need from the backend?
   - **Edge cases**: What happens on empty state, errors, and permission failures?

> Skip 1a for clear, specific requests.

### 1b. Codebase Reconnaissance

1. **Find existing patterns**: Use `grep_search` to find any similar feature, type, or API route already implemented.
2. **Map the data model**: Locate existing database schemas, types, or Firestore collections related to this feature.
3. **Map the API layer**: Find existing routes, controllers, or resolvers to understand where the new code hooks in.
4. **Map the frontend**: Find the relevant pages, components, and state management patterns.
5. **Output**: A compressed summary of what exists and what needs to be built from scratch.

> **File read limit**: Maximum 8 files total across all searches. Use `grep_search` first, read full file only if necessary.

---

## Phase 2: Architecture & Approval

> [!IMPORTANT]
> This is the **only manual pause**. Do NOT write any code until the user explicitly approves.

Define the full feature plan. Write it as a `implementation_plan.md` artifact covering:

### 2a. Data Layer
- Entities / fields / types to add or modify
- Database schema changes (Firestore collections, SQL migrations, Mongoose schemas)
- Validation rules

### 2b. API Layer
- Endpoints, routes, or GraphQL mutations/queries to add
- Request/response shapes
- Auth + permission checks required

### 2c. Frontend Layer
- Pages or routes to add/modify
- Components to build
- State management changes (queries, mutations, stores)
- Loading/error/empty state handling

### 2d. Cross-cutting
- New dependencies to introduce (if any)
- Breaking changes
- Test surface

### 2e. Phase breakdown
Split implementation into exactly 3 phases:
- **Backend Phase** — data + API
- **Frontend Phase** — UI + data connection
- **Test Phase** — unit + integration + E2E

Present for approval. **Do NOT proceed until approved.**

---

## Phase 3: Backend Implementation

**Load only these skills now** (add to existing context):
- `backend-engineer` OR `graphql-backend` / `firebase-setup` (based on stack detected in project profile)

**Do NOT load** frontend-design, react-query, playwright yet.

### 3a. Data Layer
- Create or update database schemas / types
- Add Zod/Joi validation schemas
- Add or migrate test fixtures/seeds if applicable

### 3b. API Layer
- Implement routes, controllers, or resolvers
- Add auth middleware / permission checks
- Return consistent error shapes (validation: 400, auth: 401/403, not found: 404, server: 500)

### 3c. Backend Checklist
- [ ] Input validated before hitting business logic
- [ ] Auth checked before any data operation
- [ ] No raw errors returned to client (sanitise)
- [ ] New types exported from a central types file
- [ ] Logging added for errors and critical paths

> **Context checkpoint**: After Phase 3, if you have read > 10 files or the session is long, create a context snapshot: `agents-skills compact`

---

## Phase 4: Frontend Implementation

**Now load these skills** (swap or add to context — drop backend-specific skills if context is full):
- `frontend-design`
- `react-component-scaffolder`
- `react-query` OR `rtk-query` (based on project profile)

**Drop from context** (they're no longer needed): `graphql-backend`, `backend-engineer`

### 4a. Type-safe API Layer
- Create typed API hooks / query functions that consume the new backend endpoints
- Types must match the backend response shapes exactly — no `any`

### 4b. UI Components
- Build components for every state: loading skeleton, error banner, empty state, and populated view
- Follow the `frontend-design` skill for all visual decisions
- Follow the `react-component-scaffolder` skill for file structure

### 4c. Page / Route Integration
- Wire new components into the existing routing structure
- Add navigation links where applicable

### 4d. Frontend Checklist
- [ ] All API calls go through a typed hook (no raw `fetch` in components)
- [ ] All three states handled: loading, error, success
- [ ] No prop drilling > 2 levels (use context or query hook)
- [ ] Responsive layout verified
- [ ] No `any` types in component props or API response shapes

---

## Phase 5: Quality Gate

**Load now**: `test-writing`, `playwright` (add to context)

### 5a. Automated Checks

// turbo

```bash
npx tsc --noEmit
```

// turbo

```bash
npm run lint
```

// turbo

```bash
npm run build
```

**Fix all errors before proceeding. Maximum 3 fix-loops before reporting to user.**

### 5b. Self Code Review (invoke `code-reviewer` skill)

Review both the backend and frontend changes for:
- Type correctness
- Security (input validation, auth bypass, XSS)
- Performance (N+1 queries, unnecessary re-renders)
- Architecture alignment

Fix all **blocking** 🔴 issues. Report 🟡 suggestions to user.

### 5c. Test Coverage (invoke `test-writing` + `playwright` skills)

**Backend tests** (unit):
- Happy path for each new endpoint/mutation
- Validation error cases
- Auth failure cases

**Frontend tests** (integration):
- Component renders without crashing
- Loading and error state behavior
- User interactions that trigger state changes

**E2E tests** (Playwright):
- Complete happy-path user flow: from UI action → API call → state update
- One error-state flow (e.g. server returns 500)

// turbo

```bash
npm run test -- --run
```

---

## Phase 6: Git & PR

> [!IMPORTANT]
> Only triggered when user explicitly says "push this", "create a PR", or "ship it".

1. **Branch**: `feature/<short-description>` (e.g. `feature/add-event-recurring`)

```bash
git checkout -b feature/<short-description>
git add -A
git commit -m "feat: <description of full feature>"
git push -u origin feature/<short-description>
```

2. **PR title format**: `feat: <plain English description>`

3. **PR body must include**:
   - What changed (backend + frontend)
   - How to test it manually
   - Any database migration steps needed
   - Screenshots if UI changed

4. **Post review** (optional): Invoke `post-pr-review` skill to post inline comments.

---

## Quick Reference

| Phase | Skills Loaded | Context Action |
|-------|--------------|----------------|
| 0 + 1 | `code-reviewer`, `git-workflow` | Check snapshot → load minimal |
| 2 | + `app-architect` (if needed) | Wait for approval |
| 3 (Backend) | + `backend-engineer` or `graphql-backend` or `firebase-setup` | **Snapshot after** if long |
| 4 (Frontend) | **Swap to** `frontend-design`, `react-component-scaffolder`, `react-query` | **Snapshot after** if long |
| 5 (Tests) | + `test-writing`, `playwright` | Run all quality gates |
| 6 (Git) | `git-workflow` | Only on user request |

| User Says | What Happens |
|-----------|-------------|
| _"Build a feature that needs frontend + backend"_ | Run this workflow from Phase 0 |
| _"Just the frontend part is done"_ | Start from Phase 4 |
| _"Just the backend part is done"_ | Start from Phase 4 (frontend) |
| _"Continue from last time"_ | Read `.agents/context-snapshots/` then resume at listed phase |
| _"Save progress"_ | Run `agents-skills compact` now |
| _"Ship it"_ | Run Phase 6 only |
