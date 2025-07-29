
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type RecipeListItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2, Search, Soup, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';


const API_KEY = 'a7145071-f45e-416f-a7d8-98ad828feeef';
const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes';

const searchFormSchema = z.object({
  searchTerm: z.string().min(1, 'Please enter something to search for'),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

const RECIPES_PER_PAGE = 10;

function RecipeCard({ recipe }: { recipe: RecipeListItem }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Card className="bg-card text-card-foreground shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col border rounded-lg">
      <Link href={`/recipes/${recipe.id}`} className="contents">
        <div className="relative w-full h-48">
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            style={{ objectFit: 'cover' }}
            className={cn(
              'transition-transform duration-500 ease-in-out group-hover:scale-110',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            onLoad={() => setIsLoading(false)}
            data-ai-hint="recipe food"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {isLoading && <Skeleton className="absolute inset-0" />}
        </div>
        <CardContent className="p-4 flex flex-col justify-between flex-grow">
          <h3 className="text-base font-semibold leading-snug mb-2 group-hover:text-primary transition-colors duration-300">
            {recipe.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate pt-1">
            {recipe.publisher}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}

function RecipeSkeletonCard() {
    return (
        <Card className="overflow-hidden group flex flex-col border rounded-lg">
            <Skeleton className="w-full h-48" />
            <div className="p-4 flex flex-col justify-between flex-grow">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2" />
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
  
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
  const searchTerm = searchParams.get('q') || '';
  const [hasSearched, setHasSearched] = useState(!!searchTerm);
  
  const [currentPage, setCurrentPage] = useState(page);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchTerm: searchTerm,
    },
  });
  
  const fetchRecipes = useCallback(async (query: string) => {
    if (!query) {
       setLoading(false);
       return
    };

    setLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const response = await fetch(`${API_URL}?search=${query}&key=${API_KEY}`);
      if (!response.ok) {
        throw new Error('Something went wrong. Please try again.');
      }
      const data = await response.json();

      if (data.results === 0) {
        setRecipes([]);
      } else {
        setRecipes(data.data.recipes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const query = searchParams.get('q');
     if (query) {
      setHasSearched(true);
      form.setValue('searchTerm', query);
      fetchRecipes(query);
    } else {
       // Fetch initial "featured" recipes if no search query
       setHasSearched(false);
       fetchRecipes('pasta');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, fetchRecipes]);
  
  useEffect(() => {
     setCurrentPage(page);
  }, [page]);


  async function onSubmit(values: SearchFormValues) {
     const params = new URLSearchParams();
     params.set('q', values.searchTerm);
     params.set('page', '1');
     router.push(`/?${params.toString()}`);
  }
  
  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);
  const paginatedRecipes = recipes.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  );
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
       handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };


  return (
    <div className="flex flex-col">
       <section className="relative w-full py-20 md:py-32 bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-black/60" />
           <Image
                src="https://placehold.co/1920x1080.png"
                alt="Hero background"
                fill
                className="object-cover -z-10"
                data-ai-hint="food cooking"
            />
          <div className="container mx-auto px-4 relative">
             <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">Kitchen Kinetic</h1>
                <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">The ultimate destination to discover, create, and share your favorite recipes.</p>
            </div>
             <div className="max-w-2xl mx-auto mt-12">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                    <FormField
                    control={form.control}
                    name="searchTerm"
                    render={({ field }) => (
                        <FormItem className="flex-grow">
                        <FormControl>
                            <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Search for pizza, pasta, salad..." className="pl-12" {...field} />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" size="lg" disabled={loading && hasSearched}>
                    {loading && hasSearched ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching
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
      
       <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="min-h-[400px]">
             {!loading && !error && hasSearched && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold">Search Results</h2>
                    <p className="text-muted-foreground">Found {recipes.length} recipes for "{searchTerm}"</p>
                </div>
            )}
             {!loading && !error && !hasSearched && (
                 <div className="mb-8">
                    <h2 className="text-2xl font-bold">Featured Recipes</h2>
                    <p className="text-muted-foreground">Get inspired with these popular dishes.</p>
                </div>
            )}
            {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: RECIPES_PER_PAGE }).map((_, index) => (
                    <RecipeSkeletonCard key={index} />
                ))}
            </div>
            )}
            {error && <p className="text-center text-destructive py-10">{error}</p>}
            {!loading && !error && (
            <>
                {recipes.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {paginatedRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                    </div>
                    {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-12">
                        <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                        >
                        <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <span className="text-sm font-medium text-muted-foreground">
                        Page {currentPage} of {totalPages}
                        </span>
                        <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                        >
                        <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                    )}
                </>
                ) : (
                hasSearched && (
                    <div className="text-center py-16">
                    <Soup className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Recipes Found</h3>
                    <p className="text-muted-foreground">We couldn't find any recipes matching your search. Try a different keyword!</p>
                    </div>
                )
                )}
            </>
            )}
        </div>
       </main>
    </div>
  );
}
