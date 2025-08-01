'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchBar } from './_components/SearchBar';
import { RecipeList } from './_components/RecipeList';
import { fetchRecipes } from './utils';
import { RecipeListItem, SearchFormValues } from './types';

const RECIPES_PER_PAGE = 10;

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstLoad = useRef(true);
  const recipeListRef = useRef<HTMLDivElement>(null);

  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [loadingSearchBar, setLoadingSearchBar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const page = searchParams.get('page')
    ? parseInt(searchParams.get('page')!, 10)
    : 1;

  const searchTerm = searchParams.get('q') || '';
  const [hasSearched, setHasSearched] = useState(!!searchTerm);

  const [currentPage, setCurrentPage] = useState(page);

  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);

  const fetchRecipesData = useCallback(async (queryTerm: string) => {
    setLoadingRecipes(true);
    setError(null);
    setRecipes([]);

    try {
      const fetchedRecipes = await fetchRecipes(queryTerm);
      setRecipes(fetchedRecipes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred while fetching recipes'
      );
    } finally {
      setLoadingRecipes(false);
      setLoadingSearchBar(false);
    }
  }, []);

  // Scroll to search bar after search or navigation
  const scrollToSearchBar = useCallback(() => {
    if (!isFirstLoad.current && recipeListRef.current) {
      recipeListRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  // Effect to handle search query changes
  useEffect(() => {
    const queryTermFromUrl = searchParams.get('q');
    setHasSearched(!!queryTermFromUrl);
    fetchRecipesData(queryTermFromUrl || '');

    if (!isFirstLoad.current && !!queryTermFromUrl) {
      setTimeout(scrollToSearchBar, 100);
    }
    // Note: Removed isFirstLoad.current = false from here
  }, [searchParams, fetchRecipesData, scrollToSearchBar]);

  // Effect to handle pagination changes
  useEffect(() => {
    setCurrentPage(page);

    if (!isFirstLoad.current && (hasSearched || page > 1)) {
      setTimeout(scrollToSearchBar, 100);
    }
  }, [page, scrollToSearchBar, hasSearched]);

  // Effect to mark first load as complete after mount
  useEffect(() => {
    isFirstLoad.current = false;
  }, []);

  // Handles search form submission
  const onSubmit = useCallback(
    async (values: SearchFormValues) => {
      const params = new URLSearchParams();
      if (values.searchTerm) {
        params.set('q', values.searchTerm);
      }
      params.set('page', '1');

      setLoadingSearchBar(true);
      router.push(`/?${params.toString()}`);
    },
    [router]
  );

  // Handles navigating to previous page
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/?${params.toString()}`);
    }
  }, [currentPage, searchParams, router]);

  // Handles navigating to next page
  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/?${params.toString()}`);
    }
  }, [currentPage, totalPages, searchParams, router]);

  return (
    <div className="flex flex-col">
      <div>
        <SearchBar
          onSubmit={onSubmit}
          loading={loadingSearchBar}
          hasSearched={hasSearched}
          searchTerm={searchTerm}
        />
      </div>
      <div ref={recipeListRef}>
        <RecipeList
          recipes={recipes}
          loading={loadingRecipes}
          error={error}
          hasSearched={hasSearched}
          searchTerm={searchTerm}
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />
      </div>
    </div>
  );
}
