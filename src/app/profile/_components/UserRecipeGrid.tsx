import { UserRecipe } from '@/types/index';
import UserRecipeCard from './UserRecipeCard';

interface UserRecipeGridProps {
  recipes: UserRecipe[];
  onDelete: (id: string) => void;
  deletingRecipeId: string | null;
}

export default function UserRecipeGrid({
  recipes,
  onDelete,
  deletingRecipeId,
}: UserRecipeGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {recipes.map((recipe) => (
        <UserRecipeCard
          key={recipe.id}
          recipe={recipe}
          onDelete={onDelete}
          isDeleting={deletingRecipeId === recipe.id}
        />
      ))}
    </div>
  );
}
