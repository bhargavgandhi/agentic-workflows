---
description: Optional Support Workflow: Deep Component Reconnaissance
---

# Deep Component Reconnaissance

**Purpose**: Safely investigate a specific feature domain without overloading context.
**Why it exists**: Required when step 1 of module creation fails due to missing context.
**Token Optimization Strategy**: Only output structural maps, no code content.

1. Use specific grep searches: `grep -rn "export const [Target]" src/`
2. Map the dependency tree for the target component (what it imports, who imports it) using AST tools or simple imports mapping.
3. Limit reading full files to a strict maximum of 5. For others, read only the outline/signatures.
4. Output a structural map artifact showing relationships before writing any code.
