# Media, Images & File Uploads

## Media Collection Setup

```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'System',
    useAsTitle: 'alt',
  },
  access: {
    read: () => true,  // Public read for all media
  },
  upload: {
    staticDir: 'public/media',       // Local dev: serve from /public/media
    mimeTypes: ['image/*', 'application/pdf', 'video/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, crop: 'centre' },
      { name: 'card',      width: 768, height: 512, crop: 'centre' },
      { name: 'hero',      width: 1920, height: 1080, crop: 'centre' },
      { name: 'og',        width: 1200, height: 630, crop: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Required for accessibility' },
    },
    {
      name: 'caption',
      type: 'richText',
    },
  ],
}
```

## Cloud Storage (S3 / R2)

```typescript
// payload.config.ts — production cloud storage
import { s3Storage } from '@payloadcms/storage-s3'

export default buildConfig({
  plugins: [
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_BUCKET!,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY!,
          secretAccessKey: process.env.S3_SECRET_KEY!,
        },
        region: process.env.S3_REGION ?? 'us-east-1',
        // For Cloudflare R2:
        endpoint: process.env.S3_ENDPOINT,
      },
    }),
  ],
})
```

## Using Media in Next.js

```typescript
// next.config.js — allow Payload media hostnames
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SERVER_URL?.replace('https://', '') ?? '',
      },
      // For S3/R2:
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 's3.amazonaws.com' },
    ],
  },
}
```

```typescript
// Component — rendering a Payload media object
import NextImage from 'next/image'
import type { Media } from '@/payload-types'

type Props = { image: Media; className?: string }

export function PayloadImage({ image, className }: Props) {
  if (!image?.url) return null

  // Use generated image sizes
  const src = image.sizes?.card?.url ?? image.url
  const width = image.sizes?.card?.width ?? image.width ?? 0
  const height = image.sizes?.card?.height ?? image.height ?? 0

  return (
    <NextImage
      src={src}
      alt={image.alt}
      width={width}
      height={height}
      className={className}
    />
  )
}

// For responsive hero images with srcset:
export function HeroImage({ image }: { image: Media }) {
  return (
    <NextImage
      src={image.sizes?.hero?.url ?? image.url ?? ''}
      alt={image.alt}
      fill
      sizes="100vw"
      priority
    />
  )
}
```

## Document Uploads (PDFs, etc.)

```typescript
// Separate Documents collection for non-image assets
export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  access: { read: () => true },
  upload: {
    staticDir: 'public/documents',
    mimeTypes: ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'accessLevel',
      type: 'select',
      options: ['public', 'members-only', 'internal'],
      defaultValue: 'public',
    },
  ],
}
```
