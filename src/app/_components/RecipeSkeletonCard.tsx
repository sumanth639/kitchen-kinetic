import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface RecipeSkeletonCardProps {}

export function RecipeSkeletonCard({}: RecipeSkeletonCardProps) {
  return (
    <div className="w-full relative" style={{ paddingBottom: '100%' }}>
      <Card className="group absolute inset-0 overflow-hidden border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm w-full h-full">
        <div className="relative w-full h-[60%] sm:h-[50%] overflow-hidden">
          <Skeleton className="absolute inset-0 bg-muted/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
        </div>

        <CardContent className="absolute bottom-0 left-0 right-0 h-[40%] sm:h-[50%] px-3 py-2 space-y-1 sm:space-y-2 bg-gradient-to-t from-card via-card/95 to-card/85 backdrop-blur-sm flex flex-col justify-center">
          <Skeleton className="h-5 w-3/4 rounded-md mb-1" />

          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-1/3 rounded-md flex-1 mr-2" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-8 rounded-md" />
              <Skeleton className="h-3 w-8 rounded-md" />
            </div>
          </div>

          <div className="h-0.5" />
        </CardContent>
      </Card>
    </div>
  );
}
