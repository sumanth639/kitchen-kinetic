'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type RecipeListItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2, Search, Soup } from 'lucide-react';

const API_KEY = 'a7145071-f45e-416f-a7d8-98ad828feeef';
const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes';

const searchFormSchema = z.object({
  searchTerm: z.string().min(1, 'Please enter something to search for'),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export default function Home() {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchTerm: '',
    },
  });

  async function onSubmit(values: SearchFormValues) {
    setLoading(true);
    setError(null);
    setSearched(true);
    setRecipes([]);

    try {
      const response = await fetch(`${API_URL}?search=${values.searchTerm}&key=${API_KEY}`);
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
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Kitchen Kinetic</h1>
        <p className="text-lg md:text-xl text-muted-foreground">Discover your next favorite meal.</p>
      </section>

      <div className="max-w-2xl mx-auto mb-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
            <FormField
              control={form.control}
              name="searchTerm"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                       <Input placeholder="Search for pizza, pasta, salad..." className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </form>
        </Form>
      </div>

      <div>
        {loading && (
           <div className="flex justify-center items-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
           </div>
        )}
        {error && <p className="text-center text-destructive">{error}</p>}
        {!loading && !error && (
          <>
            {recipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recipes.map((recipe) => (
                  <Link href={`/recipes/${recipe.id}`} key={recipe.id} passHref>
                    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      <CardHeader className="p-0">
                         <div className="aspect-video relative">
                            <Image
                               src={recipe.image_url}
                               alt={recipe.title}
                               fill
                               style={{objectFit:"cover"}}
                               className="rounded-t-lg"
                               data-ai-hint="recipe food"
                            />
                         </div>
                      </CardHeader>
                      <CardContent className="flex-grow p-4">
                        <CardTitle className="text-lg leading-snug mb-1">{recipe.title}</CardTitle>
                      </CardContent>
                       <CardFooter className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground truncate">{recipe.publisher}</p>
                       </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              searched && (
                <div className="text-center py-10">
                   <Soup className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">No recipes found. Try searching for something else!</p>
                </div>
              )
            )}
             {!searched && (
                <div className="text-center py-10">
                   <Soup className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">Find delicious recipes from all over the world.</p>
                </div>
             )}
          </>
        )}
      </div>
    </div>
  );
}
