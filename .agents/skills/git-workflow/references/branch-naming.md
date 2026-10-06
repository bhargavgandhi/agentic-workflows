# Branch Naming Conventions

## Format
`<type>/<semantic-name>`

The type prefix is the parent segment; the second segment is a short semantic
name describing the change. Both lowercase, hyphen-separated.

## Types
- `feat/`: new features — `feat/update-skills-name`
- `fix/`: bug fixes — `fix/login-timeout`
- `chore/`: maintenance, dependency bumps, config — `chore/update-typescript`
- `docs/`: documentation only — `docs/v4-plan`
- `refactor/`: behaviour-preserving restructuring — `refactor/extract-adapter`
- `hotfix/`: critical fixes direct to production or main — `hotfix/billing-crash`

Use `feat/`, not `feature/`, so the prefix matches the Conventional Commits
type used in the commit message (see `commit-conventions.md`).

Avoid capitalization, underscores, or spaces. Use lowercase alphanumeric and hyphens.
