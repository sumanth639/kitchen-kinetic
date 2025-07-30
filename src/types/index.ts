export type RecipeListItem = {
  id: string;
  title: string;
  image_url: string;
  publisher: string;
  customRecipe?: boolean;
};

export type Recipe = {
  id: string;
  title: string;
  image_url: string;
  publisher: string;
  cooking_time: number;
  servings: number;
  source_url: string;
  ingredients: Ingredient[];
  userId?: string;
};

export type Ingredient = {
  quantity: number | null;
  unit: string | null;
  description: string;
};
