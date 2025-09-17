// src/app/utils.ts

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  QueryConstraint,
  limit as fsLimit,
} from 'firebase/firestore';
import { RecipeListItem } from './types';

const API_KEY = process.env.NEXT_PUBLIC_FORKIFY_API_KEY;
const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes';

export async function fetchRecipes(
  queryTerm: string
): Promise<RecipeListItem[]> {
  const recipesCollectionRef = collection(db, 'recipes');
  let qConstraints: QueryConstraint[] = [];

  if (queryTerm) {
    const lowerCaseQuery = queryTerm.toLowerCase();
    qConstraints.push(
      where('titleLowerCase', '>=', lowerCaseQuery),
      where('titleLowerCase', '<=', lowerCaseQuery + '\uf8ff')
    );
    // Cap results to avoid rendering too many cards at once
    qConstraints.push(fsLimit(50));
  } else {
    qConstraints.push(orderBy('createdAt', 'desc'));
    // Limit featured recipes pulled from Firestore
    qConstraints.push(fsLimit(50));
  }

  const firestoreQuery = query(recipesCollectionRef, ...qConstraints);

  // Prepare an abortable fetch for the external API with a short timeout
  const forkifySearchTerm = queryTerm || 'pasta';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  const [firestoreSnapshot, forkifyResult] = await Promise.all([
    getDocs(firestoreQuery),
    (async () => {
      try {
        const response = await fetch(
          `${API_URL}?search=${encodeURIComponent(
            forkifySearchTerm
          )}&key=${API_KEY}`,
          {
            // Avoid blocking UI if the API is slow
            signal: controller.signal,
            // Reduce bandwidth
            headers: { 'accept': 'application/json' },
          }
        );
        if (!response.ok) {
          return { recipes: [] as RecipeListItem[] };
        }
        const data = await response.json();
        const mapped = (data.data?.recipes || [])
          .slice(0, 40)
          .map((rec: any) => ({
            id: rec.id,
            title: rec.title,
            image_url: rec.image_url,
            publisher: rec.publisher,
            customRecipe: false,
          }));
        return { recipes: mapped as RecipeListItem[] };
      } catch (_err) {
        return { recipes: [] as RecipeListItem[] };
      } finally {
        clearTimeout(timeoutId);
      }
    })(),
  ]);

  const firestoreRecipes: RecipeListItem[] = firestoreSnapshot.docs.map(
    (doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        image_url: data.imageUrl || '/placeholder-recipe.jpg',
        publisher: data.publisher || 'Your Kitchen',
        customRecipe: true,
        createdAt: data.createdAt,
      };
    }
  );

  const forkifyRecipes: RecipeListItem[] = forkifyResult.recipes;

  const combinedRecipesMap = new Map<string, RecipeListItem>();

  firestoreRecipes.forEach((rec) => combinedRecipesMap.set(rec.id, rec));
  forkifyRecipes.forEach((rec) => {
    if (!combinedRecipesMap.has(rec.id)) {
      combinedRecipesMap.set(rec.id, rec);
    }
  });

  let finalRecipes = Array.from(combinedRecipesMap.values());

  if (!queryTerm) {
    finalRecipes.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() ?? 0;
      const timeB = b.createdAt?.toMillis() ?? 0;
      return timeB - timeA;
    });
  }

  return finalRecipes;
}
