import { RecipeListItem } from '@/types';
import { searchRecipesService } from '@/lib/search/search.service';

export async function fetchRecipesServer(queryTerm: string): Promise<RecipeListItem[]> {
  const results = await searchRecipesService({
    query: queryTerm,
    limit: 50
  });

  return results.recipes as RecipeListItem[];
}


