# TanStack Query (React Query) - Query Key Patterns

## The Query Key Factory
- Store all query keys in a central registry instead of writing hardcoded arrays (e.g., `['posts', id]`).
```typescript
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: string) => [...postKeys.lists(), { filters }] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
}
```
- Invalidate using the factory keys: `queryClient.invalidateQueries({ queryKey: postKeys.lists() })`

## Caching Strategy
- Default staleTime is 0. Increase `staleTime` for static resources to avoid immediate re-fetches on component mount.
- Wrap components requiring suspended UI in React Suspense by using `<Suspense>` boundary and appropriate query config if necessary.
