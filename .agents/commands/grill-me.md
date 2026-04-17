---
description: Adversarial plan stress-testing. Attacks assumptions and resolves every decision branch before any code is written. Invoke with /grill-me.
---

# /grill-me

Load skill: `skills/grill-me/SKILL.md`

Run the full grill-me process against the current plan or stated goal:

1. Restate the goal in one sentence
2. List all embedded assumptions (minimum 3)
3. Attack each assumption — name the failure mode, rate as Critical/Significant/Minor
4. Map the decision tree — name every branch condition and outcome
5. Surface scope creep vectors
6. Resolve every Critical and Significant assumption (verify or convert to named risk)
7. Produce the validated plan

Output the completed `references/decision-tree-template.md` filled in with the results.

**Output goes to**: user confirmation, then `/write-a-prd` or plan update.
