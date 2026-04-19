---
name: react-component-scaffolder
description: Generates strict React Vite component boilerplate — folder structure, typed interfaces, index barrel, and cn() utility usage.
version: 2.0.0
category: technology
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- Creating a new React UI component
- A component needs to be scaffolded to project conventions
- `frontend-design` generates a new component (this skill provides the structure)

## 2. Prerequisites

- Project uses React + TypeScript + Vite
- `cn()` utility available (from `class-variance-authority` or `clsx`/`tailwind-merge`)
- `assets/Component.tsx` template available

## 3. Steps

### Step 1: Determine the Component Name
Name must be `PascalCase`. Confirm with the user if unclear.

### Step 2: Create the Folder Structure
Every component lives in its own `PascalCase/` folder:
```
ComponentName/
├── ComponentName.tsx        ← Main component
├── index.ts                 ← Barrel export
└── ComponentName.types.ts   ← Only if props interface > 5 properties
```

### Step 3: Generate `ComponentName.tsx`
Copy the structure from `assets/Component.tsx`. Key rules:
- Use `function ComponentName()` — not `const ComponentName = () => {}` (improves React DevTools readability)
- All props defined in an `interface` (not `type`) — `type` is only for unions
- Do not use `React.FC`
- Use `cn()` for conditional Tailwind class merging

```tsx
import { cn } from '@/utils/cn';

interface ComponentNameProps {
  className?: string;
  // ...props
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  return (
    <div className={cn('base-classes', className)}>
      {/* content */}
    </div>
  );
}
```

### Step 4: Generate `index.ts`
```ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

### Step 5: Confirm Output
Report only the file paths created and a final confirmation to the user.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll skip the `index.ts`, the component can be imported directly" | Missing barrel file breaks consistent import paths. Always generate it. |
| "I'll use `type` for the props — it's equivalent to `interface`" | `interface` is the project standard. `type` is only for unions. |
| "I'll use `React.FC` for explicit typing" | `React.FC` implicitly includes `children` and has subtle typing issues. Use explicit prop interfaces. |
| "I'll inline the styles as a style object" | Inline styles bypass Tailwind's purge. Use `cn()` with class strings. |

## 5. Red Flags

Signs this skill is being violated:

- Component file at root level instead of inside a `PascalCase/` folder
- No `index.ts` barrel file generated
- `const Component = () => {}` instead of `function Component() {}`
- Props defined with `type` instead of `interface`
- `React.FC` used
- Inline `style={{}}` objects instead of `cn()` with Tailwind classes

## 6. Verification Gate

Before marking scaffolding complete:

- [ ] Component in its own `PascalCase/` folder
- [ ] `ComponentName.tsx` uses `function` declaration, not arrow function
- [ ] Props defined as `interface`, not `type`
- [ ] `React.FC` not used
- [ ] `cn()` used for Tailwind class merging
- [ ] `index.ts` barrel file created with correct exports
- [ ] `ComponentName.types.ts` created only if props > 5 properties

## 7. References

- [assets/Component.tsx](assets/Component.tsx) — Standard component template
