---
trigger: manual
description: Node.js Standards
---

# Node.js Project Standards

## 1. General Architecture

- **Environment Management:** Use `dotenv` or similar to handle environment-specific configurations. Do not hardcode secrets.
- **Project Structure:** Follow a layered architecture (e.g., Domain Driven Design, or a Controller-Service-Repository pattern). Separation of concerns is paramount.
- **Asynchronous Execution:** Prefer `async/await` over raw promises (`.then()/.catch()`) and never use callbacks unless bridging legacy APIs.

## 2. Typescript & Tooling (If Applicable)

- **Strict Mode:** Always enable `"strict": true` in `tsconfig.json`.
- **Prettier & ESLint:** Code must be strongly linted and automatically formatted before committing.
- **Explicit Typing:** Avoid using `any`. Use `unknown` or narrow types securely.

## 3. API & Web Frameworks

- **Validation:** Always validate incoming payloads at the boundaries (using Zod, Joi, class-validator, etc.) before handing processing over to the service layer.
- **Error Handling:** Use an asynchronous global error handler. Wrap route handlers tightly to avoid unhandled promise rejections that crash Node.
- **Standardized Responses:** Keep JSON response payloads consistent (e.g., `{ success: true, data: {...} }` or `{ success: false, error: "..." }`).

## 4. Performance & Scalability

- **Non-blocking IO:** Avoid any synchronously executing filesystem or crypto methods inside hot paths.
- **Statelessness:** Ensure the Node API layer remains stateless; use Redis or similar KV stores for session states or caching.
- **Pagination:** Always paginate bulk data endpoints to avoid memory allocation bottlenecks.

## 5. Security Principles

- **Dependencies:** Regularly audit dependencies. Run `npm audit` or use tools like Snyk.
- **Rate-Limiting:** Implement API rate limiting on public endpoints to prevent abuse.
- **Sanitization:** Prevent NoSQL/SQL injection attacks by properly escaping or using ORM/QueryBuilder parameterized queries.
