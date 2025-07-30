import { ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RecipeActionsProps } from '../types';

export function RecipeActions({
  recipe,
  isInWishlist,
  wishlistLoading,
  onWishlistToggle,
}: RecipeActionsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Button
            asChild
            size="lg"
            className="w-full text-lg h-14"
            disabled={recipe.source_url === '#'}
          >
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>
                View Full Recipe
                <ExternalLink className="ml-2 h-6 w-6" />
              </span>
            </a>
          </Button>

          <Button
            size="lg"
            variant={isInWishlist ? 'secondary' : 'outline'}
            className="w-full text-lg h-14"
            onClick={onWishlistToggle}
            disabled={wishlistLoading}
          >
            <Heart
              className={cn(
                'mr-2 h-6 w-6',
                isInWishlist && 'fill-destructive text-destructive'
              )}
            />
            {isInWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 