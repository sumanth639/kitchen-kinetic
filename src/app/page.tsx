'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SearchBar } from './_components/SearchBar';
import { RecipeList } from './_components/RecipeList';
import { fetchRecipes } from './utils';
import { SearchFormValues } from './types';

const RECIPES_PER_PAGE = 10;

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeListRef = useRef<HTMLDivElement>(null);

  const [loadingSearchBar, setLoadingSearchBar] = useState(false);

  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
  const searchTerm = searchParams.get('q') || '';
  const hasSearched = !!searchTerm;

  const {
    data: recipes = [],
    isLoading,
    error,
    isRefetching,
  } = useQuery({
    queryKey: ['recipes', searchTerm],
    queryFn: () => fetchRecipes(searchTerm),
    placeholderData: (prev) => prev,
    gcTime: 5 * 60 * 1000,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);

  const scrollToSearchBar = useCallback(() => {
    if (recipeListRef.current) {
      const elementPosition = recipeListRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - 64;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  // Reset loading bar when search finishes
  useEffect(() => {
    if (!isLoading && !isRefetching) {
      setLoadingSearchBar(false);
    }
  }, [isLoading, isRefetching]);

  useEffect(() => {
    if (searchParams.get('q')) {
      setLoadingSearchBar(isRefetching);
    }

    if (isRefetching || searchParams.get('q') || searchParams.get('page')) {
      scrollToSearchBar();
    }
  }, [isRefetching, searchParams, scrollToSearchBar]);

  const onSubmit = useCallback(
    (values: SearchFormValues) => {
      
      const currentSearch = searchParams.get('q') || '';
      if (values.searchTerm.trim() === currentSearch.trim()) {
       
        return;
      }
  
      const params = new URLSearchParams();
      if (values.searchTerm) {
        params.set('q', values.searchTerm);
      }
      params.set('page', '1');
  
      setLoadingSearchBar(true);
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );
  

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      const newPage = page - 1;
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/?${params.toString()}`);
    }
  }, [page, searchParams, router]);

  const handleNextPage = useCallback(() => {
    if (page < totalPages) {
      const newPage = page + 1;
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/?${params.toString()}`);
    }
  }, [page, totalPages, searchParams, router]);

  return (
    <div className="flex flex-col mt-14 md:mt-0">
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
          loading={isLoading}
          error={error ? error.message : null}
          hasSearched={hasSearched}
          searchTerm={searchTerm}
          currentPage={page}
          totalPages={totalPages}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />
      </div>
    </div>
  );
}
