# Performance Checklist

## Client-Side Optimization
- **Lazy Loading**: Use `React.lazy` or dynamic imports for large routes or components below the fold.
- **Memoization**: Apply `useMemo` and `useCallback` carefully to prevent expensive re-renders. Only memoize when props or functions change frequently in heavy components.
- **Virtualization**: Use `react-window` or `react-virtuoso` for long lists.
- **Bundle Size**: Avoid massive libraries (e.g., import `lodash-es` instead of `lodash`, or use native JS methods).

## Backend / Network Optimization
- **Pagination / Cursors**: Limit API responses.
- **Caching**: Implement CDNs for static assets and Redis for expensive DB queries.
- **N+1 Avoidance**: Use Dataloaders in GraphQL or appropriate JOINs in SQL.
