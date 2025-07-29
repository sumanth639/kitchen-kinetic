
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { type Recipe } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChefHat, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const API_KEY = 'a7145071-f45e-416f-a7d8-98ad828feeef';
const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes';

async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    const res = await fetch(`${API_URL}/${id}?key=${API_KEY}`);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data.data.recipe;
  } catch (error) {
    console.error('Failed to fetch recipe:', error);
    return null;
  }
}

function RecipeImage({ src, alt }: { src: string; alt: string }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full aspect-[4/3]">
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'cover' }}
        className={cn(
          'w-full h-full transition-opacity duration-300 rounded-t-lg md:rounded-l-lg md:rounded-t-none',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        data-ai-hint="recipe food"
      />
      {isLoading && <Skeleton className="absolute inset-0 rounded-t-lg md:rounded-l-lg md:rounded-t-none" />}
    </div>
  );
}

export default function RecipeDetailsPage() {
  const params = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const id = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    async function loadRecipe() {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const fetchedRecipe = await getRecipe(id);
      if (!fetchedRecipe) {
        notFound();
      } else {
        setRecipe(fetchedRecipe);
      }
      setLoading(false);
    }
    loadRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <Skeleton className="w-full aspect-[4/3]" />
            <div className="p-6">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-6" />
              <div className="flex flex-wrap gap-4 mb-6">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Separator className="my-6" />
              <h3 className="text-2xl font-semibold mb-4">Ingredients</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-5 w-5 rounded-full mt-1 shrink-0" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <Skeleton className="h-12 w-full md:w-48" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <RecipeImage src={recipe.image_url} alt={recipe.title} />
          <div className="flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold text-primary leading-tight">
                {recipe.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 pt-2 text-base">
                 <ChefHat className="h-5 w-5 text-muted-foreground"/> 
                 <span>By {recipe.publisher}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5"/>
                      <span>{recipe.cooking_time} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Users className="h-5 w-5"/>
                      <span>Serves {recipe.servings}</span>
                  </div>
              </div>
              
              <Separator className="my-6" />

              <h3 className="text-2xl font-semibold mb-4">Ingredients</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <span className="text-sm">
                      {ing.quantity && `${ing.quantity} `}
                      {ing.unit && `${ing.unit} `}
                      {ing.description}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Separator className="my-6" />

              <Button asChild size="lg" className="w-full md:w-auto mt-auto">
                <a href={recipe.source_url} target="_blank" rel="noopener noreferrer">
                  Cooking Instructions
                  <ExternalLink className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}
