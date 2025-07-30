export interface RecipeListItem {
  id: string;
  title: string;
  image_url: string;
  publisher: string;
  customRecipe: boolean;
  createdAt?: { toMillis: () => number };
}

export interface SearchFormValues {
  searchTerm: string;
}

export interface RecipeCardProps {
  recipe: RecipeListItem;
}

export interface RecipeSkeletonCardProps {}

export interface SearchBarProps {
  onSubmit: (values: SearchFormValues) => void;
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
  onPrevPage: () => void;
  onNextPage: () => void;
} 