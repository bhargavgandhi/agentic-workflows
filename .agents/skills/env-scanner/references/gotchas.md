# env-scanner Gotchas

## 1. Scanning too broadly
`grep -r process.env .` hits `node_modules`, `dist`, and `.git`. Always exclude them:
```
grep -r "process\.env\." src/ --include="*.ts" --include="*.js"
```

## 2. Missing indirect references
Some apps read env vars through a config module (`config.get('database.url')`). The underlying env var is set in `config/default.js` or similar. Check `config/` directories for env var reads.

## 3. Marking everything as `required = yes`
If code reads `process.env.FOO || 'fallback'`, the var has a default and is `required = no`. Only mark `yes` when there is no fallback and the app will crash without it.

## 4. Ignoring conditional vars
Some vars are only required in production (`NODE_ENV === 'production'`). Mark these `required = conditional` and add a note in the `Used In` column.

## 5. Forgetting CI/CD vars
GitHub Actions, Docker Compose, and Kubernetes manifests often define env vars that never appear in `.env.example`. Check `.github/workflows/*.yml`, `docker-compose.yml`, and `k8s/` for additional vars.

## 6. Treating feature flags as plain config
Feature flags control runtime behaviour and are safe to toggle. Credentials and URLs are not. Miscategorising a flag as a credential causes agents to treat it as sensitive when it isn't.
