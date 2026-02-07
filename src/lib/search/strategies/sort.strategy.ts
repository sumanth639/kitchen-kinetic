import { SearchRecipe } from '../search.types';

export function sortSearchResults(recipes: SearchRecipe[], query?: string): SearchRecipe[] {
  // If no query, sort by newest (createdAtMs)
  if (!query) {
    return [...recipes].sort((a, b) => {
      const ta = a.createdAtMs ?? 0;
      const tb = b.createdAtMs ?? 0;
      return tb - ta;
    });
  }

  // If query exists, we might want to preserve the provider's relevance 
  // or apply custom relevance logic here. 
  // For now, let's keep custom recipes at the top if they are present.
  return [...recipes].sort((a, b) => {
    if (a.customRecipe && !b.customRecipe) return -1;
    if (!a.customRecipe && b.customRecipe) return 1;
    return 0;
  });
}
