'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Soup, Search } from 'lucide-react';
import { RecipeCard } from './RecipeCard';
import { RecipeListProps } from '../types';
import { RecipeListLoading } from './RecipeSkeletonCard';

const RECIPES_PER_PAGE = 10;

export const RecipeList = ({
  recipes,
  loading,
  error,
  hasSearched,
  searchTerm,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}: Omit<RecipeListProps, 'ref'>) => {
  const paginatedRecipes = recipes.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  );

  const isFeaturedView = !hasSearched;

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-[1440px]">
      <div className="min-h-[400px]">
        {!loading && !error && hasSearched && (
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Search Results
              </h2>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground pl-12">
              <span className="font-semibold text-primary">
                {recipes.length}
              </span>{' '}
              recipes found for
              <span className="font-medium text-foreground ml-1">
                "{searchTerm}"
              </span>
            </p>
          </div>
        )}
        {!loading && !error && !hasSearched && (
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center space-x-3 mb-3">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent">
                Featured Recipes
              </h2>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground">
              Handpicked popular dishes and custom recipes to inspire your
              culinary journey
            </p>
          </div>
        )}

        {loading && <RecipeListLoading recipePerCard={RECIPES_PER_PAGE} />}

        {error && (
          <div className="text-center py-16 sm:py-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full bg-destructive/10 dark:bg-destructive/20 flex items-center justify-center">
              <Soup className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">
              Something went wrong
            </h3>
            <p className="text-destructive font-medium text-base sm:text-lg max-w-md mx-auto">
              {error}
            </p>
          </div>
        )}

        {/* Main content */}
        {!loading && !error && (
          <>
            {recipes.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8 md:gap-8 mb-8 sm:mb-12">
                  {paginatedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      isFeatured={isFeaturedView}
                    />
                  ))}
                </div>

                {!isFeaturedView && totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-12 sm:mt-16">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrevPage}
                        disabled={currentPage === 1}
                        className="h-10 w-10 p-0 border-2 hover:border-gray-900 hover:bg-gray-800 hover:text-primary-foreground transition-all duration-300 disabled:opacity-40"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-muted/50 dark:bg-muted/30 border border-border/50">
                        <span className="text-sm font-medium text-muted-foreground">
                          Page
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {currentPage}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          of
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {totalPages}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onNextPage}
                        disabled={currentPage === totalPages}
                        className="h-10 w-10 p-0 border-2 hover:border-gray-900 hover:bg-gray-800 hover:text-primary-foreground transition-all duration-300 disabled:opacity-40"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 sm:py-24">
                <div className="relative mb-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-br from-muted/30 to-muted/50 dark:from-muted/20 dark:to-muted/40 flex items-center justify-center">
                    <Soup className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/60" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary/20 dark:bg-primary/30 animate-pulse" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-accent/30 dark:bg-accent/40 animate-pulse delay-1000" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">
                  No recipes found
                </h3>
                <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {hasSearched
                    ? 'Try searching with different keywords, or explore our featured collection!'
                    : 'Start your culinary journey by searching for recipes or adding your own!'}
                </p>

                {hasSearched && (
                  <div className="mt-6 p-4 rounded-xl bg-muted/30 dark:bg-muted/20 border border-border/50 max-w-sm mx-auto">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Tip:</span> Try broader
                      terms like "chicken", "pasta", or "dessert"
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

RecipeList.displayName = 'RecipeList';
