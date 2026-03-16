---
description: AI Post-Push Hook
trigger: Automatic on git push
---

# 🚀 Post-Push Finalization

**Purpose**: This hook runs after a developer pushes code to the remote repository. It focuses on documentation, PR readiness, and team communication.

## Actions for the Agent

When this hook is triggered (e.g. by a user asking you what to do after a big push):
1. **Understand Scope**: Review the commit diffs that were just pushed (`git log -p -1` or similar).
2. **Pull Request Preparation**: 
   - Draft a highly concise, bulleted summary of the changes for a GitHub PR description.
   - Highlight any newly added dependencies or architecture decisions.
3. **Documentation Sync**:
   - Identify if the pushed changes heavily altered public APIs or core utilities. If so, remind the developer to update `README.md` or the `docs/` folder.
4. **Follow-ups**:
   - List any obvious "TODO" or "FIXME" comments left in the pushed code to ensure the developer tracks them for the next sprint.
