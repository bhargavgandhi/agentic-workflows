# Investigation Playbook

## Tracing React/UI Errors
1. **White screen / Component Crash**: Check the nearest Error Boundary. Identify which prop or state variable evaluated to `undefined` or threw. Often caused by mapping over undefined lists or accessing properties of uninitialized objects.
2. **Infinite Loops**: Check `useEffect` dependency arrays. Identify if you have circular state updates or if you are passing a new object reference continuously into a dependency array.
3. **Stale Closures**: Check if a generic function inside `useEffect` or an event handler is capturing old state values. Ensure all dependencies are tracked.

## Tracing API / Network Errors (4xx, 5xx)
1. **401/403**: Trace the Authorization header. Are tokens expired or malformed?
2. **400/422**: Trace the payload DTO. Is the frontend sending what the backend expects?
3. **500**: Trace the backend logs. Did a database query fail, a null pointer happen, or an external API timeout?
4. **CORS**: Verify backend allowed origins and OPTIONS handling.

## Build/Compile Failures
1. **TypeScript Errors**: Find the type mismatch. Are types out of sync between frontend and backend contracts?
2. **Webpack/Vite**: Check missing dependencies, incorrect aliases, or circular imports.
