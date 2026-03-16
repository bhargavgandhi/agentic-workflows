---
description: You are an expert debugging agent specialized in systematic bug hunting and root cause analysis. Apply rigorous reasoning to identify, isolate, and fix bugs efficiently.
---

# Debugging Agent Workflow

> **When to use**: When a user reports a bug, unexpected behavior, or error message. Use this workflow instead of jumping straight to code changes.

> [!IMPORTANT]
> **AI Communication Mandate:**
>
> 1. **Assume Non-Technical User:** The person reporting the bug may not know the code. Accept bug reports in plain English (e.g., "The button is jumping") without demanding file names.
> 2. **Plain English Explanations:** When explaining the root cause or the fix in Step 6, explain the _behavioral_ reason, avoiding excessive technical jargon.
> 3. **Be Autonomous:** Use your own tools to hunt down the affected files based on the user's description.

---

## Step 1: Reproduce & Understand

1. **Gather the Bug Report**:
   - What is the expected behavior?
   - What is the actual behavior?
   - Are there error messages? (Ask user to paste them if not provided.)
   - What page/component is affected?

2. **Locate the Code**:
   - Use `grep_search` with keywords from the error message or affected component name.
   - Use `view_file_outline` to understand the structure of the affected file(s).

---

## Step 2: Isolate the Problem

1. **Narrow the Scope**:
   - Identify the exact file(s) and function(s) involved.
   - Trace the data flow: Where does the data come from? Where is it transformed? Where is it rendered?

2. **Check Dependencies**:
   - Run `grep_search` to find all imports/usages of the affected symbol.
   - Is this a shared component? If so, check if other consumers are affected.

3. **Read the Code** (targeted, not entire files):
   - Use `view_code_item` for specific functions.
   - Use `view_file` only on the relevant line ranges.

---

## Step 3: Root Cause Analysis

Apply the **5-Whys Technique**:

1. _Why is the bug happening?_ → (e.g., "The state is undefined")
2. _Why is the state undefined?_ → (e.g., "The API response changed")
3. _Why did the response change?_ → (e.g., "A new field was added but the type wasn't updated")
4. _Why wasn't the type updated?_ → (e.g., "The Firestore schema was modified without updating the interface")
5. _Why wasn't the interface kept in sync?_ → (Root cause identified)

**Document the root cause** in a brief summary before proceeding to the fix.

---

## Step 4: Apply Minimal Fix

1. **Principle**: Fix the root cause, not the symptom. Apply the smallest change that resolves the issue.
2. **Follow Rules**: Adhere to `rules/code_quality.md` and `rules/project_standards.md`.
3. **Impact Check**: If changing a shared file, verify all consumers still work (Strategic Impact Analysis from `rules/workflow_protocols.md`).

---

## Step 5: Verify the Fix

Run the quality checks from Phase 4 of `/feature_lifecycle`:

// turbo

```bash
npx tsc --noEmit
```

// turbo

```bash
npm run lint
```

**If checks fail**: Loop back to Step 4 and fix. Maximum 3 loops.

---

## Step 6: Report to User

Summarize succinctly:

- **Bug**: [What was broken]
- **Root Cause**: [Why it was broken]
- **Fix**: [What was changed and in which file(s)]
- **Verification**: [Which quality checks passed]

Ask the user to test locally.

---

## Step 7: Git & PR Operations

When the user confirms the fix is good, or explicitly asks to commit/push:

- Execute **Phase 5: Git & PR Operations** from the `/workflows/feature_lifecycle.md` workflow step-by-step.
- This ensures the code is reviewed, committed with conventional messages, pushed, and a PR is created consistently.
