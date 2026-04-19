---
name: payload-cms
description: PayloadCMS v3 — collections, globals, fields, access control, hooks, Next.js integration, media uploads, and email.
version: 2.0.0
category: technology
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- Defining or modifying Payload collections, globals, or fields
- Implementing access control on a collection or field
- Writing collection hooks (`beforeChange`, `afterChange`, `beforeRead`)
- Integrating Payload data with Next.js Server Components or Route Handlers
- Setting up media uploads, rich text (Lexical), or email

## 2. Prerequisites

- Payload v3 confirmed (not v2 — the API is different)
- Next.js App Router project
- `references/` files available

## 3. Steps

### Step 1: Schema-First Modelling
All data modelling starts from collection/global configs in `payload.config.ts`. The database schema, admin UI, and REST/GraphQL API are all derived from this source.

- **Collections** = repeatable content (Posts, Users, Products, Media)
- **Globals** = singleton content (Site Settings, Nav, Footer)
- Every collection needs: `slug` (kebab-case), `admin.useAsTitle`, `timestamps: true`, and explicit `access` controls

Load `references/collections-patterns.md` for naming and field conventions.

### Step 2: Types — Always Use Generated
Run `npx payload generate:types` after any schema change. Use generated types:
```ts
import type { Post, Media, User } from '@/payload-types';
```
Never hand-write collection types. Load `references/fields-and-types.md`.

### Step 3: Access Control
- Access functions receive `{ req: { user } }` — type `user` as `User | null`
- For row-level filtering: return a `where` query, not `false` (returning `false` blocks the entire collection)
- Separate read vs write access explicitly:
```ts
access: {
  read: () => true,
  create: ({ req: { user } }) => Boolean(user),
  delete: ({ req: { user } }) => user?.role === 'admin',
},
```

### Step 4: Hooks
- `beforeChange`: mutate/validate data before saving — always return `data`
- `afterChange`: trigger side effects (ISR revalidation, email, webhooks)
- `beforeRead`/`afterRead`: transform data for API output
- Call `revalidatePath()` or `revalidateTag()` in `afterChange` to trigger Next.js ISR

### Step 5: Next.js Integration
Use `getPayload({ config })` in Server Components and Route Handlers:
```ts
const payload = await getPayload({ config });
const posts = await payload.find({ collection: 'posts', depth: 1 });
```
Pass `depth: 1` (or higher) to auto-populate relationship fields — default `depth: 0` returns IDs only.
Load `references/nextjs-integration.md`.

### Step 6: Media & Rich Text
- Media: configure `imageSizes` in the upload collection for responsive variants. Use cloud storage (`@payloadcms/storage-s3`) in production.
- Rich text: Payload v3 uses **Lexical** (not Slate). Render with `<RichText>` component or `convertLexicalToHTML` — never `dangerouslySetInnerHTML` raw Lexical JSON.
Load `references/media-patterns.md` and `references/rich-text-blocks.md`.

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll use `req.payload` like in v2" | `req.payload` is v2. In v3, use `getPayload({ config })`. This is a breaking change. |
| "I'll hand-write the TypeScript types for this collection" | Generated types stay in sync with the schema. Hand-written types drift. Run the generator. |
| "I'll return `false` from the read access function to hide some docs" | `false` blocks the entire collection for that user. Return a `where` query for row-level filtering. |
| "I'll render Lexical content with `dangerouslySetInnerHTML`" | Lexical JSON is not HTML. Use `<RichText>` or `convertLexicalToHTML`. |
| "The page will update after the CMS edit automatically" | Next.js caches aggressively. Always call `revalidatePath` in `afterChange`. |

## 5. Red Flags

Signs this skill is being violated:

- `req.payload` used in a v3 project
- Hand-written TypeScript types for collections instead of generated types
- Access function returns `false` instead of a `where` query for row-level access
- `dangerouslySetInnerHTML` used to render Lexical content
- `depth: 0` (default) used when relationship data is needed
- No `revalidatePath` call in `afterChange` hooks in a Next.js project

## 6. Verification Gate

Before marking Payload CMS work complete:

- [ ] `getPayload({ config })` used — not `req.payload`
- [ ] `npx payload generate:types` run after schema changes; generated types used
- [ ] Access controls defined on every collection
- [ ] Row-level access uses `where` query, not boolean `false`
- [ ] `afterChange` hooks call `revalidatePath`/`revalidateTag` for Next.js pages
- [ ] Lexical rich text rendered via `<RichText>` or `convertLexicalToHTML`
- [ ] `depth` parameter set explicitly on `payload.find()` calls that need populated relationships

## 7. References

- [collections-patterns.md](references/collections-patterns.md) — Collection and global conventions
- [fields-and-types.md](references/fields-and-types.md) — Field definitions and generated type usage
- [media-patterns.md](references/media-patterns.md) — Upload fields, image sizes, cloud storage
- [rich-text-blocks.md](references/rich-text-blocks.md) — Lexical editor and block patterns
- [nextjs-integration.md](references/nextjs-integration.md) — App Router integration patterns
- [email-patterns.md](references/email-patterns.md) — Transactional email setup
