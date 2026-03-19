# RTK Query Cache Invalidation and Tags

## Overview
- Define `tagTypes` globally on `createApi()`.
- Tags are completely declarative: queries Provide tags, mutations Invalidate tags.

## Providing Tags
- For lists: Provide a list ID along with individual item IDs. E.g.
  `providesTags: (result) => result ? [...result.map(({ id }) => ({ type: 'Post', id })), { type: 'Post', id: 'LIST' }] : [{ type: 'Post', id: 'LIST' }]`

## Invalidating Tags
- For creates: `invalidatesTags: [{ type: 'Post', id: 'LIST' }]`
- For updates/deletes: `invalidatesTags: (result, error, arg) => [{ type: 'Post', id: arg.id }]`
