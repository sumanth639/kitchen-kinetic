'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import { removeFromWishlist, subscribeToWishlist } from '@/lib/firestore-utils';
import { Button } from '@/components/ui/button';
import { Heart, Soup, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
  id: string;
  title: string;
  image_url: string;
  publisher: string;
}

function WishlistCard({
  recipe,
  onRemove,
}: {
  recipe: WishlistItem;
  onRemove: (id: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Card className="bg-card text-card-foreground shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-xl flex flex-col border rounded-lg">
      <Link href={`/recipes/${recipe.id}`} className="contents">
        <div className="relative w-full h-48">
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            style={{ objectFit: 'cover' }}
            className={cn(
              'transition-transform duration-300 group-hover:scale-105',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            onLoad={() => setIsLoading(false)}
            data-ai-hint="recipe food"
          />
          {isLoading && <Skeleton className="absolute inset-0" />}
        </div>
      </Link>
      <CardHeader className="p-3 flex-grow">
        <CardTitle className="text-base font-semibold leading-snug">
          <Link href={`/recipes/${recipe.id}`} className="hover:underline">
            {recipe.title}
          </Link>
        </CardTitle>
        <p className="text-xs text-muted-foreground truncate pt-1">
          {recipe.publisher}
        </p>
      </CardHeader>
      <CardFooter className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onRemove(recipe.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Remove
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    setWishlistLoading(true);
    const unsubscribe = subscribeToWishlist(
      user.uid,
      (items) => {
        setWishlist(items);
        setWishlistLoading(false);
      },
      (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        setWishlistLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const handleRemoveFromWishlist = async (recipeId: string) => {
    if (!user) return;
    try {
      await removeFromWishlist(user.uid, recipeId);
      toast({
        title: 'Removed from wishlist',
        description: 'The recipe has been removed from your wishlist.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-6xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Heart className="h-6 w-6 text-primary" />
            My Wishlist
          </CardTitle>
          <CardDescription>The recipes you've saved for later.</CardDescription>
        </CardHeader>
        <CardContent>
          {wishlistLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {wishlist.map((item) => (
                <WishlistCard
                  key={item.id}
                  recipe={item}
                  onRemove={handleRemoveFromWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-dashed border-2 rounded-lg flex flex-col items-center">
              <Soup className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                Your wishlist is empty.
              </p>
              <p className="text-muted-foreground text-sm">
                Save recipes you like to see them here.
              </p>
              <Button variant="default" asChild className="mt-4">
                <Link href="/">Find Recipes</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
