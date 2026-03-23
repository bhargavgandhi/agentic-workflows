# Fields & TypeScript Types

## Payload Field Types Reference

| Field Type     | Use Case |
|----------------|----------|
| `text`         | Short strings, titles, slugs |
| `textarea`     | Multi-line plain text, descriptions |
| `richText`     | Rich text with Lexical editor |
| `number`       | Integers, decimals, prices |
| `checkbox`     | Boolean flags |
| `select`       | Enum/status fields, single choice |
| `radio`        | Single choice with visible options |
| `date`         | Dates and datetimes |
| `upload`       | File/image references (points to a collection w/ upload) |
| `relationship` | Reference to another collection |
| `email`        | Validated email string |
| `code`         | Code snippets with syntax highlighting |
| `json`         | Raw JSON blob (unstructured) |
| `point`        | Lat/lng coordinates |
| `array`        | Repeating group of fields |
| `blocks`       | Polymorphic block builder |
| `group`        | Named group of fields (no DB row, just UI grouping) |
| `row`          | Side-by-side fields in admin UI only |
| `tabs`         | Tabbed layout in admin UI |
| `collapsible`  | Collapsible section in admin UI |
| `ui`           | Custom React component, no data storage |

## Generated Types Usage

```bash
# After any schema change, regenerate types
npx payload generate:types
```

```typescript
// Always import from the generated file — never hand-write
import type { Post, Media, User, SiteSettings } from '@/payload-types'

// Relationship fields are typed as populated OR ID depending on depth
type Post = {
  id: string
  title: string
  author: string | User   // string = unpopulated ID, User = populated
  featuredImage: string | Media
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

// Narrow by checking type
function getAuthorName(post: Post): string {
  if (typeof post.author === 'string') return post.author  // ID only
  return post.author.name                                    // Populated User
}
```

## Common Field Patterns

```typescript
// Slug field with auto-population from title
{
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    // Auto-generate slug from title (v3 hook or custom component)
  },
  hooks: {
    beforeValidate: [({ data, originalDoc }) => {
      if (data?.title && !data?.slug) {
        return data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      }
      return data?.slug
    }],
  },
},

// Select with typed options
{
  name: 'status',
  type: 'select',
  required: true,
  defaultValue: 'draft',
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
  ],
},

// Relationship — single
{
  name: 'category',
  type: 'relationship',
  relationTo: 'categories',
  required: true,
},

// Relationship — many
{
  name: 'tags',
  type: 'relationship',
  relationTo: 'tags',
  hasMany: true,
},

// Polymorphic relationship (multiple collections)
{
  name: 'relatedContent',
  type: 'relationship',
  relationTo: ['posts', 'pages', 'products'],
  hasMany: true,
},

// Array field (repeater)
{
  name: 'testimonials',
  type: 'array',
  minRows: 1,
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'author', type: 'text', required: true },
    { name: 'role', type: 'text' },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
  ],
},

// Conditional field visibility
{
  name: 'expiryDate',
  type: 'date',
  admin: {
    condition: (data) => data?.status === 'published',
  },
},
```

## Locale / Internationalization

```typescript
// In payload.config.ts
localization: {
  locales: ['en', 'fr', 'de'],
  defaultLocale: 'en',
  fallback: true,
},

// Mark individual fields as localized
{ name: 'title', type: 'text', localized: true },
{ name: 'content', type: 'richText', localized: true },
// Non-localized fields (slug, dates, media) are shared across locales
{ name: 'slug', type: 'text', localized: false },
```
