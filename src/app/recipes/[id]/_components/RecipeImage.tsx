'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { RecipeImageProps } from '@/types/index';

export function RecipeImage({ src, alt }: RecipeImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full max-w-2xl mx-auto h-64 sm:h-72 lg:h-80">
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'cover' }}
        className={cn(
          'transition-opacity duration-300 rounded-lg',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
        onLoad={() => setIsLoading(false)}
        data-ai-hint="recipe food"
        priority
      />
      {isLoading && <Skeleton className="absolute inset-0 rounded-lg" />}
    </div>
  );
}
