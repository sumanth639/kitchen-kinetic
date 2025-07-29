import Image from 'next/image';
import { notFound } from 'next/navigation';
import { type Recipe } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChefHat, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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

export async function generateMetadata({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id);
  if (!recipe) {
    return { title: 'Recipe not found' };
  }
  return {
    title: `${recipe.title} | FlavorVerse`,
    description: `Get the full recipe for ${recipe.title}, published by ${recipe.publisher}.`,
  };
}

export default async function RecipeDetailsPage({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-5">
          <div className="md:col-span-2 relative aspect-video md:aspect-auto">
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              layout="fill"
              objectFit="cover"
              className="w-full h-full"
              data-ai-hint="recipe food"
            />
          </div>
          <div className="md:col-span-3">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold text-primary leading-tight">
                {recipe.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 pt-2 text-base">
                 <ChefHat className="h-5 w-5 text-muted-foreground"/> 
                 <span>By {recipe.publisher}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6 text-muted-foreground">
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
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <span>
                      {ing.quantity && `${ing.quantity} `}
                      {ing.unit && `${ing.unit} `}
                      {ing.description}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Separator className="my-6" />

              <Button asChild size="lg" className="w-full md:w-auto">
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
