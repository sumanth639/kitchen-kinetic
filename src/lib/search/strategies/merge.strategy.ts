import { SearchRecipe } from '../search.types';

export function mergeSearchResults(firestore: SearchRecipe[], forkify: SearchRecipe[]): SearchRecipe[] {
  const map = new Map<string, SearchRecipe>();

  // Use firestore results as primary
  firestore.forEach((r) => map.set(r.id, r));

  // Add forkify results if not already present (prefer custom recipes)
  forkify.forEach((r) => {
    if (!map.has(r.id)) {
      map.set(r.id, r);
    }
  });

  return Array.from(map.values());
}
