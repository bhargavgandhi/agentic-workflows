---
name: setup-ci
description: Set up a GitHub Actions CI/CD pipeline for your project
parameters:
  - name: project_type
    type: select
    options: [next-js, vite-react, node-backend, monorepo]
    default: next-js
    description: What kind of project is this?
  - name: package_manager
    type: select
    options: [npm, pnpm, yarn]
    default: npm
    description: Which package manager does the project use?
  - name: deploy_target
    type: select
    options: [vercel, netlify, railway, aws, none]
    default: vercel
    description: Where does this project deploy?
  - name: test_command
    type: text
    description: Test command to run in CI (e.g. "npm run test", "npx vitest run")
    default: npm run test
skills_required:
  - git-workflow
workflow: build_feature_agent
tags: [ci, github-actions, deployment, pipeline, devops]
---

## Task: Set Up GitHub Actions CI/CD

**Project type:** {{project_type}}  
**Package manager:** {{package_manager}}  
**Deploy target:** {{deploy_target}}

### What to build

Create `.github/workflows/ci.yml` with:

1. **Trigger conditions**:
   - On push to `main` and `develop`
   - On pull requests targeting `main`

2. **CI jobs**:
   - `lint` — Run ESLint / TypeScript checks
   - `test` — Run `{{test_command}}`
   - `build` — Verify the production build succeeds

3. **Caching**:
   - Cache `{{package_manager}}` dependencies for faster runs
   - Cache build outputs where applicable

4. **Deployment** (if `{{deploy_target}}` is not `none`):
   - Auto-deploy `main` to production on `{{deploy_target}}`
   - Preview deployments for pull requests

5. **Status badges** — Add CI status badge to `README.md`

### Specific notes for {{project_type}}

- Use Node.js 20 (LTS) as the runtime
- Set up the `{{package_manager}}` lockfile caching correctly
- Ensure environment variables are configured as GitHub Secrets (not hardcoded)

### Standards to follow

- Follow the `git-workflow` skill for branch and PR conventions
- Jobs must fail fast (use `fail-fast: true` in matrix builds)
- Never put secrets in `.yml` files — use `${{ secrets.SECRET_NAME }}`
