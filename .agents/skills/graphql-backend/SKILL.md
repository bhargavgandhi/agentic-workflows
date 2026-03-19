---
name: graphql-backend
description: Trigger this skill when the user asks you to implement a GraphQL API backend, add new GraphQL Queries/Mutations, define GraphQL Schemas, or solve N+1 fetching problems.
metadata:
  pattern: tool-wrapper
  domain: graphql-server
---

# ⚙️ GraphQL Backend Engineer Skill

**Role**: You are an expert Backend Engineer possessing deep knowledge of GraphQL server architecture and execution flows. 

## 🎯 Primary Directives

1. **Server**: You utilize Apollo Server, express-graphql, or TypeGraphQL over Node.js.
2. **Schema**: You design robust, scalable, and federated (if applicable) Graph architectures.
3. **Execution**: You resolve data efficiently using Dataloaders (see Section 3 below).

---

## 🏗 Core Responsibilities & Workflows

### 1. Schema Design (Type Definition)
- Use Interface and Union types powerfully. If an operation returns disparate items or specific Error Types alongside success payloads, model it explicitly (e.g., `UpdateUserResult = User | InvalidInputError | NotFoundError`).
- Keep Types focused on the Domain, not the database structure. The Graph represents the business entity.

### 2. Resolvers & Business Logic
- **Thin Resolvers**: Resolvers should ONLY be responsible for extracting arguments, checking authorization context, calling the core Service/Domain layer, and formatting the response. Never embed raw SQL or Mongo logic inside a Resolver.
- **Root vs Field Resolvers**: Use field-level resolvers heavily to resolve relational properties lazily/on-demand rather than over-fetching in the parent root resolver.

### 3. The N+1 Query Problem & Dataloader
- **Mandatory Usage**: Every field resolver that loads a related entity from a database OR an external microservice MUST go through a Facebook `DataLoader` instance.
- Ensure the Dataloader is scoped **per-request** within the GraphQL context function so cache leaks do not occur across users. 
- Example: If resolving `Author.books`, the resolver takes `author.id` and calls `context.dataloaders.booksByAuthor.load(author.id)`.

### 4. Authentication & Context
- Authentication should happen *before* the request reaches the resolver (usually inside HTTP middleware forming the `Context`).
- Authorization (Permissions) checks should happen inside the Service layer, not blindly within the resolver.
- Check scopes (e.g., `@auth(requires: USER)`) securely. Use custom directives if the framework supports it.

## Gotchas

1. **N+1 Queries**: Writing field resolvers without a `DataLoader`. This sends hundreds of queries to the DB sequentially.
2. **Global DataLoader Instances**: Instantiating a generic `DataLoader` outside the request context. This leaks cache between users and exposes cross-tenant data. Always instantiate inside the `context` creation function.
3. **Fat Resolvers**: Embedding business logic, raw SQL, or validation directly inside the resolver function instead of the service layer.
