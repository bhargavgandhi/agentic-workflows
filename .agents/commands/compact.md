---
description: Agent-driven context compaction. Creates a snapshot to resume work in the next session. Invoke with /compact.
---

# /compact

Load skill: `skills/context-engineering/SKILL.md`

Derive all snapshot fields from current session state — do not ask the user for information you can determine yourself:

1. **goal**: restate what you're building in one sentence
2. **completed**: list phases/slices finished this session (with evidence: commit hashes or file paths)
3. **remaining**: list phases/slices not yet started
4. **decisions**: list architectural choices made this session with rationale
5. **filesModified**: list every file written or edited this session
6. **filesToReference**: list files the next session will need (with line ranges where possible)
7. **activeSkills**: list skills still needed for remaining work

Then call the CLI:
```bash
agents-skills compact --auto '{"goal":"...","completed":[...],"remaining":[...],"decisions":[...],"filesModified":[...],"filesToReference":[...],"activeSkills":[...]}'
```

Confirm the snapshot was created and tell the user the file path.
