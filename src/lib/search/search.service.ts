import { SearchOptions, SearchResults } from './search.types';
import { searchFirestore } from './providers/firestore.provider';
import { searchForkify } from './providers/forkify.provider';
import { mergeSearchResults } from './strategies/merge.strategy';
import { sortSearchResults } from './strategies/sort.strategy';

/**
 * Single source of truth for searching recipes across providers.
 */
export async function searchRecipesService(options: SearchOptions): Promise<SearchResults> {
  const { query, limit = 50 } = options;

  // Fetch from both providers in parallel
  const [firestoreRes, forkifyRes] = await Promise.all([
    searchFirestore(options),
    searchForkify({ ...options, limit: limit - 10 }) // Adjust limit for external API
  ]);

  // Merge results (preferring custom recipes on duplication)
  let combined = mergeSearchResults(firestoreRes.recipes, forkifyRes.recipes);

  // Apply sorting strategy
  combined = sortSearchResults(combined, query);

  // Return orchestrator results
  return {
    recipes: combined.slice(0, limit),
    nextCursor: firestoreRes.nextCursor,
  };
}
