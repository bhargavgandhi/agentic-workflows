---
name: react-query
description: Teaches TanStack Query (React Query) conventions. Use when implementing queries, mutations, query key factories, and dealing with client-side state.
metadata:
  pattern: tool-wrapper
  domain: react-query
---

You are a TanStack Query (v5) expert. Use these conventions to organize hooks, define keys, and handle queries/mutations.

## Core Conventions

When reviewing or generating code using React Query, use these rules:
- Load 'references/query-key-patterns.md' for the query-key factory pattern.
- Load 'references/mutation-patterns.md' for optimistic updates and invalidating queries.
- Load 'references/gotchas.md' for common mistakes (e.g. stale closures).

## When Reviewing or Writing Code
1. Read the correct reference file.
2. Abstract hooks centrally (e.g. `useUserQuery`), don't inline `useQuery` configurations directly into components.
3. Identify warnings defined in `gotchas.md` and address them.
