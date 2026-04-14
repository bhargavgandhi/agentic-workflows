---
name: backend-engineer
description: Implement backend business logic, database models, robust APIs, and microservice architecture in TypeScript/Node.js.
version: 2.0.0
category: technology
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- User asks to implement backend business logic, a REST/GraphQL API, or database models
- A backend slice in `incremental-implementation` is being executed
- User asks about microservice communication patterns, event-driven architecture, or service layers
- Setting up a new Node.js service or API endpoint

## 2. Prerequisites

- Clear API contract or feature requirement
- Database choice confirmed (MongoDB is default; note if different)
- `references/mongodb-patterns.md` available

## 3. Steps

### Step 1: Design the Layers First
Before writing any code, define the three-layer separation:
- **Controller**: parses HTTP input/output only. No business logic.
- **Service**: executes business logic. Throws typed errors.
- **Repository/Model**: touches the database. Never called directly from controllers.

If the layers aren't clear, ask before implementing.

### Step 2: Database & Modelling (MongoDB)
- Write explicit TypeScript interfaces for every Mongoose schema
- Define indexes alongside the schema — not as an afterthought
- Load `references/mongodb-patterns.md` for document structure and indexing conventions

### Step 3: API Implementation
- Validate every incoming payload at the boundary (Zod or Joi)
- Throw typed custom errors from the Service layer (`NotFoundError`, `UnauthorizedError`, etc.)
- Use centralised Express/Fastify error middleware to map errors to HTTP status codes

### Step 4: Microservice Communication
- **Synchronous** (HTTP/gRPC): wrap calls with timeout, retry, and fallback
- **Asynchronous** (Kafka/RabbitMQ/Redis): document the event payload contract explicitly before wiring up producers/consumers

### Step 5: Testing
- Write integration tests against `mongodb-memory-server` for Repository/Service logic
- Mock all external third-party service calls completely
- No business logic in tests — tests verify behaviour, not implementation

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll put the business logic in the route handler for speed" | Fat controllers are where bugs hide and tests fail. Service layer is non-negotiable. |
| "I'll add validation later, let me get the logic working first" | Unvalidated input at the boundary is a security hole. Validate first, always. |
| "I'll skip indexes for now, we can add them later" | Missing indexes on a growing collection cause full collection scans. Define them with the schema. |
| "I'll use `any` for the DTO type temporarily" | Temporary `any` becomes permanent. Type the DTO before implementing the handler. |
| "I don't need to document the event contract, it's obvious" | Event consumers break silently when the shape changes. Document the contract explicitly. |

## 5. Red Flags

Signs this skill is being violated:

- Business logic in route handlers/controllers
- No input validation on an API endpoint
- MongoDB query with no index on the filter field
- `any` type used for request body or database documents
- Service layer calls `res.json()` directly (controller concerns leaked in)
- Integration test hits a live database instead of `mongodb-memory-server`

## 6. Verification Gate

Before marking backend work complete:

- [ ] Controller/Service/Repository separation present and correct
- [ ] All incoming DTOs validated with Zod or Joi at the boundary
- [ ] Typed custom error classes used in the Service layer
- [ ] Centralised error middleware present
- [ ] MongoDB schemas have explicit TypeScript interfaces and index definitions
- [ ] `references/mongodb-patterns.md` consulted
- [ ] Integration tests run against in-memory database
- [ ] External third-party calls fully mocked in tests

## 7. References

- [mongodb-patterns.md](references/mongodb-patterns.md) — Schema design, indexing, and query patterns
