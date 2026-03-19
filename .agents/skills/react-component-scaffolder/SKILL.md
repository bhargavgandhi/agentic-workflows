---
name: react-component-scaffolder
description: Generates boilerplate for strict React Vite components with proper interfaces, default props, and folder structure.
metadata:
  pattern: generator
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
   Read the standard template file located at `assets/Component.tsx`. You **must** copy this exact structure when generating the component.

3. **Strict Rules**:
   - Use `function Component() {}` over `const Component = () => {}` for the main export to improve React DevTools readability.
   - All props MUST be explicitly defined in an `interface` (never `type`).
   - Use the `cn()` utility for tailwind class merging.
   - Do not use React.FC.

## Gotchas

1. **Missing `index.ts` barrel file**: Always generate the `index.ts` so the component can be imported cleanly from its directory.
2. **Using `type` instead of `interface`**: Interfaces are the standard in this repo; `type` should only be used for unions.
3. **Forgetting to export**: Check that the main component function is the default export (or a named export if standard dictates).

## Output Action

Output only the file paths created and the final confirmation to the user.
