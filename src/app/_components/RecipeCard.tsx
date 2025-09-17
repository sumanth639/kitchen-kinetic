'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Users, Star, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecipeCardProps } from '../types';

export function RecipeCard({
  recipe,
  isFeatured = false,
  isPriority = false,
}: RecipeCardProps & { isFeatured?: boolean; isPriority?: boolean }) {
  const [isLoading, setIsLoading] = useState(true);

  const cardContent = (
    <>
      <div className="relative w-full cursor-pointer h-[60%] sm:h-[50%] overflow-hidden">
        <Image
          src={recipe.image_url}
          alt={recipe.title}
          fill
          style={{ objectFit: 'cover' }}
          className={cn(
            'transition-all duration-700 ease-out group-hover:scale-105',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          onLoad={() => setIsLoading(false)}
          data-ai-hint="recipe food"
          priority={isPriority}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {isLoading && <Skeleton className="absolute inset-0 bg-muted/20" />}

        <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ChefHat className="w-3 h-3 text-white" />
        </div>
      </div>

      <CardContent className="cursor-pointer absolute bottom-0 left-0 right-0 h-[40%] sm:h-[50%] px-2 sm:px-3 py-1.5 sm:py-2 space-y-1 sm:space-y-2 bg-gradient-to-t from-card via-card/95 to-card/85 backdrop-blur-sm flex flex-col justify-center">
        <h3 className="font-bold capitalize text-sm sm:text-lg leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-1 text-foreground">
          {recipe.title}
        </h3>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground/90 font-medium truncate flex-1 mr-2">
            by {recipe.publisher}
          </p>

          <div className="flex items-center text-xs text-muted-foreground space-x-2">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>25m</span>
            </div>

            <span className="hidden md:inline">|</span>

            <div className="hidden md:flex items-center space-x-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>4</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </CardContent>
    </>
  );

  return (
    <div
      className="w-full relative"
      style={{ paddingBottom: 'clamp(80%, 15vw + 60%, 100%)' }}
    >
      <Card className="group absolute inset-0 overflow-hidden border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 hover:border-primary/20 dark:bg-card/80 dark:hover:shadow-primary/10 w-full h-full">
        <Link href={`/recipes/${recipe.id}`} className="block h-full">
          {cardContent}
        </Link>
      </Card>
    </div>
  );
}
