# 🛠️ Workflow Protocols

**Purpose**: Standardize the multi-phase execution of complex tasks to ensure reliability and stakeholder alignment.

## 🔄 The Core Loop

All significant changes must follow this 4-step cycle:

### 1. Research
- Locate target files using `grep` or precise searches.
- Understand dependencies and architectural constraints.
- Verify existing behavior before proposing changes.

### 2. Plan
- Document proposed changes in an `implementation_plan.md`.
- Get developer approval before writing any production code.
- Identify potential risks or breaking changes.

### 3. Execute
- Small, incremental edits are preferred over giant block replacements.
- Fix lint errors immediately.
- Adhere to `code_quality.md` and `project_standards.md`.

### 4. Verify
- Run unit/integration tests.
- Manually trigger the feature to verify UI states.
- Document proof of work in a `walkthrough.md`.
