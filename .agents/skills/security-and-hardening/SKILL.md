---
name: security-and-hardening
description: OWASP Top 10 audit, auth patterns, secrets management, and dependency auditing. Non-negotiable quality gate before ship.
version: 1.0.0
category: process
optional: false
phase: 4
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill as a mandatory quality gate after implementation and before PR creation.

Specific triggers:
- `/secure` slash command
- Phase 5 of `/build-feature` master workflow (quality gate)
- Before any code that handles authentication, user data, or external inputs is committed
- When adding a new API endpoint, form, or file upload

## 2. Prerequisites

- Implementation complete for the current slice or feature
- Access to the modified files and any new dependencies added

## 3. Steps

### 3a. Input Validation Audit
Review every point where data enters the system (forms, API params, URL segments, file uploads):
- Is input validated at the boundary (not just in the UI)?
- Are types, lengths, and formats enforced server-side?
- Is output encoded before rendering (XSS prevention)?

### 3b. Authentication & Authorisation
- Every protected route/endpoint must verify authentication before processing
- Authorisation checks: does this user have permission to access *this* resource (not just any resource)?
- No authentication logic in the frontend only — server must enforce
- Session tokens: HttpOnly cookies or secure storage. Never localStorage for sensitive tokens.

### 3c. Secrets Management
- Zero secrets in source code. No API keys, tokens, or credentials in any committed file.
- Check `.env` files are in `.gitignore`
- Verify no secrets in commit history: `git log -p | grep -i 'api_key\|secret\|password\|token'`
- Environment variables accessed via a config module, not `process.env` scattered throughout code

### 3d. SQL / NoSQL Injection Prevention
- All database queries use parameterised queries or ORM query builders — never string concatenation
- Firestore/MongoDB: validate document IDs and field names before use in queries

### 3e. Dependency Audit
Run `npm audit` (or equivalent). Address:
- **Critical/High severity**: must be fixed before shipping
- **Moderate**: documented and scheduled for next sprint
- **Low**: log and move on

Flag any new dependency added this session for review:
- Is it actively maintained? (last commit within 6 months)
- Does it have known CVEs?
- Is it necessary, or can native APIs handle this?

### 3f. OWASP Top 10 Checklist
Work through the checklist in `references/owasp-checklist.md` and mark each item as:
- **Pass** — not applicable or mitigated
- **Fail** — issue found; describe it
- **N/A** — not relevant to this feature

### 3g. Security Headers (web apps)
If shipping a web endpoint, verify:
- `Content-Security-Policy` header set
- `X-Frame-Options` or `frame-ancestors` CSP directive
- `X-Content-Type-Options: nosniff`
- HTTPS enforced (no mixed content)

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "This is an internal tool, security isn't critical" | Internal tools become external-facing. Breaches of internal tools are the most damaging. |
| "The framework handles this automatically" | Frameworks provide tools, not guarantees. Verify the configuration. |
| "I'll add auth after MVP" | Auth retrofitted onto an existing app is always incomplete. Build it in from slice 0. |
| "npm audit shows warnings but they're transitive dependencies" | Transitive vulnerabilities are still vulnerabilities. Document them or update the parent. |
| "The user data is not sensitive" | You're not the right person to decide what's sensitive to users. Treat all user data as sensitive. |

## 5. Red Flags

Signs this skill is being violated:

- API endpoint has no authentication check
- User-controlled input rendered directly into HTML without escaping
- Any hardcoded credential or API key (even "temporary")
- `npm audit` not run before committing dependencies
- Auth check only in the frontend router, not enforced server-side
- Database query constructed with string interpolation

## 6. Verification Gate

Before marking security gate passed:

- [ ] Input validation present at every data entry point (server-side)
- [ ] Authentication enforced server-side on every protected endpoint
- [ ] Authorisation checked at the resource level (not just the route level)
- [ ] No secrets in source code (grep confirmed)
- [ ] `.env` files in `.gitignore`
- [ ] `npm audit` run — Critical/High issues resolved
- [ ] New dependencies reviewed for maintenance status and CVEs
- [ ] OWASP checklist completed (see references)
- [ ] Security headers set (web apps)
- [ ] No `eval()`, `innerHTML` with user input, or `dangerouslySetInnerHTML` without sanitisation

## 7. References

- [owasp-checklist.md](references/owasp-checklist.md) — OWASP Top 10 verification checklist
- [secrets-management.md](references/secrets-management.md) — Secrets handling patterns
