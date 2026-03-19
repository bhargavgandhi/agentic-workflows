# Firebase Web SDK Gotchas

1. **Not unsubscribing from real-time listeners**: Leaving `onSnapshot` or `onAuthStateChanged` active when components unmount causes massive memory leaks and performance drops. Always return the unsubscribe function in `useEffect` cleanup.
2. **Using the namespaced v8 SDK**: Avoid `firebase.auth().signIn...`. Always use the modular v9 syntax (`import { getAuth, signInWithPopup } from "firebase/auth"`).
3. **Missing composite indexes**: Firestore requires explicit composite indexes for queries with multiple `.where()` or `.orderBy()` clauses on different fields. The error message provides a link to create it, but ensure to script or capture this into `firestore.indexes.json`.
4. **Security Rules open by default**: Never test in production with open security rules. Always start with `allow read, write: if false;` and grant specific permissions based on `request.auth.uid`.
5. **Writing raw SDK code in React components**: Abstract Firebase calls into custom hooks or Redux slices. Do not place raw `getDocs` calls directly in a React component's rendering logic or naked `useEffect`s.
