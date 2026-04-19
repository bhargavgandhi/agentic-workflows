# OWASP Top 10 Verification Checklist

Mark each item: **Pass** | **Fail** (describe issue) | **N/A**

## A01 — Broken Access Control
- [ ] Users can only access their own data (resource-level authorisation)
- [ ] Admin/privileged routes verified server-side, not just hidden in UI
- [ ] Directory traversal not possible via user-controlled file paths
- [ ] CORS policy restricts origins to known domains

## A02 — Cryptographic Failures
- [ ] Sensitive data encrypted at rest (PII, credentials, health data)
- [ ] HTTPS enforced; no plain HTTP endpoints with sensitive data
- [ ] No weak hashing algorithms (MD5, SHA1) for passwords — use bcrypt/argon2
- [ ] Passwords never stored in plaintext or reversibly encrypted

## A03 — Injection
- [ ] SQL/NoSQL queries use parameterised queries or ORM
- [ ] OS commands not constructed from user input
- [ ] LDAP/XPath queries use safe APIs
- [ ] Template injection not possible via user-controlled template strings

## A04 — Insecure Design
- [ ] Rate limiting on authentication endpoints
- [ ] Account lockout after N failed attempts
- [ ] Security requirements defined in PRD (not retrofitted)

## A05 — Security Misconfiguration
- [ ] No default credentials in use
- [ ] Error messages don't expose stack traces or internal paths to users
- [ ] Unnecessary features/endpoints disabled
- [ ] Security headers present (CSP, X-Frame-Options, etc.)

## A06 — Vulnerable and Outdated Components
- [ ] `npm audit` run — Critical/High resolved
- [ ] All new dependencies reviewed for maintenance and CVEs

## A07 — Identification and Authentication Failures
- [ ] Session tokens sufficiently random (≥128 bits)
- [ ] Tokens invalidated on logout
- [ ] MFA available for privileged accounts (or planned)
- [ ] Credential stuffing mitigations (rate limiting, CAPTCHA)

## A08 — Software and Data Integrity Failures
- [ ] npm packages from trusted registries with pinned versions
- [ ] CI/CD pipeline access restricted to authorised team members

## A09 — Security Logging and Monitoring
- [ ] Authentication failures logged
- [ ] Access control failures logged
- [ ] Logs do not contain passwords or sensitive tokens

## A10 — Server-Side Request Forgery (SSRF)
- [ ] URLs fetched server-side are validated against an allowlist
- [ ] Internal network addresses blocked from user-provided URLs
