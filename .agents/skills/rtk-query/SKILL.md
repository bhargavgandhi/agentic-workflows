---
name: rtk-query
description: RTK Query data-fetching — createApi, endpoint definitions, cache tags, optimistic updates, and invalidation.
version: 2.0.0
category: technology
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- Setting up RTK Query with `createApi` for a new feature or service
- Writing or reviewing endpoint definitions, `providesTags`, or `invalidatesTags`
- Implementing optimistic updates
- Debugging stale cache or unexpected re-fetch behaviour

## 2. Prerequisites

- Redux Toolkit installed (`@reduxjs/toolkit`)
- `references/endpoint-patterns.md`, `references/cache-tags.md`, and `references/gotchas.md` available

## 3. Steps

### Step 1: Load References
Read `references/endpoint-patterns.md` for `createApi` and endpoint syntax.
Read `references/cache-tags.md` for `providesTags` and `invalidatesTags` rules.
Read `references/gotchas.md` before finalising any implementation.

### Step 2: Define the API with `createApi`
One `createApi` slice per domain (users, posts, orders — not one global API):
```ts
export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({ ... }),
});
```

### Step 3: Define Tags Consistently
- Query endpoints use `providesTags` to declare what data they hold
- Mutation endpoints use `invalidatesTags` to declare what they invalidate
- Tag format: `{ type: 'User', id: userId }` for item-level; `{ type: 'User', id: 'LIST' }` for collections

```ts
getUser: builder.query<User, string>({
  query: (id) => `/users/${id}`,
  providesTags: (result, error, id) => [{ type: 'User', id }],
}),
updateUser: builder.mutation<User, Partial<User>>({
  query: (body) => ({ url: `/users/${body.id}`, method: 'PATCH', body }),
  invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
}),
```

### Step 4: Use Auto-Generated Hooks
Always use the auto-generated hooks from `createApi` — never call endpoints manually:
```ts
const { data, isLoading, error } = useGetUserQuery(userId);
const [updateUser] = useUpdateUserMutation();
```

### Step 5: Check Gotchas
Verify against `references/gotchas.md` before committing.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll use a single global `apiSlice` for everything" | One monolithic API slice becomes unmaintainable. Split by domain. |
| "I'll skip `providesTags` for now and add cache invalidation later" | Without tags, mutations can't invalidate related queries. Define tags with the endpoints. |
| "I'll manually call `dispatch(api.endpoints.getUser.initiate(id))`" | Use the auto-generated hook. Manual dispatch bypasses the cache and subscription system. |
| "The `id: 'LIST'` pattern seems overly complex" | Without a LIST tag, creating a new item won't invalidate the collection query. It's necessary. |

## 5. Red Flags

Signs this skill is being violated:

- Single `createApi` for all domains in the app
- Endpoints missing `providesTags` or `invalidatesTags`
- Mutation does not invalidate related query tags
- Auto-generated hooks not used — endpoints called via `dispatch` manually
- `tagTypes` array empty or missing

## 6. Verification Gate

Before marking RTK Query work complete:

- [ ] `createApi` split by domain (not one global slice)
- [ ] All `tagTypes` declared in `createApi`
- [ ] Query endpoints have correct `providesTags`
- [ ] Mutation endpoints have correct `invalidatesTags`
- [ ] Auto-generated hooks used throughout (not manual dispatch)
- [ ] `references/cache-tags.md` and `references/gotchas.md` consulted

## 7. References

- [endpoint-patterns.md](references/endpoint-patterns.md) — createApi and endpoint syntax
- [cache-tags.md](references/cache-tags.md) — Cache invalidation and tag patterns
- [gotchas.md](references/gotchas.md) — Common mistakes
