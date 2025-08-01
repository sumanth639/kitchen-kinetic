import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecipeIngredientsProps } from '@/types/index';

export function RecipeIngredients({ ingredients }: RecipeIngredientsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl lg:text-3xl">Ingredients</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {ingredients.map((ing, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary mt-1 shrink-0" />
              <span className="text-base leading-relaxed">
                {ing?.quantity ? `${ing.quantity} ` : ''}
                {ing?.unit && `${ing.unit} `}
                {ing?.description}
                {ing?.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
