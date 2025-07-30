export interface Recipe {
  id: string;
  title: string;
  image_url: string;
  publisher: string;
  cooking_time: number;
  servings: number;
  source_url: string;
  ingredients: Ingredient[];
  customRecipe?: boolean;
  userId?: string;
}

export interface Ingredient {
  quantity: number | null;
  unit: string | null;
  description: string;
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