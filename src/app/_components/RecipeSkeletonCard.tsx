import { Skeleton } from '@/components/ui/skeleton';

export function RecipeListLoading({
  recipePerCard,
}: {
  recipePerCard: number;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8 md:gap-8">
      {Array.from({ length: recipePerCard }).map((_, index) => (
        <div
          key={index}
          className="w-full relative"
          style={{ paddingBottom: '100%' }}
        >
          <Skeleton className="absolute inset-0 bg-muted/20" />
        </div>
      ))}
    </div>
  );
}
