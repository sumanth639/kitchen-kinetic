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

export async function fetchRecipes(queryTerm: string): Promise<RecipeListItem[]> {
  let forkifyRecipes: RecipeListItem[] = [];
  let firestoreRecipes: RecipeListItem[] = [];

  const recipesCollectionRef = collection(db, 'recipes');
  const qConstraints: QueryConstraint[] = [];

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

  firestoreRecipes = firestoreSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      image_url: data.imageUrl || '/placeholder-recipe.jpg',
      publisher: data.publisher || 'Your Kitchen',
      customRecipe: true,
      createdAt: data.createdAt,
    };
  });

  if (queryTerm) {
    const forkifyResponse = await fetch(
      `${API_URL}?search=${queryTerm}&key=${API_KEY}`
    );
    if (forkifyResponse.ok) {
      const forkifyData = await forkifyResponse.json();
      forkifyRecipes = (forkifyData.data.recipes || []).map((rec: any) => ({
        id: rec.id,
        title: rec.title,
        image_url: rec.image_url,
        publisher: rec.publisher,
        customRecipe: false,
      }));
    }
  } else {
    const defaultResponse = await fetch(
      `${API_URL}?search=pasta&key=${API_KEY}`
    );
    if (defaultResponse.ok) {
      const defaultData = await defaultResponse.json();
      forkifyRecipes = (defaultData.data.recipes || []).map((rec: any) => ({
        id: rec.id,
        title: rec.title,
        image_url: rec.image_url,
        publisher: rec.publisher,
        customRecipe: false,
      }));
    }
  }

  const combinedRecipesMap = new Map<string, RecipeListItem>();

  firestoreRecipes.forEach((rec) => {
    combinedRecipesMap.set(rec.id, rec);
  });

  forkifyRecipes.forEach((rec) => {
    if (!combinedRecipesMap.has(rec.id)) {
      combinedRecipesMap.set(rec.id, rec);
    }
  });

  let finalRecipes = Array.from(combinedRecipesMap.values());

  finalRecipes.sort((a, b) => {
    if (a.customRecipe && !b.customRecipe) return -1;
    if (!a.customRecipe && b.customRecipe) return 1;

    if (a.customRecipe && b.customRecipe) {
      if (
        a.createdAt &&
        b.createdAt &&
        typeof a.createdAt.toMillis === 'function' &&
        typeof b.createdAt.toMillis === 'function'
      ) {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
    }
    return a.title.localeCompare(b.title);
  });

  return finalRecipes;
} 