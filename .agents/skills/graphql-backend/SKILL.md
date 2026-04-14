---
name: graphql-backend
description: Implement a GraphQL API backend — schemas, resolvers, DataLoaders for N+1 prevention, and auth context.
version: 2.0.0
category: technology
optional: true
phase: null
dependencies: [backend-engineer]
---

## 1. Trigger Conditions

Invoke this skill when:

- Implementing a GraphQL API backend (Apollo Server, TypeGraphQL, or express-graphql)
- Adding new Queries, Mutations, or Subscriptions to an existing schema
- Debugging N+1 query problems in resolvers
- Designing a GraphQL schema for a new domain

## 2. Prerequisites

- `backend-engineer` skill conventions applied (service layer, error handling)
- GraphQL server library confirmed (Apollo Server is default)
- `references/` files available

## 3. Steps

### Step 1: Schema Design
- Design types around business entities, not database structure
- Use `Interface` and `Union` types for polymorphic results:
  ```graphql
  union UpdateUserResult = User | InvalidInputError | NotFoundError
  ```
- Keep types focused and minimal — only expose what clients need

### Step 2: Thin Resolvers
Resolvers do exactly three things:
1. Extract arguments from the request
2. Check authorisation context
3. Call the Service layer and return the result

Never embed raw SQL, Mongo logic, or business validation inside a resolver.

### Step 3: DataLoaders (Mandatory for relational fields)
Every field resolver that loads a related entity MUST use a `DataLoader`:
- Instantiate DataLoaders **per-request** in the context function — never globally
- Global DataLoader instances leak cache between users (cross-tenant data exposure)

```ts
// context.ts
const context = ({ req }) => ({
  user: req.user,
  dataloaders: {
    booksByAuthor: new DataLoader(batchLoadBooksByAuthor),
  },
});
```

```ts
// resolver
Author: {
  books: (author, _, { dataloaders }) =>
    dataloaders.booksByAuthor.load(author.id),
}
```

### Step 4: Authentication & Authorisation
- Authentication: verify token in HTTP middleware before the request reaches any resolver. Set `context.user`.
- Authorisation: check permissions inside the **Service layer**, not the resolver.
- Use custom directives (`@auth(requires: ADMIN)`) for declarative field-level access control.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll skip DataLoader for now, we can add it when performance is a problem" | N+1 is not a performance problem — it's a correctness problem at scale. Add DataLoader when writing the resolver. |
| "I'll instantiate DataLoader at module level for simplicity" | Module-level DataLoader leaks cache between users. Per-request is non-negotiable. |
| "I'll put the business logic in the resolver for speed" | Fat resolvers can't be tested without a full GraphQL stack. Move logic to the service layer. |
| "I'll query all fields to be safe" | Over-fetching defeats the purpose of GraphQL. Query only the exact fields the resolver needs. |

## 5. Red Flags

Signs this skill is being violated:

- Field resolvers making database calls without a DataLoader
- DataLoader instantiated outside the context function (module-level)
- Business logic or raw queries embedded in resolvers
- No authorisation check on mutations that write user data
- Schema types mirror database tables exactly (not business entities)

## 6. Verification Gate

Before marking GraphQL backend work complete:

- [ ] Schema types represent business entities, not database tables
- [ ] All resolvers are thin (extract → authorise → call service → return)
- [ ] Every relational field resolver uses a DataLoader
- [ ] DataLoaders instantiated per-request in the context function
- [ ] Authentication performed in middleware before resolvers
- [ ] Authorisation checked in the service layer
- [ ] N+1 test: fetch a list with related entities — confirm single batched query, not N queries

## 7. References

- [dataloader-patterns.md](references/dataloader-patterns.md) — DataLoader batching and caching patterns
