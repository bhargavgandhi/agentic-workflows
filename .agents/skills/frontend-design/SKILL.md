---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use when building web components, pages, dashboards, or any web UI. Avoids generic AI aesthetics.
version: 2.0.0
category: technology
optional: true
phase: null
dependencies: [react-component-scaffolder]
---

## 1. Trigger Conditions

Invoke this skill when:

- User asks to build a web component, page, dashboard, landing page, or application UI
- User asks to style, redesign, or beautify an existing interface
- A frontend slice in `incremental-implementation` requires UI work
- User says "make it look good", "design this", or "build the UI"

## 2. Prerequisites

- Clear description of the component purpose, target audience, and any technical constraints
- `react-component-scaffolder` skill available for component structure
- Framework context: React (Vite), Next.js, plain HTML/CSS, etc.

## 3. Steps

### Step 1: Design Thinking (before any code)
Understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Commit to one: brutally minimal, maximalist, retro-futuristic, organic, luxury, playful, editorial, brutalist, art deco, soft/pastel, industrial. Execute it with precision.
- **Differentiation**: What makes this unforgettable? What's the one thing someone will remember?

**Critical**: Choose a clear conceptual direction before writing a single line of code.

### Step 2: Typography & Color
- Choose fonts that are beautiful, unique, and unexpected. Avoid Inter, Space Grotesk, and Arial.
- Pair a distinctive display font with a refined body font.
- Commit to a cohesive color palette using CSS variables. Dominant color + sharp accent.
- Load `references/aesthetic-anti-patterns.md` to avoid clichés.

### Step 3: Spatial Composition
- Use unexpected layouts: asymmetry, overlap, diagonal flow, grid-breaking elements.
- Generous negative space OR controlled density — choose one and commit.
- Backgrounds: gradient meshes, noise textures, geometric patterns, layered transparencies. Not solid white.

### Step 4: Motion & Interaction
- CSS-only animations where possible. React Motion library for complex sequences.
- Focus on high-impact moments: one well-orchestrated page load with staggered reveals > scattered micro-interactions.
- Hover states, scroll triggers, and transitions that surprise.

### Step 5: Implement
Write production-grade, functional code that is:
- Visually striking and cohesive with the chosen aesthetic direction
- Correctly typed (TypeScript, explicit prop interfaces)
- Accessible (ARIA labels, keyboard navigation, colour contrast)
- Responsive (mobile-first or explicit breakpoints)

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "Inter is a clean, professional choice" | Inter is the default AI font. It signals no design decision was made. Choose something with character. |
| "Purple gradient cards look modern" | They look like every other AI-generated UI. Load `references/aesthetic-anti-patterns.md` and avoid all of them. |
| "Bento box grid is a proven layout" | It's overused. Break out of the grid. |
| "I'll add animations later" | Animations are part of the design, not a polish layer. Plan them in Step 1. |
| "Minimalism means simple code" | Minimalism means precision. A minimal design requires exacting typography, spacing, and contrast work. |

## 5. Red Flags

Signs this skill is being violated:

- Font choice is Inter, Space Grotesk, or a system font without justification
- Color palette is a generic blue/white/grey or purple gradient
- Layout is a symmetric card grid with no visual hierarchy
- No aesthetic direction committed to before coding started
- Animations described as "for later" or not planned at all
- Background is a solid colour with no texture, gradient, or atmosphere

## 6. Verification Gate

Before marking frontend work complete:

- [ ] Aesthetic direction explicitly named and committed to before coding
- [ ] Font choice is distinctive — not Inter or Space Grotesk
- [ ] Color palette uses CSS variables, has dominant + accent structure
- [ ] `references/aesthetic-anti-patterns.md` consulted — no clichés used
- [ ] At least one motion or interaction element present
- [ ] Layout is not a symmetric card grid (or has strong justification if it is)
- [ ] Accessible: ARIA labels, keyboard nav, contrast ratio ≥ 4.5:1
- [ ] Responsive: tested at mobile and desktop breakpoints

## 7. References

- [aesthetic-anti-patterns.md](references/aesthetic-anti-patterns.md) — Clichés to avoid
