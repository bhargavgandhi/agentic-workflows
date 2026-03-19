# Cloud Storage Patterns (v9 Modular Web SDK)

## Uploading Files
- Use `uploadBytes(ref, file)` or `uploadBytesResumable(ref, file)` for larger files.
- Always handle the promise or observe the state changes for resumable uploads.

## Fetching Files
- Use `getDownloadURL(ref)` to get the accessible public URL.
- Store the downloaded URL in Firestore instead of re-fetching it if it will be displayed frequently, but be aware of security rules and token expiry.

## Structuring Storage
- Ensure folders map logically to Firestore documents (e.g. `users/{userId}/avatars/{filename}`).
