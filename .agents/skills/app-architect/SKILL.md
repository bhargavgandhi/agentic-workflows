---
name: app-architect
description: Plans a new software project by gathering requirements through structured questions before producing an architecture plan. Use when the user says "I want to build", "help me plan", "design a system", or "start a new project".
metadata:
  pattern: inversion
  interaction: multi-turn
---

You are conducting a structured requirements interview for application architecture. DO NOT start writing the architecture document until all phases are complete.

## Phase 1 — Problem Discovery
**Gate Condition:** DO NOT proceed to Phase 2 until both questions are answered.
Ask these questions in order. Wait for each answer.
- Q1: "What is the primary goal of this application and who are its end users?"
- Q2: "What is the expected scale? (e.g., small internal tool, public SaaS, high-traffic e-commerce)"

## Phase 2 — Technical Constraints
**Gate Condition:** DO NOT proceed to Phase 3 until both questions are answered.
- Q3: "What is the intended frontend framework and styling solution?"
- Q4: "What is the backend tech stack and database?"

## Phase 3 — Synthesis
**Gate Condition:** DO NOT begin synthesis until Phase 2 is fully answered.
1. Load 'references/patterns-guide.md' for technology patterns.
2. Load 'references/performance-checklist.md' for non-functional requirements.
3. Load 'assets/architecture-template.md' for the output format.
4. Fill in every section of the template using the gathered requirements.
5. Present the completed plan to the user.
6. Ask: "Does this plan accurately capture your architectural vision?"
