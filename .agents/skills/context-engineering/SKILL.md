---
name: context-engineering
description: Teaches agents how to pack context efficiently — what to load/drop, when to trigger compaction, and how to write agent-driven snapshots. Upgrades `compact` CLI to agent-driven mode.
version: 1.0.0
category: process
optional: false
phase: 0
dependencies: []
---

## 1. Trigger Conditions

This skill is always active in the background during long sessions. Explicitly invoke it when:

- Starting a new session (load snapshot if one exists)
- Context utilisation exceeds 40% of the model's budget
- A session is about to switch to a new phase (snapshot before switching)
- `/compact` slash command is issued
- The agent notices it has read more than 10 files without summarising

## 2. Prerequisites

- Knowledge of the model's context window size (from `agents-skills.config.json` or model-agnostic default: 128k)
- `.agents/` directory present (for snapshot storage)

## 3. Steps

### 3a. Session Start Protocol

1. Check for existing snapshots in `.agents/context-snapshots/`. If found, read the latest one.
2. Load ONLY the files listed in the snapshot's "Files to Reference" section.
3. Load ONLY the skills listed in "Active Skills" — do not load all skills.
4. Start from "Remaining Work" in the snapshot — do not re-execute completed steps.

### 3b. Active Session Budget Management

Monitor context usage continuously:

| Budget Used | Action |
|-------------|--------|
| 0–40% | Normal operation |
| 40–60% | Start forward-planning: decide what NOT to load next |
| 60–70% | Prepare snapshot draft; avoid loading new large files |
| >70% | Trigger compaction. Do not proceed without creating a snapshot. |

**Forward-planning rule**: Before loading any file, ask: *"Will I need this for the next 2 phases of work, or can I derive the information I need from a smaller read?"* If the answer is no, do not load it.

### 3c. What to Load

**Load:**
- Files directly modified in the current phase
- Files that define interfaces consumed by current work
- The relevant sections of a skill (not the whole skills directory)
- Snapshots from previous sessions

**Do not load:**
- Entire directories recursively
- Files you've already summarised in your notes
- Skills not needed for the current phase
- Test files unless you are writing or debugging tests

### 3d. Agent-Driven Compaction (`compact --auto`)

When context hits 70%, execute agent-driven compaction:

1. **Derive snapshot fields from session state:**
   - `goal`: restate what you're building in one sentence
   - `completed`: list phases/slices finished this session
   - `remaining`: list phases/slices not yet started
   - `decisions`: list architectural choices made (with rationale)
   - `filesModified`: list files written or edited
   - `filesToReference`: list files needed next session (with line ranges)
   - `activeSkills`: list skills still needed for remaining work

2. **Call the CLI:**
   ```bash
   agents-skills compact --auto '{"goal":"...","completed":[...],"remaining":[...],"decisions":[...],"filesModified":[...],"filesToReference":[...],"activeSkills":[...]}'
   ```

3. **Confirm snapshot created** — the CLI prints the file path and token count.

4. **Inform the user** the snapshot was created and where to find it.

### 3e. Summarise Constantly

After reading any file or set of files:
- Write compressed notes immediately
- Discard the raw file content from active reasoning
- Use your notes, not re-reads, for subsequent reasoning

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I need to read the whole directory to understand the structure" | No. Read the 3–5 most relevant files. Use grep for targeted search. |
| "I'll create a snapshot at the end of the session" | If context fills before then, session state is lost. Snapshot at 70%, not at 100%. |
| "Loading all skills gives me the best coverage" | Loading all 20+ skills costs ~40k tokens. Load only what the current phase needs. |
| "I don't need to check for a snapshot, I'll just re-read the files" | Re-reading wastes budget. Check for snapshots first — always. |
| "I'll remember the context without writing notes" | You won't. Write compressed notes after every file read. |

## 5. Red Flags

Signs this skill is being violated:

- More than 10 files read without any compression/summarisation step
- Context budget not checked at session start
- Snapshot directory not checked at session start
- All skills loaded at once
- Recursive directory reads (`ls -R`, reading entire `src/`)
- Compaction triggered reactively (>80% full) instead of proactively (at 70%)

## 6. Verification Gate

At session start:
- [ ] Checked `.agents/context-snapshots/` for existing snapshots
- [ ] If snapshot found: loaded only files and skills listed in it
- [ ] If no snapshot: loaded only files needed for Phase 0/1

During session:
- [ ] Context budget checked (run `agents-skills tokens --budget` if uncertain)
- [ ] Files summarised after reading; raw content not held in active reasoning
- [ ] Forward-planning applied before loading new files

At compaction trigger (>70% budget):
- [ ] All snapshot fields derived from session state
- [ ] `compact --auto` called with valid JSON payload
- [ ] Snapshot creation confirmed
- [ ] User informed

## 7. References

- [token-budget-guide.md](references/token-budget-guide.md) — Model context windows and budget calculations
- [snapshot-format.md](references/snapshot-format.md) — Full snapshot format specification
