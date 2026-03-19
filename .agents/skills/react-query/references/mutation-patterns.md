# TanStack Query (React Query) - Mutation Patterns

## Cache Invalidation
- Always perform cache invalidations in the `onSuccess` callback of the mutation.
```typescript
useMutation({
  mutationFn: updatePost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: postKeys.lists() });
  },
})
```

## Optimistic Updates
1. Stop outgoing refetches (`queryClient.cancelQueries({...})`) inside `onMutate`.
2. Snapshot the existing cache data state.
3. Optimistically update the cache with the new value.
4. If `onError` is raised, rollback the cache to the snapshot state.
5. In `onSettled`, invalidate the query to re-sync with the server state.
