---
name: firebase-setup
description: Firebase Auth, Firestore, and Storage conventions for web apps using the v9+ modular SDK.
version: 2.0.0
category: technology
optional: true
phase: null
dependencies: []
---

## 1. Trigger Conditions

Invoke this skill when:

- Setting up Firebase in a web application (Auth, Firestore, or Storage)
- Writing Firestore queries, real-time listeners, or security rules
- Implementing Firebase Auth (sign-in flows, session management)
- Handling file uploads with Firebase Storage
- Debugging Firebase-specific bugs (listener leaks, offline behaviour, permission errors)

## 2. Prerequisites

- Firebase project created and config available
- Firebase SDK v9+ installed (modular imports)
- `references/auth-patterns.md`, `references/firestore-patterns.md`, `references/storage-patterns.md`, `references/gotchas.md` available

## 3. Steps

### Step 1: Load the Relevant Reference
- Auth work → read `references/auth-patterns.md`
- Firestore work → read `references/firestore-patterns.md`
- Storage work → read `references/storage-patterns.md`
- Always read `references/gotchas.md` before finalising

### Step 2: Use the v9 Modular SDK
Always use modular imports — never the compat layer:
```ts
// Correct
import { getAuth, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, query, where } from 'firebase/firestore';

// Wrong — do not use compat imports
import firebase from 'firebase/app';
```

### Step 3: Auth Implementation
- Use `onAuthStateChanged` to reactively track auth state — never read `currentUser` synchronously at app startup
- Unsubscribe from `onAuthStateChanged` when the component unmounts
- For Google/social sign-in: `signInWithPopup` (web) or `signInWithRedirect` (mobile web)
- For email/password: validate client-side first, then call `createUserWithEmailAndPassword`

### Step 4: Firestore Queries
- Structure documents around access patterns — denormalise when needed
- Use compound queries with composite indexes (create indexes in the Firebase console or `firestore.indexes.json`)
- Paginate large collections with `startAfter`/`limit`
- Unsubscribe from real-time listeners when the component unmounts — listener leaks are a common performance problem

### Step 5: Storage
- Generate download URLs with `getDownloadURL` after upload completes
- Set metadata (`contentType`) on every upload
- For user-generated content: store the download URL in Firestore, not the Storage path

### Step 6: Check Gotchas
Read `references/gotchas.md` before committing. Common issues:
- Not unsubscribing from listeners
- Reading `currentUser` synchronously before `onAuthStateChanged` fires
- Missing composite indexes for compound queries

## 4. Anti-Rationalization Table

| Excuse the agent will use | Rebuttal |
|--------------------------|---------|
| "I'll use the compat SDK, it's simpler" | Compat SDK is deprecated and adds ~20KB. Use the modular SDK. |
| "I'll read `auth.currentUser` at app init" | `currentUser` is null until `onAuthStateChanged` fires. Always subscribe reactively. |
| "I'll unsubscribe from the listener later" | "Later" means never in most codebases. Unsubscribe in the cleanup function. |
| "I'll add the composite index when Firestore starts throwing errors" | The error only appears at runtime with real data. Define indexes from the query. |

## 5. Red Flags

Signs this skill is being violated:

- `import firebase from 'firebase/app'` (compat SDK usage)
- `auth.currentUser` read synchronously at startup
- Real-time listener created with no cleanup/unsubscribe
- Firestore compound query with no matching composite index
- File uploaded to Storage with no metadata `contentType`
- Storage path stored in Firestore instead of download URL

## 6. Verification Gate

Before marking Firebase work complete:

- [ ] Modular SDK imports used throughout — no compat layer
- [ ] `onAuthStateChanged` used for reactive auth state; `currentUser` not read synchronously
- [ ] All `onSnapshot`/`onAuthStateChanged` listeners unsubscribed on component unmount
- [ ] Firestore queries verified against index requirements
- [ ] Storage uploads include `contentType` metadata
- [ ] `references/gotchas.md` consulted

## 7. References

- [auth-patterns.md](references/auth-patterns.md) — Firebase Auth flows and session management
- [firestore-patterns.md](references/firestore-patterns.md) — Queries, indexes, pagination, real-time listeners
- [storage-patterns.md](references/storage-patterns.md) — Upload, download URLs, and metadata
- [gotchas.md](references/gotchas.md) — Common Firebase mistakes and anti-patterns
