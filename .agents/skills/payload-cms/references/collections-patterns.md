# Collections & Globals Patterns

## Collection Config Structure

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'author', 'publishedAt'],
    group: 'Content',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true           // authenticated: see all
      return { status: { equals: 'published' } } // public: published only
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  timestamps: true,
  versions: {
    drafts: { autosave: true },       // Enable drafts + autosave
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published'],
      defaultValue: 'draft',
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
```

## Global Config Structure

```typescript
import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'System' },
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'siteName', type: 'text', required: true },
    { name: 'siteDescription', type: 'textarea' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'platform', type: 'select', options: ['twitter', 'linkedin', 'github', 'instagram'] },
        { name: 'url', type: 'text' },
      ],
    },
  ],
}
```

## Querying in Server Components

```typescript
import { getPayload } from 'payload'
import config from '@/payload.config'

// Find with filters, pagination, depth
const { docs: posts, totalDocs } = await payload.find({
  collection: 'posts',
  where: {
    status: { equals: 'published' },
    publishedAt: { less_than_equal: new Date().toISOString() },
  },
  sort: '-publishedAt',
  limit: 10,
  page: 1,
  depth: 1,           // Populate relationships 1 level deep
})

// Find by ID
const post = await payload.findByID({
  collection: 'posts',
  id: postId,
  depth: 2,
})

// Find global
const settings = await payload.findGlobal({
  slug: 'site-settings',
  depth: 1,
})
```

## Row-Level Access (Where Queries)

```typescript
// Return a where query for filtering, not just true/false
access: {
  read: ({ req: { user } }) => {
    if (!user) return { status: { equals: 'published' } }
    if (user.role === 'admin') return true
    // Authors can only see their own docs
    return {
      or: [
        { status: { equals: 'published' } },
        { author: { equals: user.id } },
      ],
    }
  },
}
```

## Hooks

```typescript
hooks: {
  beforeChange: [
    ({ data, req, operation }) => {
      // Auto set author on create
      if (operation === 'create' && req.user) {
        data.author = req.user.id
        data.publishedAt = data.status === 'published' ? new Date().toISOString() : null
      }
      return data  // Always return data
    },
  ],
  afterChange: [
    async ({ doc, operation }) => {
      // Revalidate Next.js cache after save
      if (doc.status === 'published') {
        revalidatePath(`/blog/${doc.slug}`)
        revalidatePath('/blog')
      }
    },
  ],
},
```
