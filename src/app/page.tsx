'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchBar } from './_components/SearchBar';
import { RecipeList } from './_components/RecipeList';
import { fetchRecipes } from './utils';
import { RecipeListItem, SearchFormValues } from './types';

const RECIPES_PER_PAGE = 10;

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = searchParams.get('page')
    ? parseInt(searchParams.get('page')!, 10)
    : 1;
  const searchTerm = searchParams.get('q') || '';
  const [hasSearched, setHasSearched] = useState(!!searchTerm);

  const [currentPage, setCurrentPage] = useState(page);

  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);

  const fetchRecipesData = useCallback(async (queryTerm: string) => {
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const queryTermFromUrl = searchParams.get('q');
    setHasSearched(!!queryTermFromUrl);
    fetchRecipesData(queryTermFromUrl || '');
  }, [searchParams, fetchRecipesData]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  const onSubmit = useCallback(async (values: SearchFormValues) => {
    const params = new URLSearchParams();
    if (values.searchTerm) {
      params.set('q', values.searchTerm);
    }
    params.set('page', '1');
    router.push(`/?${params.toString()}`);
  }, [router]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/?${params.toString()}`);
    }
  }, [currentPage, searchParams, router]);

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
      <SearchBar
        onSubmit={onSubmit}
        loading={loading}
        hasSearched={hasSearched}
        searchTerm={searchTerm}
      />
      <RecipeList
        recipes={recipes}
        loading={loading}
        error={error}
        hasSearched={hasSearched}
        searchTerm={searchTerm}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
}
