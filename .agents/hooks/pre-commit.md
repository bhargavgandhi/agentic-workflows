---
description: AI Pre-Commit Hook
trigger: Automatic on git pre-commit
---

# 🛡️ Pre-Commit Quality Check

**Purpose**: This hook runs before a developer commits code to ensure strict adherence to project standards, catch obvious anti-patterns, and verify no sensitive data is leaked.

## Actions for the Agent

When this hook is triggered (e.g. by a user asking you to review staging files before commit):

1. **Understand Scope**: Look only at the currently staged files (`git diff --staged`).
2. **Security Audit**:
   - Ensure no hardcoded API keys, passwords, or secrets exist in the staged changes.
   - Verify that any newly added `.env` variable is not assigned a real value in the committed files.
3. **Standards Check**:
   - Check if the code violates the established project rules (e.g., proper error handling, typing, lacking `console.log` in production-bound files).
4. **Result**:
   - If everything is perfect, respond with "✅ All checks passed."
   - If there are minor issues, list them for the developer but do not block.
   - If there are critical flaws (e.g., secrets), explicitly WARN the developer to halt the commit.
