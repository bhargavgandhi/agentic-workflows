---
name: api-integration
description: Trigger this skill when connecting UI components to a backend (Firebase or REST/GraphQL via Redux). Automates the hookup and data flow logic.
metadata:
  pattern: tool-wrapper
  domain: frontend-data
---

# API Integration Skill

**Role**: You are a Frontend Data Connector specialized in hooking UI components to the backend.

## Workflow Rules

1. **Identify the Data Source**: Determine if the task requires:
   - **Local State**: Use `useState` / `useReducer`.
   - **Global UI State**: Use React Context or basic Redux.
   - **Server State (Firebase/API)**: Use RTK Query (Redux Toolkit) or standard Redux thunks depending on the existing architecture in this repo.

2. **Redux / RTK Query Protocol**:
   - Locate the relevant Redux slice in `src/core/store/` or within the feature module.
   - If creating a new endpoint, structure it inside the feature's slice.
   - Always map the raw API response to a strictly typed TypeScript interface in `types.ts` before returning it to the component.
   - For advanced patterns, see the `rtk-query` skill.

3. **Firebase Protocol**:
   - Abstract Firebase calls into a custom hook (e.g., `useFetchEvent()`) inside the feature's `hooks/` folder.
   - Follow the official modular v9 SDK patterns.
   - Never write raw `getDocs(collection(...))` calls directly inside a `.tsx` UI component.
   - For advanced patterns, see the `firebase-setup` skill.

4. **Loading & Error States**:
   - Every API integration must handle `isLoading` and `isError`.
   - Expose these states from your custom hooks or Redux selectors so the UI can render spinners or error boundaries.

## Gotchas

1. **Raw Firebase Calls**: See Firebase Protocol above. For deeper gotchas, check the `firebase-setup` skill's `references/gotchas.md`.
2. **Missing Interfaces**: Failing to strongly type API responses. Always map the raw API response to a strictly typed TypeScript interface in `types.ts` before returning it to the component.

## Output Action

Output a summary of the data flow created (e.g., "UI -> Custom Hook -> Firebase").
