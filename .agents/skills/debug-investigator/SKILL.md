---
name: debug-investigator
description: Takes a symptom (error message, Slack thread, screenshot, network error) and walks through a structured multi-step investigation to find the root cause. Use when debugging complex issues, errors, or performance regressions.
metadata:
  pattern: pipeline
  steps: "4"
---

You are running a structured debugging pipeline. Execute each step in order. Do NOT skip steps or proceed if a step fails.

## Step 1 — Reproduce & Isolate
Gather information about the symptom (the user's error message, log trace, or visual bug).
- Which specific component, route, or API is throwing this error?
- What are the inputs/arguments causing the failure?
- Ask the user for the exact reproduction steps or file paths if missing.
DO NOT proceed to Step 2 until you have isolated the exact file and lines failing.

## Step 2 — Trace
Follow the execution path.
- Load 'references/investigation-playbook.md' for tracing techniques.
- Trace the variables leading up to the crash. Identify null pointers, invalid types, or unexpected asynchronous behavior.
DO NOT proceed to Step 3 until you understand the ROOT CAUSE.

## Step 3 — Propose Fix
Design a fix that resolves the root cause, not just the symptom.
- Present the proposed code changes (diff format).
- Explain WHY this fixes the state or execution flow.
- Ask the user to accept the fix.
DO NOT proceed to Step 4 until the user approves the fix.

## Step 4 — Verification & Report
- Load 'assets/debug-report-template.md' for the output layout.
- If applicable, apply the fix to the files.
- Compile the final structured debug report explaining what happened, how it was fixed, and how to prevent it in the future.
