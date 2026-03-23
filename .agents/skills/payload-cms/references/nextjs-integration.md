# Next.js App Router Integration

## payload.config.ts Setup

```typescript
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
// or: import { mongooseAdapter } from '@payloadcms/db-mongoose'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Posts } from './collections/Posts'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { Pages } from './collections/Pages'
import { SiteSettings } from './globals/SiteSettings'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
  admin: {
    user: 'users',
    meta: { titleSuffix: '— Admin' },
  },
  collections: [Posts, Pages, Media, Users],
  globals: [SiteSettings],
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI! },
  }),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  cors: [process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'],
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'],
})
```

## App Router File Structure

```
app/
├── (app)/                    # Your frontend routes
│   ├── layout.tsx
│   ├── page.tsx
│   └── blog/
│       ├── page.tsx
│       └── [slug]/page.tsx
├── (payload)/                # Payload admin — isolated route group
│   ├── admin/
│   │   └── [[...segments]]/
│   │       ├── page.tsx
│   │       └── not-found.tsx
│   └── api/
│       └── [...slug]/
│           └── route.ts      # Handles ALL /api/* Payload routes
└── layout.tsx
```

## Route Handler (API)

```typescript
// app/(payload)/api/[...slug]/route.ts
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST } from '@payloadcms/next/routes'
import config from '@payload-config'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const OPTIONS = REST_OPTIONS(config)
```

## Fetching Data in Server Components

```typescript
// app/(app)/blog/[slug]/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    limit: 1000,
    select: { slug: true },
  })
  return docs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  const post = docs[0]
  if (!post) return {}
  return {
    title: post.meta?.title ?? post.title,
    description: post.meta?.description,
    openGraph: {
      images: post.meta?.image ? [{ url: (post.meta.image as Media).url! }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    depth: 2,
    limit: 1,
  })

  const post = docs[0]
  if (!post) notFound()

  return <PostLayout post={post} />
}
```

## On-Demand Revalidation via Hooks

```typescript
// In a collection hook — trigger Next.js ISR after save
import { revalidatePath, revalidateTag } from 'next/cache'

hooks: {
  afterChange: [
    async ({ doc, previousDoc, operation }) => {
      // Revalidate specific pages
      if (doc.slug) {
        revalidatePath(`/blog/${doc.slug}`)
      }
      // Revalidate listing page
      revalidatePath('/blog')
      // Tag-based revalidation (for layout.tsx using unstable_cache)
      revalidateTag('posts')
    },
  ],
  afterDelete: [
    async ({ doc }) => {
      if (doc.slug) revalidatePath(`/blog/${doc.slug}`)
      revalidatePath('/blog')
    },
  ],
},
```

## Admin Panel Customization

```typescript
// Custom admin components — e.g., dashboard
// app/(payload)/admin/[[...segments]]/page.tsx
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'

export const generateMetadata = () => generatePageMetadata({ config })

export default async function Page({ params, searchParams }: any) {
  return RootPage({ config, params, searchParams })
}
```
