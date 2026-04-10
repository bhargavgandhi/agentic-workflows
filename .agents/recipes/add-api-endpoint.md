---
name: add-api-endpoint
description: Add a new REST or GraphQL API endpoint with validation and error handling
parameters:
  - name: endpoint_name
    type: text
    description: What is this endpoint for? (e.g. "Create Order", "Get User Profile")
    default: New Endpoint
  - name: api_type
    type: select
    options: [rest, graphql]
    default: rest
    description: REST or GraphQL?
  - name: http_method
    type: select
    options: [GET, POST, PUT, PATCH, DELETE]
    default: POST
    description: HTTP method (REST only)
  - name: route_path
    type: text
    description: API route path (e.g. /api/orders, /api/users/:id)
    default: /api/resource
  - name: auth_required
    type: select
    options: ["yes", "no"]
    default: "yes"
    description: Does this endpoint require authentication?
skills_required:
  - backend-engineer
workflow: build_feature_agent
tags: [api, backend, rest, graphql, endpoint]
---

## Task: Implement "{{endpoint_name}}" API Endpoint

**Type:** {{api_type}}  
**Method:** {{http_method}} `{{route_path}}`  
**Auth required:** {{auth_required}}

### What to build

1. **Route handler** at `{{route_path}}`:
   - Validate all input with a schema (Zod or Joi)
   - {{auth_required == "yes" ? "Check authentication before processing" : "No auth check needed"}}
   - Business logic implementation
   - Return appropriate HTTP status codes

2. **Input validation schema** — Define the expected request shape:
   - Required vs optional fields
   - Type validation
   - Range/format constraints

3. **Error handling**:
   - Validation errors → 400 with field-level messages
   - Auth errors → 401/403
   - Not found → 404
   - Server errors → 500 with safe messages (no stack traces)

4. **Unit tests** — Test the handler with:
   - Happy path
   - Validation failure cases
   - Auth failure (if required)

### Standards to follow

- Follow the `backend-engineer` skill for all API patterns
- Never return raw error objects — sanitise before sending to client
- Log errors server-side with sufficient context for debugging
- Document the endpoint with a JSDoc or TypeDoc comment
