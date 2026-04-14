---
name: api-integration
description: Connect UI components to a backend — Firebase or REST/GraphQL via Redux/RTK Query. Handles data flow, loading/error states, and type mapping.
version: 2.0.0
category: technology
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- Connecting a UI component to a Firebase collection, REST endpoint, or GraphQL query
- A component needs data fetching, loading states, or error handling wired up
- Deciding between local state, global state, and server state for a feature

## 2. Prerequisites

- Data source identified: Firebase, REST API, or GraphQL
- Existing state management approach in project confirmed (RTK Query, React Query, or plain Redux)
- TypeScript interface for the API response defined or to be defined

## 3. Steps

### Step 1: Identify the Data Source & State Type
Choose the right tool before writing any code:
- **Local UI state** (toggle, modal, form field): `useState` / `useReducer`
- **Global UI state** (theme, sidebar open/closed): React Context or Redux UI slice
- **Server state** (data from API or Firebase): RTK Query (Redux) or React Query — never manually cache in Redux

### Step 2: Abstract the Data Layer
Never call Firebase or raw fetch directly inside a `.tsx` component. Abstract:
- **Firebase**: create a custom hook in the feature's `hooks/` folder (e.g., `useFetchEvent()`)
- **REST/GraphQL via RTK Query**: define the endpoint in the feature's API slice and use the auto-generated hook
- **REST via React Query**: create a named hook in `hooks/` (e.g., `useEventQuery()`)

### Step 3: Type the API Response
Map the raw API response to a strictly typed TypeScript interface before it reaches the component:
```ts
// types.ts
export interface EventSummary {
  id: string;
  title: string;
  date: string;
}
```
Never pass `any` to a component. Never let the component handle raw API shapes.

### Step 4: Handle Loading & Error States
Every data hook must expose `isLoading` and `isError` (or equivalent). The component must render:
- A loading state (spinner or skeleton)
- An error state (message or fallback UI)
- The data state

```tsx
const { data, isLoading, isError } = useEventQuery(id);
if (isLoading) return <Spinner />;
if (isError) return <ErrorMessage />;
return <EventCard event={data} />;
```

### Step 5: Document the Data Flow
In your response, output a brief summary: `UI → Hook → [Firebase | RTK Query endpoint | React Query] → API`.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll call Firebase directly in the component for speed" | Raw Firebase calls in `.tsx` files can't be tested or reused. Abstract into a hook. |
| "I'll type it as `any` for now and fix later" | `any` in a data hook infects every component that uses it. Type the response first. |
| "I'll handle loading state later, let's get the data wired first" | Loading state is part of the contract, not polish. Build it with the hook. |
| "I'll store server data in a Redux slice manually" | That's a cache you now have to invalidate. Use RTK Query or React Query — they manage this for you. |

## 5. Red Flags

Signs this skill is being violated:

- `getDocs(collection(...))` or `fetch('/api/...')` called directly inside a `.tsx` file
- `any` used as the return type of a data hook
- Component renders data without a loading or error state
- Server data manually stored in Redux state with hand-rolled cache invalidation
- API response shape passed directly to component props without a typed interface

## 6. Verification Gate

Before marking API integration complete:

- [ ] Data source identified and correct tool chosen (local/global/server state)
- [ ] Firebase or fetch calls abstracted into a dedicated hook — not in `.tsx` components
- [ ] API response mapped to a typed TypeScript interface in `types.ts`
- [ ] Hook exposes `isLoading` and `isError` states
- [ ] Component handles loading, error, and data states explicitly
- [ ] Data flow documented (UI → Hook → Data source)

## 7. References

- [rtk-query](../rtk-query/SKILL.md) — Advanced RTK Query patterns
- [firebase-setup](../firebase-setup/SKILL.md) — Firebase SDK conventions and gotchas
