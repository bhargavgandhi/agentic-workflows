# Firebase Authentication Patterns (v9 Modular Web SDK)

## General Setup
- Always initialize auth using `getAuth()`.
- Colocate initialization logic in a centralized `firebase.ts` or `firebase.js` file.

## Listening for State Changes
- Use `onAuthStateChanged(auth, (user) => { ... })` for observing user state.
- Always unsubscribe from the listener when the component unmounts to prevent memory leaks.

## Sign In Patterns
- Prefer popup-based sign in for simple web apps: `signInWithPopup(auth, provider)`.
- Use correct providers (e.g. `GoogleAuthProvider`).
- Handle errors specifically (e.g. `auth/popup-closed-by-user`).
