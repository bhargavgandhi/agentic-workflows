---
name: performance-optimization
description: Core Web Vitals, bundle analysis, and profiling. Measure-first approach — no premature optimisation.
version: 1.0.0
category: process
optional: true
phase: 5
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill as an **opt-in gate** before ship, or on-demand when a performance regression is detected.

Specific triggers:
- `/perf` slash command
- Phase 5a of `/build-feature` (user opt-in)
- Lighthouse score drops below 80 for a user-facing page
- Bundle size increases by more than 5% vs main branch
- User reports slow load times or jank

**Do not invoke** proactively on every feature. Performance work without a measurement baseline is guesswork.

## 2. Prerequisites

- A working implementation (feature complete)
- Ability to run the app locally or against a staging environment
- Bundle analyser available (`npm run build -- --analyze` or `source-map-explorer`)

## 3. Steps

### Step 1: Measure First
Before touching any code, establish baselines:
- Run Lighthouse on the affected pages (use Chrome DevTools or `lighthouse` CLI)
- Record: LCP, FID/INP, CLS, TBT, TTI
- Run `npm run build` and check bundle sizes
- Identify the **specific metric that is failing** — do not optimise blindly

### Step 2: Identify the Bottleneck
Use profiling tools to find the actual cause:
- **Slow LCP**: large image, render-blocking resource, slow server response
- **High CLS**: images without dimensions, dynamic content insertion, font swap
- **Large bundle**: identify which packages are largest (bundle analyser)
- **Slow JS execution**: React DevTools Profiler for unnecessary re-renders

### Step 3: Apply Targeted Fixes
Fix the specific bottleneck found in Step 2. Common fixes:

**Images**: `width`/`height` attributes, `loading="lazy"`, WebP format, `next/image` or equivalent
**Fonts**: `font-display: swap`, preload critical fonts, subset fonts
**Bundle**: code-split at route level, lazy-load non-critical components, remove unused dependencies
**React**: memoize expensive computations (`useMemo`), prevent unnecessary re-renders (`React.memo`, `useCallback`)
**Data fetching**: add loading states, implement pagination, use stale-while-revalidate caching

### Step 4: Re-measure
Run the same measurements from Step 1. Confirm the metric improved. Quantify the improvement.

### Step 5: Document
Add a comment in the relevant file noting:
- What was optimised
- What the before/after measurement was
- Why this approach was chosen over alternatives

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "This component looks slow, let me memoize everything" | Premature memoization adds complexity and sometimes makes things slower. Measure first. |
| "Bundle size always matters, I'll optimise now" | Bundle size matters relative to a target. What's the current size vs the threshold? |
| "I'll add lazy loading everywhere" | Lazy loading defers cost; it doesn't eliminate it. And lazy loading critical content hurts LCP. |
| "React.memo is always good practice" | React.memo has overhead. Only add it when profiling shows a specific re-render problem. |

## 5. Red Flags

Signs this skill is being violated:

- Performance changes made without before/after measurements
- `useMemo`/`useCallback`/`React.memo` added speculatively (without profiling data)
- Bundle size changes not checked after adding new dependencies
- Images added without explicit `width` and `height` attributes
- Optimisation comments say "should be faster" with no measurement

## 6. Verification Gate

Before marking performance work complete:

- [ ] Baseline measurements taken before any changes
- [ ] Specific failing metric identified (not general "feels slow")
- [ ] Root cause identified via profiling (not guessed)
- [ ] Fix targets the root cause
- [ ] Post-fix measurements confirm improvement
- [ ] Improvement quantified (e.g. "LCP reduced from 3.2s to 1.8s")
- [ ] No new performance regressions introduced

## 7. References

- [web-vitals-guide.md](references/web-vitals-guide.md) — Core Web Vitals thresholds and measurement tools
