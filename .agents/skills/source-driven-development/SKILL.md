---
name: source-driven-development
description: Grounds every framework and API decision in official documentation. Agent must cite sources, flag unverified claims, and never hallucinate API usage.
version: 1.0.0
category: process
optional: false
phase: 1
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill whenever the agent is about to:

- Choose a library, framework, or tool
- Use a specific API, method, or configuration option
- Reference a version-specific behaviour
- Claim that "X is the best practice" for any technology
- Write integration code against an external service

## 2. Prerequisites

- Access to official documentation (via web search or provided URLs)
- Knowledge of the specific library/framework version in use (check `package.json`)

## 3. Steps

1. **Read `package.json` first.** Before writing any framework-specific code, check the exact version of every relevant dependency. Version mismatches are the #1 source of hallucinated API usage.

2. **For every API call, component, or configuration option:**
   - Locate the official documentation page for that specific version
   - Confirm the method signature, parameter names, and return type exist as documented
   - Note any deprecation warnings or version-specific caveats

3. **Cite sources inline.** When using any non-trivial API pattern, add a comment with the docs URL:
   ```ts
   // https://tanstack.com/query/v5/docs/framework/react/guides/queries
   const { data } = useQuery({ queryKey: ['user'], queryFn: fetchUser });
   ```

4. **Flag unverified claims.** If you cannot find official documentation for something, say so explicitly:
   > "I'm not certain about the exact signature for X in version Y — I'd recommend verifying against [docs URL] before committing."

5. **Do not rely on training data for API signatures.** Training data has a knowledge cutoff and may reflect outdated APIs. Always verify against current docs, especially for:
   - Major version changes (e.g. React Query v4 → v5, React Router v5 → v6)
   - Security-sensitive APIs (auth, crypto, session management)
   - Frequently-changing cloud SDKs (Firebase, AWS, Supabase)

6. **When docs contradict your training data**, the docs win. Update your approach accordingly and note the discrepancy.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I know this framework well, I don't need to check docs" | Your training data has a cutoff. The framework may have changed. Check. |
| "The method name looks right" | Method names change across major versions. Check the installed version specifically. |
| "I saw this pattern in a tutorial" | Tutorials go stale. Official docs are authoritative. |
| "This is a minor utility function, it doesn't need a citation" | That's where silent breakage hides. Cite it. |
| "Checking docs slows me down" | Fixing a production bug caused by a hallucinated API signature is slower. |

## 5. Red Flags

Signs this skill is being violated:

- Code uses API methods not found in installed version's docs
- No `package.json` check before writing framework code
- Unverified claims stated as fact ("X is the recommended way to…")
- Zero source citations in a block of integration code
- Agent says "as far as I know" or "I believe" about an API signature
- Code copied from a pattern that doesn't match the current major version

## 6. Verification Gate

Before committing any code involving external APIs or framework usage:

- [ ] Checked `package.json` for exact versions of all relevant dependencies
- [ ] Every non-trivial API call traced to official docs for that version
- [ ] Source citations added as comments for complex integration patterns
- [ ] Any unverified claims flagged explicitly in code comments or to the user
- [ ] No API methods used that only exist in a different major version
- [ ] Security-sensitive APIs (auth, crypto) double-checked against current docs

## 7. References

- [version-check-checklist.md](references/version-check-checklist.md) — Per-library version gotchas
