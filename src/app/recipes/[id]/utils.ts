import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Recipe } from '@/types/index';

const API_KEY = process.env.NEXT_PUBLIC_FORKIFY_API_KEY;
const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes';

export async function getForkifyRecipe(id: string): Promise<Recipe | null> {
  try {
    const res = await fetch(`${API_URL}/${id}?key=${API_KEY}`);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return {
      id: data.data.recipe.id,
      title: data.data.recipe.title,
      image_url: data.data.recipe.image_url,
      publisher: data.data.recipe.publisher,
      cooking_time: data.data.recipe.cooking_time,
      servings: data.data.recipe.servings,
      source_url: data.data.recipe.source_url,
      ingredients: data.data.recipe.ingredients.map((ing: any) => ({
        quantity: ing.quantity,
        unit: ing.unit,
        description: ing.description,
      })),
    };
  } catch {
    return null;
  }
}

export async function getFirestoreRecipe(id: string): Promise<Recipe | null> {
  try {
    const recipeDocRef = doc(db, 'recipes', id);
    const docSnap = await getDoc(recipeDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        image_url: data.imageUrl || '/placeholder-recipe.jpg',
        publisher: data.publisher || 'Your Kitchen',
        cooking_time: data.cookingTime || 30,
        servings: data.servings || 4,
        source_url: data.sourceUrl || '#',
        ingredients: data.ingredients || [],
        userId: data.userId,
      };
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
