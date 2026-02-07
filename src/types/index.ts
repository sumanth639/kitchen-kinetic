import * as React from 'react';

// Common Recipe Types
export interface RecipeListItem {
  id: string;
  title: string;
  image_url: string;
  publisher: string;
  customRecipe: boolean;
  createdAtMs?: number;
}

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
  addedAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface UserRecipe {
  id: string;
  title: string;
  imageUrl?: string;
  publisher: string;
}

// Component Props
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

export interface ChatSession {
  id: string;
  title: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  userId: string;
}

// Search and UI Types
export interface SearchFormValues {
  searchTerm: string;
}

export interface RecipeCardProps {
  recipe: RecipeListItem;
}

export interface RecipeSkeletonCardProps {}

export interface SearchBarProps {
  loading: boolean;
  hasSearched: boolean;
  searchTerm: string;
}

export interface RecipeListProps {
  recipes: RecipeListItem[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  searchTerm: string;
  currentPage: number;
  totalPages: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}
