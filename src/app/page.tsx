import { SearchBar } from './_components/SearchBar';
import { RecipeList } from './_components/RecipeList';
import { fetchRecipesServer } from './server-utils';
import { RecipeListItem } from './types';

export const revalidate = 30;

const RECIPES_PER_PAGE = 10;

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams
  const page = sp?.page ? parseInt(sp.page, 10) : 1
  const q = sp?.q ?? ''
  const hasSearched = !!q

  const recipes: RecipeListItem[] = await fetchRecipesServer(q)
  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE)

  return (
    <div className="flex flex-col mt-14 md:mt-0">
      <div>
        <SearchBar loading={false} hasSearched={hasSearched} searchTerm={q} />
      </div>
      <div>
        <RecipeList
          recipes={recipes}
          loading={false}
          error={null}
          hasSearched={hasSearched}
          searchTerm={q}
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
