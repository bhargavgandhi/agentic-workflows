# TanStack Query Gotchas

1. **Inlining Query Keys**: Using raw strings `['todos', id]` everywhere leads to typos and broken invalidation. Always use a Query Key Factory pattern.
2. **Missing Dependency in Query Keys**: If your `useQuery` hook utilizes specific variables (e.g. an ID, or a filter string), those MUST be pushed into the query key array. Failing this causes bugs with non-reactive components.
3. **Calling functions rather than queryFn reference**: The `queryFn` must be a function referencing the fetch call. Do not pass the running promise `queryFn: fetchTodos()`. Use `queryFn: () => fetchTodos()`.
4. **Stale Data overriding Mutations**: Ensure you invoke `invalidateQueries` accurately after successful mutations; else the cache will sit around stale.
