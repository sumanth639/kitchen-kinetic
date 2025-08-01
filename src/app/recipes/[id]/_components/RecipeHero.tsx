import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Clock, Users, ChefHat, Minus, Plus } from 'lucide-react';
import { RecipeImage } from './RecipeImage';
import { Recipe } from '@/types/index';

interface RecipeHeroProps {
  recipe: Recipe;
  servings: number;
  onServingsChange: (change: number) => void;
}

export function RecipeHero({
  recipe,
  servings,
  onServingsChange,
}: RecipeHeroProps) {
  return (
    <div className="mb-8 lg:mb-12">
      <RecipeImage src={recipe.image_url} alt={recipe.title} />

      <div className="max-w-4xl mx-auto text-center mt-6 lg:mt-8">
        <CardTitle className="text-3xl capitalize sm:text-4xl lg:text-5xl font-bold text-primary leading-tight mb-4">
          {recipe.title}
        </CardTitle>
        <CardDescription className="flex items-center justify-center gap-2 text-lg mb-6">
          <ChefHat className="h-6 w-6 text-muted-foreground" />
          <span>By {recipe.publisher}</span>
        </CardDescription>

        <div className="flex flex-wrap justify-center gap-6 lg:gap-8 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            <span className="text-lg">{recipe.cooking_time} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <span className="text-lg">Serves {servings}</span>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary"
              onClick={() => onServingsChange(-1)}
              disabled={servings <= 1}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <span className="font-bold text-primary text-lg w-6 text-center">
              {servings}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary"
              onClick={() => onServingsChange(1)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
