---
description: Run a deep reasoning planning session using the Google Agentic Framework.
---

# Deep Reasoning Planning (Strategic Agent Flow)

**Purpose**: Execute a deterministic, multi-step process for planning before writing any code.
**Why it exists**: To prevent runaway context pollution, enforce logical dependencies, and ensure abductive reasoning before implementation.
**Token Optimization Strategy**: Structured, step-by-step artifact generation.
**Execution Policy Guidance**: Safe read-only reconnaissance is allowed. Generates an execution artifact for user review.

**INSTRUCTIONS**: Execute these steps sequentially. Do not skip ahead. Require user verification if unsure.

## 1. Information Gathering & Risk Assessment (Role: Research Agent)

- Identify logical dependencies, constraints, and order of operations.
- Execute targeted reconnaissance (max 5-10 file reads) to understand the existing architecture relevant to the user's request.
- Review existing Knowledge Items (KIs) and Conversation History if necessary.
- **Output**: Compressed mental context (no large file dumping).

## 2. Abductive Reasoning & Solution Formulation (Role: Planning Agent)

- Formulate hypotheses or technical approaches based on the gathered information.
- Evaluate trade-offs for proposed solutions (compare against alternatives, list pros/cons).
- **Output**: A clear technical direction chosen based on precise, verified claims.

## 3. Implementation Plan Generation (Role: Planning Agent)

- Create or update the artifact `implementation_plan.md` using the strictly defined framework below.
- Ensure the plan is extremely precise and relevant.
- **Output**: `implementation_plan.md` created or updated.

### Required Plan Framework inside `implementation_plan.md`:

```markdown
# Implementation Plan: [Task Name]

## 1. Objective / Problem Statement

- [Brief description of the problem and background]

## 2. Solution

- [High-level technical approach]

## 3. Trade-offs (Critical Step)

- **Why this solution?**: [Compare vs alternatives. Why is this better?]
- **Pros/Cons**: [Brief list]

## 4. Implementation Steps

- [ ] [Step 1 - Detailed]
- [ ] [Step 2 - Detailed]
- [ ] [Step 3 - Detailed]

## 5. Data/UI Flow (Optional)

- [Describe flow if relevant (e.g. Database -> API -> Store -> UI)]
  Note: only if it is applicable.

## 6. Risks & Mitigation

- [Potential pitfalls or side effects and how to mitigate them]

## 7. Validation Plan

- **Manual**: [Steps to manually verify]
- **Automated**: [Tests to run or create]
```

## 4. Review & Handoff (Role: Review Agent)

- Review the generated `implementation_plan.md` against the initial user request to ensure all constraints are met.
- **Output**: Yield execution and notify the user for review. Do not proceed to implementation until the user approves the plan.
