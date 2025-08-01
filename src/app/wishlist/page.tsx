'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { subscribeToWishlist, removeFromWishlist } from '@/lib/firestore-utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import WishlistGrid from './_components/WishlistGrid';
import WishlistEmptyState from './_components/WishlistEmptyState';
import WishlistLoadingSkeleton from './_components/WishlistLoadingSkeleton';
import { WishlistItem } from '@/types/index';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [removingRecipeId, setRemovingRecipeId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Subscribe to wishlist changes
  useEffect(() => {
    if (!user) return;

    setWishlistLoading(true);
    const unsubscribe = subscribeToWishlist(
      user.uid,
      (items) => {
        setWishlist(items as WishlistItem[]); // Cast to WishlistItem[]
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

    setRemovingRecipeId(recipeId);

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
    } finally {
      setRemovingRecipeId(null);
    }
  };

  // Show a full-page skeleton while authentication is loading
  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-6xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
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
            <WishlistLoadingSkeleton />
          ) : wishlist.length > 0 ? (
            <WishlistGrid
              wishlist={wishlist}
              onRemove={handleRemoveFromWishlist}
              removingRecipeId={removingRecipeId}
            />
          ) : (
            <WishlistEmptyState />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
