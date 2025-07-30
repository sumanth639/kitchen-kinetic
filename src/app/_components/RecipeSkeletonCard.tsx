import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RecipeSkeletonCardProps } from '../types';

export function RecipeSkeletonCard({}: RecipeSkeletonCardProps) {
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