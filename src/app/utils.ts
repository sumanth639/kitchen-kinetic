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
import Fuse from 'fuse.js'; // Import Fuse.js

const API_KEY = process.env.NEXT_PUBLIC_FORKIFY_API_KEY;
const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes';

export async function fetchRecipes(
  queryTerm: string
): Promise<RecipeListItem[]> {
  const recipesCollectionRef = collection(db, 'recipes');
  let qConstraints: QueryConstraint[] = [];

  // --- Step 1: Query Firestore ---
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

  // --- Step 3: Combine recipes as before ---
  const combinedRecipesMap = new Map<string, RecipeListItem>();

  firestoreRecipes.forEach((rec) => combinedRecipesMap.set(rec.id, rec));
  forkifyRecipes.forEach((rec) => {
    if (!combinedRecipesMap.has(rec.id)) {
      combinedRecipesMap.set(rec.id, rec);
    }
  });

  let finalRecipes = Array.from(combinedRecipesMap.values());

  // --- Step 4: Perform fuzzy search with Fuse.js ---
  if (queryTerm && finalRecipes.length > 0) {
    const fuseOptions = {
      // Keys to search in the recipe object
      keys: ['title', 'publisher'],
      // Sets how lenient the search is. 0.0 is exact match, 1.0 is a very loose match.
      // A value of 0.3 is a good starting point for typo tolerance.
      threshold: 0.3,
      includeScore: true, // Include a relevance score in the result
    };
    const fuse = new Fuse(finalRecipes, fuseOptions);

    const searchResults = fuse.search(queryTerm);

    // Map the Fuse results back to the original recipe objects
    finalRecipes = searchResults.map((result) => result.item);
  } else if (!queryTerm) {
    // If no query, sort custom recipes by date (newest first)
    finalRecipes.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() ?? 0;
      const timeB = b.createdAt?.toMillis() ?? 0;
      return timeB - timeA;
    });
  }

  return finalRecipes;
}
