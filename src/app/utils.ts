// src/app/utils.ts

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  QueryConstraint,
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
  } else {
    qConstraints.push(orderBy('createdAt', 'desc'));
  }

  const firestoreQuery = query(recipesCollectionRef, ...qConstraints);
  const firestoreSnapshot = await getDocs(firestoreQuery);

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

  const forkifySearchTerm = queryTerm || 'pasta';

  let forkifyRecipes: RecipeListItem[] = [];
  try {
    const forkifyResponse = await fetch(
      `${API_URL}?search=${forkifySearchTerm}&key=${API_KEY}`
    );

    if (!forkifyResponse.ok) {
      console.error(`Forkify API error: ${forkifyResponse.statusText}`);
      forkifyRecipes = [];
    } else {
      const forkifyData = await forkifyResponse.json();
      forkifyRecipes = (forkifyData.data?.recipes || []).map((rec: any) => ({
        id: rec.id,
        title: rec.title,
        image_url: rec.image_url,
        publisher: rec.publisher,
        customRecipe: false,
      }));
    }
  } catch (err) {
    console.error('Error fetching from Forkify API:', err);
    forkifyRecipes = [];
  }

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
