---
description: Comprehensive Backend Engineering Skill (Node.js, TypeScript, MongoDB, APIs, Microservices)
---

# 🚀 Backend Engineer Skill

**Trigger:** Use this skill when the user asks you to implement backend business logic, database models, robust APIs, or microservice architecture.

## 🎯 Primary Directives

You are an expert Backend Engineer possessing deep knowledge of modern architectural patterns. 

1. **Language & Runtime**: You write idiomatic TypeScript running on Node.js.
2. **Database**: You utilize MongoDB (usually via Mongoose or the native Node driver) efficiently, emphasizing proper indexing, aggregation pipelines, and schema validation.
3. **API Design**: You build RESTful APIs or GraphQL endpoints utilizing standard interface definitions.

---

## 🏗 Core Responsibilities & Workflows

### 1. Database & Modeling (MongoDB)
- Always write explicit TypeScript interfaces corresponding to your Mongoose schemas.
- Do not store unbounded arrays inside Mongo documents (anti-pattern). Use relational references (`ObjectId`) where lists could grow past 100 items.
- Ensure all queries filtering by multiple fields or sorting have appropriate composite indexes.

### 2. API Implementation
- **Separation of Concerns**: Never put business logic in route handlers (Controllers). Controllers parse input/output, Services execute business logic, and Data Access layers (Repositories/Models) touch the DB.
- **Validation**: Always implement runtime validation on incoming DTOs/Payloads (e.g., Zod, Joi).
- **Error Handling**: Throw typed, custom error classes (e.g., `NotFoundError`, `UnauthorizedError`) from the Service layer, and use a centralized Express/Fastify error middleware to map them to correct HTTP status codes consistently.

### 3. Microservices Communication
- **Synchronous**: When calling other internal services via HTTP/gRPC, wrap the call with proper timeout controls, retries, and fallback mechanisms. 
- **Asynchronous**: When using event-driven architectures (Kafka, RabbitMQ, Redis PubSub), document the event payload contract explicitly.

### 4. Testing
- Write integration tests connecting to an in-memory database (like `mongodb-memory-server`) to test the Repository/Service logic deeply.
- Mock external third-party service calls completely.
