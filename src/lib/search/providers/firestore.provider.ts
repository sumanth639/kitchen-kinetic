import { adminDb } from '@/lib/firebase-admin';
import { SearchOptions, SearchRecipe, SearchResults } from '../search.types';

export async function searchFirestore(options: SearchOptions): Promise<SearchResults> {
  const { query: queryTerm, limit = 50, cursor } = options;
  const recipesRef = adminDb.collection('recipes');
  
  let q: FirebaseFirestore.Query = recipesRef;

  if (queryTerm) {
    const lower = queryTerm.toLowerCase();
    q = q
      .where('titleLowerCase', '>=', lower)
      .where('titleLowerCase', '<=', lower + '\uf8ff');
  } else {
    q = q.orderBy('createdAt', 'desc');
  }

  // Cursor-based pagination
  if (cursor) {
    const cursorDoc = await recipesRef.doc(cursor).get();
    if (cursorDoc.exists) {
      q = q.startAfter(cursorDoc);
    }
  }

  const snapshot = await q.limit(limit).get();
  
  const recipes: SearchRecipe[] = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      image_url: data.imageUrl || '/placeholder-recipe.jpg',
      publisher: data.publisher || 'Your Kitchen',
      customRecipe: true,
      createdAtMs: data.createdAt?.toMillis?.() ?? data.createdAt?._seconds * 1000 ?? 0,
    };
  });

  const lastDoc = snapshot.docs[snapshot.docs.length - 1];
  
  return {
    recipes,
    nextCursor: lastDoc ? lastDoc.id : null,
  };
}
