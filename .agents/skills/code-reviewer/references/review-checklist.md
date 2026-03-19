# Review Checklist

Review the changes focusing strictly on these project standards:

- **Type Safety**: Are there explicit `any` types? Are interfaces missing?
- **Component Size**: Is the component doing too much? Should it be broken down?
- **DRY violations**: Was logic duplicated instead of abstracted?
- **CSS/Tailwind**: Are they using raw CSS or non-standard tailwind instead of `cn()` and the design system?
- **Performance**: Are there obvious missing `useMemo` or `useCallback` optimizations?
