---
name: env-scanner
description: Scans the codebase for all environment variables and feature flags, classifies them, and writes a structured CONFIG-MAP.md. Invoke when setting up a project, onboarding to an unfamiliar repo, or before a session involving configuration or feature-flag logic.
version: 1.0.0
category: process
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- User says "scan env vars", "map config", "what env vars does this app need", or "document the environment"
- Setting up a new project workspace for the first time
- Onboarding to an unfamiliar codebase before making changes
- A bug report involves a missing or misconfigured env var
- Before touching any code that reads from `process.env`, `os.getenv`, `dotenv`, or similar

## 2. Prerequisites

- The target repo is accessible and has at least one source file
- A `.env.example`, `.env.sample`, or similar template file exists (ideal but not required)
- The agent has read access to the project root

## 3. Steps

### Step 1 — Locate all ENV var references

Search the codebase for every place an environment variable is read:

- `process.env.VAR_NAME` (Node.js / TypeScript)
- `os.getenv("VAR_NAME")` (Python)
- `ENV["VAR_NAME"]` or `Rails.application.credentials` (Ruby)
- `System.getenv("VAR_NAME")` (Java)
- `$_ENV["VAR_NAME"]` or `getenv("VAR_NAME")` (PHP)
- Any `.env`, `.env.example`, `.env.sample`, `.env.local` files at root
- CI/CD: scan `.github/workflows/*.yml`, `docker-compose.yml`, `k8s/` manifests for env var definitions

Use targeted grep — do not scan binary files or `node_modules/`.

**Gate**: collect the full list of unique variable names before proceeding to Step 2. Produce the list in this format, one entry per line:

```
VAR_NAME — path/to/file.ts:42
DATABASE_URL — src/config/db.ts:12
API_KEY — src/lib/client.ts:4
```

### Step 2 — Classify each variable

For each variable, determine:

| Field | Values |
|---|---|
| **Type** | `credential` / `config` / `feature-flag` / `url` / `unknown` |
| **Required** | `yes` / `no` / `conditional` |
| **Default** | value from `.env.example` or code fallback, or `—` |
| **Used In** | file path(s) and line number(s) where it is read |

Classification rules:
- `credential`: contains `KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `API_KEY`, `PRIVATE`
- `feature-flag`: boolean (`true`/`false`), contains `FEATURE_`, `ENABLE_`, `FLAG_`, `FF_`
- `url`: contains `_URL`, `_URI`, `_HOST`, `_ENDPOINT`
- `config`: everything else (timeouts, limits, region, port, etc.)
- `required = yes` if no fallback value exists in code; `conditional` if conditional logic guards it

### Step 3 — Cross-check against .env.example

Compare the full variable list against `.env.example`:
- Variables in code but **not** in `.env.example` → flag as `[UNDOCUMENTED]`
- Variables in `.env.example` but **not** in code → flag as `[STALE]`

### Step 4 — Write CONFIG-MAP.md

Load `assets/config-map-template.md` and fill it with the classified variables.

Write the output to `.codebase-intel/CONFIG-MAP.md` (create the directory if it doesn't exist).

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|---|---|
| "I'll just grep for `process.env` and that's enough" | Classification is the value — raw grep gives you names, not types, defaults, or whether they're required. The table is the output, not the search. |
| "The .env.example already documents everything" | `.env.example` is often stale or missing entries that are only set in staging/prod. Cross-checking is the whole point. |
| "I know which vars are needed for this feature, I don't need to scan all of them" | Partial scans create partial maps. Future agents will load the CONFIG-MAP and trust it to be complete. |

## 5. Red Flags

- CONFIG-MAP.md is missing the `Type` or `Required` columns — classification was skipped
- All variables listed as `required = yes` — the agent didn't check for fallback values
- No `[UNDOCUMENTED]` or `[STALE]` entries despite an obviously incomplete `.env.example`
- Agent reads only the root `.env` and misses vars in `src/`, `config/`, or nested packages

## 6. Verification Gate

- [ ] CONFIG-MAP.md exists at `.codebase-intel/CONFIG-MAP.md`
- [ ] Every variable has a `Type`, `Required`, and `Default` value populated (not blank)
- [ ] At least one `Used In` file path with line number is recorded per variable
- [ ] Cross-check section lists any `[UNDOCUMENTED]` or `[STALE]` variables found
- [ ] No `node_modules`, `.git`, or binary files were scanned

## 7. References

- [config-map-template.md](assets/config-map-template.md) — Output format template
- [gotchas.md](references/gotchas.md) — Common mistakes when scanning env vars
