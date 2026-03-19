# Cloud Firestore Patterns (v9 Modular Web SDK)

## Querying Data
- Use `query(collection(db, 'path'), where('field', '==', 'value'), orderBy('field'))`.
- Keep in mind that chaining `orderBy` on different fields or combining `where` on different fields might require composite indexes.

## Reading Data
- To read a single document: `getDoc(doc(db, 'collection', 'id'))`.
- To read a collection: `getDocs(query(...))`.
- For real-time updates: `onSnapshot(query(...), (snapshot) => { ... })`. Always return the unsubscribe function.

## Structuring Data
- Avoid large arrays in documents. Use subcollections or root-level collections with references for unbounded lists.
- Leverage `collectionGroup` queries if you need to search across multiple subcollections with the same name.
