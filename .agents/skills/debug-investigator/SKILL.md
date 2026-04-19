---
name: debug-investigator
description: Structured root-cause investigation for bugs, errors, and performance regressions. Takes a symptom and produces a verified fix with a debug report.
version: 2.0.0
category: technology
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- A bug, error, or regression is reported (error message, Slack thread, screenshot, network trace)
- A test is failing with no obvious cause
- A performance regression is observed and needs root-cause analysis
- The user says "debug this", "why is X broken", or "investigate this issue"

## 2. Prerequisites

- Symptom clearly described (error message, screenshot, or behavioral description)
- Access to the affected codebase
- Lint and typecheck commands available (`npm run lint`, `npx tsc --noEmit`)

## 3. Steps

### Step 1: Reproduce and Understand
Gather the symptom — do not start searching code until the failure is understood:

- What is the **expected** behavior?
- What is the **actual** behavior (error message, stack trace, or visual diff)?
- Which component, route, or API is affected?
- What inputs or conditions trigger the failure?

Use `grep` with keywords from the error message or component name to locate the affected file. Read only the relevant line ranges.

**Gate**: Do not proceed to Step 2 until the exact file and failing lines are identified.

### Step 2: Trace and Isolate the Root Cause
Follow the execution path from symptom to source:

- Trace data flow: Where does the data originate? Where is it transformed? Where does it break?
- Find all usages of the affected symbol — is it a shared component or utility?
- Apply the **5-Whys Technique**:

```
Why is the bug happening?       → State is undefined
Why is the state undefined?     → The hook fires before data loads
Why does the hook fire early?   → useEffect has no dependency guard
Why wasn't it caught earlier?   → No loading state check before render
Root cause: Missing guard on async data access
```

Document the root cause in one sentence before writing any code.

**Gate**: Do not proceed to Step 3 until the root cause is documented.

### Step 3: Propose the Fix
Design a fix that resolves the root cause — not just the symptom:

- Present the change in diff format
- Explain why the fix resolves the root cause (not just what changed)
- If a shared file is modified, verify all consumers still compile
- Confirm the fix with the user before applying it

**Gate**: Do not proceed to Step 4 until the user approves the fix.

### Step 4: Verify the Fix
Run quality checks after applying the fix:

```bash
npx tsc --noEmit
npm run lint
```

If checks fail, loop back to Step 3. Maximum 3 loops before escalating to the user.

### Step 5: Write the Debug Report
Compile a structured summary using this format:

```
Bug:         What was broken
Root Cause:  Why it was broken (5-Whys conclusion)
Fix:         What changed and in which files
Verification: Which checks passed
Prevention:  How to avoid this class of bug in future
```

Ask the user to test locally. When confirmed, offer to commit via the `git-workflow` skill.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll fix the symptom first, then find the root cause" | Symptom fixes create silent regressions. The root cause always resurfaces. Document it first. |
| "I'll skip the 5-Whys — the cause is obvious" | "Obvious" causes are often symptoms of a deeper issue. The 5-Whys takes 2 minutes and prevents reopen. |
| "I'll apply the fix without user approval to save time" | The fix may have unintended side effects the user is aware of. Always confirm before applying. |
| "I'll skip the typecheck — the fix looks correct" | TypeScript errors surface at compile time, not at runtime. Always run `tsc --noEmit` after a fix. |
| "I'll read the whole component file to understand context" | Reading large files wastes context. Use `grep` to find the failing lines, then read only those ranges. |

## 5. Red Flags

Signs this skill is being violated:

- Fix applied before root cause is documented
- `waitForTimeout` or other symptom-masking workarounds used as a "fix"
- `tsc --noEmit` or `npm run lint` not run after the fix
- Shared utility modified without checking all consumers
- Debug report omits the Prevention section
- User approval skipped before applying the fix

## 6. Verification Gate

Before marking debug investigation complete:

- [ ] Symptom understood: expected vs actual behavior documented
- [ ] Affected file and lines identified via targeted search
- [ ] Root cause documented using 5-Whys (one-sentence summary)
- [ ] Fix targets the root cause — not just the symptom
- [ ] User approved the fix before application
- [ ] `npx tsc --noEmit` and `npm run lint` both pass
- [ ] Debug report written with Bug / Root Cause / Fix / Verification / Prevention sections
- [ ] User asked to test locally

## 7. References

- [investigation-playbook.md](references/investigation-playbook.md) — Tracing techniques and debugging patterns
- [debug-report-template.md](assets/debug-report-template.md) — Structured output format
