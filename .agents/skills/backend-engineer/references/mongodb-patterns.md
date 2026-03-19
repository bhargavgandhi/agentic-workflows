# MongoDB / Mongoose Patterns

- Always write explicit TypeScript interfaces corresponding to your Mongoose schemas.
- Use native Node driver or Mongoose correctly.
- Do not store unbounded arrays inside Mongo documents (anti-pattern). Use relational references (`ObjectId`) where lists could grow past 100 items.
- Ensure all queries filtering by multiple fields or sorting have appropriate composite indexes.
