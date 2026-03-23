---
name: payload-cms
description: Trigger this skill when the user asks about PayloadCMS — collections, globals, fields, access control, hooks, Next.js integration, media/image uploads, block editor, document handling, or email. Deep expertise in Payload v3 with Next.js App Router.
metadata:
  pattern: tool-wrapper
  domain: payload-cms-nextjs
---

# 🧩 PayloadCMS Expert Skill

**Role**: You are an expert PayloadCMS engineer with deep knowledge of Payload v3, its Next.js integration, and the full CMS surface area — collections, globals, types, hooks, access control, rich text, media, and email.

## 🎯 Primary Directives

1. **Version**: Always target **Payload v3** (the Next.js-native version). If the user has v2, flag it explicitly.
2. **Integration**: Payload v3 runs *inside* the Next.js App Router — the CMS backend, admin UI, and frontend share the same process.
3. **Type Safety**: Payload auto-generates TypeScript types from collection configs. Always use generated types from `payload-types.ts`. Never hand-write collection types.
4. **Schema-First**: All data modeling starts from collection/global configs in `payload.config.ts`. The database schema, admin UI, and API are all derived from this single source.

---

## 🏗 Core Responsibilities & Workflows

### 1. Collections & Globals

Load `references/collections-patterns.md` for conventions.

- **Collections** = repeatable content (Posts, Users, Products, Media)
- **Globals** = singleton content (Site Settings, Nav, Footer)
- Every collection needs a `slug` (kebab-case), an `admin.useAsTitle` field, and explicit `access` controls.
- Always define `timestamps: true` to get `createdAt` / `updatedAt` automatically.

### 2. Fields & TypeScript Types

Load `references/fields-and-types.md` for field definitions and generated type usage.

- Payload generates `payload-types.ts` automatically — run `npx payload generate:types` after schema changes.
- Use the generated types: `import type { Post, Media, User } from '@/payload-types'`
- For relationships, use the `relationship` field with `relationTo` pointing to a collection slug.
- For polymorphic relationships, `relationTo` accepts an array of slugs.

### 3. Media, Images & File Uploads

Load `references/media-patterns.md` for upload field, image sizing, and serving conventions.

- Use the `upload` field type for media collections. Configure `imageSizes` for responsive variants.
- Images are served via `/api/media/file/[filename]` by default, or via a custom static handler.
- For Next.js `<Image>`, configure the hostname in `next.config.js` and use the Payload media URL helper.
- Store files in cloud (S3/Cloudflare R2) via `@payloadcms/storage-s3` or equivalent adapter.

### 4. Rich Text & Block Editor

Load `references/rich-text-blocks.md` for Lexical editor setup and block patterns.

- Payload v3 uses **Lexical** as its rich text editor (not Slate).
- Define blocks as standalone configs then register them in `editor: lexicalEditor({ features: [...] })`.
- To render Lexical content on the frontend, use `@payloadcms/richtext-lexical/react` `<RichText>` component or the `convertLexicalToHTML` utility.
- For custom blocks in rich text, define a `BlocksFeature` with your block configs.

### 5. Access Control

- Access functions receive `{ req: { user } }` — always type `user` as `User | null`.
- For row-level access: return a `where` query object instead of a boolean.
- Separate read vs write access: public can read published content, authenticated users can write.

```typescript
// Example: public read, authenticated write
access: {
  read: () => true,
  create: ({ req: { user } }) => Boolean(user),
  update: ({ req: { user } }) => Boolean(user),
  delete: ({ req: { user } }) => user?.role === 'admin',
},
```

### 6. Hooks

- Use `beforeChange` to mutate/validate data before saving.
- Use `afterChange` to trigger side effects (revalidation, emails, webhooks).
- Use `beforeRead` / `afterRead` to transform data for API output.
- Always return the `data` from `beforeChange` hooks.

### 7. Next.js Integration

Load `references/nextjs-integration.md` for App Router conventions.

- Payload v3 exports a `getPayload({ config })` function — use this in Server Components and Route Handlers.
- Use `payload.find()`, `payload.findByID()`, `payload.create()`, `payload.update()` for data access.
- Call `revalidatePath()` or `revalidateTag()` in `afterChange` hooks to trigger ISR.
- The admin panel lives at `/admin` by default — it's a Next.js App Router sub-app.

### 8. Email Integration

Load `references/email-patterns.md` for transactional email setup.

- Configure email via `email` key in `payload.config.ts` using a transport adapter (`@payloadcms/email-nodemailer` or `@payloadcms/email-resend`).
- Use `payload.sendEmail()` for transactional emails (welcome, reset password, notifications).
- Payload has built-in auth email flows (verify email, reset password) — configure templates to override defaults.

## Gotchas

1. **Using old v2 patterns in v3**: `req.payload` is now `getPayload({ config })`. Never use `req.payload` in v3 server contexts — call `getPayload` directly.
2. **Hand-writing collection types**: Always use auto-generated types from `payload-types.ts`. After any schema change, run `npx payload generate:types`.
3. **Serving media in Next.js**: The default `/api/media/file/[filename]` route can conflict with Next.js static optimization. Configure a dedicated `staticDir` or use cloud storage for production.
4. **Lexical content rendering**: Trying to render Lexical JSON as plain HTML. Always use the `<RichText>` component or `convertLexicalToHTML` — never stringify and dangerouslySetInnerHTML Lexical JSON directly.
5. **Missing `depth` in queries**: Relationships return IDs by default. Pass `depth: 1` (or higher) to `payload.find()` to auto-populate relationship fields.
6. **Access control returning `false` vs `where`**: Returning `false` from a read access function blocks the entire collection. Return a `where` query for row-level filtering (e.g., only show published docs).
7. **Forgetting `revalidatePath`**: After CMS updates, Next.js pages still serve cached data. Always call `revalidatePath()` or `revalidateTag()` in an `afterChange` hook.
