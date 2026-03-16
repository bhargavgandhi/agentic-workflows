---
description: Run a deep reasoning planning session using the Google Agentic Framework
---

# 🧠 Planning Session Protocol

**Purpose**: Define a bulletproof technical strategy before writing a single line of code.

## 📝 Planning Steps

1. **Problem Definition**: 
   - State the problem clearly in one sentence.
   - List all specific requirements and edge cases discovered during research.

2. **Architectural Decisions**:
   - Identify which files will be modified.
   - List any new dependencies or patterns being introduced.
   - Document any breaking changes.

3. **Step-by-Step Implementation**:
   - Break the task into discrete, verifiable phases.
   - Use the `implementation_plan.md` artifact format.

4. **Verification Strategy**:
   - Exactly how will you prove the fix works?
   - List test commands and manual verification steps.

---

## 🏗️ Plan Template

```markdown
# [Title]

## Context
[Brief background]

## Proposed Changes
### [Component]
- [MODIFY] [file.js]
- [NEW] [file.js]

## Verification
- Run `npm test`
- Manual check of UI state X
```
