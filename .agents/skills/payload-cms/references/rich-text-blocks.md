# Rich Text & Block Editor (Lexical)

## Lexical Editor Setup

```typescript
// payload.config.ts — configure Lexical globally
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import {
  BlocksFeature,
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  UnderlineFeature,
  StrikethroughFeature,
  OrderedListFeature,
  UnorderedListFeature,
  HeadingFeature,
  ParagraphFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  HorizontalRuleFeature,
  BlockquoteFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

export default buildConfig({
  editor: lexicalEditor({
    features: () => [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      OrderedListFeature(),
      UnorderedListFeature(),
      BlockquoteFeature(),
      HorizontalRuleFeature(),
      LinkFeature({ enabledCollections: ['pages', 'posts'] }),
      UploadFeature({ collections: { media: { fields: [{ name: 'caption', type: 'textarea' }] } } }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      BlocksFeature({ blocks: [CalloutBlock, CodeBlock, ImageGridBlock] }),
    ],
  }),
})
```

## Defining Custom Blocks

```typescript
import type { Block } from 'payload'

// Callout / Alert block
export const CalloutBlock: Block = {
  slug: 'callout',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    {
      name: 'type',
      type: 'select',
      options: ['info', 'warning', 'success', 'error'],
      defaultValue: 'info',
    },
    { name: 'title', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
  ],
}

// Code snippet block
export const CodeBlock: Block = {
  slug: 'code',
  labels: { singular: 'Code Block', plural: 'Code Blocks' },
  fields: [
    {
      name: 'language',
      type: 'select',
      options: ['typescript', 'javascript', 'bash', 'json', 'css', 'html'],
      defaultValue: 'typescript',
    },
    { name: 'code', type: 'code', required: true, admin: { language: 'javascript' } },
    { name: 'filename', type: 'text' },
  ],
}

// Two-image grid block
export const ImageGridBlock: Block = {
  slug: 'image-grid',
  labels: { singular: 'Image Grid', plural: 'Image Grids' },
  fields: [
    {
      name: 'images',
      type: 'array',
      minRows: 2,
      maxRows: 4,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
  ],
}
```

## Rendering Lexical Content on the Frontend

```typescript
// Option 1: React component (SSR/RSC compatible)
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export function PostContent({ content }: { content: SerializedEditorState }) {
  return (
    <RichText
      data={content}
      // Custom renderers for your blocks
      converters={{
        blocks: {
          callout: ({ node }) => (
            <div className={`callout callout--${node.fields.type}`}>
              {node.fields.title && <strong>{node.fields.title}</strong>}
              <p>{node.fields.message}</p>
            </div>
          ),
          code: ({ node }) => (
            <pre>
              <code className={`language-${node.fields.language}`}>
                {node.fields.code}
              </code>
            </pre>
          ),
        },
      }}
    />
  )
}

// Option 2: Convert to HTML (for emails, RSS feeds, etc.)
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical'

const html = await convertLexicalToHTML({ data: post.content })
```

## Page Builder (Blocks at Collection Level)

```typescript
// Use blocks field for page builder pattern (outside of richText)
{
  name: 'layout',
  type: 'blocks',
  blocks: [HeroBlock, TextBlock, ImageBlock, CTABlock, TestimonialsBlock],
},
```

```typescript
// HeroBlock definition
export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'link', type: 'text' },
        { name: 'variant', type: 'select', options: ['primary', 'secondary', 'ghost'] },
      ],
    },
  ],
}
```

## Rendering Page Builder Blocks in Next.js

```typescript
import type { Page } from '@/payload-types'

const blockComponents: Record<string, React.ComponentType<any>> = {
  hero: HeroBlock,
  text: TextBlock,
  image: ImageBlock,
  cta: CTABlock,
}

export function PageLayout({ layout }: { layout: Page['layout'] }) {
  return (
    <main>
      {layout?.map((block, i) => {
        const Component = blockComponents[block.blockType]
        if (!Component) return null
        return <Component key={i} {...block} />
      })}
    </main>
  )
}
```
