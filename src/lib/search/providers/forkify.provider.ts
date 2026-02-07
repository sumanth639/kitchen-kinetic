import { SearchOptions, SearchRecipe, SearchResults } from '../search.types';

const API_KEY = process.env.FORKIFY_API_KEY;
const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes';

export async function searchForkify(options: SearchOptions): Promise<SearchResults> {
  const { query: queryTerm, limit = 40 } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(
      `${API_URL}?search=${encodeURIComponent(queryTerm || 'pasta')}&key=${API_KEY}`,
      { 
        signal: controller.signal, 
        headers: { accept: 'application/json' },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!res.ok) return { recipes: [] };
    
    const data = await res.json();
    const recipes: SearchRecipe[] = (data.data?.recipes || []).slice(0, limit).map((r: any) => ({
      id: r.id,
      title: r.title,
      image_url: r.image_url,
      publisher: r.publisher,
      customRecipe: false,
    }));

    return {
      recipes,
    };
  } catch (error) {
    console.error('Forkify search error:', error);
    return { recipes: [] };
  } finally {
    clearTimeout(timeoutId);
  }
}
