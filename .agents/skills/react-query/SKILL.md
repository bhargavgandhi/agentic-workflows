---
name: react-query
description: TanStack Query (React Query v5) conventions — query key factories, abstract hooks, mutations, and cache invalidation.
version: 2.0.0
category: technology
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- Implementing data fetching with TanStack Query (React Query)
- Writing or reviewing `useQuery`, `useMutation`, or `useInfiniteQuery` usage
- Setting up query key factories for a new feature
- Debugging stale data, cache invalidation, or re-fetch behaviour

## 2. Prerequisites

- TanStack Query v5 installed (`@tanstack/react-query`)
- `references/query-key-patterns.md` and `references/mutation-patterns.md` available

## 3. Steps

### Step 1: Load References
Read `references/query-key-patterns.md` for the query key factory pattern.
Read `references/mutation-patterns.md` for optimistic updates and cache invalidation.
Read `references/gotchas.md` for stale closure and common mistakes.

### Step 2: Define Query Keys with a Factory
Never inline query keys as string arrays. Use a factory:
```ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};
```

### Step 3: Abstract Hooks Centrally
Never inline `useQuery` configurations directly in components. Create named hooks:
```ts
// hooks/useUserQuery.ts
export function useUserQuery(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000,
  });
}
```

### Step 4: Mutations with Invalidation
After a mutation succeeds, invalidate the relevant query keys:
```ts
const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: userKeys.lists() });
  },
});
```

### Step 5: Check Gotchas
Before finalising, check `references/gotchas.md` for:
- Stale closure issues in `queryFn`
- Enabled/disabled query logic
- Pagination and `keepPreviousData` patterns

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll inline the query key as `['users', id]` for simplicity" | Inline keys scatter across the codebase and break when you need coordinated invalidation. Use a factory. |
| "I'll put `useQuery` directly in the component" | Inlined queries can't be reused, tested independently, or found easily. Abstract the hook. |
| "I don't need to set `staleTime`, the default is fine" | Default `staleTime` is 0 — every mount re-fetches. Set an explicit value appropriate to the data's freshness requirements. |
| "I'll invalidate everything with `queryClient.invalidateQueries()`" | Broad invalidation causes unnecessary re-fetches. Invalidate the specific key subtree. |

## 5. Red Flags

Signs this skill is being violated:

- `useQuery` called inline inside a component with no abstraction
- Query keys defined as plain string arrays without a factory
- No `staleTime` set on any query
- `queryClient.invalidateQueries()` called with no arguments
- Mutation success handler does not invalidate related queries

## 6. Verification Gate

Before marking React Query work complete:

- [ ] Query key factory defined for the feature
- [ ] `useQuery`/`useMutation` abstracted into named hooks in `hooks/`
- [ ] `staleTime` explicitly set on all queries
- [ ] Mutations invalidate relevant query key subtree on success
- [ ] `references/gotchas.md` consulted — no stale closure issues
- [ ] Hooks are independently testable (not tightly coupled to component)

## 7. References

- [query-key-patterns.md](references/query-key-patterns.md) — Query key factory patterns
- [mutation-patterns.md](references/mutation-patterns.md) — Optimistic updates and invalidation
- [gotchas.md](references/gotchas.md) — Common mistakes and stale closure patterns
