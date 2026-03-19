# RTK Query Gotchas

1. **Missing `tagTypes`**: RTK Query won't invalidate tags if the tags aren't explicitly registered in the root `createApi({ tagTypes: ['Post'] })`. Mutating data won't trigger re-fetches without this.
2. **Re-creating `baseQuery`**: Avoid re-instantiating `fetchBaseQuery` inside hooks or components; define it globally.
3. **Optimistic Updates Failing Sync**: Be careful applying optimistic updates to endpoints holding partial data, as reverting on failure might wipe valid cache states if the DTOs don't fully align.
4. **Mutations not using Hook state**: Refrain from using `unwrap()` manually in the component unless handling try-catch control flow. For loading states, always prefer grabbing `isLoading` directly from the mutation hook rather than setting custom React `useState`.
