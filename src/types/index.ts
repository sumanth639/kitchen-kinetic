// index.ts
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
  description?: string;
  name?: string;
};

export interface WishlistItem {
  id: string;
  title: string;
  image_url: string;
  publisher: string;
}

export interface UserRecipe {
  id: string;
  title: string;
  imageUrl?: string;
  publisher: string;
}

export interface RecipeImageProps {
  src: string;
  alt: string;
}

export interface RecipeDetailsPageProps {}

export interface RecipeInfoCardProps {
  recipe: Recipe;
  servings: number;
}

export interface RecipeActionsProps {
  recipe: Recipe;
  isInWishlist: boolean;
  wishlistLoading: boolean;
  onWishlistToggle: () => void;
}

export interface RecipeIngredientsProps {
  ingredients: Ingredient[];
}
