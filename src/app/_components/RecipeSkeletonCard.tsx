import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RecipeSkeletonCardProps } from '../types';
import { cn } from '@/lib/utils';

export function RecipeSkeletonCard({}: RecipeSkeletonCardProps) {
  return (
    <div className="w-full relative" style={{ paddingBottom: '100%' }}>
      <Card className="group absolute inset-0 overflow-hidden border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm w-full h-full">
       
        <div className="relative w-full h-[60%] sm:h-[50%] overflow-hidden">
          <Skeleton className="absolute inset-0 bg-muted/20" />

         
          <div className="absolute top-2 right-2 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Skeleton className="w-3 h-3 rounded-full" />
          </div>
        </div>

       
        <CardContent className="absolute bottom-0 left-0 right-0 h-[40%] sm:h-[50%] px-3 py-2 space-y-1 sm:space-y-2 bg-gradient-to-t from-card via-card/95 to-card/85 backdrop-blur-sm flex flex-col justify-center">
          
          <Skeleton className="h-4 sm:h-5 w-4/5" />

          
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 sm:h-4 w-1/3 flex-1 mr-2" />
            <div className="flex items-center space-x-2 text-xs">
              <Skeleton className="h-3 w-8" /> 
              <Skeleton className="h-3 w-8" />
            </div>
          </div>

         
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent to-transparent" />
        </CardContent>
      </Card>
    </div>
  );
}