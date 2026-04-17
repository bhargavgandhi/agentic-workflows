---
description: Produces a full PRD with user stories, success criteria, and scope boundaries. Submits as a GitHub issue. Invoke with /write-a-prd.
---

# /write-a-prd

Load skill: `skills/write-a-prd/SKILL.md`

Produce a complete PRD using the template at `skills/write-a-prd/references/prd-template.md`:

1. Problem statement (what, for whom, why now)
2. Target users (role, goal, knowledge level)
3. User stories (min 3, format: As a [user], I want to [action] so that [outcome])
4. Success criteria (measurable, binary)
5. Always/Ask/Never scope boundaries
6. Non-functional requirements (performance, security, accessibility)
7. Dependencies and top 3 risks with mitigations

Then:
- Create GitHub issue: title `[PRD] <feature name>`, labels `prd`, `planning`
- Save locally: `.agents/docs/prd-<feature-slug>.md`

**Output goes to**: `/prd-to-plan`
