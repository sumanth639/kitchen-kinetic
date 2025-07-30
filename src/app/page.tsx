'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RecipeListItem } from '@/types'; // Assuming RecipeListItem is defined
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Search, Soup, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase'; // Import your Firebase db instance
import {
  collection,
  query,
  where,
  getDocs,
  orderBy, // Import orderBy for sorting
  QueryConstraint,
} from 'firebase/firestore'; // Import Firestore functions

const API_KEY = process.env.NEXT_PUBLIC_FORKIFY_API_KEY;
const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes';

interface RecipeListItem {
  id: string;
  title: string;
  image_url: string;
  publisher: string;
  customRecipe: boolean;
  createdAt?: { toMillis: () => number }; // Firebase Timestamp has toMillis()
}

const searchFormSchema = z.object({
  searchTerm: z.string().min(0, 'Please enter something to search for'), // Changed min(1) to min(0) to allow empty search
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

const RECIPES_PER_PAGE = 10;

function RecipeCard({ recipe }: { recipe: RecipeListItem }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Card className="group overflow-hidden border-0 bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link href={`/recipes/${recipe.id}`} className="contents">
        <div className="relative w-full h-40 sm:h-44 md:h-48 overflow-hidden">
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            style={{ objectFit: 'cover' }}
            className={cn(
              'transition-all duration-500 ease-out group-hover:scale-105',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            onLoad={() => setIsLoading(false)}
            data-ai-hint="recipe food"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
          {isLoading && <Skeleton className="absolute inset-0" />}
        </div>
        <CardContent className="p-3 sm:p-4">
          <h3 className="font-semibold capitalize text-sm sm:text-base leading-tight mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {recipe.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium truncate">
            {recipe.publisher}
            {recipe.customRecipe && (
              <span className="ml-2 text-xs text-primary">(Your Recipe)</span>
            )}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}

function RecipeSkeletonCard() {
  return (
    <Card className="overflow-hidden border-0 bg-card shadow-sm">
      <Skeleton className="w-full h-40 sm:h-44 md:h-48" />
      <div className="p-3 sm:p-4">
        <Skeleton className="h-4 sm:h-5 w-4/5 mb-2 sm:mb-3" />
        <Skeleton className="h-3 sm:h-4 w-2/3" />
      </div>
    </Card>
  );
}

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

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchTerm: searchTerm,
    },
  });

  const fetchRecipes = useCallback(async (queryTerm: string) => {
    setLoading(true);
    setError(null);
    setRecipes([]); // Clear recipes at the start of fetch

    try {
      let forkifyRecipes: RecipeListItem[] = [];
      let firestoreRecipes: RecipeListItem[] = [];

      // --- ALWAYS Fetch from Firestore (all custom recipes, or filtered by search term) ---
      console.log('Fetching Firestore recipes...');
      const recipesCollectionRef = collection(db, 'recipes');
      const qConstraints: QueryConstraint[] = [];

      if (queryTerm) {
        // If a search term exists, apply the titleLowerCase filter
        const lowerCaseQuery = queryTerm.toLowerCase();
        qConstraints.push(
          where('titleLowerCase', '>=', lowerCaseQuery),
          where('titleLowerCase', '<=', lowerCaseQuery + '\uf8ff')
        );
        console.log(
          'Firestore search constraints (if queryTerm):',
          qConstraints
        );
      } else {
        // If no query term, fetch all custom recipes and order by creation date descending
        qConstraints.push(orderBy('createdAt', 'desc'));
        console.log(
          'Firestore default (no search term) constraints:',
          qConstraints
        );
      }

      const firestoreQuery = query(recipesCollectionRef, ...qConstraints);
      const firestoreSnapshot = await getDocs(firestoreQuery);

      firestoreRecipes = firestoreSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          image_url: data.imageUrl || '/placeholder-recipe.jpg', // Ensure you have a placeholder
          publisher: data.publisher || 'Your Kitchen',
          customRecipe: true,
          createdAt: data.createdAt, // Include createdAt for sorting
        };
      });
      console.log('Fetched Firestore recipes:', firestoreRecipes);

      // --- Fetch from Forkify API based on query term or default ---
      if (queryTerm) {
        console.log('Fetching Forkify recipes with query:', queryTerm);
        const forkifyResponse = await fetch(
          `${API_URL}?search=${queryTerm}&key=${API_KEY}`
        );
        if (!forkifyResponse.ok) {
          console.error('Forkify API error:', forkifyResponse.statusText);
          // Don't throw here, allow local recipes to still show
        } else {
          const forkifyData = await forkifyResponse.json();
          forkifyRecipes = (forkifyData.data.recipes || []).map((rec: any) => ({
            id: rec.id,
            title: rec.title,
            image_url: rec.image_url,
            publisher: rec.publisher,
            customRecipe: false,
          }));
        }
      } else {
        // Default search if no query: Fetch 'pasta' or some other default from Forkify
        console.log('Fetching default Forkify recipes (pasta).');
        const defaultResponse = await fetch(
          `${API_URL}?search=pasta&key=${API_KEY}`
        );
        if (defaultResponse.ok) {
          const defaultData = await defaultResponse.json();
          forkifyRecipes = (defaultData.data.recipes || []).map((rec: any) => ({
            id: rec.id,
            title: rec.title,
            image_url: rec.image_url,
            publisher: rec.publisher,
            customRecipe: false,
          }));
        }
      }
      console.log('Fetched Forkify recipes:', forkifyRecipes);

      // --- Combine and de-duplicate results, WITH CUSTOM RECIPES FIRST ---
      const combinedRecipesMap = new Map<string, RecipeListItem>();

      // Add Firestore recipes (custom ones) first
      firestoreRecipes.forEach((rec) => {
        combinedRecipesMap.set(rec.id, rec);
      });

      // Then add Forkify recipes, but only if that ID isn't already taken by a custom recipe
      forkifyRecipes.forEach((rec) => {
        if (!combinedRecipesMap.has(rec.id)) {
          combinedRecipesMap.set(rec.id, rec);
        }
      });

      let finalRecipes = Array.from(combinedRecipesMap.values());

      // Explicitly sort to guarantee custom recipes are at the very top
      finalRecipes.sort((a, b) => {
        // Custom recipes come before non-custom ones
        if (a.customRecipe && !b.customRecipe) return -1;
        if (!a.customRecipe && b.customRecipe) return 1;

        // If both are custom, sort by createdAt (newest first)
        if (a.customRecipe && b.customRecipe) {
          // Ensure createdAt exists and is a Timestamp-like object before calling toMillis()
          if (
            a.createdAt &&
            b.createdAt &&
            typeof a.createdAt.toMillis === 'function' &&
            typeof b.createdAt.toMillis === 'function'
          ) {
            return b.createdAt.toMillis() - a.createdAt.toMillis();
          }
        }
        // Fallback for custom recipes without createdAt, or for Forkify recipes: sort by title
        return a.title.localeCompare(b.title);
      });

      console.log('Final combined recipes after sorting:', finalRecipes);
      setRecipes(finalRecipes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred while fetching recipes'
      );
      console.error('Error in fetchRecipes:', err);
    } finally {
      setLoading(false);
    }
  }, []); // useCallback deps: No external dependencies needed for this general fetcher.

  useEffect(() => {
    const queryTermFromUrl = searchParams.get('q');
    setHasSearched(!!queryTermFromUrl); // Set hasSearched based on URL query param
    form.setValue('searchTerm', queryTermFromUrl || ''); // Update form field

    // Fetch recipes using the URL query term, or an empty string for default behavior
    fetchRecipes(queryTermFromUrl || '');
  }, [searchParams, fetchRecipes, form]); // Dependencies for useEffect

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  async function onSubmit(values: SearchFormValues) {
    const params = new URLSearchParams();
    if (values.searchTerm) {
      params.set('q', values.searchTerm);
    }
    params.set('page', '1');
    router.push(`/?${params.toString()}`);
  }

  // --- Pagination handler functions ---
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/?${params.toString()}`);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/?${params.toString()}`);
    }
  };
  // --- End of pagination handlers ---

  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);
  const paginatedRecipes = recipes.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  );

  // displayRecipes now always points to the paginated slice of the combined list
  const displayRecipes = paginatedRecipes;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full -mt-14 py-16 sm:py-20 md:py-32 bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <Image
          src="/hero.jpg"
          alt="Hero background"
          fill
          className="object-cover -z-10"
          data-ai-hint="food cooking"
        />
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 tracking-tight text-white">
              Kitchen <span className="text-primary">Kinetic</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed px-4">
              Discover and share amazing recipes from around the world
            </p>
          </div>

          <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <FormField
                  control={form.control}
                  name="searchTerm"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <div className="relative">
                          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 z-10" />
                          <Input
                            placeholder="Search for pizza, pasta, salad..."
                            className="pl-10 sm:pl-12 h-12 text-sm sm:text-base bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 shadow-lg rounded-xl  transition-all duration-300 text-white placeholder:text-gray-300"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 whitespace-nowrap"
                  disabled={loading && hasSearched}
                >
                  {loading && hasSearched ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        <div className="min-h-[400px]">
          {!loading && !error && hasSearched && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                Search Results
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {recipes.length} recipes found for "{searchTerm}"
              </p>
            </div>
          )}

          {!loading && !error && !hasSearched && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                Featured Recipes
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Popular dishes and your custom recipes to inspire your cooking
              </p>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {Array.from({ length: RECIPES_PER_PAGE }).map((_, index) => (
                <RecipeSkeletonCard key={index} />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12 sm:py-16">
              <p className="text-destructive font-medium text-sm sm:text-base">
                {error}
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              {recipes.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                    {displayRecipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 sm:gap-4 mt-8 sm:mt-12">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <span className="text-xs sm:text-sm text-muted-foreground font-medium px-2">
                        {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 sm:py-20">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-full bg-muted/30 flex items-center justify-center">
                    <Soup className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/60" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    No recipes found
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Try searching with different keywords, or add your own
                    recipes!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
