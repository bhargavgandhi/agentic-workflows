---
name: debug-investigator
description: Takes a symptom (error message, Slack thread, screenshot, network error) and walks through a structured multi-step investigation to find the root cause. Use when debugging complex issues, errors, or performance regressions.
metadata:
  pattern: pipeline
  steps: "5"
---

> [!IMPORTANT]
> **AI Communication Mandate:**
>
> 1. **Assume Non-Technical User:** Accept bug reports in plain English (e.g., "The button is jumping") without demanding file names.
> 2. **Plain English Explanations:** When explaining the root cause or fix, explain the _behavioral_ reason, avoiding excessive technical jargon.
> 3. **Be Autonomous:** Use your tools to hunt down the affected files based on the user's description.

You are running a structured debugging pipeline. Execute each step in order. Do NOT skip steps or proceed if a step fails.

## Step 1 — Reproduce & Understand

Gather information about the symptom (the user's error message, log trace, or visual bug).

- What is the **expected** behavior?
- What is the **actual** behavior? Are there error messages?
- Which specific component, route, or API is affected?
- What are the inputs/arguments causing the failure?

Locate the code: use `grep_search` with keywords from the error message or affected component name. Use `view_file` only on the relevant line ranges.

DO NOT proceed to Step 2 until you have isolated the exact file and lines failing.

## Step 2 — Trace & Isolate

Follow the execution path.

- Load `references/investigation-playbook.md` for tracing techniques.
- Trace the data flow: Where does the data come from? Where is it transformed? Where is it rendered?
- Run `grep_search` to find all imports/usages of the affected symbol. Is this a shared component?
- Trace the variables leading up to the crash. Identify null pointers, invalid types, or unexpected async behavior.

Apply the **5-Whys Technique**:
1. _Why is the bug happening?_ (e.g., "The state is undefined")
2. _Why is the state undefined?_
3. _Why did that happen?_
4. _Why wasn't it caught earlier?_
5. _Root cause identified._

**Document the root cause** in a brief summary before proceeding to the fix.

DO NOT proceed to Step 3 until you understand the ROOT CAUSE.

## Step 3 — Propose Fix

Design a fix that resolves the root cause, not just the symptom.

- Present the proposed code changes in diff format.
- Explain WHY this fixes the state or execution flow.
- Follow `rules/code_quality.md` and `rules/project_standards.md`.
- If changing a shared file, verify all consumers still work (Strategic Impact Analysis).
- Ask the user to accept the fix.

DO NOT proceed to Step 4 until the user approves the fix.

## Step 4 — Verify the Fix

Run quality checks:

```bash
npx tsc --noEmit
```

```bash
npm run lint
```

**If checks fail**: Loop back to Step 3 and fix. Maximum 3 loops.

## Step 5 — Report & Git Operations

Load `assets/debug-report-template.md` for the output layout. Compile the final structured debug report:

- **Bug**: What was broken
- **Root Cause**: Why it was broken
- **Fix**: What was changed and in which file(s)
- **Verification**: Which quality checks passed
- **Prevention**: How to avoid this class of bug in future

Ask the user to test locally.

When the user confirms the fix is good, or explicitly asks to commit/push, execute **Phase 5: Git & PR Operations** from `/workflows/build_feature_agent.md` step-by-step.
