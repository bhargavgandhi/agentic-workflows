# Architecture Patterns Guide

## State Management
- **Local State (`useState`, `useReducer`)**: For isolated component logic (modals, forms).
- **Global UI State (`Context API`, Zustand)**: For theme, user authentication status, or lightweight global settings.
- **Server State (React Query, RTK Query)**: For data fetched from APIs, caching, and cache invalidation. Avoid storing this in standard Redux.

## Application Structure (React)
- **Feature-based architecture**: Group components, hooks, tests, and styles by feature (e.g., `src/features/auth/`) rather than by type (`src/components/`, `src/hooks/`).

## API Communication
- REST or GraphQL based on complexity. Use GraphQL if dealing with over/under-fetching issues or highly interconnected data.
