// types.ts
export type RecipeListItem = {
  id: string;
  title: string;
  image_url: string;
  publisher: string;
  customRecipe?: boolean; // Add this
};

// And ensure your Recipe type also aligns with what RecipeDetailsPage expects
export type Recipe = {
  id: string;
  title: string;
  image_url: string;
  publisher: string;
  cooking_time: number;
  servings: number;
  source_url: string;
  ingredients: Ingredient[];
  // If your custom recipes also have these fields, make sure they match
  // You might need to add optional properties if they differ from Forkify API
  userId?: string; // Add if you store the user ID on custom recipes
};

export type Ingredient = {
  quantity: number | null;
  unit: string | null;
  description: string;
};
