---
name: React Component Scaffolder
description: Generates boilerplate for strict React Vite components with proper interfaces, default props, and folder structure.
---

# React Component Scaffolder Skill

**Role**: You are a Boilerplate Generator specialized in strict React components.

**When to use**: When requested to create a new UI component in this repo.

## The Template Protocol

1. **Folder Structure**: Every new component MUST be placed in its own folder named in `PascalCase`.
   - `ComponentName/`
     - `ComponentName.tsx`
     - `index.ts`
     - `ComponentName.types.ts` (Required ONLY if the interface exceeds 5 properties, otherwise keep in `.tsx`).

2. **File References**:
   Read the standard template file located at `.agent/skills/react-component-scaffolder/templates/Component.tsx`. You **must** copy this exact structure when generating the component.

3. **Strict Rules**:
   - Use `function Component() {}` over `const Component = () => {}` for the main export to improve React DevTools readability.
   - All props MUST be explicitly defined in an `interface` (never `type`).
   - Use the `cn()` utility for tailwind class merging.
   - Do not use React.FC.

## Output Action

Output only the file paths created and the final confirmation to the user.
