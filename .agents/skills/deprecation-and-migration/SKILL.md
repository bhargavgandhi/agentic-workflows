---
name: deprecation-and-migration
description: Code-as-liability mindset, migration patterns, and zombie code removal. Used when retiring old patterns or upgrading major dependencies.
version: 1.0.0
category: process
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- Retiring a module, component, or API that has a replacement
- Upgrading a major dependency version (e.g. React 17 → 18, Next.js 13 → 14)
- Removing code that was previously marked deprecated
- Migrating from one pattern to another (e.g. class components → hooks, REST → GraphQL)
- Running `agents-skills upgrade` with deprecated skills to remove

## 2. Prerequisites

- Clear understanding of what is being deprecated and what replaces it
- A list of all call sites / consumers of the deprecated code
- Tests that cover current behaviour (so you can verify nothing breaks)

## 3. Steps

### Step 1: Audit Scope
Find every consumer of what is being deprecated:
```bash
grep -r "OldComponent\|oldFunction\|deprecatedSkill" src/ --include="*.ts" --include="*.tsx"
```
Count the call sites. If > 20, plan migration in phases rather than all at once.

### Step 2: Write the Replacement First
Before removing anything:
- The replacement must exist and be tested
- Document the mapping: old → new
- If the replacement has a different API, write a codemods or migration guide

### Step 3: Introduce a Deprecation Warning (for library/shared code)
Add a console warning or TypeScript `@deprecated` tag before removing:
```ts
/** @deprecated Use NewComponent instead. Will be removed in v4. */
export function OldComponent() { ... }
```
This gives consumers a migration window.

### Step 4: Migrate Call Sites Incrementally
Migrate one call site at a time. After each:
- Run tests
- Verify no regressions
- Commit (`refactor: migrate X from OldComponent to NewComponent`)

Do not migrate all call sites in one giant commit — it makes debugging impossible.

### Step 5: Delete Dead Code
Once all call sites are migrated:
- Delete the deprecated code entirely
- Delete its tests
- Remove from exports/index files
- Remove from documentation

**Dead code left in the codebase is a liability.** It confuses future engineers and is never "safe" to keep "just in case."

### Step 6: Update Documentation
- Remove references from README and docs
- Update any ADRs that reference the old pattern
- Add an ADR documenting the migration decision

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll leave the old code in for backwards compatibility" | Backwards compatibility is a feature with a cost. If no one is using it, delete it. |
| "Someone might still need this" | Check the call sites. If there are none, no one needs it. Delete it. |
| "I'll migrate all call sites in one PR" | One large migration PR is unmergeable and undebuggable. Do it incrementally. |
| "I'll add a TODO to remove it later" | TODOs without owners and dates are never resolved. Delete it now or set a date. |

## 5. Red Flags

Signs this skill is being violated:

- Deprecated code still in the codebase 2+ versions after its replacement shipped
- `@deprecated` tags with no removal date
- Migration done in one massive commit touching 30+ files
- Old and new patterns coexisting with no migration path documented
- "Zombie code" — code with no call sites that isn't deleted

## 6. Verification Gate

Before marking migration complete:

- [ ] All call sites of deprecated code identified via grep
- [ ] Replacement exists and is tested
- [ ] Migration done incrementally (one call site per commit if >5 sites)
- [ ] Tests pass at each migration step
- [ ] Deprecated code deleted (not commented out, not `@deprecated`-tagged forever)
- [ ] Documentation updated
- [ ] ADR written for the migration decision

## 7. References

- [migration-checklist.md](references/migration-checklist.md) — Step-by-step migration checklist for major dependency upgrades
