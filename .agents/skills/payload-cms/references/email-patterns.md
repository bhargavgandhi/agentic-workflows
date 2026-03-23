# Email Integration

## Email Adapter Setup

```typescript
// payload.config.ts — Resend (recommended for production)
import { resendAdapter } from '@payloadcms/email-resend'

export default buildConfig({
  email: resendAdapter({
    defaultFromAddress: 'noreply@yourdomain.com',
    defaultFromName: 'Your App',
    apiKey: process.env.RESEND_API_KEY!,
  }),
})
```

```typescript
// payload.config.ts — Nodemailer (SMTP / SendGrid / Mailgun)
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'

export default buildConfig({
  email: nodemailerAdapter({
    defaultFromAddress: 'noreply@yourdomain.com',
    defaultFromName: 'Your App',
    transport: nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
  }),
})
```

## Sending Transactional Emails

```typescript
// In collection hooks or custom endpoints
import { getPayload } from 'payload'
import config from '@payload-config'

// Welcome email after user registration
hooks: {
  afterChange: [
    async ({ doc, operation, req }) => {
      if (operation !== 'create') return

      await req.payload.sendEmail({
        to: doc.email,
        from: 'welcome@yourapp.com',
        subject: 'Welcome to Your App!',
        html: `
          <h1>Welcome, ${doc.name}!</h1>
          <p>Your account has been created successfully.</p>
          <p><a href="${process.env.NEXT_PUBLIC_SERVER_URL}/login">Sign In</a></p>
        `,
      })
    },
  ],
},

// Notification email from a custom endpoint
async function sendNotification(userId: string, message: string) {
  const payload = await getPayload({ config })

  const user = await payload.findByID({ collection: 'users', id: userId })
  if (!user?.email) return

  await payload.sendEmail({
    to: user.email,
    subject: 'You have a new notification',
    html: `<p>${message}</p>`,
    text: message,  // Plain text fallback
  })
}
```

## Built-in Auth Emails (Override Templates)

```typescript
// Customize Payload's built-in auth email templates
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    verify: {
      generateEmailHTML: ({ token, user }) => `
        <h1>Verify your email</h1>
        <p>Hi ${user.name},</p>
        <p>Click below to verify your account:</p>
        <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/verify?token=${token}">
          Verify Email
        </a>
      `,
      generateEmailSubject: () => 'Please verify your email',
    },
    forgotPassword: {
      generateEmailHTML: ({ token, user }) => `
        <h1>Reset your password</h1>
        <p>Hi ${user.name},</p>
        <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${token}">
          Reset Password
        </a>
        <p>Link expires in 1 hour.</p>
      `,
      generateEmailSubject: () => 'Reset your password',
    },
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'select', options: ['admin', 'editor', 'viewer'], defaultValue: 'viewer' },
  ],
}
```

## Email in Custom API Endpoints

```typescript
// app/(payload)/api/contact/route.ts — custom contact form handler
import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json()

  const payload = await getPayload({ config })

  // Send to site admin
  await payload.sendEmail({
    to: process.env.ADMIN_EMAIL!,
    subject: `New contact form submission from ${name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  })

  // Auto-reply to sender
  await payload.sendEmail({
    to: email,
    subject: "We received your message!",
    html: `<p>Hi ${name}, thanks for reaching out. We'll get back to you shortly.</p>`,
  })

  return NextResponse.json({ success: true })
}
```
