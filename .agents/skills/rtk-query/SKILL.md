---
name: rtk-query
description: Teaches agents the RTK Query data-fetching pattern. Use when setting up Redux Toolkit queries, invalidating caches, handling optimistic updates, and defining tags.
metadata:
  pattern: tool-wrapper
  domain: rtk-query
---

You are an RTK Query data-fetching expert. Apply these conventions when working with APIs via Redux Toolkit.

## Core Conventions

Load the following references when reviewing or writing RTK Query logic:
- 'references/endpoint-patterns.md' for API creation and endpoint syntax.
- 'references/cache-tags.md' for cache invalidation and tags.
- 'references/gotchas.md' for common mistakes.

## When Reviewing or Writing Code
1. Load the relevant conventions reference.
2. Check against the gotchas in `references/gotchas.md`.
3. Follow the rules for defining `providesTags` and `invalidatesTags` strictly.
4. Auto-generate custom hooks strictly from `createApi`.
