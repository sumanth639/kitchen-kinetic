import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecipeInfoCardProps } from '../types';

export function RecipeInfoCard({ recipe, servings }: RecipeInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recipe Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-muted-foreground">Prep + Cook Time</span>
          <span className="font-medium">{recipe.cooking_time} min</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-muted-foreground">Servings</span>
          <span className="font-medium">{recipe.servings} people</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-muted-foreground">Publisher</span>
          <span className="font-medium text-right">{recipe.publisher}</span>
        </div>
      </CardContent>
    </Card>
  );
} 