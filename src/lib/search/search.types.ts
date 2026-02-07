export interface SearchRecipe {
  id: string;
  title: string;
  image_url: string;
  publisher: string;
  customRecipe: boolean;
  createdAtMs?: number;
}

export interface SearchResults {
  recipes: SearchRecipe[];
  nextCursor?: string | null;
  total?: number;
}

export interface SearchOptions {
  query?: string;
  limit?: number;
  cursor?: string | null;
  userId?: string;
}
