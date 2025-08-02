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

  // --- Step 1: Query Firestore ---
  // The Firestore query logic remains solid for a prefix search
  if (queryTerm) {
    const lowerCaseQuery = queryTerm.toLowerCase();
    qConstraints.push(
      where('titleLowerCase', '>=', lowerCaseQuery),
      where('titleLowerCase', '<=', lowerCaseQuery + '\uf8ff')
    );
  } else {
    // If no query, fetch the latest custom recipes
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

  // --- Step 2: Determine Forkify Search Term and Fetch ---
  const forkifySearchTerm = queryTerm || 'pasta'; // Use 'pasta' as the default if no queryTerm is provided

  let forkifyRecipes: RecipeListItem[] = [];
  try {
    const forkifyResponse = await fetch(
      `${API_URL}?search=${forkifySearchTerm}&key=${API_KEY}`
    );

    if (!forkifyResponse.ok) {
      console.error(`Forkify API error: ${forkifyResponse.statusText}`);
      // Don't throw, just return an empty array for this source
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

  // --- Step 3: Combine and Sort Recipes ---
  const combinedRecipesMap = new Map<string, RecipeListItem>();

  // Add custom recipes first to ensure they take precedence
  firestoreRecipes.forEach((rec) => combinedRecipesMap.set(rec.id, rec));
  // Add Forkify recipes, but only if they don't already exist
  forkifyRecipes.forEach((rec) => {
    if (!combinedRecipesMap.has(rec.id)) {
      combinedRecipesMap.set(rec.id, rec);
    }
  });

  let finalRecipes = Array.from(combinedRecipesMap.values());

  // Sort the final combined list
  finalRecipes.sort((a, b) => {
    // Custom recipes first
    if (a.customRecipe && !b.customRecipe) return -1;
    if (!a.customRecipe && b.customRecipe) return 1;

    // Sort custom recipes by date (newest first)
    if (a.customRecipe && b.customRecipe) {
      const timeA = a.createdAt?.toMillis() ?? 0;
      const timeB = b.createdAt?.toMillis() ?? 0;
      return timeB - timeA;
    }

    // Sort all other recipes alphabetically
    return a.title.localeCompare(b.title);
  });

  return finalRecipes;
}
